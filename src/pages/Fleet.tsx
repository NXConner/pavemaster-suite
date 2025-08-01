import { DashboardLayout } from '../components/layout/dashboard-layout';
import { DashboardCard } from '../components/ui/dashboard-card';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { 
  Plus, 
  Truck, 
  MapPin, 
  Fuel, 
  Clock, 
  User,
  Navigation,
  AlertTriangle,
  CheckCircle,
  Activity,
  Calendar,
  Phone
} from 'lucide-react';

// Mock fleet data
const vehicles = [
  {
    id: 1,
    name: 'Truck 001',
    type: 'Dump Truck',
    make: 'Ford',
    model: 'F-550',
    year: 2022,
    license: 'VA-PAV-001',
    status: 'active',
    driver: 'John Davis',
    location: { lat: 37.5407, lng: -77.4360, address: 'Main St, Richmond VA' },
    speed: 35,
    fuelLevel: 75,
    mileage: 24580,
    lastService: '2024-07-15',
    nextService: '2024-08-15'
  },
  {
    id: 2,
    name: 'Equipment Trailer 001',
    type: 'Equipment Trailer',
    make: 'PJ Trailers',
    model: 'CC24',
    year: 2021,
    license: 'VA-EQP-001',
    status: 'active',
    driver: 'Mike Wilson',
    location: { lat: 37.5420, lng: -77.4380, address: 'Church St, Richmond VA' },
    speed: 0,
    fuelLevel: null,
    mileage: 18750,
    lastService: '2024-07-20',
    nextService: '2024-08-20'
  },
  {
    id: 3,
    name: 'Truck 002',
    type: 'Material Truck',
    make: 'Chevrolet',
    model: 'Silverado 3500',
    year: 2023,
    license: 'VA-PAV-002',
    status: 'maintenance',
    driver: null,
    location: { lat: 37.5350, lng: -77.4250, address: 'Shop - Service Bay 2' },
    speed: 0,
    fuelLevel: 45,
    mileage: 12890,
    lastService: '2024-07-30',
    nextService: '2024-08-01'
  },
  {
    id: 4,
    name: 'Van 001',
    type: 'Service Van',
    make: 'Ford',
    model: 'Transit 250',
    year: 2022,
    license: 'VA-SVC-001',
    status: 'available',
    driver: null,
    location: { lat: 37.5380, lng: -77.4280, address: 'Yard - Parking Area' },
    speed: 0,
    fuelLevel: 85,
    mileage: 15670,
    lastService: '2024-07-25',
    nextService: '2024-08-25'
  },
  {
    id: 5,
    name: 'Truck 003',
    type: 'Hot Mix Truck',
    make: 'Peterbilt',
    model: '348',
    year: 2021,
    license: 'VA-HMX-001',
    status: 'active',
    driver: 'Sarah Johnson',
    location: { lat: 37.5450, lng: -77.4400, address: 'Industrial Blvd, Richmond VA' },
    speed: 42,
    fuelLevel: 60,
    mileage: 45230,
    lastService: '2024-07-18',
    nextService: '2024-08-18'
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

const getSpeedColor = (speed: number) => {
  if (speed === 0) return 'text-muted-foreground';
  if (speed <= 25) return 'text-success';
  if (speed <= 45) return 'text-primary';
  return 'text-warning';
};

const getFuelLevelColor = (level: number | null) => {
  if (level === null) return 'text-muted-foreground';
  if (level >= 70) return 'text-success';
  if (level >= 30) return 'text-warning';
  return 'text-destructive';
};

export default function Fleet() {
  const activeVehicles = vehicles.filter(v => v.status === 'active').length;
  const availableVehicles = vehicles.filter(v => v.status === 'available').length;
  const avgFuelLevel = Math.round(
    vehicles.filter(v => v.fuelLevel !== null)
      .reduce((sum, v) => sum + (v.fuelLevel || 0), 0) / 
    vehicles.filter(v => v.fuelLevel !== null).length
  );

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Fleet Management</h1>
            <p className="text-muted-foreground">
              Track and manage your vehicle fleet in real-time
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <MapPin className="h-4 w-4 mr-2" />
              Map View
            </Button>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Vehicle
            </Button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <DashboardCard
            title="Total Fleet"
            value={vehicles.length.toString()}
            description="All vehicles tracked"
            icon={<Truck className="h-4 w-4" />}
          />
          <DashboardCard
            title="Active"
            value={activeVehicles.toString()}
            description="Currently on routes"
            trend={{ value: 20, isPositive: true, label: 'utilization rate' }}
            icon={<Activity className="h-4 w-4" />}
          />
          <DashboardCard
            title="Available"
            value={availableVehicles.toString()}
            description="Ready for dispatch"
            icon={<CheckCircle className="h-4 w-4" />}
          />
          <DashboardCard
            title="Avg Fuel Level"
            value={`${avgFuelLevel}%`}
            description="Fleet fuel status"
            trend={{ value: 5, isPositive: false, label: 'vs yesterday' }}
            icon={<Fuel className="h-4 w-4" />}
          />
        </div>

        {/* Fleet Grid */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Vehicle Fleet</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {vehicles.map((vehicle) => (
              <Card key={vehicle.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{vehicle.name}</CardTitle>
                      <p className="text-sm text-muted-foreground">
                        {vehicle.year} {vehicle.make} {vehicle.model}
                      </p>
                      <p className="text-xs text-muted-foreground">{vehicle.license}</p>
                    </div>
                    <div className={`px-2 py-1 rounded-full text-xs ${getStatusColor(vehicle.status)}`}>
                      {vehicle.status.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Current Status */}
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    {vehicle.driver && (
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span className="truncate">{vehicle.driver}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <Navigation className={`h-4 w-4 ${getSpeedColor(vehicle.speed)}`} />
                      <span className={getSpeedColor(vehicle.speed)}>
                        {vehicle.speed === 0 ? 'Parked' : `${vehicle.speed} mph`}
                      </span>
                    </div>
                    <div className="col-span-2 flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span className="truncate text-xs">{vehicle.location.address}</span>
                    </div>
                  </div>

                  {/* Fuel & Mileage */}
                  <div className="space-y-3">
                    {vehicle.fuelLevel !== null && (
                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-sm flex items-center gap-1">
                            <Fuel className="h-3 w-3" />
                            Fuel Level
                          </span>
                          <span className={`text-sm font-medium ${getFuelLevelColor(vehicle.fuelLevel)}`}>
                            {vehicle.fuelLevel}%
                          </span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full transition-all ${
                              vehicle.fuelLevel >= 70 ? 'bg-success' : 
                              vehicle.fuelLevel >= 30 ? 'bg-warning' : 'bg-destructive'
                            }`}
                            style={{ width: `${vehicle.fuelLevel}%` }}
                          />
                        </div>
                      </div>
                    )}
                    
                    <div className="flex justify-between items-center text-sm">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3 text-muted-foreground" />
                        Mileage
                      </span>
                      <span>{vehicle.mileage.toLocaleString()} miles</span>
                    </div>
                  </div>

                  {/* Service Schedule */}
                  <div className="p-3 bg-muted/50 rounded">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        Service Schedule
                      </span>
                      {new Date(vehicle.nextService) < new Date() && (
                        <AlertTriangle className="h-3 w-3 text-destructive" />
                      )}
                    </div>
                    <div className="text-xs space-y-1">
                      <div className="flex justify-between">
                        <span>Last:</span>
                        <span>{new Date(vehicle.lastService).toLocaleDateString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Next:</span>
                        <span className={
                          new Date(vehicle.nextService) < new Date() ? 'text-destructive font-medium' : ''
                        }>
                          {new Date(vehicle.nextService).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="flex-1">
                      Track on Map
                    </Button>
                    <Button variant="outline" size="sm">
                      <Phone className="h-3 w-3" />
                    </Button>
                    <Button variant="outline" size="sm">
                      Details
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