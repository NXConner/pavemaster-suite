#!/usr/bin/env python3
"""
PaveMaster Suite - AI Training System for Pavement Condition Analysis
Advanced deep learning pipeline for training custom models with real pavement data
"""

import os
import numpy as np
import pandas as pd
import tensorflow as tf
from tensorflow.keras.applications import ResNet50, EfficientNetB0, VGG16
from tensorflow.keras.layers import Dense, GlobalAveragePooling2D, Dropout, BatchNormalization
from tensorflow.keras.models import Model
from tensorflow.keras.optimizers import Adam, SGD
from tensorflow.keras.callbacks import EarlyStopping, ModelCheckpoint, ReduceLROnPlateau
from tensorflow.keras.preprocessing.image import ImageDataGenerator
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report, confusion_matrix
import cv2
import json
import logging
from datetime import datetime
from typing import Dict, List, Tuple, Optional
import matplotlib.pyplot as plt
import seaborn as sns

class PavementAITrainer:
    """
    Advanced AI training system for pavement condition assessment
    """
    
    def __init__(self, config_path: str = None):
        self.config = self._load_config(config_path)
        self._setup_logging()
        self.models = {}
        self.training_history = {}
        
        # Pavement condition categories
        self.condition_classes = {
            0: 'excellent',
            1: 'good', 
            2: 'fair',
            3: 'poor',
            4: 'failed'
        }
        
        # Crack detection categories
        self.crack_types = {
            0: 'no_cracks',
            1: 'longitudinal',
            2: 'transverse', 
            3: 'alligator',
            4: 'block',
            5: 'pothole'
        }
        
    def _load_config(self, config_path: str) -> Dict:
        """Load training configuration"""
        default_config = {
            "image_size": (224, 224, 3),
            "batch_size": 32,
            "epochs": 100,
            "learning_rate": 0.001,
            "validation_split": 0.2,
            "test_split": 0.1,
            "data_augmentation": True,
            "early_stopping_patience": 15,
            "model_architectures": ["ResNet50", "EfficientNetB0", "Custom_CNN"],
            "metrics": ["accuracy", "precision", "recall", "f1_score"]
        }
        
        if config_path and os.path.exists(config_path):
            with open(config_path, 'r') as f:
                user_config = json.load(f)
                default_config.update(user_config)
                
        return default_config
    
    def _setup_logging(self):
        """Setup logging for training process"""
        logging.basicConfig(
            level=logging.INFO,
            format='%(asctime)s - %(levelname)s - %(message)s',
            handlers=[
                logging.FileHandler(f'training_log_{datetime.now().strftime("%Y%m%d_%H%M%S")}.log'),
                logging.StreamHandler()
            ]
        )
        self.logger = logging.getLogger(__name__)
    
    def load_pavement_data(self, data_directory: str) -> Tuple[np.ndarray, np.ndarray]:
        """
        Load and preprocess pavement image data
        Expected directory structure:
        data_directory/
        ├── condition_assessment/
        │   ├── excellent/
        │   ├── good/
        │   ├── fair/
        │   ├── poor/
        │   └── failed/
        └── crack_detection/
            ├── no_cracks/
            ├── longitudinal/
            ├── transverse/
            ├── alligator/
            ├── block/
            └── pothole/
        """
        self.logger.info(f"Loading pavement data from {data_directory}")
        
        images = []
        labels = []
        metadata = []
        
        # Load condition assessment data
        condition_path = os.path.join(data_directory, "condition_assessment")
        if os.path.exists(condition_path):
            for class_idx, class_name in self.condition_classes.items():
                class_path = os.path.join(condition_path, class_name)
                if os.path.exists(class_path):
                    for img_file in os.listdir(class_path):
                        if img_file.lower().endswith(('.png', '.jpg', '.jpeg')):
                            img_path = os.path.join(class_path, img_file)
                            img = self._load_and_preprocess_image(img_path)
                            if img is not None:
                                images.append(img)
                                labels.append(class_idx)
                                metadata.append({
                                    'file_path': img_path,
                                    'task': 'condition_assessment',
                                    'class': class_name
                                })
        
        # Load crack detection data
        crack_path = os.path.join(data_directory, "crack_detection")
        if os.path.exists(crack_path):
            for class_idx, class_name in self.crack_types.items():
                class_path = os.path.join(crack_path, class_name)
                if os.path.exists(class_path):
                    for img_file in os.listdir(class_path):
                        if img_file.lower().endswith(('.png', '.jpg', '.jpeg')):
                            img_path = os.path.join(class_path, img_file)
                            img = self._load_and_preprocess_image(img_path)
                            if img is not None:
                                images.append(img)
                                labels.append(class_idx)
                                metadata.append({
                                    'file_path': img_path,
                                    'task': 'crack_detection',
                                    'class': class_name
                                })
        
        self.logger.info(f"Loaded {len(images)} images with {len(set(labels))} classes")
        
        return np.array(images), np.array(labels), metadata
    
    def _load_and_preprocess_image(self, image_path: str) -> Optional[np.ndarray]:
        """Load and preprocess a single image"""
        try:
            # Load image
            img = cv2.imread(image_path)
            if img is None:
                return None
                
            # Convert BGR to RGB
            img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
            
            # Resize to target size
            img = cv2.resize(img, self.config["image_size"][:2])
            
            # Normalize pixel values
            img = img.astype(np.float32) / 255.0
            
            return img
            
        except Exception as e:
            self.logger.warning(f"Error loading image {image_path}: {e}")
            return None
    
    def create_data_augmentation_generator(self):
        """Create data augmentation generator for training"""
        return ImageDataGenerator(
            rotation_range=20,
            width_shift_range=0.2,
            height_shift_range=0.2,
            horizontal_flip=True,
            zoom_range=0.2,
            shear_range=0.1,
            brightness_range=[0.8, 1.2],
            fill_mode='nearest'
        )
    
    def build_model(self, architecture: str, num_classes: int) -> Model:
        """Build model based on specified architecture"""
        input_shape = self.config["image_size"]
        
        if architecture == "ResNet50":
            base_model = ResNet50(
                weights='imagenet',
                include_top=False,
                input_shape=input_shape
            )
        elif architecture == "EfficientNetB0":
            base_model = EfficientNetB0(
                weights='imagenet',
                include_top=False,
                input_shape=input_shape
            )
        elif architecture == "VGG16":
            base_model = VGG16(
                weights='imagenet',
                include_top=False,
                input_shape=input_shape
            )
        elif architecture == "Custom_CNN":
            return self._build_custom_cnn(num_classes)
        else:
            raise ValueError(f"Unsupported architecture: {architecture}")
        
        # Freeze base model layers
        base_model.trainable = False
        
        # Add custom classification head
        x = base_model.output
        x = GlobalAveragePooling2D()(x)
        x = Dense(512, activation='relu')(x)
        x = BatchNormalization()(x)
        x = Dropout(0.5)(x)
        x = Dense(256, activation='relu')(x)
        x = BatchNormalization()(x)
        x = Dropout(0.3)(x)
        predictions = Dense(num_classes, activation='softmax')(x)
        
        model = Model(inputs=base_model.input, outputs=predictions)
        
        return model
    
    def _build_custom_cnn(self, num_classes: int) -> Model:
        """Build custom CNN architecture optimized for pavement analysis"""
        model = tf.keras.Sequential([
            tf.keras.layers.Conv2D(32, (3, 3), activation='relu', input_shape=self.config["image_size"]),
            tf.keras.layers.BatchNormalization(),
            tf.keras.layers.MaxPooling2D(2, 2),
            
            tf.keras.layers.Conv2D(64, (3, 3), activation='relu'),
            tf.keras.layers.BatchNormalization(),
            tf.keras.layers.MaxPooling2D(2, 2),
            
            tf.keras.layers.Conv2D(128, (3, 3), activation='relu'),
            tf.keras.layers.BatchNormalization(),
            tf.keras.layers.MaxPooling2D(2, 2),
            
            tf.keras.layers.Conv2D(256, (3, 3), activation='relu'),
            tf.keras.layers.BatchNormalization(),
            tf.keras.layers.MaxPooling2D(2, 2),
            
            tf.keras.layers.GlobalAveragePooling2D(),
            tf.keras.layers.Dense(512, activation='relu'),
            tf.keras.layers.BatchNormalization(),
            tf.keras.layers.Dropout(0.5),
            tf.keras.layers.Dense(256, activation='relu'),
            tf.keras.layers.BatchNormalization(),
            tf.keras.layers.Dropout(0.3),
            tf.keras.layers.Dense(num_classes, activation='softmax')
        ])
        
        return model
    
    def train_model(self, 
                   X: np.ndarray, 
                   y: np.ndarray, 
                   model_name: str,
                   architecture: str = "ResNet50") -> Dict:
        """Train a model with the provided data"""
        
        self.logger.info(f"Training {architecture} model: {model_name}")
        
        # Split data
        X_train, X_temp, y_train, y_temp = train_test_split(
            X, y, test_size=self.config["validation_split"] + self.config["test_split"], 
            stratify=y, random_state=42
        )
        
        X_val, X_test, y_val, y_test = train_test_split(
            X_temp, y_temp, 
            test_size=self.config["test_split"] / (self.config["validation_split"] + self.config["test_split"]),
            stratify=y_temp, random_state=42
        )
        
        # Convert to categorical
        num_classes = len(np.unique(y))
        y_train_cat = tf.keras.utils.to_categorical(y_train, num_classes)
        y_val_cat = tf.keras.utils.to_categorical(y_val, num_classes)
        y_test_cat = tf.keras.utils.to_categorical(y_test, num_classes)
        
        # Build model
        model = self.build_model(architecture, num_classes)
        
        # Compile model
        model.compile(
            optimizer=Adam(learning_rate=self.config["learning_rate"]),
            loss='categorical_crossentropy',
            metrics=['accuracy', 'precision', 'recall']
        )
        
        # Setup callbacks
        callbacks = [
            EarlyStopping(
                monitor='val_loss',
                patience=self.config["early_stopping_patience"],
                restore_best_weights=True
            ),
            ModelCheckpoint(
                f'models/{model_name}_{architecture}_best.h5',
                monitor='val_loss',
                save_best_only=True
            ),
            ReduceLROnPlateau(
                monitor='val_loss',
                factor=0.2,
                patience=5,
                min_lr=1e-7
            )
        ]
        
        # Data augmentation
        if self.config["data_augmentation"]:
            train_generator = self.create_data_augmentation_generator()
            train_flow = train_generator.flow(X_train, y_train_cat, batch_size=self.config["batch_size"])
        else:
            train_flow = None
        
        # Train model
        if train_flow:
            history = model.fit(
                train_flow,
                steps_per_epoch=len(X_train) // self.config["batch_size"],
                epochs=self.config["epochs"],
                validation_data=(X_val, y_val_cat),
                callbacks=callbacks,
                verbose=1
            )
        else:
            history = model.fit(
                X_train, y_train_cat,
                batch_size=self.config["batch_size"],
                epochs=self.config["epochs"],
                validation_data=(X_val, y_val_cat),
                callbacks=callbacks,
                verbose=1
            )
        
        # Evaluate on test set
        test_loss, test_accuracy, test_precision, test_recall = model.evaluate(X_test, y_test_cat, verbose=0)
        
        # Calculate F1 score
        y_pred = model.predict(X_test)
        y_pred_classes = np.argmax(y_pred, axis=1)
        f1_score = self._calculate_f1_score(y_test, y_pred_classes)
        
        # Store model and results
        self.models[model_name] = model
        self.training_history[model_name] = {
            'history': history.history,
            'test_metrics': {
                'loss': test_loss,
                'accuracy': test_accuracy,
                'precision': test_precision,
                'recall': test_recall,
                'f1_score': f1_score
            },
            'architecture': architecture,
            'num_classes': num_classes
        }
        
        # Generate detailed evaluation report
        evaluation_report = self.generate_evaluation_report(
            model, X_test, y_test, y_test_cat, model_name
        )
        
        self.logger.info(f"Model {model_name} training completed")
        self.logger.info(f"Test Accuracy: {test_accuracy:.4f}")
        self.logger.info(f"Test F1 Score: {f1_score:.4f}")
        
        return evaluation_report
    
    def _calculate_f1_score(self, y_true: np.ndarray, y_pred: np.ndarray) -> float:
        """Calculate F1 score"""
        from sklearn.metrics import f1_score
        return f1_score(y_true, y_pred, average='weighted')
    
    def generate_evaluation_report(self, 
                                 model: Model, 
                                 X_test: np.ndarray, 
                                 y_test: np.ndarray,
                                 y_test_cat: np.ndarray,
                                 model_name: str) -> Dict:
        """Generate comprehensive evaluation report"""
        
        # Predictions
        y_pred = model.predict(X_test)
        y_pred_classes = np.argmax(y_pred, axis=1)
        
        # Classification report
        class_report = classification_report(
            y_test, y_pred_classes, 
            target_names=[f"Class_{i}" for i in range(len(np.unique(y_test)))],
            output_dict=True
        )
        
        # Confusion matrix
        conf_matrix = confusion_matrix(y_test, y_pred_classes)
        
        # Save visualizations
        self._save_training_plots(model_name)
        self._save_confusion_matrix(conf_matrix, model_name)
        
        return {
            'model_name': model_name,
            'classification_report': class_report,
            'confusion_matrix': conf_matrix.tolist(),
            'test_metrics': self.training_history[model_name]['test_metrics']
        }
    
    def _save_training_plots(self, model_name: str):
        """Save training history plots"""
        if model_name not in self.training_history:
            return
            
        history = self.training_history[model_name]['history']
        
        fig, axes = plt.subplots(2, 2, figsize=(15, 10))
        
        # Accuracy
        axes[0, 0].plot(history['accuracy'], label='Training Accuracy')
        axes[0, 0].plot(history['val_accuracy'], label='Validation Accuracy')
        axes[0, 0].set_title('Model Accuracy')
        axes[0, 0].set_xlabel('Epoch')
        axes[0, 0].set_ylabel('Accuracy')
        axes[0, 0].legend()
        
        # Loss
        axes[0, 1].plot(history['loss'], label='Training Loss')
        axes[0, 1].plot(history['val_loss'], label='Validation Loss')
        axes[0, 1].set_title('Model Loss')
        axes[0, 1].set_xlabel('Epoch')
        axes[0, 1].set_ylabel('Loss')
        axes[0, 1].legend()
        
        # Precision
        axes[1, 0].plot(history['precision'], label='Training Precision')
        axes[1, 0].plot(history['val_precision'], label='Validation Precision')
        axes[1, 0].set_title('Model Precision')
        axes[1, 0].set_xlabel('Epoch')
        axes[1, 0].set_ylabel('Precision')
        axes[1, 0].legend()
        
        # Recall
        axes[1, 1].plot(history['recall'], label='Training Recall')
        axes[1, 1].plot(history['val_recall'], label='Validation Recall')
        axes[1, 1].set_title('Model Recall')
        axes[1, 1].set_xlabel('Epoch')
        axes[1, 1].set_ylabel('Recall')
        axes[1, 1].legend()
        
        plt.tight_layout()
        plt.savefig(f'plots/{model_name}_training_history.png', dpi=300, bbox_inches='tight')
        plt.close()
    
    def _save_confusion_matrix(self, conf_matrix: np.ndarray, model_name: str):
        """Save confusion matrix plot"""
        plt.figure(figsize=(10, 8))
        sns.heatmap(conf_matrix, annot=True, fmt='d', cmap='Blues')
        plt.title(f'Confusion Matrix - {model_name}')
        plt.ylabel('True Label')
        plt.xlabel('Predicted Label')
        plt.savefig(f'plots/{model_name}_confusion_matrix.png', dpi=300, bbox_inches='tight')
        plt.close()
    
    def compare_models(self) -> pd.DataFrame:
        """Compare performance across all trained models"""
        comparison_data = []
        
        for model_name, history in self.training_history.items():
            metrics = history['test_metrics']
            comparison_data.append({
                'Model': model_name,
                'Architecture': history['architecture'],
                'Test_Accuracy': metrics['accuracy'],
                'Test_Precision': metrics['precision'],
                'Test_Recall': metrics['recall'],
                'Test_F1_Score': metrics['f1_score'],
                'Test_Loss': metrics['loss']
            })
        
        df = pd.DataFrame(comparison_data)
        df.to_csv('model_comparison.csv', index=False)
        
        return df
    
    def save_best_model(self, metric: str = 'f1_score') -> str:
        """Save the best performing model based on specified metric"""
        if not self.training_history:
            raise ValueError("No models have been trained yet")
        
        best_model_name = max(
            self.training_history.keys(),
            key=lambda x: self.training_history[x]['test_metrics'][metric]
        )
        
        best_model = self.models[best_model_name]
        best_model.save(f'models/best_pavement_model_{metric}.h5')
        
        # Save model metadata
        metadata = {
            'model_name': best_model_name,
            'architecture': self.training_history[best_model_name]['architecture'],
            'best_metric': metric,
            'metric_value': self.training_history[best_model_name]['test_metrics'][metric],
            'training_config': self.config,
            'condition_classes': self.condition_classes,
            'crack_types': self.crack_types
        }
        
        with open(f'models/best_pavement_model_{metric}_metadata.json', 'w') as f:
            json.dump(metadata, f, indent=2)
        
        self.logger.info(f"Best model ({best_model_name}) saved based on {metric}")
        
        return best_model_name
    
    def create_ensemble_model(self) -> Model:
        """Create ensemble model from trained models"""
        if len(self.models) < 2:
            raise ValueError("Need at least 2 models to create ensemble")
        
        # Implement ensemble logic here
        # This is a simplified version - you might want to implement more sophisticated ensembling
        pass
    
    def export_model_for_deployment(self, model_name: str, export_format: str = 'savedmodel'):
        """Export model in deployment-ready format"""
        if model_name not in self.models:
            raise ValueError(f"Model {model_name} not found")
        
        model = self.models[model_name]
        
        if export_format == 'savedmodel':
            model.save(f'exports/{model_name}_savedmodel')
        elif export_format == 'tflite':
            converter = tf.lite.TFLiteConverter.from_keras_model(model)
            tflite_model = converter.convert()
            with open(f'exports/{model_name}.tflite', 'wb') as f:
                f.write(tflite_model)
        elif export_format == 'onnx':
            # ONNX export would require tf2onnx
            pass
        
        self.logger.info(f"Model {model_name} exported in {export_format} format")

if __name__ == "__main__":
    # Initialize trainer
    trainer = PavementAITrainer()
    
    # Create necessary directories
    os.makedirs('models', exist_ok=True)
    os.makedirs('plots', exist_ok=True)
    os.makedirs('exports', exist_ok=True)
    
    print("PaveMaster AI Training System initialized!")
    print("Ready to train custom models with real pavement data.")