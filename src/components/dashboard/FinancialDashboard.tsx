import { useState, useEffect } from 'react';
import { DollarSign, TrendingUp, TrendingDown, CreditCard, Receipt, BarChart3 } from 'lucide-react';

interface FinancialData {
  revenue: {
    current: number;
    previous: number;
    change: number;
  };
  expenses: {
    current: number;
    previous: number;
    change: number;
  };
  profit: {
    current: number;
    previous: number;
    change: number;
  };
  cashFlow: {
    current: number;
    previous: number;
    change: number;
  };
}

export default function FinancialDashboard() {
  const [financialData, setFinancialData] = useState<FinancialData | null>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('month');

  useEffect(() => {
    fetchFinancialData();
  }, [period]);

  const fetchFinancialData = async () => {
    try {
      // Mock financial data
      const mockData: FinancialData = {
        revenue: {
          current: 85000,
          previous: 72000,
          change: 18.1
        },
        expenses: {
          current: 45000,
          previous: 48000,
          change: -6.3
        },
        profit: {
          current: 40000,
          previous: 24000,
          change: 66.7
        },
        cashFlow: {
          current: 35000,
          previous: 20000,
          change: 75.0
        }
      };
      
      setFinancialData(mockData);
    } catch (error) {
      console.error('Error fetching financial data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatPercentage = (value: number) => {
    return `${value > 0 ? '+' : ''}${value.toFixed(1)}%`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading financial data...</p>
        </div>
      </div>
    );
  }

  if (!financialData) {
    return (
      <div className="text-center py-16">
        <p className="text-muted-foreground">No financial data available</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Financial Dashboard</h1>
          <p className="text-muted-foreground">Track revenue, expenses, and profitability</p>
        </div>
        <div className="flex gap-2">
          {['week', 'month', 'quarter', 'year'].map((p) => (
            <button
              key={p}
              className={`px-3 py-1 rounded-md text-sm ${
                period === p 
                  ? 'bg-primary text-primary-foreground' 
                  : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
              }`}
              onClick={() => setPeriod(p)}
            >
              {p.charAt(0).toUpperCase() + p.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="border rounded-lg p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-muted-foreground">Revenue</h3>
            <DollarSign className="h-4 w-4 text-green-600" />
          </div>
          <div className="text-2xl font-bold">{formatCurrency(financialData.revenue.current)}</div>
          <div className="flex items-center gap-1 text-sm mt-1">
            {financialData.revenue.change > 0 ? (
              <TrendingUp className="h-3 w-3 text-green-600" />
            ) : (
              <TrendingDown className="h-3 w-3 text-red-600" />
            )}
            <span className={financialData.revenue.change > 0 ? 'text-green-600' : 'text-red-600'}>
              {formatPercentage(financialData.revenue.change)}
            </span>
            <span className="text-muted-foreground">vs last {period}</span>
          </div>
        </div>

        <div className="border rounded-lg p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-muted-foreground">Expenses</h3>
            <CreditCard className="h-4 w-4 text-red-600" />
          </div>
          <div className="text-2xl font-bold">{formatCurrency(financialData.expenses.current)}</div>
          <div className="flex items-center gap-1 text-sm mt-1">
            {financialData.expenses.change > 0 ? (
              <TrendingUp className="h-3 w-3 text-red-600" />
            ) : (
              <TrendingDown className="h-3 w-3 text-green-600" />
            )}
            <span className={financialData.expenses.change > 0 ? 'text-red-600' : 'text-green-600'}>
              {formatPercentage(financialData.expenses.change)}
            </span>
            <span className="text-muted-foreground">vs last {period}</span>
          </div>
        </div>

        <div className="border rounded-lg p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-muted-foreground">Profit</h3>
            <TrendingUp className="h-4 w-4 text-blue-600" />
          </div>
          <div className="text-2xl font-bold">{formatCurrency(financialData.profit.current)}</div>
          <div className="flex items-center gap-1 text-sm mt-1">
            {financialData.profit.change > 0 ? (
              <TrendingUp className="h-3 w-3 text-green-600" />
            ) : (
              <TrendingDown className="h-3 w-3 text-red-600" />
            )}
            <span className={financialData.profit.change > 0 ? 'text-green-600' : 'text-red-600'}>
              {formatPercentage(financialData.profit.change)}
            </span>
            <span className="text-muted-foreground">vs last {period}</span>
          </div>
        </div>

        <div className="border rounded-lg p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-muted-foreground">Cash Flow</h3>
            <Receipt className="h-4 w-4 text-purple-600" />
          </div>
          <div className="text-2xl font-bold">{formatCurrency(financialData.cashFlow.current)}</div>
          <div className="flex items-center gap-1 text-sm mt-1">
            {financialData.cashFlow.change > 0 ? (
              <TrendingUp className="h-3 w-3 text-green-600" />
            ) : (
              <TrendingDown className="h-3 w-3 text-red-600" />
            )}
            <span className={financialData.cashFlow.change > 0 ? 'text-green-600' : 'text-red-600'}>
              {formatPercentage(financialData.cashFlow.change)}
            </span>
            <span className="text-muted-foreground">vs last {period}</span>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid gap-6 md:grid-cols-2">
        <div className="border rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Revenue Trend</h3>
            <BarChart3 className="h-5 w-5 text-muted-foreground" />
          </div>
          <div className="h-64 flex items-center justify-center text-muted-foreground">
            Revenue Chart Placeholder
          </div>
        </div>

        <div className="border rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Expense Breakdown</h3>
            <BarChart3 className="h-5 w-5 text-muted-foreground" />
          </div>
          <div className="h-64 flex items-center justify-center text-muted-foreground">
            Expense Chart Placeholder
          </div>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="border rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4">Recent Transactions</h3>
        <div className="space-y-3">
          {[
            { id: 1, description: 'Grace Baptist Church - Parking Lot Sealcoating', amount: 12000, date: '2024-01-15', type: 'income' },
            { id: 2, description: 'Equipment Rental - Asphalt Roller', amount: -800, date: '2024-01-14', type: 'expense' },
            { id: 3, description: 'First Presbyterian - Crack Sealing', amount: 5500, date: '2024-01-12', type: 'income' },
            { id: 4, description: 'Material Purchase - Sealcoat', amount: -2500, date: '2024-01-10', type: 'expense' }
          ].map((transaction) => (
            <div key={transaction.id} className="flex items-center justify-between py-2 border-b last:border-b-0">
              <div>
                <p className="font-medium">{transaction.description}</p>
                <p className="text-sm text-muted-foreground">{transaction.date}</p>
              </div>
              <div className={`font-semibold ${transaction.amount > 0 ? 'text-green-600' : 'text-red-600'}`}>
                {transaction.amount > 0 ? '+' : ''}{formatCurrency(Math.abs(transaction.amount))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}