#!/usr/bin/env python3
"""
PaveMaster Suite - Real Pavement Data Collection System
Comprehensive data collection, organization, and preparation for AI training
"""

import os
import shutil
import json
import logging
import pandas as pd
import numpy as np
from pathlib import Path
from datetime import datetime
from typing import Dict, List, Tuple, Optional, Union
import cv2
from PIL import Image, ExifTags
import zipfile
import requests
from concurrent.futures import ThreadPoolExecutor, as_completed
import hashlib
import sqlite3
from geopy.geocoders import Nominatim
import yaml

class PavementDataCollector:
    """Comprehensive real pavement data collection and organization system"""
    
    def __init__(self, base_dir: str = "./pavement_datasets"):
        self.base_dir = Path(base_dir)
        self.base_dir.mkdir(parents=True, exist_ok=True)
        
        # Setup logging
        self._setup_logging()
        
        # Initialize database for metadata
        self.db_path = self.base_dir / "metadata.db"
        self._init_database()
        
        # Geocoder for location data
        self.geolocator = Nominatim(user_agent="pavement_data_collector")
        
        # Supported image formats
        self.supported_formats = {'.jpg', '.jpeg', '.png', '.bmp', '.tiff', '.tif'}
        
    def _setup_logging(self):
        """Setup logging configuration"""
        log_file = self.base_dir / f"data_collection_{datetime.now().strftime('%Y%m%d_%H%M%S')}.log"
        
        logging.basicConfig(
            level=logging.INFO,
            format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
            handlers=[
                logging.FileHandler(log_file),
                logging.StreamHandler()
            ]
        )
        
        self.logger = logging.getLogger(__name__)
        
    def _init_database(self):
        """Initialize SQLite database for metadata storage"""
        with sqlite3.connect(self.db_path) as conn:
            conn.execute("""
                CREATE TABLE IF NOT EXISTS pavement_images (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    file_path TEXT UNIQUE,
                    file_hash TEXT,
                    condition_label TEXT,
                    location_lat REAL,
                    location_lon REAL,
                    location_name TEXT,
                    date_captured TEXT,
                    camera_model TEXT,
                    weather_condition TEXT,
                    lighting_condition TEXT,
                    road_type TEXT,
                    surface_material TEXT,
                    traffic_level TEXT,
                    image_width INTEGER,
                    image_height INTEGER,
                    file_size INTEGER,
                    quality_score REAL,
                    source TEXT,
                    annotations TEXT,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            """)
            
            conn.execute("""
                CREATE TABLE IF NOT EXISTS collection_sessions (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    session_name TEXT,
                    description TEXT,
                    start_time TIMESTAMP,
                    end_time TIMESTAMP,
                    total_images INTEGER,
                    location TEXT,
                    collector_name TEXT,
                    equipment_used TEXT,
                    weather_conditions TEXT,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            """)
    
    def create_collection_session(self, session_data: Dict) -> int:
        """Create a new data collection session"""
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.execute("""
                INSERT INTO collection_sessions 
                (session_name, description, start_time, location, collector_name, equipment_used, weather_conditions)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            """, (
                session_data.get('name', f"Session_{datetime.now().strftime('%Y%m%d_%H%M%S')}"),
                session_data.get('description', ''),
                session_data.get('start_time', datetime.now().isoformat()),
                session_data.get('location', ''),
                session_data.get('collector', ''),
                session_data.get('equipment', ''),
                session_data.get('weather', '')
            ))
            
            session_id = cursor.lastrowid
            self.logger.info(f"Created collection session {session_id}: {session_data.get('name')}")
            return session_id
    
    def collect_from_directory(self, source_dir: str, condition_mapping: Dict[str, str] = None, session_id: int = None) -> Dict:
        """Collect pavement images from a directory structure"""
        source_path = Path(source_dir)
        if not source_path.exists():
            raise ValueError(f"Source directory does not exist: {source_dir}")
        
        self.logger.info(f"Collecting data from directory: {source_dir}")
        
        collected_files = []
        stats = {
            'total_processed': 0,
            'successful': 0,
            'failed': 0,
            'duplicates': 0,
            'by_condition': {}
        }
        
        # If condition_mapping is provided, expect subdirectories
        if condition_mapping:
            for condition_dir, condition_label in condition_mapping.items():
                condition_path = source_path / condition_dir
                if condition_path.exists():
                    files = self._collect_images_from_path(
                        condition_path, condition_label, session_id
                    )
                    collected_files.extend(files)
                    stats['by_condition'][condition_label] = len(files)
        else:
            # Attempt to infer structure or collect all images
            if any(source_path.iterdir()):
                # Check if subdirectories represent conditions
                subdirs = [d for d in source_path.iterdir() if d.is_dir()]
                if subdirs:
                    # Assume subdirectories are condition labels
                    for subdir in subdirs:
                        condition_label = subdir.name
                        files = self._collect_images_from_path(
                            subdir, condition_label, session_id
                        )
                        collected_files.extend(files)
                        stats['by_condition'][condition_label] = len(files)
                else:
                    # Collect all images with unknown condition
                    files = self._collect_images_from_path(
                        source_path, 'unknown', session_id
                    )
                    collected_files.extend(files)
                    stats['by_condition']['unknown'] = len(files)
        
        stats['total_processed'] = len(collected_files)
        stats['successful'] = len([f for f in collected_files if f['status'] == 'success'])
        stats['failed'] = len([f for f in collected_files if f['status'] == 'failed'])
        
        self.logger.info(f"Collection completed: {stats['successful']} successful, {stats['failed']} failed")
        return stats
    
    def _collect_images_from_path(self, path: Path, condition: str, session_id: int = None) -> List[Dict]:
        """Collect images from a specific path"""
        collected = []
        
        for img_file in path.rglob('*'):
            if img_file.suffix.lower() in self.supported_formats:
                try:
                    result = self._process_single_image(
                        img_file, condition, session_id
                    )
                    collected.append(result)
                except Exception as e:
                    self.logger.warning(f"Failed to process {img_file}: {e}")
                    collected.append({
                        'file_path': str(img_file),
                        'status': 'failed',
                        'error': str(e)
                    })
        
        return collected
    
    def _process_single_image(self, img_path: Path, condition: str, session_id: int = None) -> Dict:
        """Process a single image file"""
        try:
            # Calculate file hash for duplicate detection
            file_hash = self._calculate_file_hash(img_path)
            
            # Check for duplicates
            if self._is_duplicate(file_hash):
                return {
                    'file_path': str(img_path),
                    'status': 'duplicate',
                    'hash': file_hash
                }
            
            # Extract metadata
            metadata = self._extract_image_metadata(img_path)
            
            # Copy to organized structure
            dest_path = self._organize_file(img_path, condition, metadata)
            
            # Store in database
            self._store_image_metadata(
                dest_path, file_hash, condition, metadata, session_id
            )
            
            return {
                'file_path': str(dest_path),
                'original_path': str(img_path),
                'status': 'success',
                'condition': condition,
                'hash': file_hash,
                'metadata': metadata
            }
            
        except Exception as e:
            self.logger.error(f"Error processing {img_path}: {e}")
            raise
    
    def _calculate_file_hash(self, file_path: Path) -> str:
        """Calculate SHA-256 hash of file"""
        hash_sha256 = hashlib.sha256()
        with open(file_path, "rb") as f:
            for chunk in iter(lambda: f.read(4096), b""):
                hash_sha256.update(chunk)
        return hash_sha256.hexdigest()
    
    def _is_duplicate(self, file_hash: str) -> bool:
        """Check if file hash already exists in database"""
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.execute(
                "SELECT COUNT(*) FROM pavement_images WHERE file_hash = ?",
                (file_hash,)
            )
            return cursor.fetchone()[0] > 0
    
    def _extract_image_metadata(self, img_path: Path) -> Dict:
        """Extract comprehensive metadata from image"""
        metadata = {
            'file_size': img_path.stat().st_size,
            'date_captured': None,
            'camera_model': None,
            'location_lat': None,
            'location_lon': None,
            'image_width': None,
            'image_height': None,
            'quality_metrics': {}
        }
        
        try:
            # Load image with PIL to extract EXIF data
            with Image.open(img_path) as img:
                metadata['image_width'] = img.width
                metadata['image_height'] = img.height
                
                # Extract EXIF data
                if hasattr(img, '_getexif') and img._getexif() is not None:
                    exif_data = img._getexif()
                    
                    # Get readable EXIF tags
                    exif = {
                        ExifTags.TAGS[k]: v
                        for k, v in exif_data.items()
                        if k in ExifTags.TAGS
                    }
                    
                    # Extract specific metadata
                    metadata['date_captured'] = exif.get('DateTime')
                    metadata['camera_model'] = exif.get('Model')
                    
                    # Extract GPS coordinates if available
                    gps_info = exif.get('GPSInfo')
                    if gps_info:
                        metadata['location_lat'], metadata['location_lon'] = self._parse_gps_info(gps_info)
            
            # Load with OpenCV for quality assessment
            cv_img = cv2.imread(str(img_path))
            if cv_img is not None:
                metadata['quality_metrics'] = self._assess_image_quality(cv_img)
            
        except Exception as e:
            self.logger.warning(f"Could not extract metadata from {img_path}: {e}")
        
        return metadata
    
    def _parse_gps_info(self, gps_info: Dict) -> Tuple[Optional[float], Optional[float]]:
        """Parse GPS coordinates from EXIF data"""
        try:
            def convert_to_degrees(value):
                d, m, s = value
                return d + (m / 60.0) + (s / 3600.0)
            
            lat = convert_to_degrees(gps_info[2])
            if gps_info[1] == 'S':
                lat = -lat
            
            lon = convert_to_degrees(gps_info[4])
            if gps_info[3] == 'W':
                lon = -lon
            
            return lat, lon
            
        except (KeyError, TypeError, ValueError):
            return None, None
    
    def _assess_image_quality(self, image: np.ndarray) -> Dict[str, float]:
        """Assess image quality for pavement analysis"""
        try:
            # Convert to grayscale
            gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
            
            # Blur detection using Laplacian variance
            blur_score = cv2.Laplacian(gray, cv2.CV_64F).var()
            
            # Brightness analysis
            brightness = np.mean(gray)
            
            # Contrast analysis
            contrast = np.std(gray)
            
            # Edge density
            edges = cv2.Canny(gray, 50, 150)
            edge_density = np.sum(edges > 0) / edges.size
            
            # Overall quality score
            quality_score = (
                min(blur_score / 100.0, 1.0) * 0.3 +
                (1.0 - abs(brightness - 127.5) / 127.5) * 0.2 +
                (contrast / 255.0) * 0.3 +
                edge_density * 0.2
            )
            
            return {
                'blur_score': float(blur_score),
                'brightness': float(brightness),
                'contrast': float(contrast),
                'edge_density': float(edge_density),
                'overall_quality': float(quality_score)
            }
            
        except Exception as e:
            self.logger.warning(f"Quality assessment failed: {e}")
            return {}
    
    def _organize_file(self, src_path: Path, condition: str, metadata: Dict) -> Path:
        """Organize file into structured directory"""
        # Create organized directory structure
        date_str = datetime.now().strftime('%Y/%m/%d')
        organized_dir = self.base_dir / 'organized' / condition / date_str
        organized_dir.mkdir(parents=True, exist_ok=True)
        
        # Generate unique filename
        timestamp = datetime.now().strftime('%H%M%S')
        dest_filename = f"{timestamp}_{src_path.stem}{src_path.suffix}"
        dest_path = organized_dir / dest_filename
        
        # Copy file
        shutil.copy2(src_path, dest_path)
        
        return dest_path
    
    def _store_image_metadata(self, file_path: Path, file_hash: str, condition: str, metadata: Dict, session_id: int = None):
        """Store image metadata in database"""
        quality_metrics = metadata.get('quality_metrics', {})
        
        with sqlite3.connect(self.db_path) as conn:
            conn.execute("""
                INSERT INTO pavement_images (
                    file_path, file_hash, condition_label, location_lat, location_lon,
                    date_captured, camera_model, image_width, image_height, file_size,
                    quality_score, source, annotations
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                str(file_path),
                file_hash,
                condition,
                metadata.get('location_lat'),
                metadata.get('location_lon'),
                metadata.get('date_captured'),
                metadata.get('camera_model'),
                metadata.get('image_width'),
                metadata.get('image_height'),
                metadata.get('file_size'),
                quality_metrics.get('overall_quality'),
                f"session_{session_id}" if session_id else "manual",
                json.dumps(metadata)
            ))
    
    def collect_from_mobile_app(self, app_data_dir: str, session_id: int = None) -> Dict:
        """Collect data from mobile app uploads"""
        self.logger.info(f"Collecting data from mobile app directory: {app_data_dir}")
        
        app_path = Path(app_data_dir)
        if not app_path.exists():
            raise ValueError(f"Mobile app data directory does not exist: {app_data_dir}")
        
        stats = {'successful': 0, 'failed': 0, 'by_condition': {}}
        
        # Look for mobile app data structure
        # Expected: app_data_dir/user_uploads/[user_id]/[timestamp]/
        for user_dir in app_path.glob('user_uploads/*/'):
            for upload_dir in user_dir.glob('*/'):
                # Process metadata file if exists
                metadata_file = upload_dir / 'metadata.json'
                upload_metadata = {}
                
                if metadata_file.exists():
                    with open(metadata_file, 'r') as f:
                        upload_metadata = json.load(f)
                
                # Process images in upload
                for img_file in upload_dir.glob('*'):
                    if img_file.suffix.lower() in self.supported_formats:
                        try:
                            condition = upload_metadata.get('condition', 'unknown')
                            result = self._process_single_image(img_file, condition, session_id)
                            
                            if result['status'] == 'success':
                                stats['successful'] += 1
                                stats['by_condition'][condition] = stats['by_condition'].get(condition, 0) + 1
                            else:
                                stats['failed'] += 1
                                
                        except Exception as e:
                            self.logger.error(f"Failed to process mobile upload {img_file}: {e}")
                            stats['failed'] += 1
        
        return stats
    
    def collect_from_drone_survey(self, drone_data_dir: str, flight_metadata: Dict, session_id: int = None) -> Dict:
        """Collect data from drone surveys"""
        self.logger.info(f"Collecting drone survey data from: {drone_data_dir}")
        
        drone_path = Path(drone_data_dir)
        if not drone_path.exists():
            raise ValueError(f"Drone data directory does not exist: {drone_data_dir}")
        
        stats = {'successful': 0, 'failed': 0, 'total_area_covered': 0}
        
        # Process drone images with flight metadata
        for img_file in drone_path.glob('**/*'):
            if img_file.suffix.lower() in self.supported_formats:
                try:
                    # Drone images typically need condition assessment
                    condition = 'needs_assessment'
                    
                    result = self._process_single_image(img_file, condition, session_id)
                    
                    # Add drone-specific metadata
                    if result['status'] == 'success':
                        self._add_drone_metadata(result['file_path'], flight_metadata)
                        stats['successful'] += 1
                    else:
                        stats['failed'] += 1
                        
                except Exception as e:
                    self.logger.error(f"Failed to process drone image {img_file}: {e}")
                    stats['failed'] += 1
        
        return stats
    
    def _add_drone_metadata(self, file_path: str, flight_metadata: Dict):
        """Add drone-specific metadata to database"""
        with sqlite3.connect(self.db_path) as conn:
            # Update existing record with drone metadata
            drone_data = json.dumps(flight_metadata)
            conn.execute("""
                UPDATE pavement_images 
                SET annotations = json_patch(annotations, ?) 
                WHERE file_path = ?
            """, (drone_data, file_path))
    
    def download_public_datasets(self, dataset_configs: List[Dict], session_id: int = None) -> Dict:
        """Download and integrate public pavement datasets"""
        self.logger.info("Downloading public pavement datasets...")
        
        stats = {'downloaded': 0, 'failed': 0, 'total_size': 0}
        
        for config in dataset_configs:
            try:
                dataset_stats = self._download_single_dataset(config, session_id)
                stats['downloaded'] += dataset_stats['downloaded']
                stats['failed'] += dataset_stats['failed']
                stats['total_size'] += dataset_stats['size']
                
            except Exception as e:
                self.logger.error(f"Failed to download dataset {config.get('name', 'unknown')}: {e}")
                stats['failed'] += 1
        
        return stats
    
    def _download_single_dataset(self, config: Dict, session_id: int = None) -> Dict:
        """Download a single public dataset"""
        dataset_name = config['name']
        download_url = config['url']
        dataset_type = config.get('type', 'zip')
        
        self.logger.info(f"Downloading dataset: {dataset_name}")
        
        # Create download directory
        download_dir = self.base_dir / 'downloads' / dataset_name
        download_dir.mkdir(parents=True, exist_ok=True)
        
        # Download file
        response = requests.get(download_url, stream=True)
        response.raise_for_status()
        
        download_path = download_dir / f"{dataset_name}.{dataset_type}"
        
        with open(download_path, 'wb') as f:
            for chunk in response.iter_content(chunk_size=8192):
                f.write(chunk)
        
        # Extract if it's a zip file
        if dataset_type == 'zip':
            with zipfile.ZipFile(download_path, 'r') as zip_ref:
                zip_ref.extractall(download_dir)
        
        # Process extracted data
        condition_mapping = config.get('condition_mapping', {})
        stats = self.collect_from_directory(
            str(download_dir), condition_mapping, session_id
        )
        
        return {
            'downloaded': stats['successful'],
            'failed': stats['failed'],
            'size': download_path.stat().st_size if download_path.exists() else 0
        }
    
    def create_training_dataset(self, output_dir: str, train_split: float = 0.7, val_split: float = 0.15, test_split: float = 0.15) -> Dict:
        """Create organized training dataset from collected data"""
        self.logger.info("Creating training dataset from collected data...")
        
        output_path = Path(output_dir)
        output_path.mkdir(parents=True, exist_ok=True)
        
        # Query all images from database
        with sqlite3.connect(self.db_path) as conn:
            df = pd.read_sql_query("""
                SELECT file_path, condition_label, quality_score, annotations
                FROM pavement_images
                WHERE quality_score > 0.5
                ORDER BY condition_label, quality_score DESC
            """, conn)
        
        # Split data by condition to maintain distribution
        dataset_splits = {'train': [], 'validation': [], 'test': []}
        
        for condition in df['condition_label'].unique():
            condition_data = df[df['condition_label'] == condition]
            n_samples = len(condition_data)
            
            # Calculate split indices
            train_end = int(n_samples * train_split)
            val_end = train_end + int(n_samples * val_split)
            
            # Split data
            train_data = condition_data.iloc[:train_end]
            val_data = condition_data.iloc[train_end:val_end]
            test_data = condition_data.iloc[val_end:]
            
            dataset_splits['train'].extend(train_data.to_dict('records'))
            dataset_splits['validation'].extend(val_data.to_dict('records'))
            dataset_splits['test'].extend(test_data.to_dict('records'))
        
        # Create directory structure and copy files
        stats = {'train': 0, 'validation': 0, 'test': 0}
        
        for split_name, split_data in dataset_splits.items():
            split_dir = output_path / split_name
            
            for record in split_data:
                condition = record['condition_label']
                src_path = Path(record['file_path'])
                
                # Create condition directory
                dest_dir = split_dir / condition
                dest_dir.mkdir(parents=True, exist_ok=True)
                
                # Copy file
                dest_path = dest_dir / src_path.name
                shutil.copy2(src_path, dest_path)
                
                stats[split_name] += 1
        
        # Create annotations CSV
        annotations_df = pd.DataFrame([
            {
                'split': split_name,
                'condition': record['condition_label'],
                'file_path': f"{split_name}/{record['condition_label']}/{Path(record['file_path']).name}",
                'quality_score': record['quality_score']
            }
            for split_name, split_data in dataset_splits.items()
            for record in split_data
        ])
        
        annotations_df.to_csv(output_path / 'annotations.csv', index=False)
        
        # Create dataset info
        dataset_info = {
            'created_at': datetime.now().isoformat(),
            'total_images': sum(stats.values()),
            'splits': stats,
            'conditions': df['condition_label'].value_counts().to_dict(),
            'quality_stats': {
                'mean_quality': float(df['quality_score'].mean()),
                'min_quality': float(df['quality_score'].min()),
                'max_quality': float(df['quality_score'].max())
            }
        }
        
        with open(output_path / 'dataset_info.json', 'w') as f:
            json.dump(dataset_info, f, indent=2)
        
        self.logger.info(f"Training dataset created: {sum(stats.values())} images")
        return dataset_info
    
    def generate_data_report(self) -> Dict:
        """Generate comprehensive data collection report"""
        with sqlite3.connect(self.db_path) as conn:
            # Basic statistics
            stats = pd.read_sql_query("""
                SELECT 
                    condition_label,
                    COUNT(*) as count,
                    AVG(quality_score) as avg_quality,
                    MIN(quality_score) as min_quality,
                    MAX(quality_score) as max_quality,
                    SUM(file_size) as total_size
                FROM pavement_images
                GROUP BY condition_label
                ORDER BY count DESC
            """, conn)
            
            # Collection sessions
            sessions = pd.read_sql_query("""
                SELECT * FROM collection_sessions
                ORDER BY created_at DESC
            """, conn)
            
            # Quality distribution
            quality_dist = pd.read_sql_query("""
                SELECT 
                    CASE 
                        WHEN quality_score >= 0.8 THEN 'High'
                        WHEN quality_score >= 0.6 THEN 'Medium'
                        WHEN quality_score >= 0.4 THEN 'Low'
                        ELSE 'Very Low'
                    END as quality_category,
                    COUNT(*) as count
                FROM pavement_images
                GROUP BY quality_category
            """, conn)
        
        report = {
            'summary': {
                'total_images': int(stats['count'].sum()),
                'total_size_mb': int(stats['total_size'].sum() / (1024 * 1024)),
                'conditions': len(stats),
                'avg_quality': float(stats['avg_quality'].mean())
            },
            'by_condition': stats.to_dict('records'),
            'quality_distribution': quality_dist.to_dict('records'),
            'collection_sessions': sessions.to_dict('records'),
            'generated_at': datetime.now().isoformat()
        }
        
        # Save report
        report_path = self.base_dir / f"data_report_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
        with open(report_path, 'w') as f:
            json.dump(report, f, indent=2)
        
        self.logger.info(f"Data report generated: {report_path}")
        return report

def main():
    """Example usage and CLI interface"""
    import argparse
    
    parser = argparse.ArgumentParser(description='Collect and organize pavement data')
    parser.add_argument('--collect-dir', help='Directory to collect data from')
    parser.add_argument('--mobile-dir', help='Mobile app data directory')
    parser.add_argument('--drone-dir', help='Drone survey data directory')
    parser.add_argument('--create-dataset', help='Output directory for training dataset')
    parser.add_argument('--generate-report', action='store_true', help='Generate data report')
    parser.add_argument('--base-dir', default='./pavement_datasets', help='Base directory for data storage')
    
    args = parser.parse_args()
    
    # Initialize collector
    collector = PavementDataCollector(args.base_dir)
    
    # Create collection session
    session_data = {
        'name': f"CLI_Collection_{datetime.now().strftime('%Y%m%d_%H%M%S')}",
        'description': 'Data collection via CLI',
        'collector': 'automated_cli',
        'start_time': datetime.now().isoformat()
    }
    session_id = collector.create_collection_session(session_data)
    
    # Collect from directory
    if args.collect_dir:
        stats = collector.collect_from_directory(args.collect_dir, session_id=session_id)
        print(f"Collected {stats['successful']} images from directory")
    
    # Collect from mobile app
    if args.mobile_dir:
        stats = collector.collect_from_mobile_app(args.mobile_dir, session_id=session_id)
        print(f"Collected {stats['successful']} images from mobile app")
    
    # Collect from drone survey
    if args.drone_dir:
        flight_metadata = {
            'altitude': 100,
            'camera_angle': -90,
            'flight_pattern': 'grid',
            'weather': 'clear'
        }
        stats = collector.collect_from_drone_survey(args.drone_dir, flight_metadata, session_id=session_id)
        print(f"Collected {stats['successful']} images from drone survey")
    
    # Create training dataset
    if args.create_dataset:
        dataset_info = collector.create_training_dataset(args.create_dataset)
        print(f"Created training dataset with {dataset_info['total_images']} images")
    
    # Generate report
    if args.generate_report:
        report = collector.generate_data_report()
        print(f"Generated report: {report['summary']['total_images']} total images")

if __name__ == "__main__":
    main()