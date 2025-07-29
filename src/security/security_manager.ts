import { EventEmitter } from 'events';
import * as crypto from 'crypto';
import * as jwt from 'jsonwebtoken';
import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';

interface SecurityConfig {
    id: string;
    name: string;
    type: 'authentication' | 'authorization' | 'encryption' | 'compliance';
    enabled: boolean;
    priority: number;
    performanceThreshold?: number;
}

interface UserRole {
    id: string;
    name: string;
    permissions: string[];
}

interface SecurityAuditLog {
    timestamp: Date;
    type: string;
    userId?: string;
    action: string;
    success: boolean;
    details?: any;
}

class SecurityManager extends EventEmitter {
    private securityModules: Map<string, Function> = new Map();
    private securityConfigs: Map<string, SecurityConfig> = new Map();
    private userRoles: Map<string, UserRole> = new Map();
    private auditLogs: SecurityAuditLog[] = [];

    private static SECRET_KEY = crypto.randomBytes(64).toString('hex');
    private static SALT_ROUNDS = 12;

    constructor() {
        super();
        this.initializeStandardSecurityModules();
        this.initializeDefaultRoles();
    }

    private initializeStandardSecurityModules() {
        const standardModules: Array<{
            module: Function;
            config: SecurityConfig;
        }> = [
            {
                module: this.authenticationModule,
                config: {
                    id: 'authentication',
                    name: 'User Authentication',
                    type: 'authentication',
                    enabled: true,
                    priority: 100,
                    performanceThreshold: 200
                }
            },
            {
                module: this.authorizationModule,
                config: {
                    id: 'authorization',
                    name: 'Role-Based Access Control',
                    type: 'authorization',
                    enabled: true,
                    priority: 200,
                    performanceThreshold: 100
                }
            },
            {
                module: this.encryptionModule,
                config: {
                    id: 'encryption',
                    name: 'Data Encryption',
                    type: 'encryption',
                    enabled: true,
                    priority: 300,
                    performanceThreshold: 150
                }
            },
            {
                module: this.complianceModule,
                config: {
                    id: 'compliance',
                    name: 'Regulatory Compliance',
                    type: 'compliance',
                    enabled: true,
                    priority: 400,
                    performanceThreshold: 300
                }
            }
        ];

        standardModules.forEach(({ module, config }) => {
            this.registerSecurityModule(config, module);
        });
    }

    private initializeDefaultRoles() {
        const defaultRoles: UserRole[] = [
            {
                id: 'super_admin',
                name: 'Super Administrator',
                permissions: [
                    'full_access', 
                    'system_config', 
                    'user_management', 
                    'security_settings'
                ]
            },
            {
                id: 'admin',
                name: 'Administrator',
                permissions: [
                    'user_management', 
                    'project_management', 
                    'reporting'
                ]
            },
            {
                id: 'field_crew',
                name: 'Field Crew',
                permissions: [
                    'project_tracking', 
                    'measurements', 
                    'reporting_limited'
                ]
            },
            {
                id: 'analyst',
                name: 'Data Analyst',
                permissions: [
                    'data_analysis', 
                    'reporting', 
                    'dashboard_access'
                ]
            }
        ];

        defaultRoles.forEach(role => this.createRole(role));
    }

    public registerSecurityModule(
        config: SecurityConfig, 
        module: Function
    ) {
        // Validate and register security module
        if (!config.id) {
            config.id = uuidv4();
        }

        this.securityModules.set(config.id, module);
        this.securityConfigs.set(config.id, config);

        this.emit('security-module-registered', config);
    }

    private async authenticationModule(credentials: { username: string, password: string }) {
        const startTime = performance.now();

        try {
            // Validate credentials
            const user = await this.validateCredentials(
                credentials.username, 
                credentials.password
            );

            // Generate authentication token
            const token = this.generateAuthToken(user);

            const endTime = performance.now();
            this.logAuditTrail({
                type: 'authentication',
                action: 'login',
                userId: user.id,
                success: true
            });

            return { 
                token, 
                user: { 
                    id: user.id, 
                    username: user.username, 
                    role: user.role 
                } 
            };
        } catch (error) {
            this.logAuditTrail({
                type: 'authentication',
                action: 'login_attempt',
                success: false,
                details: { username: credentials.username }
            });

            throw error;
        }
    }

    private async authorizationModule(user: any, requiredPermissions: string[]) {
        const startTime = performance.now();

        try {
            // Check user permissions
            const userRole = this.userRoles.get(user.role);
            if (!userRole) {
                throw new Error('Invalid user role');
            }

            const hasPermissions = requiredPermissions.every(permission => 
                userRole.permissions.includes(permission)
            );

            if (!hasPermissions) {
                throw new Error('Insufficient permissions');
            }

            const endTime = performance.now();
            this.logAuditTrail({
                type: 'authorization',
                action: 'permission_check',
                userId: user.id,
                success: true,
                details: { requiredPermissions }
            });

            return true;
        } catch (error) {
            this.logAuditTrail({
                type: 'authorization',
                action: 'permission_check',
                success: false,
                details: { requiredPermissions }
            });

            throw error;
        }
    }

    private async encryptionModule(data: string, encrypt: boolean = true) {
        const startTime = performance.now();

        try {
            let result: string;
            if (encrypt) {
                // Encryption
                result = crypto.createCipher('aes-256-cbc', SecurityManager.SECRET_KEY)
                    .update(data, 'utf8', 'hex')
                    .final('hex');
            } else {
                // Decryption
                result = crypto.createDecipher('aes-256-cbc', SecurityManager.SECRET_KEY)
                    .update(data, 'hex', 'utf8')
                    .final('utf8');
            }

            const endTime = performance.now();
            this.logAuditTrail({
                type: 'encryption',
                action: encrypt ? 'encrypt' : 'decrypt',
                success: true
            });

            return result;
        } catch (error) {
            this.logAuditTrail({
                type: 'encryption',
                action: encrypt ? 'encrypt' : 'decrypt',
                success: false
            });

            throw error;
        }
    }

    private async complianceModule(data: any) {
        const startTime = performance.now();

        try {
            // Compliance checks
            const complianceChecks = [
                this.checkDataPrivacy(data),
                this.checkRetentionPolicy(data)
            ];

            await Promise.all(complianceChecks);

            const endTime = performance.now();
            this.logAuditTrail({
                type: 'compliance',
                action: 'data_validation',
                success: true
            });

            return true;
        } catch (error) {
            this.logAuditTrail({
                type: 'compliance',
                action: 'data_validation',
                success: false,
                details: { error: error.message }
            });

            throw error;
        }
    }

    private async checkDataPrivacy(data: any): Promise<void> {
        // Implement data privacy checks
        const sensitiveFields = ['ssn', 'credit_card', 'health_info'];
        
        sensitiveFields.forEach(field => {
            if (data[field]) {
                // Ensure sensitive data is properly masked or encrypted
                data[field] = this.maskSensitiveData(data[field]);
            }
        });
    }

    private async checkRetentionPolicy(data: any): Promise<void> {
        // Implement data retention policy checks
        const MAX_RETENTION_DAYS = 365;
        
        if (data.created_at) {
            const createdDate = new Date(data.created_at);
            const daysSinceCreation = (Date.now() - createdDate.getTime()) / (1000 * 3600 * 24);
            
            if (daysSinceCreation > MAX_RETENTION_DAYS) {
                throw new Error('Data retention period exceeded');
            }
        }
    }

    private maskSensitiveData(data: string): string {
        // Basic sensitive data masking
        return data.slice(0, 4) + '*'.repeat(data.length - 4);
    }

    private logAuditTrail(entry: Omit<SecurityAuditLog, 'timestamp'>) {
        const auditEntry: SecurityAuditLog = {
            ...entry,
            timestamp: new Date()
        };

        this.auditLogs.push(auditEntry);

        // Limit audit log size
        if (this.auditLogs.length > 1000) {
            this.auditLogs.shift();
        }

        // Emit audit log event
        this.emit('audit-log', auditEntry);
    }

    public async executeSecurityModule(
        moduleId: string, 
        ...args: any[]
    ) {
        const module = this.securityModules.get(moduleId);
        
        if (!module) {
            throw new Error(`Security module ${moduleId} not found`);
        }

        try {
            return await module(...args);
        } catch (error) {
            this.emit('security-module-error', { moduleId, error });
            throw error;
        }
    }

    public createRole(role: UserRole) {
        this.userRoles.set(role.id, role);
        this.emit('role-created', role);
    }

    public async hashPassword(password: string): Promise<string> {
        return bcrypt.hash(password, SecurityManager.SALT_ROUNDS);
    }

    private async validateCredentials(
        username: string, 
        password: string
    ): Promise<any> {
        // Placeholder for actual user validation
        // In a real system, this would check against a user database
        const mockUser = {
            id: uuidv4(),
            username,
            role: 'admin',
            passwordHash: await this.hashPassword('mockpassword')
        };

        const isValid = await bcrypt.compare(password, mockUser.passwordHash);
        
        if (!isValid) {
            throw new Error('Invalid credentials');
        }

        return mockUser;
    }

    private generateAuthToken(user: any): string {
        return jwt.sign(
            { 
                id: user.id, 
                username: user.username, 
                role: user.role 
            }, 
            SecurityManager.SECRET_KEY, 
            { expiresIn: '1h' }
        );
    }

    public generateSecurityReport() {
        return {
            auditLogs: this.auditLogs,
            securityModules: Array.from(this.securityConfigs.values()),
            roles: Array.from(this.userRoles.values())
        };
    }
}

export default new SecurityManager(); 