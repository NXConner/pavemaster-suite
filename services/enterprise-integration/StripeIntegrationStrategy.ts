import Stripe from 'stripe';
import { v4 as uuidv4 } from 'uuid';
import { 
  BaseIntegrationStrategy, 
  IntegrationConfig, 
  SyncType, 
  SyncStatus,
  EnterprisePlatform 
} from './IntegrationManager';
import { integrationEventService, IntegrationEventType } from './IntegrationEventService';

// Stripe-specific transaction types
export enum StripeTransactionType {
  PAYMENT = 'payment',
  REFUND = 'refund',
  TRANSFER = 'transfer',
  PAYOUT = 'payout'
}

// Stripe Transaction Interface
export interface StripeTransaction {
  id: string;
  type: StripeTransactionType;
  amount: number;
  currency: string;
  status: string;
  metadata?: Record<string, any>;
  createdAt: Date;
}

export class StripeIntegrationStrategy extends BaseIntegrationStrategy {
  private stripeClient: Stripe;

  constructor(config: IntegrationConfig) {
    super(config);
    
    // Initialize Stripe client
    this.stripeClient = new Stripe(
      this.config.clientSecret, 
      { 
        apiVersion: '2023-10-16', 
        typescript: true 
      }
    );
  }

  async authenticate(): Promise<void> {
    try {
      // Emit authentication start event
      integrationEventService.emit({
        id: uuidv4(),
        type: IntegrationEventType.AUTH_STARTED,
        platform: EnterprisePlatform.STRIPE,
        timestamp: Date.now()
      });

      // Verify API key by fetching account information
      await this.stripeClient.accounts.retrieve();

      // Emit authentication complete event
      integrationEventService.emit({
        id: uuidv4(),
        type: IntegrationEventType.AUTH_COMPLETED,
        platform: EnterprisePlatform.STRIPE,
        timestamp: Date.now()
      });
    } catch (error: any) {
      // Emit authentication failure event
      integrationEventService.emit({
        id: uuidv4(),
        type: IntegrationEventType.AUTH_FAILED,
        platform: EnterprisePlatform.STRIPE,
        timestamp: Date.now(),
        details: error.message
      });

      throw error;
    }
  }

  async refreshAccessToken(): Promise<void> {
    // Stripe uses API keys, so no traditional token refresh
    await this.authenticate();
  }

  async sync(type: SyncType): Promise<SyncStatus> {
    const syncStatus: SyncStatus = {
      id: uuidv4(),
      platform: EnterprisePlatform.STRIPE,
      startTime: Date.now(),
      status: 'in_progress',
      recordsSynced: 0
    };

    try {
      // Emit sync start event
      integrationEventService.emit({
        id: syncStatus.id,
        type: IntegrationEventType.SYNC_STARTED,
        platform: EnterprisePlatform.STRIPE,
        timestamp: syncStatus.startTime
      });

      // Determine sync date range based on type
      const endDate = new Date();
      const startDate = type === SyncType.FULL 
        ? new Date(endDate.getFullYear() - 1, endDate.getMonth(), endDate.getDate())
        : new Date(endDate.getTime() - 30 * 24 * 60 * 60 * 1000); // Last 30 days for incremental

      // Sync different transaction types
      const syncPromises = [
        this.syncPayments(startDate, endDate),
        this.syncRefunds(startDate, endDate),
        this.syncTransfers(startDate, endDate),
        this.syncPayouts(startDate, endDate)
      ];

      const syncResults = await Promise.all(syncPromises);

      // Aggregate sync results
      const totalRecordsSynced = syncResults.reduce((total, result) => total + result.length, 0);

      // Update sync status
      syncStatus.endTime = Date.now();
      syncStatus.status = 'completed';
      syncStatus.recordsSynced = totalRecordsSynced;

      // Emit sync complete event
      integrationEventService.emit({
        id: syncStatus.id,
        type: IntegrationEventType.SYNC_COMPLETED,
        platform: EnterprisePlatform.STRIPE,
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
        platform: EnterprisePlatform.STRIPE,
        timestamp: Date.now(),
        details: error.message
      });

      return syncStatus;
    }
  }

  // Sync Payments
  private async syncPayments(
    startDate: Date, 
    endDate: Date
  ): Promise<StripeTransaction[]> {
    const { data: payments } = await this.stripeClient.charges.list({
      created: {
        gte: Math.floor(startDate.getTime() / 1000),
        lte: Math.floor(endDate.getTime() / 1000)
      },
      limit: 100
    });

    return payments.map(payment => ({
      id: payment.id,
      type: StripeTransactionType.PAYMENT,
      amount: payment.amount / 100, // Convert cents to dollars
      currency: payment.currency,
      status: payment.status,
      metadata: payment.metadata,
      createdAt: new Date(payment.created * 1000)
    }));
  }

  // Sync Refunds
  private async syncRefunds(
    startDate: Date, 
    endDate: Date
  ): Promise<StripeTransaction[]> {
    const { data: refunds } = await this.stripeClient.refunds.list({
      created: {
        gte: Math.floor(startDate.getTime() / 1000),
        lte: Math.floor(endDate.getTime() / 1000)
      },
      limit: 100
    });

    return refunds.map(refund => ({
      id: refund.id,
      type: StripeTransactionType.REFUND,
      amount: refund.amount / 100, // Convert cents to dollars
      currency: refund.currency,
      status: refund.status,
      metadata: refund.metadata,
      createdAt: new Date(refund.created * 1000)
    }));
  }

  // Sync Transfers
  private async syncTransfers(
    startDate: Date, 
    endDate: Date
  ): Promise<StripeTransaction[]> {
    const { data: transfers } = await this.stripeClient.transfers.list({
      created: {
        gte: Math.floor(startDate.getTime() / 1000),
        lte: Math.floor(endDate.getTime() / 1000)
      },
      limit: 100
    });

    return transfers.map(transfer => ({
      id: transfer.id,
      type: StripeTransactionType.TRANSFER,
      amount: transfer.amount / 100, // Convert cents to dollars
      currency: transfer.currency,
      status: transfer.status,
      metadata: transfer.metadata,
      createdAt: new Date(transfer.created * 1000)
    }));
  }

  // Sync Payouts
  private async syncPayouts(
    startDate: Date, 
    endDate: Date
  ): Promise<StripeTransaction[]> {
    const { data: payouts } = await this.stripeClient.payouts.list({
      created: {
        gte: Math.floor(startDate.getTime() / 1000),
        lte: Math.floor(endDate.getTime() / 1000)
      },
      limit: 100
    });

    return payouts.map(payout => ({
      id: payout.id,
      type: StripeTransactionType.PAYOUT,
      amount: payout.amount / 100, // Convert cents to dollars
      currency: payout.currency,
      status: payout.status,
      metadata: payout.metadata,
      createdAt: new Date(payout.created * 1000)
    }));
  }

  // Additional Stripe-specific methods
  public async createPaymentIntent(
    amount: number, 
    currency: string = 'usd'
  ): Promise<string> {
    const paymentIntent = await this.stripeClient.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency: currency.toLowerCase()
    });

    return paymentIntent.client_secret || '';
  }

  public async refundCharge(
    chargeId: string, 
    amount?: number
  ): Promise<StripeTransaction> {
    const refund = await this.stripeClient.refunds.create({
      charge: chargeId,
      amount: amount ? Math.round(amount * 100) : undefined
    });

    return {
      id: refund.id,
      type: StripeTransactionType.REFUND,
      amount: refund.amount / 100,
      currency: refund.currency,
      status: refund.status,
      metadata: refund.metadata,
      createdAt: new Date(refund.created * 1000)
    };
  }
}

// Export for use in IntegrationManager
export default StripeIntegrationStrategy;