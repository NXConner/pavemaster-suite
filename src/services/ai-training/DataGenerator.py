#!/usr/bin/env python3
"""
PaveMaster Suite - Pavement Data Generator
Synthetic data generation and augmentation for pavement condition training
"""

import os
import numpy as np
import cv2
import random
from typing import Tuple, List, Dict
import json
from PIL import Image, ImageDraw, ImageFilter, ImageEnhance
import matplotlib.pyplot as plt
from datetime import datetime
import logging

class PavementDataGenerator:
    """
    Generate synthetic pavement data and augment real pavement images
    """
    
    def __init__(self):
        self.setup_logging()
        
        # Crack patterns for synthesis
        self.crack_patterns = {
            'longitudinal': self._generate_longitudinal_crack,
            'transverse': self._generate_transverse_crack,
            'alligator': self._generate_alligator_crack,
            'block': self._generate_block_crack,
            'pothole': self._generate_pothole
        }
        
        # Pavement textures
        self.texture_types = ['asphalt', 'concrete', 'chip_seal', 'overlay']
        
    def setup_logging(self):
        """Setup logging"""
        logging.basicConfig(level=logging.INFO)
        self.logger = logging.getLogger(__name__)
    
    def generate_synthetic_dataset(self, 
                                 output_dir: str, 
                                 num_samples_per_class: int = 1000,
                                 image_size: Tuple[int, int] = (224, 224)) -> Dict:
        """Generate complete synthetic pavement dataset"""
        
        self.logger.info(f"Generating synthetic dataset with {num_samples_per_class} samples per class")
        
        # Create output directories
        os.makedirs(output_dir, exist_ok=True)
        
        condition_dir = os.path.join(output_dir, "condition_assessment")
        crack_dir = os.path.join(output_dir, "crack_detection")
        
        for dir_path in [condition_dir, crack_dir]:
            os.makedirs(dir_path, exist_ok=True)
        
        # Generate condition assessment data
        condition_classes = ['excellent', 'good', 'fair', 'poor', 'failed']
        for condition in condition_classes:
            class_dir = os.path.join(condition_dir, condition)
            os.makedirs(class_dir, exist_ok=True)
            
            for i in range(num_samples_per_class):
                img = self._generate_condition_image(condition, image_size)
                img_path = os.path.join(class_dir, f"{condition}_{i:05d}.png")
                cv2.imwrite(img_path, img)
        
        # Generate crack detection data
        crack_classes = ['no_cracks', 'longitudinal', 'transverse', 'alligator', 'block', 'pothole']
        for crack_type in crack_classes:
            class_dir = os.path.join(crack_dir, crack_type)
            os.makedirs(class_dir, exist_ok=True)
            
            for i in range(num_samples_per_class):
                img = self._generate_crack_image(crack_type, image_size)
                img_path = os.path.join(class_dir, f"{crack_type}_{i:05d}.png")
                cv2.imwrite(img_path, img)
        
        # Generate metadata
        metadata = {
            'generation_date': datetime.now().isoformat(),
            'num_samples_per_class': num_samples_per_class,
            'image_size': image_size,
            'condition_classes': condition_classes,
            'crack_classes': crack_classes,
            'total_images': len(condition_classes) * num_samples_per_class + len(crack_classes) * num_samples_per_class
        }
        
        with open(os.path.join(output_dir, 'dataset_metadata.json'), 'w') as f:
            json.dump(metadata, f, indent=2)
        
        self.logger.info(f"Synthetic dataset generated successfully in {output_dir}")
        return metadata
    
    def _generate_base_pavement(self, 
                              size: Tuple[int, int], 
                              texture_type: str = 'asphalt') -> np.ndarray:
        """Generate base pavement texture"""
        
        height, width = size
        
        if texture_type == 'asphalt':
            # Dark grey base with noise
            base_color = np.random.randint(40, 80)
            img = np.full((height, width, 3), base_color, dtype=np.uint8)
            
            # Add texture noise
            noise = np.random.randint(-20, 20, (height, width, 3))
            img = np.clip(img + noise, 0, 255).astype(np.uint8)
            
            # Add aggregate texture
            for _ in range(width * height // 1000):
                x = random.randint(0, width - 1)
                y = random.randint(0, height - 1)
                size = random.randint(1, 3)
                color = random.randint(60, 120)
                cv2.circle(img, (x, y), size, (color, color, color), -1)
                
        elif texture_type == 'concrete':
            # Light grey base
            base_color = np.random.randint(120, 180)
            img = np.full((height, width, 3), base_color, dtype=np.uint8)
            
            # Add concrete texture
            noise = np.random.randint(-30, 30, (height, width, 3))
            img = np.clip(img + noise, 0, 255).astype(np.uint8)
            
        else:
            # Default asphalt
            base_color = np.random.randint(50, 90)
            img = np.full((height, width, 3), base_color, dtype=np.uint8)
            noise = np.random.randint(-15, 15, (height, width, 3))
            img = np.clip(img + noise, 0, 255).astype(np.uint8)
        
        return img
    
    def _generate_condition_image(self, condition: str, size: Tuple[int, int]) -> np.ndarray:
        """Generate image for specific pavement condition"""
        
        img = self._generate_base_pavement(size)
        
        if condition == 'excellent':
            # Minimal wear, good texture
            pass
            
        elif condition == 'good':
            # Minor wear patterns
            self._add_minor_wear(img)
            
        elif condition == 'fair':
            # Some cracking and wear
            self._add_minor_cracks(img)
            self._add_wear_patterns(img)
            
        elif condition == 'poor':
            # Significant cracking and deterioration
            self._add_moderate_cracks(img)
            self._add_surface_deterioration(img)
            
        elif condition == 'failed':
            # Severe damage
            self._add_severe_cracks(img)
            self._add_potholes(img)
            self._add_severe_deterioration(img)
        
        return img
    
    def _generate_crack_image(self, crack_type: str, size: Tuple[int, int]) -> np.ndarray:
        """Generate image with specific crack type"""
        
        img = self._generate_base_pavement(size)
        
        if crack_type != 'no_cracks':
            crack_func = self.crack_patterns.get(crack_type)
            if crack_func:
                crack_func(img)
        
        return img
    
    def _generate_longitudinal_crack(self, img: np.ndarray):
        """Add longitudinal cracks (parallel to traffic direction)"""
        height, width = img.shape[:2]
        
        # Generate 1-3 longitudinal cracks
        num_cracks = random.randint(1, 3)
        
        for _ in range(num_cracks):
            # Crack runs vertically with some variation
            start_x = random.randint(width // 4, 3 * width // 4)
            crack_width = random.randint(2, 6)
            
            points = []
            for y in range(0, height, 10):
                x_offset = random.randint(-15, 15)
                x = max(0, min(width - 1, start_x + x_offset))
                points.append((x, y))
            
            # Draw crack
            for i in range(len(points) - 1):
                cv2.line(img, points[i], points[i + 1], (20, 20, 20), crack_width)
    
    def _generate_transverse_crack(self, img: np.ndarray):
        """Add transverse cracks (perpendicular to traffic direction)"""
        height, width = img.shape[:2]
        
        # Generate 1-2 transverse cracks
        num_cracks = random.randint(1, 2)
        
        for _ in range(num_cracks):
            # Crack runs horizontally with some variation
            start_y = random.randint(height // 4, 3 * height // 4)
            crack_width = random.randint(2, 5)
            
            points = []
            for x in range(0, width, 10):
                y_offset = random.randint(-10, 10)
                y = max(0, min(height - 1, start_y + y_offset))
                points.append((x, y))
            
            # Draw crack
            for i in range(len(points) - 1):
                cv2.line(img, points[i], points[i + 1], (15, 15, 15), crack_width)
    
    def _generate_alligator_crack(self, img: np.ndarray):
        """Add alligator/fatigue cracking (interconnected pattern)"""
        height, width = img.shape[:2]
        
        # Create interconnected crack pattern
        center_x = random.randint(width // 4, 3 * width // 4)
        center_y = random.randint(height // 4, 3 * height // 4)
        
        # Generate polygonal pattern
        num_segments = random.randint(8, 15)
        
        for _ in range(num_segments):
            # Random lines from center area
            start_x = center_x + random.randint(-50, 50)
            start_y = center_y + random.randint(-50, 50)
            end_x = center_x + random.randint(-80, 80)
            end_y = center_y + random.randint(-80, 80)
            
            # Ensure points are within bounds
            start_x = max(0, min(width - 1, start_x))
            start_y = max(0, min(height - 1, start_y))
            end_x = max(0, min(width - 1, end_x))
            end_y = max(0, min(height - 1, end_y))
            
            cv2.line(img, (start_x, start_y), (end_x, end_y), (25, 25, 25), random.randint(2, 4))
    
    def _generate_block_crack(self, img: np.ndarray):
        """Add block cracking (rectangular pattern)"""
        height, width = img.shape[:2]
        
        # Create grid pattern
        block_size_x = random.randint(30, 60)
        block_size_y = random.randint(30, 60)
        
        # Vertical lines
        for x in range(block_size_x, width, block_size_x):
            x_var = x + random.randint(-5, 5)
            cv2.line(img, (x_var, 0), (x_var, height), (20, 20, 20), random.randint(1, 3))
        
        # Horizontal lines
        for y in range(block_size_y, height, block_size_y):
            y_var = y + random.randint(-5, 5)
            cv2.line(img, (0, y_var), (width, y_var), (20, 20, 20), random.randint(1, 3))
    
    def _generate_pothole(self, img: np.ndarray):
        """Add potholes"""
        height, width = img.shape[:2]
        
        # Generate 1-3 potholes
        num_potholes = random.randint(1, 3)
        
        for _ in range(num_potholes):
            center_x = random.randint(30, width - 30)
            center_y = random.randint(30, height - 30)
            radius = random.randint(15, 35)
            
            # Create irregular pothole shape
            points = []
            for angle in range(0, 360, 20):
                r = radius + random.randint(-8, 8)
                x = int(center_x + r * np.cos(np.radians(angle)))
                y = int(center_y + r * np.sin(np.radians(angle)))
                points.append([x, y])
            
            points = np.array(points, np.int32)
            
            # Fill pothole with dark color
            cv2.fillPoly(img, [points], (10, 10, 10))
            
            # Add depth effect
            cv2.ellipse(img, (center_x, center_y), (radius//2, radius//2), 0, 0, 360, (5, 5, 5), -1)
    
    def _add_minor_wear(self, img: np.ndarray):
        """Add minor wear patterns"""
        height, width = img.shape[:2]
        
        # Light surface wear
        for _ in range(random.randint(20, 50)):
            x = random.randint(0, width - 1)
            y = random.randint(0, height - 1)
            size = random.randint(3, 8)
            cv2.circle(img, (x, y), size, (img[y,x] - 15).clip(0, 255), -1)
    
    def _add_minor_cracks(self, img: np.ndarray):
        """Add minor cracks"""
        height, width = img.shape[:2]
        
        for _ in range(random.randint(2, 5)):
            start_x = random.randint(0, width)
            start_y = random.randint(0, height)
            end_x = start_x + random.randint(-50, 50)
            end_y = start_y + random.randint(-20, 20)
            
            end_x = max(0, min(width - 1, end_x))
            end_y = max(0, min(height - 1, end_y))
            
            cv2.line(img, (start_x, start_y), (end_x, end_y), (30, 30, 30), 1)
    
    def _add_wear_patterns(self, img: np.ndarray):
        """Add moderate wear patterns"""
        height, width = img.shape[:2]
        
        # Surface texture loss
        for _ in range(random.randint(50, 100)):
            x = random.randint(0, width - 1)
            y = random.randint(0, height - 1)
            size = random.randint(5, 15)
            intensity = random.randint(10, 25)
            cv2.circle(img, (x, y), size, (img[y,x] - intensity).clip(0, 255), -1)
    
    def _add_moderate_cracks(self, img: np.ndarray):
        """Add moderate cracking"""
        self._add_minor_cracks(img)
        
        # Additional larger cracks
        for _ in range(random.randint(3, 7)):
            start_x = random.randint(0, img.shape[1])
            start_y = random.randint(0, img.shape[0])
            end_x = start_x + random.randint(-80, 80)
            end_y = start_y + random.randint(-40, 40)
            
            end_x = max(0, min(img.shape[1] - 1, end_x))
            end_y = max(0, min(img.shape[0] - 1, end_y))
            
            cv2.line(img, (start_x, start_y), (end_x, end_y), (25, 25, 25), random.randint(2, 4))
    
    def _add_surface_deterioration(self, img: np.ndarray):
        """Add surface deterioration"""
        height, width = img.shape[:2]
        
        # Aggregate loss
        for _ in range(random.randint(100, 200)):
            x = random.randint(0, width - 1)
            y = random.randint(0, height - 1)
            size = random.randint(8, 20)
            cv2.circle(img, (x, y), size, (img[y,x] - 30).clip(0, 255), -1)
    
    def _add_severe_cracks(self, img: np.ndarray):
        """Add severe cracking"""
        self._add_moderate_cracks(img)
        
        # Wide, deep cracks
        for _ in range(random.randint(5, 10)):
            start_x = random.randint(0, img.shape[1])
            start_y = random.randint(0, img.shape[0])
            end_x = start_x + random.randint(-100, 100)
            end_y = start_y + random.randint(-60, 60)
            
            end_x = max(0, min(img.shape[1] - 1, end_x))
            end_y = max(0, min(img.shape[0] - 1, end_y))
            
            cv2.line(img, (start_x, start_y), (end_x, end_y), (15, 15, 15), random.randint(4, 8))
    
    def _add_potholes(self, img: np.ndarray):
        """Add multiple potholes"""
        for _ in range(random.randint(1, 4)):
            self._generate_pothole(img)
    
    def _add_severe_deterioration(self, img: np.ndarray):
        """Add severe surface deterioration"""
        height, width = img.shape[:2]
        
        # Extensive aggregate loss and surface damage
        for _ in range(random.randint(200, 400)):
            x = random.randint(0, width - 1)
            y = random.randint(0, height - 1)
            size = random.randint(10, 30)
            cv2.circle(img, (x, y), size, (img[y,x] - 40).clip(0, 255), -1)
    
    def augment_real_data(self, input_dir: str, output_dir: str, augmentation_factor: int = 5):
        """Augment real pavement data with various transformations"""
        
        self.logger.info(f"Augmenting real data from {input_dir}")
        
        os.makedirs(output_dir, exist_ok=True)
        
        # Process each subdirectory
        for root, dirs, files in os.walk(input_dir):
            for file in files:
                if file.lower().endswith(('.png', '.jpg', '.jpeg')):
                    img_path = os.path.join(root, file)
                    
                    # Maintain directory structure
                    rel_path = os.path.relpath(root, input_dir)
                    out_dir = os.path.join(output_dir, rel_path)
                    os.makedirs(out_dir, exist_ok=True)
                    
                    # Load original image
                    img = cv2.imread(img_path)
                    if img is None:
                        continue
                    
                    # Copy original
                    base_name = os.path.splitext(file)[0]
                    cv2.imwrite(os.path.join(out_dir, f"{base_name}_original.png"), img)
                    
                    # Generate augmented versions
                    for i in range(augmentation_factor):
                        aug_img = self._apply_augmentations(img.copy())
                        cv2.imwrite(os.path.join(out_dir, f"{base_name}_aug_{i:03d}.png"), aug_img)
        
        self.logger.info(f"Data augmentation completed. Output saved to {output_dir}")
    
    def _apply_augmentations(self, img: np.ndarray) -> np.ndarray:
        """Apply random augmentations to an image"""
        
        # Brightness adjustment
        if random.random() < 0.5:
            factor = random.uniform(0.7, 1.3)
            img = cv2.convertScaleAbs(img, alpha=factor, beta=0)
        
        # Contrast adjustment
        if random.random() < 0.5:
            factor = random.uniform(0.8, 1.2)
            img = cv2.convertScaleAbs(img, alpha=factor, beta=0)
        
        # Gaussian noise
        if random.random() < 0.3:
            noise = np.random.normal(0, random.uniform(5, 15), img.shape)
            img = np.clip(img + noise, 0, 255).astype(np.uint8)
        
        # Blur
        if random.random() < 0.2:
            ksize = random.choice([3, 5])
            img = cv2.GaussianBlur(img, (ksize, ksize), 0)
        
        # Rotation (small angles)
        if random.random() < 0.4:
            angle = random.uniform(-10, 10)
            center = (img.shape[1] // 2, img.shape[0] // 2)
            M = cv2.getRotationMatrix2D(center, angle, 1.0)
            img = cv2.warpAffine(img, M, (img.shape[1], img.shape[0]))
        
        # Horizontal flip
        if random.random() < 0.5:
            img = cv2.flip(img, 1)
        
        return img

if __name__ == "__main__":
    generator = PavementDataGenerator()
    
    # Generate synthetic dataset
    generator.generate_synthetic_dataset(
        output_dir="synthetic_pavement_data",
        num_samples_per_class=500,
        image_size=(224, 224)
    )
    
    print("Synthetic pavement dataset generated successfully!")