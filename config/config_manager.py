import os
import json
import logging
from typing import Any, Dict, Optional
from functools import lru_cache
from dotenv import load_dotenv
import yaml
import jsonschema
import importlib.util

class ConfigurationError(Exception):
    """Custom exception for configuration-related errors."""
    pass

class ConfigManager:
    """
    Comprehensive configuration management system with multi-environment support,
    security, and validation.
    """
    _instance = None
    _configs: Dict[str, Any] = {}

    def __new__(cls):
        if not cls._instance:
            cls._instance = super().__new__(cls)
            cls._load_configurations()
        return cls._instance

    @classmethod
    def _load_configurations(cls):
        """
        Load configurations from multiple sources with priority:
        1. Environment Variables
        2. .env files
        3. JSON/YAML config files
        4. Default configurations
        """
        # Load environment variables
        load_dotenv()

        # Configuration sources
        config_sources = [
            'enterprise_integrations.json',
            'environment_config.py',
            'cache_config.py',
            'database_config.py'
        ]

        for source in config_sources:
            try:
                cls._load_config_from_source(source)
            except Exception as e:
                logging.error(f"Error loading config from {source}: {e}")

    @classmethod
    def _load_config_from_source(cls, source: str):
        """
        Load configuration from different file types with validation.
        """
        file_path = os.path.join(os.path.dirname(__file__), source)
        
        if source.endswith('.json'):
            cls._load_json_config(file_path)
        elif source.endswith('.py'):
            cls._load_python_config(file_path)
        elif source.endswith('.yaml') or source.endswith('.yml'):
            cls._load_yaml_config(file_path)

    @classmethod
    def _load_json_config(cls, file_path: str):
        """Load and validate JSON configuration."""
        with open(file_path, 'r') as f:
            config = json.load(f)
            cls._validate_config(config)
            cls._configs.update(config)

    @classmethod
    def _load_python_config(cls, file_path: str):
        """Load Python-based configuration module."""
        module_name = os.path.splitext(os.path.basename(file_path))[0]
        spec = importlib.util.spec_from_file_location(module_name, file_path)
        module = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(module)

        # Extract configuration from module
        for key, value in {k: v for k, v in module.__dict__.items() if not k.startswith('__')}:
            cls._configs[key] = value

    @classmethod
    def _load_yaml_config(cls, file_path: str):
        """Load and validate YAML configuration."""
        with open(file_path, 'r') as f:
            config = yaml.safe_load(f)
            cls._validate_config(config)
            cls._configs.update(config)

    @classmethod
    def _validate_config(cls, config: Dict[str, Any]):
        """
        Validate configuration against a predefined schema.
        Prevents invalid configurations from being loaded.
        """
        schema = {
            "type": "object",
            "properties": {
                "database": {
                    "type": "object",
                    "properties": {
                        "host": {"type": "string"},
                        "port": {"type": "number"},
                        "username": {"type": "string"}
                    },
                    "required": ["host", "port"]
                },
                "cache": {
                    "type": "object",
                    "properties": {
                        "enabled": {"type": "boolean"},
                        "ttl": {"type": "number"}
                    }
                },
                "enterprise_integrations": {
                    "type": "object"
                }
            }
        }

        try:
            jsonschema.validate(instance=config, schema=schema)
        except jsonschema.ValidationError as e:
            raise ConfigurationError(f"Invalid configuration: {e}")

    @lru_cache(maxsize=128)
    def get(self, key: str, default: Optional[Any] = None) -> Any:
        """
        Retrieve configuration with optional default and caching.
        Supports nested key retrieval with dot notation.
        """
        try:
            # Support nested key retrieval
            keys = key.split('.')
            value = self._configs
            for k in keys:
                value = value[k]
            return value
        except (KeyError, TypeError):
            if default is not None:
                return default
            raise ConfigurationError(f"Configuration key '{key}' not found")

    def reload(self):
        """
        Reload all configurations, clearing previous cache.
        """
        self._configs.clear()
        self._load_configurations()
        self.get.cache_clear()

    @property
    def environment(self) -> str:
        """
        Determine the current environment.
        """
        return os.getenv('ENV', 'development')

    def secure_config(self) -> Dict[str, Any]:
        """
        Return a sanitized version of the configuration,
        removing sensitive information.
        """
        sanitized_config = self._configs.copy()
        sensitive_keys = ['password', 'secret', 'token', 'key']
        
        def sanitize_dict(d):
            return {k: '***' if any(sens in k.lower() for sens in sensitive_keys) 
                    else (sanitize_dict(v) if isinstance(v, dict) else v) 
                    for k, v in d.items()}
        
        return sanitize_dict(sanitized_config)

# Singleton instance
config_manager = ConfigManager()

# Logging configuration
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('config_manager.log'),
        logging.StreamHandler()
    ]
)

def get_config(key: str, default: Optional[Any] = None) -> Any:
    """
    Convenience function for getting configuration values.
    """
    return config_manager.get(key, default)