import os
from sqlalchemy import create_engine, MetaData
from sqlalchemy.orm import sessionmaker, scoped_session
from sqlalchemy.ext.declarative import declarative_base
from cryptography.fernet import Fernet

class DatabaseConfigManager:
    """
    Comprehensive database configuration and connection management
    """
    _instance = None
    
    def __new__(cls):
        if not cls._instance:
            cls._instance = super(DatabaseConfigManager, cls).__new__(cls)
        return cls._instance
    
    def __init__(self):
        if not hasattr(self, 'initialized'):
            self.base_dir = os.path.dirname(os.path.abspath(__file__))
            self.config_path = os.path.join(self.base_dir, '..', '.env')
            
            # Encryption key management
            self.encryption_key = self._generate_or_load_encryption_key()
            
            # Database connection parameters
            self.connection_params = self._load_connection_params()
            
            # SQLAlchemy setup
            self.engine = self._create_engine()
            self.session_factory = sessionmaker(bind=self.engine)
            self.Session = scoped_session(self.session_factory)
            
            # Base declarative class for ORM models
            self.Base = declarative_base()
            
            self.initialized = True
    
    def _generate_or_load_encryption_key(self):
        """
        Generate or load an encryption key for sensitive configuration
        """
        key_path = os.path.join(self.base_dir, 'encryption.key')
        
        if os.path.exists(key_path):
            with open(key_path, 'rb') as key_file:
                return key_file.read()
        else:
            key = Fernet.generate_key()
            with open(key_path, 'wb') as key_file:
                key_file.write(key)
            return key
    
    def _load_connection_params(self):
        """
        Load database connection parameters with encryption
        """
        cipher_suite = Fernet(self.encryption_key)
        
        # Default connection parameters with placeholders
        default_params = {
            'drivername': 'postgresql',
            'username': 'pavemaster_user',
            'password': 'encrypted_password',
            'host': 'localhost',
            'port': '5432',
            'database': 'pavemaster_db'
        }
        
        # In a real-world scenario, load from encrypted .env file
        return default_params
    
    def _create_engine(self):
        """
        Create SQLAlchemy engine with advanced configuration
        """
        connection_string = (
            f"{self.connection_params['drivername']}://"
            f"{self.connection_params['username']}:"
            f"{self.connection_params['password']}@"
            f"{self.connection_params['host']}:"
            f"{self.connection_params['port']}/"
            f"{self.connection_params['database']}"
        )
        
        return create_engine(
            connection_string,
            pool_size=10,  # Adjust based on expected concurrent connections
            max_overflow=20,
            pool_timeout=30,
            pool_recycle=3600,  # Recycle connections every hour
            echo=False  # Set to True for SQL logging during development
        )
    
    def get_session(self):
        """
        Provide a database session
        """
        return self.Session()
    
    def create_all_tables(self):
        """
        Create all tables defined in the models
        """
        self.Base.metadata.create_all(self.engine)
    
    def drop_all_tables(self):
        """
        Drop all tables (use with caution!)
        """
        self.Base.metadata.drop_all(self.engine)

# Singleton instance for global access
db_config = DatabaseConfigManager()

def get_db_session():
    """
    Utility function to get a database session
    """
    return db_config.get_session()

# Example usage in other modules
# from config.database_config import get_db_session
# 
# def some_database_operation():
#     session = get_db_session()
#     try:
#         # Perform database operations
#         session.commit()
#     except Exception as e:
#         session.rollback()
#         raise
#     finally:
#         session.close()