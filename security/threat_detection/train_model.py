import os
import numpy as np
import pandas as pd
import tensorflow as tf
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import (
    confusion_matrix, 
    classification_report, 
    roc_curve, 
    auc
)
import matplotlib.pyplot as plt
import seaborn as sns

class ThreatDetectionTrainer:
    def __init__(self, input_shape=(10,), random_seed=42):
        """
        Initialize threat detection model trainer
        
        :param input_shape: Shape of input features
        :param random_seed: Seed for reproducibility
        """
        np.random.seed(random_seed)
        tf.random.set_seed(random_seed)
        
        self.input_shape = input_shape
        self.model = self._build_model()
        self.scaler = StandardScaler()
    
    def _build_model(self):
        """
        Construct neural network for threat detection
        
        :return: Compiled TensorFlow model
        """
        model = tf.keras.Sequential([
            # Input layer
            tf.keras.layers.Dense(64, activation='relu', input_shape=self.input_shape),
            tf.keras.layers.BatchNormalization(),
            tf.keras.layers.Dropout(0.3),
            
            # Hidden layers
            tf.keras.layers.Dense(32, activation='relu'),
            tf.keras.layers.BatchNormalization(),
            tf.keras.layers.Dropout(0.2),
            
            tf.keras.layers.Dense(16, activation='relu'),
            tf.keras.layers.BatchNormalization(),
            
            # Output layer
            tf.keras.layers.Dense(1, activation='sigmoid')
        ])
        
        # Advanced optimizer with learning rate scheduling
        optimizer = tf.keras.optimizers.Adam(
            learning_rate=tf.keras.optimizers.schedules.ExponentialDecay(
                initial_learning_rate=0.001,
                decay_steps=10000,
                decay_rate=0.9
            )
        )
        
        model.compile(
            optimizer=optimizer,
            loss='binary_crossentropy',
            metrics=['accuracy', 
                     tf.keras.metrics.Precision(), 
                     tf.keras.metrics.Recall()]
        )
        
        return model
    
    def generate_synthetic_data(self, num_samples=10000):
        """
        Generate synthetic threat detection dataset
        
        :param num_samples: Number of samples to generate
        :return: X (features), y (labels)
        """
        # Simulate complex feature interactions
        X = np.random.rand(num_samples, self.input_shape[0])
        
        # Create non-linear decision boundary
        y = (
            (X[:, 0] > 0.6) & 
            (X[:, 1] < 0.4) | 
            (X[:, 2] > 0.7) & 
            (X[:, 3] < 0.3)
        ).astype(int)
        
        return X, y
    
    def prepare_data(self, X, y, test_size=0.2):
        """
        Prepare and split data for training
        
        :param X: Input features
        :param y: Labels
        :param test_size: Proportion of test data
        :return: Scaled train and test sets
        """
        X_scaled = self.scaler.fit_transform(X)
        return train_test_split(X_scaled, y, test_size=test_size, stratify=y)
    
    def train(self, X_train, y_train, epochs=50, batch_size=32):
        """
        Train the threat detection model
        
        :param X_train: Training features
        :param y_train: Training labels
        :param epochs: Number of training epochs
        :param batch_size: Batch size for training
        :return: Training history
        """
        early_stopping = tf.keras.callbacks.EarlyStopping(
            monitor='val_loss', 
            patience=10, 
            restore_best_weights=True
        )
        
        return self.model.fit(
            X_train, y_train, 
            validation_split=0.2,
            epochs=epochs,
            batch_size=batch_size,
            callbacks=[early_stopping],
            verbose=1
        )
    
    def evaluate(self, X_test, y_test):
        """
        Evaluate model performance
        
        :param X_test: Test features
        :param y_test: Test labels
        :return: Evaluation metrics
        """
        results = self.model.evaluate(X_test, y_test, verbose=0)
        y_pred = (self.model.predict(X_test) > 0.5).astype(int)
        
        print("\n--- Model Performance Metrics ---")
        print(f"Loss: {results[0]:.4f}")
        print(f"Accuracy: {results[1]:.4f}")
        print(f"Precision: {results[2]:.4f}")
        print(f"Recall: {results[3]:.4f}")
        
        print("\n--- Classification Report ---")
        print(classification_report(y_test, y_pred))
        
        return results
    
    def plot_roc_curve(self, X_test, y_test):
        """
        Plot ROC curve for model performance visualization
        
        :param X_test: Test features
        :param y_test: Test labels
        """
        y_pred_proba = self.model.predict(X_test).ravel()
        fpr, tpr, thresholds = roc_curve(y_test, y_pred_proba)
        roc_auc = auc(fpr, tpr)
        
        plt.figure(figsize=(10, 6))
        plt.plot(fpr, tpr, color='darkorange', lw=2, 
                 label=f'ROC curve (AUC = {roc_auc:.2f})')
        plt.plot([0, 1], [0, 1], color='navy', lw=2, linestyle='--')
        plt.xlim([0.0, 1.0])
        plt.ylim([0.0, 1.05])
        plt.xlabel('False Positive Rate')
        plt.ylabel('True Positive Rate')
        plt.title('Receiver Operating Characteristic (ROC) Curve')
        plt.legend(loc="lower right")
        
        # Ensure plots directory exists
        os.makedirs('plots', exist_ok=True)
        plt.savefig('plots/roc_curve.png')
        plt.close()
    
    def save_model(self, path='models/threat_detection_model'):
        """
        Save trained model and scaler
        
        :param path: Directory to save model
        """
        os.makedirs(path, exist_ok=True)
        self.model.save(f'{path}/model.h5')
        
        import joblib
        joblib.dump(self.scaler, f'{path}/scaler.joblib')

def main():
    # Initialize and train threat detection model
    trainer = ThreatDetectionTrainer(input_shape=(10,))
    
    # Generate synthetic data
    X, y = trainer.generate_synthetic_data()
    
    # Prepare data
    X_train, X_test, y_train, y_test = trainer.prepare_data(X, y)
    
    # Train model
    history = trainer.train(X_train, y_train)
    
    # Evaluate model
    trainer.evaluate(X_test, y_test)
    
    # Plot ROC curve
    trainer.plot_roc_curve(X_test, y_test)
    
    # Save model
    trainer.save_model()

if __name__ == "__main__":
    main()