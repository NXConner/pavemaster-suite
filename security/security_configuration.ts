import * as crypto from 'crypto';
import * as jwt from 'jsonwebtoken';
import * as bcrypt from 'bcrypt';
import { EventEmitter } from 'events';
import * as fs from 'fs';
import * as path from 'path';

interface SecurityPolicy {
    id: string;
    name: string;
    description: string;
    enabled: boolean;
    severity: 'low' | 'medium' | 'high' | 'critical';
    type: 'authentication' | 'authorization' | 'encryption' | 'compliance' | 'audit';
    rules: Array<{
        condition: string;
        action: 'block' | 'log' | 'alert' | 'quarantine';
    }>;
}

interface AuditLogEntry {
    timestamp: number;
    userId?: string;
    action: string;
    category: 'authentication' | 'data-access' | 'system-config' | 'security-event';
    severity: 'info' | 'warning' | 'error' | 'critical';
    details: Record<string, any>;
}

interface EncryptionConfig {
    algorithm: string;
    keyLength: number;
    saltRounds: number;
}

class SecurityConfiguration extends EventEmitter {
    private securityPolicies: Map<string, SecurityPolicy> = new Map();
    private auditLog: AuditLogEntry[] = [];
    private encryptionConfig: EncryptionConfig = {
        algorithm: 'aes-256-gcm',
        keyLength: 32,
        saltRounds: 12
    };

    constructor() {
        super();
        this.initializeDefaultSecurityPolicies();
        this.setupEncryptionConfiguration();
        this.setupAuditLogging();
    }

    private initializeDefaultSecurityPolicies() {
        const defaultPolicies: SecurityPolicy[] = [
            {
                id: 'strong-authentication',
                name: 'Strong Authentication Policy',
                description: 'Enforce multi-factor authentication and password complexity',
                enabled: true,
                severity: 'high',
                type: 'authentication',
                rules: [
                    {
                        condition: 'password-length < 12',
                        action: 'block'
                    },
                    {
                        condition: 'no-multi-factor-auth',
                        action: 'alert'
                    }
                ]
            },
            {
                id: 'role-based-access-control',
                name: 'Role-Based Access Control',
                description: 'Strict access control based on user roles',
                enabled: true,
                severity: 'critical',
                type: 'authorization',
                rules: [
                    {
                        condition: 'unauthorized-resource-access',
                        action: 'block'
                    }
                ]
            },
            {
                id: 'data-encryption',
                name: 'Data Encryption Policy',
                description: 'Enforce encryption for sensitive data',
                enabled: true,
                severity: 'high',
                type: 'encryption',
                rules: [
                    {
                        condition: 'unencrypted-sensitive-data',
                        action: 'alert'
                    }
                ]
            }
        ];

        defaultPolicies.forEach(policy => this.registerSecurityPolicy(policy));
    }

    private setupEncryptionConfiguration() {
        this.encryptionConfig = {
            algorithm: 'aes-256-gcm',
            keyLength: 256,
            saltRounds: 12
        };
    }

    private setupAuditLogging() {
        // Set up audit log rotation
        setInterval(() => {
            this.rotateAuditLogs();
        }, 24 * 60 * 60 * 1000); // Daily log rotation
    }

    public registerSecurityPolicy(policy: SecurityPolicy) {
        this.securityPolicies.set(policy.id, policy);
        this.emit('security-policy-registered', policy);
    }

    public generateSecureToken(payload: Record<string, any>, expiresIn: string = '1h') {
        const secretKey = this.generateSecretKey();
        return jwt.sign(payload, secretKey, { expiresIn });
    }

    public verifySecureToken(token: string): Record<string, any> | null {
        try {
            const secretKey = this.getSecretKey();
            return jwt.verify(token, secretKey) as Record<string, any>;
        } catch (error: any) {
            this.logAuditEvent({
                action: 'token-verification-failed',
                category: 'authentication',
                severity: 'error',
                details: { error: error?.message || 'Unknown verification error' }
            });
            return null;
        }
    }

    public hashPassword(password: string): Promise<string> {
        return bcrypt.hash(password, this.encryptionConfig.saltRounds);
    }

    public comparePassword(password: string, hashedPassword: string): Promise<boolean> {
        return bcrypt.compare(password, hashedPassword);
    }

    public encryptData(data: string, key?: Buffer): { 
        encryptedData: string; 
        iv: string; 
        authTag: string 
    } {
        const iv = crypto.randomBytes(16);
        const encryptionKey = key || this.generateEncryptionKey();
        
        const cipher = crypto.createCipheriv(
            this.encryptionConfig.algorithm, 
            encryptionKey, 
            iv
        );
        
        let encrypted = cipher.update(data, 'utf8', 'hex');
        encrypted += cipher.final('hex');
        
        return {
            encryptedData: encrypted,
            iv: iv.toString('hex'),
            authTag: (cipher as any).getAuthTag().toString('hex')
        };
    }

    public decryptData(
        encryptedData: string, 
        iv: string, 
        authTag: string, 
        key?: Buffer
    ): string {
        const decryptionKey = key || this.getEncryptionKey();
        
        const decipher = crypto.createDecipheriv(
            this.encryptionConfig.algorithm, 
            decryptionKey, 
            Buffer.from(iv, 'hex')
        );
        
        (decipher as any).setAuthTag(Buffer.from(authTag, 'hex'));
        
        let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
        decrypted += decipher.final('utf8');
        
        return decrypted;
    }

    public logAuditEvent(entry: Omit<AuditLogEntry, 'timestamp'>) {
        const auditEntry: AuditLogEntry = {
            ...entry,
            timestamp: Date.now()
        };

        this.auditLog.push(auditEntry);
        this.emit('audit-log-entry', auditEntry);

        // Trigger any security policy checks based on the audit log entry
        this.checkSecurityPolicies(auditEntry);
    }

    private checkSecurityPolicies(auditEntry: AuditLogEntry) {
        this.securityPolicies.forEach(policy => {
            if (!policy.enabled) return;

            policy.rules.forEach(rule => {
                // Simplified policy checking - would be more complex in real-world scenario
                if (this.evaluateSecurityRule(rule.condition, auditEntry)) {
                    this.handleSecurityPolicyViolation(policy, rule, auditEntry);
                }
            });
        });
    }

    private evaluateSecurityRule(condition: string, auditEntry: AuditLogEntry): boolean {
        // Simplified rule evaluation
        switch (condition) {
            case 'unauthorized-resource-access':
                return auditEntry.category === 'data-access' && 
                       auditEntry.severity === 'error';
            case 'unencrypted-sensitive-data':
                return auditEntry.category === 'system-config' && 
                       auditEntry.details?.sensitiveDataExposed;
            default:
                return false;
        }
    }

    private handleSecurityPolicyViolation(
        policy: SecurityPolicy, 
        rule: SecurityPolicy['rules'][0], 
        auditEntry: AuditLogEntry
    ) {
        switch (rule.action) {
            case 'block':
                this.emit('security-policy-violation', {
                    policy,
                    rule,
                    auditEntry,
                    action: 'blocked'
                });
                break;
            case 'alert':
                this.emit('security-policy-violation', {
                    policy,
                    rule,
                    auditEntry,
                    action: 'alerted'
                });
                break;
            case 'log':
                console.warn('Security Policy Violation', { policy, rule, auditEntry });
                break;
        }
    }

    private rotateAuditLogs() {
        const logDirectory = path.join(__dirname, 'audit-logs');
        
        // Ensure log directory exists
        if (!fs.existsSync(logDirectory)) {
            fs.mkdirSync(logDirectory);
        }

        const logFileName = `audit-log-${new Date().toISOString().split('T')[0]}.json`;
        const logFilePath = path.join(logDirectory, logFileName);

        // Write current audit log to file
        fs.writeFileSync(logFilePath, JSON.stringify(this.auditLog, null, 2));

        // Clear current audit log, keeping only the last 1000 entries
        this.auditLog = this.auditLog.slice(-1000);
    }

    private generateSecretKey(): Buffer {
        return crypto.randomBytes(64);
    }

    private getSecretKey(): Buffer {
        // In a real-world scenario, this would come from a secure key management system
        return this.generateSecretKey();
    }

    private generateEncryptionKey(): Buffer {
        return crypto.randomBytes(32);
    }

    private getEncryptionKey(): Buffer {
        // In a real-world scenario, this would come from a secure key management system
        return this.generateEncryptionKey();
    }

    public generateComplianceReport() {
        return {
            policies: Array.from(this.securityPolicies.values()),
            auditLogSummary: {
                totalEntries: this.auditLog.length,
                entriesByCategory: this.auditLog.reduce((acc, entry) => {
                    (acc as Record<string, number>)[entry.category] = ((acc as Record<string, number>)[entry.category] || 0) + 1;
                    return acc;
                }, {} as Record<string, number>),
                entriesBySeverity: this.auditLog.reduce((acc, entry) => {
                    (acc as Record<string, number>)[entry.severity] = ((acc as Record<string, number>)[entry.severity] || 0) + 1;
                    return acc;
                }, {} as Record<string, number>)
            }
        };
    }
}

export default new SecurityConfiguration(); 