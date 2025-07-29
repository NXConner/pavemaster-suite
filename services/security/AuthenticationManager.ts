import * as crypto from 'crypto';
import * as speakeasy from 'speakeasy';
import * as QRCode from 'qrcode';
import * as jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';

// User Roles Definition
export enum UserRole {
  SUPER_ADMIN = 'super_admin',
  ADMIN = 'admin',
  MANAGER = 'manager',
  FIELD_TECHNICIAN = 'field_technician',
  VIEWER = 'viewer'
}

// Role Permissions Mapping
export const ROLE_PERMISSIONS: Record<UserRole, string[]> = {
  [UserRole.SUPER_ADMIN]: [
    'full_access', 
    'system_config', 
    'user_management', 
    'financial_management',
    'enterprise_integration'
  ],
  [UserRole.ADMIN]: [
    'user_management', 
    'financial_reporting', 
    'project_management',
    'enterprise_integration_read'
  ],
  [UserRole.MANAGER]: [
    'project_management', 
    'financial_reporting', 
    'team_management'
  ],
  [UserRole.FIELD_TECHNICIAN]: [
    'project_tracking', 
    'gps_tracking', 
    'task_management'
  ],
  [UserRole.VIEWER]: [
    'read_only_access'
  ]
};

// Authentication Configuration Interface
export interface AuthConfig {
  jwtSecret: string;
  jwtExpiration: number;
  mfaIssuer: string;
}

// User Authentication Request Interface
export interface AuthRequest {
  username: string;
  password: string;
  mfaToken?: string;
}

// Authentication Response Interface
export interface AuthResponse {
  token: string;
  refreshToken: string;
  user: {
    id: string;
    username: string;
    role: UserRole;
    mfaEnabled: boolean;
  };
}

// User Account Interface
export interface UserAccount {
  id: string;
  username: string;
  passwordHash: string;
  salt: string;
  role: UserRole;
  mfaSecret?: string;
  mfaEnabled: boolean;
  lastLogin?: number;
  loginAttempts: number;
  lockoutUntil?: number;
}

export class AuthenticationManager {
  private static INSTANCE: AuthenticationManager;
  private users: Map<string, UserAccount> = new Map();
  private config: AuthConfig;

  private constructor(config?: Partial<AuthConfig>) {
    // Default configuration with secure defaults
    this.config = {
      jwtSecret: process.env.JWT_SECRET || crypto.randomBytes(64).toString('hex'),
      jwtExpiration: 3600, // 1 hour
      mfaIssuer: 'PaveMaster Suite'
    };

    // Override with provided configuration
    if (config) {
      this.config = { ...this.config, ...config };
    }
  }

  // Singleton pattern
  public static getInstance(config?: Partial<AuthConfig>): AuthenticationManager {
    if (!AuthenticationManager.INSTANCE) {
      AuthenticationManager.INSTANCE = new AuthenticationManager(config);
    }
    return AuthenticationManager.INSTANCE;
  }

  // Password Hashing Method
  private hashPassword(password: string, salt?: string): { hash: string, newSalt: string } {
    salt = salt || crypto.randomBytes(16).toString('hex');
    const hash = crypto
      .pbkdf2Sync(password, salt, 10000, 64, 'sha512')
      .toString('hex');
    return { hash, newSalt: salt };
  }

  // Password Verification Method
  private verifyPassword(
    storedHash: string, 
    storedSalt: string, 
    providedPassword: string
  ): boolean {
    const { hash } = this.hashPassword(providedPassword, storedSalt);
    return hash === storedHash;
  }

  // Create User Account
  public createUser(
    username: string, 
    password: string, 
    role: UserRole = UserRole.VIEWER
  ): UserAccount {
    // Check if username already exists
    if (Array.from(this.users.values()).some(u => u.username === username)) {
      throw new Error('Username already exists');
    }

    const userId = uuidv4();
    const { hash: passwordHash, newSalt: salt } = this.hashPassword(password);

    const newUser: UserAccount = {
      id: userId,
      username,
      passwordHash,
      salt,
      role,
      mfaEnabled: false,
      loginAttempts: 0
    };

    this.users.set(userId, newUser);
    return newUser;
  }

  // Authenticate User
  public async authenticate(request: AuthRequest): Promise<AuthResponse> {
    // Find user by username
    const user = Array.from(this.users.values())
      .find(u => u.username === request.username);

    if (!user) {
      throw new Error('Invalid credentials');
    }

    // Check account lockout
    if (user.lockoutUntil && user.lockoutUntil > Date.now()) {
      throw new Error('Account is temporarily locked');
    }

    // Verify password
    const passwordValid = this.verifyPassword(
      user.passwordHash, 
      user.salt, 
      request.password
    );

    if (!passwordValid) {
      // Increment login attempts
      user.loginAttempts++;

      // Lockout after 5 failed attempts
      if (user.loginAttempts >= 5) {
        user.lockoutUntil = Date.now() + (15 * 60 * 1000); // 15 minutes
        throw new Error('Too many failed attempts. Account locked for 15 minutes.');
      }

      throw new Error('Invalid credentials');
    }

    // Reset login attempts on successful password
    user.loginAttempts = 0;

    // MFA Verification if enabled
    if (user.mfaEnabled) {
      if (!request.mfaToken) {
        throw new Error('MFA token required');
      }

      const mfaValid = speakeasy.totp.verify({
        secret: user.mfaSecret,
        encoding: 'base32',
        token: request.mfaToken
      });

      if (!mfaValid) {
        throw new Error('Invalid MFA token');
      }
    }

    // Generate JWT tokens
    const token = this.generateJWT(user);
    const refreshToken = this.generateRefreshToken(user);

    // Update last login
    user.lastLogin = Date.now();

    return {
      token,
      refreshToken,
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
        mfaEnabled: user.mfaEnabled
      }
    };
  }

  // Generate JWT Token
  private generateJWT(user: UserAccount): string {
    return jwt.sign(
      { 
        id: user.id, 
        username: user.username, 
        role: user.role 
      },
      this.config.jwtSecret,
      { expiresIn: this.config.jwtExpiration }
    );
  }

  // Generate Refresh Token
  private generateRefreshToken(user: UserAccount): string {
    return jwt.sign(
      { 
        id: user.id, 
        type: 'refresh' 
      },
      this.config.jwtSecret,
      { expiresIn: '7d' }
    );
  }

  // Verify JWT Token
  public verifyToken(token: string): any {
    try {
      return jwt.verify(token, this.config.jwtSecret);
    } catch (error) {
      throw new Error('Invalid or expired token');
    }
  }

  // Setup Multi-Factor Authentication
  public setupMFA(userId: string): { secret: string, qrCodeUrl: string } {
    const user = this.users.get(userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Generate MFA secret
    const secret = speakeasy.generateSecret({ 
      name: `${this.config.mfaIssuer}:${user.username}` 
    });

    // Update user with MFA secret
    user.mfaSecret = secret.base32;

    // Generate QR Code URL
    const qrCodeUrl = QRCode.toDataURL(secret.otpauth_url);

    return { 
      secret: secret.base32, 
      qrCodeUrl 
    };
  }

  // Enable Multi-Factor Authentication
  public enableMFA(userId: string, token: string): boolean {
    const user = this.users.get(userId);
    if (!user || !user.mfaSecret) {
      throw new Error('MFA not set up');
    }

    const tokenValid = speakeasy.totp.verify({
      secret: user.mfaSecret,
      encoding: 'base32',
      token: token
    });

    if (tokenValid) {
      user.mfaEnabled = true;
      return true;
    }

    return false;
  }

  // Disable Multi-Factor Authentication
  public disableMFA(userId: string): void {
    const user = this.users.get(userId);
    if (!user) {
      throw new Error('User not found');
    }

    user.mfaEnabled = false;
    user.mfaSecret = undefined;
  }

  // Check User Permissions
  public checkPermission(
    userId: string, 
    requiredPermission: string
  ): boolean {
    const user = this.users.get(userId);
    if (!user) {
      return false;
    }

    const rolePermissions = ROLE_PERMISSIONS[user.role];
    return rolePermissions.includes(requiredPermission) || 
           rolePermissions.includes('full_access');
  }
}

// Singleton instance for global access
export const authManager = AuthenticationManager.getInstance();