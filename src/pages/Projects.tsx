import { DashboardLayout } from '../components/layout/dashboard-layout';
import { DashboardCard } from '../components/ui/dashboard-card';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { 
  Plus, 
  MapPin, 
  Calendar, 
  DollarSign, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  Wrench,
  Users,
  FileText
} from 'lucide-react';

// Mock project data
const projects = [
  {
    id: 1,
    name: 'Main Street Resurfacing',
    client: 'City of Richmond',
    status: 'active',
    progress: 65,
    startDate: '2024-08-01',
    endDate: '2024-08-15',
    budget: 125000,
    spent: 81250,
    crew: 'Team Alpha',
    location: 'Main St, Richmond VA',
    type: 'Resurfacing'
  },
  {
    id: 2,
    name: 'Church Parking Lot Seal',
    client: 'First Baptist Church',
    status: 'completed',
    progress: 100,
    startDate: '2024-07-28',
    endDate: '2024-07-30',
    budget: 15000,
    spent: 14750,
    crew: 'Team Beta',
    location: '123 Church St, Richmond VA',
    type: 'Sealcoating'
  },
  {
    id: 3,
    name: 'Industrial Complex Paving',
    client: 'Richmond Industries',
    status: 'planning',
    progress: 0,
    startDate: '2024-08-20',
    endDate: '2024-09-10',
    budget: 285000,
    spent: 0,
    crew: 'Team Alpha',
    location: 'Industrial Blvd, Richmond VA',
    type: 'New Construction'
  },
  {
    id: 4,
    name: 'Shopping Center Repair',
    client: 'Metro Shopping Plaza',
    status: 'on-hold',
    progress: 25,
    startDate: '2024-08-05',
    endDate: '2024-08-12',
    budget: 45000,
    spent: 11250,
    crew: 'Team Beta',
    location: 'Metro Plaza, Richmond VA',
    type: 'Crack Repair'
  }
];

const getStatusColor = (status: string) => {
  switch (status) {
    case 'active': return 'bg-primary text-primary-foreground';
    case 'completed': return 'bg-success text-success-foreground';
    case 'planning': return 'bg-info text-info-foreground';
    case 'on-hold': return 'bg-warning text-warning-foreground';
    default: return 'bg-muted text-muted-foreground';
  }
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'active': return <Clock className="h-3 w-3" />;
    case 'completed': return <CheckCircle className="h-3 w-3" />;
    case 'planning': return <FileText className="h-3 w-3" />;
    case 'on-hold': return <AlertCircle className="h-3 w-3" />;
    default: return <Clock className="h-3 w-3" />;
  }
};

export default function Projects() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Projects</h1>
            <p className="text-muted-foreground">
              Manage your paving and sealing projects
            </p>
          </div>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            New Project
          </Button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <DashboardCard
            title="Total Projects"
            value="47"
            description="All time projects"
            icon={<FileText className="h-4 w-4" />}
          />
          <DashboardCard
            title="Active Projects"
            value="8"
            description="Currently in progress"
            trend={{ value: 12, isPositive: true, label: 'from last month' }}
            icon={<Clock className="h-4 w-4" />}
          />
          <DashboardCard
            title="Completed This Month"
            value="12"
            description="Successfully finished"
            trend={{ value: 25, isPositive: true, label: 'vs last month' }}
            icon={<CheckCircle className="h-4 w-4" />}
          />
          <DashboardCard
            title="Total Revenue"
            value="$1.2M"
            description="Year to date"
            trend={{ value: 18, isPositive: true, label: 'vs last year' }}
            icon={<DollarSign className="h-4 w-4" />}
          />
        </div>

        {/* Projects List */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Current Projects</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {projects.map((project) => (
              <Card key={project.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{project.name}</CardTitle>
                      <p className="text-sm text-muted-foreground">{project.client}</p>
                    </div>
                    <div className={`px-2 py-1 rounded-full text-xs flex items-center gap-1 ${getStatusColor(project.status)}`}>
                      {getStatusIcon(project.status)}
                      {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Progress Bar */}
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Progress</span>
                      <span>{project.progress}%</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div 
                        className="bg-primary h-2 rounded-full transition-all" 
                        style={{ width: `${project.progress}%` }}
                      />
                    </div>
                  </div>

                  {/* Project Details */}
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span className="truncate">{project.location}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span>{new Date(project.startDate).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span>{project.crew}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Wrench className="h-4 w-4 text-muted-foreground" />
                      <span>{project.type}</span>
                    </div>
                  </div>

                  {/* Budget */}
                  <div className="flex justify-between items-center p-3 bg-muted/50 rounded">
                    <div>
                      <p className="text-sm font-medium">Budget</p>
                      <p className="text-xs text-muted-foreground">
                        ${project.spent.toLocaleString()} / ${project.budget.toLocaleString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">
                        {Math.round((project.spent / project.budget) * 100)}% used
                      </p>
                      <p className="text-xs text-muted-foreground">
                        ${(project.budget - project.spent).toLocaleString()} remaining
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="flex-1">
                      View Details
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1">
                      Edit Project
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