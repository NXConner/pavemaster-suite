import { useState } from 'react';
import { Calendar, MapPin, DollarSign, Users, Clock, TrendingUp, AlertTriangle, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface ProjectMilestone {
  id: string;
  title: string;
  dueDate: string;
  completed: boolean;
  critical: boolean;
}

interface ProjectResource {
  type: 'crew' | 'equipment' | 'material';
  name: string;
  allocated: number;
  used: number;
  unit: string;
}

interface EnhancedProject {
  id: string;
  name: string;
  location: string;
  status: 'active' | 'planned' | 'completed' | 'on-hold';
  progress: number;
  budget: number;
  spent: number;
  crewSize: number;
  dueDate: string;
  startDate: string;
  type: 'resurfacing' | 'sealcoating' | 'line-striping' | 'repair';
  milestones: ProjectMilestone[];
  resources: ProjectResource[];
  weatherRisk: 'low' | 'medium' | 'high';
  profitMargin: number;
}

export function EnhancedProjectManagement() {
  const [selectedProject, setSelectedProject] = useState<string | null>(null);

  const projects: EnhancedProject[] = [
    {
      id: '1',
      name: 'Highway 101 Resurfacing',
      location: 'San Francisco, CA',
      status: 'active',
      progress: 65,
      budget: 450000,
      spent: 285000,
      crewSize: 12,
      dueDate: '2024-12-15',
      startDate: '2024-10-01',
      type: 'resurfacing',
      weatherRisk: 'medium',
      profitMargin: 18.5,
      milestones: [
        { id: '1', title: 'Site Preparation', dueDate: '2024-10-15', completed: true, critical: false },
        { id: '2', title: 'Base Layer Application', dueDate: '2024-11-01', completed: true, critical: true },
        { id: '3', title: 'Surface Layer Application', dueDate: '2024-11-20', completed: false, critical: true },
        { id: '4', title: 'Line Marking', dueDate: '2024-12-10', completed: false, critical: false },
        { id: '5', title: 'Final Inspection', dueDate: '2024-12-15', completed: false, critical: true },
      ],
      resources: [
        { type: 'crew', name: 'Paving Crew', allocated: 12, used: 8, unit: 'members' },
        { type: 'equipment', name: 'Asphalt Paver', allocated: 2, used: 1, unit: 'units' },
        { type: 'material', name: 'Hot Mix Asphalt', allocated: 1200, used: 780, unit: 'tons' },
      ],
    },
    {
      id: '2',
      name: 'Church Parking Lot Sealcoating',
      location: 'Richmond, VA',
      status: 'planned',
      progress: 15,
      budget: 85000,
      spent: 12750,
      crewSize: 4,
      dueDate: '2024-11-30',
      startDate: '2024-11-15',
      type: 'sealcoating',
      weatherRisk: 'low',
      profitMargin: 22.3,
      milestones: [
        { id: '1', title: 'Surface Cleaning', dueDate: '2024-11-16', completed: false, critical: false },
        { id: '2', title: 'Crack Sealing', dueDate: '2024-11-18', completed: false, critical: true },
        { id: '3', title: 'Sealcoat Application', dueDate: '2024-11-25', completed: false, critical: true },
        { id: '4', title: 'Line Striping', dueDate: '2024-11-29', completed: false, critical: false },
      ],
      resources: [
        { type: 'crew', name: 'Sealcoat Team', allocated: 4, used: 0, unit: 'members' },
        { type: 'equipment', name: 'Sealcoat Tank', allocated: 1, used: 0, unit: 'units' },
        { type: 'material', name: 'Sealcoat Material', allocated: 450, used: 0, unit: 'gallons' },
      ],
    },
  ];

  const getStatusColor = (status: string) => {
    const colors = {
      active: 'bg-success/10 text-success border-success/20',
      planned: 'bg-info/10 text-info border-info/20',
      completed: 'bg-primary/10 text-primary border-primary/20',
      'on-hold': 'bg-warning/10 text-warning border-warning/20',
    };
    return colors[status as keyof typeof colors] || 'bg-muted';
  };

  const getWeatherRiskColor = (risk: string) => {
    const colors = {
      low: 'text-success',
      medium: 'text-warning',
      high: 'text-destructive',
    };
    return colors[risk as keyof typeof colors] || 'text-muted-foreground';
  };

  const getTypeIcon = (type: string) => {
    const icons = {
      resurfacing: '🛣️',
      sealcoating: '🖤',
      'line-striping': '🛣️',
      repair: '🔧',
    };
    return icons[type as keyof typeof icons] || '📋';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Enhanced Project Management</h2>
          <p className="text-muted-foreground">Advanced project tracking with milestones and resource management</p>
        </div>
        <Button>
          <Calendar className="h-4 w-4 mr-2" />
          Schedule View
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {projects.map((project) => (
          <Card key={project.id} className="group hover:shadow-lg transition-all duration-300">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <span className="text-xl">{getTypeIcon(project.type)}</span>
                    <CardTitle className="text-lg">{project.name}</CardTitle>
                  </div>
                  <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                    <div className="flex items-center space-x-1">
                      <MapPin className="h-3 w-3" />
                      <span>{project.location}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Clock className="h-3 w-3" />
                      <span>Due {new Date(project.dueDate).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
                <Badge className={getStatusColor(project.status)}>
                  {project.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Progress</span>
                  <span>{project.progress}%</span>
                </div>
                <Progress value={project.progress} className="h-2" />
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="space-y-1">
                  <div className="flex items-center space-x-1 text-muted-foreground">
                    <DollarSign className="h-3 w-3" />
                    <span>Budget</span>
                  </div>
                  <p className="font-medium">${project.budget.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">
                    Spent: ${project.spent.toLocaleString()} ({Math.round((project.spent / project.budget) * 100)}%)
                  </p>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center space-x-1 text-muted-foreground">
                    <Users className="h-3 w-3" />
                    <span>Team</span>
                  </div>
                  <p className="font-medium">{project.crewSize} members</p>
                  <p className="text-xs text-muted-foreground">
                    Profit: {project.profitMargin}%
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-1">
                    <TrendingUp className={`h-3 w-3 ${getWeatherRiskColor(project.weatherRisk)}`} />
                    <span className={`text-xs ${getWeatherRiskColor(project.weatherRisk)}`}>
                      {project.weatherRisk} weather risk
                    </span>
                  </div>
                  <div className="flex items-center space-x-1">
                    {project.milestones.filter(m => m.critical && !m.completed).length > 0 ? (
                      <AlertTriangle className="h-3 w-3 text-warning" />
                    ) : (
                      <CheckCircle className="h-3 w-3 text-success" />
                    )}
                    <span className="text-xs text-muted-foreground">
                      {project.milestones.filter(m => m.completed).length}/{project.milestones.length} milestones
                    </span>
                  </div>
                </div>
                <Button variant="outline" size="sm" onClick={() => { setSelectedProject(project.id); }}>
                  View Details
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {selectedProject && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Project Details</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="milestones">
              <TabsList>
                <TabsTrigger value="milestones">Milestones</TabsTrigger>
                <TabsTrigger value="resources">Resources</TabsTrigger>
                <TabsTrigger value="timeline">Timeline</TabsTrigger>
              </TabsList>

              <TabsContent value="milestones" className="space-y-4">
                {projects.find(p => p.id === selectedProject)?.milestones.map((milestone) => (
                  <div key={milestone.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      {milestone.completed ? (
                        <CheckCircle className="h-5 w-5 text-success" />
                      ) : (
                        <Clock className="h-5 w-5 text-muted-foreground" />
                      )}
                      <div>
                        <p className="font-medium">{milestone.title}</p>
                        <p className="text-sm text-muted-foreground">
                          Due: {new Date(milestone.dueDate).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {milestone.critical && (
                        <Badge variant="destructive" className="text-xs">Critical</Badge>
                      )}
                      <Badge variant={milestone.completed ? 'default' : 'secondary'}>
                        {milestone.completed ? 'Completed' : 'Pending'}
                      </Badge>
                    </div>
                  </div>
                ))}
              </TabsContent>

              <TabsContent value="resources" className="space-y-4">
                {projects.find(p => p.id === selectedProject)?.resources.map((resource, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">{resource.name}</span>
                      <span className="text-sm text-muted-foreground">
                        {resource.used}/{resource.allocated} {resource.unit}
                      </span>
                    </div>
                    <Progress value={(resource.used / resource.allocated) * 100} className="h-2" />
                  </div>
                ))}
              </TabsContent>

              <TabsContent value="timeline">
                <p className="text-muted-foreground">Timeline view coming soon...</p>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}
    </div>
  );
}