import { DashboardLayout } from "../components/layout/dashboard-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Badge } from "../components/ui/badge";
import { Progress } from "../components/ui/progress";
import { 
  Truck, 
  Plus, 
  Search, 
  Wrench,
  Calendar,
  AlertTriangle,
  CheckCircle,
  Clock,
  Fuel,
  MapPin
} from "lucide-react";

interface Equipment {
  id: string;
  name: string;
  type: 'truck' | 'paver' | 'roller' | 'tank' | 'trailer';
  status: 'operational' | 'maintenance' | 'repair' | 'offline';
  location: string;
  operator?: string;
  lastMaintenance: string;
  nextMaintenance: string;
  hours: number;
  fuelLevel: number;
}

const mockEquipment: Equipment[] = [
  {
    id: '1',
    name: 'Truck #1',
    type: 'truck',
    status: 'operational',
    location: 'Church Project Site',
    operator: 'John Mitchell',
    lastMaintenance: '2024-01-10',
    nextMaintenance: '2024-02-10',
    hours: 1247,
    fuelLevel: 85
  },
  {
    id: '2',
    name: 'Asphalt Paver AP-1',
    type: 'paver',
    status: 'operational',
    location: 'Shopping Center',
    operator: 'Sarah Chen',
    lastMaintenance: '2024-01-05',
    nextMaintenance: '2024-02-05',
    hours: 892,
    fuelLevel: 60
  },
  {
    id: '3',
    name: 'Roller R-1',
    type: 'roller',
    status: 'maintenance',
    location: 'Main Yard',
    lastMaintenance: '2024-01-20',
    nextMaintenance: '2024-01-25',
    hours: 1456,
    fuelLevel: 30
  },
  {
    id: '4',
    name: 'Sealcoat Tank T-1',
    type: 'tank',
    status: 'operational',
    location: 'Office Complex',
    operator: 'Mike Rodriguez',
    lastMaintenance: '2024-01-15',
    nextMaintenance: '2024-02-15',
    hours: 654,
    fuelLevel: 95
  }
];

const getStatusColor = (status: string) => {
  switch (status) {
    case 'operational': return 'bg-green-500';
    case 'maintenance': return 'bg-yellow-500';
    case 'repair': return 'bg-red-500';
    case 'offline': return 'bg-gray-500';
    default: return 'bg-gray-500';
  }
};

const getStatusText = (status: string) => {
  switch (status) {
    case 'operational': return 'Operational';
    case 'maintenance': return 'Maintenance';
    case 'repair': return 'Repair';
    case 'offline': return 'Offline';
    default: return 'Unknown';
  }
};

const getTypeIcon = (type: string) => {
  switch (type) {
    case 'truck': return Truck;
    case 'paver': return Wrench;
    case 'roller': return Truck;
    case 'tank': return Fuel;
    case 'trailer': return Truck;
    default: return Truck;
  }
};

const getFuelColor = (level: number) => {
  if (level > 70) return 'text-green-600';
  if (level > 30) return 'text-yellow-600';
  return 'text-red-600';
};

export default function Equipment() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Equipment Command</h1>
            <p className="text-muted-foreground">
              Monitor and manage all equipment and vehicles
            </p>
          </div>
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Add Equipment
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Equipment</CardTitle>
              <Truck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">12</div>
              <p className="text-xs text-muted-foreground">Vehicles & machinery</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Operational</CardTitle>
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">9</div>
              <p className="text-xs text-muted-foreground">Ready for deployment</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Maintenance Due</CardTitle>
              <Wrench className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">2</div>
              <p className="text-xs text-muted-foreground">Scheduled this week</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Utilization</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">78%</div>
              <p className="text-xs text-muted-foreground">Average daily usage</p>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filter */}
        <Card>
          <CardHeader>
            <CardTitle>Equipment Registry</CardTitle>
            <CardDescription>Real-time equipment status and management</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search equipment..."
                  className="pl-10"
                />
              </div>
              <Button variant="outline" className="gap-2">
                <Calendar className="h-4 w-4" />
                Schedule
              </Button>
            </div>

            {/* Equipment List */}
            <div className="space-y-4">
              {mockEquipment.map((item) => {
                const TypeIcon = getTypeIcon(item.type);
                return (
                  <div key={item.id} className="border rounded-lg p-4 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center">
                          <TypeIcon className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold">{item.name}</h3>
                            <div className={`w-2 h-2 rounded-full ${getStatusColor(item.status)}`}></div>
                            <Badge variant="outline">{getStatusText(item.status)}</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground capitalize">{item.type}</p>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <div className="text-lg font-semibold">
                          {item.hours.toLocaleString()} hrs
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Total runtime
                        </div>
                      </div>
                    </div>

                    <div className="grid gap-4 md:grid-cols-4">
                      <div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                          <MapPin className="h-3 w-3" />
                          Location
                        </div>
                        <div className="text-sm font-medium">{item.location}</div>
                      </div>
                      
                      <div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                          <Wrench className="h-3 w-3" />
                          Operator
                        </div>
                        <div className="text-sm">
                          {item.operator || 'Not assigned'}
                        </div>
                      </div>
                      
                      <div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                          <Calendar className="h-3 w-3" />
                          Next Maintenance
                        </div>
                        <div className="text-sm">
                          {new Date(item.nextMaintenance).toLocaleDateString()}
                        </div>
                      </div>

                      <div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                          <Fuel className="h-3 w-3" />
                          Fuel Level
                        </div>
                        <div className="flex items-center gap-2">
                          <Progress value={item.fuelLevel} className="flex-1 h-2" />
                          <span className={`text-sm font-medium ${getFuelColor(item.fuelLevel)}`}>
                            {item.fuelLevel}%
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t">
                      <div className="flex items-center gap-2">
                        {item.status === 'operational' && (
                          <>
                            <CheckCircle className="h-4 w-4 text-green-500" />
                            <span className="text-sm text-green-600">Ready for Operation</span>
                          </>
                        )}
                        {item.status === 'maintenance' && (
                          <>
                            <Clock className="h-4 w-4 text-yellow-500" />
                            <span className="text-sm text-yellow-600">Scheduled Maintenance</span>
                          </>
                        )}
                        {item.status === 'repair' && (
                          <>
                            <AlertTriangle className="h-4 w-4 text-red-500" />
                            <span className="text-sm text-red-600">Needs Repair</span>
                          </>
                        )}
                      </div>
                      
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" className="gap-1">
                          <MapPin className="h-3 w-3" />
                          Track
                        </Button>
                        <Button variant="outline" size="sm">
                          Maintenance
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}