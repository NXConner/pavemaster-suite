import axios, { AxiosInstance } from 'axios';
import { v4 as uuidv4 } from 'uuid';
import * as crypto from 'crypto';
import { 
  BaseIntegrationStrategy, 
  IntegrationConfig, 
  SyncType, 
  SyncStatus,
  EnterprisePlatform 
} from './IntegrationManager';
import { integrationEventService, IntegrationEventType } from './IntegrationEventService';

export class ADPIntegrationStrategy extends BaseIntegrationStrategy {
  private static ADP_AUTH_ENDPOINTS = {
    TOKEN: 'https://api.adp.com/auth/oauth/v2/token',
    WORKFORCE_API: 'https://api.adp.com/workforce/v2'
  };

  constructor(config: IntegrationConfig) {
    super(config);
  }

  async authenticate(): Promise<void> {
    try {
      // Emit authentication start event
      integrationEventService.emit({
        id: uuidv4(),
        type: IntegrationEventType.AUTH_STARTED,
        platform: EnterprisePlatform.ADP,
        timestamp: Date.now()
      });

      // ADP OAuth 2.0 flow
      const tokenResponse = await this.httpClient.post(
        ADPIntegrationStrategy.ADP_AUTH_ENDPOINTS.TOKEN,
        {
          grant_type: 'client_credentials',
          client_id: this.config.clientId,
          client_secret: this.config.clientSecret,
          scope: 'workforce.employee-profile-data workforce.payroll-data'
        }
      );

      // Update configuration with new tokens
      this.config.accessToken = tokenResponse.data.access_token;
      this.config.refreshToken = tokenResponse.data.refresh_token;
      this.config.expiresAt = Date.now() + (tokenResponse.data.expires_in * 1000);

      // Update HTTP client authorization
      this.httpClient.defaults.headers['Authorization'] = 
        `Bearer ${this.config.accessToken}`;

      // Emit authentication complete event
      integrationEventService.emit({
        id: uuidv4(),
        type: IntegrationEventType.AUTH_COMPLETED,
        platform: EnterprisePlatform.ADP,
        timestamp: Date.now()
      });
    } catch (error: any) {
      // Emit authentication failure event
      integrationEventService.emit({
        id: uuidv4(),
        type: IntegrationEventType.AUTH_FAILED,
        platform: EnterprisePlatform.ADP,
        timestamp: Date.now(),
        details: error.message
      });

      throw error;
    }
  }

  async refreshAccessToken(): Promise<void> {
    if (!this.config.refreshToken) {
      throw new Error('No refresh token available for ADP');
    }

    try {
      const tokenResponse = await this.httpClient.post(
        ADPIntegrationStrategy.ADP_AUTH_ENDPOINTS.TOKEN,
        {
          grant_type: 'refresh_token',
          refresh_token: this.config.refreshToken,
          client_id: this.config.clientId,
          client_secret: this.config.clientSecret
        }
      );

      // Update tokens
      this.config.accessToken = tokenResponse.data.access_token;
      this.config.refreshToken = tokenResponse.data.refresh_token;
      this.config.expiresAt = Date.now() + (tokenResponse.data.expires_in * 1000);

      // Update HTTP client authorization
      this.httpClient.defaults.headers['Authorization'] = 
        `Bearer ${this.config.accessToken}`;

      // Emit token refresh event
      integrationEventService.emit({
        id: uuidv4(),
        type: IntegrationEventType.TOKEN_REFRESHED,
        platform: EnterprisePlatform.ADP,
        timestamp: Date.now()
      });
    } catch (error: any) {
      // If refresh fails, trigger re-authentication
      await this.authenticate();
    }
  }

  async sync(type: SyncType): Promise<SyncStatus> {
    const syncStatus: SyncStatus = {
      id: uuidv4(),
      platform: EnterprisePlatform.ADP,
      startTime: Date.now(),
      status: 'in_progress',
      recordsSynced: 0
    };

    try {
      // Emit sync start event
      integrationEventService.emit({
        id: syncStatus.id,
        type: IntegrationEventType.SYNC_STARTED,
        platform: EnterprisePlatform.ADP,
        timestamp: syncStatus.startTime
      });

      // Determine sync endpoint based on type
      const endpoint = type === SyncType.FULL 
        ? `${ADPIntegrationStrategy.ADP_AUTH_ENDPOINTS.WORKFORCE_API}/full-sync`
        : `${ADPIntegrationStrategy.ADP_AUTH_ENDPOINTS.WORKFORCE_API}/incremental-sync`;

      // Perform rate-limited sync
      const syncResponse = await this.handleRateLimiting(async () => 
        this.httpClient.post(endpoint, {
          syncType: type,
          dataTypes: [
            'employee_records', 
            'payroll_records', 
            'time_sheets'
          ]
        })
      );

      // Update sync status
      syncStatus.endTime = Date.now();
      syncStatus.status = 'completed';
      syncStatus.recordsSynced = syncResponse.data.recordCount || 0;

      // Emit sync complete event
      integrationEventService.emit({
        id: syncStatus.id,
        type: IntegrationEventType.SYNC_COMPLETED,
        platform: EnterprisePlatform.ADP,
        timestamp: syncStatus.endTime,
        details: syncStatus
      });

      return syncStatus;
    } catch (error: any) {
      // Update sync status with error
      syncStatus.status = 'failed';
      syncStatus.errors = [error.message];

      // Emit sync failure event
      integrationEventService.emit({
        id: syncStatus.id,
        type: IntegrationEventType.SYNC_FAILED,
        platform: EnterprisePlatform.ADP,
        timestamp: Date.now(),
        details: error.message
      });

      return syncStatus;
    }
  }

  // Additional ADP-specific methods
  async getEmployeeData(employeeId?: string): Promise<any> {
    try {
      const endpoint = employeeId 
        ? `${ADPIntegrationStrategy.ADP_AUTH_ENDPOINTS.WORKFORCE_API}/employees/${employeeId}`
        : `${ADPIntegrationStrategy.ADP_AUTH_ENDPOINTS.WORKFORCE_API}/employees`;

      const response = await this.httpClient.get(endpoint);
      return response.data;
    } catch (error) {
      console.error('Failed to retrieve ADP employee data', error);
      throw error;
    }
  }

  async getPayrollData(
    startDate: Date, 
    endDate: Date
  ): Promise<any> {
    try {
      const response = await this.httpClient.get(
        `${ADPIntegrationStrategy.ADP_AUTH_ENDPOINTS.WORKFORCE_API}/payroll-data`,
        {
          params: {
            startDate: startDate.toISOString(),
            endDate: endDate.toISOString()
          }
        }
      );
      return response.data;
    } catch (error) {
      console.error('Failed to retrieve ADP payroll data', error);
      throw error;
    }
  }
}

// Export for use in IntegrationManager
export default ADPIntegrationStrategy;