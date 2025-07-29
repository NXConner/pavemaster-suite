import os
from typing import Optional, Dict, Any

class CacheConfig:
    """
    Centralized configuration for caching strategies
    """
    
    def __init__(
        self, 
        redis_host: Optional[str] = None,
        redis_port: Optional[int] = None,
        redis_db: Optional[int] = None,
        redis_password: Optional[str] = None
    ):
        """
        Initialize cache configuration
        
        :param redis_host: Redis server host
        :param redis_port: Redis server port
        :param redis_db: Redis database number
        :param redis_password: Redis authentication password
        """
        # Prioritize environment variables
        self.redis_host = redis_host or os.getenv('REDIS_HOST', 'localhost')
        self.redis_port = redis_port or int(os.getenv('REDIS_PORT', 6379))
        self.redis_db = redis_db or int(os.getenv('REDIS_DB', 0))
        self.redis_password = redis_password or os.getenv('REDIS_PASSWORD')
        
        # Default caching strategies
        self.default_strategies = {
            'default': {
                'strategy': 'adaptive',
                'ttl': 300,  # 5 minutes default
                'max_memory': '256mb'
            },
            'short_term': {
                'strategy': 'time_based',
                'ttl': 60,  # 1 minute
                'max_memory': '64mb'
            },
            'long_term': {
                'strategy': 'dependency_based',
                'ttl': 3600,  # 1 hour
                'max_memory': '512mb'
            }
        }
    
    def get_redis_config(self) -> Dict[str, Any]:
        """
        Get Redis connection configuration
        
        :return: Dictionary of Redis connection parameters
        """
        config = {
            'host': self.redis_host,
            'port': self.redis_port,
            'db': self.redis_db
        }
        
        # Add password if provided
        if self.redis_password:
            config['password'] = self.redis_password
        
        return config
    
    def get_strategy_config(self, strategy_name: str = 'default') -> Dict[str, Any]:
        """
        Retrieve caching strategy configuration
        
        :param strategy_name: Name of the caching strategy
        :return: Strategy configuration dictionary
        """
        return self.default_strategies.get(
            strategy_name, 
            self.default_strategies['default']
        )
    
    def configure_redis_server(self) -> Dict[str, str]:
        """
        Generate Redis server configuration recommendations
        
        :return: Dictionary of recommended Redis configuration
        """
        return {
            'maxmemory-policy': 'allkeys-lru',  # Least Recently Used eviction
            'maxmemory': '1gb',  # Adjust based on your system
            'save': '900 1 300 10 60 10000',  # Persistence configuration
            'appendonly': 'yes',  # Enable AOF persistence
            'appendfsync': 'everysec'  # Fsync every second
        }
    
    def validate_connection(self) -> bool:
        """
        Validate Redis connection configuration
        
        :return: True if configuration is valid, False otherwise
        """
        import redis
        
        try:
            client = redis.Redis(**self.get_redis_config())
            client.ping()
            return True
        except Exception as e:
            print(f"Redis connection validation failed: {e}")
            return False

# Global cache configuration instance
cache_config = CacheConfig()

# Example usage
def main():
    # Validate Redis connection
    is_valid = cache_config.validate_connection()
    print(f"Redis Connection Valid: {is_valid}")
    
    # Get Redis configuration
    redis_config = cache_config.get_redis_config()
    print("Redis Configuration:", redis_config)
    
    # Get strategy configuration
    strategy_config = cache_config.get_strategy_config('long_term')
    print("Long-Term Strategy Config:", strategy_config)
    
    # Redis server configuration recommendations
    server_config = cache_config.configure_redis_server()
    print("Recommended Redis Server Config:", server_config)

if __name__ == "__main__":
    main()