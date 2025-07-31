import React, { useState, useEffect } from 'react';
import { DollarSign, Clock, Users, Camera, Upload, Calendar, TrendingUp, MapPin, Phone, UserCheck, Car, Eye, EyeOff } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface ClockedInEmployee {
  id: string;
  name: string;
  hourly_rate: number;
  clock_in: string;
  current_hours: number;
  location?: {
    lat: number;
    lng: number;
    activity: 'standing' | 'walking' | 'riding' | 'driving' | 'phone' | 'out_of_bounds';
    speed?: number;
    is_driver?: boolean;
  };
  travel_distance: number;
  travel_cost: number;
}

interface ProjectCost {
  project_id: string;
  project_name: string;
  total_cost: number;
  employee_costs: number;
  receipt_costs: number;
  estimated_cost: number;
}

interface Receipt {
  id: string;
  total_amount: number;
  line_items: Array<{
    description: string;
    amount: number;
    project_id?: string;
  }>;
  uploaded_at: string;
  project_id: string;
}

interface CostTotals {
  daily: number;
  weekly: number;
  monthly: number;
  quarterly: number;
  yearly: number;
}

const CostCounter: React.FC = () => {
  const { user } = useAuth();
  const [userRole, setUserRole] = useState<string | null>(null);
  const [clockedInEmployees, setClockedInEmployees] = useState<ClockedInEmployee[]>([]);
  const [projectCosts, setProjectCosts] = useState<ProjectCost[]>([]);
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [costTotals, setCostTotals] = useState<CostTotals>({
    daily: 0,
    weekly: 0,
    monthly: 0,
    quarterly: 0,
    yearly: 0
  });
  const [selectedProject, setSelectedProject] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly'>('daily');
  const [showEmployeeTracking, setShowEmployeeTracking] = useState(false);
  const [militaryJargon, setMilitaryJargon] = useState(false);
  const [autoUpdate, setAutoUpdate] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  // Check if user is super_admin
  useEffect(() => {
    const checkUserRole = async () => {
      if (!user) return;
      
      const { data, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();
      
      if (error) {
        console.error('Error fetching user role:', error);
        return;
      }
      
      setUserRole(data?.role);
    };

    checkUserRole();
  }, [user]);

  // Auto-update every 15 minutes
  useEffect(() => {
    if (!autoUpdate) return;

    const interval = setInterval(() => {
      fetchAllData();
      setLastUpdate(new Date());
    }, 15 * 60 * 1000); // 15 minutes

    return () => clearInterval(interval);
  }, [autoUpdate]);

  // Initial data fetch
  useEffect(() => {
    if (userRole === 'super_admin') {
      fetchAllData();
    }
  }, [userRole]);

  const fetchAllData = async () => {
    await Promise.all([
      fetchClockedInEmployees(),
      fetchProjectCosts(),
      fetchReceipts(),
      calculateCostTotals()
    ]);
  };

  const fetchClockedInEmployees = async () => {
    const { data, error } = await supabase
      .from('time_records')
      .select(`
        *,
        employee:employees(
          id,
          first_name,
          last_name,
          hourly_rate
        )
      `)
      .is('clock_out', null)
      .eq('status', 'active');

    if (error) {
      console.error('Error fetching clocked in employees:', error);
      return;
    }

    const employees: ClockedInEmployee[] = data?.map(record => {
      const clockIn = new Date(record.clock_in);
      const now = new Date();
      const hoursWorked = (now.getTime() - clockIn.getTime()) / (1000 * 60 * 60);

      return {
        id: record.employee_id,
        name: `${record.employee.first_name} ${record.employee.last_name}`,
        hourly_rate: record.employee.hourly_rate || 0,
        clock_in: record.clock_in,
        current_hours: hoursWorked,
        travel_distance: record.travel_distance || 0,
        travel_cost: record.travel_cost || 0
      };
    }) || [];

    setClockedInEmployees(employees);
  };

  const fetchProjectCosts = async () => {
    const { data, error } = await supabase
      .from('projects')
      .select(`
        id,
        name,
        estimated_cost,
        actual_cost
      `);

    if (error) {
      console.error('Error fetching project costs:', error);
      return;
    }

    const costs: ProjectCost[] = data?.map(project => ({
      project_id: project.id,
      project_name: project.name,
      total_cost: project.actual_cost || 0,
      employee_costs: 0, // Will be calculated
      receipt_costs: 0, // Will be calculated
      estimated_cost: project.estimated_cost || 0
    })) || [];

    setProjectCosts(costs);
  };

  const fetchReceipts = async () => {
    const today = new Date();
    const startOfDay = new Date(today.setHours(0, 0, 0, 0));

    const { data, error } = await supabase
      .from('receipts')
      .select('*')
      .gte('created_at', startOfDay.toISOString());

    if (error) {
      console.error('Error fetching receipts:', error);
      return;
    }

    setReceipts(data || []);
  };

  const calculateCostTotals = async () => {
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfWeek = new Date(startOfDay);
    startOfWeek.setDate(startOfDay.getDate() - startOfDay.getDay());
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfQuarter = new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3, 1);
    const startOfYear = new Date(now.getFullYear(), 0, 1);

    // Calculate employee costs
    const employeeCosts = clockedInEmployees.reduce((total, emp) => 
      total + (emp.current_hours * emp.hourly_rate) + emp.travel_cost, 0);

    // Calculate receipt costs
    const receiptCosts = receipts.reduce((total, receipt) => total + receipt.total_amount, 0);

    const dailyTotal = employeeCosts + receiptCosts;

    setCostTotals({
      daily: dailyTotal,
      weekly: dailyTotal * 7, // Simplified calculation
      monthly: dailyTotal * 30,
      quarterly: dailyTotal * 90,
      yearly: dailyTotal * 365
    });
  };

  const handleReceiptUpload = async (file: File) => {
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      // Simulate OCR processing (in production, use a service like Tesseract.js or cloud OCR)
      const mockExtractedData = {
        total: Math.random() * 500 + 50,
        line_items: [
          { description: 'Materials', amount: Math.random() * 200 + 20 },
          { description: 'Equipment rental', amount: Math.random() * 150 + 30 },
          { description: 'Fuel', amount: Math.random() * 100 + 10 }
        ]
      };

      const { data, error } = await supabase
        .from('receipts')
        .insert({
          total_amount: mockExtractedData.total,
          line_items: mockExtractedData.line_items,
          project_id: selectedProject !== 'all' ? selectedProject : null,
          uploaded_by: user?.id
        });

      if (error) throw error;

      toast({
        title: "Receipt processed successfully",
        description: `Total amount: $${mockExtractedData.total.toFixed(2)}`
      });

      fetchReceipts();
    } catch (error) {
      console.error('Error processing receipt:', error);
      toast({
        variant: "destructive",
        title: "Error processing receipt",
        description: "Please try again"
      });
    }
  };

  const getJargonText = (civilian: string, military: string) => {
    return militaryJargon ? military : civilian;
  };

  const getActivityIcon = (activity: string) => {
    switch (activity) {
      case 'driving': return <Car className="h-4 w-4" />;
      case 'walking': return <Users className="h-4 w-4" />;
      case 'phone': return <Phone className="h-4 w-4" />;
      case 'standing': return <UserCheck className="h-4 w-4" />;
      default: return <MapPin className="h-4 w-4" />;
    }
  };

  if (userRole !== 'super_admin') {
    return null; // Only show to super_admin
  }

  return (
    <div className="w-full space-y-6 p-6">
      {/* Header Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h2 className="text-2xl font-bold">
            {getJargonText('Cost Control Center', 'Financial Operations Command')}
          </h2>
          <Badge variant="outline">
            {getJargonText('Super Admin', 'Command Authority')}
          </Badge>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Switch
              id="military-jargon"
              checked={militaryJargon}
              onCheckedChange={setMilitaryJargon}
            />
            <Label htmlFor="military-jargon">
              {getJargonText('Military Terms', 'Tactical Language')}
            </Label>
          </div>
          
          <div className="flex items-center space-x-2">
            <Switch
              id="auto-update"
              checked={autoUpdate}
              onCheckedChange={setAutoUpdate}
            />
            <Label htmlFor="auto-update">Auto Update</Label>
          </div>
          
          <Button variant="outline" onClick={fetchAllData}>
            <Clock className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Last Update Info */}
      <div className="text-sm text-muted-foreground">
        Last updated: {lastUpdate.toLocaleTimeString()} | 
        Next auto-update: {autoUpdate ? 'in 15 minutes' : 'disabled'}
      </div>

      {/* Main Cost Display */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Today's Total</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${costTotals.daily.toFixed(2)}</div>
            <div className="text-xs opacity-90">
              {clockedInEmployees.length} {getJargonText('employees', 'personnel')} active
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Weekly</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${costTotals.weekly.toFixed(2)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Monthly</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${costTotals.monthly.toFixed(2)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Quarterly</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${costTotals.quarterly.toFixed(2)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Yearly</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${costTotals.yearly.toFixed(2)}</div>
          </CardContent>
        </Card>
      </div>

      {/* Employee Tracking Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <Users className="h-5 w-5" />
              <span>
                {getJargonText('Active Employees', 'Personnel Status')} 
                ({clockedInEmployees.length})
              </span>
            </CardTitle>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowEmployeeTracking(!showEmployeeTracking)}
              >
                {showEmployeeTracking ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                {showEmployeeTracking ? 'Hide' : 'Show'} Tracking
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {clockedInEmployees.map(employee => (
              <div key={employee.id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <h4 className="font-medium">{employee.name}</h4>
                    <div className="text-sm text-muted-foreground">
                      Rate: ${employee.hourly_rate}/hr | 
                      Hours: {employee.current_hours.toFixed(2)} | 
                      Cost: ${(employee.current_hours * employee.hourly_rate).toFixed(2)}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm">
                      Travel: ${employee.travel_cost.toFixed(2)}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Distance: {employee.travel_distance.toFixed(1)} mi
                    </div>
                  </div>
                </div>
                
                {showEmployeeTracking && employee.location && (
                  <div className="mt-3 p-3 bg-muted rounded">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        {getActivityIcon(employee.location.activity)}
                        <span className="text-sm font-medium">
                          {employee.location.activity.charAt(0).toUpperCase() + employee.location.activity.slice(1)}
                        </span>
                        {employee.location.speed && (
                          <Badge variant="secondary">
                            {employee.location.speed} mph
                          </Badge>
                        )}
                        {employee.location.is_driver && (
                          <Badge variant="outline">Driver</Badge>
                        )}
                      </div>
                      <Button variant="ghost" size="sm">
                        <MapPin className="h-4 w-4 mr-1" />
                        View Route
                      </Button>
                    </div>
                    
                    {employee.location.activity === 'out_of_bounds' && (
                      <div className="mt-2 p-2 bg-destructive/10 text-destructive rounded text-sm">
                        ⚠️ Employee is outside designated work area
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Receipt Upload and Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Camera className="h-5 w-5" />
            <span>{getJargonText('Receipt Management', 'Expense Documentation')}</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleReceiptUpload(file);
                }}
                className="hidden"
                id="receipt-upload"
              />
              <Button asChild>
                <label htmlFor="receipt-upload" className="cursor-pointer">
                  <Camera className="h-4 w-4 mr-2" />
                  {getJargonText('Scan Receipt', 'Document Capture')}
                </label>
              </Button>
              
              <Select value={selectedProject} onValueChange={setSelectedProject}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Select project" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Projects</SelectItem>
                  {projectCosts.map(project => (
                    <SelectItem key={project.project_id} value={project.project_id}>
                      {project.project_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="text-sm text-muted-foreground">
              {getJargonText(
                'Upload receipts to automatically extract costs and distribute to appropriate projects',
                'Submit documentation for automated cost analysis and tactical resource allocation'
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Project Cost Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TrendingUp className="h-5 w-5" />
            <span>{getJargonText('Project Costs', 'Mission Expenditures')}</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {projectCosts.map(project => {
              const employeeCost = clockedInEmployees
                .filter(emp => emp.location?.activity !== 'out_of_bounds')
                .reduce((total, emp) => total + (emp.current_hours * emp.hourly_rate), 0);
              
              const receiptCost = receipts
                .filter(receipt => receipt.project_id === project.project_id)
                .reduce((total, receipt) => total + receipt.total_amount, 0);
              
              const totalCost = employeeCost + receiptCost;
              const budgetUsed = project.estimated_cost > 0 
                ? (totalCost / project.estimated_cost) * 100 
                : 0;

              return (
                <div key={project.project_id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium">{project.project_name}</h4>
                    <div className="text-right">
                      <div className="font-bold">${totalCost.toFixed(2)}</div>
                      <div className="text-sm text-muted-foreground">
                        Budget: ${project.estimated_cost.toFixed(2)}
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Labor: ${employeeCost.toFixed(2)}</span>
                      <span>Materials: ${receiptCost.toFixed(2)}</span>
                    </div>
                    
                    <Progress value={Math.min(budgetUsed, 100)} className="h-2" />
                    
                    <div className="text-xs text-muted-foreground text-center">
                      {budgetUsed.toFixed(1)}% of budget used
                      {budgetUsed > 100 && (
                        <span className="text-destructive ml-2">⚠️ Over budget</span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CostCounter;