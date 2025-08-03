#!/usr/bin/env python3
"""
PaveMaster Suite - AI Model Architectures
Specialized neural network architectures for pavement condition analysis
"""

import tensorflow as tf
from tensorflow.keras.layers import *
from tensorflow.keras.models import Model, Sequential
from tensorflow.keras.applications import *
import numpy as np
from typing import Tuple, Dict, List, Optional

class PavementModelArchitectures:
    """
    Collection of specialized model architectures for pavement analysis
    """
    
    def __init__(self):
        self.input_shape = (224, 224, 3)
        
    def create_pavement_resnet(self, 
                              num_classes: int,
                              input_shape: Tuple[int, int, int] = None) -> Model:
        """
        ResNet-based architecture optimized for pavement analysis
        """
        if input_shape is None:
            input_shape = self.input_shape
            
        # Base ResNet50
        base_model = ResNet50(
            weights='imagenet',
            include_top=False,
            input_shape=input_shape
        )
        
        # Freeze early layers, fine-tune later layers
        for layer in base_model.layers[:-20]:
            layer.trainable = False
            
        # Add pavement-specific head
        x = base_model.output
        x = GlobalAveragePooling2D()(x)
        
        # Multi-scale feature fusion
        x = Dense(1024, activation='relu', name='feature_dense_1')(x)
        x = BatchNormalization()(x)
        x = Dropout(0.5)(x)
        
        x = Dense(512, activation='relu', name='feature_dense_2')(x)
        x = BatchNormalization()(x)
        x = Dropout(0.3)(x)
        
        # Final classification layer
        predictions = Dense(num_classes, activation='softmax', name='predictions')(x)
        
        model = Model(inputs=base_model.input, outputs=predictions)
        
        return model
    
    def create_pavement_efficientnet(self, 
                                   num_classes: int,
                                   input_shape: Tuple[int, int, int] = None) -> Model:
        """
        EfficientNet-based architecture for pavement analysis
        """
        if input_shape is None:
            input_shape = self.input_shape
            
        # Base EfficientNetB4 for better accuracy
        base_model = EfficientNetB4(
            weights='imagenet',
            include_top=False,
            input_shape=input_shape
        )
        
        # Fine-tune top layers
        for layer in base_model.layers[:-30]:
            layer.trainable = False
            
        x = base_model.output
        x = GlobalAveragePooling2D()(x)
        
        # Pavement-specific processing
        x = Dense(1024, activation='swish')(x)
        x = BatchNormalization()(x)
        x = Dropout(0.4)(x)
        
        x = Dense(512, activation='swish')(x)
        x = BatchNormalization()(x)
        x = Dropout(0.2)(x)
        
        predictions = Dense(num_classes, activation='softmax')(x)
        
        model = Model(inputs=base_model.input, outputs=predictions)
        
        return model
    
    def create_crack_detection_unet(self, 
                                  input_shape: Tuple[int, int, int] = None) -> Model:
        """
        U-Net architecture for crack segmentation
        """
        if input_shape is None:
            input_shape = self.input_shape
            
        inputs = Input(input_shape)
        
        # Encoder
        c1 = Conv2D(64, (3, 3), activation='relu', padding='same')(inputs)
        c1 = Conv2D(64, (3, 3), activation='relu', padding='same')(c1)
        p1 = MaxPooling2D((2, 2))(c1)
        
        c2 = Conv2D(128, (3, 3), activation='relu', padding='same')(p1)
        c2 = Conv2D(128, (3, 3), activation='relu', padding='same')(c2)
        p2 = MaxPooling2D((2, 2))(c2)
        
        c3 = Conv2D(256, (3, 3), activation='relu', padding='same')(p2)
        c3 = Conv2D(256, (3, 3), activation='relu', padding='same')(c3)
        p3 = MaxPooling2D((2, 2))(c3)
        
        c4 = Conv2D(512, (3, 3), activation='relu', padding='same')(p3)
        c4 = Conv2D(512, (3, 3), activation='relu', padding='same')(c4)
        p4 = MaxPooling2D((2, 2))(c4)
        
        # Bridge
        c5 = Conv2D(1024, (3, 3), activation='relu', padding='same')(p4)
        c5 = Conv2D(1024, (3, 3), activation='relu', padding='same')(c5)
        
        # Decoder
        u6 = Conv2DTranspose(512, (2, 2), strides=(2, 2), padding='same')(c5)
        u6 = concatenate([u6, c4])
        c6 = Conv2D(512, (3, 3), activation='relu', padding='same')(u6)
        c6 = Conv2D(512, (3, 3), activation='relu', padding='same')(c6)
        
        u7 = Conv2DTranspose(256, (2, 2), strides=(2, 2), padding='same')(c6)
        u7 = concatenate([u7, c3])
        c7 = Conv2D(256, (3, 3), activation='relu', padding='same')(u7)
        c7 = Conv2D(256, (3, 3), activation='relu', padding='same')(c7)
        
        u8 = Conv2DTranspose(128, (2, 2), strides=(2, 2), padding='same')(c7)
        u8 = concatenate([u8, c2])
        c8 = Conv2D(128, (3, 3), activation='relu', padding='same')(u8)
        c8 = Conv2D(128, (3, 3), activation='relu', padding='same')(c8)
        
        u9 = Conv2DTranspose(64, (2, 2), strides=(2, 2), padding='same')(c8)
        u9 = concatenate([u9, c1])
        c9 = Conv2D(64, (3, 3), activation='relu', padding='same')(u9)
        c9 = Conv2D(64, (3, 3), activation='relu', padding='same')(c9)
        
        # Output layer for binary segmentation (crack/no crack)
        outputs = Conv2D(1, (1, 1), activation='sigmoid')(c9)
        
        model = Model(inputs=inputs, outputs=outputs)
        
        return model
    
    def create_attention_cnn(self, 
                           num_classes: int,
                           input_shape: Tuple[int, int, int] = None) -> Model:
        """
        CNN with attention mechanism for pavement feature focus
        """
        if input_shape is None:
            input_shape = self.input_shape
            
        inputs = Input(input_shape)
        
        # Feature extraction backbone
        x = Conv2D(64, (3, 3), activation='relu', padding='same')(inputs)
        x = BatchNormalization()(x)
        x = Conv2D(64, (3, 3), activation='relu', padding='same')(x)
        x = MaxPooling2D((2, 2))(x)
        
        x = Conv2D(128, (3, 3), activation='relu', padding='same')(x)
        x = BatchNormalization()(x)
        x = Conv2D(128, (3, 3), activation='relu', padding='same')(x)
        x = MaxPooling2D((2, 2))(x)
        
        x = Conv2D(256, (3, 3), activation='relu', padding='same')(x)
        x = BatchNormalization()(x)
        x = Conv2D(256, (3, 3), activation='relu', padding='same')(x)
        x = MaxPooling2D((2, 2))(x)
        
        # Attention mechanism
        attention = self._spatial_attention_block(x)
        x = multiply([x, attention])
        
        x = Conv2D(512, (3, 3), activation='relu', padding='same')(x)
        x = BatchNormalization()(x)
        x = GlobalAveragePooling2D()(x)
        
        # Classification head
        x = Dense(512, activation='relu')(x)
        x = Dropout(0.5)(x)
        x = Dense(256, activation='relu')(x)
        x = Dropout(0.3)(x)
        
        predictions = Dense(num_classes, activation='softmax')(x)
        
        model = Model(inputs=inputs, outputs=predictions)
        
        return model
    
    def _spatial_attention_block(self, feature_map):
        """Spatial attention mechanism"""
        # Average and max pooling along channel axis
        avg_pool = tf.reduce_mean(feature_map, axis=-1, keepdims=True)
        max_pool = tf.reduce_max(feature_map, axis=-1, keepdims=True)
        
        # Concatenate and apply convolution
        concat = concatenate([avg_pool, max_pool])
        attention = Conv2D(1, (7, 7), activation='sigmoid', padding='same')(concat)
        
        return attention
    
    def create_multi_task_model(self, 
                              condition_classes: int,
                              crack_classes: int,
                              input_shape: Tuple[int, int, int] = None) -> Model:
        """
        Multi-task model for both condition assessment and crack detection
        """
        if input_shape is None:
            input_shape = self.input_shape
            
        inputs = Input(input_shape)
        
        # Shared feature extraction
        x = Conv2D(64, (3, 3), activation='relu', padding='same')(inputs)
        x = BatchNormalization()(x)
        x = Conv2D(64, (3, 3), activation='relu', padding='same')(x)
        x = MaxPooling2D((2, 2))(x)
        
        x = Conv2D(128, (3, 3), activation='relu', padding='same')(x)
        x = BatchNormalization()(x)
        x = Conv2D(128, (3, 3), activation='relu', padding='same')(x)
        x = MaxPooling2D((2, 2))(x)
        
        x = Conv2D(256, (3, 3), activation='relu', padding='same')(x)
        x = BatchNormalization()(x)
        x = Conv2D(256, (3, 3), activation='relu', padding='same')(x)
        x = MaxPooling2D((2, 2))(x)
        
        x = Conv2D(512, (3, 3), activation='relu', padding='same')(x)
        x = BatchNormalization()(x)
        shared_features = GlobalAveragePooling2D()(x)
        
        # Condition assessment branch
        condition_branch = Dense(256, activation='relu', name='condition_dense_1')(shared_features)
        condition_branch = Dropout(0.5)(condition_branch)
        condition_branch = Dense(128, activation='relu', name='condition_dense_2')(condition_branch)
        condition_branch = Dropout(0.3)(condition_branch)
        condition_output = Dense(condition_classes, activation='softmax', name='condition_output')(condition_branch)
        
        # Crack detection branch
        crack_branch = Dense(256, activation='relu', name='crack_dense_1')(shared_features)
        crack_branch = Dropout(0.5)(crack_branch)
        crack_branch = Dense(128, activation='relu', name='crack_dense_2')(crack_branch)
        crack_branch = Dropout(0.3)(crack_branch)
        crack_output = Dense(crack_classes, activation='softmax', name='crack_output')(crack_branch)
        
        model = Model(inputs=inputs, outputs=[condition_output, crack_output])
        
        return model
    
    def create_vision_transformer(self, 
                                num_classes: int,
                                input_shape: Tuple[int, int, int] = None,
                                patch_size: int = 16) -> Model:
        """
        Vision Transformer for pavement analysis
        """
        if input_shape is None:
            input_shape = self.input_shape
            
        inputs = Input(input_shape)
        
        # Create patches
        patches = self._extract_patches(inputs, patch_size)
        
        # Patch embedding
        patch_dim = patch_size * patch_size * input_shape[2]
        patches = Dense(256)(patches)
        
        # Add positional encoding
        num_patches = (input_shape[0] // patch_size) * (input_shape[1] // patch_size)
        positions = tf.range(start=0, limit=num_patches, delta=1)
        pos_embedding = Embedding(input_dim=num_patches, output_dim=256)(positions)
        
        patches = patches + pos_embedding
        
        # Transformer blocks
        for _ in range(6):  # 6 transformer layers
            patches = self._transformer_block(patches, d_model=256, num_heads=8)
        
        # Classification head
        representation = GlobalAveragePooling1D()(patches)
        representation = LayerNormalization()(representation)
        representation = Dense(256, activation='gelu')(representation)
        representation = Dropout(0.5)(representation)
        
        predictions = Dense(num_classes, activation='softmax')(representation)
        
        model = Model(inputs=inputs, outputs=predictions)
        
        return model
    
    def _extract_patches(self, images, patch_size):
        """Extract patches from images"""
        batch_size = tf.shape(images)[0]
        patches = tf.image.extract_patches(
            images=images,
            sizes=[1, patch_size, patch_size, 1],
            strides=[1, patch_size, patch_size, 1],
            rates=[1, 1, 1, 1],
            padding="VALID",
        )
        patch_dims = patches.shape[-1]
        patches = tf.reshape(patches, [batch_size, -1, patch_dims])
        return patches
    
    def _transformer_block(self, x, d_model, num_heads):
        """Transformer encoder block"""
        # Multi-head attention
        attn_output = MultiHeadAttention(
            num_heads=num_heads, key_dim=d_model // num_heads
        )(x, x)
        attn_output = Dropout(0.1)(attn_output)
        out1 = LayerNormalization()(x + attn_output)
        
        # Feed forward
        ffn_output = Dense(d_model * 2, activation='gelu')(out1)
        ffn_output = Dense(d_model)(ffn_output)
        ffn_output = Dropout(0.1)(ffn_output)
        out2 = LayerNormalization()(out1 + ffn_output)
        
        return out2
    
    def create_ensemble_architecture(self, 
                                   num_classes: int,
                                   input_shape: Tuple[int, int, int] = None) -> Model:
        """
        Ensemble architecture combining multiple model types
        """
        if input_shape is None:
            input_shape = self.input_shape
            
        inputs = Input(input_shape)
        
        # ResNet branch
        resnet_base = ResNet50(weights='imagenet', include_top=False, input_shape=input_shape)
        for layer in resnet_base.layers:
            layer.trainable = False
        
        resnet_features = resnet_base(inputs)
        resnet_features = GlobalAveragePooling2D()(resnet_features)
        resnet_features = Dense(256, activation='relu')(resnet_features)
        
        # EfficientNet branch
        efficientnet_base = EfficientNetB0(weights='imagenet', include_top=False, input_shape=input_shape)
        for layer in efficientnet_base.layers:
            layer.trainable = False
            
        efficient_features = efficientnet_base(inputs)
        efficient_features = GlobalAveragePooling2D()(efficient_features)
        efficient_features = Dense(256, activation='relu')(efficient_features)
        
        # Custom CNN branch
        cnn_features = Conv2D(64, (3, 3), activation='relu', padding='same')(inputs)
        cnn_features = MaxPooling2D((2, 2))(cnn_features)
        cnn_features = Conv2D(128, (3, 3), activation='relu', padding='same')(cnn_features)
        cnn_features = MaxPooling2D((2, 2))(cnn_features)
        cnn_features = Conv2D(256, (3, 3), activation='relu', padding='same')(cnn_features)
        cnn_features = GlobalAveragePooling2D()(cnn_features)
        cnn_features = Dense(256, activation='relu')(cnn_features)
        
        # Combine features
        combined = concatenate([resnet_features, efficient_features, cnn_features])
        combined = Dense(512, activation='relu')(combined)
        combined = Dropout(0.5)(combined)
        combined = Dense(256, activation='relu')(combined)
        combined = Dropout(0.3)(combined)
        
        predictions = Dense(num_classes, activation='softmax')(combined)
        
        model = Model(inputs=inputs, outputs=predictions)
        
        return model
    
    def create_lightweight_mobile_model(self, 
                                      num_classes: int,
                                      input_shape: Tuple[int, int, int] = None) -> Model:
        """
        Lightweight model optimized for mobile deployment
        """
        if input_shape is None:
            input_shape = self.input_shape
            
        model = Sequential([
            # Depthwise separable convolutions for efficiency
            Conv2D(32, (3, 3), activation='relu', padding='same', input_shape=input_shape),
            DepthwiseConv2D((3, 3), activation='relu', padding='same'),
            Conv2D(64, (1, 1), activation='relu'),
            MaxPooling2D((2, 2)),
            
            DepthwiseConv2D((3, 3), activation='relu', padding='same'),
            Conv2D(128, (1, 1), activation='relu'),
            MaxPooling2D((2, 2)),
            
            DepthwiseConv2D((3, 3), activation='relu', padding='same'),
            Conv2D(256, (1, 1), activation='relu'),
            MaxPooling2D((2, 2)),
            
            GlobalAveragePooling2D(),
            Dense(128, activation='relu'),
            Dropout(0.5),
            Dense(num_classes, activation='softmax')
        ])
        
        return model
    
    def get_model_summary(self, model: Model) -> Dict:
        """Get detailed model summary including parameters and FLOPs"""
        model.summary()
        
        total_params = model.count_params()
        trainable_params = sum([tf.keras.utils.count_params(w) for w in model.trainable_weights])
        non_trainable_params = total_params - trainable_params
        
        return {
            'total_parameters': total_params,
            'trainable_parameters': trainable_params,
            'non_trainable_parameters': non_trainable_params,
            'model_size_mb': total_params * 4 / 1024 / 1024,  # Assuming float32
            'layers': len(model.layers)
        }

# Utility functions for model creation
def create_pavement_model(architecture: str, 
                         num_classes: int,
                         input_shape: Tuple[int, int, int] = (224, 224, 3)) -> Model:
    """
    Factory function to create pavement analysis models
    """
    architectures = PavementModelArchitectures()
    
    if architecture == 'resnet':
        return architectures.create_pavement_resnet(num_classes, input_shape)
    elif architecture == 'efficientnet':
        return architectures.create_pavement_efficientnet(num_classes, input_shape)
    elif architecture == 'unet':
        return architectures.create_crack_detection_unet(input_shape)
    elif architecture == 'attention_cnn':
        return architectures.create_attention_cnn(num_classes, input_shape)
    elif architecture == 'multi_task':
        return architectures.create_multi_task_model(5, 6, input_shape)  # 5 conditions, 6 crack types
    elif architecture == 'vision_transformer':
        return architectures.create_vision_transformer(num_classes, input_shape)
    elif architecture == 'ensemble':
        return architectures.create_ensemble_architecture(num_classes, input_shape)
    elif architecture == 'mobile':
        return architectures.create_lightweight_mobile_model(num_classes, input_shape)
    else:
        raise ValueError(f"Unknown architecture: {architecture}")

if __name__ == "__main__":
    # Example usage
    architectures = PavementModelArchitectures()
    
    # Create different models
    models = {
        'resnet': architectures.create_pavement_resnet(5),
        'efficientnet': architectures.create_pavement_efficientnet(5),
        'attention_cnn': architectures.create_attention_cnn(5),
        'mobile': architectures.create_lightweight_mobile_model(5)
    }
    
    # Print model summaries
    for name, model in models.items():
        print(f"\n{name.upper()} MODEL:")
        summary = architectures.get_model_summary(model)
        print(f"Parameters: {summary['total_parameters']:,}")
        print(f"Model size: {summary['model_size_mb']:.2f} MB")
        print(f"Layers: {summary['layers']}")