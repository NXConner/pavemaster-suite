/**
 * Comprehensive Security Manager
 * Handles all security aspects of the application including CSP, input validation, and security headers
 */

export interface SecurityConfig {
  csp: {
    defaultSrc: string[];
    scriptSrc: string[];
    styleSrc: string[];
    imgSrc: string[];
    connectSrc: string[];
    fontSrc: string[];
    objectSrc: string[];
    mediaSrc: string[];
    frameSrc: string[];
  };
  headers: {
    hsts: boolean;
    xssProtection: boolean;
    contentTypeOptions: boolean;
    frameOptions: string;
    referrerPolicy: string;
  };
  validation: {
    maxInputLength: number;
    allowedFileTypes: string[];
    maxFileSize: number;
  };
}

export class SecurityManager {
  private config: SecurityConfig;

  constructor(config?: Partial<SecurityConfig>) {
    this.config = {
      csp: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", "https://cdn.jsdelivr.net"],
        styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        imgSrc: ["'self'", "data:", "https:", "blob:"],
        connectSrc: ["'self'", "https://api.supabase.io", "wss:", "https:"],
        fontSrc: ["'self'", "https://fonts.gstatic.com"],
        objectSrc: ["'none'"],
        mediaSrc: ["'self'", "blob:"],
        frameSrc: ["'self'"]
      },
      headers: {
        hsts: true,
        xssProtection: true,
        contentTypeOptions: true,
        frameOptions: "DENY",
        referrerPolicy: "strict-origin-when-cross-origin"
      },
      validation: {
        maxInputLength: 10000,
        allowedFileTypes: ['.jpg', '.jpeg', '.png', '.gif', '.pdf', '.doc', '.docx'],
        maxFileSize: 10 * 1024 * 1024 // 10MB
      },
      ...config
    };
  }

  /**
   * Generate Content Security Policy header value
   */
  generateCSPHeader(): string {
    const csp = this.config.csp;
    const policies = [
      `default-src ${csp.defaultSrc.join(' ')}`,
      `script-src ${csp.scriptSrc.join(' ')}`,
      `style-src ${csp.styleSrc.join(' ')}`,
      `img-src ${csp.imgSrc.join(' ')}`,
      `connect-src ${csp.connectSrc.join(' ')}`,
      `font-src ${csp.fontSrc.join(' ')}`,
      `object-src ${csp.objectSrc.join(' ')}`,
      `media-src ${csp.mediaSrc.join(' ')}`,
      `frame-src ${csp.frameSrc.join(' ')}`
    ];
    return policies.join('; ');
  }

  /**
   * Sanitize user input to prevent XSS attacks
   */
  sanitizeInput(input: string): string {
    if (!input || typeof input !== 'string') return '';
    
    // Basic HTML entity encoding
    return input
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/\//g, '&#x2F;')
      .substring(0, this.config.validation.maxInputLength);
  }

  /**
   * Validate file uploads
   */
  validateFile(file: File): { valid: boolean; error?: string } {
    // Check file size
    if (file.size > this.config.validation.maxFileSize) {
      return {
        valid: false,
        error: `File size exceeds maximum allowed size of ${this.config.validation.maxFileSize / (1024 * 1024)}MB`
      };
    }

    // Check file type
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
    if (!this.config.validation.allowedFileTypes.includes(fileExtension || '')) {
      return {
        valid: false,
        error: `File type not allowed. Allowed types: ${this.config.validation.allowedFileTypes.join(', ')}`
      };
    }

    return { valid: true };
  }

  /**
   * Generate secure random token
   */
  generateSecureToken(length: number = 32): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    const randomValues = new Uint8Array(length);
    crypto.getRandomValues(randomValues);
    
    for (let i = 0; i < length; i++) {
      result += chars[randomValues[i] % chars.length];
    }
    return result;
  }

  /**
   * Encrypt sensitive data
   */
  async encryptData(data: string, key: string): Promise<string> {
    const encoder = new TextEncoder();
    const dataBuffer = encoder.encode(data);
    const keyBuffer = encoder.encode(key);
    
    // Import key
    const cryptoKey = await crypto.subtle.importKey(
      'raw',
      keyBuffer,
      { name: 'AES-GCM' },
      false,
      ['encrypt']
    );

    // Generate IV
    const iv = crypto.getRandomValues(new Uint8Array(12));
    
    // Encrypt
    const encrypted = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      cryptoKey,
      dataBuffer
    );

    // Combine IV and encrypted data
    const combined = new Uint8Array(iv.length + encrypted.byteLength);
    combined.set(iv);
    combined.set(new Uint8Array(encrypted), iv.length);
    
    return btoa(String.fromCharCode(...combined));
  }

  /**
   * Decrypt sensitive data
   */
  async decryptData(encryptedData: string, key: string): Promise<string> {
    const decoder = new TextDecoder();
    const encoder = new TextEncoder();
    const keyBuffer = encoder.encode(key);
    
    // Decode base64
    const combined = new Uint8Array(
      atob(encryptedData).split('').map(char => char.charCodeAt(0))
    );
    
    // Extract IV and encrypted data
    const iv = combined.slice(0, 12);
    const encrypted = combined.slice(12);
    
    // Import key
    const cryptoKey = await crypto.subtle.importKey(
      'raw',
      keyBuffer,
      { name: 'AES-GCM' },
      false,
      ['decrypt']
    );
    
    // Decrypt
    const decrypted = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv },
      cryptoKey,
      encrypted
    );
    
    return decoder.decode(decrypted);
  }

  /**
   * Rate limiting implementation
   */
  private rateLimitStore = new Map<string, { count: number; resetTime: number }>();

  isRateLimited(identifier: string, maxRequests: number = 100, windowMs: number = 60000): boolean {
    const now = Date.now();
    const record = this.rateLimitStore.get(identifier);
    
    if (!record || now > record.resetTime) {
      this.rateLimitStore.set(identifier, { count: 1, resetTime: now + windowMs });
      return false;
    }
    
    if (record.count >= maxRequests) {
      return true;
    }
    
    record.count++;
    return false;
  }

  /**
   * Initialize security headers for the application
   */
  initializeSecurityHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Security-Policy': this.generateCSPHeader()
    };

    if (this.config.headers.hsts) {
      headers['Strict-Transport-Security'] = 'max-age=31536000; includeSubDomains; preload';
    }

    if (this.config.headers.xssProtection) {
      headers['X-XSS-Protection'] = '1; mode=block';
    }

    if (this.config.headers.contentTypeOptions) {
      headers['X-Content-Type-Options'] = 'nosniff';
    }

    headers['X-Frame-Options'] = this.config.headers.frameOptions;
    headers['Referrer-Policy'] = this.config.headers.referrerPolicy;
    headers['Permissions-Policy'] = 'camera=(), microphone=(), geolocation=()';

    return headers;
  }

  /**
   * Audit and log security events
   */
  auditSecurityEvent(event: {
    type: 'login' | 'logout' | 'failed_login' | 'data_access' | 'file_upload' | 'rate_limit';
    userId?: string;
    ip?: string;
    userAgent?: string;
    details?: any;
  }): void {
    const auditLog = {
      timestamp: new Date().toISOString(),
      eventType: event.type,
      userId: event.userId || 'anonymous',
      ip: event.ip || 'unknown',
      userAgent: event.userAgent || 'unknown',
      details: event.details || {},
      sessionId: this.generateSecureToken(16)
    };

    // Log to console in development, send to monitoring service in production
    if (process.env.NODE_ENV === 'development') {
      console.log('Security Audit:', auditLog);
    } else {
      // In production, send to your logging service
      this.sendToMonitoringService(auditLog);
    }
  }

  private async sendToMonitoringService(auditLog: any): Promise<void> {
    // Implementation for sending to monitoring service
    // This would integrate with your chosen logging/monitoring solution
    try {
      // Example: await fetch('/api/security/audit', { method: 'POST', body: JSON.stringify(auditLog) });
    } catch (error) {
      console.error('Failed to send security audit log:', error);
    }
  }
}

// Export singleton instance
export const securityManager = new SecurityManager();

// Export security utilities
export const sanitizeInput = (input: string): string => securityManager.sanitizeInput(input);
export const validateFile = (file: File) => securityManager.validateFile(file);
export const generateSecureToken = (length?: number): string => securityManager.generateSecureToken(length);
export const isRateLimited = (identifier: string, maxRequests?: number, windowMs?: number): boolean => 
  securityManager.isRateLimited(identifier, maxRequests, windowMs);