import { DashboardLayout } from "../components/layout/dashboard-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";

import { 
  Building, 
  Users, 
  Truck, 
  Calculator,
  AlertTriangle,
  CheckCircle,
  Clock,
  TrendingUp,
  MapPin,
  Calendar
} from "lucide-react";

export default function Index() {

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Welcome Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Welcome to PaveMaster Suite</h1>
            <p className="text-muted-foreground">
              Your tactical command center for pavement operations
            </p>
          </div>
          <Badge variant="outline" className="gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            System Operational
          </Badge>
        </div>

        {/* Quick Stats */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Projects</CardTitle>
              <Building className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">8</div>
              <p className="text-xs text-muted-foreground">+2 this week</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Crew Members</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">12</div>
              <p className="text-xs text-muted-foreground">10 active today</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Equipment Status</CardTitle>
              <Truck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">94%</div>
              <p className="text-xs text-muted-foreground">Operational</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Revenue MTD</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">$47.2K</div>
              <p className="text-xs text-muted-foreground">+12% from last month</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Latest updates from your operations</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <div className="flex-1">
                  <p className="text-sm font-medium">Church Parking Lot - Completed</p>
                  <p className="text-xs text-muted-foreground">2 hours ago</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <Clock className="h-5 w-5 text-yellow-500" />
                <div className="flex-1">
                  <p className="text-sm font-medium">Shopping Center Reseal - In Progress</p>
                  <p className="text-xs text-muted-foreground">Started this morning</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <AlertTriangle className="h-5 w-5 text-orange-500" />
                <div className="flex-1">
                  <p className="text-sm font-medium">Equipment Maintenance Due</p>
                  <p className="text-xs text-muted-foreground">Truck #3 needs service</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <MapPin className="h-5 w-5 text-blue-500" />
                <div className="flex-1">
                  <p className="text-sm font-medium">New Estimate Request</p>
                  <p className="text-xs text-muted-foreground">Office complex in downtown</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Common tasks and tools</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button className="w-full justify-start gap-2" variant="outline">
                <Calculator className="h-4 w-4" />
                Create New Estimate
              </Button>
              
              <Button className="w-full justify-start gap-2" variant="outline">
                <Calendar className="h-4 w-4" />
                Schedule Job
              </Button>
              
              <Button className="w-full justify-start gap-2" variant="outline">
                <Users className="h-4 w-4" />
                Assign Crew
              </Button>
              
              <Button className="w-full justify-start gap-2" variant="outline">
                <MapPin className="h-4 w-4" />
                Track Equipment
              </Button>
              
              <Button className="w-full justify-start gap-2" variant="outline">
                <Building className="h-4 w-4" />
                View Projects
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Weather & Operations Status */}
        <Card>
          <CardHeader>
            <CardTitle>Operations Status</CardTitle>
            <CardDescription>Current conditions and system status</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <h4 className="font-medium">Weather Conditions</h4>
                <div className="text-2xl font-bold">72°F</div>
                <p className="text-sm text-muted-foreground">Clear skies, ideal for asphalt work</p>
                <Badge variant="outline" className="bg-green-50 text-green-700">Optimal</Badge>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-medium">System Health</h4>
                <div className="text-2xl font-bold text-green-600">98%</div>
                <p className="text-sm text-muted-foreground">All systems operational</p>
                <Badge variant="outline" className="bg-green-50 text-green-700">Healthy</Badge>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-medium">Active Crews</h4>
                <div className="text-2xl font-bold">3</div>
                <p className="text-sm text-muted-foreground">Currently deployed</p>
                <Badge variant="outline" className="bg-blue-50 text-blue-700">Deployed</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}