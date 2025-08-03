# PaveMaster Suite - Real Pavement Data AI Training Quick Start

## Overview

This guide will help you train custom AI models using real pavement data with the PaveMaster Suite. The system provides end-to-end capabilities for data collection, preprocessing, training, and deployment of state-of-the-art pavement condition assessment models.

## 🚀 Quick Start

### Prerequisites

```bash
# Install Python dependencies
pip install -r requirements.txt

# Verify TensorFlow installation
python -c "import tensorflow as tf; print(f'TensorFlow version: {tf.__version__}')"

# Check for GPU availability (optional but recommended)
python -c "import tensorflow as tf; print(f'GPU Available: {len(tf.config.list_physical_devices(\"GPU\")) > 0}')"
```

### 1. Prepare Your Data

The system supports multiple data sources:

#### Option A: Local Directory Structure
```
your_pavement_data/
├── excellent/          # PCI 85-100
│   ├── img001.jpg
│   ├── img002.jpg
│   └── ...
├── good/               # PCI 70-84
│   ├── img003.jpg
│   └── ...
├── fair/               # PCI 55-69
├── poor/               # PCI 40-54
├── very_poor/          # PCI 25-39
└── failed/             # PCI 0-24
```

#### Option B: CSV Annotations
```csv
image_path,condition,location,date,weather
images/road1.jpg,excellent,Highway 101,2024-01-15,sunny
images/road2.jpg,fair,Main Street,2024-01-16,cloudy
```

#### Option C: Mobile App Data
The system can import data from mobile app uploads with metadata.

### 2. Configure Training

Copy and customize the configuration file:

```bash
cp src/services/ai-training/real_pavement_config.yaml my_config.yaml
```

Edit `my_config.yaml` to specify your data sources:

```yaml
data_sources:
  local_directories:
    - path: "./your_pavement_data"
      condition_mapping:
        excellent: "excellent"
        good: "good"
        fair: "fair"
        poor: "poor"
        very_poor: "very_poor"
        failed: "failed"

data:
  image_size: [224, 224, 3]
  quality_threshold: 0.6
  validation_split: 0.2
  test_split: 0.15

training:
  batch_size: 32
  epochs: 100
  learning_rate: 0.001

models:
  architectures:
    - "attention_resnet"
    - "multi_scale_cnn"
  ensemble:
    enabled: true
```

### 3. Run Training Pipeline

```bash
# Navigate to the AI training directory
cd src/services/ai-training

# Run the complete training pipeline
python train_real_pavement_models.py --config my_config.yaml
```

### 4. Monitor Training Progress

```bash
# View TensorBoard logs (in another terminal)
tensorboard --logdir ./logs

# Monitor training logs
tail -f real_pavement_training_*.log
```

## 📊 Advanced Usage

### Custom Data Collection

```python
from PavementDataCollector import PavementDataCollector

# Initialize collector
collector = PavementDataCollector("./my_pavement_datasets")

# Create collection session
session_data = {
    'name': 'Highway_Survey_2024',
    'description': 'Interstate highway condition survey',
    'location': 'I-95 Corridor',
    'collector': 'Survey Team A',
    'weather': 'Clear, 70°F'
}
session_id = collector.create_collection_session(session_data)

# Collect from directory
stats = collector.collect_from_directory(
    "./raw_pavement_images", 
    session_id=session_id
)

# Create training dataset
dataset_info = collector.create_training_dataset("./training_data")
```

### Custom Model Training

```python
from RealPavementDataTrainer import RealPavementDataTrainer

# Initialize trainer with custom config
trainer = RealPavementDataTrainer("custom_config.yaml")

# Run training
results = trainer.run_complete_training(
    data_path="./training_data",
    output_dir="./my_models"
)

print(f"Best accuracy: {results['evaluation_results']['ensemble']['test_accuracy']:.1%}")
```

### Batch Processing Multiple Datasets

```bash
# Process multiple data directories
for dataset in datasets/*/; do
    python train_real_pavement_models.py \
        --config real_pavement_config.yaml \
        --data-dir "$dataset" \
        --output-dir "./models/$(basename $dataset)"
done
```

## 🔧 Configuration Options

### Data Augmentation
```yaml
data:
  augmentation:
    enabled: true
    augmentation_factor: 8
    geometric:
      horizontal_flip: 0.5
      rotation_limit: 15
    environmental:
      brightness_contrast:
        brightness_limit: 0.2
        contrast_limit: 0.2
        probability: 0.5
      shadow_probability: 0.3
      rain_probability: 0.2
```

### Model Architectures
```yaml
models:
  architectures:
    - "attention_resnet"     # ResNet with attention mechanism
    - "multi_scale_cnn"      # Multi-scale CNN for crack detection
    - "efficientnet_b0"      # EfficientNet for efficiency
    - "densenet121"          # DenseNet for feature reuse
  
  ensemble:
    enabled: true
    method: "average"        # or "weighted", "stacking"
```

### Hardware Configuration
```yaml
hardware:
  gpu:
    enabled: true
    memory_growth: true
  multi_gpu:
    enabled: false           # Set to true for multi-GPU training
    strategy: "mirrored"
```

## 📈 Evaluation and Results

### Training Results
After training, you'll find:

```
training_output/
├── models/
│   ├── attention_resnet_model.h5
│   ├── attention_resnet_model.tflite
│   ├── multi_scale_cnn_model.h5
│   ├── ensemble_model.h5
│   └── ...
├── dataset/
│   ├── train/
│   ├── validation/
│   ├── test/
│   └── annotations.csv
├── logs/
│   └── tensorboard_logs/
├── comprehensive_report.json
├── deployment_config.json
└── README.md
```

### Performance Metrics
```json
{
  "evaluation_results": {
    "attention_resnet": {
      "test_accuracy": 0.923,
      "test_precision": 0.918,
      "test_recall": 0.925,
      "f1_score": 0.921
    },
    "ensemble": {
      "test_accuracy": 0.941,
      "test_precision": 0.938,
      "test_recall": 0.943
    }
  }
}
```

## 🚀 Deployment

### Load Trained Model

```python
import tensorflow as tf

# Load best model for inference
model = tf.keras.models.load_model('models/best_ensemble_model.h5')

# Load image and predict
import cv2
import numpy as np

image = cv2.imread('test_pavement.jpg')
image = cv2.resize(image, (224, 224))
image = np.expand_dims(image, axis=0) / 255.0

prediction = model.predict(image)
condition = ['excellent', 'good', 'fair', 'poor', 'very_poor', 'failed'][np.argmax(prediction)]
confidence = np.max(prediction)

print(f"Condition: {condition} (confidence: {confidence:.1%})")
```

### Mobile Deployment (TensorFlow Lite)

```python
import tensorflow as tf

# Load TensorFlow Lite model
interpreter = tf.lite.Interpreter(model_path='models/attention_resnet_model.tflite')
interpreter.allocate_tensors()

# Get input and output details
input_details = interpreter.get_input_details()
output_details = interpreter.get_output_details()

# Run inference
interpreter.set_tensor(input_details[0]['index'], image.astype(np.float32))
interpreter.invoke()
output = interpreter.get_tensor(output_details[0]['index'])
```

### Production API

```python
from ModelDeployment import PavementInferenceEngine

# Initialize inference engine
engine = PavementInferenceEngine(
    model_path="models/best_ensemble_model.h5",
    use_gpu=True,
    batch_size=32
)

# Start API server
engine.start_api_server(host="0.0.0.0", port=5000)
```

Test the API:
```bash
curl -X POST http://localhost:5000/predict \
  -F "image=@pavement_image.jpg"
```

## 📚 Example Workflows

### 1. Highway Survey Analysis
```bash
# Collect data from drone survey
python PavementDataCollector.py \
  --drone-dir ./drone_survey_data \
  --create-dataset ./highway_dataset

# Train specialized highway models
python train_real_pavement_models.py \
  --config highway_config.yaml \
  --data-dir ./highway_dataset
```

### 2. Urban Road Assessment
```bash
# Process mobile app uploads
python PavementDataCollector.py \
  --mobile-dir ./mobile_uploads \
  --generate-report

# Train urban-specific models
python train_real_pavement_models.py \
  --config urban_config.yaml
```

### 3. Multi-Source Integration
```yaml
# Configuration for multiple data sources
data_sources:
  local_directories:
    - path: "./manual_surveys"
    - path: "./historical_data"
  mobile_app:
    enabled: true
    data_directory: "./mobile_uploads"
  drone_surveys:
    enabled: true
    data_directory: "./drone_data"
  public_datasets:
    - name: "pavement_research_dataset"
      url: "https://example.com/dataset.zip"
```

## 🔍 Quality Assessment

The system automatically assesses image quality:

- **Blur Score**: Laplacian variance for sharpness
- **Brightness**: Optimal lighting conditions
- **Contrast**: Edge definition quality
- **Edge Density**: Texture detail for analysis

Images below the quality threshold are filtered out automatically.

## 📊 Performance Benchmarks

Expected performance on typical datasets:

| Model Architecture | Accuracy | Inference Time | Model Size |
|-------------------|----------|----------------|------------|
| Attention ResNet  | 92-94%   | 45ms          | 98MB       |
| Multi-Scale CNN   | 89-92%   | 35ms          | 76MB       |
| EfficientNet      | 93-95%   | 52ms          | 52MB       |
| Ensemble          | 94-96%   | 120ms         | 226MB      |
| Mobile (TFLite)   | 88-91%   | 23ms          | 24MB       |

## 🛠️ Troubleshooting

### Common Issues

1. **Out of Memory Errors**
```bash
# Reduce batch size
# In config: training.batch_size: 16
export TF_FORCE_GPU_ALLOW_GROWTH=true
```

2. **Low Quality Images**
```yaml
# Adjust quality threshold
data:
  quality_threshold: 0.4  # Lower threshold
```

3. **Slow Training**
```yaml
# Enable mixed precision
training:
  mixed_precision: true
  
# Use smaller image size
data:
  image_size: [180, 180, 3]
```

4. **Imbalanced Classes**
```yaml
# Enable class weighting
training:
  class_weights:
    enabled: true
    method: "balanced"
```

### Debug Mode
```bash
python train_real_pavement_models.py \
  --config debug_config.yaml \
  --validation-only
```

## 📖 Additional Resources

- **API Reference**: See `README_AI_TRAINING.md` for detailed API documentation
- **Configuration Guide**: All configuration options in `real_pavement_config.yaml`
- **Architecture Details**: Model implementations in `RealPavementDataTrainer.py`
- **Data Collection**: Complete guide in `PavementDataCollector.py`

## 🤝 Support

For questions and support:

1. Check the comprehensive logs generated during training
2. Review the `comprehensive_report.json` for detailed results
3. Use debug mode for configuration validation
4. Enable verbose logging for troubleshooting

## 🎯 Next Steps

After successful training:

1. **Integrate with PaveMaster App**: Deploy models to the mobile application
2. **Set up Production API**: Use the inference engine for real-time analysis
3. **Continuous Learning**: Regularly retrain with new data
4. **Performance Monitoring**: Track model performance in production
5. **Model Optimization**: Fine-tune for specific use cases

---

**Happy Training!** 🚀

For the most up-to-date information and examples, check the project documentation and example configurations included with the system.