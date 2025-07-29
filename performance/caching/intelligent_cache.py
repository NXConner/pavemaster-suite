import time
import json
import hashlib
from typing import Any, Optional, Dict, Callable
from functools import wraps
import redis
import pickle

class IntelligentCache:
    """
    Advanced intelligent caching system with multiple strategies
    """
    
    def __init__(
        self, 
        redis_host: str = 'localhost', 
        redis_port: int = 6379, 
        redis_db: int = 0
    ):
        """
        Initialize intelligent caching system
        
        :param redis_host: Redis server host
        :param redis_port: Redis server port
        :param redis_db: Redis database number
        """
        self.redis_client = redis.Redis(
            host=redis_host, 
            port=redis_port, 
            db=redis_db
        )
        
        # Caching strategies
        self.strategies = {
            'time_based': self._time_based_cache,
            'dependency_based': self._dependency_based_cache,
            'adaptive': self._adaptive_cache
        }
        
        # Metadata tracking
        self.cache_metadata = {}
    
    def _generate_cache_key(self, func: Callable, *args, **kwargs) -> str:
        """
        Generate a unique cache key based on function and arguments
        
        :param func: Function being cached
        :param args: Positional arguments
        :param kwargs: Keyword arguments
        :return: Unique cache key
        """
        # Create a deterministic representation of arguments
        args_repr = json.dumps(args, sort_keys=True)
        kwargs_repr = json.dumps(kwargs, sort_keys=True)
        
        # Generate hash
        key_components = [
            func.__module__, 
            func.__name__, 
            args_repr, 
            kwargs_repr
        ]
        return hashlib.md5('_'.join(key_components).encode()).hexdigest()
    
    def _time_based_cache(
        self, 
        func: Callable, 
        cache_key: str, 
        ttl: int = 300
    ) -> Callable:
        """
        Time-based caching strategy
        
        :param func: Function to cache
        :param cache_key: Unique cache key
        :param ttl: Time-to-live in seconds
        :return: Wrapped function
        """
        @wraps(func)
        def wrapper(*args, **kwargs):
            # Check cache
            cached_result = self.redis_client.get(cache_key)
            
            if cached_result:
                return pickle.loads(cached_result)
            
            # Execute function
            result = func(*args, **kwargs)
            
            # Store in cache
            self.redis_client.setex(
                cache_key, 
                ttl, 
                pickle.dumps(result)
            )
            
            return result
        
        return wrapper
    
    def _dependency_based_cache(
        self, 
        func: Callable, 
        cache_key: str, 
        dependencies: Optional[list] = None
    ) -> Callable:
        """
        Dependency-based caching strategy
        
        :param func: Function to cache
        :param cache_key: Unique cache key
        :param dependencies: List of dependency keys
        :return: Wrapped function
        """
        @wraps(func)
        def wrapper(*args, **kwargs):
            # Check dependencies
            if dependencies:
                for dep_key in dependencies:
                    if not self.redis_client.exists(dep_key):
                        # Invalidate cache if dependency is missing
                        self.redis_client.delete(cache_key)
                        break
            
            # Check cache
            cached_result = self.redis_client.get(cache_key)
            
            if cached_result:
                return pickle.loads(cached_result)
            
            # Execute function
            result = func(*args, **kwargs)
            
            # Store in cache
            self.redis_client.set(cache_key, pickle.dumps(result))
            
            return result
        
        return wrapper
    
    def _adaptive_cache(
        self, 
        func: Callable, 
        cache_key: str
    ) -> Callable:
        """
        Adaptive caching strategy with machine learning-like behavior
        
        :param func: Function to cache
        :param cache_key: Unique cache key
        :return: Wrapped function
        """
        @wraps(func)
        def wrapper(*args, **kwargs):
            # Retrieve or initialize metadata
            metadata = self.cache_metadata.get(cache_key, {
                'hits': 0,
                'misses': 0,
                'last_access': 0,
                'dynamic_ttl': 300  # Default TTL
            })
            
            current_time = time.time()
            
            # Check cache
            cached_result = self.redis_client.get(cache_key)
            
            if cached_result:
                # Cache hit
                metadata['hits'] += 1
                metadata['last_access'] = current_time
                
                # Dynamically adjust TTL based on usage
                if metadata['hits'] > 10:
                    metadata['dynamic_ttl'] *= 1.5
                
                self.cache_metadata[cache_key] = metadata
                
                return pickle.loads(cached_result)
            
            # Cache miss
            metadata['misses'] += 1
            
            # Execute function
            result = func(*args, **kwargs)
            
            # Store in cache with dynamic TTL
            self.redis_client.setex(
                cache_key, 
                int(metadata['dynamic_ttl']), 
                pickle.dumps(result)
            )
            
            self.cache_metadata[cache_key] = metadata
            
            return result
        
        return wrapper
    
    def cache(
        self, 
        strategy: str = 'adaptive', 
        ttl: int = 300, 
        dependencies: Optional[list] = None
    ) -> Callable:
        """
        Decorator for caching function results
        
        :param strategy: Caching strategy ('time_based', 'dependency_based', 'adaptive')
        :param ttl: Time-to-live for time-based caching
        :param dependencies: Dependencies for dependency-based caching
        :return: Decorator function
        """
        def decorator(func: Callable) -> Callable:
            cache_key = self._generate_cache_key(func)
            
            # Select caching strategy
            if strategy == 'time_based':
                return self._time_based_cache(func, cache_key, ttl)
            elif strategy == 'dependency_based':
                return self._dependency_based_cache(func, cache_key, dependencies)
            else:
                return self._adaptive_cache(func, cache_key)
        
        return decorator
    
    def clear_cache(self, pattern: str = '*'):
        """
        Clear cache entries matching a pattern
        
        :param pattern: Redis key pattern to match
        """
        for key in self.redis_client.keys(pattern):
            self.redis_client.delete(key)
    
    def get_cache_stats(self) -> Dict[str, Any]:
        """
        Retrieve cache statistics
        
        :return: Dictionary of cache metadata
        """
        return {
            'total_entries': len(self.cache_metadata),
            'metadata': self.cache_metadata
        }

# Global cache instance
intelligent_cache = IntelligentCache()

# Example usage
@intelligent_cache.cache(strategy='adaptive')
def expensive_computation(x, y):
    # Simulate expensive computation
    import time
    time.sleep(1)
    return x + y

# Demonstration
def main():
    # First call - will compute and cache
    result1 = expensive_computation(10, 20)
    print(f"First call result: {result1}")
    
    # Second call - will retrieve from cache
    result2 = expensive_computation(10, 20)
    print(f"Second call result: {result2}")
    
    # Get cache statistics
    stats = intelligent_cache.get_cache_stats()
    print("Cache Statistics:", stats)

if __name__ == "__main__":
    main()