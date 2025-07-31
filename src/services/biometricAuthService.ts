// PHASE 10: Advanced Biometric Authentication Service
// Cross-platform biometric authentication with multiple fallback options
import { Capacitor } from '@capacitor/core';
import { enhancedMobileService } from './enhancedMobileService';

export interface BiometricCapabilities {
  fingerprint: boolean;
  face: boolean;
  iris: boolean;
  voice: boolean;
  devicePasscode: boolean;
  isAvailable: boolean;
  strongBiometrics: boolean;
  weakBiometrics: boolean;
}

export interface BiometricAuthOptions {
  title: string;
  subtitle?: string;
  description?: string;
  fallbackTitle?: string;
  negativeButtonText?: string;
  allowDeviceCredential?: boolean;
  requireConfirmation?: boolean;
  deviceCredentialAllowed?: boolean;
  deviceCredentialTitle?: string;
  maxAttempts?: number;
  timeout?: number;
}

export interface AuthResult {
  success: boolean;
  method: 'fingerprint' | 'face' | 'iris' | 'voice' | 'passcode' | 'pattern' | 'pin' | 'password';
  error?: BiometricError;
  userData?: any;
  timestamp: number;
  deviceId: string;
}

export interface BiometricError {
  code: string;
  message: string;
  type: 'user_cancel' | 'user_fallback' | 'system_cancel' | 'lockout' | 'no_hardware' | 'no_biometrics' | 'unknown';
  recoverable: boolean;
  retryAfter?: number;
}

export interface SecurityLevel {
  level: 'weak' | 'medium' | 'strong' | 'critical';
  requiresBiometric: boolean;
  allowsFallback: boolean;
  sessionTimeout: number;
  description: string;
}

// PHASE 10: Security level definitions
const SECURITY_LEVELS: Record<string, SecurityLevel> = {
  public: {
    level: 'weak',
    requiresBiometric: false,
    allowsFallback: true,
    sessionTimeout: 24 * 60 * 60 * 1000, // 24 hours
    description: 'Public access - no authentication required'
  },
  user: {
    level: 'medium',
    requiresBiometric: false,
    allowsFallback: true,
    sessionTimeout: 4 * 60 * 60 * 1000, // 4 hours
    description: 'User data access - basic authentication'
  },
  sensitive: {
    level: 'strong',
    requiresBiometric: true,
    allowsFallback: true,
    sessionTimeout: 30 * 60 * 1000, // 30 minutes
    description: 'Sensitive operations - biometric preferred'
  },
  critical: {
    level: 'critical',
    requiresBiometric: true,
    allowsFallback: false,
    sessionTimeout: 5 * 60 * 1000, // 5 minutes
    description: 'Critical operations - biometric required'
  }
};

export class BiometricAuthService {
  private capabilities: BiometricCapabilities | null = null;
  private isInitialized: boolean = false;
  private sessionCache: Map<string, { timestamp: number; level: string; method: string }> = new Map();
  private failedAttempts: Map<string, number> = new Map();
  private lockoutTimers: Map<string, NodeJS.Timeout> = new Map();

  constructor() {
    this.initializeService();
  }

  // PHASE 10: Service Initialization
  private async initializeService(): Promise<void> {
    try {
      await this.detectCapabilities();
      this.setupSecurityMonitoring();
      this.isInitialized = true;
      console.log('🔐 Biometric Authentication Service initialized');
    } catch (error) {
      console.error('Failed to initialize biometric service:', error);
    }
  }

  // PHASE 10: Capability Detection
  async detectCapabilities(): Promise<BiometricCapabilities> {
    try {
      let capabilities: BiometricCapabilities = {
        fingerprint: false,
        face: false,
        iris: false,
        voice: false,
        devicePasscode: false,
        isAvailable: false,
        strongBiometrics: false,
        weakBiometrics: false
      };

      if (Capacitor.isNativePlatform()) {
        // Native platform - use Capacitor plugins
        capabilities = await this.detectNativeCapabilities();
      } else {
        // Web platform - use WebAuthn API
        capabilities = await this.detectWebCapabilities();
      }

      this.capabilities = capabilities;
      return capabilities;
    } catch (error) {
      console.error('Error detecting biometric capabilities:', error);
      throw error;
    }
  }

  private async detectNativeCapabilities(): Promise<BiometricCapabilities> {
    // Simulate native biometric detection
    // In a real implementation, this would use actual Capacitor plugins
    const mockCapabilities: BiometricCapabilities = {
      fingerprint: Math.random() > 0.3, // 70% chance
      face: Math.random() > 0.5, // 50% chance
      iris: Math.random() > 0.8, // 20% chance
      voice: Math.random() > 0.7, // 30% chance
      devicePasscode: true,
      isAvailable: true,
      strongBiometrics: true,
      weakBiometrics: false
    };

    return mockCapabilities;
  }

  private async detectWebCapabilities(): Promise<BiometricCapabilities> {
    const capabilities: BiometricCapabilities = {
      fingerprint: false,
      face: false,
      iris: false,
      voice: false,
      devicePasscode: false,
      isAvailable: false,
      strongBiometrics: false,
      weakBiometrics: false
    };

    // Check WebAuthn support
    if (window.PublicKeyCredential) {
      try {
        const available = await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
        capabilities.isAvailable = available;
        capabilities.fingerprint = available; // Assume fingerprint is most common
        capabilities.strongBiometrics = available;
      } catch (error) {
        console.warn('WebAuthn not fully supported:', error);
      }
    }

    // Check Credential Management API
    if ('credentials' in navigator) {
      capabilities.weakBiometrics = true;
    }

    return capabilities;
  }

  // PHASE 10: Authentication Methods
  async authenticate(
    securityLevel: keyof typeof SECURITY_LEVELS = 'user',
    options?: Partial<BiometricAuthOptions>
  ): Promise<AuthResult> {
    if (!this.isInitialized || !this.capabilities) {
      throw new Error('Biometric service not initialized');
    }

    const level = SECURITY_LEVELS[securityLevel];
    const userId = 'current_user'; // Would get from auth context

    // Check if already authenticated for this level
    if (this.isSessionValid(userId, securityLevel)) {
      return {
        success: true,
        method: 'passcode', // Cached session
        timestamp: Date.now(),
        deviceId: await this.getDeviceId()
      };
    }

    // Check lockout status
    if (this.isLockedOut(userId)) {
      const error: BiometricError = {
        code: 'LOCKOUT',
        message: 'Too many failed attempts. Please try again later.',
        type: 'lockout',
        recoverable: true,
        retryAfter: this.getLockoutTime(userId)
      };
      
      return {
        success: false,
        method: 'fingerprint',
        error,
        timestamp: Date.now(),
        deviceId: await this.getDeviceId()
      };
    }

    const authOptions: BiometricAuthOptions = {
      title: `${level.description}`,
      subtitle: 'Please authenticate to continue',
      description: 'Use your biometric or device passcode',
      fallbackTitle: 'Use Passcode',
      negativeButtonText: 'Cancel',
      allowDeviceCredential: level.allowsFallback,
      requireConfirmation: level.level === 'critical',
      maxAttempts: 3,
      timeout: 30000,
      ...options
    };

    try {
      let result: AuthResult;

      if (level.requiresBiometric && this.capabilities.strongBiometrics) {
        // Try biometric authentication first
        result = await this.performBiometricAuth(authOptions);
      } else if (level.allowsFallback) {
        // Try preferred method with fallback
        result = await this.performFallbackAuth(authOptions);
      } else {
        throw new Error('Required authentication method not available');
      }

      if (result.success) {
        // Cache successful authentication
        this.cacheSession(userId, securityLevel, result.method);
        this.clearFailedAttempts(userId);
        
        // Trigger haptic feedback for success
        if (enhancedMobileService.getCapabilities()?.hasHaptics) {
          await enhancedMobileService.triggerHaptic('light');
        }
      } else {
        // Track failed attempt
        this.recordFailedAttempt(userId);
      }

      return result;
    } catch (error) {
      console.error('Authentication error:', error);
      
      const authError: BiometricError = {
        code: 'AUTH_ERROR',
        message: error instanceof Error ? error.message : 'Authentication failed',
        type: 'unknown',
        recoverable: true
      };

      return {
        success: false,
        method: 'fingerprint',
        error: authError,
        timestamp: Date.now(),
        deviceId: await this.getDeviceId()
      };
    }
  }

  private async performBiometricAuth(options: BiometricAuthOptions): Promise<AuthResult> {
    if (Capacitor.isNativePlatform()) {
      return this.performNativeBiometricAuth(options);
    } else {
      return this.performWebBiometricAuth(options);
    }
  }

  private async performNativeBiometricAuth(options: BiometricAuthOptions): Promise<AuthResult> {
    // Simulate native biometric authentication
    // In real implementation, use actual Capacitor biometric plugins
    
    return new Promise((resolve) => {
      setTimeout(() => {
        const success = Math.random() > 0.2; // 80% success rate
        
        if (success) {
          resolve({
            success: true,
            method: this.getPreferredBiometricMethod(),
            timestamp: Date.now(),
            deviceId: 'native_device_id'
          });
        } else {
          const error: BiometricError = {
            code: 'BIOMETRIC_FAILED',
            message: 'Biometric authentication failed',
            type: 'user_cancel',
            recoverable: true
          };
          
          resolve({
            success: false,
            method: 'fingerprint',
            error,
            timestamp: Date.now(),
            deviceId: 'native_device_id'
          });
        }
      }, 1000);
    });
  }

  private async performWebBiometricAuth(options: BiometricAuthOptions): Promise<AuthResult> {
    if (!window.PublicKeyCredential) {
      throw new Error('WebAuthn not supported');
    }

    try {
      // Create WebAuthn challenge
      const challenge = this.generateChallenge();
      const publicKeyOptions: PublicKeyCredentialRequestOptions = {
        challenge: challenge,
        allowCredentials: [],
        userVerification: 'required',
        timeout: options.timeout || 30000
      };

      const credential = await navigator.credentials.get({
        publicKey: publicKeyOptions
      }) as PublicKeyCredential | null;

      if (credential) {
        return {
          success: true,
          method: 'fingerprint', // WebAuthn typically uses fingerprint
          timestamp: Date.now(),
          deviceId: await this.getDeviceId(),
          userData: {
            credentialId: credential.id,
            authenticatorData: credential.response
          }
        };
      } else {
        throw new Error('No credential returned');
      }
    } catch (error) {
      const authError: BiometricError = {
        code: 'WEBAUTHN_FAILED',
        message: error instanceof Error ? error.message : 'WebAuthn failed',
        type: error instanceof Error && error.name === 'NotAllowedError' ? 'user_cancel' : 'unknown',
        recoverable: true
      };

      return {
        success: false,
        method: 'fingerprint',
        error: authError,
        timestamp: Date.now(),
        deviceId: await this.getDeviceId()
      };
    }
  }

  private async performFallbackAuth(options: BiometricAuthOptions): Promise<AuthResult> {
    // Try biometric first, fallback to device credential
    if (this.capabilities?.strongBiometrics) {
      try {
        const result = await this.performBiometricAuth(options);
        if (result.success) {
          return result;
        }
      } catch (error) {
        console.warn('Biometric auth failed, trying fallback:', error);
      }
    }

    // Fallback to device passcode/pattern/pin
    return this.performDeviceCredentialAuth(options);
  }

  private async performDeviceCredentialAuth(options: BiometricAuthOptions): Promise<AuthResult> {
    // Simulate device credential authentication
    // In real implementation, this would prompt for device passcode/pattern/pin
    
    return new Promise((resolve) => {
      setTimeout(() => {
        const success = Math.random() > 0.1; // 90% success rate
        
        if (success) {
          resolve({
            success: true,
            method: 'passcode',
            timestamp: Date.now(),
            deviceId: 'device_credential_id'
          });
        } else {
          const error: BiometricError = {
            code: 'DEVICE_CREDENTIAL_FAILED',
            message: 'Device credential authentication failed',
            type: 'user_cancel',
            recoverable: true
          };
          
          resolve({
            success: false,
            method: 'passcode',
            error,
            timestamp: Date.now(),
            deviceId: 'device_credential_id'
          });
        }
      }, 1500);
    });
  }

  // PHASE 10: Session Management
  private cacheSession(userId: string, level: string, method: string): void {
    const sessionKey = `${userId}_${level}`;
    this.sessionCache.set(sessionKey, {
      timestamp: Date.now(),
      level,
      method
    });

    // Set expiration timer
    const securityLevel = SECURITY_LEVELS[level];
    setTimeout(() => {
      this.sessionCache.delete(sessionKey);
    }, securityLevel.sessionTimeout);
  }

  private isSessionValid(userId: string, level: string): boolean {
    const sessionKey = `${userId}_${level}`;
    const session = this.sessionCache.get(sessionKey);
    
    if (!session) return false;
    
    const securityLevel = SECURITY_LEVELS[level];
    const isExpired = Date.now() - session.timestamp > securityLevel.sessionTimeout;
    
    if (isExpired) {
      this.sessionCache.delete(sessionKey);
      return false;
    }
    
    return true;
  }

  async clearSession(userId: string, level?: string): Promise<void> {
    if (level) {
      const sessionKey = `${userId}_${level}`;
      this.sessionCache.delete(sessionKey);
    } else {
      // Clear all sessions for user
      for (const [key] of this.sessionCache) {
        if (key.startsWith(`${userId}_`)) {
          this.sessionCache.delete(key);
        }
      }
    }
  }

  // PHASE 10: Security Monitoring
  private recordFailedAttempt(userId: string): void {
    const current = this.failedAttempts.get(userId) || 0;
    const newCount = current + 1;
    this.failedAttempts.set(userId, newCount);

    // Implement progressive lockout
    if (newCount >= 3) {
      this.lockoutUser(userId, this.calculateLockoutDuration(newCount));
    }
  }

  private clearFailedAttempts(userId: string): void {
    this.failedAttempts.delete(userId);
    this.clearLockout(userId);
  }

  private lockoutUser(userId: string, duration: number): void {
    const timer = setTimeout(() => {
      this.clearLockout(userId);
    }, duration);
    
    this.lockoutTimers.set(userId, timer);
  }

  private clearLockout(userId: string): void {
    const timer = this.lockoutTimers.get(userId);
    if (timer) {
      clearTimeout(timer);
      this.lockoutTimers.delete(userId);
    }
  }

  private isLockedOut(userId: string): boolean {
    return this.lockoutTimers.has(userId);
  }

  private getLockoutTime(userId: string): number {
    const attempts = this.failedAttempts.get(userId) || 0;
    return this.calculateLockoutDuration(attempts);
  }

  private calculateLockoutDuration(attempts: number): number {
    // Progressive lockout: 30s, 1m, 5m, 15m, 30m
    const durations = [30000, 60000, 300000, 900000, 1800000];
    const index = Math.min(attempts - 3, durations.length - 1);
    return durations[index] || durations[durations.length - 1];
  }

  private setupSecurityMonitoring(): void {
    // Monitor for security events
    window.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        // App went to background - could invalidate sessions for high-security levels
        this.handleAppBackground();
      }
    });
  }

  private handleAppBackground(): void {
    // Invalidate critical-level sessions when app goes to background
    for (const [key, session] of this.sessionCache) {
      if (session.level === 'critical') {
        this.sessionCache.delete(key);
      }
    }
  }

  // PHASE 10: Utility Methods
  private getPreferredBiometricMethod(): 'fingerprint' | 'face' | 'iris' | 'voice' {
    if (this.capabilities?.face) return 'face';
    if (this.capabilities?.fingerprint) return 'fingerprint';
    if (this.capabilities?.iris) return 'iris';
    if (this.capabilities?.voice) return 'voice';
    return 'fingerprint'; // Default
  }

  private generateChallenge(): ArrayBuffer {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return array.buffer;
  }

  private async getDeviceId(): Promise<string> {
    try {
      // Try to get actual device ID
      const capabilities = enhancedMobileService.getCapabilities();
      return capabilities?.platform || 'unknown_device';
    } catch {
      return 'web_device';
    }
  }

  // PHASE 10: Public API
  getCapabilities(): BiometricCapabilities | null {
    return this.capabilities;
  }

  getSecurityLevels(): Record<string, SecurityLevel> {
    return SECURITY_LEVELS;
  }

  async checkAuthenticationStatus(
    userId: string, 
    level: keyof typeof SECURITY_LEVELS
  ): Promise<boolean> {
    return this.isSessionValid(userId, level);
  }

  async getFailedAttempts(userId: string): Promise<number> {
    return this.failedAttempts.get(userId) || 0;
  }

  async isUserLockedOut(userId: string): Promise<boolean> {
    return this.isLockedOut(userId);
  }

  // PHASE 10: Registration for WebAuthn
  async registerBiometric(
    userId: string,
    displayName: string
  ): Promise<{ success: boolean; credentialId?: string; error?: string }> {
    if (!window.PublicKeyCredential) {
      return { success: false, error: 'WebAuthn not supported' };
    }

    try {
      const challenge = this.generateChallenge();
      const publicKeyOptions: PublicKeyCredentialCreationOptions = {
        challenge: challenge,
        rp: {
          name: 'PaveMaster Suite',
          id: window.location.hostname
        },
        user: {
          id: new TextEncoder().encode(userId),
          name: userId,
          displayName: displayName
        },
        pubKeyCredParams: [
          { type: 'public-key', alg: -7 }, // ES256
          { type: 'public-key', alg: -257 } // RS256
        ],
        authenticatorSelection: {
          authenticatorAttachment: 'platform',
          userVerification: 'required'
        },
        timeout: 60000,
        attestation: 'direct'
      };

      const credential = await navigator.credentials.create({
        publicKey: publicKeyOptions
      }) as PublicKeyCredential | null;

      if (credential) {
        return {
          success: true,
          credentialId: credential.id
        };
      } else {
        return { success: false, error: 'Failed to create credential' };
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Registration failed'
      };
    }
  }

  // PHASE 10: Cleanup
  async cleanup(): Promise<void> {
    this.sessionCache.clear();
    this.failedAttempts.clear();
    
    for (const timer of this.lockoutTimers.values()) {
      clearTimeout(timer);
    }
    this.lockoutTimers.clear();
  }
}

// PHASE 10: Export singleton instance
export const biometricAuthService = new BiometricAuthService();
export default biometricAuthService;