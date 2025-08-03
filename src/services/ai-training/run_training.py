#!/usr/bin/env python3
"""
PaveMaster Suite - Main Training Script
Orchestrates the complete AI training pipeline for pavement condition analysis
"""

import os
import sys
import argparse
import json
import logging
from datetime import datetime
from pathlib import Path

# Add the current directory to Python path for imports
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from TrainingPipeline import AdvancedTrainingPipeline
from PavementAITrainer import PavementAITrainer
from DataGenerator import PavementDataGenerator
from EvaluationMetrics import PavementEvaluationMetrics
from ModelDeployment import create_production_api

def setup_logging(log_level: str = "INFO"):
    """Setup comprehensive logging"""
    numeric_level = getattr(logging, log_level.upper(), None)
    if not isinstance(numeric_level, int):
        raise ValueError(f'Invalid log level: {log_level}')
    
    log_format = '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
    logging.basicConfig(
        level=numeric_level,
        format=log_format,
        handlers=[
            logging.FileHandler(f'pavement_training_{datetime.now().strftime("%Y%m%d_%H%M%S")}.log'),
            logging.StreamHandler(sys.stdout)
        ]
    )
    
    return logging.getLogger(__name__)

def validate_config(config: dict) -> bool:
    """Validate training configuration"""
    required_sections = ['experiment', 'data', 'training', 'models', 'evaluation']
    
    for section in required_sections:
        if section not in config:
            raise ValueError(f"Missing required config section: {section}")
    
    # Validate data section
    if config['data']['validation_split'] + config['data']['test_split'] >= 1.0:
        raise ValueError("Validation and test splits cannot sum to 1.0 or more")
    
    # Validate training section
    if config['training']['batch_size'] <= 0:
        raise ValueError("Batch size must be positive")
    
    if config['training']['epochs'] <= 0:
        raise ValueError("Epochs must be positive")
    
    return True

def generate_synthetic_data(config: dict, output_dir: str, logger: logging.Logger):
    """Generate synthetic pavement data"""
    logger.info("Generating synthetic pavement data...")
    
    generator = PavementDataGenerator()
    
    synthetic_dir = os.path.join(output_dir, "synthetic_data")
    metadata = generator.generate_synthetic_dataset(
        output_dir=synthetic_dir,
        num_samples_per_class=config['data']['synthetic_samples_per_class'],
        image_size=tuple(config['data']['image_size'][:2])
    )
    
    logger.info(f"Generated {metadata['total_images']} synthetic images")
    return synthetic_dir, metadata

def train_models(config: dict, data_dir: str, output_dir: str, logger: logging.Logger):
    """Train AI models using the training pipeline"""
    logger.info("Starting model training pipeline...")
    
    # Initialize training pipeline
    pipeline = AdvancedTrainingPipeline(
        experiment_name=config['experiment']['name'],
        config_path=None  # Config is passed directly
    )
    
    # Override pipeline config with our config
    pipeline.config = config
    
    # Prepare data
    logger.info("Preparing training data...")
    X, y, data_stats = pipeline.prepare_data(
        data_directory=data_dir,
        generate_synthetic=True
    )
    
    logger.info(f"Training data prepared: {data_stats['total_samples']} samples")
    
    # Run training experiments
    logger.info("Running training experiments...")
    results = pipeline.run_training_experiments(X, y, data_stats)
    
    # Export best model
    logger.info("Exporting best model...")
    export_dir = pipeline.export_best_model(metric='f1_weighted')
    
    logger.info(f"Training completed. Results saved to {pipeline.experiment_dir}")
    logger.info(f"Best model exported to {export_dir}")
    
    return pipeline, results, export_dir

def evaluate_models(results: dict, output_dir: str, logger: logging.Logger):
    """Comprehensive model evaluation"""
    logger.info("Performing comprehensive model evaluation...")
    
    evaluator = PavementEvaluationMetrics()
    
    evaluation_results = {}
    
    for model_name, model_data in results.items():
        if 'model' in model_data and 'evaluation' in model_data:
            logger.info(f"Evaluating model: {model_name}")
            
            # Extract test data (simplified - in practice, you'd maintain consistent test sets)
            # This is a placeholder for demonstration
            evaluation_results[model_name] = model_data['evaluation']
    
    logger.info("Model evaluation completed")
    return evaluation_results

def deploy_best_model(export_dir: str, config: dict, logger: logging.Logger):
    """Deploy the best model for inference"""
    logger.info("Setting up model deployment...")
    
    # Find the best model file
    model_files = list(Path(export_dir).glob("*.h5"))
    if not model_files:
        model_files = list(Path(export_dir).glob("*_savedmodel"))
    
    if not model_files:
        logger.error("No model files found for deployment")
        return None
    
    model_path = str(model_files[0])
    metadata_path = os.path.join(export_dir, "model_metadata.json")
    
    # Create production API (but don't run it here)
    try:
        api = create_production_api(
            model_path=model_path,
            metadata_path=metadata_path if os.path.exists(metadata_path) else None,
            host='0.0.0.0',
            port=5000
        )
        
        logger.info(f"Production API configured for model: {model_path}")
        logger.info("To start the API server, run:")
        logger.info(f"python ModelDeployment.py --model-path {model_path} --metadata-path {metadata_path}")
        
        return api
        
    except Exception as e:
        logger.error(f"Failed to configure production API: {e}")
        return None

def generate_final_report(pipeline, results: dict, evaluation_results: dict, 
                         config: dict, output_dir: str, logger: logging.Logger):
    """Generate comprehensive final report"""
    logger.info("Generating final training report...")
    
    report = {
        "training_summary": {
            "experiment_name": config['experiment']['name'],
            "training_date": datetime.now().isoformat(),
            "config": config,
            "models_trained": list(results.keys()),
            "experiment_directory": pipeline.experiment_dir
        },
        "data_summary": {
            "synthetic_samples": config['data']['synthetic_samples_per_class'],
            "image_size": config['data']['image_size'],
            "augmentation_factor": config['data']['real_data_augmentation_factor']
        },
        "model_results": {},
        "best_model": None,
        "deployment_info": {},
        "recommendations": []
    }
    
    # Add model results
    best_f1 = 0
    best_model_name = None
    
    for model_name, model_data in results.items():
        if 'evaluation' in model_data:
            eval_data = model_data['evaluation']
            f1_score = eval_data.get('f1_score', 0)
            
            report['model_results'][model_name] = {
                'architecture': model_data.get('architecture', 'unknown'),
                'accuracy': eval_data.get('accuracy', 0),
                'f1_score': f1_score,
                'test_samples': eval_data.get('test_samples', 0)
            }
            
            if f1_score > best_f1:
                best_f1 = f1_score
                best_model_name = model_name
    
    if best_model_name:
        report['best_model'] = {
            'name': best_model_name,
            'f1_score': best_f1,
            'architecture': results[best_model_name].get('architecture', 'unknown')
        }
    
    # Add recommendations
    if best_f1 < 0.85:
        report['recommendations'].append("Consider collecting more training data or adjusting hyperparameters")
    
    if best_f1 >= 0.90:
        report['recommendations'].append("Model performance is excellent - ready for production deployment")
    
    # Save report
    report_path = os.path.join(output_dir, 'final_training_report.json')
    with open(report_path, 'w') as f:
        json.dump(report, f, indent=2)
    
    logger.info(f"Final report saved to: {report_path}")
    
    # Print summary
    print("\n" + "="*60)
    print("PAVEMENT AI TRAINING SUMMARY")
    print("="*60)
    print(f"Experiment: {config['experiment']['name']}")
    print(f"Models Trained: {len(results)}")
    if best_model_name:
        print(f"Best Model: {best_model_name} (F1: {best_f1:.4f})")
    print(f"Results Directory: {pipeline.experiment_dir}")
    print("="*60)
    
    return report

def main():
    """Main training orchestration function"""
    parser = argparse.ArgumentParser(description='PaveMaster AI Training Pipeline')
    parser.add_argument('--config', required=True, help='Path to training configuration JSON')
    parser.add_argument('--data-dir', help='Path to real pavement data (optional)')
    parser.add_argument('--output-dir', default='./training_output', help='Output directory')
    parser.add_argument('--generate-synthetic', action='store_true', help='Generate synthetic data')
    parser.add_argument('--deploy', action='store_true', help='Setup deployment after training')
    parser.add_argument('--log-level', default='INFO', choices=['DEBUG', 'INFO', 'WARNING', 'ERROR'])
    
    args = parser.parse_args()
    
    # Setup logging
    logger = setup_logging(args.log_level)
    logger.info("Starting PaveMaster AI Training Pipeline")
    
    try:
        # Create output directory
        os.makedirs(args.output_dir, exist_ok=True)
        
        # Load configuration
        logger.info(f"Loading configuration from {args.config}")
        with open(args.config, 'r') as f:
            config = json.load(f)
        
        # Validate configuration
        validate_config(config)
        logger.info("Configuration validated successfully")
        
        # Generate synthetic data if requested
        data_dir = args.data_dir
        if args.generate_synthetic:
            synthetic_dir, synthetic_metadata = generate_synthetic_data(
                config, args.output_dir, logger
            )
            if not data_dir:
                data_dir = synthetic_dir
        
        # Train models
        pipeline, results, export_dir = train_models(
            config, data_dir, args.output_dir, logger
        )
        
        # Evaluate models
        evaluation_results = evaluate_models(
            results, args.output_dir, logger
        )
        
        # Setup deployment if requested
        if args.deploy:
            deploy_best_model(export_dir, config, logger)
        
        # Generate final report
        final_report = generate_final_report(
            pipeline, results, evaluation_results, 
            config, args.output_dir, logger
        )
        
        logger.info("Training pipeline completed successfully!")
        
        return 0
        
    except Exception as e:
        logger.error(f"Training pipeline failed: {e}")
        import traceback
        logger.error(traceback.format_exc())
        return 1

if __name__ == "__main__":
    exit_code = main()
    sys.exit(exit_code)