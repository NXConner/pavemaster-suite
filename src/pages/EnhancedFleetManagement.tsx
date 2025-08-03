import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Progress } from '../components/ui/progress';
import { 
  Truck, 
  Fuel,
  Shield,
  AlertTriangle,
  CheckCircle,
  Wrench,
  Plus,
  DollarSign,
  Activity,
  TrendingUp
} from 'lucide-react';

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
  mileage: number;
  fuelLevel: number;
  lastMaintenance: string;
  nextMaintenance: string;
  maintenanceCost: number;
}

interface MaintenanceRecord {
  id: string;
  vehicleId: string;
  date: string;
  type: 'scheduled' | 'repair' | 'inspection' | 'emergency';
  description: string;
  cost: number;
  mileage: number;
  status: 'completed' | 'pending' | 'in-progress';
  technician: string;
  partsUsed: string[];
}

interface Inspection {
  id: string;
  vehicleId: string;
  type: 'DOT' | 'Annual' | 'Safety' | 'Emission';
  date: string;
  expirationDate: string;
  status: 'passed' | 'failed' | 'pending';
  inspector: string;
  notes: string;
}

const mockVehicles: Vehicle[] = [
  {
    id: 'V001',
    vehicleNumber: 'TRUCK-001',
    make: 'Ford',
    model: 'F-550',
    year: 2022,
    vin: '1FDGF5GY8NEA12345',
    licensePlate: 'VA-SEAL-01',
    type: 'truck',
    status: 'active',
    registration: {
      expirationDate: '2024-08-15',
      state: 'VA',
      registrationNumber: 'REG123456'
    },
    insurance: {
      provider: 'State Farm Commercial',
      policyNumber: 'SF-COM-789456',
      expirationDate: '2024-12-31',
      coverage: 'Full Coverage',
      deductible: 1000
    },
    mileage: 45230,
    fuelLevel: 75,
    lastMaintenance: '2024-01-05',
    nextMaintenance: '2024-04-05',
    maintenanceCost: 2450
  },
  {
    id: 'V002',
    vehicleNumber: 'TRUCK-002',
    make: 'Chevrolet',
    model: 'Silverado 3500HD',
    year: 2021,
    vin: '1GC4KYEY4MF123456',
    licensePlate: 'VA-SEAL-02',
    type: 'truck',
    status: 'maintenance',
    registration: {
      expirationDate: '2024-09-20',
      state: 'VA',
      registrationNumber: 'REG654321'
    },
    insurance: {
      provider: 'State Farm Commercial',
      policyNumber: 'SF-COM-789457',
      expirationDate: '2024-12-31',
      coverage: 'Full Coverage',
      deductible: 1000
    },
    mileage: 38750,
    fuelLevel: 45,
    lastMaintenance: '2024-01-15',
    nextMaintenance: '2024-02-15',
    maintenanceCost: 3200
  }
];

const mockMaintenanceRecords: MaintenanceRecord[] = [
  {
    id: 'MR001',
    vehicleId: 'V001',
    date: '2024-01-05',
    type: 'scheduled',
    description: 'Oil change, filter replacement, brake inspection',
    cost: 350,
    mileage: 45000,
    status: 'completed',
    technician: 'Mike Johnson',
    partsUsed: ['Oil Filter', 'Air Filter', 'Engine Oil']
  },
  {
    id: 'MR002',
    vehicleId: 'V002',
    date: '2024-01-15',
    type: 'repair',
    description: 'Brake pad replacement, rotor resurfacing',
    cost: 850,
    mileage: 38500,
    status: 'completed',
    technician: 'Sarah Davis',
    partsUsed: ['Brake Pads', 'Brake Rotors']
  }
];

const mockInspections: Inspection[] = [
  {
    id: 'INS001',
    vehicleId: 'V001',
    type: 'DOT',
    date: '2023-12-01',
    expirationDate: '2024-12-01',
    status: 'passed',
    inspector: 'VA DOT Inspector #123',
    notes: 'All systems operational'
  },
  {
    id: 'INS002',
    vehicleId: 'V002',
    type: 'Annual',
    date: '2023-11-15',
    expirationDate: '2024-11-15',
    status: 'passed',
    inspector: 'Certified Inspector',
    notes: 'Minor brake wear noted for future monitoring'
  }
];

export default function EnhancedFleetManagement() {
  const [activeTab, setActiveTab] = useState('overview');

  const vehicles = mockVehicles;
  const maintenanceRecords = mockMaintenanceRecords;
  const inspections = mockInspections;

  const getStatusColor = (status: Vehicle['status']) => {
    switch (status) {
      case 'active': return 'bg-green-500';
      case 'maintenance': return 'bg-yellow-500';
      case 'out-of-service': return 'bg-red-500';
      case 'retired': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusVariant = (status: Vehicle['status']) => {
    switch (status) {
      case 'active': return 'default';
      case 'maintenance': return 'secondary';
      case 'out-of-service': return 'destructive';
      case 'retired': return 'outline';
      default: return 'outline';
    }
  };

  const getDaysUntilExpiration = (expirationDate: string) => {
    const today = new Date();
    const expiry = new Date(expirationDate);
    const diffTime = expiry.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Enhanced Fleet Management</h1>
          <p className="text-muted-foreground">
            Comprehensive vehicle tracking, maintenance, and compliance management
          </p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Add Vehicle
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Fleet Overview</TabsTrigger>
          <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
          <TabsTrigger value="inspections">Inspections</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="checklists">Checklists</TabsTrigger>
        </TabsList>

        {/* Fleet Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* Summary Cards */}
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Vehicles</CardTitle>
                <Truck className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{vehicles.length}</div>
                <p className="text-xs text-muted-foreground">Active fleet size</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Vehicles</CardTitle>
                <CheckCircle className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {vehicles.filter(v => v.status === 'active').length}
                </div>
                <p className="text-xs text-muted-foreground">
                  {Math.round((vehicles.filter(v => v.status === 'active').length / vehicles.length) * 100)}% operational
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">In Maintenance</CardTitle>
                <Wrench className="h-4 w-4 text-yellow-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {vehicles.filter(v => v.status === 'maintenance').length}
                </div>
                <p className="text-xs text-muted-foreground">Vehicles under repair</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avg Fuel Level</CardTitle>
                <Fuel className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {Math.round(vehicles.reduce((acc, v) => acc + v.fuelLevel, 0) / vehicles.length)}%
                </div>
                <p className="text-xs text-muted-foreground">Fleet average</p>
              </CardContent>
            </Card>
          </div>

          {/* Vehicle List */}
          <Card>
            <CardHeader>
              <CardTitle>Vehicle Fleet</CardTitle>
              <CardDescription>Complete vehicle inventory and status</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {vehicles.map((vehicle) => (
                  <div key={vehicle.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className={`w-3 h-3 rounded-full ${getStatusColor(vehicle.status)}`} />
                      <div>
                        <h3 className="font-medium">{vehicle.vehicleNumber}</h3>
                        <p className="text-sm text-muted-foreground">
                          {vehicle.year} {vehicle.make} {vehicle.model}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-6">
                      <div className="text-center">
                        <p className="text-sm font-medium">{vehicle.mileage.toLocaleString()}</p>
                        <p className="text-xs text-muted-foreground">Miles</p>
                      </div>
                      
                      <div className="text-center">
                        <div className="flex items-center space-x-2">
                          <Progress value={vehicle.fuelLevel} className="w-20" />
                          <span className="text-sm">{vehicle.fuelLevel}%</span>
                        </div>
                        <p className="text-xs text-muted-foreground">Fuel</p>
                      </div>
                      
                      <Badge variant={getStatusVariant(vehicle.status)}>
                        {vehicle.status}
                      </Badge>
                      
                      <Button variant="outline" size="sm">
                        View Details
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Alerts */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-yellow-600" />
                Fleet Alerts
              </CardTitle>
              <CardDescription>Important notifications and upcoming deadlines</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {vehicles.map((vehicle) => {
                  const regDays = getDaysUntilExpiration(vehicle.registration.expirationDate);
                  const insDays = getDaysUntilExpiration(vehicle.insurance.expirationDate);
                  
                  return (
                    <div key={vehicle.id}>
                      {regDays <= 30 && (
                        <div className="flex items-center gap-3 p-3 bg-yellow-50 dark:bg-yellow-950 rounded-lg">
                          <AlertTriangle className="h-4 w-4 text-yellow-600" />
                          <div>
                            <p className="font-medium">{vehicle.vehicleNumber} Registration Expiring</p>
                            <p className="text-sm text-muted-foreground">
                              Expires in {regDays} days ({vehicle.registration.expirationDate})
                            </p>
                          </div>
                        </div>
                      )}
                      {insDays <= 30 && (
                        <div className="flex items-center gap-3 p-3 bg-red-50 dark:bg-red-950 rounded-lg">
                          <Shield className="h-4 w-4 text-red-600" />
                          <div>
                            <p className="font-medium">{vehicle.vehicleNumber} Insurance Expiring</p>
                            <p className="text-sm text-muted-foreground">
                              Expires in {insDays} days ({vehicle.insurance.expirationDate})
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Maintenance Tab */}
        <TabsContent value="maintenance" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Recent Maintenance</CardTitle>
                <CardDescription>Latest maintenance activities and costs</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {maintenanceRecords.map((record) => (
                    <div key={record.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <h4 className="font-medium">{record.description}</h4>
                        <p className="text-sm text-muted-foreground">
                          {record.date} - {record.technician}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">${record.cost}</p>
                        <Badge variant={record.status === 'completed' ? 'default' : 'secondary'}>
                          {record.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Maintenance Schedule</CardTitle>
                <CardDescription>Upcoming scheduled maintenance</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {vehicles.map((vehicle) => (
                    <div key={vehicle.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <h4 className="font-medium">{vehicle.vehicleNumber}</h4>
                        <p className="text-sm text-muted-foreground">
                          Next service: {vehicle.nextMaintenance}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm">
                          {Math.round((new Date(vehicle.nextMaintenance).getTime() - Date.now()) / (1000 * 60 * 60 * 24))} days
                        </p>
                        <Button variant="outline" size="sm">
                          Schedule
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Inspections Tab */}
        <TabsContent value="inspections" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Vehicle Inspections</CardTitle>
              <CardDescription>DOT inspections, annual inspections, and compliance tracking</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {inspections.map((inspection) => (
                  <div key={inspection.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h4 className="font-medium">{inspection.type} Inspection</h4>
                      <p className="text-sm text-muted-foreground">
                        Vehicle: {vehicles.find(v => v.id === inspection.vehicleId)?.vehicleNumber}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Inspector: {inspection.inspector}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm">Expires: {inspection.expirationDate}</p>
                      <Badge variant={inspection.status === 'passed' ? 'default' : 'destructive'}>
                        {inspection.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Documents Tab */}
        <TabsContent value="documents" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Fleet Documents</CardTitle>
              <CardDescription>Registration, insurance, and certification documents</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                {vehicles.map((vehicle) => (
                  <div key={vehicle.id} className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-3">{vehicle.vehicleNumber}</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Registration</span>
                        <div className="text-right">
                          <p className="text-sm">{vehicle.registration.registrationNumber}</p>
                          <p className="text-xs text-muted-foreground">
                            Expires: {vehicle.registration.expirationDate}
                          </p>
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Insurance</span>
                        <div className="text-right">
                          <p className="text-sm">{vehicle.insurance.policyNumber}</p>
                          <p className="text-xs text-muted-foreground">
                            {vehicle.insurance.provider}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Cost Analysis
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Total Maintenance Cost</span>
                    <span className="font-medium">
                      ${vehicles.reduce((acc, v) => acc + v.maintenanceCost, 0).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Average per Vehicle</span>
                    <span className="font-medium">
                      ${Math.round(vehicles.reduce((acc, v) => acc + v.maintenanceCost, 0) / vehicles.length).toLocaleString()}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Utilization
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Fleet Utilization</span>
                    <span className="font-medium">
                      {Math.round((vehicles.filter(v => v.status === 'active').length / vehicles.length) * 100)}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Average Mileage</span>
                    <span className="font-medium">
                      {Math.round(vehicles.reduce((acc, v) => acc + v.mileage, 0) / vehicles.length).toLocaleString()}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Performance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Downtime Rate</span>
                    <span className="font-medium">
                      {Math.round((vehicles.filter(v => v.status !== 'active').length / vehicles.length) * 100)}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Fuel Efficiency</span>
                    <span className="font-medium">Good</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Checklists Tab */}
        <TabsContent value="checklists" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Maintenance Checklists</CardTitle>
              <CardDescription>Customizable inspection procedures and required tools</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium mb-2">Daily Vehicle Inspection</h4>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>☐ Check fluid levels</div>
                    <div>☐ Inspect tires and wheels</div>
                    <div>☐ Test lights and signals</div>
                    <div>☐ Check brakes</div>
                    <div>☐ Inspect safety equipment</div>
                    <div>☐ Check mirrors and visibility</div>
                  </div>
                </div>
                
                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium mb-2">Weekly Maintenance Check</h4>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>☐ Engine oil level and condition</div>
                    <div>☐ Coolant level and condition</div>
                    <div>☐ Battery terminals and charge</div>
                    <div>☐ Belt tension and condition</div>
                    <div>☐ Hydraulic fluid levels</div>
                    <div>☐ Air filter inspection</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}