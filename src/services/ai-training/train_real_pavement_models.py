#!/usr/bin/env python3
"""
PaveMaster Suite - Complete Real Pavement Data Training Pipeline
Orchestrates data collection, preprocessing, training, and deployment for real pavement datasets
"""

import os
import sys
import argparse
import json
import logging
import yaml
from pathlib import Path
from datetime import datetime
from typing import Dict, List, Optional
import shutil

# Add current directory to path for imports
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from RealPavementDataTrainer import RealPavementDataTrainer
from PavementDataCollector import PavementDataCollector
import tensorflow as tf

def setup_environment():
    """Setup TensorFlow and logging environment"""
    # Configure TensorFlow
    tf.config.experimental.set_memory_growth(tf.config.list_physical_devices('GPU')[0], True) if tf.config.list_physical_devices('GPU') else None
    
    # Setup logging
    logging.basicConfig(
        level=logging.INFO,
        format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
    )
    
    return logging.getLogger(__name__)

class CompletePavementTrainingPipeline:
    """Complete training pipeline for real pavement data"""
    
    def __init__(self, config_path: str):
        self.logger = setup_environment()
        self.config = self._load_config(config_path)
        self.pipeline_start_time = datetime.now()
        
        # Initialize components
        self.data_collector = PavementDataCollector(
            base_dir=self.config.get('data_sources', {}).get('base_directory', './pavement_datasets')
        )
        self.trainer = RealPavementDataTrainer(config_path)
        
        # Setup output directory
        self.output_dir = self._setup_output_directory()
        
    def _load_config(self, config_path: str) -> Dict:
        """Load training configuration"""
        with open(config_path, 'r') as f:
            if config_path.endswith('.yaml') or config_path.endswith('.yml'):
                return yaml.safe_load(f)
            else:
                return json.load(f)
    
    def _setup_output_directory(self) -> Path:
        """Setup output directory with timestamp"""
        base_dir = Path(self.config['output']['base_directory'])
        
        if self.config['output']['create_subdirectories']:
            timestamp = self.pipeline_start_time.strftime(
                self.config['output']['subdirectory_format']
            )
            output_dir = base_dir / f"{self.config['experiment']['name']}_{timestamp}"
        else:
            output_dir = base_dir
        
        output_dir.mkdir(parents=True, exist_ok=True)
        
        # Save configuration to output directory
        config_file = output_dir / 'pipeline_config.yaml'
        with open(config_file, 'w') as f:
            yaml.dump(self.config, f, indent=2)
        
        self.logger.info(f"Output directory: {output_dir}")
        return output_dir
    
    def collect_data(self) -> Dict:
        """Collect data from all configured sources"""
        self.logger.info("Starting data collection phase...")
        
        collection_stats = {
            'total_collected': 0,
            'by_source': {},
            'collection_time': None
        }
        
        start_time = datetime.now()
        
        # Create collection session
        session_data = {
            'name': f"{self.config['experiment']['name']}_collection",
            'description': f"Data collection for {self.config['experiment']['description']}",
            'collector': 'automated_pipeline',
            'start_time': start_time.isoformat()
        }
        session_id = self.data_collector.create_collection_session(session_data)
        
        # Collect from local directories
        local_dirs = self.config.get('data_sources', {}).get('local_directories', [])
        for dir_config in local_dirs:
            try:
                stats = self.data_collector.collect_from_directory(
                    dir_config['path'], 
                    dir_config.get('condition_mapping'),
                    session_id
                )
                collection_stats['by_source'][f"local_{dir_config['path']}"] = stats
                collection_stats['total_collected'] += stats['successful']
                
            except Exception as e:
                self.logger.error(f"Failed to collect from {dir_config['path']}: {e}")
        
        # Collect from mobile app if enabled
        mobile_config = self.config.get('data_sources', {}).get('mobile_app', {})
        if mobile_config.get('enabled', False):
            try:
                stats = self.data_collector.collect_from_mobile_app(
                    mobile_config['data_directory'], session_id
                )
                collection_stats['by_source']['mobile_app'] = stats
                collection_stats['total_collected'] += stats['successful']
                
            except Exception as e:
                self.logger.error(f"Failed to collect mobile app data: {e}")
        
        # Collect from drone surveys if enabled
        drone_config = self.config.get('data_sources', {}).get('drone_surveys', {})
        if drone_config.get('enabled', False):
            try:
                flight_metadata = {
                    'collection_session': session_id,
                    'processing_timestamp': datetime.now().isoformat()
                }
                stats = self.data_collector.collect_from_drone_survey(
                    drone_config['data_directory'], flight_metadata, session_id
                )
                collection_stats['by_source']['drone_surveys'] = stats
                collection_stats['total_collected'] += stats['successful']
                
            except Exception as e:
                self.logger.error(f"Failed to collect drone survey data: {e}")
        
        # Download public datasets if configured
        public_datasets = self.config.get('data_sources', {}).get('public_datasets', [])
        if public_datasets:
            try:
                stats = self.data_collector.download_public_datasets(
                    public_datasets, session_id
                )
                collection_stats['by_source']['public_datasets'] = stats
                collection_stats['total_collected'] += stats['downloaded']
                
            except Exception as e:
                self.logger.error(f"Failed to download public datasets: {e}")
        
        collection_stats['collection_time'] = (datetime.now() - start_time).total_seconds()
        
        self.logger.info(f"Data collection completed: {collection_stats['total_collected']} images collected")
        return collection_stats
    
    def prepare_training_dataset(self) -> Dict:
        """Prepare organized training dataset"""
        self.logger.info("Preparing training dataset...")
        
        # Create training dataset from collected data
        dataset_dir = self.output_dir / 'dataset'
        dataset_info = self.data_collector.create_training_dataset(
            str(dataset_dir),
            train_split=1.0 - self.config['data']['validation_split'] - self.config['data']['test_split'],
            val_split=self.config['data']['validation_split'],
            test_split=self.config['data']['test_split']
        )
        
        # Update trainer configuration with dataset path
        self.trainer.config['data']['dataset_path'] = str(dataset_dir)
        
        return dataset_info
    
    def train_models(self, dataset_path: str) -> Dict:
        """Train AI models on the prepared dataset"""
        self.logger.info("Starting model training phase...")
        
        start_time = datetime.now()
        
        # Run complete training pipeline
        training_results = self.trainer.run_complete_training(
            dataset_path, str(self.output_dir / 'models')
        )
        
        training_time = (datetime.now() - start_time).total_seconds()
        training_results['training_time_seconds'] = training_time
        
        return training_results
    
    def evaluate_and_deploy(self, training_results: Dict) -> Dict:
        """Evaluate models and prepare for deployment"""
        self.logger.info("Evaluating models and preparing deployment...")
        
        deployment_results = {
            'best_model': None,
            'deployment_artifacts': [],
            'performance_summary': {}
        }
        
        # Find best performing model
        evaluation_results = training_results.get('evaluation_results', {})
        if evaluation_results:
            best_model = max(
                evaluation_results.items(), 
                key=lambda x: x[1].get('test_accuracy', 0)
            )
            deployment_results['best_model'] = {
                'architecture': best_model[0],
                'accuracy': best_model[1]['test_accuracy']
            }
            
            # Performance summary
            deployment_results['performance_summary'] = {
                arch: {
                    'accuracy': results.get('test_accuracy', 0),
                    'precision': results.get('test_precision', 0),
                    'recall': results.get('test_recall', 0)
                }
                for arch, results in evaluation_results.items()
                if 'test_accuracy' in results
            }
        
        # Export models in different formats
        models_dir = self.output_dir / 'models'
        export_formats = self.config.get('deployment', {}).get('export_formats', ['h5', 'tflite'])
        
        for format_type in export_formats:
            if format_type == 'tflite':
                # TensorFlow Lite models are already created during training
                tflite_files = list(models_dir.glob('*.tflite'))
                deployment_results['deployment_artifacts'].extend([
                    {'format': 'tflite', 'path': str(f)} for f in tflite_files
                ])
            elif format_type == 'h5':
                # Keras H5 models are already created during training
                h5_files = list(models_dir.glob('*.h5'))
                deployment_results['deployment_artifacts'].extend([
                    {'format': 'h5', 'path': str(f)} for f in h5_files
                ])
        
        # Create deployment configuration
        deployment_config = {
            'model_info': deployment_results['best_model'],
            'api_config': self.config.get('deployment', {}).get('api', {}),
            'performance_targets': self.config.get('deployment', {}).get('performance_targets', {}),
            'created_at': datetime.now().isoformat()
        }
        
        with open(self.output_dir / 'deployment_config.json', 'w') as f:
            json.dump(deployment_config, f, indent=2)
        
        return deployment_results
    
    def generate_comprehensive_report(self, 
                                    collection_stats: Dict, 
                                    dataset_info: Dict, 
                                    training_results: Dict, 
                                    deployment_results: Dict) -> Dict:
        """Generate comprehensive pipeline report"""
        self.logger.info("Generating comprehensive pipeline report...")
        
        pipeline_end_time = datetime.now()
        total_pipeline_time = (pipeline_end_time - self.pipeline_start_time).total_seconds()
        
        report = {
            'pipeline_info': {
                'experiment_name': self.config['experiment']['name'],
                'description': self.config['experiment']['description'],
                'version': self.config['experiment']['version'],
                'start_time': self.pipeline_start_time.isoformat(),
                'end_time': pipeline_end_time.isoformat(),
                'total_time_seconds': total_pipeline_time,
                'total_time_hours': total_pipeline_time / 3600
            },
            'data_collection': collection_stats,
            'dataset_preparation': dataset_info,
            'training_results': {
                'models_trained': len(training_results.get('training_results', {})),
                'best_accuracy': max([
                    results.get('test_accuracy', 0) 
                    for results in training_results.get('evaluation_results', {}).values()
                    if 'test_accuracy' in results
                ], default=0),
                'training_time_hours': training_results.get('training_time_seconds', 0) / 3600
            },
            'deployment': deployment_results,
            'configuration': self.config,
            'system_info': {
                'tensorflow_version': tf.__version__,
                'gpu_available': len(tf.config.list_physical_devices('GPU')) > 0,
                'python_version': sys.version
            }
        }
        
        # Save comprehensive report
        report_path = self.output_dir / 'comprehensive_report.json'
        with open(report_path, 'w') as f:
            json.dump(report, f, indent=2)
        
        # Generate data collection report
        data_report = self.data_collector.generate_data_report()
        
        # Create summary README
        self._create_summary_readme(report, data_report)
        
        return report
    
    def _create_summary_readme(self, pipeline_report: Dict, data_report: Dict):
        """Create a summary README file"""
        readme_content = f"""# {self.config['experiment']['name']} - Training Results

## Experiment Overview
- **Description**: {self.config['experiment']['description']}
- **Version**: {self.config['experiment']['version']}
- **Training Duration**: {pipeline_report['pipeline_info']['total_time_hours']:.2f} hours
- **Completion Date**: {pipeline_report['pipeline_info']['end_time']}

## Dataset Summary
- **Total Images**: {data_report['summary']['total_images']:,}
- **Dataset Size**: {data_report['summary']['total_size_mb']:,} MB
- **Condition Classes**: {data_report['summary']['conditions']}
- **Average Quality Score**: {data_report['summary']['avg_quality']:.3f}

## Training Results
- **Models Trained**: {pipeline_report['training_results']['models_trained']}
- **Best Accuracy**: {pipeline_report['training_results']['best_accuracy']:.1%}
- **Training Time**: {pipeline_report['training_results']['training_time_hours']:.2f} hours

## Best Model
- **Architecture**: {pipeline_report['deployment']['best_model']['architecture'] if pipeline_report['deployment']['best_model'] else 'N/A'}
- **Test Accuracy**: {pipeline_report['deployment']['best_model']['accuracy']:.1%} if pipeline_report['deployment']['best_model'] else 'N/A'

## Deployment Artifacts
"""
        
        for artifact in pipeline_report['deployment']['deployment_artifacts']:
            readme_content += f"- **{artifact['format'].upper()}**: `{artifact['path']}`\n"
        
        readme_content += f"""
## Performance by Model Architecture
"""
        
        for arch, performance in pipeline_report['deployment']['performance_summary'].items():
            readme_content += f"""
### {arch}
- Accuracy: {performance['accuracy']:.1%}
- Precision: {performance['precision']:.1%}
- Recall: {performance['recall']:.1%}
"""
        
        readme_content += f"""
## Files and Directories
- `models/`: Trained model files
- `dataset/`: Organized training dataset
- `logs/`: Training logs and TensorBoard data
- `comprehensive_report.json`: Detailed pipeline results
- `deployment_config.json`: Deployment configuration
- `pipeline_config.yaml`: Training configuration used

## Usage
To use the trained models for inference:

```python
import tensorflow as tf

# Load the best model
model = tf.keras.models.load_model('models/best_{pipeline_report['deployment']['best_model']['architecture'] if pipeline_report['deployment']['best_model'] else 'model'}_model.h5')

# For TensorFlow Lite (mobile deployment)
interpreter = tf.lite.Interpreter(model_path='models/{pipeline_report['deployment']['best_model']['architecture'] if pipeline_report['deployment']['best_model'] else 'model'}_model.tflite')
```

Generated by PaveMaster Suite AI Training Pipeline
"""
        
        with open(self.output_dir / 'README.md', 'w') as f:
            f.write(readme_content)
    
    def run_complete_pipeline(self) -> Dict:
        """Run the complete training pipeline"""
        try:
            self.logger.info(f"Starting complete pavement AI training pipeline: {self.config['experiment']['name']}")
            
            # Phase 1: Data Collection
            collection_stats = self.collect_data()
            
            # Phase 2: Dataset Preparation
            dataset_info = self.prepare_training_dataset()
            
            # Phase 3: Model Training
            training_results = self.train_models(dataset_info['output_directory'] if 'output_directory' in dataset_info else str(self.output_dir / 'dataset'))
            
            # Phase 4: Evaluation and Deployment
            deployment_results = self.evaluate_and_deploy(training_results)
            
            # Phase 5: Comprehensive Reporting
            final_report = self.generate_comprehensive_report(
                collection_stats, dataset_info, training_results, deployment_results
            )
            
            self.logger.info(f"Pipeline completed successfully! Results saved to: {self.output_dir}")
            return final_report
            
        except Exception as e:
            self.logger.error(f"Pipeline failed: {e}")
            raise

def main():
    """Main entry point for the training pipeline"""
    parser = argparse.ArgumentParser(
        description='Complete real pavement data AI training pipeline',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  # Run with default configuration
  python train_real_pavement_models.py --config real_pavement_config.yaml
  
  # Run with custom data directory
  python train_real_pavement_models.py --config real_pavement_config.yaml --data-dir /path/to/pavement/data
  
  # Run with specific output directory
  python train_real_pavement_models.py --config real_pavement_config.yaml --output-dir ./custom_output
        """
    )
    
    parser.add_argument(
        '--config', 
        required=True, 
        help='Path to training configuration file (YAML or JSON)'
    )
    parser.add_argument(
        '--data-dir', 
        help='Override data directory from configuration'
    )
    parser.add_argument(
        '--output-dir', 
        help='Override output directory from configuration'
    )
    parser.add_argument(
        '--skip-collection', 
        action='store_true',
        help='Skip data collection phase (use existing dataset)'
    )
    parser.add_argument(
        '--validation-only', 
        action='store_true',
        help='Only validate configuration without running training'
    )
    
    args = parser.parse_args()
    
    # Validate configuration file exists
    if not os.path.exists(args.config):
        print(f"Error: Configuration file '{args.config}' not found")
        sys.exit(1)
    
    # Initialize pipeline
    try:
        pipeline = CompletePavementTrainingPipeline(args.config)
        
        # Override configuration if specified
        if args.data_dir:
            pipeline.config['data_sources']['local_directories'][0]['path'] = args.data_dir
        
        if args.output_dir:
            pipeline.config['output']['base_directory'] = args.output_dir
            pipeline.output_dir = pipeline._setup_output_directory()
        
        # Validation mode
        if args.validation_only:
            print("Configuration validation successful!")
            print(f"Experiment: {pipeline.config['experiment']['name']}")
            print(f"Output directory: {pipeline.output_dir}")
            return
        
        # Run pipeline
        if args.skip_collection:
            print("Skipping data collection phase...")
            # Implement logic to use existing dataset
        
        results = pipeline.run_complete_pipeline()
        
        print("\n" + "="*60)
        print("TRAINING PIPELINE COMPLETED SUCCESSFULLY!")
        print("="*60)
        print(f"Experiment: {results['pipeline_info']['experiment_name']}")
        print(f"Total Time: {results['pipeline_info']['total_time_hours']:.2f} hours")
        print(f"Images Processed: {results['dataset_preparation']['total_images']:,}")
        print(f"Best Model Accuracy: {results['training_results']['best_accuracy']:.1%}")
        print(f"Results Location: {pipeline.output_dir}")
        print("="*60)
        
    except Exception as e:
        print(f"Pipeline failed: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()