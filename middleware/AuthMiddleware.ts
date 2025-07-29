import { Request, Response, NextFunction } from 'express';
import { authManager, UserRole } from '../services/security/AuthenticationManager';

// Authentication Middleware Interface
export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    username: string;
    role: UserRole;
  };
}

export class AuthMiddleware {
  // Token Validation Middleware
  static validateToken(
    req: AuthenticatedRequest, 
    res: Response, 
    next: NextFunction
  ): void {
    try {
      // Extract token from Authorization header
      const authHeader = req.headers.authorization;
      if (!authHeader) {
        res.status(401).json({ error: 'No token provided' });
        return;
      }

      const token = authHeader.split(' ')[1]; // Bearer TOKEN
      if (!token) {
        res.status(401).json({ error: 'Invalid token format' });
        return;
      }

      // Verify token
      const decoded = authManager.verifyToken(token);
      
      // Attach user information to request
      req.user = {
        id: decoded.id,
        username: decoded.username,
        role: decoded.role
      };

      next();
    } catch (error) {
      res.status(401).json({ error: 'Invalid or expired token' });
    }
  }

  // Role-Based Authorization Middleware
  static requireRole(allowedRoles: UserRole[]) {
    return (
      req: AuthenticatedRequest, 
      res: Response, 
      next: NextFunction
    ): void => {
      try {
        // Ensure user is authenticated first
        if (!req.user) {
          res.status(401).json({ error: 'Authentication required' });
          return;
        }

        // Check if user's role is in allowed roles
        if (!allowedRoles.includes(req.user.role)) {
          res.status(403).json({ error: 'Insufficient permissions' });
          return;
        }

        next();
      } catch (error) {
        res.status(403).json({ error: 'Authorization failed' });
      }
    };
  }

  // Permission-Based Authorization Middleware
  static requirePermission(requiredPermission: string) {
    return (
      req: AuthenticatedRequest, 
      res: Response, 
      next: NextFunction
    ): void => {
      try {
        // Ensure user is authenticated first
        if (!req.user) {
          res.status(401).json({ error: 'Authentication required' });
          return;
        }

        // Check specific permission
        const hasPermission = authManager.checkPermission(
          req.user.id, 
          requiredPermission
        );

        if (!hasPermission) {
          res.status(403).json({ error: 'Permission denied' });
          return;
        }

        next();
      } catch (error) {
        res.status(403).json({ error: 'Authorization failed' });
      }
    };
  }

  // Refresh Token Middleware
  static async refreshToken(
    req: AuthenticatedRequest, 
    res: Response
  ): Promise<void> {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        res.status(400).json({ error: 'Refresh token required' });
        return;
      }

      // Verify refresh token
      const decoded = authManager.verifyToken(refreshToken);

      // Find user and generate new tokens
      const user = await authManager.authenticate({
        username: decoded.username,
        password: req.body.password // Require password for additional security
      });

      res.json({
        token: user.token,
        refreshToken: user.refreshToken
      });
    } catch (error) {
      res.status(401).json({ error: 'Invalid refresh token' });
    }
  }

  // Audit Logging Middleware
  static auditLog(
    req: AuthenticatedRequest, 
    res: Response, 
    next: NextFunction
  ): void {
    const startTime = Date.now();

    // Capture original end function to inject logging
    const originalEnd = res.end;
    res.end = function(chunk?: any, encodingOrCb?: string | (() => void), cb?: () => void) {
      // Log audit information
      const logEntry = {
        timestamp: new Date().toISOString(),
        method: req.method,
        path: req.path,
        user: req.user?.username || 'unauthenticated',
        status: res.statusCode,
        duration: Date.now() - startTime
      };

      // In a real-world scenario, this would be logged to a secure audit log system
      console.log(JSON.stringify(logEntry));

      // Call original end method
      return originalEnd.call(this, chunk, encodingOrCb, cb);
    };

    next();
  }
}

// Export for use in route definitions
export default AuthMiddleware;