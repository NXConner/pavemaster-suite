import { DashboardLayout } from "../components/layout/dashboard-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Badge } from "../components/ui/badge";
import { Progress } from "../components/ui/progress";
import { 
  Building, 
  Plus, 
  Search, 
  Calendar,
  Users,
  DollarSign,
  Clock,
  CheckCircle,
  
  MapPin
} from "lucide-react";

interface Project {
  id: string;
  name: string;
  client: string;
  status: 'planning' | 'active' | 'completed' | 'on-hold';
  progress: number;
  startDate: string;
  endDate: string;
  budget: number;
  spent: number;
  crew: string[];
}

const mockProjects: Project[] = [
  {
    id: '1',
    name: 'Church Parking Lot Reseal',
    client: 'First Baptist Church',
    status: 'completed',
    progress: 100,
    startDate: '2024-01-15',
    endDate: '2024-01-17',
    budget: 12500,
    spent: 11800,
    crew: ['John Mitchell', 'Sarah Chen']
  },
  {
    id: '2',
    name: 'Shopping Center Asphalt Repair',
    client: 'Metro Plaza',
    status: 'active',
    progress: 65,
    startDate: '2024-01-20',
    endDate: '2024-02-05',
    budget: 35000,
    spent: 22750,
    crew: ['Mike Rodriguez', 'Tom Wilson', 'Lisa Davis']
  },
  {
    id: '3',
    name: 'Office Complex Sealcoating',
    client: 'Corporate Center LLC',
    status: 'planning',
    progress: 0,
    startDate: '2024-02-10',
    endDate: '2024-02-15',
    budget: 18500,
    spent: 0,
    crew: []
  }
];

const getStatusColor = (status: string) => {
  switch (status) {
    case 'completed': return 'bg-green-500';
    case 'active': return 'bg-blue-500';
    case 'planning': return 'bg-yellow-500';
    case 'on-hold': return 'bg-red-500';
    default: return 'bg-gray-500';
  }
};

const getStatusText = (status: string) => {
  switch (status) {
    case 'completed': return 'Completed';
    case 'active': return 'In Progress';
    case 'planning': return 'Planning';
    case 'on-hold': return 'On Hold';
    default: return 'Unknown';
  }
};

export default function Projects() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Project Command</h1>
            <p className="text-muted-foreground">
              Manage and monitor all active operations
            </p>
          </div>
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            New Project
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Projects</CardTitle>
              <Building className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">8</div>
              <p className="text-xs text-muted-foreground">+2 this month</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active</CardTitle>
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">3</div>
              <p className="text-xs text-muted-foreground">In progress</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">$156K</div>
              <p className="text-xs text-muted-foreground">+15% from last month</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">94%</div>
              <p className="text-xs text-muted-foreground">On-time delivery</p>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filter */}
        <Card>
          <CardHeader>
            <CardTitle>Project Operations</CardTitle>
            <CardDescription>Monitor and manage all project activities</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search projects..."
                  className="pl-10"
                />
              </div>
              <Button variant="outline" className="gap-2">
                <Calendar className="h-4 w-4" />
                Filter
              </Button>
            </div>

            {/* Project List */}
            <div className="space-y-4">
              {mockProjects.map((project) => (
                <div key={project.id} className="border rounded-lg p-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">{project.name}</h3>
                        <div className={`w-2 h-2 rounded-full ${getStatusColor(project.status)}`}></div>
                        <Badge variant="outline">{getStatusText(project.status)}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{project.client}</p>
                    </div>
                    
                    <div className="text-right">
                      <div className="text-lg font-semibold">
                        ${project.budget.toLocaleString()}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        ${project.spent.toLocaleString()} spent
                      </div>
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-3">
                    <div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                        <Calendar className="h-3 w-3" />
                        Timeline
                      </div>
                      <div className="text-sm">
                        {new Date(project.startDate).toLocaleDateString()} - {new Date(project.endDate).toLocaleDateString()}
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                        <Users className="h-3 w-3" />
                        Crew
                      </div>
                      <div className="text-sm">
                        {project.crew.length > 0 ? `${project.crew.length} members` : 'Not assigned'}
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                        <Clock className="h-3 w-3" />
                        Progress
                      </div>
                      <div className="flex items-center gap-2">
                        <Progress value={project.progress} className="flex-1 h-2" />
                        <span className="text-sm font-medium">{project.progress}%</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t">
                    <div className="flex items-center gap-2">
                      {project.status === 'active' && (
                        <>
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          <span className="text-sm text-green-600">On Track</span>
                        </>
                      )}
                      {project.status === 'planning' && (
                        <>
                          <Clock className="h-4 w-4 text-yellow-500" />
                          <span className="text-sm text-yellow-600">Scheduled</span>
                        </>
                      )}
                      {project.status === 'completed' && (
                        <>
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          <span className="text-sm text-green-600">Completed</span>
                        </>
                      )}
                    </div>
                    
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" className="gap-1">
                        <MapPin className="h-3 w-3" />
                        Location
                      </Button>
                      <Button variant="outline" size="sm">
                        View Details
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}