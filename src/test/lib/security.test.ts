import { describe, it, expect, vi, beforeEach } from 'vitest';
import { 
  EncryptionService, 
  inputValidation, 
  securityConfig,
  AuditLogger 
} from '@/lib/security';

// Mock environment variables
vi.mock('import.meta.env', () => ({
  VITE_ENCRYPTION_KEY: 'test-encryption-key',
  DEV: true,
}));

describe('Security', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('EncryptionService', () => {
    it('encrypts and decrypts data correctly', () => {
      const testData = 'sensitive information';
      
      const encrypted = EncryptionService.encrypt(testData);
      expect(encrypted).not.toBe(testData);
      expect(encrypted).toContain(':'); // Should contain separator
      
      const decrypted = EncryptionService.decrypt(encrypted);
      expect(decrypted).toBe(testData);
    });

    it('generates different encrypted values for same input', () => {
      const testData = 'test data';
      
      const encrypted1 = EncryptionService.encrypt(testData);
      const encrypted2 = EncryptionService.encrypt(testData);
      
      expect(encrypted1).not.toBe(encrypted2);
      expect(EncryptionService.decrypt(encrypted1)).toBe(testData);
      expect(EncryptionService.decrypt(encrypted2)).toBe(testData);
    });

    it('handles empty strings', () => {
      const encrypted = EncryptionService.encrypt('');
      const decrypted = EncryptionService.decrypt(encrypted);
      
      expect(decrypted).toBe('');
    });

    it('throws error for invalid encrypted data', () => {
      expect(() => {
        EncryptionService.decrypt('invalid-encrypted-data');
      }).toThrow();
    });

    it('hashes passwords consistently', () => {
      const password = 'testPassword123!';
      
      const hash1 = EncryptionService.hashPassword(password);
      const hash2 = EncryptionService.hashPassword(password);
      
      // Hashes should be the same for the same input
      expect(hash1).toBe(hash2);
      expect(hash1).not.toBe(password);
    });

    it('generates secure random tokens', () => {
      const token1 = EncryptionService.generateSecureToken();
      const token2 = EncryptionService.generateSecureToken();
      
      expect(token1).not.toBe(token2);
      expect(token1.length).toBeGreaterThan(20);
      expect(token2.length).toBeGreaterThan(20);
    });
  });

  describe('Input Validation', () => {
    it('validates email addresses correctly', () => {
      expect(inputValidation.isValidEmail('test@example.com')).toBe(true);
      expect(inputValidation.isValidEmail('user.name+tag@domain.co.uk')).toBe(true);
      expect(inputValidation.isValidEmail('invalid-email')).toBe(false);
      expect(inputValidation.isValidEmail('')).toBe(false);
      expect(inputValidation.isValidEmail('test@')).toBe(false);
    });

    it('validates phone numbers correctly', () => {
      expect(inputValidation.isValidPhone('+1234567890')).toBe(true);
      expect(inputValidation.isValidPhone('(555) 123-4567')).toBe(true);
      expect(inputValidation.isValidPhone('555-123-4567')).toBe(true);
      expect(inputValidation.isValidPhone('invalid-phone')).toBe(false);
      expect(inputValidation.isValidPhone('123')).toBe(false);
    });

    it('validates strong passwords', () => {
      expect(inputValidation.isStrongPassword('StrongPass123!')).toBe(true);
      expect(inputValidation.isStrongPassword('password123')).toBe(false); // No uppercase
      expect(inputValidation.isStrongPassword('PASSWORD123')).toBe(false); // No lowercase
      expect(inputValidation.isStrongPassword('StrongPassword')).toBe(false); // No numbers
      expect(inputValidation.isStrongPassword('StrongPass123')).toBe(false); // No special chars
      expect(inputValidation.isStrongPassword('Short1!')).toBe(false); // Too short
    });

    it('sanitizes SQL input', () => {
      const maliciousInput = "'; DROP TABLE users; --";
      const sanitized = inputValidation.sanitizeSqlInput(maliciousInput);
      
      expect(sanitized).not.toContain(';');
      expect(sanitized).not.toContain('DROP');
      expect(sanitized).not.toContain('--');
    });

    it('sanitizes HTML input', () => {
      const maliciousInput = '<script>alert("xss")</script><div>safe content</div>';
      const sanitized = inputValidation.sanitizeHtml(maliciousInput);
      
      expect(sanitized).not.toContain('<script>');
      expect(sanitized).not.toContain('alert');
      expect(sanitized).toContain('safe content');
    });

    it('validates file uploads', () => {
      const validFile = {
        name: 'document.pdf',
        size: 1024 * 1024, // 1MB
        type: 'application/pdf'
      };
      
      const oversizedFile = {
        name: 'large.pdf',
        size: 100 * 1024 * 1024, // 100MB
        type: 'application/pdf'
      };
      
      const maliciousFile = {
        name: 'malware.exe',
        size: 1024,
        type: 'application/exe'
      };
      
      expect(inputValidation.isValidFileUpload(validFile)).toBe(true);
      expect(inputValidation.isValidFileUpload(oversizedFile)).toBe(false);
      expect(inputValidation.isValidFileUpload(maliciousFile)).toBe(false);
    });
  });

  describe('Security Configuration', () => {
    it('has secure default settings', () => {
      expect(securityConfig.passwordMinLength).toBeGreaterThanOrEqual(12);
      expect(securityConfig.requireSpecialChars).toBe(true);
      expect(securityConfig.multiFactorAuth).toBe(true);
      expect(securityConfig.maxLoginAttempts).toBeLessThanOrEqual(5);
      expect(securityConfig.lockoutDuration).toBeGreaterThanOrEqual(15);
    });

    it('has reasonable session timeouts', () => {
      expect(securityConfig.sessionTimeout).toBeGreaterThan(0);
      expect(securityConfig.accessTokenExpiry).toBeGreaterThan(0);
      expect(securityConfig.refreshTokenExpiry).toBeGreaterThan(securityConfig.accessTokenExpiry);
    });
  });

  describe('AuditLogger', () => {
    it('logs security events with required fields', async () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      
      await AuditLogger.logSecurityEvent({
        event_type: 'authentication',
        severity: 'medium',
        description: 'User login attempt',
        user_id: 'test-user-id',
        ip_address: '127.0.0.1',
        user_agent: 'Test Browser',
        metadata: { success: true }
      });
      
      // In development mode, should log to console
      expect(consoleSpy).toHaveBeenCalled();
      
      consoleSpy.mockRestore();
    });

    it('handles missing optional audit fields', async () => {
      expect(async () => {
        await AuditLogger.logSecurityEvent({
          event_type: 'data_access',
          severity: 'low',
          description: 'Data query executed',
        });
      }).not.toThrow();
    });

    it('validates severity levels', async () => {
      const validSeverities = ['low', 'medium', 'high', 'critical'];
      
      for (const severity of validSeverities) {
        expect(async () => {
          await AuditLogger.logSecurityEvent({
            event_type: 'test',
            severity: severity as any,
            description: 'Test event',
          });
        }).not.toThrow();
      }
    });
  });

  describe('Rate Limiting', () => {
    it('should exist and be configurable', () => {
      expect(securityConfig.maxLoginAttempts).toBeDefined();
      expect(securityConfig.lockoutDuration).toBeDefined();
      expect(typeof securityConfig.maxLoginAttempts).toBe('number');
      expect(typeof securityConfig.lockoutDuration).toBe('number');
    });
  });
});