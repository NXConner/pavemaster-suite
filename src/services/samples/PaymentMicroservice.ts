import { 
  microserviceCommunicationManager, 
  serviceDiscovery,
  ServiceMessage,
  CommunicationPattern
} from '../scalability/MicroserviceCommunicationManager';

import { 
  serviceDiscovery as discoveryService 
} from '../scalability/ServiceDiscovery';

import Stripe from 'stripe';
import { v4 as uuidv4 } from 'uuid';

// Payment transaction types
export enum PaymentTransactionType {
  CHARGE = 'charge',
  REFUND = 'refund',
  TRANSFER = 'transfer'
}

// Payment transaction interface
export interface PaymentTransaction {
  id: string;
  type: PaymentTransactionType;
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed';
  metadata?: Record<string, any>;
}

export class PaymentMicroservice {
  private static instance: PaymentMicroservice;
  private stripeClient: Stripe;
  private serviceId: string;

  private constructor() {
    // Initialize Stripe client
    this.stripeClient = new Stripe(
      process.env.STRIPE_SECRET_KEY || '', 
      { apiVersion: '2023-10-16' }
    );

    // Register service
    this.serviceId = this.registerService();

    // Set up message handlers
    this.setupMessageHandlers();
  }

  public static getInstance(): PaymentMicroservice {
    if (!PaymentMicroservice.instance) {
      PaymentMicroservice.instance = new PaymentMicroservice();
    }
    return PaymentMicroservice.instance;
  }

  // Register payment service
  private registerService(): string {
    return discoveryService.registerService({
      name: 'payment-service',
      version: '1.0.0',
      host: 'localhost',
      port: 3000,
      tags: ['financial', 'payments'],
      capabilities: ['stripe', 'refunds']
    });
  }

  // Set up message handlers for different payment operations
  private setupMessageHandlers(): void {
    // Payment processing handler
    microserviceCommunicationManager.subscribeToService(
      'payment-service', 
      async (message: ServiceMessage) => {
        switch (message.type) {
          case 'process_payment':
            await this.processPayment(message.payload);
            break;
          case 'refund_payment':
            await this.refundPayment(message.payload);
            break;
          default:
            console.warn(`Unhandled message type: ${message.type}`);
        }
      }
    );
  }

  // Process payment transaction
  private async processPayment(payload: any): Promise<PaymentTransaction> {
    try {
      const paymentIntent = await this.stripeClient.paymentIntents.create({
        amount: Math.round(payload.amount * 100), // Convert to cents
        currency: payload.currency || 'usd',
        payment_method_types: ['card'],
        metadata: payload.metadata
      });

      const transaction: PaymentTransaction = {
        id: paymentIntent.id,
        type: PaymentTransactionType.CHARGE,
        amount: payload.amount,
        currency: paymentIntent.currency,
        status: paymentIntent.status === 'succeeded' ? 'completed' : 'pending',
        metadata: paymentIntent.metadata
      };

      // Broadcast transaction result
      await microserviceCommunicationManager.sendMessage(
        'payment-service', 
        'accounting-service', 
        {
          type: 'payment_processed',
          payload: transaction
        }
      );

      return transaction;
    } catch (error: any) {
      // Handle payment processing errors
      const transaction: PaymentTransaction = {
        id: uuidv4(),
        type: PaymentTransactionType.CHARGE,
        amount: payload.amount,
        currency: payload.currency || 'usd',
        status: 'failed',
        metadata: { error: error.message }
      };

      // Broadcast error
      await microserviceCommunicationManager.sendMessage(
        'payment-service', 
        'error-tracking-service', 
        {
          type: 'payment_error',
          payload: transaction
        }
      );

      throw error;
    }
  }

  // Refund payment transaction
  private async refundPayment(payload: any): Promise<PaymentTransaction> {
    try {
      const refund = await this.stripeClient.refunds.create({
        payment_intent: payload.paymentIntentId,
        amount: payload.amount ? Math.round(payload.amount * 100) : undefined
      });

      const transaction: PaymentTransaction = {
        id: refund.id,
        type: PaymentTransactionType.REFUND,
        amount: refund.amount / 100,
        currency: refund.currency,
        status: refund.status === 'succeeded' ? 'completed' : 'pending',
        metadata: refund.metadata
      };

      // Broadcast refund result
      await microserviceCommunicationManager.sendMessage(
        'payment-service', 
        'accounting-service', 
        {
          type: 'payment_refunded',
          payload: transaction
        }
      );

      return transaction;
    } catch (error: any) {
      // Handle refund processing errors
      const transaction: PaymentTransaction = {
        id: uuidv4(),
        type: PaymentTransactionType.REFUND,
        amount: payload.amount,
        currency: payload.currency || 'usd',
        status: 'failed',
        metadata: { error: error.message }
      };

      // Broadcast error
      await microserviceCommunicationManager.sendMessage(
        'payment-service', 
        'error-tracking-service', 
        {
          type: 'refund_error',
          payload: transaction
        }
      );

      throw error;
    }
  }

  // Graceful shutdown
  public async shutdown(): Promise<void> {
    // Unregister service
    discoveryService.unregisterService(this.serviceId);
  }
}

// Singleton export
export const paymentMicroservice = PaymentMicroservice.getInstance();