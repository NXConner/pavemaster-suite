import { useState } from 'react';
import { DashboardLayout } from '../components/layout/dashboard-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';

// Import new components
import { AsphaltGuardian } from '../components/guardian/AsphaltGuardian';
import { SealcoatCalculator } from '../components/calculators/SealcoatCalculator';
import { StripingCalculator } from '../components/calculators/StripingCalculator';
import { MaterialEstimator } from '../components/calculators/MaterialEstimator';
import { RegulationsGuide } from '../components/regulations/RegulationsGuide';

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
  Calendar,
  Shield,
  Activity,
  Gauge,
  Package,
  Book,
} from 'lucide-react';

export default function Index() {
  const [activeSection, setActiveSection] = useState('dashboard');

  const renderActiveSection = () => {
    switch (activeSection) {
      case 'guardian':
        return <AsphaltGuardian />;
      case 'sealcoat-calc':
        return <SealcoatCalculator />;
      case 'striping-calc':
        return <StripingCalculator />;
      case 'material-calc':
        return <MaterialEstimator />;
      case 'regulations':
        return <RegulationsGuide />;
      default:
        return renderDashboard();
    }
  };

  const renderDashboard = () => (
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

      {/* Quick Access Tiles */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card 
          className="cursor-pointer hover:shadow-lg transition-shadow"
          onClick={() => setActiveSection('guardian')}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Asphalt Guardian</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">Active</div>
            <p className="text-xs text-muted-foreground">Real-time monitoring</p>
          </CardContent>
        </Card>

        <Card 
          className="cursor-pointer hover:shadow-lg transition-shadow"
          onClick={() => setActiveSection('sealcoat-calc')}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sealcoat Calculator</CardTitle>
            <Calculator className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">Ready</div>
            <p className="text-xs text-muted-foreground">Material estimation</p>
          </CardContent>
        </Card>

        <Card 
          className="cursor-pointer hover:shadow-lg transition-shadow"
          onClick={() => setActiveSection('striping-calc')}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Striping Calculator</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">Ready</div>
            <p className="text-xs text-muted-foreground">Paint requirements</p>
          </CardContent>
        </Card>

        <Card 
          className="cursor-pointer hover:shadow-lg transition-shadow"
          onClick={() => setActiveSection('material-calc')}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Material Estimator</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">Ready</div>
            <p className="text-xs text-muted-foreground">Project planning</p>
          </CardContent>
        </Card>
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
            <CardTitle className="text-sm font-medium">Fleet Vehicles</CardTitle>
            <Truck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">24</div>
            <p className="text-xs text-muted-foreground">2 in maintenance</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Team Members</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">156</div>
            <p className="text-xs text-muted-foreground">12 active today</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Calculations</CardTitle>
            <Calculator className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">342</div>
            <p className="text-xs text-muted-foreground">+15 today</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="projects">Recent Projects</TabsTrigger>
          <TabsTrigger value="monitoring">System Monitoring</TabsTrigger>
          <TabsTrigger value="calculators">Quick Calculators</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Performance Metrics
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Quality Score</span>
                  <Badge className="bg-green-100 text-green-800">94.5%</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Efficiency Rate</span>
                  <Badge className="bg-blue-100 text-blue-800">87.2%</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Compliance Rate</span>
                  <Badge className="bg-green-100 text-green-800">98.7%</Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" />
                  System Alerts
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2"></div>
                  <div>
                    <p className="text-sm font-medium">Temperature Warning</p>
                    <p className="text-xs text-muted-foreground">Section B approaching limits</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                  <div>
                    <p className="text-sm font-medium">Compaction Complete</p>
                    <p className="text-xs text-muted-foreground">Section A meets specifications</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Upcoming Tasks
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Highway 101 Inspection</span>
                  <Badge variant="outline">Tomorrow</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Equipment Maintenance</span>
                  <Badge variant="outline">Friday</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Team Safety Training</span>
                  <Badge variant="outline">Next Week</Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="projects" className="space-y-4">
          <div className="space-y-4">
            {[
              { name: 'Highway 101 Resurfacing', status: 'In Progress', progress: 65, location: 'San Francisco, CA' },
              { name: 'Downtown Street Repair', status: 'Planning', progress: 25, location: 'Oakland, CA' },
              { name: 'Airport Runway Maintenance', status: 'Completed', progress: 100, location: 'SFO, CA' },
            ].map((project, index) => (
              <Card key={index}>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">{project.name}</h3>
                      <p className="text-sm text-muted-foreground">{project.location}</p>
                    </div>
                    <div className="text-right">
                      <Badge variant={project.status === 'Completed' ? 'default' : 'outline'}>
                        {project.status}
                      </Badge>
                      <p className="text-sm text-muted-foreground mt-1">{project.progress}% complete</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="monitoring" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Gauge className="h-5 w-5" />
                  Real-time Metrics
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Surface Temperature</span>
                    <span>68°F</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-green-600 h-2 rounded-full" style={{ width: '68%' }}></div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Humidity Level</span>
                    <span>45%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-blue-600 h-2 rounded-full" style={{ width: '45%' }}></div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Compaction Level</span>
                    <span>96%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-green-600 h-2 rounded-full" style={{ width: '96%' }}></div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5" />
                  Compliance Status
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">DOT Standards</span>
                  <Badge className="bg-green-100 text-green-800">Compliant</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Environmental Regs</span>
                  <Badge className="bg-green-100 text-green-800">Compliant</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Safety Protocols</span>
                  <Badge className="bg-yellow-100 text-yellow-800">Warning</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Quality Specs</span>
                  <Badge className="bg-green-100 text-green-800">Compliant</Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="calculators" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card 
              className="cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => setActiveSection('sealcoat-calc')}
            >
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calculator className="h-5 w-5" />
                  Sealcoat Calculator
                </CardTitle>
                <CardDescription>
                  Calculate material requirements and costs for sealcoating projects
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full">Open Calculator</Button>
              </CardContent>
            </Card>

            <Card 
              className="cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => setActiveSection('striping-calc')}
            >
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Striping Calculator
                </CardTitle>
                <CardDescription>
                  Calculate paint and material requirements for road striping
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full">Open Calculator</Button>
              </CardContent>
            </Card>

            <Card 
              className="cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => setActiveSection('material-calc')}
            >
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Material Estimator
                </CardTitle>
                <CardDescription>
                  Estimate material requirements for paving projects
                </CardDescription>
              </CardHeader>
              <CardContent>
                               <Button className="w-full">Open Estimator</Button>
             </CardContent>
           </Card>

           <Card 
             className="cursor-pointer hover:shadow-lg transition-shadow"
             onClick={() => setActiveSection('regulations')}
           >
             <CardHeader>
               <CardTitle className="flex items-center gap-2">
                 <Book className="h-5 w-5" />
                 Regulations Guide
               </CardTitle>
               <CardDescription>
                 Comprehensive guide to regulatory requirements and standards
               </CardDescription>
             </CardHeader>
             <CardContent>
               <Button className="w-full">View Guide</Button>
             </CardContent>
           </Card>
         </div>
        </TabsContent>
      </Tabs>
    </div>
  );

  return (
    <DashboardLayout>
      {activeSection !== 'dashboard' && (
        <div className="mb-4">
          <Button 
            variant="outline" 
            onClick={() => setActiveSection('dashboard')}
            className="mb-4"
          >
            ← Back to Dashboard
          </Button>
        </div>
      )}
      {renderActiveSection()}
    </DashboardLayout>
  );
}