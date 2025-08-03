import { useState } from 'react';
import { DashboardLayout } from '../components/layout/dashboard-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Badge } from '../components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Progress } from '../components/ui/progress';
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Calculator,
  PieChart,
  FileText,
  CreditCard,
  Receipt,
  Banknote,
  Target,
} from 'lucide-react';

interface FinancialTransaction {
  id: string;
  date: string;
  description: string;
  category: string;
  type: 'income' | 'expense';
  amount: number;
  project?: string;
  status: 'pending' | 'completed' | 'cancelled';
}

interface BudgetCategory {
  id: string;
  name: string;
  budgeted: number;
  spent: number;
  remaining: number;
  percentage: number;
}

interface Invoice {
  id: string;
  clientName: string;
  project: string;
  amount: number;
  dueDate: string;
  status: 'draft' | 'sent' | 'paid' | 'overdue';
  dateSent?: string;
  datePaid?: string;
}

export default function Finance() {
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const transactions: FinancialTransaction[] = [
    {
      id: '1',
      date: '2024-01-15',
      description: 'Church Parking Lot Payment',
      category: 'Project Revenue',
      type: 'income',
      amount: 8500.00,
      project: 'CH-001',
      status: 'completed',
    },
    {
      id: '2',
      date: '2024-01-14',
      description: 'Asphalt Material Purchase',
      category: 'Materials',
      type: 'expense',
      amount: 2850.00,
      project: 'CH-001',
      status: 'completed',
    },
    {
      id: '3',
      date: '2024-01-12',
      description: 'Equipment Rental',
      category: 'Equipment',
      type: 'expense',
      amount: 450.00,
      project: 'CH-001',
      status: 'completed',
    },
    {
      id: '4',
      date: '2024-01-10',
      description: 'Fuel Purchase',
      category: 'Operations',
      type: 'expense',
      amount: 285.50,
      status: 'completed',
    },
    {
      id: '5',
      date: '2024-01-08',
      description: 'Office Supplies',
      category: 'Administrative',
      type: 'expense',
      amount: 124.75,
      status: 'completed',
    },
  ];

  const budgetCategories: BudgetCategory[] = [
    {
      id: '1',
      name: 'Materials',
      budgeted: 15000,
      spent: 8420,
      remaining: 6580,
      percentage: 56,
    },
    {
      id: '2',
      name: 'Labor',
      budgeted: 20000,
      spent: 12750,
      remaining: 7250,
      percentage: 64,
    },
    {
      id: '3',
      name: 'Equipment',
      budgeted: 8000,
      spent: 3200,
      remaining: 4800,
      percentage: 40,
    },
    {
      id: '4',
      name: 'Operations',
      budgeted: 5000,
      spent: 2100,
      remaining: 2900,
      percentage: 42,
    },
    {
      id: '5',
      name: 'Administrative',
      budgeted: 3000,
      spent: 1850,
      remaining: 1150,
      percentage: 62,
    },
  ];

  const invoices: Invoice[] = [
    {
      id: 'INV-2024-001',
      clientName: 'Grace Community Church',
      project: 'Parking Lot Renovation',
      amount: 12500.00,
      dueDate: '2024-02-15',
      status: 'sent',
      dateSent: '2024-01-15',
    },
    {
      id: 'INV-2024-002',
      clientName: 'Richmond Shopping Center',
      project: 'Sealcoating Service',
      amount: 6800.00,
      dueDate: '2024-01-30',
      status: 'paid',
      dateSent: '2024-01-05',
      datePaid: '2024-01-20',
    },
    {
      id: 'INV-2024-003',
      clientName: 'Metro Office Complex',
      project: 'Line Striping',
      amount: 2400.00,
      dueDate: '2024-01-20',
      status: 'overdue',
      dateSent: '2023-12-20',
    },
    {
      id: 'INV-2024-004',
      clientName: 'Westfield Elementary',
      project: 'Crack Repair',
      amount: 3200.00,
      dueDate: '2024-02-10',
      status: 'draft',
    },
  ];

  const financialSummary = {
    totalRevenue: 47200,
    totalExpenses: 32800,
    netProfit: 14400,
    profitMargin: 30.5,
    outstandingInvoices: 18100,
    accountsReceivable: 15700,
  };

  const getTransactionTypeColor = (type: string) => {
    return type === 'income' ? 'text-green-600' : 'text-red-600';
  };

  const getInvoiceStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800';
      case 'sent': return 'bg-blue-100 text-blue-800';
      case 'overdue': return 'bg-red-100 text-red-800';
      case 'draft': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getBudgetStatusColor = (percentage: number) => {
    if (percentage >= 90) { return 'text-red-600'; }
    if (percentage >= 70) { return 'text-yellow-600'; }
    return 'text-green-600';
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Financial Management</h1>
            <p className="text-muted-foreground">
              Track finances, manage budgets, and monitor profitability
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="gap-2">
              <FileText className="h-4 w-4" />
              Generate Report
            </Button>
            <Button className="gap-2">
              <Receipt className="h-4 w-4" />
              Create Invoice
            </Button>
          </div>
        </div>

        {/* Financial Overview */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                ${financialSummary.totalRevenue.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">+12% from last month</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
              <TrendingDown className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                ${financialSummary.totalExpenses.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">-5% from last month</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Net Profit</CardTitle>
              <DollarSign className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                ${financialSummary.netProfit.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">
                {financialSummary.profitMargin}% profit margin
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Outstanding</CardTitle>
              <CreditCard className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">
                ${financialSummary.outstandingInvoices.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">Accounts receivable</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="transactions" className="space-y-6">
          <TabsList>
            <TabsTrigger value="transactions">Transactions</TabsTrigger>
            <TabsTrigger value="invoices">Invoices</TabsTrigger>
            <TabsTrigger value="budgets">Budgets</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
          </TabsList>

          <TabsContent value="transactions" className="space-y-6">
            {/* Transaction Filters */}
            <Card>
              <CardContent className="pt-6">
                <div className="grid gap-4 md:grid-cols-4">
                  <div className="space-y-2">
                    <Label>Time Period</Label>
                    <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="week">This Week</SelectItem>
                        <SelectItem value="month">This Month</SelectItem>
                        <SelectItem value="quarter">This Quarter</SelectItem>
                        <SelectItem value="year">This Year</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Category</Label>
                    <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Categories</SelectItem>
                        <SelectItem value="materials">Materials</SelectItem>
                        <SelectItem value="labor">Labor</SelectItem>
                        <SelectItem value="equipment">Equipment</SelectItem>
                        <SelectItem value="operations">Operations</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Search</Label>
                    <Input placeholder="Search transactions..." />
                  </div>
                  <div className="flex items-end">
                    <Button className="w-full gap-2">
                      <Calculator className="h-4 w-4" />
                      Add Transaction
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Transactions List */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Transactions</CardTitle>
                <CardDescription>Latest financial transactions and activities</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {transactions.map((transaction) => (
                    <div key={transaction.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className={`p-2 rounded-full ${
                          transaction.type === 'income' ? 'bg-green-100' : 'bg-red-100'
                        }`}>
                          {transaction.type === 'income' ? (
                            <TrendingUp className="h-4 w-4 text-green-600" />
                          ) : (
                            <TrendingDown className="h-4 w-4 text-red-600" />
                          )}
                        </div>
                        <div>
                          <div className="font-medium">{transaction.description}</div>
                          <div className="text-sm text-muted-foreground">
                            {transaction.category} • {transaction.date}
                            {transaction.project && ` • Project: ${transaction.project}`}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`text-lg font-semibold ${getTransactionTypeColor(transaction.type)}`}>
                          {transaction.type === 'income' ? '+' : '-'}${transaction.amount.toFixed(2)}
                        </div>
                        <Badge variant="outline">
                          {transaction.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="invoices" className="space-y-6">
            <div className="grid gap-4">
              {invoices.map((invoice) => (
                <Card key={invoice.id}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center gap-3">
                          <h3 className="font-semibold">{invoice.id}</h3>
                          <Badge className={getInvoiceStatusColor(invoice.status)}>
                            {invoice.status.toUpperCase()}
                          </Badge>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
                          <div><strong>Client:</strong> {invoice.clientName}</div>
                          <div><strong>Project:</strong> {invoice.project}</div>
                          <div><strong>Due Date:</strong> {invoice.dueDate}</div>
                          {invoice.dateSent && (
                            <div><strong>Date Sent:</strong> {invoice.dateSent}</div>
                          )}
                        </div>
                      </div>
                      <div className="text-right space-y-2">
                        <div className="text-2xl font-bold">${invoice.amount.toLocaleString()}</div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm">View</Button>
                          <Button variant="outline" size="sm">Edit</Button>
                          {invoice.status === 'draft' && (
                            <Button size="sm">Send</Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="budgets" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Budget vs Actual
                </CardTitle>
                <CardDescription>Monthly budget performance by category</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {budgetCategories.map((category) => (
                    <div key={category.id} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{category.name}</span>
                        <span className={`font-semibold ${getBudgetStatusColor(category.percentage)}`}>
                          {category.percentage}% used
                        </span>
                      </div>
                      <Progress value={category.percentage} className="h-3" />
                      <div className="flex justify-between text-sm text-muted-foreground">
                        <span>Spent: ${category.spent.toLocaleString()}</span>
                        <span>Remaining: ${category.remaining.toLocaleString()}</span>
                        <span>Budget: ${category.budgeted.toLocaleString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reports" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <PieChart className="h-5 w-5" />
                    Expense Breakdown
                  </CardTitle>
                  <CardDescription>Current month expense distribution</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span>Materials</span>
                      <span className="font-semibold">45%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Labor</span>
                      <span className="font-semibold">35%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Equipment</span>
                      <span className="font-semibold">12%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Operations</span>
                      <span className="font-semibold">8%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Banknote className="h-5 w-5" />
                    Cash Flow
                  </CardTitle>
                  <CardDescription>Monthly cash flow analysis</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span>Operating Cash Flow</span>
                      <span className="font-semibold text-green-600">+$12,450</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Investment Cash Flow</span>
                      <span className="font-semibold text-red-600">-$3,200</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Financing Cash Flow</span>
                      <span className="font-semibold text-blue-600">$0</span>
                    </div>
                    <div className="flex justify-between border-t pt-2">
                      <span className="font-semibold">Net Cash Flow</span>
                      <span className="font-semibold text-green-600">+$9,250</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}