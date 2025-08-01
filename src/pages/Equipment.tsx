import { DashboardLayout } from '../components/layout/dashboard-layout';
import { DashboardCard } from '../components/ui/dashboard-card';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { 
  Plus, 
  Wrench, 
  Calendar, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Settings,
  MapPin,
  Fuel,
  Activity
} from 'lucide-react';

// Mock equipment data
const equipment = [
  {
    id: 1,
    name: 'Caterpillar Paver AP1055F',
    type: 'Asphalt Paver',
    status: 'active',
    location: 'Main St Project',
    operator: 'John Davis',
    hoursUsed: 1250,
    lastMaintenance: '2024-07-15',
    nextMaintenance: '2024-08-15',
    fuelLevel: 85,
    condition: 'excellent'
  },
  {
    id: 2,
    name: 'Volvo Roller DD120C',
    type: 'Compactor',
    status: 'maintenance',
    location: 'Shop',
    operator: null,
    hoursUsed: 890,
    lastMaintenance: '2024-07-30',
    nextMaintenance: '2024-08-05',
    fuelLevel: 45,
    condition: 'good'
  },
  {
    id: 3,
    name: 'SealMaster M26 Sprayer',
    type: 'Sealcoat Sprayer',
    status: 'available',
    location: 'Yard',
    operator: null,
    hoursUsed: 420,
    lastMaintenance: '2024-07-20',
    nextMaintenance: '2024-08-20',
    fuelLevel: 100,
    condition: 'excellent'
  },
  {
    id: 4,
    name: 'Bobcat Skid Loader S770',
    type: 'Skid Steer',
    status: 'active',
    location: 'Church Project',
    operator: 'Mike Wilson',
    hoursUsed: 680,
    lastMaintenance: '2024-07-10',
    nextMaintenance: '2024-08-10',
    fuelLevel: 65,
    condition: 'good'
  },
  {
    id: 5,
    name: 'Ford F-550 Dump Truck',
    type: 'Dump Truck',
    status: 'out-of-service',
    location: 'Shop',
    operator: null,
    hoursUsed: 1850,
    lastMaintenance: '2024-07-25',
    nextMaintenance: '2024-08-01',
    fuelLevel: 20,
    condition: 'fair'
  },
  {
    id: 6,
    name: 'Wirtgen W50DC Milling Machine',
    type: 'Cold Milling',
    status: 'available',
    location: 'Yard',
    operator: null,
    hoursUsed: 1120,
    lastMaintenance: '2024-07-18',
    nextMaintenance: '2024-08-18',
    fuelLevel: 90,
    condition: 'excellent'
  }
];

const getStatusColor = (status: string) => {
  switch (status) {
    case 'active': return 'bg-success text-success-foreground';
    case 'available': return 'bg-primary text-primary-foreground';
    case 'maintenance': return 'bg-warning text-warning-foreground';
    case 'out-of-service': return 'bg-destructive text-destructive-foreground';
    default: return 'bg-muted text-muted-foreground';
  }
};

const getConditionColor = (condition: string) => {
  switch (condition) {
    case 'excellent': return 'text-success';
    case 'good': return 'text-primary';
    case 'fair': return 'text-warning';
    case 'poor': return 'text-destructive';
    default: return 'text-muted-foreground';
  }
};

const getFuelLevelColor = (level: number) => {
  if (level >= 70) return 'text-success';
  if (level >= 30) return 'text-warning';
  return 'text-destructive';
};

export default function Equipment() {
  const activeEquipment = equipment.filter(e => e.status === 'active').length;
  const availableEquipment = equipment.filter(e => e.status === 'available').length;
  const maintenanceEquipment = equipment.filter(e => e.status === 'maintenance').length;
  const outOfServiceEquipment = equipment.filter(e => e.status === 'out-of-service').length;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Equipment Management</h1>
            <p className="text-muted-foreground">
              Monitor and manage your paving equipment fleet
            </p>
          </div>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Equipment
          </Button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <DashboardCard
            title="Total Equipment"
            value={equipment.length.toString()}
            description="All equipment units"
            icon={<Wrench className="h-4 w-4" />}
          />
          <DashboardCard
            title="Active"
            value={activeEquipment.toString()}
            description="Currently deployed"
            trend={{ value: 15, isPositive: true, label: 'utilization rate' }}
            icon={<Activity className="h-4 w-4" />}
          />
          <DashboardCard
            title="Available"
            value={availableEquipment.toString()}
            description="Ready for deployment"
            icon={<CheckCircle className="h-4 w-4" />}
          />
          <DashboardCard
            title="Maintenance"
            value={`${maintenanceEquipment + outOfServiceEquipment}`}
            description="Needs attention"
            trend={{ value: 10, isPositive: false, label: 'downtime' }}
            icon={<AlertTriangle className="h-4 w-4" />}
          />
        </div>

        {/* Equipment Grid */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Equipment Fleet</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
            {equipment.map((item) => (
              <Card key={item.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{item.name}</CardTitle>
                      <p className="text-sm text-muted-foreground">{item.type}</p>
                    </div>
                    <div className={`px-2 py-1 rounded-full text-xs ${getStatusColor(item.status)}`}>
                      {item.status.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Equipment Details */}
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span className="truncate">{item.location}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span>{item.hoursUsed}h</span>
                    </div>
                    {item.operator && (
                      <div className="col-span-2 flex items-center gap-2">
                        <Activity className="h-4 w-4 text-muted-foreground" />
                        <span>Operator: {item.operator}</span>
                      </div>
                    )}
                  </div>

                  {/* Condition & Fuel */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Condition</span>
                      <span className={`text-sm font-medium ${getConditionColor(item.condition)}`}>
                        {item.condition.charAt(0).toUpperCase() + item.condition.slice(1)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm flex items-center gap-1">
                        <Fuel className="h-3 w-3" />
                        Fuel Level
                      </span>
                      <span className={`text-sm font-medium ${getFuelLevelColor(item.fuelLevel)}`}>
                        {item.fuelLevel}%
                      </span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full transition-all ${
                          item.fuelLevel >= 70 ? 'bg-success' : 
                          item.fuelLevel >= 30 ? 'bg-warning' : 'bg-destructive'
                        }`}
                        style={{ width: `${item.fuelLevel}%` }}
                      />
                    </div>
                  </div>

                  {/* Maintenance */}
                  <div className="p-3 bg-muted/50 rounded">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium flex items-center gap-1">
                        <Settings className="h-3 w-3" />
                        Maintenance
                      </span>
                      <Calendar className="h-3 w-3 text-muted-foreground" />
                    </div>
                    <div className="text-xs space-y-1">
                      <div className="flex justify-between">
                        <span>Last:</span>
                        <span>{new Date(item.lastMaintenance).toLocaleDateString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Next:</span>
                        <span className={
                          new Date(item.nextMaintenance) < new Date() ? 'text-destructive font-medium' : ''
                        }>
                          {new Date(item.nextMaintenance).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="flex-1">
                      View Details
                    </Button>
                    <Button variant="outline" size="sm">
                      <Settings className="h-3 w-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}