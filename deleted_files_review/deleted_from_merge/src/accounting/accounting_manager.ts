import { EventEmitter } from 'events';
import { v4 as uuidv4 } from 'uuid';
import * as moment from 'moment';
import * as BigNumber from 'bignumber.js';

interface AccountingConfig {
    id: string;
    name: string;
    type: 'revenue' | 'expense' | 'tax' | 'reporting';
    enabled: boolean;
    performanceThreshold?: number;
}

interface FinancialTransaction {
    id: string;
    type: 'income' | 'expense' | 'transfer';
    amount: number;
    category: string;
    date: Date;
    description: string;
    tags?: string[];
}

interface FinancialReport {
    period: {
        start: Date;
        end: Date;
    };
    totalIncome: number;
    totalExpenses: number;
    netProfit: number;
    profitMargin: number;
    categorizedTransactions: {
        [category: string]: {
            income: number;
            expenses: number;
        }
    };
}

interface TaxCalculation {
    totalIncome: number;
    taxableIncome: number;
    taxRate: number;
    taxAmount: number;
}

class AccountingManager extends EventEmitter {
    private accountingModules: Map<string, Function> = new Map();
    private accountingConfigs: Map<string, AccountingConfig> = new Map();
    private transactions: FinancialTransaction[] = [];

    constructor() {
        super();
        this.initializeStandardAccountingModules();
    }

    private initializeStandardAccountingModules() {
        const standardModules: Array<{
            module: Function;
            config: AccountingConfig;
        }> = [
            {
                module: this.revenueTrackingModule,
                config: {
                    id: 'revenue-tracking',
                    name: 'Revenue Tracking',
                    type: 'revenue',
                    enabled: true,
                    performanceThreshold: 200
                }
            },
            {
                module: this.expenseManagementModule,
                config: {
                    id: 'expense-management',
                    name: 'Expense Management',
                    type: 'expense',
                    enabled: true,
                    performanceThreshold: 150
                }
            },
            {
                module: this.taxCalculationModule,
                config: {
                    id: 'tax-calculation',
                    name: 'Tax Calculation',
                    type: 'tax',
                    enabled: true,
                    performanceThreshold: 300
                }
            },
            {
                module: this.financialReportingModule,
                config: {
                    id: 'financial-reporting',
                    name: 'Financial Reporting',
                    type: 'reporting',
                    enabled: true,
                    performanceThreshold: 500
                }
            }
        ];

        standardModules.forEach(({ module, config }) => {
            this.registerAccountingModule(config, module);
        });
    }

    public registerAccountingModule(
        config: AccountingConfig, 
        module: Function
    ) {
        // Generate unique ID if not provided
        if (!config.id) {
            config.id = uuidv4();
        }

        this.accountingModules.set(config.id, module);
        this.accountingConfigs.set(config.id, config);

        this.emit('accounting-module-registered', config);
    }

    private async revenueTrackingModule(transaction: Omit<FinancialTransaction, 'id' | 'date'>) {
        const startTime = performance.now();

        try {
            const newTransaction: FinancialTransaction = {
                id: uuidv4(),
                ...transaction,
                date: new Date(),
                type: 'income'
            };

            // Validate transaction
            this.validateTransaction(newTransaction);

            this.transactions.push(newTransaction);

            const endTime = performance.now();
            this.emit('revenue-tracked', newTransaction);

            return newTransaction;
        } catch (error) {
            this.emit('revenue-tracking-error', error);
            throw error;
        }
    }

    private async expenseManagementModule(transaction: Omit<FinancialTransaction, 'id' | 'date'>) {
        const startTime = performance.now();

        try {
            const newTransaction: FinancialTransaction = {
                id: uuidv4(),
                ...transaction,
                date: new Date(),
                type: 'expense'
            };

            // Validate transaction
            this.validateTransaction(newTransaction);

            this.transactions.push(newTransaction);

            const endTime = performance.now();
            this.emit('expense-recorded', newTransaction);

            return newTransaction;
        } catch (error) {
            this.emit('expense-tracking-error', error);
            throw error;
        }
    }

    private validateTransaction(transaction: FinancialTransaction) {
        // Comprehensive transaction validation
        if (transaction.amount <= 0) {
            throw new Error('Transaction amount must be positive');
        }

        if (!transaction.category) {
            throw new Error('Transaction must have a category');
        }

        // Additional validation logic can be added here
    }

    private async taxCalculationModule(
        period: { start: Date; end: Date } = { 
            start: moment().startOf('year').toDate(), 
            end: moment().endOf('year').toDate() 
        }
    ): Promise<TaxCalculation> {
        const startTime = performance.now();

        try {
            // Filter transactions within the specified period
            const periodTransactions = this.transactions.filter(t => 
                t.date >= period.start && t.date <= period.end
            );

            // Calculate total income
            const totalIncome = periodTransactions
                .filter(t => t.type === 'income')
                .reduce((sum, t) => sum + t.amount, 0);

            // Simplified tax calculation
            const taxRate = this.calculateTaxRate(totalIncome);
            const taxableIncome = totalIncome * 0.8; // Assuming 80% of income is taxable
            const taxAmount = new BigNumber(taxableIncome)
                .multipliedBy(taxRate)
                .toNumber();

            const endTime = performance.now();
            
            const taxCalculation: TaxCalculation = {
                totalIncome,
                taxableIncome,
                taxRate,
                taxAmount
            };

            this.emit('tax-calculation-complete', taxCalculation);

            return taxCalculation;
        } catch (error) {
            this.emit('tax-calculation-error', error);
            throw error;
        }
    }

    private calculateTaxRate(income: number): number {
        // Progressive tax rate calculation
        if (income <= 50000) return 0.10;
        if (income <= 100000) return 0.15;
        if (income <= 250000) return 0.20;
        if (income <= 500000) return 0.25;
        return 0.30;
    }

    private async financialReportingModule(
        period: { start: Date; end: Date } = { 
            start: moment().startOf('month').toDate(), 
            end: moment().endOf('month').toDate() 
        }
    ): Promise<FinancialReport> {
        const startTime = performance.now();

        try {
            // Filter transactions within the specified period
            const periodTransactions = this.transactions.filter(t => 
                t.date >= period.start && t.date <= period.end
            );

            // Calculate total income and expenses
            const totalIncome = periodTransactions
                .filter(t => t.type === 'income')
                .reduce((sum, t) => sum + t.amount, 0);

            const totalExpenses = periodTransactions
                .filter(t => t.type === 'expense')
                .reduce((sum, t) => sum + t.amount, 0);

            // Calculate categorized transactions
            const categorizedTransactions = periodTransactions.reduce((acc, t) => {
                if (!acc[t.category]) {
                    acc[t.category] = { income: 0, expenses: 0 };
                }

                if (t.type === 'income') {
                    acc[t.category].income += t.amount;
                } else {
                    acc[t.category].expenses += t.amount;
                }

                return acc;
            }, {} as any);

            const netProfit = totalIncome - totalExpenses;
            const profitMargin = totalIncome > 0 
                ? (netProfit / totalIncome) * 100 
                : 0;

            const financialReport: FinancialReport = {
                period,
                totalIncome,
                totalExpenses,
                netProfit,
                profitMargin,
                categorizedTransactions
            };

            const endTime = performance.now();
            this.emit('financial-report-generated', financialReport);

            return financialReport;
        } catch (error) {
            this.emit('financial-reporting-error', error);
            throw error;
        }
    }

    public async executeAccountingModule(
        moduleId: string, 
        ...args: any[]
    ) {
        const module = this.accountingModules.get(moduleId);
        
        if (!module) {
            throw new Error(`Accounting module ${moduleId} not found`);
        }

        try {
            return await module(...args);
        } catch (error) {
            this.emit('accounting-module-error', { moduleId, error });
            throw error;
        }
    }

    public generateAccountingReport() {
        return {
            totalTransactions: this.transactions.length,
            accountingModules: Array.from(this.accountingConfigs.values()),
            recentTransactions: this.transactions.slice(-10)
        };
    }
}

export default new AccountingManager(); 