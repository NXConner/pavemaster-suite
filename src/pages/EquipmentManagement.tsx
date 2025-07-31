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
  Wrench,
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  Calendar,
  AlertTriangle,
  CheckCircle,
  Clock,
  DollarSign,
  TrendingUp,
  Settings,
  FileText,
  MapPin,
  Fuel,
  Activity,
  BarChart3,
  Wrench as Tool,
  Truck,
  Gauge,
  Zap
} from 'lucide-react';

interface Equipment {
  id: string;
  name: string;
  type: 'paver' | 'roller' | 'truck' | 'loader' | 'excavator' | 'compactor' | 'other';
  model: string;
  manufacturer: string;
  serialNumber: string;
  year: number;
  purchaseDate: string;
  purchaseCost: number;
  currentValue: number;
  status: 'active' | 'maintenance' | 'out_of_service' | 'retired';
  location: string;
  assignedTo?: string;
  currentProject?: string;
  specifications: {
    engineHours: number;
    maxHours: number;
    fuelCapacity: number;
    weight: number;
    dimensions: string;
  };
  maintenance: {
    lastService: string;
    nextService: string;
    serviceInterval: number; // hours
    alerts: Array<{
      type: 'overdue' | 'upcoming' | 'critical';
      message: string;
      dueDate: string;
    }>;
  };
  utilization: {
    hoursThisMonth: number;
    hoursLastMonth: number;
    utilizationRate: number; // percentage
    fuelConsumption: number; // gallons per hour
  };
  costs: {
    maintenanceCosts: number;
    fuelCosts: number;
    operatingCosts: number;
    totalCosts: number;
  };
}

interface MaintenanceRecord {
  id: string;
  equipmentId: string;
  type: 'preventive' | 'corrective' | 'emergency';
  description: string;
  performedBy: string;
  date: string;
  engineHours: number;
  cost: number;
  partsUsed: string[];
  nextServiceDue: string;
  status: 'completed' | 'pending' | 'in_progress';
}

export default function EquipmentManagementPage() {
  const { toast } = useToast();
  
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [filteredEquipment, setFilteredEquipment] = useState<Equipment[]>([]);
  const [maintenanceRecords, setMaintenanceRecords] = useState<MaintenanceRecord[]>([]);
  const [selectedEquipment, setSelectedEquipment] = useState<Equipment | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isMaintenanceDialogOpen, setIsMaintenanceDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  const [newEquipment, setNewEquipment] = useState({
    name: '',
    type: 'paver' as Equipment['type'],
    model: '',
    manufacturer: '',
    serialNumber: '',
    year: new Date().getFullYear(),
    purchaseCost: 0,
    fuelCapacity: 0,
    weight: 0,
    dimensions: ''
  });

  const [newMaintenance, setNewMaintenance] = useState({
    equipmentId: '',
    type: 'preventive' as MaintenanceRecord['type'],
    description: '',
    cost: 0,
    partsUsed: [] as string[],
    newPart: ''
  });

  useEffect(() => {
    loadEquipment();
    loadMaintenanceRecords();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [equipment, searchTerm, statusFilter, typeFilter]);

  const loadEquipment = async () => {
    // Mock data - in real implementation, fetch from Supabase
    const mockEquipment: Equipment[] = [
      {
        id: '1',
        name: 'Caterpillar AP655F',
        type: 'paver',
        model: 'AP655F',
        manufacturer: 'Caterpillar',
        serialNumber: 'CAT123456',
        year: 2020,
        purchaseDate: '2020-03-15',
        purchaseCost: 485000,
        currentValue: 380000,
        status: 'active',
        location: 'First Baptist Church Site',
        assignedTo: 'John Smith',
        currentProject: 'First Baptist Church Parking Lot',
        specifications: {
          engineHours: 2850,
          maxHours: 10000,
          fuelCapacity: 150,
          weight: 33000,
          dimensions: '32ft x 10ft x 12ft'
        },
        maintenance: {
          lastService: '2024-01-15',
          nextService: '2024-03-15',
          serviceInterval: 250,
          alerts: [
            {
              type: 'upcoming',
              message: 'Scheduled maintenance due in 15 engine hours',
              dueDate: '2024-03-15'
            }
          ]
        },
        utilization: {
          hoursThisMonth: 168,
          hoursLastMonth: 185,
          utilizationRate: 85,
          fuelConsumption: 8.5
        },
        costs: {
          maintenanceCosts: 12500,
          fuelCosts: 18750,
          operatingCosts: 31250,
          totalCosts: 62500
        }
      },
      {
        id: '2',
        name: 'Volvo DD140HF',
        type: 'roller',
        model: 'DD140HF',
        manufacturer: 'Volvo',
        serialNumber: 'VOL789012',
        year: 2019,
        purchaseDate: '2019-08-20',
        purchaseCost: 285000,
        currentValue: 210000,
        status: 'maintenance',
        location: 'Service Center',
        assignedTo: 'Mike Johnson',
        specifications: {
          engineHours: 3920,
          maxHours: 12000,
          fuelCapacity: 120,
          weight: 28500,
          dimensions: '18ft x 8ft x 10ft'
        },
        maintenance: {
          lastService: '2024-02-01',
          nextService: '2024-02-10',
          serviceInterval: 200,
          alerts: [
            {
              type: 'critical',
              message: 'Hydraulic system requires immediate attention',
              dueDate: '2024-02-10'
            },
            {
              type: 'overdue',
              message: 'Oil change overdue by 50 hours',
              dueDate: '2024-01-30'
            }
          ]
        },
        utilization: {
          hoursThisMonth: 120,
          hoursLastMonth: 160,
          utilizationRate: 65,
          fuelConsumption: 6.8
        },
        costs: {
          maintenanceCosts: 8500,
          fuelCosts: 12200,
          operatingCosts: 20700,
          totalCosts: 41400
        }
      },
      {
        id: '3',
        name: 'Ford F-550 Dump Truck',
        type: 'truck',
        model: 'F-550',
        manufacturer: 'Ford',
        serialNumber: 'FOR345678',
        year: 2021,
        purchaseDate: '2021-05-10',
        purchaseCost: 95000,
        currentValue: 75000,
        status: 'active',
        location: 'Material Yard',
        assignedTo: 'Sarah Davis',
        currentProject: 'Grace Methodist Sealcoating',
        specifications: {
          engineHours: 1850,
          maxHours: 8000,
          fuelCapacity: 40,
          weight: 19500,
          dimensions: '22ft x 8ft x 9ft'
        },
        maintenance: {
          lastService: '2024-01-20',
          nextService: '2024-04-20',
          serviceInterval: 500,
          alerts: []
        },
        utilization: {
          hoursThisMonth: 145,
          hoursLastMonth: 172,
          utilizationRate: 78,
          fuelConsumption: 12.5
        },
        costs: {
          maintenanceCosts: 4200,
          fuelCosts: 15600,
          operatingCosts: 19800,
          totalCosts: 39600
        }
      }
    ];
    setEquipment(mockEquipment);
  };

  const loadMaintenanceRecords = async () => {
    // Mock maintenance data
    const mockMaintenance: MaintenanceRecord[] = [
      {
        id: '1',
        equipmentId: '1',
        type: 'preventive',
        description: 'Regular 250-hour service including oil change, filter replacement, and system inspection',
        performedBy: 'Mike Johnson',
        date: '2024-01-15',
        engineHours: 2600,
        cost: 1850,
        partsUsed: ['Engine Oil', 'Oil Filter', 'Air Filter', 'Hydraulic Fluid'],
        nextServiceDue: '2024-03-15',
        status: 'completed'
      },
      {
        id: '2',
        equipmentId: '2',
        type: 'corrective',
        description: 'Hydraulic pump replacement due to pressure loss',
        performedBy: 'Service Center',
        date: '2024-02-01',
        engineHours: 3900,
        cost: 4200,
        partsUsed: ['Hydraulic Pump', 'Seals Kit', 'Hydraulic Hoses'],
        nextServiceDue: '2024-04-01',
        status: 'in_progress'
      }
    ];
    setMaintenanceRecords(mockMaintenance);
  };

  const applyFilters = () => {
    let filtered = equipment;

    if (searchTerm) {
      filtered = filtered.filter(eq =>
        eq.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        eq.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
        eq.manufacturer.toLowerCase().includes(searchTerm.toLowerCase()) ||
        eq.serialNumber.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(eq => eq.status === statusFilter);
    }

    if (typeFilter !== 'all') {
      filtered = filtered.filter(eq => eq.type === typeFilter);
    }

    setFilteredEquipment(filtered);
  };

  const createEquipment = async () => {
    const eq: Equipment = {
      id: Date.now().toString(),
      name: newEquipment.name,
      type: newEquipment.type,
      model: newEquipment.model,
      manufacturer: newEquipment.manufacturer,
      serialNumber: newEquipment.serialNumber,
      year: newEquipment.year,
      purchaseDate: new Date().toISOString().split('T')[0],
      purchaseCost: newEquipment.purchaseCost,
      currentValue: newEquipment.purchaseCost * 0.8, // Assume 20% depreciation
      status: 'active',
      location: 'Equipment Yard',
      specifications: {
        engineHours: 0,
        maxHours: 10000,
        fuelCapacity: newEquipment.fuelCapacity,
        weight: newEquipment.weight,
        dimensions: newEquipment.dimensions
      },
      maintenance: {
        lastService: '',
        nextService: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 90 days
        serviceInterval: 250,
        alerts: []
      },
      utilization: {
        hoursThisMonth: 0,
        hoursLastMonth: 0,
        utilizationRate: 0,
        fuelConsumption: 0
      },
      costs: {
        maintenanceCosts: 0,
        fuelCosts: 0,
        operatingCosts: 0,
        totalCosts: 0
      }
    };

    setEquipment(prev => [...prev, eq]);
    setIsCreateDialogOpen(false);
    
    // Reset form
    setNewEquipment({
      name: '',
      type: 'paver',
      model: '',
      manufacturer: '',
      serialNumber: '',
      year: new Date().getFullYear(),
      purchaseCost: 0,
      fuelCapacity: 0,
      weight: 0,
      dimensions: ''
    });

    toast({
      title: "Equipment Added",
      description: `${eq.name} has been added to the fleet`,
    });
  };

  const deleteEquipment = (equipmentId: string) => {
    setEquipment(prev => prev.filter(eq => eq.id !== equipmentId));
    toast({
      title: "Equipment Removed",
      description: "Equipment has been removed from the fleet",
    });
  };

  const addMaintenancePart = () => {
    if (newMaintenance.newPart.trim() && !newMaintenance.partsUsed.includes(newMaintenance.newPart.trim())) {
      setNewMaintenance(prev => ({
        ...prev,
        partsUsed: [...prev.partsUsed, prev.newPart.trim()],
        newPart: ''
      }));
    }
  };

  const removeMaintenancePart = (part: string) => {
    setNewMaintenance(prev => ({
      ...prev,
      partsUsed: prev.partsUsed.filter(p => p !== part)
    }));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-100';
      case 'maintenance': return 'text-yellow-600 bg-yellow-100';
      case 'out_of_service': return 'text-red-600 bg-red-100';
      case 'retired': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getAlertColor = (type: string) => {
    switch (type) {
      case 'critical': return 'text-red-600';
      case 'overdue': return 'text-red-600';
      case 'upcoming': return 'text-yellow-600';
      default: return 'text-gray-600';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'paver': return <Tool className="h-5 w-5" />;
      case 'roller': return <Gauge className="h-5 w-5" />;
      case 'truck': return <Truck className="h-5 w-5" />;
      case 'loader': return <Wrench className="h-5 w-5" />;
      case 'excavator': return <Settings className="h-5 w-5" />;
      case 'compactor': return <Activity className="h-5 w-5" />;
      default: return <Wrench className="h-5 w-5" />;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const calculateDepreciation = (purchaseCost: number, purchaseDate: string) => {
    const years = (new Date().getTime() - new Date(purchaseDate).getTime()) / (1000 * 60 * 60 * 24 * 365);
    const depreciationRate = 0.15; // 15% per year
    return Math.max(purchaseCost * (1 - depreciationRate * years), purchaseCost * 0.1);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Wrench className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-3xl font-bold text-foreground">Equipment Management</h1>
              <p className="text-muted-foreground">
                Track assets, schedule maintenance, and monitor utilization
              </p>
            </div>
          </div>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Equipment
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Add New Equipment</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Equipment Name</label>
                    <Input
                      value={newEquipment.name}
                      onChange={(e) => setNewEquipment(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Enter equipment name"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Type</label>
                    <Select value={newEquipment.type} onValueChange={(value: any) => 
                      setNewEquipment(prev => ({ ...prev, type: value }))
                    }>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="paver">Paver</SelectItem>
                        <SelectItem value="roller">Roller</SelectItem>
                        <SelectItem value="truck">Truck</SelectItem>
                        <SelectItem value="loader">Loader</SelectItem>
                        <SelectItem value="excavator">Excavator</SelectItem>
                        <SelectItem value="compactor">Compactor</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="text-sm font-medium">Manufacturer</label>
                    <Input
                      value={newEquipment.manufacturer}
                      onChange={(e) => setNewEquipment(prev => ({ ...prev, manufacturer: e.target.value }))}
                      placeholder="Enter manufacturer"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Model</label>
                    <Input
                      value={newEquipment.model}
                      onChange={(e) => setNewEquipment(prev => ({ ...prev, model: e.target.value }))}
                      placeholder="Enter model"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Year</label>
                    <Input
                      type="number"
                      value={newEquipment.year}
                      onChange={(e) => setNewEquipment(prev => ({ ...prev, year: Number(e.target.value) }))}
                      placeholder="2024"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Serial Number</label>
                    <Input
                      value={newEquipment.serialNumber}
                      onChange={(e) => setNewEquipment(prev => ({ ...prev, serialNumber: e.target.value }))}
                      placeholder="Enter serial number"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Purchase Cost</label>
                    <Input
                      type="number"
                      value={newEquipment.purchaseCost}
                      onChange={(e) => setNewEquipment(prev => ({ ...prev, purchaseCost: Number(e.target.value) }))}
                      placeholder="0"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="text-sm font-medium">Fuel Capacity (gal)</label>
                    <Input
                      type="number"
                      value={newEquipment.fuelCapacity}
                      onChange={(e) => setNewEquipment(prev => ({ ...prev, fuelCapacity: Number(e.target.value) }))}
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Weight (lbs)</label>
                    <Input
                      type="number"
                      value={newEquipment.weight}
                      onChange={(e) => setNewEquipment(prev => ({ ...prev, weight: Number(e.target.value) }))}
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Dimensions</label>
                    <Input
                      value={newEquipment.dimensions}
                      onChange={(e) => setNewEquipment(prev => ({ ...prev, dimensions: e.target.value }))}
                      placeholder="L x W x H"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={createEquipment}>
                    Add Equipment
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-4 flex-wrap">
              <div className="flex-1 min-w-[200px]">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search equipment..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="maintenance">Maintenance</SelectItem>
                  <SelectItem value="out_of_service">Out of Service</SelectItem>
                  <SelectItem value="retired">Retired</SelectItem>
                </SelectContent>
              </Select>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="paver">Paver</SelectItem>
                  <SelectItem value="roller">Roller</SelectItem>
                  <SelectItem value="truck">Truck</SelectItem>
                  <SelectItem value="loader">Loader</SelectItem>
                  <SelectItem value="excavator">Excavator</SelectItem>
                  <SelectItem value="compactor">Compactor</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Fleet Stats */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Wrench className="h-5 w-5 text-blue-500" />
                <div>
                  <div className="text-2xl font-bold">
                    {equipment.filter(e => e.status === 'active').length}
                  </div>
                  <div className="text-sm text-muted-foreground">Active Equipment</div>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-yellow-500" />
                <div>
                  <div className="text-2xl font-bold">
                    {equipment.filter(e => e.maintenance.alerts.length > 0).length}
                  </div>
                  <div className="text-sm text-muted-foreground">Needs Attention</div>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-green-500" />
                <div>
                  <div className="text-2xl font-bold">
                    {equipment.reduce((sum, e) => sum + e.utilization.hoursThisMonth, 0)}
                  </div>
                  <div className="text-sm text-muted-foreground">Hours This Month</div>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-purple-500" />
                <div>
                  <div className="text-2xl font-bold">
                    {Math.round(equipment.reduce((sum, e) => sum + e.utilization.utilizationRate, 0) / equipment.length)}%
                  </div>
                  <div className="text-sm text-muted-foreground">Avg Utilization</div>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-primary" />
                <div>
                  <div className="text-2xl font-bold">
                    {formatCurrency(equipment.reduce((sum, e) => sum + e.costs.totalCosts, 0))}
                  </div>
                  <div className="text-sm text-muted-foreground">Total Operating Costs</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Fleet Overview</TabsTrigger>
            <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
            <TabsTrigger value="utilization">Utilization</TabsTrigger>
            <TabsTrigger value="costs">Cost Analysis</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Equipment Cards */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredEquipment.map((eq) => (
                <Card key={eq.id} className="cursor-pointer hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          {getTypeIcon(eq.type)}
                          <div>
                            <h3 className="font-semibold text-lg">{eq.name}</h3>
                            <p className="text-sm text-muted-foreground">
                              {eq.manufacturer} {eq.model} ({eq.year})
                            </p>
                          </div>
                        </div>
                        <Badge className={getStatusColor(eq.status)}>
                          {eq.status.replace('_', ' ')}
                        </Badge>
                      </div>
                      
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2">
                          <MapPin className="h-3 w-3 text-muted-foreground" />
                          <span>{eq.location}</span>
                        </div>
                        {eq.assignedTo && (
                          <div className="flex items-center gap-2">
                            <Settings className="h-3 w-3 text-muted-foreground" />
                            <span>Assigned to {eq.assignedTo}</span>
                          </div>
                        )}
                        {eq.currentProject && (
                          <div className="flex items-center gap-2">
                            <FileText className="h-3 w-3 text-muted-foreground" />
                            <span className="truncate">{eq.currentProject}</span>
                          </div>
                        )}
                      </div>

                      {/* Engine Hours Progress */}
                      <div className="space-y-2">
                        <div className="flex justify-between items-center text-sm">
                          <span>Engine Hours</span>
                          <span>{eq.specifications.engineHours.toLocaleString()} / {eq.specifications.maxHours.toLocaleString()}</span>
                        </div>
                        <Progress 
                          value={(eq.specifications.engineHours / eq.specifications.maxHours) * 100} 
                          className="h-2" 
                        />
                      </div>

                      {/* Utilization */}
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <div className="text-muted-foreground">Utilization</div>
                          <div className="font-medium">{eq.utilization.utilizationRate}%</div>
                        </div>
                        <div>
                          <div className="text-muted-foreground">Hours/Month</div>
                          <div className="font-medium">{eq.utilization.hoursThisMonth}</div>
                        </div>
                      </div>

                      {/* Alerts */}
                      {eq.maintenance.alerts.length > 0 && (
                        <div className="space-y-1">
                          {eq.maintenance.alerts.slice(0, 2).map((alert, index) => (
                            <div key={index} className={`flex items-center gap-2 text-xs ${getAlertColor(alert.type)}`}>
                              <AlertTriangle className="h-3 w-3" />
                              <span className="truncate">{alert.message}</span>
                            </div>
                          ))}
                          {eq.maintenance.alerts.length > 2 && (
                            <div className="text-xs text-muted-foreground">
                              +{eq.maintenance.alerts.length - 2} more alerts
                            </div>
                          )}
                        </div>
                      )}

                      <div className="flex gap-2 pt-2">
                        <Button variant="outline" size="sm" className="flex-1">
                          <Edit className="h-3 w-3 mr-1" />
                          Edit
                        </Button>
                        <Button variant="outline" size="sm">
                          <Calendar className="h-3 w-3" />
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => deleteEquipment(eq.id)}>
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="maintenance" className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Maintenance Schedule</h3>
              <Dialog open={isMaintenanceDialogOpen} onOpenChange={setIsMaintenanceDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Schedule Maintenance
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Schedule Maintenance</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium">Equipment</label>
                      <Select value={newMaintenance.equipmentId} onValueChange={(value) => 
                        setNewMaintenance(prev => ({ ...prev, equipmentId: value }))
                      }>
                        <SelectTrigger>
                          <SelectValue placeholder="Select equipment" />
                        </SelectTrigger>
                        <SelectContent>
                          {equipment.map((eq) => (
                            <SelectItem key={eq.id} value={eq.id}>{eq.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium">Type</label>
                      <Select value={newMaintenance.type} onValueChange={(value: any) => 
                        setNewMaintenance(prev => ({ ...prev, type: value }))
                      }>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="preventive">Preventive</SelectItem>
                          <SelectItem value="corrective">Corrective</SelectItem>
                          <SelectItem value="emergency">Emergency</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="text-sm font-medium">Description</label>
                      <Input
                        value={newMaintenance.description}
                        onChange={(e) => setNewMaintenance(prev => ({ ...prev, description: e.target.value }))}
                        placeholder="Describe the maintenance work"
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium">Estimated Cost</label>
                      <Input
                        type="number"
                        value={newMaintenance.cost}
                        onChange={(e) => setNewMaintenance(prev => ({ ...prev, cost: Number(e.target.value) }))}
                        placeholder="0.00"
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium">Parts</label>
                      <div className="flex gap-2">
                        <Input
                          value={newMaintenance.newPart}
                          onChange={(e) => setNewMaintenance(prev => ({ ...prev, newPart: e.target.value }))}
                          placeholder="Add part..."
                          onKeyPress={(e) => e.key === 'Enter' && addMaintenancePart()}
                        />
                        <Button type="button" onClick={addMaintenancePart} size="sm">
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {newMaintenance.partsUsed.map((part) => (
                          <Badge key={part} variant="secondary" className="cursor-pointer" onClick={() => removeMaintenancePart(part)}>
                            {part} ×
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div className="flex justify-end gap-2">
                      <Button variant="outline" onClick={() => setIsMaintenanceDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button>
                        Schedule
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            <div className="grid gap-4">
              {equipment.map((eq) => (
                <Card key={eq.id}>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>{eq.name}</span>
                      <div className="flex items-center gap-2">
                        {eq.maintenance.alerts.map((alert, index) => (
                          <Badge key={index} variant="outline" className={getAlertColor(alert.type)}>
                            {alert.type}
                          </Badge>
                        ))}
                      </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <div className="text-muted-foreground">Last Service</div>
                        <div className="font-medium">
                          {eq.maintenance.lastService ? new Date(eq.maintenance.lastService).toLocaleDateString() : 'Never'}
                        </div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Next Service</div>
                        <div className="font-medium">
                          {new Date(eq.maintenance.nextService).toLocaleDateString()}
                        </div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Service Interval</div>
                        <div className="font-medium">{eq.maintenance.serviceInterval} hours</div>
                      </div>
                    </div>
                    
                    {eq.maintenance.alerts.length > 0 && (
                      <div className="space-y-2">
                        <div className="text-sm font-medium">Alerts</div>
                        {eq.maintenance.alerts.map((alert, index) => (
                          <div key={index} className={`flex items-center gap-2 p-2 rounded-md border ${
                            alert.type === 'critical' ? 'border-red-200 bg-red-50' :
                            alert.type === 'overdue' ? 'border-red-200 bg-red-50' :
                            'border-yellow-200 bg-yellow-50'
                          }`}>
                            <AlertTriangle className={`h-4 w-4 ${getAlertColor(alert.type)}`} />
                            <div className="flex-1">
                              <div className="text-sm font-medium">{alert.message}</div>
                              <div className="text-xs text-muted-foreground">
                                Due: {new Date(alert.dueDate).toLocaleDateString()}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="utilization" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              {equipment.map((eq) => (
                <Card key={eq.id}>
                  <CardHeader>
                    <CardTitle>{eq.name}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Utilization Rate</span>
                        <span className="font-medium">{eq.utilization.utilizationRate}%</span>
                      </div>
                      <Progress value={eq.utilization.utilizationRate} className="h-3" />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <div className="text-muted-foreground">This Month</div>
                        <div className="font-medium">{eq.utilization.hoursThisMonth} hrs</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Last Month</div>
                        <div className="font-medium">{eq.utilization.hoursLastMonth} hrs</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Fuel Consumption</div>
                        <div className="font-medium">{eq.utilization.fuelConsumption} gal/hr</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Engine Hours</div>
                        <div className="font-medium">{eq.specifications.engineHours.toLocaleString()}</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="costs" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              {equipment.map((eq) => (
                <Card key={eq.id}>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>{eq.name}</span>
                      <span className="text-lg font-bold">{formatCurrency(eq.costs.totalCosts)}</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Maintenance</span>
                        <span className="font-medium">{formatCurrency(eq.costs.maintenanceCosts)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Fuel</span>
                        <span className="font-medium">{formatCurrency(eq.costs.fuelCosts)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Operating</span>
                        <span className="font-medium">{formatCurrency(eq.costs.operatingCosts)}</span>
                      </div>
                    </div>
                    
                    <div className="pt-2 border-t">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <div className="text-muted-foreground">Purchase Cost</div>
                          <div className="font-medium">{formatCurrency(eq.purchaseCost)}</div>
                        </div>
                        <div>
                          <div className="text-muted-foreground">Current Value</div>
                          <div className="font-medium">{formatCurrency(eq.currentValue)}</div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>

        {filteredEquipment.length === 0 && (
          <Card>
            <CardContent className="text-center py-12">
              <Wrench className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Equipment Found</h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm || statusFilter !== 'all' || typeFilter !== 'all'
                  ? 'No equipment matches your current filters'
                  : 'Add your first piece of equipment to get started'
                }
              </p>
              {(!searchTerm && statusFilter === 'all' && typeFilter === 'all') && (
                <Button onClick={() => setIsCreateDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Equipment
                </Button>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}