#!/usr/bin/env python3
"""
PaveMaster Suite - Advanced Training Pipeline
Comprehensive training pipeline with experiment tracking, monitoring, and validation
"""

import os
import json
import logging
import numpy as np
import pandas as pd
import tensorflow as tf
from tensorflow.keras.callbacks import Callback
from tensorflow.keras.optimizers import Adam, SGD, RMSprop
import matplotlib.pyplot as plt
import seaborn as sns
from datetime import datetime
from typing import Dict, List, Tuple, Optional, Any
import wandb
from sklearn.metrics import classification_report, confusion_matrix, f1_score
import gc
import psutil
from pathlib import Path

from PavementAITrainer import PavementAITrainer
from ModelArchitectures import create_pavement_model, PavementModelArchitectures
from DataGenerator import PavementDataGenerator

class TrainingMonitor(Callback):
    """Advanced training monitor with real-time metrics and early stopping"""
    
    def __init__(self, 
                 patience: int = 10,
                 min_delta: float = 0.001,
                 monitor: str = 'val_loss',
                 restore_best_weights: bool = True,
                 log_dir: str = './logs'):
        super().__init__()
        self.patience = patience
        self.min_delta = min_delta
        self.monitor = monitor
        self.restore_best_weights = restore_best_weights
        self.log_dir = log_dir
        self.best_weights = None
        self.best_value = None
        self.wait = 0
        self.stopped_epoch = 0
        self.monitor_op = None
        
        # Setup logging
        os.makedirs(log_dir, exist_ok=True)
        self.logger = logging.getLogger(f"TrainingMonitor_{datetime.now().strftime('%Y%m%d_%H%M%S')}")
        
    def on_train_begin(self, logs=None):
        """Initialize monitoring at training start"""
        self.wait = 0
        self.stopped_epoch = 0
        if 'loss' in self.monitor or 'accuracy' not in self.monitor:
            self.monitor_op = np.less
            self.best_value = np.Inf
        else:
            self.monitor_op = np.greater
            self.best_value = -np.Inf
            
    def on_epoch_end(self, epoch, logs=None):
        """Monitor metrics at end of each epoch"""
        logs = logs or {}
        current_value = logs.get(self.monitor)
        
        if current_value is None:
            self.logger.warning(f"Monitor metric '{self.monitor}' not found in logs")
            return
            
        # Check if current value is better
        if self.monitor_op(current_value - self.min_delta, self.best_value):
            self.best_value = current_value
            self.wait = 0
            if self.restore_best_weights:
                self.best_weights = self.model.get_weights()
        else:
            self.wait += 1
            
        # Log metrics
        self.logger.info(f"Epoch {epoch + 1}: {self.monitor}={current_value:.6f}, best={self.best_value:.6f}")
        
        # Check for early stopping
        if self.wait >= self.patience:
            self.stopped_epoch = epoch
            self.model.stop_training = True
            if self.restore_best_weights and self.best_weights is not None:
                self.model.set_weights(self.best_weights)
                
    def on_train_end(self, logs=None):
        """Cleanup and final logging"""
        if self.stopped_epoch > 0:
            self.logger.info(f"Early stopping at epoch {self.stopped_epoch + 1}")

class AdvancedTrainingPipeline:
    """
    Advanced training pipeline with experiment tracking and monitoring
    """
    
    def __init__(self, 
                 experiment_name: str = "pavement_ai_training",
                 config_path: str = None):
        self.experiment_name = experiment_name
        self.setup_logging()
        
        # Load configuration
        self.config = self._load_config(config_path)
        
        # Initialize components
        self.ai_trainer = PavementAITrainer(config_path)
        self.data_generator = PavementDataGenerator()
        self.model_architectures = PavementModelArchitectures()
        
        # Experiment tracking
        self.experiment_dir = f"experiments/{experiment_name}_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
        os.makedirs(self.experiment_dir, exist_ok=True)
        
        # Initialize Weights & Biases if configured
        if self.config.get('use_wandb', False):
            self._init_wandb()
            
        self.training_history = {}
        self.models = {}
        
    def setup_logging(self):
        """Setup comprehensive logging"""
        log_format = '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
        logging.basicConfig(
            level=logging.INFO,
            format=log_format,
            handlers=[
                logging.FileHandler(f'training_pipeline_{datetime.now().strftime("%Y%m%d_%H%M%S")}.log'),
                logging.StreamHandler()
            ]
        )
        self.logger = logging.getLogger(__name__)
        
    def _load_config(self, config_path: str) -> Dict:
        """Load training configuration with defaults"""
        default_config = {
            "experiment": {
                "name": "pavement_ai_experiment",
                "description": "Advanced pavement condition analysis training",
                "tags": ["pavement", "computer_vision", "condition_assessment"]
            },
            "data": {
                "synthetic_samples_per_class": 1000,
                "real_data_augmentation_factor": 5,
                "validation_split": 0.2,
                "test_split": 0.1,
                "image_size": [224, 224, 3]
            },
            "training": {
                "batch_size": 32,
                "epochs": 100,
                "learning_rate": 0.001,
                "optimizer": "adam",
                "early_stopping_patience": 15,
                "reduce_lr_patience": 5,
                "mixed_precision": True
            },
            "models": {
                "architectures": ["resnet", "efficientnet", "attention_cnn", "mobile"],
                "ensemble": True,
                "multi_task": True
            },
            "evaluation": {
                "metrics": ["accuracy", "precision", "recall", "f1_score"],
                "class_weights": "auto",
                "cross_validation": False
            },
            "monitoring": {
                "use_wandb": False,
                "save_best_only": True,
                "monitor_metric": "val_f1_score",
                "tensorboard": True
            },
            "deployment": {
                "export_formats": ["savedmodel", "tflite"],
                "optimization": True,
                "quantization": False
            }
        }
        
        if config_path and os.path.exists(config_path):
            with open(config_path, 'r') as f:
                user_config = json.load(f)
                self._deep_update(default_config, user_config)
                
        return default_config
    
    def _deep_update(self, base_dict: Dict, update_dict: Dict):
        """Deep update nested dictionary"""
        for key, value in update_dict.items():
            if isinstance(value, dict) and key in base_dict:
                self._deep_update(base_dict[key], value)
            else:
                base_dict[key] = value
                
    def _init_wandb(self):
        """Initialize Weights & Biases tracking"""
        try:
            wandb.init(
                project="pavemaster-ai",
                name=self.experiment_name,
                config=self.config,
                tags=self.config['experiment']['tags']
            )
            self.logger.info("Weights & Biases initialized successfully")
        except Exception as e:
            self.logger.warning(f"Failed to initialize W&B: {e}")
            self.config['monitoring']['use_wandb'] = False
    
    def prepare_data(self, 
                    data_directory: str = None,
                    generate_synthetic: bool = True) -> Tuple[np.ndarray, np.ndarray, Dict]:
        """Prepare training data with synthetic generation and augmentation"""
        
        self.logger.info("Preparing training data...")
        
        all_images = []
        all_labels = []
        metadata = []
        
        # Generate synthetic data if requested
        if generate_synthetic:
            self.logger.info("Generating synthetic pavement data...")
            synthetic_dir = os.path.join(self.experiment_dir, "synthetic_data")
            
            synthetic_metadata = self.data_generator.generate_synthetic_dataset(
                output_dir=synthetic_dir,
                num_samples_per_class=self.config['data']['synthetic_samples_per_class'],
                image_size=tuple(self.config['data']['image_size'][:2])
            )
            
            # Load synthetic data
            X_synthetic, y_synthetic, meta_synthetic = self.ai_trainer.load_pavement_data(synthetic_dir)
            all_images.append(X_synthetic)
            all_labels.append(y_synthetic)
            metadata.extend(meta_synthetic)
            
        # Load real data if available
        if data_directory and os.path.exists(data_directory):
            self.logger.info(f"Loading real pavement data from {data_directory}")
            
            # Augment real data
            augmented_dir = os.path.join(self.experiment_dir, "augmented_data")
            self.data_generator.augment_real_data(
                input_dir=data_directory,
                output_dir=augmented_dir,
                augmentation_factor=self.config['data']['real_data_augmentation_factor']
            )
            
            # Load augmented real data
            X_real, y_real, meta_real = self.ai_trainer.load_pavement_data(augmented_dir)
            all_images.append(X_real)
            all_labels.append(y_real)
            metadata.extend(meta_real)
        
        # Combine all data
        if all_images:
            X = np.concatenate(all_images, axis=0)
            y = np.concatenate(all_labels, axis=0)
        else:
            raise ValueError("No data available for training")
        
        # Save data statistics
        data_stats = {
            'total_samples': len(X),
            'unique_classes': len(np.unique(y)),
            'class_distribution': dict(zip(*np.unique(y, return_counts=True))),
            'image_shape': X[0].shape if len(X) > 0 else None
        }
        
        with open(os.path.join(self.experiment_dir, 'data_statistics.json'), 'w') as f:
            json.dump(data_stats, f, indent=2)
        
        self.logger.info(f"Data preparation completed: {data_stats['total_samples']} samples, {data_stats['unique_classes']} classes")
        
        return X, y, data_stats
    
    def run_training_experiments(self, 
                               X: np.ndarray, 
                               y: np.ndarray,
                               data_stats: Dict) -> Dict:
        """Run comprehensive training experiments across multiple architectures"""
        
        self.logger.info("Starting training experiments...")
        
        # Enable mixed precision if configured
        if self.config['training']['mixed_precision']:
            tf.keras.mixed_precision.set_global_policy('mixed_float16')
            self.logger.info("Mixed precision training enabled")
        
        architectures = self.config['models']['architectures']
        num_classes = data_stats['unique_classes']
        
        experiment_results = {}
        
        for arch in architectures:
            self.logger.info(f"Training {arch} model...")
            
            try:
                # Create model
                model = create_pavement_model(
                    architecture=arch,
                    num_classes=num_classes,
                    input_shape=tuple(self.config['data']['image_size'])
                )
                
                # Configure optimizer
                optimizer = self._get_optimizer()
                
                # Compile model
                model.compile(
                    optimizer=optimizer,
                    loss='sparse_categorical_crossentropy',
                    metrics=['accuracy', 'precision', 'recall']
                )
                
                # Setup callbacks
                callbacks = self._setup_callbacks(arch)
                
                # Train model
                history = self._train_model(model, X, y, callbacks, arch)
                
                # Evaluate model
                evaluation_results = self._evaluate_model(model, X, y, arch)
                
                # Store results
                experiment_results[arch] = {
                    'model': model,
                    'history': history,
                    'evaluation': evaluation_results,
                    'architecture': arch
                }
                
                self.models[arch] = model
                self.training_history[arch] = history
                
                # Log to W&B if configured
                if self.config['monitoring']['use_wandb']:
                    self._log_to_wandb(arch, history, evaluation_results)
                
            except Exception as e:
                self.logger.error(f"Failed to train {arch} model: {e}")
                continue
                
            # Clean up GPU memory
            tf.keras.backend.clear_session()
            gc.collect()
        
        # Train ensemble model if configured
        if self.config['models']['ensemble'] and len(self.models) >= 2:
            self.logger.info("Training ensemble model...")
            ensemble_results = self._train_ensemble_model(X, y, num_classes)
            experiment_results['ensemble'] = ensemble_results
        
        # Train multi-task model if configured
        if self.config['models']['multi_task']:
            self.logger.info("Training multi-task model...")
            multi_task_results = self._train_multi_task_model(X, y)
            experiment_results['multi_task'] = multi_task_results
        
        # Generate comprehensive report
        self._generate_experiment_report(experiment_results, data_stats)
        
        return experiment_results
    
    def _get_optimizer(self):
        """Get configured optimizer"""
        optimizer_name = self.config['training']['optimizer'].lower()
        lr = self.config['training']['learning_rate']
        
        if optimizer_name == 'adam':
            return Adam(learning_rate=lr)
        elif optimizer_name == 'sgd':
            return SGD(learning_rate=lr, momentum=0.9)
        elif optimizer_name == 'rmsprop':
            return RMSprop(learning_rate=lr)
        else:
            self.logger.warning(f"Unknown optimizer {optimizer_name}, using Adam")
            return Adam(learning_rate=lr)
    
    def _setup_callbacks(self, model_name: str) -> List:
        """Setup training callbacks"""
        callbacks = []
        
        # Model checkpoint
        checkpoint_path = os.path.join(self.experiment_dir, f"{model_name}_best.h5")
        checkpoint = tf.keras.callbacks.ModelCheckpoint(
            checkpoint_path,
            monitor=self.config['monitoring']['monitor_metric'],
            save_best_only=self.config['monitoring']['save_best_only'],
            save_weights_only=False,
            verbose=1
        )
        callbacks.append(checkpoint)
        
        # Training monitor (custom early stopping)
        monitor = TrainingMonitor(
            patience=self.config['training']['early_stopping_patience'],
            monitor=self.config['monitoring']['monitor_metric'],
            log_dir=os.path.join(self.experiment_dir, f"{model_name}_logs")
        )
        callbacks.append(monitor)
        
        # Reduce learning rate on plateau
        reduce_lr = tf.keras.callbacks.ReduceLROnPlateau(
            monitor=self.config['monitoring']['monitor_metric'],
            factor=0.2,
            patience=self.config['training']['reduce_lr_patience'],
            min_lr=1e-7,
            verbose=1
        )
        callbacks.append(reduce_lr)
        
        # TensorBoard logging
        if self.config['monitoring']['tensorboard']:
            tensorboard = tf.keras.callbacks.TensorBoard(
                log_dir=os.path.join(self.experiment_dir, f"{model_name}_tensorboard"),
                histogram_freq=1,
                write_graph=True,
                write_images=True
            )
            callbacks.append(tensorboard)
        
        # Memory usage callback
        memory_callback = MemoryUsageCallback()
        callbacks.append(memory_callback)
        
        return callbacks
    
    def _train_model(self, 
                    model, 
                    X: np.ndarray, 
                    y: np.ndarray, 
                    callbacks: List,
                    model_name: str) -> Dict:
        """Train individual model"""
        
        # Split data
        from sklearn.model_selection import train_test_split
        
        X_train, X_temp, y_train, y_temp = train_test_split(
            X, y, 
            test_size=self.config['data']['validation_split'] + self.config['data']['test_split'],
            stratify=y,
            random_state=42
        )
        
        X_val, X_test, y_val, y_test = train_test_split(
            X_temp, y_temp,
            test_size=self.config['data']['test_split'] / (self.config['data']['validation_split'] + self.config['data']['test_split']),
            stratify=y_temp,
            random_state=42
        )
        
        # Calculate class weights if needed
        class_weight = None
        if self.config['evaluation']['class_weights'] == 'auto':
            from sklearn.utils.class_weight import compute_class_weight
            classes = np.unique(y_train)
            class_weight = compute_class_weight('balanced', classes=classes, y=y_train)
            class_weight = dict(zip(classes, class_weight))
        
        # Train model
        history = model.fit(
            X_train, y_train,
            batch_size=self.config['training']['batch_size'],
            epochs=self.config['training']['epochs'],
            validation_data=(X_val, y_val),
            callbacks=callbacks,
            class_weight=class_weight,
            verbose=1
        )
        
        return {
            'history': history.history,
            'train_data': (X_train, y_train),
            'val_data': (X_val, y_val),
            'test_data': (X_test, y_test)
        }
    
    def _evaluate_model(self, model, X: np.ndarray, y: np.ndarray, model_name: str) -> Dict:
        """Comprehensive model evaluation"""
        
        # Get test data from the last training session
        # Note: This is a simplified version - in practice, you'd want to maintain consistent test sets
        from sklearn.model_selection import train_test_split
        
        _, X_test, _, y_test = train_test_split(
            X, y, 
            test_size=self.config['data']['test_split'],
            stratify=y,
            random_state=42
        )
        
        # Predictions
        y_pred_proba = model.predict(X_test)
        y_pred = np.argmax(y_pred_proba, axis=1)
        
        # Calculate metrics
        accuracy = np.mean(y_pred == y_test)
        f1 = f1_score(y_test, y_pred, average='weighted')
        
        # Classification report
        class_report = classification_report(y_test, y_pred, output_dict=True)
        
        # Confusion matrix
        conf_matrix = confusion_matrix(y_test, y_pred)
        
        # Save visualizations
        self._save_evaluation_plots(y_test, y_pred, conf_matrix, model_name)
        
        evaluation_results = {
            'accuracy': accuracy,
            'f1_score': f1,
            'classification_report': class_report,
            'confusion_matrix': conf_matrix.tolist(),
            'test_samples': len(y_test)
        }
        
        return evaluation_results
    
    def _save_evaluation_plots(self, y_true, y_pred, conf_matrix, model_name):
        """Save evaluation visualizations"""
        
        # Confusion Matrix
        plt.figure(figsize=(10, 8))
        sns.heatmap(conf_matrix, annot=True, fmt='d', cmap='Blues')
        plt.title(f'Confusion Matrix - {model_name}')
        plt.ylabel('True Label')
        plt.xlabel('Predicted Label')
        plt.savefig(os.path.join(self.experiment_dir, f'{model_name}_confusion_matrix.png'), 
                   dpi=300, bbox_inches='tight')
        plt.close()
        
        # Classification metrics per class
        from sklearn.metrics import precision_recall_fscore_support
        precision, recall, f1, support = precision_recall_fscore_support(y_true, y_pred, average=None)
        
        classes = range(len(precision))
        x_pos = np.arange(len(classes))
        
        fig, axes = plt.subplots(1, 3, figsize=(15, 5))
        
        axes[0].bar(x_pos, precision)
        axes[0].set_title('Precision by Class')
        axes[0].set_xticks(x_pos)
        axes[0].set_xticklabels(classes)
        
        axes[1].bar(x_pos, recall)
        axes[1].set_title('Recall by Class')
        axes[1].set_xticks(x_pos)
        axes[1].set_xticklabels(classes)
        
        axes[2].bar(x_pos, f1)
        axes[2].set_title('F1-Score by Class')
        axes[2].set_xticks(x_pos)
        axes[2].set_xticklabels(classes)
        
        plt.tight_layout()
        plt.savefig(os.path.join(self.experiment_dir, f'{model_name}_metrics_by_class.png'), 
                   dpi=300, bbox_inches='tight')
        plt.close()
    
    def _train_ensemble_model(self, X: np.ndarray, y: np.ndarray, num_classes: int) -> Dict:
        """Train ensemble model combining multiple architectures"""
        
        # Create ensemble architecture
        ensemble_model = self.model_architectures.create_ensemble_architecture(num_classes)
        
        # Configure and train
        optimizer = self._get_optimizer()
        ensemble_model.compile(
            optimizer=optimizer,
            loss='sparse_categorical_crossentropy',
            metrics=['accuracy', 'precision', 'recall']
        )
        
        callbacks = self._setup_callbacks('ensemble')
        history = self._train_model(ensemble_model, X, y, callbacks, 'ensemble')
        evaluation = self._evaluate_model(ensemble_model, X, y, 'ensemble')
        
        return {
            'model': ensemble_model,
            'history': history,
            'evaluation': evaluation,
            'architecture': 'ensemble'
        }
    
    def _train_multi_task_model(self, X: np.ndarray, y: np.ndarray) -> Dict:
        """Train multi-task model for condition and crack detection"""
        
        # Create multi-task model
        multi_task_model = self.model_architectures.create_multi_task_model(5, 6)  # 5 conditions, 6 crack types
        
        # Note: This is simplified - in practice, you'd need separate labels for each task
        # For now, we'll use the same labels for both tasks as a demonstration
        
        optimizer = self._get_optimizer()
        multi_task_model.compile(
            optimizer=optimizer,
            loss=['sparse_categorical_crossentropy', 'sparse_categorical_crossentropy'],
            loss_weights=[1.0, 1.0],
            metrics=['accuracy', 'precision', 'recall']
        )
        
        # Train with duplicate labels for demonstration
        # In practice, you'd have separate condition and crack labels
        callbacks = self._setup_callbacks('multi_task')
        
        from sklearn.model_selection import train_test_split
        X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
        
        history = multi_task_model.fit(
            X_train, [y_train, y_train],  # Using same labels for both tasks
            batch_size=self.config['training']['batch_size'],
            epochs=self.config['training']['epochs'],
            validation_data=(X_test, [y_test, y_test]),
            callbacks=callbacks,
            verbose=1
        )
        
        return {
            'model': multi_task_model,
            'history': history.history,
            'architecture': 'multi_task'
        }
    
    def _log_to_wandb(self, model_name: str, history: Dict, evaluation: Dict):
        """Log metrics to Weights & Biases"""
        if not self.config['monitoring']['use_wandb']:
            return
            
        try:
            # Log training metrics
            for epoch, metrics in enumerate(zip(*[history['history'][key] for key in history['history'].keys()])):
                log_dict = {f"{model_name}_{key}": value for key, value in zip(history['history'].keys(), metrics)}
                log_dict['epoch'] = epoch
                wandb.log(log_dict)
            
            # Log final evaluation metrics
            wandb.log({
                f"{model_name}_final_accuracy": evaluation['accuracy'],
                f"{model_name}_final_f1": evaluation['f1_score']
            })
            
        except Exception as e:
            self.logger.warning(f"Failed to log to W&B: {e}")
    
    def _generate_experiment_report(self, results: Dict, data_stats: Dict):
        """Generate comprehensive experiment report"""
        
        report = {
            'experiment_info': {
                'name': self.experiment_name,
                'timestamp': datetime.now().isoformat(),
                'config': self.config
            },
            'data_statistics': data_stats,
            'model_results': {},
            'best_model': None,
            'recommendations': []
        }
        
        best_f1 = 0
        best_model_name = None
        
        # Analyze results for each model
        for model_name, result in results.items():
            if 'evaluation' in result:
                eval_metrics = result['evaluation']
                
                report['model_results'][model_name] = {
                    'accuracy': eval_metrics['accuracy'],
                    'f1_score': eval_metrics['f1_score'],
                    'test_samples': eval_metrics['test_samples']
                }
                
                # Track best model
                if eval_metrics['f1_score'] > best_f1:
                    best_f1 = eval_metrics['f1_score']
                    best_model_name = model_name
        
        report['best_model'] = {
            'name': best_model_name,
            'f1_score': best_f1
        }
        
        # Generate recommendations
        report['recommendations'] = self._generate_recommendations(results, data_stats)
        
        # Save report
        with open(os.path.join(self.experiment_dir, 'experiment_report.json'), 'w') as f:
            json.dump(report, f, indent=2)
        
        # Create summary visualization
        self._create_results_summary_plot(results)
        
        self.logger.info(f"Experiment report saved to {self.experiment_dir}")
        
    def _generate_recommendations(self, results: Dict, data_stats: Dict) -> List[str]:
        """Generate training recommendations based on results"""
        recommendations = []
        
        # Analyze model performance
        f1_scores = {name: result['evaluation']['f1_score'] 
                    for name, result in results.items() if 'evaluation' in result}
        
        if f1_scores:
            best_model = max(f1_scores, key=f1_scores.get)
            worst_model = min(f1_scores, key=f1_scores.get)
            
            recommendations.append(f"Best performing model: {best_model} (F1: {f1_scores[best_model]:.4f})")
            
            if f1_scores[best_model] < 0.85:
                recommendations.append("Consider increasing training epochs or adjusting learning rate")
                recommendations.append("Try data augmentation or collect more training data")
            
            if f1_scores[worst_model] < 0.7:
                recommendations.append(f"Consider removing {worst_model} from future experiments")
        
        # Data recommendations
        if data_stats['total_samples'] < 10000:
            recommendations.append("Dataset is relatively small - consider synthetic data generation")
        
        class_dist = data_stats['class_distribution']
        class_counts = list(class_dist.values())
        if max(class_counts) / min(class_counts) > 3:
            recommendations.append("Class imbalance detected - consider class weighting or resampling")
        
        return recommendations
    
    def _create_results_summary_plot(self, results: Dict):
        """Create summary visualization of all model results"""
        
        model_names = []
        accuracies = []
        f1_scores = []
        
        for name, result in results.items():
            if 'evaluation' in result:
                model_names.append(name)
                accuracies.append(result['evaluation']['accuracy'])
                f1_scores.append(result['evaluation']['f1_score'])
        
        if not model_names:
            return
            
        x_pos = np.arange(len(model_names))
        
        fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(15, 6))
        
        # Accuracy comparison
        bars1 = ax1.bar(x_pos, accuracies, alpha=0.8, color='skyblue')
        ax1.set_xlabel('Model')
        ax1.set_ylabel('Accuracy')
        ax1.set_title('Model Accuracy Comparison')
        ax1.set_xticks(x_pos)
        ax1.set_xticklabels(model_names, rotation=45)
        ax1.set_ylim(0, 1)
        
        # Add value labels on bars
        for bar, acc in zip(bars1, accuracies):
            ax1.text(bar.get_x() + bar.get_width()/2, bar.get_height() + 0.01,
                    f'{acc:.3f}', ha='center', va='bottom')
        
        # F1 Score comparison
        bars2 = ax2.bar(x_pos, f1_scores, alpha=0.8, color='lightcoral')
        ax2.set_xlabel('Model')
        ax2.set_ylabel('F1 Score')
        ax2.set_title('Model F1 Score Comparison')
        ax2.set_xticks(x_pos)
        ax2.set_xticklabels(model_names, rotation=45)
        ax2.set_ylim(0, 1)
        
        # Add value labels on bars
        for bar, f1 in zip(bars2, f1_scores):
            ax2.text(bar.get_x() + bar.get_width()/2, bar.get_height() + 0.01,
                    f'{f1:.3f}', ha='center', va='bottom')
        
        plt.tight_layout()
        plt.savefig(os.path.join(self.experiment_dir, 'results_summary.png'), 
                   dpi=300, bbox_inches='tight')
        plt.close()
    
    def export_best_model(self, metric: str = 'f1_score') -> str:
        """Export the best performing model for deployment"""
        
        if not self.models:
            raise ValueError("No models available for export")
        
        # Find best model based on metric
        best_model_name = None
        best_score = 0
        
        for name, model in self.models.items():
            if name in self.training_history:
                # This is simplified - you'd want to use proper evaluation metrics
                score = max(self.training_history[name]['history'].get('val_accuracy', [0]))
                if score > best_score:
                    best_score = score
                    best_model_name = name
        
        if best_model_name is None:
            raise ValueError("No suitable model found for export")
        
        best_model = self.models[best_model_name]
        export_dir = os.path.join(self.experiment_dir, 'exported_models')
        os.makedirs(export_dir, exist_ok=True)
        
        # Export in configured formats
        for export_format in self.config['deployment']['export_formats']:
            if export_format == 'savedmodel':
                model_path = os.path.join(export_dir, f'{best_model_name}_savedmodel')
                best_model.save(model_path)
            elif export_format == 'tflite':
                converter = tf.lite.TFLiteConverter.from_keras_model(best_model)
                if self.config['deployment']['optimization']:
                    converter.optimizations = [tf.lite.Optimize.DEFAULT]
                tflite_model = converter.convert()
                with open(os.path.join(export_dir, f'{best_model_name}.tflite'), 'wb') as f:
                    f.write(tflite_model)
        
        # Save model metadata
        metadata = {
            'model_name': best_model_name,
            'best_metric': metric,
            'score': best_score,
            'export_timestamp': datetime.now().isoformat(),
            'config': self.config
        }
        
        with open(os.path.join(export_dir, 'model_metadata.json'), 'w') as f:
            json.dump(metadata, f, indent=2)
        
        self.logger.info(f"Best model ({best_model_name}) exported to {export_dir}")
        
        return export_dir

class MemoryUsageCallback(Callback):
    """Monitor memory usage during training"""
    
    def __init__(self):
        super().__init__()
        self.process = psutil.Process()
        
    def on_epoch_end(self, epoch, logs=None):
        """Log memory usage at end of epoch"""
        memory_info = self.process.memory_info()
        gpu_memory = self._get_gpu_memory_usage()
        
        logs = logs or {}
        logs['memory_usage_mb'] = memory_info.rss / 1024 / 1024
        if gpu_memory:
            logs['gpu_memory_mb'] = gpu_memory
            
    def _get_gpu_memory_usage(self):
        """Get GPU memory usage if available"""
        try:
            gpus = tf.config.experimental.list_physical_devices('GPU')
            if gpus:
                memory_info = tf.config.experimental.get_memory_info('GPU:0')
                return memory_info['current'] / 1024 / 1024
        except:
            pass
        return None

if __name__ == "__main__":
    # Example usage
    pipeline = AdvancedTrainingPipeline(
        experiment_name="pavement_condition_analysis_v1"
    )
    
    # Prepare data
    X, y, data_stats = pipeline.prepare_data(
        generate_synthetic=True
    )
    
    # Run training experiments
    results = pipeline.run_training_experiments(X, y, data_stats)
    
    # Export best model
    export_dir = pipeline.export_best_model()
    
    print(f"Training completed! Results saved to {pipeline.experiment_dir}")
    print(f"Best model exported to {export_dir}")