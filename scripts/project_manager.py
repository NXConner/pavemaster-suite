#!/usr/bin/env python3
import os
import sys
import subprocess
import argparse
import logging
from typing import List, Dict, Any
import yaml
import json
import shutil
import time
from datetime import datetime

class ProjectManager:
    """
    Comprehensive project management tool for Pavement Performance Suite
    Handles deployment, testing, security, and performance optimization
    """
    def __init__(self):
        self.logger = self._setup_logging()
        self.config = self._load_project_config()

    def _setup_logging(self) -> logging.Logger:
        """
        Set up comprehensive logging with multiple handlers
        """
        logger = logging.getLogger('PavementPerformanceSuite')
        logger.setLevel(logging.DEBUG)

        # Console Handler
        console_handler = logging.StreamHandler()
        console_handler.setLevel(logging.INFO)
        console_formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
        console_handler.setFormatter(console_formatter)

        # File Handler
        file_handler = logging.FileHandler('project_manager.log')
        file_handler.setLevel(logging.DEBUG)
        file_formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
        file_handler.setFormatter(file_formatter)

        logger.addHandler(console_handler)
        logger.addHandler(file_handler)

        return logger

    def _load_project_config(self) -> Dict[str, Any]:
        """
        Load project configuration from multiple sources
        """
        config = {}
        config_files = [
            'config/environment_config.py',
            'config/enterprise_integrations.json',
            '.env'
        ]

        for config_file in config_files:
            try:
                if config_file.endswith('.py'):
                    # Load Python config
                    with open(config_file, 'r') as f:
                        exec(f.read(), config)
                elif config_file.endswith('.json'):
                    # Load JSON config
                    with open(config_file, 'r') as f:
                        config.update(json.load(f))
                elif config_file.endswith('.env'):
                    # Load .env file
                    with open(config_file, 'r') as f:
                        for line in f:
                            if line.strip() and not line.startswith('#'):
                                key, value = line.strip().split('=', 1)
                                config[key] = value.strip('"\'')
            except Exception as e:
                self.logger.warning(f"Could not load config from {config_file}: {e}")

        return config

    def deploy(self, environment: str = 'production'):
        """
        Comprehensive deployment process
        """
        self.logger.info(f"Starting deployment to {environment} environment")
        
        try:
            # Pre-deployment checks
            self._run_security_checks()
            self._run_performance_tests()

            # Build and containerize
            self._build_docker_image(environment)
            
            # Deploy to target environment
            if environment == 'production':
                self._deploy_to_production()
            elif environment == 'staging':
                self._deploy_to_staging()
            
            # Post-deployment tasks
            self._run_post_deployment_checks()
            
            self.logger.info(f"Deployment to {environment} completed successfully")
        except Exception as e:
            self.logger.error(f"Deployment failed: {e}")
            sys.exit(1)

    def _run_security_checks(self):
        """
        Run comprehensive security checks before deployment
        """
        self.logger.info("Running security vulnerability scans")
        subprocess.run(['npm', 'audit', '--audit-level=high'], check=True)
        subprocess.run(['bandit', '-r', 'src'], check=True)

    def _run_performance_tests(self):
        """
        Run performance and load tests
        """
        self.logger.info("Running performance tests")
        subprocess.run(['k6', 'run', 'performance_tests/load_test.js'], check=True)

    def _build_docker_image(self, environment: str):
        """
        Build Docker image with environment-specific configurations
        """
        tag = f"pavement-performance-suite:{environment}-{datetime.now().strftime('%Y%m%d-%H%M%S')}"
        build_args = [
            'docker', 'build',
            '-f', f'Dockerfile.{environment}',
            '-t', tag,
            '.'
        ]
        subprocess.run(build_args, check=True)

    def _deploy_to_production(self):
        """
        Deploy to production environment
        """
        self.logger.info("Deploying to production Kubernetes cluster")
        subprocess.run(['kubectl', 'apply', '-f', 'k8s/production'], check=True)

    def _deploy_to_staging(self):
        """
        Deploy to staging environment
        """
        self.logger.info("Deploying to staging Kubernetes cluster")
        subprocess.run(['kubectl', 'apply', '-f', 'k8s/staging'], check=True)

    def _run_post_deployment_checks(self):
        """
        Run comprehensive post-deployment health checks
        """
        self.logger.info("Running post-deployment health checks")
        health_checks = [
            ['curl', '-f', 'http://localhost:8080/health'],
            ['curl', '-f', 'http://localhost:8080/metrics']
        ]
        
        for check in health_checks:
            result = subprocess.run(check, capture_output=True)
            if result.returncode != 0:
                self.logger.error(f"Health check failed: {check}")
                raise Exception("Post-deployment health check failed")

    def backup(self, backup_dir: str = 'backups'):
        """
        Create comprehensive project backup
        """
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        backup_path = os.path.join(backup_dir, f'backup_{timestamp}')
        
        try:
            os.makedirs(backup_path, exist_ok=True)
            
            # Backup key directories and files
            backup_items = [
                'src', 
                'config', 
                'database', 
                '.env', 
                'package.json', 
                'requirements.txt'
            ]
            
            for item in backup_items:
                if os.path.exists(item):
                    if os.path.isdir(item):
                        shutil.copytree(item, os.path.join(backup_path, item))
                    else:
                        shutil.copy2(item, backup_path)
            
            # Create backup manifest
            manifest = {
                'timestamp': timestamp,
                'backed_up_items': backup_items,
                'total_size': sum(os.path.getsize(os.path.join(backup_path, f)) for f in os.listdir(backup_path))
            }
            
            with open(os.path.join(backup_path, 'backup_manifest.json'), 'w') as f:
                json.dump(manifest, f, indent=4)
            
            self.logger.info(f"Backup created successfully at {backup_path}")
        except Exception as e:
            self.logger.error(f"Backup failed: {e}")

def main():
    parser = argparse.ArgumentParser(description='Pavement Performance Suite Project Manager')
    parser.add_argument('action', choices=['deploy', 'backup'], help='Action to perform')
    parser.add_argument('--env', default='production', help='Deployment environment')
    
    args = parser.parse_args()
    
    project_manager = ProjectManager()
    
    if args.action == 'deploy':
        project_manager.deploy(args.env)
    elif args.action == 'backup':
        project_manager.backup()

if __name__ == '__main__':
    main()