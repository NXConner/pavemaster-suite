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

export class SAPIntegrationStrategy extends BaseIntegrationStrategy {
  private static SAP_AUTH_ENDPOINTS = {
    TOKEN: 'https://api.sap.com/b1s/v1/Login',
    BUSINESS_OBJECTS_API: 'https://api.sap.com/b1s/v1'
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
        platform: EnterprisePlatform.SAP,
        timestamp: Date.now()
      });

      // SAP B1 authentication flow
      const tokenResponse = await this.httpClient.post(
        SAPIntegrationStrategy.SAP_AUTH_ENDPOINTS.TOKEN,
        {
          UserName: this.config.clientId,
          Password: this.config.clientSecret,
          CompanyDB: process.env.SAP_COMPANY_DB
        }
      );

      // Update configuration with new session key
      this.config.accessToken = tokenResponse.data.SessionKey;
      this.config.expiresAt = Date.now() + (24 * 60 * 60 * 1000); // 24-hour session

      // Update HTTP client authorization
      this.httpClient.defaults.headers['B1SESSION'] = this.config.accessToken;
      this.httpClient.defaults.headers['ROUTEID'] = tokenResponse.data.RouteId;

      // Emit authentication complete event
      integrationEventService.emit({
        id: uuidv4(),
        type: IntegrationEventType.AUTH_COMPLETED,
        platform: EnterprisePlatform.SAP,
        timestamp: Date.now()
      });
    } catch (error: any) {
      // Emit authentication failure event
      integrationEventService.emit({
        id: uuidv4(),
        type: IntegrationEventType.AUTH_FAILED,
        platform: EnterprisePlatform.SAP,
        timestamp: Date.now(),
        details: error.message
      });

      throw error;
    }
  }

  async refreshAccessToken(): Promise<void> {
    // SAP B1 typically uses session-based authentication
    // Re-authentication is the primary method of token refresh
    await this.authenticate();
  }

  async sync(type: SyncType): Promise<SyncStatus> {
    const syncStatus: SyncStatus = {
      id: uuidv4(),
      platform: EnterprisePlatform.SAP,
      startTime: Date.now(),
      status: 'in_progress',
      recordsSynced: 0
    };

    try {
      // Emit sync start event
      integrationEventService.emit({
        id: syncStatus.id,
        type: IntegrationEventType.SYNC_STARTED,
        platform: EnterprisePlatform.SAP,
        timestamp: syncStatus.startTime
      });

      // Determine sync endpoint based on type
      const syncEndpoints = {
        [SyncType.FULL]: {
          financial: `${SAPIntegrationStrategy.SAP_AUTH_ENDPOINTS.BUSINESS_OBJECTS_API}/FinancialPeriods/FullSync`,
          inventory: `${SAPIntegrationStrategy.SAP_AUTH_ENDPOINTS.BUSINESS_OBJECTS_API}/Items/FullSync`,
          sales: `${SAPIntegrationStrategy.SAP_AUTH_ENDPOINTS.BUSINESS_OBJECTS_API}/Orders/FullSync`
        },
        [SyncType.INCREMENTAL]: {
          financial: `${SAPIntegrationStrategy.SAP_AUTH_ENDPOINTS.BUSINESS_OBJECTS_API}/FinancialPeriods/IncrementalSync`,
          inventory: `${SAPIntegrationStrategy.SAP_AUTH_ENDPOINTS.BUSINESS_OBJECTS_API}/Items/IncrementalSync`,
          sales: `${SAPIntegrationStrategy.SAP_AUTH_ENDPOINTS.BUSINESS_OBJECTS_API}/Orders/IncrementalSync`
        }
      };

      // Perform sync for multiple business objects
      const syncPromises = Object.values(syncEndpoints[type]).map(
        endpoint => this.handleRateLimiting(async () => 
          this.httpClient.post(endpoint)
        )
      );

      const syncResponses = await Promise.all(syncPromises);

      // Aggregate sync results
      const totalRecordsSynced = syncResponses.reduce(
        (total, response) => total + (response.data.recordCount || 0), 
        0
      );

      // Update sync status
      syncStatus.endTime = Date.now();
      syncStatus.status = 'completed';
      syncStatus.recordsSynced = totalRecordsSynced;

      // Emit sync complete event
      integrationEventService.emit({
        id: syncStatus.id,
        type: IntegrationEventType.SYNC_COMPLETED,
        platform: EnterprisePlatform.SAP,
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
        platform: EnterprisePlatform.SAP,
        timestamp: Date.now(),
        details: error.message
      });

      return syncStatus;
    }
  }

  // Additional SAP-specific methods
  async getFinancialTransactions(
    startDate: Date, 
    endDate: Date
  ): Promise<any> {
    try {
      const response = await this.httpClient.get(
        `${SAPIntegrationStrategy.SAP_AUTH_ENDPOINTS.BUSINESS_OBJECTS_API}/JournalEntries`,
        {
          params: {
            $filter: `PostingDate ge ${startDate.toISOString()} and PostingDate le ${endDate.toISOString()}`
          }
        }
      );
      return response.data;
    } catch (error) {
      console.error('Failed to retrieve SAP financial transactions', error);
      throw error;
    }
  }

  async getInventoryItems(
    warehouseCode?: string
  ): Promise<any> {
    try {
      const endpoint = warehouseCode
        ? `${SAPIntegrationStrategy.SAP_AUTH_ENDPOINTS.BUSINESS_OBJECTS_API}/Items?$filter=WarehouseCode eq '${warehouseCode}'`
        : `${SAPIntegrationStrategy.SAP_AUTH_ENDPOINTS.BUSINESS_OBJECTS_API}/Items`;

      const response = await this.httpClient.get(endpoint);
      return response.data;
    } catch (error) {
      console.error('Failed to retrieve SAP inventory items', error);
      throw error;
    }
  }

  async getSalesOrders(
    customerCode?: string, 
    startDate?: Date, 
    endDate?: Date
  ): Promise<any> {
    try {
      const params: Record<string, string> = {};

      if (customerCode) {
        params['$filter'] = `CardCode eq '${customerCode}'`;
      }

      if (startDate && endDate) {
        const filterCondition = `DocDate ge ${startDate.toISOString()} and DocDate le ${endDate.toISOString()}`;
        params['$filter'] = params['$filter'] 
          ? `${params['$filter']} and ${filterCondition}`
          : filterCondition;
      }

      const response = await this.httpClient.get(
        `${SAPIntegrationStrategy.SAP_AUTH_ENDPOINTS.BUSINESS_OBJECTS_API}/Orders`,
        { params }
      );
      return response.data;
    } catch (error) {
      console.error('Failed to retrieve SAP sales orders', error);
      throw error;
    }
  }
}

// Export for use in IntegrationManager
export default SAPIntegrationStrategy;