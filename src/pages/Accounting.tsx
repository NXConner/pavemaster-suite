import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Button } from '../components/ui/button';
import { Label } from '../components/ui/label';
import { Badge } from '../components/ui/badge';
import { AppSidebar } from '../components/layout/app-sidebar';
import { 
  DollarSign, 
  Receipt, 
  FileText, 
  TrendingUp,
  Calendar,
  Camera,
  Scan,
  Upload,
  Download,
  Eye,
  Calculator
} from 'lucide-react';

export default function Accounting() {
  const [scanMode, setScanMode] = useState('receipt');

  const financialSummary = {
    revenue: 145280,
    expenses: 89450,
    profit: 55830,
    taxes: 11166
  };

  const recentTransactions = [
    { id: 1, type: 'revenue', description: 'Church Parking Lot - St. Mary', amount: 8500, date: '2024-01-15', status: 'completed' },
    { id: 2, type: 'expense', description: 'Fuel & Equipment', amount: -342, date: '2024-01-14', status: 'completed' },
    { id: 3, type: 'revenue', description: 'Driveway Sealcoating - Residential', amount: 1250, date: '2024-01-14', status: 'pending' },
    { id: 4, type: 'expense', description: 'Material Purchase - SealMaster', amount: -2100, date: '2024-01-13', status: 'completed' }
  ];

  const payrollData = [
    { id: 1, employee: 'John Smith', role: 'Crew Leader', hours: 42, rate: 28, gross: 1176, taxes: 235, net: 941 },
    { id: 2, employee: 'Mike Johnson', role: 'Equipment Operator', hours: 38, rate: 24, gross: 912, taxes: 182, net: 730 },
    { id: 3, employee: 'Sarah Davis', role: 'Project Manager', hours: 40, rate: 32, gross: 1280, taxes: 256, net: 1024 }
  ];

  const receiptCategories = [
    { name: 'Fuel & Vehicle', count: 24, amount: 3420 },
    { name: 'Equipment Rental', count: 8, amount: 5600 },
    { name: 'Materials', count: 15, amount: 8900 },
    { name: 'Meals & Travel', count: 12, amount: 980 },
    { name: 'Office Supplies', count: 6, amount: 340 },
    { name: 'Insurance', count: 3, amount: 2200 }
  ];

  return (
    <div className="flex h-screen">
      <AppSidebar />
      <div className="flex-1 p-6 overflow-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">Accounting & Payroll</h1>
          <p className="text-muted-foreground">
            Complete financial management with automated receipt scanning and tax preparation
          </p>
        </div>

        {/* Financial Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Revenue</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-2xl font-bold text-green-600">
                  ${financialSummary.revenue.toLocaleString()}
                </div>
                <TrendingUp className="h-5 w-5 text-green-600" />
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                +12% from last month
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Expenses</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-2xl font-bold text-red-600">
                  ${financialSummary.expenses.toLocaleString()}
                </div>
                <Receipt className="h-5 w-5 text-red-600" />
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                -3% from last month
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Net Profit</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-2xl font-bold text-blue-600">
                  ${financialSummary.profit.toLocaleString()}
                </div>
                <DollarSign className="h-5 w-5 text-blue-600" />
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                +18% from last month
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Tax Liability</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-2xl font-bold text-orange-600">
                  ${financialSummary.taxes.toLocaleString()}
                </div>
                <FileText className="h-5 w-5 text-orange-600" />
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                Due: March 15, 2024
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="transactions" className="w-full">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="transactions">Transactions</TabsTrigger>
            <TabsTrigger value="payroll">Payroll</TabsTrigger>
            <TabsTrigger value="receipts">Receipt Scanner</TabsTrigger>
            <TabsTrigger value="taxes">Tax Center</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
            <TabsTrigger value="invoicing">Invoicing</TabsTrigger>
          </TabsList>

          <TabsContent value="transactions" className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Recent Transactions</h3>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <Upload className="h-4 w-4 mr-2" />
                  Import
                </Button>
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </div>
            </div>

            <Card>
              <CardContent className="p-0">
                <div className="divide-y">
                  {recentTransactions.map((transaction) => (
                    <div key={transaction.id} className="p-4 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-full ${
                          transaction.type === 'revenue' ? 'bg-green-100' : 'bg-red-100'
                        }`}>
                          {transaction.type === 'revenue' ? 
                            <TrendingUp className="h-4 w-4 text-green-600" /> :
                            <Receipt className="h-4 w-4 text-red-600" />
                          }
                        </div>
                        <div>
                          <div className="font-medium">{transaction.description}</div>
                          <div className="text-sm text-muted-foreground">{transaction.date}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className={`text-lg font-semibold ${
                          transaction.type === 'revenue' ? 'text-green-600' : 'text-red-600'
                        }`}>
                          ${Math.abs(transaction.amount).toLocaleString()}
                        </div>
                        <Badge variant={
                          transaction.status === 'completed' ? 'default' :
                          transaction.status === 'pending' ? 'secondary' : 'destructive'
                        }>
                          {transaction.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="payroll" className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Payroll Management</h3>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <Calendar className="h-4 w-4 mr-2" />
                  Time Sheets
                </Button>
                <Button size="sm">
                  <Calculator className="h-4 w-4 mr-2" />
                  Process Payroll
                </Button>
              </div>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Current Pay Period</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y">
                  {payrollData.map((employee) => (
                    <div key={employee.id} className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <div className="font-medium">{employee.employee}</div>
                          <div className="text-sm text-muted-foreground">{employee.role}</div>
                        </div>
                        <Badge variant="outline">{employee.hours}h</Badge>
                      </div>
                      <div className="grid grid-cols-4 gap-4 text-sm">
                        <div>
                          <div className="text-muted-foreground">Rate</div>
                          <div className="font-medium">${employee.rate}/hr</div>
                        </div>
                        <div>
                          <div className="text-muted-foreground">Gross</div>
                          <div className="font-medium">${employee.gross}</div>
                        </div>
                        <div>
                          <div className="text-muted-foreground">Taxes</div>
                          <div className="font-medium text-red-600">-${employee.taxes}</div>
                        </div>
                        <div>
                          <div className="text-muted-foreground">Net Pay</div>
                          <div className="font-medium text-green-600">${employee.net}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="receipts" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Receipt Scanner */}
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Scan className="h-5 w-5" />
                      AI Receipt Scanner
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="border-2 border-dashed rounded-lg p-8 text-center">
                      <div className="flex flex-col items-center gap-4">
                        <Camera className="h-12 w-12 text-muted-foreground" />
                        <div>
                          <h3 className="font-semibold mb-2">Scan or Upload Receipt</h3>
                          <p className="text-sm text-muted-foreground mb-4">
                            Drag and drop receipt images or click to browse
                          </p>
                          <div className="flex gap-2 justify-center">
                            <Button variant="outline">
                              <Camera className="h-4 w-4 mr-2" />
                              Take Photo
                            </Button>
                            <Button>
                              <Upload className="h-4 w-4 mr-2" />
                              Upload Files
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="mt-6 space-y-3">
                      <Label>Quick Categories</Label>
                      <div className="flex flex-wrap gap-2">
                        {['Fuel', 'Materials', 'Equipment', 'Meals', 'Office', 'Insurance'].map((category) => (
                          <Button
                            key={category}
                            variant={scanMode === category.toLowerCase() ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setScanMode(category.toLowerCase())}
                          >
                            {category}
                          </Button>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Receipt Categories */}
              <div>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Receipt Categories</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {receiptCategories.map((category) => (
                      <div key={category.name} className="flex items-center justify-between">
                        <div>
                          <div className="font-medium text-sm">{category.name}</div>
                          <div className="text-xs text-muted-foreground">{category.count} receipts</div>
                        </div>
                        <div className="text-sm font-medium">${category.amount}</div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Recent Scanned Receipts */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Recently Scanned</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[
                    { vendor: 'Shell Gas Station', amount: 87.45, category: 'Fuel', status: 'processed' },
                    { vendor: 'Home Depot', amount: 234.67, category: 'Materials', status: 'processing' },
                    { vendor: 'Equipment Rental Co', amount: 450.00, category: 'Equipment', status: 'review' }
                  ].map((receipt, i) => (
                    <div key={i} className="border rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <div className="font-medium text-sm">{receipt.vendor}</div>
                        <Badge variant={
                          receipt.status === 'processed' ? 'default' :
                          receipt.status === 'processing' ? 'secondary' : 'destructive'
                        }>
                          {receipt.status}
                        </Badge>
                      </div>
                      <div className="text-lg font-semibold">${receipt.amount}</div>
                      <div className="text-xs text-muted-foreground">{receipt.category}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="taxes" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Tax Preparation Center
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span>Q4 2023 Taxes</span>
                      <Badge variant="default">Filed</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Q1 2024 Taxes</span>
                      <Badge variant="secondary">In Progress</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Annual 2023 Return</span>
                      <Badge variant="destructive">Due Soon</Badge>
                    </div>
                  </div>
                  <Button className="w-full">
                    <Calculator className="h-4 w-4 mr-2" />
                    Calculate Tax Liability
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Deductible Expenses</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span>Vehicle & Fuel</span>
                    <span className="font-medium">$12,450</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Equipment Depreciation</span>
                    <span className="font-medium">$8,200</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Business Meals</span>
                    <span className="font-medium">$1,840</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Office & Supplies</span>
                    <span className="font-medium">$920</span>
                  </div>
                  <hr />
                  <div className="flex justify-between font-semibold">
                    <span>Total Deductions</span>
                    <span>$23,410</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="reports" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                'Profit & Loss Statement',
                'Cash Flow Report',
                'Tax Summary Report',
                'Payroll Summary',
                'Expense Analysis',
                'Revenue Breakdown'
              ].map((report) => (
                <Card key={report} className="cursor-pointer hover:bg-muted/50">
                  <CardContent className="p-4 text-center">
                    <div className="flex items-center justify-center mb-3">
                      <FileText className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <div className="font-medium mb-2">{report}</div>
                    <div className="flex gap-2 justify-center">
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="invoicing" className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Invoice Management</h3>
              <Button>
                <FileText className="h-4 w-4 mr-2" />
                Create Invoice
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm text-muted-foreground">Outstanding</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">$18,450</div>
                  <div className="text-sm text-muted-foreground">12 invoices</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm text-muted-foreground">Overdue</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-600">$3,200</div>
                  <div className="text-sm text-muted-foreground">2 invoices</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm text-muted-foreground">Paid This Month</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">$24,750</div>
                  <div className="text-sm text-muted-foreground">18 invoices</div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}