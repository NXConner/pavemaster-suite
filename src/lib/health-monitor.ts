import { supabase } from "../integrations/supabase/client";

export interface HealthCheck {
  service: string;
  status: 'healthy' | 'unhealthy' | 'degraded';
  responseTime: number;
  message?: string;
  timestamp: string;
}

export interface SystemHealth {
  overall: 'healthy' | 'unhealthy' | 'degraded';
  services: HealthCheck[];
  uptime: number;
  version: string;
}

class HealthMonitor {
  private startTime = Date.now();
  
  async checkDatabase(): Promise<HealthCheck> {
    const start = Date.now();
    
    try {
      const { error } = await supabase
        .from('user_profiles')
        .select('id')
        .limit(1);
      
      const responseTime = Date.now() - start;
      
      if (error) {
        return {
          service: 'database',
          status: 'unhealthy',
          responseTime,
          message: error.message,
          timestamp: new Date().toISOString()
        };
      }
      
      return {
        service: 'database',
        status: responseTime < 1000 ? 'healthy' : 'degraded',
        responseTime,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        service: 'database',
        status: 'unhealthy',
        responseTime: Date.now() - start,
        message: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      };
    }
  }
  
  async checkAuthentication(): Promise<HealthCheck> {
    const start = Date.now();
    
    try {
      const { error } = await supabase.auth.getSession();
      const responseTime = Date.now() - start;
      
      return {
        service: 'authentication',
        status: error ? 'unhealthy' : 'healthy',
        responseTime,
        ...(error?.message && { message: error.message }),
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        service: 'authentication',
        status: 'unhealthy',
        responseTime: Date.now() - start,
        message: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      };
    }
  }
  
  async checkExternalServices(): Promise<HealthCheck[]> {
    const checks: Promise<HealthCheck>[] = [];
    
    // Check weather API (if implemented)
    checks.push(this.checkWeatherAPI());
    
    // Check other external services as needed
    
    return Promise.all(checks);
  }
  
  private async checkWeatherAPI(): Promise<HealthCheck> {
    const start = Date.now();
    
    try {
      // Mock weather API check - replace with actual implementation
      await new Promise(resolve => setTimeout(resolve, 100));
      
      return {
        service: 'weather-api',
        status: 'healthy',
        responseTime: Date.now() - start,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        service: 'weather-api',
        status: 'unhealthy',
        responseTime: Date.now() - start,
        message: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      };
    }
  }
  
  async getSystemHealth(): Promise<SystemHealth> {
    const [database, auth, ...external] = await Promise.all([
      this.checkDatabase(),
      this.checkAuthentication(),
      ...await this.checkExternalServices()
    ]);
    
    const services = [database, auth, ...external];
    const unhealthyServices = services.filter(s => s.status === 'unhealthy');
    const degradedServices = services.filter(s => s.status === 'degraded');
    
    let overall: 'healthy' | 'unhealthy' | 'degraded' = 'healthy';
    
    if (unhealthyServices.length > 0) {
      overall = 'unhealthy';
    } else if (degradedServices.length > 0) {
      overall = 'degraded';
    }
    
    return {
      overall,
      services,
      uptime: Date.now() - this.startTime,
      version: '1.0.0' // Should be injected from build process
    };
  }
  
  async logHealthCheck(health: SystemHealth): Promise<void> {
    try {
      // Log health check to console for now - would need health_checks table
      console.log('Health Check:', {
        overall_status: health.overall,
        services: health.services,
        uptime: health.uptime,
        version: health.version,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Failed to log health check:', error);
    }
  }
}

export const healthMonitor = new HealthMonitor();