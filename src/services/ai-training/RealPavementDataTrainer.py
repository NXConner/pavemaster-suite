#!/usr/bin/env python3
"""
PaveMaster Suite - Real Pavement Data Training System
Advanced AI training pipeline specifically designed for real-world pavement datasets
"""

import os
import numpy as np
import pandas as pd
import tensorflow as tf
from tensorflow.keras.applications import ResNet50, EfficientNetB0, DenseNet121
from tensorflow.keras.layers import Dense, GlobalAveragePooling2D, Dropout, BatchNormalization, Attention
from tensorflow.keras.models import Model
from tensorflow.keras.optimizers import Adam
from tensorflow.keras.callbacks import EarlyStopping, ModelCheckpoint, ReduceLROnPlateau, TensorBoard
from tensorflow.keras.preprocessing.image import ImageDataGenerator
from sklearn.model_selection import train_test_split, StratifiedKFold
from sklearn.metrics import classification_report, confusion_matrix, roc_auc_score
from sklearn.preprocessing import LabelEncoder
import cv2
import json
import logging
from datetime import datetime
from typing import Dict, List, Tuple, Optional, Union
import matplotlib.pyplot as plt
import seaborn as sns
from pathlib import Path
import albumentations as A
from albumentations.pytorch import ToTensorV2
import torch
import torch.nn as nn
from PIL import Image, ImageEnhance, ImageFilter
import joblib
from concurrent.futures import ThreadPoolExecutor
import yaml

class RealPavementDataProcessor:
    """Advanced data processing for real pavement images"""
    
    def __init__(self, config: Dict):
        self.config = config
        self.logger = logging.getLogger(__name__)
        self.image_size = tuple(config['data']['image_size'][:2])
        self.quality_threshold = config['data'].get('quality_threshold', 0.7)
        
        # Initialize advanced augmentation pipeline
        self.augmentation_pipeline = self._create_augmentation_pipeline()
        
    def _create_augmentation_pipeline(self):
        """Create sophisticated augmentation pipeline for pavement images"""
        return A.Compose([
            # Geometric transformations
            A.HorizontalFlip(p=0.5),
            A.Rotate(limit=15, p=0.3),
            A.ShiftScaleRotate(
                shift_limit=0.1, 
                scale_limit=0.1, 
                rotate_limit=10, 
                p=0.3
            ),
            
            # Weather and lighting conditions
            A.RandomBrightnessContrast(
                brightness_limit=0.2, 
                contrast_limit=0.2, 
                p=0.5
            ),
            A.HueSaturationValue(
                hue_shift_limit=10, 
                sat_shift_limit=20, 
                val_shift_limit=20, 
                p=0.3
            ),
            A.RandomShadow(p=0.3),
            A.RandomRain(p=0.2),
            A.RandomSunFlare(p=0.1),
            
            # Noise and blur (simulating camera conditions)
            A.GaussianBlur(blur_limit=3, p=0.2),
            A.MotionBlur(blur_limit=3, p=0.2),
            A.GaussNoise(var_limit=(10, 50), p=0.3),
            A.ISONoise(p=0.2),
            
            # Pavement-specific augmentations
            A.GridDistortion(p=0.2),  # Simulates road curvature
            A.OpticalDistortion(p=0.2),  # Camera lens distortion
            
            # Normalization
            A.Normalize(
                mean=[0.485, 0.456, 0.406],
                std=[0.229, 0.224, 0.225]
            ),
        ])
    
    def assess_image_quality(self, image: np.ndarray) -> Dict[str, float]:
        """Assess image quality using multiple metrics"""
        try:
            # Convert to grayscale for analysis
            gray = cv2.cvtColor(image, cv2.COLOR_RGB2GRAY) if len(image.shape) == 3 else image
            
            # Blur detection using Laplacian variance
            blur_score = cv2.Laplacian(gray, cv2.CV_64F).var()
            
            # Brightness analysis
            brightness = np.mean(gray)
            brightness_score = 1.0 - abs(brightness - 127.5) / 127.5
            
            # Contrast analysis
            contrast_score = np.std(gray) / 255.0
            
            # Edge density (useful for pavement texture analysis)
            edges = cv2.Canny(gray, 50, 150)
            edge_density = np.sum(edges > 0) / edges.size
            
            # Overall quality score
            quality_score = (
                min(blur_score / 100.0, 1.0) * 0.3 +
                brightness_score * 0.2 +
                contrast_score * 0.3 +
                edge_density * 0.2
            )
            
            return {
                'quality_score': quality_score,
                'blur_score': blur_score,
                'brightness_score': brightness_score,
                'contrast_score': contrast_score,
                'edge_density': edge_density
            }
            
        except Exception as e:
            self.logger.warning(f"Quality assessment failed: {e}")
            return {'quality_score': 0.0}
    
    def load_and_validate_dataset(self, data_path: str) -> Tuple[List[str], List[str], pd.DataFrame]:
        """Load and validate real pavement dataset"""
        self.logger.info(f"Loading dataset from {data_path}")
        
        data_path = Path(data_path)
        image_paths = []
        labels = []
        metadata = []
        
        # Support multiple dataset structures
        if (data_path / 'annotations.csv').exists():
            # CSV-based annotation format
            annotations = pd.read_csv(data_path / 'annotations.csv')
            for _, row in annotations.iterrows():
                img_path = data_path / row['image_path']
                if img_path.exists():
                    image_paths.append(str(img_path))
                    labels.append(row['condition'])
                    metadata.append({
                        'location': row.get('location', 'unknown'),
                        'date': row.get('date', 'unknown'),
                        'weather': row.get('weather', 'unknown'),
                        'source': 'csv_annotation'
                    })
        
        elif any(data_path.glob('*/')):
            # Directory-based structure (condition folders)
            for condition_dir in data_path.iterdir():
                if condition_dir.is_dir():
                    condition = condition_dir.name
                    for img_file in condition_dir.glob('*.*'):
                        if img_file.suffix.lower() in ['.jpg', '.jpeg', '.png', '.bmp', '.tiff']:
                            image_paths.append(str(img_file))
                            labels.append(condition)
                            metadata.append({
                                'location': 'unknown',
                                'date': 'unknown',
                                'weather': 'unknown',
                                'source': 'directory_structure'
                            })
        
        else:
            raise ValueError(f"Invalid dataset structure in {data_path}")
        
        # Validate images and filter by quality
        validated_paths, validated_labels, validated_metadata = self._validate_images(
            image_paths, labels, metadata
        )
        
        # Create metadata DataFrame
        metadata_df = pd.DataFrame(validated_metadata)
        metadata_df['image_path'] = validated_paths
        metadata_df['condition'] = validated_labels
        
        self.logger.info(f"Loaded {len(validated_paths)} valid images")
        return validated_paths, validated_labels, metadata_df
    
    def _validate_images(self, image_paths: List[str], labels: List[str], metadata: List[Dict]) -> Tuple[List, List, List]:
        """Validate images and filter by quality"""
        validated_paths = []
        validated_labels = []
        validated_metadata = []
        
        def validate_single_image(args):
            img_path, label, meta = args
            try:
                # Load image
                image = cv2.imread(img_path)
                if image is None:
                    return None
                
                image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
                
                # Assess quality
                quality_metrics = self.assess_image_quality(image)
                
                if quality_metrics['quality_score'] >= self.quality_threshold:
                    meta.update(quality_metrics)
                    return (img_path, label, meta)
                
            except Exception as e:
                self.logger.warning(f"Failed to validate {img_path}: {e}")
            
            return None
        
        # Parallel validation
        with ThreadPoolExecutor(max_workers=8) as executor:
            results = list(executor.map(
                validate_single_image, 
                zip(image_paths, labels, metadata)
            ))
        
        # Filter valid results
        for result in results:
            if result is not None:
                path, label, meta = result
                validated_paths.append(path)
                validated_labels.append(label)
                validated_metadata.append(meta)
        
        return validated_paths, validated_labels, validated_metadata

class AdvancedPavementModel:
    """Advanced neural network architectures for pavement analysis"""
    
    def __init__(self, config: Dict):
        self.config = config
        self.num_classes = len(config['data'].get('condition_classes', 5))
        self.image_size = tuple(config['data']['image_size'][:2])
        
    def create_attention_resnet(self) -> Model:
        """Create ResNet with attention mechanism"""
        base_model = ResNet50(
            weights='imagenet',
            include_top=False,
            input_shape=(*self.image_size, 3)
        )
        
        # Add attention layers
        x = base_model.output
        x = GlobalAveragePooling2D()(x)
        
        # Attention mechanism
        attention = Dense(512, activation='tanh')(x)
        attention = Dense(512, activation='sigmoid')(attention)
        x = tf.keras.layers.Multiply()([x, attention])
        
        # Classification head
        x = Dense(512, activation='relu')(x)
        x = BatchNormalization()(x)
        x = Dropout(0.5)(x)
        x = Dense(256, activation='relu')(x)
        x = BatchNormalization()(x)
        x = Dropout(0.3)(x)
        
        predictions = Dense(self.num_classes, activation='softmax', name='condition')(x)
        
        model = Model(inputs=base_model.input, outputs=predictions)
        return model
    
    def create_multi_scale_cnn(self) -> Model:
        """Create multi-scale CNN for capturing different crack patterns"""
        input_layer = tf.keras.layers.Input(shape=(*self.image_size, 3))
        
        # Multiple scale branches
        scales = [3, 5, 7]  # Different kernel sizes for different crack patterns
        scale_outputs = []
        
        for scale in scales:
            # Convolutional branch
            branch = tf.keras.layers.Conv2D(64, scale, activation='relu', padding='same')(input_layer)
            branch = tf.keras.layers.BatchNormalization()(branch)
            branch = tf.keras.layers.MaxPooling2D(2)(branch)
            
            branch = tf.keras.layers.Conv2D(128, scale, activation='relu', padding='same')(branch)
            branch = tf.keras.layers.BatchNormalization()(branch)
            branch = tf.keras.layers.MaxPooling2D(2)(branch)
            
            branch = tf.keras.layers.Conv2D(256, scale, activation='relu', padding='same')(branch)
            branch = tf.keras.layers.BatchNormalization()(branch)
            branch = tf.keras.layers.GlobalAveragePooling2D()(branch)
            
            scale_outputs.append(branch)
        
        # Concatenate multi-scale features
        if len(scale_outputs) > 1:
            combined = tf.keras.layers.Concatenate()(scale_outputs)
        else:
            combined = scale_outputs[0]
        
        # Final classification layers
        x = Dense(512, activation='relu')(combined)
        x = BatchNormalization()(x)
        x = Dropout(0.5)(x)
        x = Dense(256, activation='relu')(x)
        x = Dropout(0.3)(x)
        
        predictions = Dense(self.num_classes, activation='softmax')(x)
        
        model = Model(inputs=input_layer, outputs=predictions)
        return model

class RealPavementDataTrainer:
    """Main trainer class for real pavement data"""
    
    def __init__(self, config_path: str = None):
        self.config = self._load_config(config_path)
        self._setup_logging()
        self.data_processor = RealPavementDataProcessor(self.config)
        self.model_builder = AdvancedPavementModel(self.config)
        self.models = {}
        self.training_history = {}
        self.metadata = None
        
    def _load_config(self, config_path: str) -> Dict:
        """Load training configuration"""
        if config_path and os.path.exists(config_path):
            with open(config_path, 'r') as f:
                if config_path.endswith('.yaml') or config_path.endswith('.yml'):
                    return yaml.safe_load(f)
                else:
                    return json.load(f)
        
        # Default configuration for real pavement data training
        return {
            'experiment': {
                'name': 'real_pavement_analysis',
                'description': 'Training on real pavement datasets'
            },
            'data': {
                'image_size': [224, 224, 3],
                'quality_threshold': 0.7,
                'validation_split': 0.2,
                'test_split': 0.1,
                'condition_classes': ['excellent', 'good', 'fair', 'poor', 'failed'],
                'augmentation_factor': 5
            },
            'training': {
                'batch_size': 32,
                'epochs': 100,
                'learning_rate': 0.001,
                'patience': 15,
                'use_class_weights': True
            },
            'models': {
                'architectures': ['attention_resnet', 'multi_scale_cnn'],
                'ensemble': True
            }
        }
    
    def _setup_logging(self):
        """Setup logging configuration"""
        logging.basicConfig(
            level=logging.INFO,
            format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
            handlers=[
                logging.FileHandler(f'real_pavement_training_{datetime.now().strftime("%Y%m%d_%H%M%S")}.log'),
                logging.StreamHandler()
            ]
        )
        self.logger = logging.getLogger(__name__)
    
    def load_real_data(self, data_path: str) -> None:
        """Load and process real pavement dataset"""
        self.logger.info("Loading real pavement dataset...")
        
        # Load and validate dataset
        self.image_paths, self.labels, self.metadata = self.data_processor.load_and_validate_dataset(data_path)
        
        # Encode labels
        self.label_encoder = LabelEncoder()
        self.encoded_labels = self.label_encoder.fit_transform(self.labels)
        
        # Update number of classes in config
        self.config['data']['condition_classes'] = list(self.label_encoder.classes_)
        self.num_classes = len(self.label_encoder.classes_)
        
        self.logger.info(f"Dataset loaded: {len(self.image_paths)} images, {self.num_classes} classes")
        self.logger.info(f"Class distribution: {dict(zip(*np.unique(self.labels, return_counts=True)))}")
    
    def create_data_generators(self) -> Tuple:
        """Create training and validation data generators"""
        # Split data
        X_train, X_test, y_train, y_test = train_test_split(
            self.image_paths, self.encoded_labels,
            test_size=self.config['data']['test_split'],
            stratify=self.encoded_labels,
            random_state=42
        )
        
        X_train, X_val, y_train, y_val = train_test_split(
            X_train, y_train,
            test_size=self.config['data']['validation_split'],
            stratify=y_train,
            random_state=42
        )
        
        # Create data generators with advanced augmentation
        train_generator = self._create_generator(X_train, y_train, augment=True)
        val_generator = self._create_generator(X_val, y_val, augment=False)
        test_generator = self._create_generator(X_test, y_test, augment=False)
        
        return train_generator, val_generator, test_generator
    
    def _create_generator(self, image_paths: List[str], labels: List[int], augment: bool = False):
        """Create custom data generator"""
        class PavementDataGenerator(tf.keras.utils.Sequence):
            def __init__(self, image_paths, labels, batch_size, image_size, augment=False, processor=None):
                self.image_paths = image_paths
                self.labels = labels
                self.batch_size = batch_size
                self.image_size = image_size
                self.augment = augment
                self.processor = processor
                self.indexes = np.arange(len(self.image_paths))
                self.on_epoch_end()
            
            def __len__(self):
                return int(np.floor(len(self.image_paths) / self.batch_size))
            
            def __getitem__(self, index):
                indexes = self.indexes[index * self.batch_size:(index + 1) * self.batch_size]
                batch_paths = [self.image_paths[k] for k in indexes]
                batch_labels = [self.labels[k] for k in indexes]
                
                X, y = self.__data_generation(batch_paths, batch_labels)
                return X, y
            
            def on_epoch_end(self):
                if self.augment:
                    np.random.shuffle(self.indexes)
            
            def __data_generation(self, batch_paths, batch_labels):
                X = np.empty((self.batch_size, *self.image_size, 3))
                y = np.empty((self.batch_size), dtype=int)
                
                for i, (path, label) in enumerate(zip(batch_paths, batch_labels)):
                    # Load image
                    image = cv2.imread(path)
                    image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
                    image = cv2.resize(image, self.image_size[:2])
                    
                    # Apply augmentation if specified
                    if self.augment and self.processor:
                        augmented = self.processor.augmentation_pipeline(image=image)
                        image = augmented['image']
                    else:
                        image = image.astype(np.float32) / 255.0
                    
                    X[i,] = image
                    y[i] = label
                
                return X, tf.keras.utils.to_categorical(y, num_classes=len(np.unique(batch_labels)))
        
        return PavementDataGenerator(
            image_paths, labels, 
            self.config['training']['batch_size'],
            tuple(self.config['data']['image_size'][:2]),
            augment, self.data_processor if augment else None
        )
    
    def train_models(self, train_generator, val_generator) -> Dict:
        """Train multiple model architectures"""
        results = {}
        
        for arch in self.config['models']['architectures']:
            self.logger.info(f"Training {arch} model...")
            
            # Create model
            if arch == 'attention_resnet':
                model = self.model_builder.create_attention_resnet()
            elif arch == 'multi_scale_cnn':
                model = self.model_builder.create_multi_scale_cnn()
            else:
                self.logger.warning(f"Unknown architecture: {arch}")
                continue
            
            # Compile model
            model.compile(
                optimizer=Adam(learning_rate=self.config['training']['learning_rate']),
                loss='categorical_crossentropy',
                metrics=['accuracy', 'precision', 'recall']
            )
            
            # Setup callbacks
            callbacks = [
                EarlyStopping(
                    monitor='val_accuracy',
                    patience=self.config['training']['patience'],
                    restore_best_weights=True
                ),
                ModelCheckpoint(
                    f'best_{arch}_model.h5',
                    save_best_only=True,
                    monitor='val_accuracy'
                ),
                ReduceLROnPlateau(
                    monitor='val_accuracy',
                    factor=0.5,
                    patience=8,
                    min_lr=1e-7
                ),
                TensorBoard(log_dir=f'logs/{arch}_{datetime.now().strftime("%Y%m%d_%H%M%S")}')
            ]
            
            # Calculate class weights if specified
            class_weight = None
            if self.config['training'].get('use_class_weights', False):
                from sklearn.utils.class_weight import compute_class_weight
                classes = np.unique(self.encoded_labels)
                class_weight = dict(zip(
                    classes,
                    compute_class_weight('balanced', classes=classes, y=self.encoded_labels)
                ))
            
            # Train model
            history = model.fit(
                train_generator,
                validation_data=val_generator,
                epochs=self.config['training']['epochs'],
                callbacks=callbacks,
                class_weight=class_weight,
                verbose=1
            )
            
            self.models[arch] = model
            self.training_history[arch] = history.history
            results[arch] = {
                'final_accuracy': max(history.history['val_accuracy']),
                'final_loss': min(history.history['val_loss'])
            }
            
            self.logger.info(f"{arch} training completed. Best val_accuracy: {results[arch]['final_accuracy']:.4f}")
        
        return results
    
    def evaluate_models(self, test_generator) -> Dict:
        """Comprehensive model evaluation"""
        evaluation_results = {}
        
        for arch, model in self.models.items():
            self.logger.info(f"Evaluating {arch} model...")
            
            # Basic evaluation
            test_loss, test_acc, test_precision, test_recall = model.evaluate(test_generator, verbose=0)
            
            # Generate predictions for detailed metrics
            predictions = model.predict(test_generator)
            predicted_classes = np.argmax(predictions, axis=1)
            
            # Get true labels (assuming test_generator yields them correctly)
            true_labels = []
            for i in range(len(test_generator)):
                _, labels = test_generator[i]
                true_labels.extend(np.argmax(labels, axis=1))
            true_labels = np.array(true_labels[:len(predicted_classes)])
            
            # Calculate detailed metrics
            classification_rep = classification_report(
                true_labels, predicted_classes,
                target_names=self.label_encoder.classes_,
                output_dict=True
            )
            
            confusion_mat = confusion_matrix(true_labels, predicted_classes)
            
            evaluation_results[arch] = {
                'test_accuracy': test_acc,
                'test_loss': test_loss,
                'test_precision': test_precision,
                'test_recall': test_recall,
                'classification_report': classification_rep,
                'confusion_matrix': confusion_mat
            }
            
            # Plot confusion matrix
            self._plot_confusion_matrix(confusion_mat, arch)
        
        return evaluation_results
    
    def _plot_confusion_matrix(self, cm: np.ndarray, model_name: str):
        """Plot confusion matrix"""
        plt.figure(figsize=(10, 8))
        sns.heatmap(
            cm, annot=True, fmt='d',
            xticklabels=self.label_encoder.classes_,
            yticklabels=self.label_encoder.classes_,
            cmap='Blues'
        )
        plt.title(f'Confusion Matrix - {model_name}')
        plt.ylabel('True Label')
        plt.xlabel('Predicted Label')
        plt.tight_layout()
        plt.savefig(f'confusion_matrix_{model_name}.png', dpi=300, bbox_inches='tight')
        plt.close()
    
    def create_ensemble_model(self) -> Model:
        """Create ensemble model from trained models"""
        if len(self.models) < 2:
            self.logger.warning("Need at least 2 models for ensemble")
            return None
        
        self.logger.info("Creating ensemble model...")
        
        # Create ensemble input
        input_layer = tf.keras.layers.Input(shape=(*tuple(self.config['data']['image_size'][:2]), 3))
        
        # Get predictions from each model
        model_outputs = []
        for arch, model in self.models.items():
            # Get the pre-softmax layer output for better ensemble learning
            model_output = model(input_layer)
            model_outputs.append(model_output)
        
        # Average ensemble
        if len(model_outputs) > 1:
            ensemble_output = tf.keras.layers.Average()(model_outputs)
        else:
            ensemble_output = model_outputs[0]
        
        ensemble_model = Model(inputs=input_layer, outputs=ensemble_output)
        
        # Compile ensemble model
        ensemble_model.compile(
            optimizer=Adam(learning_rate=0.0001),
            loss='categorical_crossentropy',
            metrics=['accuracy', 'precision', 'recall']
        )
        
        self.models['ensemble'] = ensemble_model
        return ensemble_model
    
    def save_training_results(self, output_dir: str):
        """Save all training results and models"""
        output_path = Path(output_dir)
        output_path.mkdir(parents=True, exist_ok=True)
        
        # Save models
        models_dir = output_path / 'models'
        models_dir.mkdir(exist_ok=True)
        
        for arch, model in self.models.items():
            model.save(models_dir / f'{arch}_model.h5')
            
            # Export to TensorFlow Lite for mobile deployment
            converter = tf.lite.TFLiteConverter.from_keras_model(model)
            converter.optimizations = [tf.lite.Optimize.DEFAULT]
            tflite_model = converter.convert()
            
            with open(models_dir / f'{arch}_model.tflite', 'wb') as f:
                f.write(tflite_model)
        
        # Save training history
        with open(output_path / 'training_history.json', 'w') as f:
            json.dump(self.training_history, f, indent=2)
        
        # Save configuration
        with open(output_path / 'training_config.json', 'w') as f:
            json.dump(self.config, f, indent=2)
        
        # Save label encoder
        joblib.dump(self.label_encoder, output_path / 'label_encoder.pkl')
        
        # Save metadata
        if self.metadata is not None:
            self.metadata.to_csv(output_path / 'dataset_metadata.csv', index=False)
        
        self.logger.info(f"Training results saved to {output_path}")
    
    def run_complete_training(self, data_path: str, output_dir: str = './training_output'):
        """Run complete training pipeline"""
        try:
            # Load real pavement data
            self.load_real_data(data_path)
            
            # Create data generators
            train_gen, val_gen, test_gen = self.create_data_generators()
            
            # Train models
            training_results = self.train_models(train_gen, val_gen)
            
            # Evaluate models
            evaluation_results = self.evaluate_models(test_gen)
            
            # Create ensemble if specified
            if self.config['models'].get('ensemble', False):
                ensemble_model = self.create_ensemble_model()
                if ensemble_model:
                    ensemble_results = ensemble_model.evaluate(test_gen, verbose=0)
                    evaluation_results['ensemble'] = {
                        'test_accuracy': ensemble_results[1],
                        'test_loss': ensemble_results[0]
                    }
            
            # Save results
            self.save_training_results(output_dir)
            
            # Print summary
            self._print_training_summary(training_results, evaluation_results)
            
            return {
                'training_results': training_results,
                'evaluation_results': evaluation_results,
                'output_directory': output_dir
            }
            
        except Exception as e:
            self.logger.error(f"Training failed: {e}")
            raise
    
    def _print_training_summary(self, training_results: Dict, evaluation_results: Dict):
        """Print comprehensive training summary"""
        print("\n" + "="*60)
        print("REAL PAVEMENT DATA TRAINING SUMMARY")
        print("="*60)
        
        print(f"\nDataset: {len(self.image_paths)} images")
        print(f"Classes: {list(self.label_encoder.classes_)}")
        
        print("\nTraining Results:")
        print("-" * 40)
        for arch, results in training_results.items():
            print(f"{arch:20s}: Accuracy={results['final_accuracy']:.4f}")
        
        print("\nEvaluation Results:")
        print("-" * 40)
        for arch, results in evaluation_results.items():
            if 'test_accuracy' in results:
                print(f"{arch:20s}: Test Accuracy={results['test_accuracy']:.4f}")
        
        # Find best model
        best_model = max(evaluation_results.items(), 
                        key=lambda x: x[1].get('test_accuracy', 0))
        print(f"\nBest Model: {best_model[0]} ({best_model[1]['test_accuracy']:.4f})")
        print("="*60)

if __name__ == "__main__":
    import argparse
    
    parser = argparse.ArgumentParser(description='Train AI models on real pavement data')
    parser.add_argument('--data-path', required=True, help='Path to pavement dataset')
    parser.add_argument('--config', help='Configuration file path')
    parser.add_argument('--output-dir', default='./training_output', help='Output directory')
    
    args = parser.parse_args()
    
    # Initialize trainer
    trainer = RealPavementDataTrainer(args.config)
    
    # Run training
    results = trainer.run_complete_training(args.data_path, args.output_dir)
    
    print(f"\nTraining completed successfully!")
    print(f"Results saved to: {results['output_directory']}")