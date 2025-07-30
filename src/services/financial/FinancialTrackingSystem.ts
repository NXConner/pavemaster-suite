import { v4 as uuidv4 } from 'uuid';
import * as tf from '@tensorflow/tfjs';
import { aiModelTrainer, AIModelType } from '../ai/ModelTrainingInfrastructure';

// Financial Transaction Types
export enum TransactionType {
  INCOME = 'income',
  EXPENSE = 'expense',
  PAYROLL = 'payroll',
  EQUIPMENT = 'equipment',
  MATERIAL = 'material',
  TAX = 'tax'
}

// Financial Category Interface
export interface FinancialCategory {
  id: string;
  name: string;
  type: TransactionType;
  parentCategoryId?: string;
}

// Transaction Interface
export interface FinancialTransaction {
  id: string;
  date: Date;
  amount: number;
  type: TransactionType;
  categoryId: string;
  description: string;
  projectId?: string;
  employeeId?: string;
  receiptUrl?: string;
}

// Budget Interface
export interface Budget {
  id: string;
  name: string;
  startDate: Date;
  endDate: Date;
  totalBudget: number;
  allocatedCategories: {
    categoryId: string;
    allocatedAmount: number;
  }[];
}

// Financial Report Interface
export interface FinancialReport {
  id: string;
  startDate: Date;
  endDate: Date;
  totalIncome: number;
  totalExpenses: number;
  netProfit: number;
  categoryBreakdown: {
    categoryId: string;
    totalAmount: number;
    percentage: number;
  }[];
}

export class FinancialTrackingSystem {
  private transactions: Map<string, FinancialTransaction> = new Map();
  private categories: Map<string, FinancialCategory> = new Map();
  private budgets: Map<string, Budget> = new Map();

  constructor() {
    this.initializeDefaultCategories();
  }

  private initializeDefaultCategories() {
    const defaultCategories: FinancialCategory[] = [
      { 
        id: uuidv4(), 
        name: 'Labor Costs', 
        type: TransactionType.EXPENSE 
      },
      { 
        id: uuidv4(), 
        name: 'Equipment', 
        type: TransactionType.EXPENSE 
      },
      { 
        id: uuidv4(), 
        name: 'Materials', 
        type: TransactionType.EXPENSE 
      },
      { 
        id: uuidv4(), 
        name: 'Project Revenue', 
        type: TransactionType.INCOME 
      }
    ];

    defaultCategories.forEach(category => {
      this.categories.set(category.id, category);
    });
  }

  // Transaction Management
  public addTransaction(transaction: Omit<FinancialTransaction, 'id'>): FinancialTransaction {
    const newTransaction: FinancialTransaction = {
      id: uuidv4(),
      ...transaction
    };

    this.transactions.set(newTransaction.id, newTransaction);
    return newTransaction;
  }

  public getTransactionsByCategory(categoryId: string): FinancialTransaction[] {
    return Array.from(this.transactions.values())
      .filter(transaction => transaction.categoryId === categoryId);
  }

  // Budget Management
  public createBudget(budget: Omit<Budget, 'id'>): Budget {
    const newBudget: Budget = {
      id: uuidv4(),
      ...budget
    };

    this.budgets.set(newBudget.id, newBudget);
    return newBudget;
  }

  public checkBudgetAdherence(budgetId: string): { 
    isWithinBudget: boolean, 
    currentSpending: number, 
    budgetLimit: number 
  } {
    const budget = this.budgets.get(budgetId);
    if (!budget) {
      throw new Error('Budget not found');
    }

    const categoryIds = budget.allocatedCategories.map(ac => ac.categoryId);
    const categoryTransactions = categoryIds.flatMap(catId => 
      this.getTransactionsByCategory(catId)
    );

    const currentSpending = categoryTransactions.reduce(
      (total, transaction) => total + transaction.amount, 
      0
    );

    const budgetLimit = budget.allocatedCategories.reduce(
      (total, allocation) => total + allocation.allocatedAmount, 
      0
    );

    return {
      isWithinBudget: currentSpending <= budgetLimit,
      currentSpending,
      budgetLimit
    };
  }

  // Financial Reporting
  public generateFinancialReport(
    startDate: Date, 
    endDate: Date
  ): FinancialReport {
    const relevantTransactions = Array.from(this.transactions.values())
      .filter(t => t.date >= startDate && t.date <= endDate);

    const categoryTotals = new Map<string, number>();

    relevantTransactions.forEach(transaction => {
      const currentTotal = categoryTotals.get(transaction.categoryId) || 0;
      categoryTotals.set(
        transaction.categoryId, 
        currentTotal + transaction.amount
      );
    });

    const totalIncome = relevantTransactions
      .filter(t => this.categories.get(t.categoryId)?.type === TransactionType.INCOME)
      .reduce((total, t) => total + t.amount, 0);

    const totalExpenses = relevantTransactions
      .filter(t => this.categories.get(t.categoryId)?.type === TransactionType.EXPENSE)
      .reduce((total, t) => total + t.amount, 0);

    const categoryBreakdown = Array.from(categoryTotals.entries()).map(
      ([categoryId, totalAmount]) => ({
        categoryId,
        totalAmount,
        percentage: (totalAmount / (totalIncome + totalExpenses)) * 100
      })
    );

    return {
      id: uuidv4(),
      startDate,
      endDate,
      totalIncome,
      totalExpenses,
      netProfit: totalIncome - totalExpenses,
      categoryBreakdown
    };
  }

  // AI-Powered Financial Prediction
  public async predictCosts(historicalData: number[][]): Promise<number> {
    // Convert historical data to TensorFlow tensor
    const inputTensor = tf.tensor2d(historicalData);

    try {
      const prediction = await aiModelTrainer.predictWithModel(
        AIModelType.COST_PREDICTION, 
        inputTensor
      );

      return (await prediction.data())[0];
    } catch (error) {
      console.error('Cost prediction failed:', error);
      throw error;
    }
  }

  // OCR Receipt Processing (Placeholder)
  public processReceipt(receiptImageUrl: string): Promise<FinancialTransaction> {
    // TODO: Implement actual OCR processing
    return Promise.resolve({
      id: uuidv4(),
      date: new Date(),
      amount: 0,
      type: TransactionType.EXPENSE,
      categoryId: '',
      description: 'OCR Processing Not Implemented'
    });
  }
}

// Singleton instance for global access
export const financialTracker = new FinancialTrackingSystem();