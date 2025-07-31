import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { toast } from '@/hooks/use-toast';
import {
  DollarSign,
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  FileText,
  TrendingUp,
  TrendingDown,
  Calendar,
  Receipt,
  PieChart,
  BarChart3,
  Download,
  Upload,
  CreditCard,
  Wallet,
  Building2,
  Calculator,
  Target,
  AlertCircle
} from 'lucide-react';

interface Expense {
  id: string;
  projectId?: string;
  projectName?: string;
  category: string;
  amount: number;
  description: string;
  date: string;
  vendor: string;
  receiptFile?: string;
  status: 'pending' | 'approved' | 'paid' | 'rejected';
  paymentMethod: 'cash' | 'check' | 'credit_card' | 'bank_transfer';
  taxDeductible: boolean;
  tags: string[];
}

interface Invoice {
  id: string;
  invoiceNumber: string;
  clientId: string;
  clientName: string;
  projectId: string;
  projectName: string;
  amount: number;
  tax: number;
  total: number;
  issueDate: string;
  dueDate: string;
  status: 'draft' | 'sent' | 'viewed' | 'paid' | 'overdue' | 'cancelled';
  lineItems: Array<{
    description: string;
    quantity: number;
    rate: number;
    amount: number;
  }>;
  notes?: string;
}

interface Budget {
  id: string;
  name: string;
  period: 'monthly' | 'quarterly' | 'yearly';
  startDate: string;
  endDate: string;
  categories: Array<{
    name: string;
    budgeted: number;
    spent: number;
    remaining: number;
  }>;
  totalBudget: number;
  totalSpent: number;
  variance: number;
}

export default function FinancialManagementPage() {
  const { toast } = useToast();
  
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [filteredExpenses, setFilteredExpenses] = useState<Expense[]>([]);
  const [filteredInvoices, setFilteredInvoices] = useState<Invoice[]>([]);
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dateRange, setDateRange] = useState<string>('this_month');
  const [isExpenseDialogOpen, setIsExpenseDialogOpen] = useState(false);
  const [isInvoiceDialogOpen, setIsInvoiceDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  const [newExpense, setNewExpense] = useState({
    projectId: '',
    category: '',
    amount: 0,
    description: '',
    vendor: '',
    paymentMethod: 'credit_card' as Expense['paymentMethod'],
    taxDeductible: true,
    tags: [] as string[],
    newTag: ''
  });

  const [newInvoice, setNewInvoice] = useState({
    clientId: '',
    projectId: '',
    amount: 0,
    tax: 0,
    dueDate: '',
    lineItems: [] as Invoice['lineItems'],
    notes: ''
  });

  useEffect(() => {
    loadExpenses();
    loadInvoices();
    loadBudgets();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [expenses, invoices, searchTerm, categoryFilter, statusFilter, dateRange]);

  const loadExpenses = async () => {
    // Mock data - in real implementation, fetch from Supabase
    const mockExpenses: Expense[] = [
      {
        id: '1',
        projectId: 'proj-1',
        projectName: 'First Baptist Church Parking Lot',
        category: 'Materials',
        amount: 12500.00,
        description: 'Asphalt materials for parking lot',
        date: new Date().toISOString().split('T')[0],
        vendor: 'ABC Asphalt Supply',
        status: 'paid',
        paymentMethod: 'check',
        taxDeductible: true,
        tags: ['asphalt', 'materials', 'church']
      },
      {
        id: '2',
        projectId: 'proj-2',
        projectName: 'Grace Methodist Sealcoating',
        category: 'Equipment Rental',
        amount: 850.00,
        description: 'Sealcoating equipment rental - 2 days',
        date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        vendor: 'Equipment Rental Plus',
        status: 'approved',
        paymentMethod: 'credit_card',
        taxDeductible: true,
        tags: ['equipment', 'rental', 'sealcoating']
      },
      {
        id: '3',
        category: 'Fuel',
        amount: 245.75,
        description: 'Fuel for equipment and vehicles',
        date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        vendor: 'Shell Gas Station',
        status: 'pending',
        paymentMethod: 'credit_card',
        taxDeductible: true,
        tags: ['fuel', 'operations']
      },
      {
        id: '4',
        category: 'Office Supplies',
        amount: 156.30,
        description: 'Office supplies and software subscription',
        date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        vendor: 'Office Depot',
        status: 'paid',
        paymentMethod: 'credit_card',
        taxDeductible: true,
        tags: ['office', 'supplies', 'software']
      }
    ];
    setExpenses(mockExpenses);
  };

  const loadInvoices = async () => {
    // Mock invoice data
    const mockInvoices: Invoice[] = [
      {
        id: '1',
        invoiceNumber: 'INV-2024-001',
        clientId: 'client-1',
        clientName: 'First Baptist Church',
        projectId: 'proj-1',
        projectName: 'Parking Lot Renovation',
        amount: 45000.00,
        tax: 4500.00,
        total: 49500.00,
        issueDate: new Date().toISOString().split('T')[0],
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        status: 'sent',
        lineItems: [
          {
            description: 'Asphalt removal and disposal',
            quantity: 1,
            rate: 15000.00,
            amount: 15000.00
          },
          {
            description: 'New asphalt installation',
            quantity: 2000,
            rate: 12.00,
            amount: 24000.00
          },
          {
            description: 'Line striping',
            quantity: 1,
            rate: 6000.00,
            amount: 6000.00
          }
        ],
        notes: 'Payment due within 30 days. Thank you for your business.'
      },
      {
        id: '2',
        invoiceNumber: 'INV-2024-002',
        clientId: 'client-2',
        clientName: 'Grace Methodist Church',
        projectId: 'proj-2',
        projectName: 'Sealcoating Services',
        amount: 8500.00,
        tax: 850.00,
        total: 9350.00,
        issueDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        dueDate: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        status: 'viewed',
        lineItems: [
          {
            description: 'Crack sealing',
            quantity: 1,
            rate: 2500.00,
            amount: 2500.00
          },
          {
            description: 'Sealcoating application',
            quantity: 15000,
            rate: 0.40,
            amount: 6000.00
          }
        ],
        notes: 'Includes 2-year warranty on sealcoating.'
      }
    ];
    setInvoices(mockInvoices);
  };

  const loadBudgets = async () => {
    // Mock budget data
    const mockBudgets: Budget[] = [
      {
        id: '1',
        name: '2024 Q1 Budget',
        period: 'quarterly',
        startDate: '2024-01-01',
        endDate: '2024-03-31',
        categories: [
          { name: 'Materials', budgeted: 50000, spent: 35750, remaining: 14250 },
          { name: 'Labor', budgeted: 30000, spent: 28500, remaining: 1500 },
          { name: 'Equipment', budgeted: 15000, spent: 12200, remaining: 2800 },
          { name: 'Fuel', budgeted: 8000, spent: 6750, remaining: 1250 },
          { name: 'Office', budgeted: 5000, spent: 3200, remaining: 1800 }
        ],
        totalBudget: 108000,
        totalSpent: 86400,
        variance: -21600
      }
    ];
    setBudgets(mockBudgets);
  };

  const applyFilters = () => {
    let filteredExp = expenses;
    let filteredInv = invoices;

    if (searchTerm) {
      filteredExp = filteredExp.filter(expense =>
        expense.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        expense.vendor.toLowerCase().includes(searchTerm.toLowerCase()) ||
        expense.category.toLowerCase().includes(searchTerm.toLowerCase())
      );
      
      filteredInv = filteredInv.filter(invoice =>
        invoice.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        invoice.projectName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        invoice.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (categoryFilter !== 'all') {
      filteredExp = filteredExp.filter(expense => expense.category === categoryFilter);
    }

    if (statusFilter !== 'all') {
      filteredExp = filteredExp.filter(expense => expense.status === statusFilter);
      filteredInv = filteredInv.filter(invoice => invoice.status === statusFilter);
    }

    setFilteredExpenses(filteredExp);
    setFilteredInvoices(filteredInv);
  };

  const createExpense = async () => {
    const expense: Expense = {
      id: Date.now().toString(),
      projectId: newExpense.projectId || undefined,
      projectName: newExpense.projectId ? getProjectName(newExpense.projectId) : undefined,
      category: newExpense.category,
      amount: newExpense.amount,
      description: newExpense.description,
      date: new Date().toISOString().split('T')[0],
      vendor: newExpense.vendor,
      status: 'pending',
      paymentMethod: newExpense.paymentMethod,
      taxDeductible: newExpense.taxDeductible,
      tags: newExpense.tags
    };

    setExpenses(prev => [expense, ...prev]);
    setIsExpenseDialogOpen(false);
    
    // Reset form
    setNewExpense({
      projectId: '',
      category: '',
      amount: 0,
      description: '',
      vendor: '',
      paymentMethod: 'credit_card',
      taxDeductible: true,
      tags: [],
      newTag: ''
    });

    toast({
      title: "Expense Added",
      description: `Expense of ${formatCurrency(expense.amount)} has been recorded`,
    });
  };

  const deleteExpense = (expenseId: string) => {
    setExpenses(prev => prev.filter(expense => expense.id !== expenseId));
    toast({
      title: "Expense Deleted",
      description: "Expense has been removed from records",
    });
  };

  const addTag = () => {
    if (newExpense.newTag.trim() && !newExpense.tags.includes(newExpense.newTag.trim())) {
      setNewExpense(prev => ({
        ...prev,
        tags: [...prev.tags, prev.newTag.trim()],
        newTag: ''
      }));
    }
  };

  const removeTag = (tag: string) => {
    setNewExpense(prev => ({
      ...prev,
      tags: prev.tags.filter(t => t !== tag)
    }));
  };

  const getProjectName = (projectId: string): string => {
    const projects = {
      'proj-1': 'First Baptist Church Parking Lot',
      'proj-2': 'Grace Methodist Sealcoating'
    };
    return projects[projectId as keyof typeof projects] || 'Unknown Project';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      case 'approved': return 'text-blue-600 bg-blue-100';
      case 'paid': return 'text-green-600 bg-green-100';
      case 'sent': return 'text-blue-600 bg-blue-100';
      case 'viewed': return 'text-purple-600 bg-purple-100';
      case 'overdue': return 'text-red-600 bg-red-100';
      case 'rejected': case 'cancelled': return 'text-red-600 bg-red-100';
      case 'draft': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const calculateTotals = () => {
    const totalIncome = invoices
      .filter(inv => inv.status === 'paid')
      .reduce((sum, inv) => sum + inv.total, 0);
    
    const totalExpenses = expenses
      .filter(exp => exp.status === 'paid')
      .reduce((sum, exp) => sum + exp.amount, 0);
    
    const pendingIncome = invoices
      .filter(inv => ['sent', 'viewed'].includes(inv.status))
      .reduce((sum, inv) => sum + inv.total, 0);
    
    const pendingExpenses = expenses
      .filter(exp => ['pending', 'approved'].includes(exp.status))
      .reduce((sum, exp) => sum + exp.amount, 0);

    return {
      totalIncome,
      totalExpenses,
      netProfit: totalIncome - totalExpenses,
      pendingIncome,
      pendingExpenses
    };
  };

  const totals = calculateTotals();

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <DollarSign className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-3xl font-bold text-foreground">Financial Management</h1>
              <p className="text-muted-foreground">
                Track expenses, generate invoices, and manage budgets
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Dialog open={isExpenseDialogOpen} onOpenChange={setIsExpenseDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Expense
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Add New Expense</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium">Category</label>
                      <Select value={newExpense.category} onValueChange={(value) => 
                        setNewExpense(prev => ({ ...prev, category: value }))
                      }>
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Materials">Materials</SelectItem>
                          <SelectItem value="Labor">Labor</SelectItem>
                          <SelectItem value="Equipment Rental">Equipment Rental</SelectItem>
                          <SelectItem value="Fuel">Fuel</SelectItem>
                          <SelectItem value="Office Supplies">Office Supplies</SelectItem>
                          <SelectItem value="Insurance">Insurance</SelectItem>
                          <SelectItem value="Utilities">Utilities</SelectItem>
                          <SelectItem value="Other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="text-sm font-medium">Amount</label>
                      <Input
                        type="number"
                        step="0.01"
                        value={newExpense.amount}
                        onChange={(e) => setNewExpense(prev => ({ ...prev, amount: Number(e.target.value) }))}
                        placeholder="0.00"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium">Description</label>
                    <Input
                      value={newExpense.description}
                      onChange={(e) => setNewExpense(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Enter expense description"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium">Vendor</label>
                      <Input
                        value={newExpense.vendor}
                        onChange={(e) => setNewExpense(prev => ({ ...prev, vendor: e.target.value }))}
                        placeholder="Enter vendor name"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Payment Method</label>
                      <Select value={newExpense.paymentMethod} onValueChange={(value: any) => 
                        setNewExpense(prev => ({ ...prev, paymentMethod: value }))
                      }>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="cash">Cash</SelectItem>
                          <SelectItem value="check">Check</SelectItem>
                          <SelectItem value="credit_card">Credit Card</SelectItem>
                          <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium">Project (Optional)</label>
                    <Select value={newExpense.projectId} onValueChange={(value) => 
                      setNewExpense(prev => ({ ...prev, projectId: value }))
                    }>
                      <SelectTrigger>
                        <SelectValue placeholder="Select project" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">No Project</SelectItem>
                        <SelectItem value="proj-1">First Baptist Church Parking Lot</SelectItem>
                        <SelectItem value="proj-2">Grace Methodist Sealcoating</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm font-medium">Tags</label>
                    <div className="flex gap-2">
                      <Input
                        value={newExpense.newTag}
                        onChange={(e) => setNewExpense(prev => ({ ...prev, newTag: e.target.value }))}
                        placeholder="Add tag..."
                        onKeyPress={(e) => e.key === 'Enter' && addTag()}
                      />
                      <Button type="button" onClick={addTag} size="sm">
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {newExpense.tags.map((tag) => (
                        <Badge key={tag} variant="secondary" className="cursor-pointer" onClick={() => removeTag(tag)}>
                          {tag} ×
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setIsExpenseDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={createExpense}>
                      Add Expense
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Invoice
            </Button>
          </div>
        </div>

        {/* Financial Overview Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-green-500" />
                <div>
                  <div className="text-2xl font-bold text-green-600">
                    {formatCurrency(totals.totalIncome)}
                  </div>
                  <div className="text-sm text-muted-foreground">Total Income</div>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <TrendingDown className="h-5 w-5 text-red-500" />
                <div>
                  <div className="text-2xl font-bold text-red-600">
                    {formatCurrency(totals.totalExpenses)}
                  </div>
                  <div className="text-sm text-muted-foreground">Total Expenses</div>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Calculator className="h-5 w-5 text-primary" />
                <div>
                  <div className={`text-2xl font-bold ${totals.netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatCurrency(totals.netProfit)}
                  </div>
                  <div className="text-sm text-muted-foreground">Net Profit</div>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Wallet className="h-5 w-5 text-blue-500" />
                <div>
                  <div className="text-2xl font-bold text-blue-600">
                    {formatCurrency(totals.pendingIncome)}
                  </div>
                  <div className="text-sm text-muted-foreground">Pending Income</div>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-orange-500" />
                <div>
                  <div className="text-2xl font-bold text-orange-600">
                    {formatCurrency(totals.pendingExpenses)}
                  </div>
                  <div className="text-sm text-muted-foreground">Pending Expenses</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-4 flex-wrap">
              <div className="flex-1 min-w-[200px]">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search transactions..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="Materials">Materials</SelectItem>
                  <SelectItem value="Labor">Labor</SelectItem>
                  <SelectItem value="Equipment Rental">Equipment</SelectItem>
                  <SelectItem value="Fuel">Fuel</SelectItem>
                  <SelectItem value="Office Supplies">Office</SelectItem>
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="sent">Sent</SelectItem>
                  <SelectItem value="viewed">Viewed</SelectItem>
                  <SelectItem value="overdue">Overdue</SelectItem>
                </SelectContent>
              </Select>
              <Select value={dateRange} onValueChange={setDateRange}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Date Range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="this_week">This Week</SelectItem>
                  <SelectItem value="this_month">This Month</SelectItem>
                  <SelectItem value="this_quarter">This Quarter</SelectItem>
                  <SelectItem value="this_year">This Year</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="expenses">Expenses</TabsTrigger>
            <TabsTrigger value="invoices">Invoices</TabsTrigger>
            <TabsTrigger value="budgets">Budgets</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <PieChart className="h-5 w-5" />
                    Expense Breakdown
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {['Materials', 'Labor', 'Equipment Rental', 'Fuel', 'Office Supplies'].map((category) => {
                      const categoryExpenses = expenses.filter(e => e.category === category);
                      const total = categoryExpenses.reduce((sum, e) => sum + e.amount, 0);
                      const percentage = totals.totalExpenses > 0 ? (total / totals.totalExpenses) * 100 : 0;
                      
                      return (
                        <div key={category} className="space-y-2">
                          <div className="flex justify-between items-center text-sm">
                            <span>{category}</span>
                            <span className="font-medium">{formatCurrency(total)}</span>
                          </div>
                          <Progress value={percentage} className="h-2" />
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Recent Activity
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[...expenses.slice(0, 3), ...invoices.slice(0, 2)].map((item, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border rounded-md">
                        <div className="flex items-center gap-3">
                          {'vendor' in item ? (
                            <Receipt className="h-4 w-4 text-red-500" />
                          ) : (
                            <FileText className="h-4 w-4 text-green-500" />
                          )}
                          <div>
                            <div className="font-medium text-sm">
                              {'vendor' in item ? item.description : `Invoice ${item.invoiceNumber}`}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {'vendor' in item ? item.vendor : item.clientName}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className={`font-medium ${
                            'vendor' in item ? 'text-red-600' : 'text-green-600'
                          }`}>
                            {'vendor' in item ? `-${formatCurrency(item.amount)}` : `+${formatCurrency(item.total)}`}
                          </div>
                          <Badge variant="outline" className={getStatusColor(item.status)}>
                            {item.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="expenses" className="space-y-6">
            <div className="grid gap-4">
              {filteredExpenses.map((expense) => (
                <Card key={expense.id} className="cursor-pointer hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-3">
                          <h3 className="font-semibold text-lg">{expense.description}</h3>
                          <Badge className={getStatusColor(expense.status)}>
                            {expense.status}
                          </Badge>
                          <Badge variant="outline">
                            {expense.category}
                          </Badge>
                        </div>
                        
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                          <div className="flex items-center gap-2">
                            <DollarSign className="h-3 w-3 text-muted-foreground" />
                            <span className="font-medium">{formatCurrency(expense.amount)}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Calendar className="h-3 w-3 text-muted-foreground" />
                            <span>{formatDate(expense.date)}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Building2 className="h-3 w-3 text-muted-foreground" />
                            <span>{expense.vendor}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <CreditCard className="h-3 w-3 text-muted-foreground" />
                            <span className="capitalize">{expense.paymentMethod.replace('_', ' ')}</span>
                          </div>
                        </div>

                        {expense.projectName && (
                          <div className="text-sm text-muted-foreground">
                            Project: {expense.projectName}
                          </div>
                        )}

                        {expense.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {expense.tags.map((tag) => (
                              <Badge key={tag} variant="secondary" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => deleteExpense(expense.id)}>
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="invoices" className="space-y-6">
            <div className="grid gap-4">
              {filteredInvoices.map((invoice) => (
                <Card key={invoice.id} className="cursor-pointer hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-3">
                          <h3 className="font-semibold text-lg">{invoice.invoiceNumber}</h3>
                          <Badge className={getStatusColor(invoice.status)}>
                            {invoice.status}
                          </Badge>
                        </div>
                        
                        <div className="text-sm text-muted-foreground">
                          {invoice.clientName} • {invoice.projectName}
                        </div>

                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                          <div className="flex items-center gap-2">
                            <DollarSign className="h-3 w-3 text-muted-foreground" />
                            <span className="font-medium">{formatCurrency(invoice.total)}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Calendar className="h-3 w-3 text-muted-foreground" />
                            <span>Issued: {formatDate(invoice.issueDate)}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <AlertCircle className="h-3 w-3 text-muted-foreground" />
                            <span>Due: {formatDate(invoice.dueDate)}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Receipt className="h-3 w-3 text-muted-foreground" />
                            <span>{invoice.lineItems.length} items</span>
                          </div>
                        </div>

                        {invoice.notes && (
                          <div className="text-sm">
                            <span className="font-medium">Notes: </span>
                            <span className="text-muted-foreground">{invoice.notes}</span>
                          </div>
                        )}
                      </div>

                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          <Download className="h-3 w-3" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <Edit className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="budgets" className="space-y-6">
            {budgets.map((budget) => (
              <Card key={budget.id}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>{budget.name}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">
                        {formatDate(budget.startDate)} - {formatDate(budget.endDate)}
                      </span>
                      <Badge variant={budget.variance < 0 ? "default" : "destructive"}>
                        {budget.variance < 0 ? 'Under Budget' : 'Over Budget'}
                      </Badge>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <div className="text-2xl font-bold text-blue-600">
                        {formatCurrency(budget.totalBudget)}
                      </div>
                      <div className="text-sm text-muted-foreground">Total Budget</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-red-600">
                        {formatCurrency(budget.totalSpent)}
                      </div>
                      <div className="text-sm text-muted-foreground">Total Spent</div>
                    </div>
                    <div>
                      <div className={`text-2xl font-bold ${budget.variance < 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {formatCurrency(Math.abs(budget.variance))}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {budget.variance < 0 ? 'Under Budget' : 'Over Budget'}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {budget.categories.map((category) => (
                      <div key={category.name} className="space-y-2">
                        <div className="flex justify-between items-center text-sm">
                          <span className="font-medium">{category.name}</span>
                          <span>{formatCurrency(category.spent)} / {formatCurrency(category.budgeted)}</span>
                        </div>
                        <Progress 
                          value={(category.spent / category.budgeted) * 100} 
                          className="h-2"
                        />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="reports" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Financial Reports
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  <Button variant="outline" className="h-20 flex-col">
                    <BarChart3 className="h-6 w-6 mb-2" />
                    Profit & Loss
                  </Button>
                  <Button variant="outline" className="h-20 flex-col">
                    <PieChart className="h-6 w-6 mb-2" />
                    Expense Report
                  </Button>
                  <Button variant="outline" className="h-20 flex-col">
                    <Receipt className="h-6 w-6 mb-2" />
                    Invoice Summary
                  </Button>
                  <Button variant="outline" className="h-20 flex-col">
                    <Target className="h-6 w-6 mb-2" />
                    Budget Analysis
                  </Button>
                  <Button variant="outline" className="h-20 flex-col">
                    <TrendingUp className="h-6 w-6 mb-2" />
                    Cash Flow
                  </Button>
                  <Button variant="outline" className="h-20 flex-col">
                    <Calculator className="h-6 w-6 mb-2" />
                    Tax Summary
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {filteredExpenses.length === 0 && activeTab === 'expenses' && (
          <Card>
            <CardContent className="text-center py-12">
              <Receipt className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Expenses Found</h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm || categoryFilter !== 'all' || statusFilter !== 'all'
                  ? 'No expenses match your current filters'
                  : 'Add your first expense to get started'
                }
              </p>
              <Button onClick={() => setIsExpenseDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Expense
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}