#!/usr/bin/env python3
"""
PaveMaster Suite - Model Deployment and Inference API
Production-ready deployment system for pavement AI models
"""

import os
import json
import logging
import numpy as np
import cv2
import tensorflow as tf
from tensorflow.keras.models import load_model
from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
import io
import base64
from PIL import Image
import threading
import time
from datetime import datetime
from typing import Dict, List, Tuple, Optional, Any
import traceback
import redis
from celery import Celery
import pickle
import hashlib
from pathlib import Path

class PavementInferenceEngine:
    """
    High-performance inference engine for pavement condition analysis
    """
    
    def __init__(self, 
                 model_path: str,
                 model_metadata_path: str = None,
                 use_gpu: bool = True,
                 batch_size: int = 32):
        
        self.model_path = model_path
        self.batch_size = batch_size
        self.setup_logging()
        
        # Configure GPU usage
        self._configure_gpu(use_gpu)
        
        # Load model and metadata
        self.model = self._load_model()
        self.metadata = self._load_metadata(model_metadata_path)
        
        # Initialize inference cache
        self.cache = {}
        self.cache_ttl = 3600  # 1 hour
        
        # Performance tracking
        self.inference_stats = {
            'total_inferences': 0,
            'total_time': 0.0,
            'cache_hits': 0,
            'cache_misses': 0
        }
        
        self.logger.info("Pavement Inference Engine initialized successfully")
    
    def setup_logging(self):
        """Setup logging for the inference engine"""
        logging.basicConfig(level=logging.INFO)
        self.logger = logging.getLogger(__name__)
    
    def _configure_gpu(self, use_gpu: bool):
        """Configure GPU settings for optimal inference"""
        gpus = tf.config.experimental.list_physical_devices('GPU')
        
        if use_gpu and gpus:
            try:
                # Enable memory growth
                for gpu in gpus:
                    tf.config.experimental.set_memory_growth(gpu, True)
                
                # Set mixed precision policy for faster inference
                tf.keras.mixed_precision.set_global_policy('mixed_float16')
                self.logger.info(f"GPU acceleration enabled with {len(gpus)} GPU(s)")
                
            except RuntimeError as e:
                self.logger.warning(f"GPU configuration failed: {e}")
        else:
            # Use CPU only
            tf.config.set_visible_devices([], 'GPU')
            self.logger.info("Running on CPU only")
    
    def _load_model(self) -> tf.keras.Model:
        """Load the trained model"""
        try:
            if self.model_path.endswith('.tflite'):
                # Load TensorFlow Lite model
                self.interpreter = tf.lite.Interpreter(model_path=self.model_path)
                self.interpreter.allocate_tensors()
                self.input_details = self.interpreter.get_input_details()
                self.output_details = self.interpreter.get_output_details()
                self.logger.info("Loaded TensorFlow Lite model")
                return None  # TFLite doesn't return a Keras model
            else:
                # Load Keras model
                model = load_model(self.model_path)
                self.logger.info(f"Loaded Keras model from {self.model_path}")
                return model
                
        except Exception as e:
            self.logger.error(f"Failed to load model: {e}")
            raise
    
    def _load_metadata(self, metadata_path: str) -> Dict:
        """Load model metadata"""
        if metadata_path and os.path.exists(metadata_path):
            with open(metadata_path, 'r') as f:
                metadata = json.load(f)
                self.logger.info("Loaded model metadata")
                return metadata
        
        # Default metadata
        return {
            'class_names': ['excellent', 'good', 'fair', 'poor', 'failed'],
            'input_shape': [224, 224, 3],
            'model_version': '1.0.0',
            'training_date': 'unknown'
        }
    
    def preprocess_image(self, image: np.ndarray) -> np.ndarray:
        """Preprocess input image for inference"""
        try:
            # Get target shape from metadata
            target_shape = tuple(self.metadata['input_shape'][:2])
            
            # Resize image
            if image.shape[:2] != target_shape:
                image = cv2.resize(image, target_shape)
            
            # Ensure RGB format
            if len(image.shape) == 3 and image.shape[2] == 3:
                # Convert BGR to RGB if needed
                if isinstance(image, np.ndarray) and image.max() > 1:
                    image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
            
            # Normalize pixel values
            if image.dtype != np.float32:
                image = image.astype(np.float32)
            
            if image.max() > 1.0:
                image = image / 255.0
            
            # Add batch dimension
            if len(image.shape) == 3:
                image = np.expand_dims(image, axis=0)
            
            return image
            
        except Exception as e:
            self.logger.error(f"Image preprocessing failed: {e}")
            raise
    
    def predict_single(self, image: np.ndarray, use_cache: bool = True) -> Dict:
        """Perform inference on a single image"""
        start_time = time.time()
        
        try:
            # Generate cache key if caching is enabled
            cache_key = None
            if use_cache:
                cache_key = hashlib.md5(image.tobytes()).hexdigest()
                cached_result = self._get_from_cache(cache_key)
                if cached_result:
                    self.inference_stats['cache_hits'] += 1
                    return cached_result
            
            # Preprocess image
            processed_image = self.preprocess_image(image)
            
            # Perform inference
            if hasattr(self, 'interpreter'):  # TensorFlow Lite
                predictions = self._predict_tflite(processed_image)
            else:  # Keras model
                predictions = self.model.predict(processed_image, verbose=0)
            
            # Post-process results
            result = self._postprocess_predictions(predictions[0])
            
            # Cache result
            if use_cache and cache_key:
                self._add_to_cache(cache_key, result)
                self.inference_stats['cache_misses'] += 1
            
            # Update statistics
            inference_time = time.time() - start_time
            self.inference_stats['total_inferences'] += 1
            self.inference_stats['total_time'] += inference_time
            
            result['inference_time'] = inference_time
            
            return result
            
        except Exception as e:
            self.logger.error(f"Prediction failed: {e}")
            raise
    
    def predict_batch(self, images: List[np.ndarray]) -> List[Dict]:
        """Perform batch inference on multiple images"""
        try:
            # Preprocess all images
            processed_images = []
            for image in images:
                processed_image = self.preprocess_image(image)
                processed_images.append(processed_image[0])  # Remove batch dimension for batching
            
            # Stack into batch
            batch = np.array(processed_images)
            
            # Perform batch inference
            if hasattr(self, 'interpreter'):  # TensorFlow Lite (process individually)
                predictions = []
                for img in batch:
                    pred = self._predict_tflite(np.expand_dims(img, axis=0))
                    predictions.append(pred[0])
                predictions = np.array(predictions)
            else:  # Keras model
                predictions = self.model.predict(batch, batch_size=self.batch_size, verbose=0)
            
            # Post-process all results
            results = []
            for pred in predictions:
                result = self._postprocess_predictions(pred)
                results.append(result)
            
            return results
            
        except Exception as e:
            self.logger.error(f"Batch prediction failed: {e}")
            raise
    
    def _predict_tflite(self, image: np.ndarray) -> np.ndarray:
        """Perform inference using TensorFlow Lite"""
        # Set input tensor
        self.interpreter.set_tensor(self.input_details[0]['index'], image)
        
        # Run inference
        self.interpreter.invoke()
        
        # Get output
        output_data = self.interpreter.get_tensor(self.output_details[0]['index'])
        return output_data
    
    def _postprocess_predictions(self, predictions: np.ndarray) -> Dict:
        """Post-process model predictions into structured output"""
        
        # Get class probabilities
        probabilities = predictions.tolist() if isinstance(predictions, np.ndarray) else predictions
        
        # Get predicted class
        predicted_class_idx = np.argmax(probabilities)
        predicted_class = self.metadata['class_names'][predicted_class_idx]
        confidence = probabilities[predicted_class_idx]
        
        # Determine maintenance urgency
        urgency_mapping = {
            'excellent': 'low',
            'good': 'low',
            'fair': 'medium',
            'poor': 'high',
            'failed': 'critical'
        }
        
        urgency = urgency_mapping.get(predicted_class, 'unknown')
        
        # Generate recommendations
        recommendations = self._generate_recommendations(predicted_class, confidence)
        
        return {
            'predicted_class': predicted_class,
            'predicted_class_index': int(predicted_class_idx),
            'confidence': float(confidence),
            'probabilities': {
                class_name: float(prob) 
                for class_name, prob in zip(self.metadata['class_names'], probabilities)
            },
            'maintenance_urgency': urgency,
            'recommendations': recommendations,
            'model_version': self.metadata.get('model_version', '1.0.0'),
            'timestamp': datetime.now().isoformat()
        }
    
    def _generate_recommendations(self, predicted_class: str, confidence: float) -> List[str]:
        """Generate maintenance recommendations based on prediction"""
        
        recommendations = []
        
        if predicted_class == 'excellent':
            recommendations.append("Pavement is in excellent condition")
            recommendations.append("Continue regular maintenance schedule")
            recommendations.append("No immediate action required")
            
        elif predicted_class == 'good':
            recommendations.append("Pavement is in good condition")
            recommendations.append("Monitor for any changes")
            recommendations.append("Schedule routine inspection in 6 months")
            
        elif predicted_class == 'fair':
            recommendations.append("Pavement shows signs of wear")
            recommendations.append("Consider preventive maintenance")
            recommendations.append("Schedule detailed inspection within 3 months")
            recommendations.append("Monitor crack development")
            
        elif predicted_class == 'poor':
            recommendations.append("Pavement requires maintenance attention")
            recommendations.append("Schedule repair work within 1-2 months")
            recommendations.append("Consider resurfacing or overlay")
            recommendations.append("Restrict heavy vehicle access if possible")
            
        elif predicted_class == 'failed':
            recommendations.append("URGENT: Pavement in critical condition")
            recommendations.append("Immediate repair or reconstruction required")
            recommendations.append("Consider traffic restrictions")
            recommendations.append("Safety inspection recommended")
        
        # Add confidence-based recommendations
        if confidence < 0.7:
            recommendations.append(f"Note: Prediction confidence is {confidence:.1%} - consider manual inspection")
        
        return recommendations
    
    def _get_from_cache(self, cache_key: str) -> Optional[Dict]:
        """Retrieve result from cache"""
        if cache_key in self.cache:
            cached_item = self.cache[cache_key]
            if time.time() - cached_item['timestamp'] < self.cache_ttl:
                return cached_item['result']
            else:
                # Remove expired item
                del self.cache[cache_key]
        return None
    
    def _add_to_cache(self, cache_key: str, result: Dict):
        """Add result to cache"""
        self.cache[cache_key] = {
            'result': result,
            'timestamp': time.time()
        }
        
        # Limit cache size
        if len(self.cache) > 1000:
            # Remove oldest entries
            oldest_keys = sorted(self.cache.keys(), 
                               key=lambda k: self.cache[k]['timestamp'])[:100]
            for key in oldest_keys:
                del self.cache[key]
    
    def get_stats(self) -> Dict:
        """Get inference engine statistics"""
        avg_time = (self.inference_stats['total_time'] / 
                   max(self.inference_stats['total_inferences'], 1))
        
        cache_hit_rate = (self.inference_stats['cache_hits'] / 
                         max(self.inference_stats['cache_hits'] + 
                             self.inference_stats['cache_misses'], 1))
        
        return {
            'total_inferences': self.inference_stats['total_inferences'],
            'average_inference_time': avg_time,
            'cache_hit_rate': cache_hit_rate,
            'cache_size': len(self.cache),
            'model_version': self.metadata.get('model_version', '1.0.0')
        }

class PavementInferenceAPI:
    """
    Flask-based REST API for pavement condition inference
    """
    
    def __init__(self, 
                 model_path: str,
                 metadata_path: str = None,
                 host: str = '0.0.0.0',
                 port: int = 5000,
                 use_redis: bool = False,
                 redis_url: str = 'redis://localhost:6379'):
        
        self.host = host
        self.port = port
        self.setup_logging()
        
        # Initialize inference engine
        self.inference_engine = PavementInferenceEngine(model_path, metadata_path)
        
        # Initialize Flask app
        self.app = Flask(__name__)
        CORS(self.app)  # Enable CORS for web integration
        
        # Initialize Redis cache if enabled
        self.redis_client = None
        if use_redis:
            try:
                import redis
                self.redis_client = redis.from_url(redis_url)
                self.logger.info("Redis cache initialized")
            except Exception as e:
                self.logger.warning(f"Redis initialization failed: {e}")
        
        # Initialize Celery for async processing
        self.celery = self._setup_celery()
        
        # Setup API routes
        self._setup_routes()
        
        self.logger.info("Pavement Inference API initialized")
    
    def setup_logging(self):
        """Setup logging for the API"""
        logging.basicConfig(level=logging.INFO)
        self.logger = logging.getLogger(__name__)
    
    def _setup_celery(self):
        """Setup Celery for asynchronous processing"""
        try:
            celery = Celery('pavement_inference')
            celery.conf.update(
                broker_url='redis://localhost:6379/0',
                result_backend='redis://localhost:6379/0',
                task_serializer='pickle',
                accept_content=['pickle'],
                result_serializer='pickle',
                timezone='UTC',
                enable_utc=True,
            )
            return celery
        except Exception as e:
            self.logger.warning(f"Celery setup failed: {e}")
            return None
    
    def _setup_routes(self):
        """Setup Flask API routes"""
        
        @self.app.route('/health', methods=['GET'])
        def health_check():
            """Health check endpoint"""
            return jsonify({
                'status': 'healthy',
                'timestamp': datetime.now().isoformat(),
                'model_loaded': self.inference_engine.model is not None,
                'stats': self.inference_engine.get_stats()
            })
        
        @self.app.route('/predict', methods=['POST'])
        def predict():
            """Single image prediction endpoint"""
            try:
                # Check if image is provided
                if 'image' not in request.files and 'image_base64' not in request.json:
                    return jsonify({'error': 'No image provided'}), 400
                
                # Load image
                if 'image' in request.files:
                    # File upload
                    image_file = request.files['image']
                    image = self._load_image_from_file(image_file)
                else:
                    # Base64 encoded image
                    image_base64 = request.json['image_base64']
                    image = self._load_image_from_base64(image_base64)
                
                # Perform inference
                result = self.inference_engine.predict_single(image)
                
                return jsonify({
                    'success': True,
                    'result': result
                })
                
            except Exception as e:
                self.logger.error(f"Prediction error: {e}")
                return jsonify({
                    'success': False,
                    'error': str(e),
                    'traceback': traceback.format_exc()
                }), 500
        
        @self.app.route('/predict_batch', methods=['POST'])
        def predict_batch():
            """Batch prediction endpoint"""
            try:
                # Check for multiple images
                if 'images' not in request.files:
                    return jsonify({'error': 'No images provided'}), 400
                
                images = []
                for image_file in request.files.getlist('images'):
                    image = self._load_image_from_file(image_file)
                    images.append(image)
                
                # Perform batch inference
                results = self.inference_engine.predict_batch(images)
                
                return jsonify({
                    'success': True,
                    'results': results,
                    'count': len(results)
                })
                
            except Exception as e:
                self.logger.error(f"Batch prediction error: {e}")
                return jsonify({
                    'success': False,
                    'error': str(e)
                }), 500
        
        @self.app.route('/predict_async', methods=['POST'])
        def predict_async():
            """Asynchronous prediction endpoint"""
            if not self.celery:
                return jsonify({'error': 'Async processing not available'}), 503
            
            try:
                # Queue the task
                if 'image' in request.files:
                    image_file = request.files['image']
                    image_data = image_file.read()
                    task = self.process_image_async.delay(image_data)
                    
                    return jsonify({
                        'success': True,
                        'task_id': task.id,
                        'status': 'queued'
                    })
                else:
                    return jsonify({'error': 'No image provided'}), 400
                    
            except Exception as e:
                return jsonify({'error': str(e)}), 500
        
        @self.app.route('/task_status/<task_id>', methods=['GET'])
        def get_task_status(task_id):
            """Get status of asynchronous task"""
            if not self.celery:
                return jsonify({'error': 'Async processing not available'}), 503
            
            task = self.celery.AsyncResult(task_id)
            
            if task.state == 'PENDING':
                response = {'state': task.state, 'status': 'Task is waiting...'}
            elif task.state == 'PROGRESS':
                response = {'state': task.state, 'progress': task.info.get('progress', 0)}
            elif task.state == 'SUCCESS':
                response = {'state': task.state, 'result': task.info}
            else:
                response = {'state': task.state, 'error': str(task.info)}
            
            return jsonify(response)
        
        @self.app.route('/stats', methods=['GET'])
        def get_stats():
            """Get API and inference statistics"""
            return jsonify(self.inference_engine.get_stats())
        
        @self.app.route('/model_info', methods=['GET'])
        def get_model_info():
            """Get model information"""
            return jsonify(self.inference_engine.metadata)
    
    def _load_image_from_file(self, image_file) -> np.ndarray:
        """Load image from uploaded file"""
        # Read image data
        image_data = image_file.read()
        
        # Convert to numpy array
        nparr = np.frombuffer(image_data, np.uint8)
        
        # Decode image
        image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        
        if image is None:
            raise ValueError("Invalid image format")
        
        return image
    
    def _load_image_from_base64(self, base64_string: str) -> np.ndarray:
        """Load image from base64 string"""
        try:
            # Remove data URL prefix if present
            if ',' in base64_string:
                base64_string = base64_string.split(',')[1]
            
            # Decode base64
            image_data = base64.b64decode(base64_string)
            
            # Convert to PIL Image
            pil_image = Image.open(io.BytesIO(image_data))
            
            # Convert to numpy array
            image = np.array(pil_image)
            
            # Convert RGB to BGR for OpenCV compatibility
            if len(image.shape) == 3 and image.shape[2] == 3:
                image = cv2.cvtColor(image, cv2.COLOR_RGB2BGR)
            
            return image
            
        except Exception as e:
            raise ValueError(f"Invalid base64 image: {e}")
    
    @celery.task(bind=True)
    def process_image_async(self, image_data: bytes):
        """Asynchronous image processing task"""
        try:
            # Decode image
            nparr = np.frombuffer(image_data, np.uint8)
            image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
            
            # Perform inference
            result = self.inference_engine.predict_single(image)
            
            return result
            
        except Exception as e:
            return {'error': str(e)}
    
    def run(self, debug: bool = False):
        """Run the Flask application"""
        self.logger.info(f"Starting Pavement Inference API on {self.host}:{self.port}")
        self.app.run(host=self.host, port=self.port, debug=debug, threaded=True)

class PavementModelManager:
    """
    Model version management and A/B testing system
    """
    
    def __init__(self, models_directory: str = './models'):
        self.models_directory = Path(models_directory)
        self.models_directory.mkdir(exist_ok=True)
        
        self.active_models = {}
        self.model_configs = {}
        
        self.setup_logging()
        self._scan_models()
    
    def setup_logging(self):
        """Setup logging"""
        logging.basicConfig(level=logging.INFO)
        self.logger = logging.getLogger(__name__)
    
    def _scan_models(self):
        """Scan for available models"""
        for model_path in self.models_directory.glob('**/*.h5'):
            model_name = model_path.stem
            metadata_path = model_path.parent / f"{model_name}_metadata.json"
            
            try:
                inference_engine = PavementInferenceEngine(
                    str(model_path),
                    str(metadata_path) if metadata_path.exists() else None
                )
                
                self.active_models[model_name] = inference_engine
                self.logger.info(f"Loaded model: {model_name}")
                
            except Exception as e:
                self.logger.error(f"Failed to load model {model_name}: {e}")
    
    def add_model(self, 
                  model_name: str, 
                  model_path: str, 
                  metadata_path: str = None,
                  traffic_percentage: float = 0.0):
        """Add a new model to the manager"""
        try:
            inference_engine = PavementInferenceEngine(model_path, metadata_path)
            self.active_models[model_name] = inference_engine
            
            self.model_configs[model_name] = {
                'traffic_percentage': traffic_percentage,
                'created_at': datetime.now().isoformat(),
                'requests_served': 0,
                'total_inference_time': 0.0
            }
            
            self.logger.info(f"Added model {model_name} with {traffic_percentage}% traffic")
            
        except Exception as e:
            self.logger.error(f"Failed to add model {model_name}: {e}")
            raise
    
    def remove_model(self, model_name: str):
        """Remove a model from the manager"""
        if model_name in self.active_models:
            del self.active_models[model_name]
            del self.model_configs[model_name]
            self.logger.info(f"Removed model: {model_name}")
    
    def route_request(self, request_id: str = None) -> str:
        """Route request to appropriate model based on A/B testing configuration"""
        if not self.active_models:
            raise ValueError("No models available")
        
        # Simple random routing based on traffic percentages
        import random
        rand_val = random.random()
        cumulative_percentage = 0.0
        
        for model_name, config in self.model_configs.items():
            cumulative_percentage += config['traffic_percentage'] / 100.0
            if rand_val <= cumulative_percentage:
                return model_name
        
        # Default to first available model
        return list(self.active_models.keys())[0]
    
    def predict(self, image: np.ndarray, model_name: str = None) -> Dict:
        """Perform prediction using specified or routed model"""
        if model_name is None:
            model_name = self.route_request()
        
        if model_name not in self.active_models:
            raise ValueError(f"Model {model_name} not available")
        
        start_time = time.time()
        result = self.active_models[model_name].predict_single(image)
        inference_time = time.time() - start_time
        
        # Update model statistics
        if model_name in self.model_configs:
            self.model_configs[model_name]['requests_served'] += 1
            self.model_configs[model_name]['total_inference_time'] += inference_time
        
        result['model_name'] = model_name
        return result
    
    def get_model_stats(self) -> Dict:
        """Get statistics for all models"""
        stats = {}
        
        for model_name, config in self.model_configs.items():
            if model_name in self.active_models:
                engine_stats = self.active_models[model_name].get_stats()
                
                stats[model_name] = {
                    **config,
                    **engine_stats,
                    'average_response_time': (
                        config['total_inference_time'] / 
                        max(config['requests_served'], 1)
                    )
                }
        
        return stats

def create_production_api(model_path: str, 
                         metadata_path: str = None,
                         host: str = '0.0.0.0',
                         port: int = 5000) -> PavementInferenceAPI:
    """Factory function to create production-ready API"""
    
    api = PavementInferenceAPI(
        model_path=model_path,
        metadata_path=metadata_path,
        host=host,
        port=port,
        use_redis=True
    )
    
    return api

if __name__ == "__main__":
    # Example usage
    import argparse
    
    parser = argparse.ArgumentParser(description='PaveMaster AI Inference API')
    parser.add_argument('--model-path', required=True, help='Path to trained model')
    parser.add_argument('--metadata-path', help='Path to model metadata JSON')
    parser.add_argument('--host', default='0.0.0.0', help='Host address')
    parser.add_argument('--port', type=int, default=5000, help='Port number')
    parser.add_argument('--debug', action='store_true', help='Enable debug mode')
    
    args = parser.parse_args()
    
    # Create and run API
    api = create_production_api(
        model_path=args.model_path,
        metadata_path=args.metadata_path,
        host=args.host,
        port=args.port
    )
    
    api.run(debug=args.debug)