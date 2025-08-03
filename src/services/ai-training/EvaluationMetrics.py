#!/usr/bin/env python3
"""
PaveMaster Suite - Comprehensive Evaluation Metrics
Advanced evaluation and visualization system for pavement AI models
"""

import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns
from sklearn.metrics import (
    accuracy_score, precision_score, recall_score, f1_score,
    classification_report, confusion_matrix, roc_curve, auc,
    precision_recall_curve, average_precision_score,
    cohen_kappa_score, matthews_corrcoef, log_loss
)
from sklearn.preprocessing import LabelBinarizer
import tensorflow as tf
from typing import Dict, List, Tuple, Optional, Any
import json
import os
from datetime import datetime
import warnings
warnings.filterwarnings('ignore')

class PavementEvaluationMetrics:
    """
    Comprehensive evaluation metrics for pavement condition analysis models
    """
    
    def __init__(self, class_names: List[str] = None):
        self.class_names = class_names or [
            'excellent', 'good', 'fair', 'poor', 'failed'
        ]
        self.crack_types = [
            'no_cracks', 'longitudinal', 'transverse', 
            'alligator', 'block', 'pothole'
        ]
        
    def evaluate_model(self, 
                      model: tf.keras.Model,
                      X_test: np.ndarray,
                      y_test: np.ndarray,
                      y_pred_proba: np.ndarray = None,
                      save_dir: str = './evaluation_results') -> Dict:
        """
        Comprehensive model evaluation with multiple metrics
        """
        
        # Create results directory
        os.makedirs(save_dir, exist_ok=True)
        
        # Get predictions if not provided
        if y_pred_proba is None:
            y_pred_proba = model.predict(X_test)
        
        y_pred = np.argmax(y_pred_proba, axis=1)
        
        # Basic metrics
        basic_metrics = self._calculate_basic_metrics(y_test, y_pred, y_pred_proba)
        
        # Per-class metrics
        per_class_metrics = self._calculate_per_class_metrics(y_test, y_pred)
        
        # Advanced metrics
        advanced_metrics = self._calculate_advanced_metrics(y_test, y_pred, y_pred_proba)
        
        # Threshold analysis
        threshold_analysis = self._analyze_thresholds(y_test, y_pred_proba)
        
        # Generate visualizations
        self._generate_visualizations(y_test, y_pred, y_pred_proba, save_dir)
        
        # Pavement-specific analysis
        pavement_analysis = self._pavement_specific_analysis(y_test, y_pred, y_pred_proba)
        
        # Compile results
        evaluation_results = {
            'basic_metrics': basic_metrics,
            'per_class_metrics': per_class_metrics,
            'advanced_metrics': advanced_metrics,
            'threshold_analysis': threshold_analysis,
            'pavement_analysis': pavement_analysis,
            'evaluation_timestamp': datetime.now().isoformat(),
            'test_samples': len(y_test)
        }
        
        # Save results
        self._save_evaluation_report(evaluation_results, save_dir)
        
        return evaluation_results
    
    def _calculate_basic_metrics(self, 
                                y_true: np.ndarray, 
                                y_pred: np.ndarray,
                                y_pred_proba: np.ndarray) -> Dict:
        """Calculate basic classification metrics"""
        
        return {
            'accuracy': accuracy_score(y_true, y_pred),
            'precision_macro': precision_score(y_true, y_pred, average='macro'),
            'precision_micro': precision_score(y_true, y_pred, average='micro'),
            'precision_weighted': precision_score(y_true, y_pred, average='weighted'),
            'recall_macro': recall_score(y_true, y_pred, average='macro'),
            'recall_micro': recall_score(y_true, y_pred, average='micro'),
            'recall_weighted': recall_score(y_true, y_pred, average='weighted'),
            'f1_macro': f1_score(y_true, y_pred, average='macro'),
            'f1_micro': f1_score(y_true, y_pred, average='micro'),
            'f1_weighted': f1_score(y_true, y_pred, average='weighted'),
            'log_loss': log_loss(y_true, y_pred_proba),
            'cohen_kappa': cohen_kappa_score(y_true, y_pred),
            'matthews_corrcoef': matthews_corrcoef(y_true, y_pred)
        }
    
    def _calculate_per_class_metrics(self, 
                                   y_true: np.ndarray, 
                                   y_pred: np.ndarray) -> Dict:
        """Calculate per-class metrics"""
        
        # Classification report
        class_report = classification_report(
            y_true, y_pred, 
            target_names=self.class_names[:len(np.unique(y_true))],
            output_dict=True
        )
        
        # Per-class confusion matrix analysis
        conf_matrix = confusion_matrix(y_true, y_pred)
        
        per_class_analysis = {}
        for i, class_name in enumerate(self.class_names[:len(np.unique(y_true))]):
            if i < len(conf_matrix):
                # True/False Positives/Negatives for each class
                tp = conf_matrix[i, i]
                fp = conf_matrix[:, i].sum() - tp
                fn = conf_matrix[i, :].sum() - tp
                tn = conf_matrix.sum() - tp - fp - fn
                
                # Specificity and other metrics
                specificity = tn / (tn + fp) if (tn + fp) > 0 else 0
                sensitivity = tp / (tp + fn) if (tp + fn) > 0 else 0  # Same as recall
                npv = tn / (tn + fn) if (tn + fn) > 0 else 0  # Negative Predictive Value
                
                per_class_analysis[class_name] = {
                    'true_positives': int(tp),
                    'false_positives': int(fp),
                    'true_negatives': int(tn),
                    'false_negatives': int(fn),
                    'specificity': specificity,
                    'sensitivity': sensitivity,
                    'negative_predictive_value': npv,
                    'precision': class_report[class_name]['precision'],
                    'recall': class_report[class_name]['recall'],
                    'f1_score': class_report[class_name]['f1-score'],
                    'support': class_report[class_name]['support']
                }
        
        return {
            'classification_report': class_report,
            'per_class_analysis': per_class_analysis,
            'confusion_matrix': conf_matrix.tolist()
        }
    
    def _calculate_advanced_metrics(self, 
                                  y_true: np.ndarray, 
                                  y_pred: np.ndarray,
                                  y_pred_proba: np.ndarray) -> Dict:
        """Calculate advanced metrics including ROC-AUC and PR-AUC"""
        
        advanced_metrics = {}
        
        # Multi-class ROC-AUC
        try:
            # Binarize labels for multi-class ROC
            lb = LabelBinarizer()
            y_true_bin = lb.fit_transform(y_true)
            
            if y_true_bin.shape[1] == 1:  # Binary case
                y_true_bin = np.hstack([1 - y_true_bin, y_true_bin])
            
            # Calculate ROC-AUC for each class
            roc_auc_scores = {}
            pr_auc_scores = {}
            
            for i, class_name in enumerate(self.class_names[:y_pred_proba.shape[1]]):
                if i < y_true_bin.shape[1]:
                    # ROC-AUC
                    fpr, tpr, _ = roc_curve(y_true_bin[:, i], y_pred_proba[:, i])
                    roc_auc_scores[class_name] = auc(fpr, tpr)
                    
                    # Precision-Recall AUC
                    precision, recall, _ = precision_recall_curve(y_true_bin[:, i], y_pred_proba[:, i])
                    pr_auc_scores[class_name] = auc(recall, precision)
            
            advanced_metrics['roc_auc_per_class'] = roc_auc_scores
            advanced_metrics['pr_auc_per_class'] = pr_auc_scores
            advanced_metrics['roc_auc_macro'] = np.mean(list(roc_auc_scores.values()))
            advanced_metrics['pr_auc_macro'] = np.mean(list(pr_auc_scores.values()))
            
        except Exception as e:
            print(f"Warning: Could not calculate ROC-AUC metrics: {e}")
            advanced_metrics['roc_auc_error'] = str(e)
        
        # Top-k accuracy
        advanced_metrics['top_2_accuracy'] = self._top_k_accuracy(y_true, y_pred_proba, k=2)
        advanced_metrics['top_3_accuracy'] = self._top_k_accuracy(y_true, y_pred_proba, k=3)
        
        # Confidence analysis
        confidence_analysis = self._analyze_prediction_confidence(y_true, y_pred, y_pred_proba)
        advanced_metrics['confidence_analysis'] = confidence_analysis
        
        return advanced_metrics
    
    def _top_k_accuracy(self, y_true: np.ndarray, y_pred_proba: np.ndarray, k: int) -> float:
        """Calculate top-k accuracy"""
        top_k_predictions = np.argsort(y_pred_proba, axis=1)[:, -k:]
        correct = 0
        for i, true_label in enumerate(y_true):
            if true_label in top_k_predictions[i]:
                correct += 1
        return correct / len(y_true)
    
    def _analyze_prediction_confidence(self, 
                                     y_true: np.ndarray, 
                                     y_pred: np.ndarray,
                                     y_pred_proba: np.ndarray) -> Dict:
        """Analyze prediction confidence patterns"""
        
        max_probs = np.max(y_pred_proba, axis=1)
        correct_predictions = (y_true == y_pred)
        
        # Confidence statistics
        confidence_stats = {
            'mean_confidence_correct': np.mean(max_probs[correct_predictions]),
            'mean_confidence_incorrect': np.mean(max_probs[~correct_predictions]),
            'std_confidence_correct': np.std(max_probs[correct_predictions]),
            'std_confidence_incorrect': np.std(max_probs[~correct_predictions]),
            'median_confidence_correct': np.median(max_probs[correct_predictions]),
            'median_confidence_incorrect': np.median(max_probs[~correct_predictions])
        }
        
        # Confidence-based accuracy at different thresholds
        thresholds = [0.5, 0.6, 0.7, 0.8, 0.9]
        confidence_accuracy = {}
        
        for threshold in thresholds:
            high_conf_mask = max_probs >= threshold
            if np.sum(high_conf_mask) > 0:
                high_conf_accuracy = np.mean(correct_predictions[high_conf_mask])
                confidence_accuracy[f'accuracy_at_{threshold}'] = {
                    'accuracy': high_conf_accuracy,
                    'samples': int(np.sum(high_conf_mask)),
                    'percentage_samples': np.sum(high_conf_mask) / len(y_true) * 100
                }
        
        return {
            'confidence_statistics': confidence_stats,
            'confidence_accuracy': confidence_accuracy
        }
    
    def _analyze_thresholds(self, 
                          y_true: np.ndarray, 
                          y_pred_proba: np.ndarray) -> Dict:
        """Analyze optimal thresholds for each class"""
        
        threshold_analysis = {}
        
        # Binarize for threshold analysis
        lb = LabelBinarizer()
        y_true_bin = lb.fit_transform(y_true)
        
        if y_true_bin.shape[1] == 1:  # Binary case
            y_true_bin = np.hstack([1 - y_true_bin, y_true_bin])
        
        for i, class_name in enumerate(self.class_names[:min(len(self.class_names), y_pred_proba.shape[1])]):
            if i < y_true_bin.shape[1]:
                # Calculate precision-recall curve
                precision, recall, thresholds = precision_recall_curve(
                    y_true_bin[:, i], y_pred_proba[:, i]
                )
                
                # Find optimal threshold (maximize F1)
                f1_scores = 2 * (precision * recall) / (precision + recall + 1e-8)
                optimal_idx = np.argmax(f1_scores)
                
                threshold_analysis[class_name] = {
                    'optimal_threshold': float(thresholds[optimal_idx]) if optimal_idx < len(thresholds) else 0.5,
                    'optimal_f1': float(f1_scores[optimal_idx]),
                    'optimal_precision': float(precision[optimal_idx]),
                    'optimal_recall': float(recall[optimal_idx])
                }
        
        return threshold_analysis
    
    def _pavement_specific_analysis(self, 
                                  y_true: np.ndarray, 
                                  y_pred: np.ndarray,
                                  y_pred_proba: np.ndarray) -> Dict:
        """Pavement-specific analysis and insights"""
        
        analysis = {}
        
        # Severity progression analysis
        severity_mapping = {0: 'excellent', 1: 'good', 2: 'fair', 3: 'poor', 4: 'failed'}
        severity_errors = self._analyze_severity_errors(y_true, y_pred, severity_mapping)
        analysis['severity_progression_errors'] = severity_errors
        
        # Critical misclassification analysis
        critical_errors = self._identify_critical_errors(y_true, y_pred)
        analysis['critical_misclassifications'] = critical_errors
        
        # Maintenance priority analysis
        maintenance_analysis = self._maintenance_priority_analysis(y_true, y_pred, y_pred_proba)
        analysis['maintenance_priority'] = maintenance_analysis
        
        # Economic impact analysis
        economic_impact = self._calculate_economic_impact(y_true, y_pred)
        analysis['economic_impact'] = economic_impact
        
        return analysis
    
    def _analyze_severity_errors(self, 
                                y_true: np.ndarray, 
                                y_pred: np.ndarray,
                                severity_mapping: Dict) -> Dict:
        """Analyze how far off predictions are in terms of severity"""
        
        severity_errors = {
            'off_by_one': 0,
            'off_by_two': 0,
            'off_by_more': 0,
            'overestimation': 0,
            'underestimation': 0
        }
        
        differences = y_pred - y_true
        
        for diff in differences:
            abs_diff = abs(diff)
            if abs_diff == 1:
                severity_errors['off_by_one'] += 1
            elif abs_diff == 2:
                severity_errors['off_by_two'] += 1
            elif abs_diff > 2:
                severity_errors['off_by_more'] += 1
            
            if diff > 0:
                severity_errors['overestimation'] += 1
            elif diff < 0:
                severity_errors['underestimation'] += 1
        
        # Convert to percentages
        total_samples = len(y_true)
        for key in severity_errors:
            severity_errors[key] = {
                'count': severity_errors[key],
                'percentage': severity_errors[key] / total_samples * 100
            }
        
        return severity_errors
    
    def _identify_critical_errors(self, y_true: np.ndarray, y_pred: np.ndarray) -> Dict:
        """Identify critical misclassifications that could lead to safety issues"""
        
        critical_errors = {
            'failed_classified_as_good': 0,
            'poor_classified_as_excellent': 0,
            'good_classified_as_failed': 0,
            'excellent_classified_as_poor': 0
        }
        
        for true_label, pred_label in zip(y_true, y_pred):
            # Critical underestimation (dangerous)
            if true_label == 4 and pred_label <= 1:  # Failed classified as excellent/good
                critical_errors['failed_classified_as_good'] += 1
            elif true_label == 3 and pred_label == 0:  # Poor classified as excellent
                critical_errors['poor_classified_as_excellent'] += 1
            
            # Critical overestimation (wasteful)
            elif true_label <= 1 and pred_label == 4:  # Good/excellent classified as failed
                critical_errors['good_classified_as_failed'] += 1
            elif true_label == 0 and pred_label == 3:  # Excellent classified as poor
                critical_errors['excellent_classified_as_poor'] += 1
        
        total_samples = len(y_true)
        for key in critical_errors:
            critical_errors[key] = {
                'count': critical_errors[key],
                'percentage': critical_errors[key] / total_samples * 100
            }
        
        return critical_errors
    
    def _maintenance_priority_analysis(self, 
                                     y_true: np.ndarray, 
                                     y_pred: np.ndarray,
                                     y_pred_proba: np.ndarray) -> Dict:
        """Analyze how well the model prioritizes maintenance needs"""
        
        # Define maintenance urgency levels
        urgency_levels = {
            0: 'low',      # excellent
            1: 'low',      # good  
            2: 'medium',   # fair
            3: 'high',     # poor
            4: 'critical'  # failed
        }
        
        true_urgency = [urgency_levels[label] for label in y_true]
        pred_urgency = [urgency_levels[label] for label in y_pred]
        
        urgency_accuracy = {}
        for urgency in ['low', 'medium', 'high', 'critical']:
            true_mask = np.array(true_urgency) == urgency
            if np.sum(true_mask) > 0:
                pred_mask = np.array(pred_urgency) == urgency
                accuracy = np.sum(true_mask & pred_mask) / np.sum(true_mask)
                urgency_accuracy[urgency] = {
                    'accuracy': accuracy,
                    'true_count': int(np.sum(true_mask)),
                    'predicted_count': int(np.sum(pred_mask))
                }
        
        return {
            'urgency_level_accuracy': urgency_accuracy
        }
    
    def _calculate_economic_impact(self, y_true: np.ndarray, y_pred: np.ndarray) -> Dict:
        """Calculate economic impact of misclassifications"""
        
        # Hypothetical cost matrix (cost of treating condition X as condition Y)
        # Rows: true condition, Columns: predicted condition
        cost_matrix = np.array([
            [0, 50, 100, 500, 1000],      # excellent misclassified as...
            [100, 0, 50, 400, 900],       # good misclassified as...
            [300, 100, 0, 200, 700],      # fair misclassified as...
            [800, 500, 300, 0, 300],      # poor misclassified as...
            [2000, 1500, 1000, 500, 0]   # failed misclassified as...
        ])
        
        total_cost = 0
        cost_breakdown = {}
        
        for true_label, pred_label in zip(y_true, y_pred):
            if true_label < len(cost_matrix) and pred_label < len(cost_matrix[0]):
                cost = cost_matrix[true_label, pred_label]
                total_cost += cost
                
                key = f"true_{true_label}_pred_{pred_label}"
                if key not in cost_breakdown:
                    cost_breakdown[key] = {'count': 0, 'total_cost': 0}
                cost_breakdown[key]['count'] += 1
                cost_breakdown[key]['total_cost'] += cost
        
        return {
            'total_economic_impact': total_cost,
            'average_cost_per_sample': total_cost / len(y_true),
            'cost_breakdown': cost_breakdown
        }
    
    def _generate_visualizations(self, 
                               y_true: np.ndarray, 
                               y_pred: np.ndarray,
                               y_pred_proba: np.ndarray,
                               save_dir: str):
        """Generate comprehensive visualizations"""
        
        # Set style
        plt.style.use('default')
        sns.set_palette("husl")
        
        # 1. Confusion Matrix
        self._plot_confusion_matrix(y_true, y_pred, save_dir)
        
        # 2. Per-class metrics
        self._plot_per_class_metrics(y_true, y_pred, save_dir)
        
        # 3. ROC Curves
        self._plot_roc_curves(y_true, y_pred_proba, save_dir)
        
        # 4. Precision-Recall Curves
        self._plot_precision_recall_curves(y_true, y_pred_proba, save_dir)
        
        # 5. Prediction confidence distribution
        self._plot_confidence_distribution(y_true, y_pred, y_pred_proba, save_dir)
        
        # 6. Error analysis
        self._plot_error_analysis(y_true, y_pred, save_dir)
        
        # 7. Pavement-specific visualizations
        self._plot_pavement_analysis(y_true, y_pred, y_pred_proba, save_dir)
    
    def _plot_confusion_matrix(self, y_true: np.ndarray, y_pred: np.ndarray, save_dir: str):
        """Plot enhanced confusion matrix"""
        
        conf_matrix = confusion_matrix(y_true, y_pred)
        
        # Normalize confusion matrix
        conf_matrix_norm = conf_matrix.astype('float') / conf_matrix.sum(axis=1)[:, np.newaxis]
        
        fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(15, 6))
        
        # Raw counts
        sns.heatmap(conf_matrix, annot=True, fmt='d', cmap='Blues', ax=ax1,
                   xticklabels=self.class_names[:len(np.unique(y_true))],
                   yticklabels=self.class_names[:len(np.unique(y_true))])
        ax1.set_title('Confusion Matrix (Counts)')
        ax1.set_xlabel('Predicted')
        ax1.set_ylabel('Actual')
        
        # Normalized
        sns.heatmap(conf_matrix_norm, annot=True, fmt='.2f', cmap='Blues', ax=ax2,
                   xticklabels=self.class_names[:len(np.unique(y_true))],
                   yticklabels=self.class_names[:len(np.unique(y_true))])
        ax2.set_title('Confusion Matrix (Normalized)')
        ax2.set_xlabel('Predicted')
        ax2.set_ylabel('Actual')
        
        plt.tight_layout()
        plt.savefig(os.path.join(save_dir, 'confusion_matrix.png'), dpi=300, bbox_inches='tight')
        plt.close()
    
    def _plot_per_class_metrics(self, y_true: np.ndarray, y_pred: np.ndarray, save_dir: str):
        """Plot per-class performance metrics"""
        
        from sklearn.metrics import precision_recall_fscore_support
        
        precision, recall, f1, support = precision_recall_fscore_support(
            y_true, y_pred, average=None
        )
        
        classes = self.class_names[:len(precision)]
        x_pos = np.arange(len(classes))
        
        fig, ((ax1, ax2), (ax3, ax4)) = plt.subplots(2, 2, figsize=(15, 10))
        
        # Precision
        bars1 = ax1.bar(x_pos, precision, alpha=0.8, color='skyblue')
        ax1.set_xlabel('Class')
        ax1.set_ylabel('Precision')
        ax1.set_title('Precision by Class')
        ax1.set_xticks(x_pos)
        ax1.set_xticklabels(classes, rotation=45)
        ax1.set_ylim(0, 1)
        
        # Add value labels
        for bar, val in zip(bars1, precision):
            ax1.text(bar.get_x() + bar.get_width()/2, bar.get_height() + 0.01,
                    f'{val:.3f}', ha='center', va='bottom')
        
        # Recall
        bars2 = ax2.bar(x_pos, recall, alpha=0.8, color='lightcoral')
        ax2.set_xlabel('Class')
        ax2.set_ylabel('Recall')
        ax2.set_title('Recall by Class')
        ax2.set_xticks(x_pos)
        ax2.set_xticklabels(classes, rotation=45)
        ax2.set_ylim(0, 1)
        
        for bar, val in zip(bars2, recall):
            ax2.text(bar.get_x() + bar.get_width()/2, bar.get_height() + 0.01,
                    f'{val:.3f}', ha='center', va='bottom')
        
        # F1-Score
        bars3 = ax3.bar(x_pos, f1, alpha=0.8, color='lightgreen')
        ax3.set_xlabel('Class')
        ax3.set_ylabel('F1-Score')
        ax3.set_title('F1-Score by Class')
        ax3.set_xticks(x_pos)
        ax3.set_xticklabels(classes, rotation=45)
        ax3.set_ylim(0, 1)
        
        for bar, val in zip(bars3, f1):
            ax3.text(bar.get_x() + bar.get_width()/2, bar.get_height() + 0.01,
                    f'{val:.3f}', ha='center', va='bottom')
        
        # Support
        bars4 = ax4.bar(x_pos, support, alpha=0.8, color='gold')
        ax4.set_xlabel('Class')
        ax4.set_ylabel('Support (Count)')
        ax4.set_title('Support by Class')
        ax4.set_xticks(x_pos)
        ax4.set_xticklabels(classes, rotation=45)
        
        for bar, val in zip(bars4, support):
            ax4.text(bar.get_x() + bar.get_width()/2, bar.get_height() + 0.01,
                    f'{int(val)}', ha='center', va='bottom')
        
        plt.tight_layout()
        plt.savefig(os.path.join(save_dir, 'per_class_metrics.png'), dpi=300, bbox_inches='tight')
        plt.close()
    
    def _plot_roc_curves(self, y_true: np.ndarray, y_pred_proba: np.ndarray, save_dir: str):
        """Plot ROC curves for each class"""
        
        try:
            from sklearn.preprocessing import LabelBinarizer
            
            lb = LabelBinarizer()
            y_true_bin = lb.fit_transform(y_true)
            
            if y_true_bin.shape[1] == 1:
                y_true_bin = np.hstack([1 - y_true_bin, y_true_bin])
            
            plt.figure(figsize=(10, 8))
            
            for i, class_name in enumerate(self.class_names[:min(len(self.class_names), y_pred_proba.shape[1])]):
                if i < y_true_bin.shape[1]:
                    fpr, tpr, _ = roc_curve(y_true_bin[:, i], y_pred_proba[:, i])
                    roc_auc = auc(fpr, tpr)
                    
                    plt.plot(fpr, tpr, linewidth=2, 
                            label=f'{class_name} (AUC = {roc_auc:.3f})')
            
            plt.plot([0, 1], [0, 1], 'k--', linewidth=2, label='Random')
            plt.xlim([0.0, 1.0])
            plt.ylim([0.0, 1.05])
            plt.xlabel('False Positive Rate')
            plt.ylabel('True Positive Rate')
            plt.title('ROC Curves by Class')
            plt.legend(loc="lower right")
            plt.grid(True)
            
            plt.savefig(os.path.join(save_dir, 'roc_curves.png'), dpi=300, bbox_inches='tight')
            plt.close()
            
        except Exception as e:
            print(f"Warning: Could not plot ROC curves: {e}")
    
    def _plot_precision_recall_curves(self, y_true: np.ndarray, y_pred_proba: np.ndarray, save_dir: str):
        """Plot Precision-Recall curves for each class"""
        
        try:
            from sklearn.preprocessing import LabelBinarizer
            
            lb = LabelBinarizer()
            y_true_bin = lb.fit_transform(y_true)
            
            if y_true_bin.shape[1] == 1:
                y_true_bin = np.hstack([1 - y_true_bin, y_true_bin])
            
            plt.figure(figsize=(10, 8))
            
            for i, class_name in enumerate(self.class_names[:min(len(self.class_names), y_pred_proba.shape[1])]):
                if i < y_true_bin.shape[1]:
                    precision, recall, _ = precision_recall_curve(y_true_bin[:, i], y_pred_proba[:, i])
                    avg_precision = average_precision_score(y_true_bin[:, i], y_pred_proba[:, i])
                    
                    plt.plot(recall, precision, linewidth=2,
                            label=f'{class_name} (AP = {avg_precision:.3f})')
            
            plt.xlim([0.0, 1.0])
            plt.ylim([0.0, 1.05])
            plt.xlabel('Recall')
            plt.ylabel('Precision')
            plt.title('Precision-Recall Curves by Class')
            plt.legend(loc="lower left")
            plt.grid(True)
            
            plt.savefig(os.path.join(save_dir, 'precision_recall_curves.png'), dpi=300, bbox_inches='tight')
            plt.close()
            
        except Exception as e:
            print(f"Warning: Could not plot PR curves: {e}")
    
    def _plot_confidence_distribution(self, 
                                    y_true: np.ndarray, 
                                    y_pred: np.ndarray,
                                    y_pred_proba: np.ndarray,
                                    save_dir: str):
        """Plot prediction confidence distributions"""
        
        max_probs = np.max(y_pred_proba, axis=1)
        correct = y_true == y_pred
        
        plt.figure(figsize=(12, 8))
        
        # Subplot 1: Overall confidence distribution
        plt.subplot(2, 2, 1)
        plt.hist(max_probs[correct], bins=30, alpha=0.7, label='Correct', color='green')
        plt.hist(max_probs[~correct], bins=30, alpha=0.7, label='Incorrect', color='red')
        plt.xlabel('Prediction Confidence')
        plt.ylabel('Frequency')
        plt.title('Confidence Distribution by Correctness')
        plt.legend()
        plt.grid(True, alpha=0.3)
        
        # Subplot 2: Confidence vs Accuracy
        plt.subplot(2, 2, 2)
        conf_bins = np.linspace(0, 1, 11)
        bin_accuracies = []
        bin_counts = []
        
        for i in range(len(conf_bins) - 1):
            mask = (max_probs >= conf_bins[i]) & (max_probs < conf_bins[i + 1])
            if np.sum(mask) > 0:
                bin_accuracies.append(np.mean(correct[mask]))
                bin_counts.append(np.sum(mask))
            else:
                bin_accuracies.append(0)
                bin_counts.append(0)
        
        bin_centers = (conf_bins[:-1] + conf_bins[1:]) / 2
        plt.plot(bin_centers, bin_accuracies, 'o-', linewidth=2, markersize=8)
        plt.plot([0, 1], [0, 1], 'k--', alpha=0.5, label='Perfect Calibration')
        plt.xlabel('Confidence')
        plt.ylabel('Accuracy')
        plt.title('Confidence vs Accuracy (Calibration)')
        plt.legend()
        plt.grid(True, alpha=0.3)
        
        # Subplot 3: Per-class confidence
        plt.subplot(2, 2, 3)
        class_confidences = []
        class_labels = []
        
        for class_idx in range(len(self.class_names[:len(np.unique(y_true))])):
            mask = y_true == class_idx
            if np.sum(mask) > 0:
                class_confidences.extend(max_probs[mask])
                class_labels.extend([self.class_names[class_idx]] * np.sum(mask))
        
        if class_confidences:
            df_conf = pd.DataFrame({
                'confidence': class_confidences,
                'class': class_labels
            })
            sns.boxplot(data=df_conf, x='class', y='confidence')
            plt.xticks(rotation=45)
            plt.title('Confidence Distribution by Class')
            plt.ylabel('Prediction Confidence')
        
        # Subplot 4: Confidence threshold analysis
        plt.subplot(2, 2, 4)
        thresholds = np.linspace(0.1, 0.9, 9)
        accuracies = []
        coverages = []
        
        for threshold in thresholds:
            high_conf_mask = max_probs >= threshold
            if np.sum(high_conf_mask) > 0:
                accuracies.append(np.mean(correct[high_conf_mask]))
                coverages.append(np.sum(high_conf_mask) / len(max_probs))
            else:
                accuracies.append(0)
                coverages.append(0)
        
        ax = plt.gca()
        ax2 = ax.twinx()
        
        line1 = ax.plot(thresholds, accuracies, 'b-o', label='Accuracy')
        line2 = ax2.plot(thresholds, coverages, 'r-s', label='Coverage')
        
        ax.set_xlabel('Confidence Threshold')
        ax.set_ylabel('Accuracy', color='b')
        ax2.set_ylabel('Coverage', color='r')
        ax.set_title('Accuracy vs Coverage by Threshold')
        
        lines = line1 + line2
        labels = [l.get_label() for l in lines]
        ax.legend(lines, labels, loc='center right')
        
        plt.tight_layout()
        plt.savefig(os.path.join(save_dir, 'confidence_analysis.png'), dpi=300, bbox_inches='tight')
        plt.close()
    
    def _plot_error_analysis(self, y_true: np.ndarray, y_pred: np.ndarray, save_dir: str):
        """Plot error analysis visualizations"""
        
        fig, ((ax1, ax2), (ax3, ax4)) = plt.subplots(2, 2, figsize=(15, 12))
        
        # Error distribution by severity
        errors = y_pred - y_true
        ax1.hist(errors, bins=range(min(errors)-1, max(errors)+2), alpha=0.7, color='orange', edgecolor='black')
        ax1.set_xlabel('Prediction Error (Predicted - True)')
        ax1.set_ylabel('Frequency')
        ax1.set_title('Error Distribution')
        ax1.grid(True, alpha=0.3)
        
        # Error heatmap
        max_class = max(max(y_true), max(y_pred))
        error_matrix = np.zeros((max_class + 1, max_class + 1))
        
        for true_val, pred_val in zip(y_true, y_pred):
            error_matrix[true_val, pred_val] += 1
        
        # Normalize by row (true class)
        error_matrix_norm = error_matrix / (error_matrix.sum(axis=1, keepdims=True) + 1e-8)
        
        im = ax2.imshow(error_matrix_norm, cmap='Reds', aspect='auto')
        ax2.set_xlabel('Predicted Class')
        ax2.set_ylabel('True Class')
        ax2.set_title('Error Pattern Heatmap (Normalized)')
        
        # Add text annotations
        for i in range(error_matrix_norm.shape[0]):
            for j in range(error_matrix_norm.shape[1]):
                text = ax2.text(j, i, f'{error_matrix_norm[i, j]:.2f}',
                               ha="center", va="center", color="black" if error_matrix_norm[i, j] < 0.5 else "white")
        
        plt.colorbar(im, ax=ax2)
        
        # Severity progression errors
        severity_errors = {
            'Overestimation': np.sum(errors > 0),
            'Underestimation': np.sum(errors < 0),
            'Correct': np.sum(errors == 0)
        }
        
        ax3.pie(severity_errors.values(), labels=severity_errors.keys(), autopct='%1.1f%%', startangle=90)
        ax3.set_title('Prediction Error Types')
        
        # Error magnitude distribution
        abs_errors = np.abs(errors)
        error_counts = np.bincount(abs_errors)
        error_magnitudes = range(len(error_counts))
        
        ax4.bar(error_magnitudes, error_counts, alpha=0.7, color='red', edgecolor='black')
        ax4.set_xlabel('Error Magnitude (|Predicted - True|)')
        ax4.set_ylabel('Frequency')
        ax4.set_title('Error Magnitude Distribution')
        ax4.grid(True, alpha=0.3)
        
        plt.tight_layout()
        plt.savefig(os.path.join(save_dir, 'error_analysis.png'), dpi=300, bbox_inches='tight')
        plt.close()
    
    def _plot_pavement_analysis(self, 
                              y_true: np.ndarray, 
                              y_pred: np.ndarray,
                              y_pred_proba: np.ndarray,
                              save_dir: str):
        """Plot pavement-specific analysis"""
        
        fig, ((ax1, ax2), (ax3, ax4)) = plt.subplots(2, 2, figsize=(15, 12))
        
        # Maintenance urgency confusion
        urgency_mapping = {0: 'Low', 1: 'Low', 2: 'Medium', 3: 'High', 4: 'Critical'}
        true_urgency = [urgency_mapping[x] for x in y_true]
        pred_urgency = [urgency_mapping[x] for x in y_pred]
        
        urgency_labels = ['Low', 'Medium', 'High', 'Critical']
        urgency_matrix = confusion_matrix(true_urgency, pred_urgency, labels=urgency_labels)
        
        sns.heatmap(urgency_matrix, annot=True, fmt='d', cmap='Oranges', ax=ax1,
                   xticklabels=urgency_labels, yticklabels=urgency_labels)
        ax1.set_title('Maintenance Urgency Confusion Matrix')
        ax1.set_xlabel('Predicted Urgency')
        ax1.set_ylabel('True Urgency')
        
        # Critical error analysis
        critical_errors = []
        error_descriptions = []
        
        for true_val, pred_val in zip(y_true, y_pred):
            if true_val == 4 and pred_val <= 1:  # Failed classified as good/excellent
                critical_errors.append('Failed → Good/Excellent')
            elif true_val == 3 and pred_val == 0:  # Poor classified as excellent
                critical_errors.append('Poor → Excellent')
            elif true_val <= 1 and pred_val == 4:  # Good/excellent classified as failed
                critical_errors.append('Good/Excellent → Failed')
            elif true_val == 0 and pred_val == 3:  # Excellent classified as poor
                critical_errors.append('Excellent → Poor')
        
        if critical_errors:
            error_counts = pd.Series(critical_errors).value_counts()
            ax2.barh(range(len(error_counts)), error_counts.values, color='red', alpha=0.7)
            ax2.set_yticks(range(len(error_counts)))
            ax2.set_yticklabels(error_counts.index)
            ax2.set_xlabel('Count')
            ax2.set_title('Critical Misclassifications')
        else:
            ax2.text(0.5, 0.5, 'No Critical Errors', ha='center', va='center', transform=ax2.transAxes)
            ax2.set_title('Critical Misclassifications')
        
        # Economic impact visualization
        cost_matrix = np.array([
            [0, 50, 100, 500, 1000],
            [100, 0, 50, 400, 900],
            [300, 100, 0, 200, 700],
            [800, 500, 300, 0, 300],
            [2000, 1500, 1000, 500, 0]
        ])
        
        economic_impact = np.zeros_like(cost_matrix)
        for true_val, pred_val in zip(y_true, y_pred):
            if true_val < len(cost_matrix) and pred_val < len(cost_matrix[0]):
                economic_impact[true_val, pred_val] += cost_matrix[true_val, pred_val]
        
        sns.heatmap(economic_impact, annot=True, fmt='.0f', cmap='Reds', ax=ax3,
                   xticklabels=self.class_names[:economic_impact.shape[1]],
                   yticklabels=self.class_names[:economic_impact.shape[0]])
        ax3.set_title('Economic Impact Heatmap ($)')
        ax3.set_xlabel('Predicted Condition')
        ax3.set_ylabel('True Condition')
        
        # Confidence by condition severity
        condition_confidences = {}
        for condition in range(len(self.class_names[:len(np.unique(y_true))])):
            mask = y_true == condition
            if np.sum(mask) > 0:
                condition_confidences[self.class_names[condition]] = np.max(y_pred_proba[mask], axis=1)
        
        if condition_confidences:
            box_data = []
            box_labels = []
            for condition, confidences in condition_confidences.items():
                box_data.append(confidences)
                box_labels.append(condition)
            
            ax4.boxplot(box_data, labels=box_labels)
            ax4.set_ylabel('Prediction Confidence')
            ax4.set_title('Confidence by Pavement Condition')
            ax4.tick_params(axis='x', rotation=45)
        
        plt.tight_layout()
        plt.savefig(os.path.join(save_dir, 'pavement_specific_analysis.png'), dpi=300, bbox_inches='tight')
        plt.close()
    
    def _save_evaluation_report(self, results: Dict, save_dir: str):
        """Save comprehensive evaluation report"""
        
        # Save JSON report
        with open(os.path.join(save_dir, 'evaluation_report.json'), 'w') as f:
            # Convert numpy arrays to lists for JSON serialization
            json_results = self._convert_numpy_to_list(results)
            json.dump(json_results, f, indent=2, default=str)
        
        # Generate markdown report
        self._generate_markdown_report(results, save_dir)
    
    def _convert_numpy_to_list(self, obj):
        """Recursively convert numpy arrays to lists for JSON serialization"""
        if isinstance(obj, np.ndarray):
            return obj.tolist()
        elif isinstance(obj, dict):
            return {key: self._convert_numpy_to_list(value) for key, value in obj.items()}
        elif isinstance(obj, list):
            return [self._convert_numpy_to_list(item) for item in obj]
        else:
            return obj
    
    def _generate_markdown_report(self, results: Dict, save_dir: str):
        """Generate markdown evaluation report"""
        
        report_lines = [
            "# Pavement AI Model Evaluation Report",
            f"\n**Generated on:** {results['evaluation_timestamp']}",
            f"**Test Samples:** {results['test_samples']}",
            "\n## Executive Summary",
            f"- **Overall Accuracy:** {results['basic_metrics']['accuracy']:.4f}",
            f"- **Weighted F1-Score:** {results['basic_metrics']['f1_weighted']:.4f}",
            f"- **Cohen's Kappa:** {results['basic_metrics']['cohen_kappa']:.4f}",
            "\n## Basic Metrics",
        ]
        
        basic_metrics = results['basic_metrics']
        for metric, value in basic_metrics.items():
            report_lines.append(f"- **{metric.replace('_', ' ').title()}:** {value:.4f}")
        
        report_lines.extend([
            "\n## Per-Class Performance",
            "\n| Class | Precision | Recall | F1-Score | Support |",
            "|-------|-----------|--------|----------|---------|"
        ])
        
        per_class = results['per_class_metrics']['per_class_analysis']
        for class_name, metrics in per_class.items():
            report_lines.append(
                f"| {class_name} | {metrics['precision']:.3f} | "
                f"{metrics['recall']:.3f} | {metrics['f1_score']:.3f} | "
                f"{metrics['support']} |"
            )
        
        # Pavement-specific insights
        if 'pavement_analysis' in results:
            report_lines.extend([
                "\n## Pavement-Specific Analysis",
                "\n### Critical Misclassifications"
            ])
            
            critical_errors = results['pavement_analysis']['critical_misclassifications']
            for error_type, error_data in critical_errors.items():
                if error_data['count'] > 0:
                    report_lines.append(
                        f"- **{error_type.replace('_', ' ').title()}:** "
                        f"{error_data['count']} cases ({error_data['percentage']:.2f}%)"
                    )
        
        # Save markdown report
        with open(os.path.join(save_dir, 'evaluation_report.md'), 'w') as f:
            f.write('\n'.join(report_lines))

if __name__ == "__main__":
    # Example usage
    evaluator = PavementEvaluationMetrics()
    
    # Mock data for demonstration
    np.random.seed(42)
    y_true = np.random.randint(0, 5, 1000)
    y_pred_proba = np.random.rand(1000, 5)
    y_pred_proba = y_pred_proba / y_pred_proba.sum(axis=1, keepdims=True)
    
    # Run evaluation
    results = evaluator.evaluate_model(
        model=None,  # Mock model
        X_test=None,  # Mock test data
        y_test=y_true,
        y_pred_proba=y_pred_proba,
        save_dir='./test_evaluation'
    )
    
    print("Evaluation completed! Check './test_evaluation' for results.")