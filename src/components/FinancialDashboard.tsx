import { useState } from "react";
import { DollarSign, TrendingUp, TrendingDown, Calculator, CreditCard, Receipt, Target, AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface FinancialMetric {
  id: string;
  label: string;
  value: string;
  change: number;
  trend: 'up' | 'down' | 'stable';
  target?: string;
  category: 'revenue' | 'expenses' | 'profit' | 'budget';
}

interface ProjectFinancial {
  id: string;
  name: string;
  budget: number;
  spent: number;
  remaining: number;
  profitMargin: number;
  status: 'on-budget' | 'over-budget' | 'under-budget';
}

export function FinancialDashboard() {
  const [timeframe, setTimeframe] = useState<'month' | 'quarter' | 'year'>('month');

  const metrics: FinancialMetric[] = [
    {
      id: '1',
      label: 'Total Revenue',
      value: '$2,425,000',
      change: 12.5,
      trend: 'up',
      target: '$2,500,000',
      category: 'revenue'
    },
    {
      id: '2', 
      label: 'Operating Expenses',
      value: '$1,850,000',
      change: -3.2,
      trend: 'down',
      target: '$1,800,000',
      category: 'expenses'
    },
    {
      id: '3',
      label: 'Net Profit',
      value: '$575,000',
      change: 18.7,
      trend: 'up',
      target: '$700,000',
      category: 'profit'
    },
    {
      id: '4',
      label: 'Profit Margin',
      value: '23.7%',
      change: 2.1,
      trend: 'up',
      target: '25%',
      category: 'profit'
    }
  ];

  const projectFinancials: ProjectFinancial[] = [
    {
      id: '1',
      name: 'Highway 101 Resurfacing',
      budget: 450000,
      spent: 285000,
      remaining: 165000,
      profitMargin: 18.5,
      status: 'on-budget'
    },
    {
      id: '2',
      name: 'Shopping Center Parking',
      budget: 125000,
      spent: 118500,
      remaining: 6500,
      profitMargin: 22.3,
      status: 'under-budget'
    },
    {
      id: '3',
      name: 'Industrial Park Access',
      budget: 275000,
      spent: 295000,
      remaining: -20000,
      profitMargin: 12.1,
      status: 'over-budget'
    }
  ];

  const getTrendIcon = (trend: string) => {
    if (trend === 'up') return <TrendingUp className="h-4 w-4 text-green-500" />;
    if (trend === 'down') return <TrendingDown className="h-4 w-4 text-red-500" />;
    return <div className="h-4 w-4 bg-gray-400 rounded-full" />;
  };

  const getTrendColor = (trend: string, change: number) => {
    if (trend === 'up' && change > 0) return 'text-green-600';
    if (trend === 'down' && change < 0) return 'text-red-600';
    return 'text-muted-foreground';
  };

  const getStatusColor = (status: string) => {
    const colors = {
      'on-budget': 'bg-green-100 text-green-800 border-green-200',
      'under-budget': 'bg-blue-100 text-blue-800 border-blue-200',
      'over-budget': 'bg-red-100 text-red-800 border-red-200'
    };
    return colors[status as keyof typeof colors];
  };

  const getBudgetProgress = (spent: number, budget: number) => {
    return Math.min((spent / budget) * 100, 100);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-foreground">Financial Dashboard</h2>
        <div className="flex items-center space-x-2">
          <Select value={timeframe} onValueChange={(value: 'month' | 'quarter' | 'year') => { setTimeframe(value); }}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="month">This Month</SelectItem>
              <SelectItem value="quarter">This Quarter</SelectItem>
              <SelectItem value="year">This Year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm">
            <Receipt className="h-4 w-4 mr-2" />
            Generate Report
          </Button>
        </div>
      </div>

      {/* Key Financial Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {metrics.map((metric) => (
          <Card key={metric.id}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {metric.label}
              </CardTitle>
              {getTrendIcon(metric.trend)}
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground mb-1">
                {metric.value}
              </div>
              <div className="flex items-center justify-between">
                <span className={`text-xs font-medium ${getTrendColor(metric.trend, metric.change)}`}>
                  {metric.change > 0 ? '+' : ''}{metric.change}%
                </span>
                {metric.target && (
                  <span className="text-xs text-muted-foreground">
                    Target: {metric.target}
                  </span>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="projects" className="space-y-4">
        <TabsList>
          <TabsTrigger value="projects">Project Financials</TabsTrigger>
          <TabsTrigger value="cash-flow">Cash Flow</TabsTrigger>
          <TabsTrigger value="expenses">Expense Breakdown</TabsTrigger>
          <TabsTrigger value="forecasting">Forecasting</TabsTrigger>
        </TabsList>

        <TabsContent value="projects" className="space-y-4">
          <div className="grid gap-4">
            {projectFinancials.map((project) => (
              <Card key={project.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{project.name}</CardTitle>
                    <Badge variant="outline" className={getStatusColor(project.status)}>
                      {project.status.replace('-', ' ')}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                    <div className="text-center">
                      <div className="text-sm text-muted-foreground">Budget</div>
                      <div className="text-lg font-semibold">{formatCurrency(project.budget)}</div>
                    </div>
                    <div className="text-center">
                      <div className="text-sm text-muted-foreground">Spent</div>
                      <div className="text-lg font-semibold">{formatCurrency(project.spent)}</div>
                    </div>
                    <div className="text-center">
                      <div className="text-sm text-muted-foreground">Remaining</div>
                      <div className={`text-lg font-semibold ${project.remaining < 0 ? 'text-red-600' : 'text-green-600'}`}>
                        {formatCurrency(project.remaining)}
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-sm text-muted-foreground">Profit Margin</div>
                      <div className="text-lg font-semibold">{project.profitMargin}%</div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Budget Utilization</span>
                      <span>{getBudgetProgress(project.spent, project.budget).toFixed(1)}%</span>
                    </div>
                    <Progress 
                      value={getBudgetProgress(project.spent, project.budget)}
                      className={project.spent > project.budget ? 'bg-red-100' : 'bg-green-100'}
                    />
                    {project.spent > project.budget && (
                      <div className="flex items-center space-x-2 text-sm text-red-600">
                        <AlertCircle className="h-4 w-4" />
                        <span>Over budget by {formatCurrency(project.spent - project.budget)}</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="cash-flow" className="space-y-4">
          <div className="text-center text-muted-foreground py-8">
            <DollarSign className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Cash flow analysis and forecasting charts would be implemented here</p>
          </div>
        </TabsContent>

        <TabsContent value="expenses" className="space-y-4">
          <div className="text-center text-muted-foreground py-8">
            <Calculator className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Detailed expense breakdown and categorization would be implemented here</p>
          </div>
        </TabsContent>

        <TabsContent value="forecasting" className="space-y-4">
          <div className="text-center text-muted-foreground py-8">
            <Target className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Financial forecasting and projection models would be implemented here</p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}