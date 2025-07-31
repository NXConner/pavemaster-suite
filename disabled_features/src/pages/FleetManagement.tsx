import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import {
  Truck,
  Car,
  Wrench,
  Calendar,
  FileText,
  AlertTriangle,
  CheckCircle,
  Clock,
  DollarSign,
  MapPin,
  Fuel,
  Shield,
  Download,
  Upload,
  Plus,
  Edit,
  Trash2,
  Eye,
  Search,
  Filter,
  RefreshCw,
  Building,
  User,
  Phone,
  Mail,
  BookOpen,
  ClipboardList,
  Settings,
  TrendingUp,
  BarChart3,
  Activity
} from 'lucide-react';

// Types
interface Vehicle {
  id: string;
  vehicleNumber: string;
  make: string;
  model: string;
  year: number;
  vin: string;
  licensePlate: string;
  type: 'truck' | 'trailer' | 'equipment' | 'personal';
  status: 'active' | 'maintenance' | 'out-of-service' | 'retired';
  mileage: number;
  fuelType: string;
  registration: {
    expirationDate: string;
    state: string;
    registrationNumber: string;
  };
  insurance: {
    provider: string;
    policyNumber: string;
    expirationDate: string;
    coverage: string;
    deductible: number;
  };
  assignedTo?: string;
  purchaseDate: string;
  purchasePrice: number;
  currentValue: number;
  location: string;
  notes: string;
}

interface MaintenanceRecord {
  id: string;
  vehicleId: string;
  type: 'scheduled' | 'repair' | 'inspection' | 'emergency';
  description: string;
  date: string;
  mileage: number;
  cost: number;
  technician: string;
  parts: MaintenancePart[];
  laborHours: number;
  status: 'completed' | 'in-progress' | 'scheduled' | 'cancelled';
  nextServiceDate?: string;
  nextServiceMileage?: number;
  documents: string[];
  notes: string;
}

interface MaintenancePart {
  id: string;
  name: string;
  partNumber: string;
  quantity: number;
  cost: number;
  supplier: string;
}

interface MaintenanceChecklist {
  id: string;
  name: string;
  vehicleType: string;
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'annual';
  items: ChecklistItem[];
  estimatedTime: number;
  requiredTools: string[];
}

interface ChecklistItem {
  id: string;
  description: string;
  critical: boolean;
  category: 'engine' | 'brakes' | 'tires' | 'lights' | 'safety' | 'fluid' | 'electrical' | 'body';
  instructions: string;
  acceptableValues?: string;
}

interface Inspection {
  id: string;
  vehicleId: string;
  type: 'dot' | 'annual' | 'pre-trip' | 'post-trip' | 'safety';
  date: string;
  inspector: string;
  status: 'passed' | 'failed' | 'conditional';
  checklist: InspectionItem[];
  issues: string[];
  nextInspectionDate: string;
  certificateNumber?: string;
  documents: string[];
}

interface InspectionItem {
  id: string;
  item: string;
  status: 'pass' | 'fail' | 'na';
  notes?: string;
}

interface FleetDocument {
  id: string;
  vehicleId?: string;
  type: 'manual' | 'warranty' | 'insurance' | 'registration' | 'inspection' | 'maintenance' | 'parts' | 'other';
  name: string;
  description: string;
  fileName: string;
  fileSize: number;
  uploadDate: string;
  expirationDate?: string;
  tags: string[];
}

export default function FleetManagement() {
  const { toast } = useToast();
  
  // State management
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [maintenanceRecords, setMaintenanceRecords] = useState<MaintenanceRecord[]>([]);
  const [checklists, setChecklists] = useState<MaintenanceChecklist[]>([]);
  const [inspections, setInspections] = useState<Inspection[]>([]);
  const [documents, setDocuments] = useState<FleetDocument[]>([]);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [activeTab, setActiveTab] = useState('fleet');
  const [isVehicleDialogOpen, setIsVehicleDialogOpen] = useState(false);
  const [isMaintenanceDialogOpen, setIsMaintenanceDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Load initial data
  useEffect(() => {
    loadFleetData();
  }, []);

  const loadFleetData = () => {
    // Mock data - in production, this would come from API
    setVehicles([
      {
        id: '1',
        vehicleNumber: 'FL-001',
        make: 'Ford',
        model: 'F-350',
        year: 2022,
        vin: '1FT8W3BT6NEC12345',
        licensePlate: 'VA-ABC-123',
        type: 'truck',
        status: 'active',
        mileage: 45320,
        fuelType: 'Diesel',
        registration: {
          expirationDate: '2024-12-15',
          state: 'Virginia',
          registrationNumber: 'REG123456'
        },
        insurance: {
          provider: 'Commercial Fleet Insurance',
          policyNumber: 'POL789456',
          expirationDate: '2024-06-30',
          coverage: 'Comprehensive',
          deductible: 1000
        },
        assignedTo: 'John Smith',
        purchaseDate: '2022-01-15',
        purchasePrice: 65000,
        currentValue: 52000,
        location: 'Main Yard',
        notes: 'Primary paving truck with hydraulic lift'
      },
      {
        id: '2',
        vehicleNumber: 'FL-002',
        make: 'International',
        model: 'DuraStar',
        year: 2021,
        vin: '1HTMMAAL7MH123456',
        licensePlate: 'VA-DEF-456',
        type: 'truck',
        status: 'maintenance',
        mileage: 67890,
        fuelType: 'Diesel',
        registration: {
          expirationDate: '2024-11-20',
          state: 'Virginia',
          registrationNumber: 'REG789123'
        },
        insurance: {
          provider: 'Commercial Fleet Insurance',
          policyNumber: 'POL789457',
          expirationDate: '2024-06-30',
          coverage: 'Comprehensive',
          deductible: 1000
        },
        assignedTo: 'Mike Johnson',
        purchaseDate: '2021-03-10',
        purchasePrice: 78000,
        currentValue: 58000,
        location: 'Maintenance Shop',
        notes: 'In for brake service and oil change'
      }
    ]);

    setMaintenanceRecords([
      {
        id: '1',
        vehicleId: '1',
        type: 'scheduled',
        description: 'Routine oil change and filter replacement',
        date: '2024-01-15',
        mileage: 45000,
        cost: 250.50,
        technician: 'Bob Wilson',
        parts: [
          { id: '1', name: 'Engine Oil', partNumber: 'OIL-15W40', quantity: 12, cost: 120, supplier: 'Fleet Parts Supply' },
          { id: '2', name: 'Oil Filter', partNumber: 'FILTER-123', quantity: 1, cost: 25.50, supplier: 'Fleet Parts Supply' }
        ],
        laborHours: 2,
        status: 'completed',
        nextServiceDate: '2024-04-15',
        nextServiceMileage: 50000,
        documents: ['service-receipt-001.pdf'],
        notes: 'All fluids checked and topped off'
      }
    ]);

    setChecklists([
      {
        id: '1',
        name: 'Daily Pre-Trip Inspection',
        vehicleType: 'truck',
        frequency: 'daily',
        estimatedTime: 15,
        requiredTools: ['Flashlight', 'Tire Gauge', 'Dipstick'],
        items: [
          {
            id: '1',
            description: 'Check engine oil level',
            critical: true,
            category: 'engine',
            instructions: 'Use dipstick to check oil level between min/max marks',
            acceptableValues: 'Between MIN and MAX marks'
          },
          {
            id: '2',
            description: 'Inspect tire condition and pressure',
            critical: true,
            category: 'tires',
            instructions: 'Check for wear, damage, and proper inflation',
            acceptableValues: '80-100 PSI'
          },
          {
            id: '3',
            description: 'Test all lights and signals',
            critical: true,
            category: 'lights',
            instructions: 'Turn on headlights, taillights, turn signals, and hazards',
            acceptableValues: 'All lights functioning'
          },
          {
            id: '4',
            description: 'Check brake fluid level',
            critical: true,
            category: 'brakes',
            instructions: 'Inspect brake fluid reservoir level',
            acceptableValues: 'Above minimum line'
          },
          {
            id: '5',
            description: 'Inspect safety equipment',
            critical: true,
            category: 'safety',
            instructions: 'Verify fire extinguisher, first aid kit, and emergency triangles',
            acceptableValues: 'All items present and accessible'
          }
        ]
      }
    ]);

    setInspections([
      {
        id: '1',
        vehicleId: '1',
        type: 'annual',
        date: '2024-01-10',
        inspector: 'Certified Inspector #12345',
        status: 'passed',
        checklist: [
          { id: '1', item: 'Brakes', status: 'pass', notes: 'Good condition' },
          { id: '2', item: 'Tires', status: 'pass', notes: '70% tread remaining' },
          { id: '3', item: 'Lights', status: 'pass' },
          { id: '4', item: 'Steering', status: 'pass' }
        ],
        issues: [],
        nextInspectionDate: '2025-01-10',
        certificateNumber: 'CERT2024-001',
        documents: ['inspection-certificate-001.pdf']
      }
    ]);

    setDocuments([
      {
        id: '1',
        vehicleId: '1',
        type: 'manual',
        name: 'Owner\'s Manual - Ford F-350',
        description: 'Complete owner\'s manual and maintenance guide',
        fileName: 'ford-f350-manual.pdf',
        fileSize: 15600000,
        uploadDate: '2024-01-01',
        tags: ['manual', 'ford', 'maintenance']
      },
      {
        id: '2',
        vehicleId: '1',
        type: 'warranty',
        name: 'Vehicle Warranty Information',
        description: 'Warranty terms and coverage details',
        fileName: 'warranty-info.pdf',
        fileSize: 850000,
        uploadDate: '2024-01-01',
        expirationDate: '2025-01-15',
        tags: ['warranty', 'coverage']
      }
    ]);
  };

  const filteredVehicles = vehicles.filter(vehicle => {
    const matchesSearch = vehicle.vehicleNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         vehicle.make.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         vehicle.model.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || vehicle.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500';
      case 'maintenance': return 'bg-yellow-500';
      case 'out-of-service': return 'bg-red-500';
      case 'retired': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  const VehicleCard = ({ vehicle }: { vehicle: Vehicle }) => (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-md bg-blue-100">
              {vehicle.type === 'truck' ? (
                <Truck className="h-6 w-6 text-blue-600" />
              ) : (
                <Car className="h-6 w-6 text-blue-600" />
              )}
            </div>
            <div>
              <CardTitle className="text-lg">{vehicle.vehicleNumber}</CardTitle>
              <p className="text-sm text-muted-foreground">
                {vehicle.year} {vehicle.make} {vehicle.model}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${getStatusColor(vehicle.status)}`} />
            <Badge variant="outline">{vehicle.status}</Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="font-medium">License:</span> {vehicle.licensePlate}
          </div>
          <div>
            <span className="font-medium">Mileage:</span> {vehicle.mileage.toLocaleString()}
          </div>
          <div>
            <span className="font-medium">Assigned:</span> {vehicle.assignedTo || 'Unassigned'}
          </div>
          <div>
            <span className="font-medium">Location:</span> {vehicle.location}
          </div>
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span>Registration Expires:</span>
            <span className={
              new Date(vehicle.registration.expirationDate) < new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
                ? 'text-red-600 font-medium' 
                : 'text-green-600'
            }>
              {new Date(vehicle.registration.expirationDate).toLocaleDateString()}
            </span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span>Insurance Expires:</span>
            <span className={
              new Date(vehicle.insurance.expirationDate) < new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
                ? 'text-red-600 font-medium' 
                : 'text-green-600'
            }>
              {new Date(vehicle.insurance.expirationDate).toLocaleDateString()}
            </span>
          </div>
        </div>
        
        <div className="flex gap-2 pt-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => setSelectedVehicle(vehicle)}
          >
            <Eye className="h-3 w-3 mr-1" />
            View Details
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setIsMaintenanceDialogOpen(true)}
          >
            <Wrench className="h-3 w-3 mr-1" />
            Maintenance
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  const MaintenanceChecklistCard = ({ checklist }: { checklist: MaintenanceChecklist }) => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ClipboardList className="h-5 w-5" />
          {checklist.name}
        </CardTitle>
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <span>Frequency: {checklist.frequency}</span>
          <span>Time: {checklist.estimatedTime} minutes</span>
          <span>Items: {checklist.items.length}</span>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div>
            <h4 className="font-medium text-sm mb-2">Required Tools:</h4>
            <div className="flex flex-wrap gap-1">
              {checklist.requiredTools.map((tool, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {tool}
                </Badge>
              ))}
            </div>
          </div>
          
          <div>
            <h4 className="font-medium text-sm mb-2">Critical Items:</h4>
            <div className="space-y-1">
              {checklist.items.filter(item => item.critical).map((item) => (
                <div key={item.id} className="flex items-center gap-2 text-sm">
                  <AlertTriangle className="h-3 w-3 text-red-500" />
                  <span>{item.description}</span>
                </div>
              ))}
            </div>
          </div>
          
          <Button className="w-full" size="sm">
            Start Inspection
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Truck className="h-8 w-8 text-blue-600" />
            Fleet Management
          </h1>
          <p className="text-muted-foreground mt-1">
            Comprehensive vehicle and equipment tracking system
          </p>
        </div>
        <Button onClick={() => setIsVehicleDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Vehicle
        </Button>
      </div>

      {/* Fleet Overview Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Vehicles</CardTitle>
            <Truck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{vehicles.length}</div>
            <div className="text-xs text-muted-foreground">
              +2 from last month
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Vehicles</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {vehicles.filter(v => v.status === 'active').length}
            </div>
            <div className="text-xs text-muted-foreground">
              {((vehicles.filter(v => v.status === 'active').length / vehicles.length) * 100).toFixed(1)}% of fleet
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Maintenance</CardTitle>
            <Wrench className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {vehicles.filter(v => v.status === 'maintenance').length}
            </div>
            <div className="text-xs text-muted-foreground">
              Scheduled for completion
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Fleet Value</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${vehicles.reduce((sum, v) => sum + v.currentValue, 0).toLocaleString()}
            </div>
            <div className="text-xs text-muted-foreground">
              Current market value
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="fleet">Fleet Overview</TabsTrigger>
          <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
          <TabsTrigger value="inspections">Inspections</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="checklists">Checklists</TabsTrigger>
        </TabsList>

        <TabsContent value="fleet" className="space-y-6">
          {/* Search and Filter */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex gap-4">
                <div className="flex-1">
                  <Input
                    placeholder="Search vehicles..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full"
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="maintenance">Maintenance</SelectItem>
                    <SelectItem value="out-of-service">Out of Service</SelectItem>
                    <SelectItem value="retired">Retired</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Vehicle Grid */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredVehicles.map((vehicle) => (
              <VehicleCard key={vehicle.id} vehicle={vehicle} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="maintenance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wrench className="h-5 w-5" />
                Maintenance Records
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {maintenanceRecords.map((record) => (
                  <Card key={record.id} className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h4 className="font-medium">{record.description}</h4>
                        <p className="text-sm text-muted-foreground">
                          Vehicle: {vehicles.find(v => v.id === record.vehicleId)?.vehicleNumber} | 
                          Date: {new Date(record.date).toLocaleDateString()} | 
                          Mileage: {record.mileage.toLocaleString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <Badge variant={record.status === 'completed' ? 'default' : 'secondary'}>
                          {record.status}
                        </Badge>
                        <p className="text-lg font-bold text-green-600 mt-1">
                          ${record.cost.toFixed(2)}
                        </p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium">Technician:</span> {record.technician}
                      </div>
                      <div>
                        <span className="font-medium">Labor Hours:</span> {record.laborHours}
                      </div>
                      <div>
                        <span className="font-medium">Parts Cost:</span> 
                        ${record.parts.reduce((sum, part) => sum + part.cost, 0).toFixed(2)}
                      </div>
                      <div>
                        <span className="font-medium">Type:</span> {record.type}
                      </div>
                    </div>

                    {record.parts.length > 0 && (
                      <div className="mt-3">
                        <h5 className="font-medium text-sm mb-2">Parts Used:</h5>
                        <div className="space-y-1">
                          {record.parts.map((part) => (
                            <div key={part.id} className="flex justify-between text-sm">
                              <span>{part.name} (#{part.partNumber}) x{part.quantity}</span>
                              <span>${part.cost.toFixed(2)}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="inspections" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ClipboardList className="h-5 w-5" />
                Vehicle Inspections
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {inspections.map((inspection) => (
                  <Card key={inspection.id} className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h4 className="font-medium">
                          {inspection.type.toUpperCase()} Inspection
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          Vehicle: {vehicles.find(v => v.id === inspection.vehicleId)?.vehicleNumber} | 
                          Date: {new Date(inspection.date).toLocaleDateString()} | 
                          Inspector: {inspection.inspector}
                        </p>
                      </div>
                      <div className="text-right">
                        <Badge variant={
                          inspection.status === 'passed' ? 'default' : 
                          inspection.status === 'failed' ? 'destructive' : 'secondary'
                        }>
                          {inspection.status}
                        </Badge>
                        {inspection.certificateNumber && (
                          <p className="text-sm text-muted-foreground mt-1">
                            Cert: {inspection.certificateNumber}
                          </p>
                        )}
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm mb-3">
                      <div>
                        <span className="font-medium">Next Inspection:</span> 
                        {new Date(inspection.nextInspectionDate).toLocaleDateString()}
                      </div>
                      <div>
                        <span className="font-medium">Items Checked:</span> {inspection.checklist.length}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <h5 className="font-medium text-sm">Inspection Results:</h5>
                      <div className="grid grid-cols-2 gap-2">
                        {inspection.checklist.map((item) => (
                          <div key={item.id} className="flex items-center gap-2 text-sm">
                            {item.status === 'pass' ? (
                              <CheckCircle className="h-3 w-3 text-green-500" />
                            ) : item.status === 'fail' ? (
                              <AlertTriangle className="h-3 w-3 text-red-500" />
                            ) : (
                              <Clock className="h-3 w-3 text-gray-400" />
                            )}
                            <span>{item.item}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {inspection.issues.length > 0 && (
                      <div className="mt-3 p-3 bg-red-50 rounded-md">
                        <h5 className="font-medium text-sm text-red-800 mb-2">Issues Found:</h5>
                        <ul className="text-sm text-red-700 list-disc list-inside">
                          {inspection.issues.map((issue, index) => (
                            <li key={index}>{issue}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="documents" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Fleet Documents
                </span>
                <Button size="sm">
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Document
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {documents.map((doc) => (
                  <Card key={doc.id} className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-md bg-blue-100">
                          <FileText className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <h4 className="font-medium">{doc.name}</h4>
                          <p className="text-sm text-muted-foreground">{doc.description}</p>
                          <div className="flex items-center gap-4 text-xs text-muted-foreground mt-1">
                            <span>Size: {(doc.fileSize / 1024 / 1024).toFixed(1)} MB</span>
                            <span>Uploaded: {new Date(doc.uploadDate).toLocaleDateString()}</span>
                            {doc.expirationDate && (
                              <span className={
                                new Date(doc.expirationDate) < new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
                                  ? 'text-red-600 font-medium' 
                                  : 'text-green-600'
                              }>
                                Expires: {new Date(doc.expirationDate).toLocaleDateString()}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{doc.type}</Badge>
                        <Button size="sm" variant="outline">
                          <Download className="h-3 w-3 mr-1" />
                          Download
                        </Button>
                      </div>
                    </div>
                    
                    {doc.tags.length > 0 && (
                      <div className="flex items-center gap-1 mt-3">
                        {doc.tags.map((tag, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Maintenance Costs
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span>This Month</span>
                    <span className="font-bold">$2,450</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Last Month</span>
                    <span className="font-bold">$1,890</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>YTD Average</span>
                    <span className="font-bold">$2,125</span>
                  </div>
                  <Progress value={75} className="mt-4" />
                  <p className="text-sm text-muted-foreground">
                    75% of annual maintenance budget used
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Fleet Utilization
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span>Active Vehicles</span>
                    <span className="font-bold">85%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Average Mileage</span>
                    <span className="font-bold">12,500/month</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Fuel Efficiency</span>
                    <span className="font-bold">8.2 MPG</span>
                  </div>
                  <Progress value={85} className="mt-4" />
                  <p className="text-sm text-muted-foreground">
                    Above industry average utilization
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="checklists" className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Maintenance Checklists</h3>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Checklist
            </Button>
          </div>
          
          <div className="grid gap-6 md:grid-cols-2">
            {checklists.map((checklist) => (
              <MaintenanceChecklistCard key={checklist.id} checklist={checklist} />
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Vehicle Details Dialog */}
      {selectedVehicle && (
        <Dialog open={!!selectedVehicle} onOpenChange={() => setSelectedVehicle(null)}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {selectedVehicle.vehicleNumber} - {selectedVehicle.year} {selectedVehicle.make} {selectedVehicle.model}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-semibold">Vehicle Information</h4>
                  <div className="space-y-2 text-sm">
                    <div className="grid grid-cols-2 gap-2">
                      <span className="font-medium">VIN:</span>
                      <span>{selectedVehicle.vin}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <span className="font-medium">License Plate:</span>
                      <span>{selectedVehicle.licensePlate}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <span className="font-medium">Mileage:</span>
                      <span>{selectedVehicle.mileage.toLocaleString()}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <span className="font-medium">Fuel Type:</span>
                      <span>{selectedVehicle.fuelType}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <span className="font-medium">Purchase Date:</span>
                      <span>{new Date(selectedVehicle.purchaseDate).toLocaleDateString()}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <span className="font-medium">Current Value:</span>
                      <span>${selectedVehicle.currentValue.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h4 className="font-semibold">Registration & Insurance</h4>
                  <div className="space-y-2 text-sm">
                    <div className="grid grid-cols-2 gap-2">
                      <span className="font-medium">Registration #:</span>
                      <span>{selectedVehicle.registration.registrationNumber}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <span className="font-medium">Registration Expires:</span>
                      <span className={
                        new Date(selectedVehicle.registration.expirationDate) < new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
                          ? 'text-red-600 font-medium' 
                          : 'text-green-600'
                      }>
                        {new Date(selectedVehicle.registration.expirationDate).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <span className="font-medium">Insurance Provider:</span>
                      <span>{selectedVehicle.insurance.provider}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <span className="font-medium">Policy #:</span>
                      <span>{selectedVehicle.insurance.policyNumber}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <span className="font-medium">Insurance Expires:</span>
                      <span className={
                        new Date(selectedVehicle.insurance.expirationDate) < new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
                          ? 'text-red-600 font-medium' 
                          : 'text-green-600'
                      }>
                        {new Date(selectedVehicle.insurance.expirationDate).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <span className="font-medium">Deductible:</span>
                      <span>${selectedVehicle.insurance.deductible}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              {selectedVehicle.notes && (
                <div>
                  <h4 className="font-semibold mb-2">Notes</h4>
                  <p className="text-sm text-muted-foreground">{selectedVehicle.notes}</p>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Add Vehicle Dialog */}
      <Dialog open={isVehicleDialogOpen} onOpenChange={setIsVehicleDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add New Vehicle</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="vehicleNumber">Vehicle Number</Label>
                <Input id="vehicleNumber" placeholder="FL-001" />
              </div>
              <div>
                <Label htmlFor="type">Vehicle Type</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="truck">Truck</SelectItem>
                    <SelectItem value="trailer">Trailer</SelectItem>
                    <SelectItem value="equipment">Equipment</SelectItem>
                    <SelectItem value="personal">Personal Vehicle</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="make">Make</Label>
                <Input id="make" placeholder="Ford" />
              </div>
              <div>
                <Label htmlFor="model">Model</Label>
                <Input id="model" placeholder="F-350" />
              </div>
              <div>
                <Label htmlFor="year">Year</Label>
                <Input id="year" type="number" placeholder="2024" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="vin">VIN</Label>
                <Input id="vin" placeholder="1FT8W3BT6NEC12345" />
              </div>
              <div>
                <Label htmlFor="licensePlate">License Plate</Label>
                <Input id="licensePlate" placeholder="VA-ABC-123" />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsVehicleDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={() => {
                toast({ title: "Success", description: "Vehicle added successfully" });
                setIsVehicleDialogOpen(false);
              }}>
                Add Vehicle
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}