import os
import logging
from typing import Optional, Dict, Any
from datetime import datetime, timedelta

import jwt
from cryptography.fernet import Fernet
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2HMAC
import base64

from config.database_config import get_db_session
from models.user import User  # Assuming you have a User model

class SecurityManager:
    """
    Comprehensive security management system
    Handles authentication, authorization, encryption, and threat monitoring
    """
    
    def __init__(self, secret_key: Optional[str] = None):
        """
        Initialize security manager
        
        :param secret_key: Optional custom secret key for JWT
        """
        self.logger = logging.getLogger('SecurityManager')
        self.logger.setLevel(logging.INFO)
        
        # Setup logging handler
        handler = logging.FileHandler('security.log')
        handler.setFormatter(logging.Formatter(
            '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
        ))
        self.logger.addHandler(handler)
        
        # JWT Configuration
        self.secret_key = secret_key or self._generate_secret_key()
        self.jwt_algorithm = 'HS256'
        
        # Encryption key management
        self.encryption_key = self._generate_or_load_encryption_key()
        self.fernet = Fernet(self.encryption_key)
    
    def _generate_secret_key(self) -> str:
        """
        Generate a secure secret key for JWT
        
        :return: Generated secret key
        """
        return os.urandom(32).hex()
    
    def _generate_or_load_encryption_key(self) -> bytes:
        """
        Generate or load an encryption key
        
        :return: Encryption key
        """
        key_path = 'security/encryption.key'
        
        if os.path.exists(key_path):
            with open(key_path, 'rb') as key_file:
                return key_file.read()
        else:
            key = Fernet.generate_key()
            os.makedirs(os.path.dirname(key_path), exist_ok=True)
            with open(key_path, 'wb') as key_file:
                key_file.write(key)
            return key
    
    def generate_jwt_token(
        self, 
        user_id: str, 
        role: str, 
        expiration: int = 3600
    ) -> str:
        """
        Generate a JWT token for authentication
        
        :param user_id: User's unique identifier
        :param role: User's role
        :param expiration: Token expiration time in seconds
        :return: JWT token
        """
        payload = {
            'user_id': user_id,
            'role': role,
            'exp': datetime.utcnow() + timedelta(seconds=expiration),
            'iat': datetime.utcnow()
        }
        
        token = jwt.encode(payload, self.secret_key, algorithm=self.jwt_algorithm)
        
        self.logger.info(f"JWT token generated for user {user_id}")
        return token
    
    def validate_jwt_token(self, token: str) -> Dict[str, Any]:
        """
        Validate and decode JWT token
        
        :param token: JWT token to validate
        :return: Decoded token payload
        :raises: jwt.ExpiredSignatureError, jwt.InvalidTokenError
        """
        try:
            payload = jwt.decode(
                token, 
                self.secret_key, 
                algorithms=[self.jwt_algorithm]
            )
            
            self.logger.info(f"JWT token validated for user {payload['user_id']}")
            return payload
        except jwt.ExpiredSignatureError:
            self.logger.warning("Expired JWT token detected")
            raise
        except jwt.InvalidTokenError:
            self.logger.error("Invalid JWT token")
            raise
    
    def encrypt_data(self, data: str) -> bytes:
        """
        Encrypt sensitive data
        
        :param data: Data to encrypt
        :return: Encrypted data
        """
        encrypted_data = self.fernet.encrypt(data.encode())
        self.logger.info("Data encrypted successfully")
        return encrypted_data
    
    def decrypt_data(self, encrypted_data: bytes) -> str:
        """
        Decrypt sensitive data
        
        :param encrypted_data: Data to decrypt
        :return: Decrypted data
        """
        decrypted_data = self.fernet.decrypt(encrypted_data).decode()
        self.logger.info("Data decrypted successfully")
        return decrypted_data
    
    def authenticate_user(self, username: str, password: str) -> Optional[Dict[str, Any]]:
        """
        Authenticate user credentials
        
        :param username: User's username
        :param password: User's password
        :return: User details if authenticated, None otherwise
        """
        session = get_db_session()
        try:
            user = session.query(User).filter_by(username=username).first()
            
            if user and self._verify_password(user.password, password):
                self.logger.info(f"User {username} authenticated successfully")
                return {
                    'user_id': user.id,
                    'username': user.username,
                    'role': user.role
                }
            
            self.logger.warning(f"Authentication failed for user {username}")
            return None
        finally:
            session.close()
    
    def _verify_password(self, stored_password: str, provided_password: str) -> bool:
        """
        Verify user password
        
        :param stored_password: Hashed password from database
        :param provided_password: Password provided during login
        :return: True if password is correct, False otherwise
        """
        # Implement secure password verification
        # This is a placeholder - replace with proper password hashing
        return stored_password == self._hash_password(provided_password)
    
    def _hash_password(self, password: str) -> str:
        """
        Hash password securely
        
        :param password: Plain text password
        :return: Hashed password
        """
        # Implement secure password hashing (e.g., using bcrypt or Argon2)
        # This is a placeholder implementation
        import hashlib
        return hashlib.sha256(password.encode()).hexdigest()
    
    def log_security_event(
        self, 
        event_type: str, 
        user_id: Optional[str] = None, 
        details: Optional[Dict[str, Any]] = None
    ):
        """
        Log security-related events
        
        :param event_type: Type of security event
        :param user_id: Optional user ID associated with the event
        :param details: Additional event details
        """
        log_entry = {
            'timestamp': datetime.utcnow(),
            'event_type': event_type,
            'user_id': user_id,
            'details': details or {}
        }
        
        self.logger.info(f"Security Event: {log_entry}")
        # Optionally, store in a separate security events table in the database

# Singleton instance for global access
security_manager = SecurityManager()

# Example usage in other modules
# from security.security_manager import security_manager
# 
# def some_secure_operation():
#     try:
#         token = security_manager.generate_jwt_token(user_id, role)
#         # Use token for authentication
#     except Exception as e:
#         security_manager.log_security_event('token_generation_error', details={'error': str(e)})