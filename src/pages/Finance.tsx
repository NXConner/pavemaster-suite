import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DollarSign, TrendingUp, TrendingDown, Calendar, FileText, CreditCard, PieChart, BarChart3 } from 'lucide-react';

interface FinancialData {
  revenue: number;
  expenses: number;
  profit: number;
  profitMargin: number;
  monthlyRevenue: { month: string; amount: number }[];
  expenseCategories: { category: string; amount: number; percentage: number }[];
  recentTransactions: Transaction[];
  invoices: Invoice[];
}

interface Transaction {
  id: string;
  date: string;
  description: string;
  amount: number;
  type: 'income' | 'expense';
  category: string;
  project?: string;
}

interface Invoice {
  id: string;
  customer: string;
  project: string;
  amount: number;
  status: 'paid' | 'pending' | 'overdue';
  dueDate: string;
  issueDate: string;
}

export default function Finance() {
  const [selectedPeriod, setSelectedPeriod] = useState('month');

  // Mock financial data
  const financialData: FinancialData = {
    revenue: 125000,
    expenses: 89500,
    profit: 35500,
    profitMargin: 28.4,
    monthlyRevenue: [
      { month: 'Jan', amount: 98000 },
      { month: 'Feb', amount: 87000 },
      { month: 'Mar', amount: 105000 },
      { month: 'Apr', amount: 125000 },
      { month: 'May', amount: 142000 },
      { month: 'Jun', amount: 135000 }
    ],
    expenseCategories: [
      { category: 'Materials', amount: 35000, percentage: 39 },
      { category: 'Labor', amount: 28000, percentage: 31 },
      { category: 'Equipment', amount: 12000, percentage: 13 },
      { category: 'Fuel', amount: 8500, percentage: 10 },
      { category: 'Insurance', amount: 4000, percentage: 4 },
      { category: 'Other', amount: 2000, percentage: 3 }
    ],
    recentTransactions: [
      {
        id: '1',
        date: '2024-01-20',
        description: 'Payment - First Baptist Church',
        amount: 15000,
        type: 'income',
        category: 'Project Payment',
        project: 'First Baptist Church Parking Lot'
      },
      {
        id: '2',
        date: '2024-01-19',
        description: 'SealMaster Materials',
        amount: -3500,
        type: 'expense',
        category: 'Materials'
      },
      {
        id: '3',
        date: '2024-01-18',
        description: 'Fuel - Fleet Vehicles',
        amount: -850,
        type: 'expense',
        category: 'Fuel'
      },
      {
        id: '4',
        date: '2024-01-17',
        description: 'Equipment Maintenance',
        amount: -1200,
        type: 'expense',
        category: 'Equipment'
      },
      {
        id: '5',
        date: '2024-01-16',
        description: 'Payment - Grace Community Church',
        amount: 5200,
        type: 'income',
        category: 'Project Payment',
        project: 'Grace Community Line Striping'
      }
    ],
    invoices: [
      {
        id: 'INV-001',
        customer: 'Trinity Methodist Church',
        project: 'Crack Sealing Project',
        amount: 8500,
        status: 'pending',
        dueDate: '2024-02-15',
        issueDate: '2024-01-15'
      },
      {
        id: 'INV-002',
        customer: 'St. Mary Catholic Church',
        project: 'Parking Lot Renovation',
        amount: 22000,
        status: 'overdue',
        dueDate: '2024-01-10',
        issueDate: '2023-12-10'
      },
      {
        id: 'INV-003',
        customer: 'First Baptist Church',
        project: 'Sealcoating and Striping',
        amount: 15000,
        status: 'paid',
        dueDate: '2024-01-30',
        issueDate: '2024-01-01'
      }
    ]
  };

  const getInvoiceStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-success text-success-foreground';
      case 'pending': return 'bg-warning text-warning-foreground';
      case 'overdue': return 'bg-destructive text-destructive-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const totalOutstanding = financialData.invoices
    .filter(inv => inv.status !== 'paid')
    .reduce((sum, inv) => sum + inv.amount, 0);

  const overduAmount = financialData.invoices
    .filter(inv => inv.status === 'overdue')
    .reduce((sum, inv) => sum + inv.amount, 0);

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <DollarSign className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold text-foreground">Finance Dashboard</h1>
            <p className="text-muted-foreground">Track revenue, expenses, and profitability</p>
          </div>
        </div>
        <div className="flex gap-2">
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="px-3 py-2 border border-input bg-background rounded-md text-sm"
          >
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="quarter">This Quarter</option>
            <option value="year">This Year</option>
          </select>
          <Button>
            <FileText className="h-4 w-4 mr-2" />
            Generate Report
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Revenue</p>
                <p className="text-2xl font-bold text-green-600">{formatCurrency(financialData.revenue)}</p>
                <p className="text-xs text-green-600 flex items-center mt-1">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  +12.5% from last month
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Expenses</p>
                <p className="text-2xl font-bold text-red-600">{formatCurrency(financialData.expenses)}</p>
                <p className="text-xs text-red-600 flex items-center mt-1">
                  <TrendingDown className="h-3 w-3 mr-1" />
                  +8.2% from last month
                </p>
              </div>
              <TrendingDown className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Net Profit</p>
                <p className="text-2xl font-bold text-green-600">{formatCurrency(financialData.profit)}</p>
                <p className="text-xs text-green-600 flex items-center mt-1">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  +18.7% from last month
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Profit Margin</p>
                <p className="text-2xl font-bold">{financialData.profitMargin}%</p>
                <p className="text-xs text-green-600 flex items-center mt-1">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  +2.1% from last month
                </p>
              </div>
              <PieChart className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="invoices">Invoices</TabsTrigger>
          <TabsTrigger value="expenses">Expenses</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Revenue Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Monthly Revenue Trend
                </CardTitle>
                <CardDescription>Revenue performance over the last 6 months</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {financialData.monthlyRevenue.map((month, index) => (
                    <div key={month.month} className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>{month.month}</span>
                        <span className="font-medium">{formatCurrency(month.amount)}</span>
                      </div>
                      <Progress 
                        value={(month.amount / Math.max(...financialData.monthlyRevenue.map(m => m.amount))) * 100} 
                        className="h-2" 
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Expense Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="h-5 w-5" />
                  Expense Breakdown
                </CardTitle>
                <CardDescription>Current month expense categories</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {financialData.expenseCategories.map((category, index) => (
                    <div key={category.category} className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>{category.category}</span>
                        <span className="font-medium">{formatCurrency(category.amount)} ({category.percentage}%)</span>
                      </div>
                      <Progress value={category.percentage} className="h-2" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Transactions */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Transactions</CardTitle>
              <CardDescription>Latest financial activity</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {financialData.recentTransactions.map((transaction) => (
                  <div key={transaction.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium">{transaction.description}</h4>
                        <span className={`font-bold ${transaction.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                          {transaction.type === 'income' ? '+' : ''}{formatCurrency(transaction.amount)}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(transaction.date).toLocaleDateString()}
                        </span>
                        <span>{transaction.category}</span>
                        {transaction.project && (
                          <span className="text-blue-600">{transaction.project}</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="invoices" className="space-y-6">
          {/* Invoice Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Outstanding</p>
                    <p className="text-2xl font-bold">{formatCurrency(totalOutstanding)}</p>
                  </div>
                  <CreditCard className="h-8 w-8 text-yellow-600" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Overdue</p>
                    <p className="text-2xl font-bold text-red-600">{formatCurrency(overduAmount)}</p>
                  </div>
                  <TrendingDown className="h-8 w-8 text-red-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">This Month</p>
                    <p className="text-2xl font-bold text-green-600">{formatCurrency(125000)}</p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Invoices List */}
          <Card>
            <CardHeader>
              <CardTitle>Invoices</CardTitle>
              <CardDescription>Manage customer invoices and payments</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {financialData.invoices.map((invoice) => (
                  <div key={invoice.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium">{invoice.id} - {invoice.customer}</h4>
                        <Badge className={getInvoiceStatusColor(invoice.status)}>
                          {invoice.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{invoice.project}</p>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>Amount: <span className="font-medium text-foreground">{formatCurrency(invoice.amount)}</span></span>
                        <span>Due: {new Date(invoice.dueDate).toLocaleDateString()}</span>
                        <span>Issued: {new Date(invoice.issueDate).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">View</Button>
                      {invoice.status !== 'paid' && (
                        <Button size="sm">Mark Paid</Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="expenses" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Expense Tracking</CardTitle>
              <CardDescription>Monitor and categorize business expenses</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Expense Management</h3>
                <p className="text-muted-foreground mb-4">Track and categorize your business expenses</p>
                <Button>Add Expense</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Financial Reports</CardTitle>
              <CardDescription>Generate detailed financial reports</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <Button variant="outline" className="h-20 flex-col">
                  <FileText className="h-6 w-6 mb-2" />
                  Profit & Loss
                </Button>
                <Button variant="outline" className="h-20 flex-col">
                  <BarChart3 className="h-6 w-6 mb-2" />
                  Cash Flow
                </Button>
                <Button variant="outline" className="h-20 flex-col">
                  <PieChart className="h-6 w-6 mb-2" />
                  Expense Report
                </Button>
                <Button variant="outline" className="h-20 flex-col">
                  <TrendingUp className="h-6 w-6 mb-2" />
                  Revenue Report
                </Button>
                <Button variant="outline" className="h-20 flex-col">
                  <CreditCard className="h-6 w-6 mb-2" />
                  Invoice Report
                </Button>
                <Button variant="outline" className="h-20 flex-col">
                  <Calendar className="h-6 w-6 mb-2" />
                  Tax Summary
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}