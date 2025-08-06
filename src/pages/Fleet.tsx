import { useState } from 'react';
import { DashboardLayout } from '../components/layout/dashboard-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { VehicleDetailsForm } from '../components/vehicle/VehicleDetailsForm';
import {
  Truck,
  MapPin,
  Fuel,
  Navigation,
  Shield,
  Clock,
  AlertTriangle,
  CheckCircle,
  Wrench,
  FileText,
  Plus,
} from 'lucide-react';

interface Vehicle {
  id: string;
  name: string;
  type: 'truck' | 'van' | 'trailer';
  status: 'active' | 'parked' | 'maintenance' | 'en-route';
  location: string;
  driver: string;
  speed: number;
  fuel: number;
  lastUpdate: string;
  destination?: string;
}

const mockVehicles: Vehicle[] = [
  {
    id: '1',
    name: 'Truck Alpha-1',
    type: 'truck',
    status: 'active',
    location: 'Downtown Church',
    driver: 'John Mitchell',
    speed: 0,
    fuel: 85,
    lastUpdate: '2 minutes ago',
  },
  {
    id: '2',
    name: 'Truck Bravo-2',
    type: 'truck',
    status: 'en-route',
    location: 'Highway 95',
    driver: 'Sarah Chen',
    speed: 45,
    fuel: 60,
    lastUpdate: '1 minute ago',
    destination: 'Shopping Center',
  },
  {
    id: '3',
    name: 'Service Van Charlie-1',
    type: 'van',
    status: 'parked',
    location: 'Main Yard',
    driver: 'Mike Rodriguez',
    speed: 0,
    fuel: 95,
    lastUpdate: '5 minutes ago',
  },
];

const getStatusColor = (status: string) => {
  switch (status) {
    case 'active': return 'bg-green-500';
    case 'en-route': return 'bg-blue-500';
    case 'parked': return 'bg-card0';
    case 'maintenance': return 'bg-yellow-500';
    default: return 'bg-card0';
  }
};

const getStatusText = (status: string) => {
  switch (status) {
    case 'active': return 'Active';
    case 'en-route': return 'En Route';
    case 'parked': return 'Parked';
    case 'maintenance': return 'Maintenance';
    default: return 'Unknown';
  }
};

export default function Fleet() {
  const [selectedVehicle, setSelectedVehicle] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('overview');

  if (selectedVehicle) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              onClick={() => { setSelectedVehicle(null); }}
            >
              ← Back to Fleet
            </Button>
            <h1 className="text-2xl font-bold">Vehicle Details</h1>
          </div>
          <VehicleDetailsForm
            vehicleId={selectedVehicle}
            onSave={(data) => {
              console.log('Vehicle data saved:', data);
              setSelectedVehicle(null);
            }}
          />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Fleet Command Center</h1>
            <p className="text-muted-foreground">
              Comprehensive fleet management, tracking, and maintenance
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="gap-2">
              <Plus className="h-4 w-4" />
              Add Vehicle
            </Button>
            <Button className="gap-2">
              <MapPin className="h-4 w-4" />
              Live Map
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Vehicles</CardTitle>
              <Truck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">8</div>
              <p className="text-xs text-muted-foreground">Fleet size</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active</CardTitle>
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">5</div>
              <p className="text-xs text-muted-foreground">Currently deployed</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average Fuel</CardTitle>
              <Fuel className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">72%</div>
              <p className="text-xs text-muted-foreground">Fleet average</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">GPS Status</CardTitle>
              <Navigation className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">100%</div>
              <p className="text-xs text-muted-foreground">All units online</p>
            </CardContent>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview" className="gap-2">
              <Truck className="h-4 w-4" />
              Live Tracking
            </TabsTrigger>
            <TabsTrigger value="maintenance" className="gap-2">
              <Wrench className="h-4 w-4" />
              Maintenance
            </TabsTrigger>
            <TabsTrigger value="inspections" className="gap-2">
              <CheckCircle className="h-4 w-4" />
              Inspections
            </TabsTrigger>
            <TabsTrigger value="documents" className="gap-2">
              <FileText className="h-4 w-4" />
              Documents
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Live Vehicle Tracking */}
            <Card>
              <CardHeader>
                <CardTitle>Live Vehicle Tracking</CardTitle>
                <CardDescription>Real-time positions and status updates</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Vehicle List */}
                <div className="space-y-4">
                  {mockVehicles.map((vehicle) => (
                    <div key={vehicle.id} className="border rounded-lg p-4 space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center">
                            <Truck className="h-6 w-6 text-primary" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="font-semibold">{vehicle.name}</h3>
                              <div className={`w-2 h-2 rounded-full ${getStatusColor(vehicle.status)}`}></div>
                              <Badge variant="outline">{getStatusText(vehicle.status)}</Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">
                          Driver: {vehicle.driver}
                            </p>
                          </div>
                        </div>

                        <div className="text-right">
                          <div className="text-lg font-semibold">
                            {vehicle.speed} mph
                          </div>
                          <div className="text-sm text-muted-foreground">
                        Current speed
                          </div>
                        </div>
                      </div>

                      <div className="grid gap-4 md:grid-cols-4">
                        <div>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                            <MapPin className="h-3 w-3" />
                        Current Location
                          </div>
                          <div className="text-sm font-medium">{vehicle.location}</div>
                        </div>

                        <div>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                            <Navigation className="h-3 w-3" />
                        Destination
                          </div>
                          <div className="text-sm">
                            {vehicle.destination || 'No destination set'}
                          </div>
                        </div>

                        <div>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                            <Fuel className="h-3 w-3" />
                        Fuel Level
                          </div>
                          <div className="text-sm font-medium">{vehicle.fuel}%</div>
                        </div>

                        <div>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                            <Clock className="h-3 w-3" />
                        Last Update
                          </div>
                          <div className="text-sm">{vehicle.lastUpdate}</div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t">
                        <div className="flex items-center gap-2">
                          {vehicle.status === 'active' && (
                            <>
                              <CheckCircle className="h-4 w-4 text-green-500" />
                              <span className="text-sm text-green-600">Operational</span>
                            </>
                          )}
                          {vehicle.status === 'en-route' && (
                            <>
                              <Navigation className="h-4 w-4 text-blue-500" />
                              <span className="text-sm text-blue-600">En Route</span>
                            </>
                          )}
                          {vehicle.status === 'parked' && (
                            <>
                              <Shield className="h-4 w-4 text-gray-500" />
                              <span className="text-sm text-gray-600">Parked</span>
                            </>
                          )}
                          {vehicle.status === 'maintenance' && (
                            <>
                              <AlertTriangle className="h-4 w-4 text-yellow-500" />
                              <span className="text-sm text-yellow-600">Maintenance</span>
                            </>
                          )}
                        </div>

                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" className="gap-1">
                            <MapPin className="h-3 w-3" />
                          Track
                          </Button>
                          <Button variant="outline" size="sm" className="gap-1">
                            <Navigation className="h-3 w-3" />
                          Navigate
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => { setSelectedVehicle(vehicle.id); }}
                          >
                          Manage
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="maintenance" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Maintenance Schedule</CardTitle>
                <CardDescription>Upcoming and overdue maintenance for all vehicles</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border rounded-lg border-red-200 bg-red-50">
                    <div className="flex items-center gap-3">
                      <AlertTriangle className="h-5 w-5 text-red-600" />
                      <div>
                        <div className="font-medium">Truck Alpha-1 - Oil Change</div>
                        <div className="text-sm text-muted-foreground">Overdue by 500 miles</div>
                      </div>
                    </div>
                    <Badge variant="destructive">Overdue</Badge>
                  </div>

                  <div className="flex items-center justify-between p-4 border rounded-lg border-yellow-200 bg-yellow-50">
                    <div className="flex items-center gap-3">
                      <Clock className="h-5 w-5 text-yellow-600" />
                      <div>
                        <div className="font-medium">Service Van Charlie-1 - Brake Inspection</div>
                        <div className="text-sm text-muted-foreground">Due in 3 days</div>
                      </div>
                    </div>
                    <Badge variant="outline" className="border-yellow-600 text-yellow-600">Due Soon</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="inspections" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Vehicle Inspections</CardTitle>
                <CardDescription>Daily, weekly, and annual inspection records</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      <div>
                        <div className="font-medium">Daily Inspection - Truck Alpha-1</div>
                        <div className="text-sm text-muted-foreground">Completed today at 7:00 AM</div>
                      </div>
                    </div>
                    <Badge variant="outline" className="border-green-600 text-green-600">Passed</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="documents" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Fleet Documents</CardTitle>
                <CardDescription>Registration, insurance, and certification documents</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2">
                  <Card className="p-4">
                    <div className="flex items-center gap-3">
                      <FileText className="h-8 w-8 text-blue-600" />
                      <div>
                        <h4 className="font-medium">Vehicle Registrations</h4>
                        <p className="text-sm text-muted-foreground">All vehicle registration documents</p>
                      </div>
                    </div>
                  </Card>

                  <Card className="p-4">
                    <div className="flex items-center gap-3">
                      <Shield className="h-8 w-8 text-green-600" />
                      <div>
                        <h4 className="font-medium">Insurance Policies</h4>
                        <p className="text-sm text-muted-foreground">Current insurance certificates</p>
                      </div>
                    </div>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Fleet Summary */}
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Fleet Health</CardTitle>
              <CardDescription>Overall fleet status and alerts</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-3 border rounded">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm">All vehicles operational</span>
                </div>
                <Badge variant="outline" className="bg-green-50 text-green-700">Healthy</Badge>
              </div>

              <div className="flex items-center justify-between p-3 border rounded">
                <div className="flex items-center gap-2">
                  <Fuel className="h-4 w-4 text-yellow-500" />
                  <span className="text-sm">2 vehicles need fuel</span>
                </div>
                <Badge variant="outline" className="bg-yellow-50 text-yellow-700">Warning</Badge>
              </div>

              <div className="flex items-center justify-between p-3 border rounded">
                <div className="flex items-center gap-2">
                  <Navigation className="h-4 w-4 text-green-500" />
                  <span className="text-sm">GPS tracking active</span>
                </div>
                <Badge variant="outline" className="bg-green-50 text-green-700">Online</Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Today's Activity</CardTitle>
              <CardDescription>Fleet activity summary</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm">Total Miles Driven</span>
                <span className="font-semibold">247 miles</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm">Active Hours</span>
                <span className="font-semibold">32 hours</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm">Fuel Consumed</span>
                <span className="font-semibold">45 gallons</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm">Average Speed</span>
                <span className="font-semibold">28 mph</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}