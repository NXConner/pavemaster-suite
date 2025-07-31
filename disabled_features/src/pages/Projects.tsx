import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import {
  FolderOpen,
  Plus,
  Edit,
  Trash2,
  Calendar,
  MapPin,
  Users,
  DollarSign,
  Clock,
  CheckCircle,
  AlertTriangle,
  TrendingUp,
  FileText,
  Camera,
  Settings,
  Filter,
  Search,
  Star,
  MoreHorizontal
} from 'lucide-react';

interface Project {
  id: string;
  name: string;
  description: string;
  status: 'planning' | 'active' | 'on_hold' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  clientName: string;
  clientContact: string;
  location: string;
  coordinates?: { lat: number; lng: number };
  startDate: string;
  endDate: string;
  estimatedCost: number;
  actualCost: number;
  progress: number;
  assignedCrew: string[];
  projectType: 'new_construction' | 'resurfacing' | 'sealcoating' | 'striping' | 'repairs';
  area: number; // square feet
  materials: {
    asphalt?: number;
    sealcoat?: number;
    striping?: number;
  };
  milestones: Array<{
    id: string;
    name: string;
    dueDate: string;
    completed: boolean;
    completedDate?: string;
  }>;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export default function ProjectsPage() {
  const { toast } = useToast();
  const [projects, setProjects] = useState<Project[]>([]);
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');

  const [newProject, setNewProject] = useState<Partial<Project>>({
    name: '',
    description: '',
    status: 'planning',
    priority: 'medium',
    clientName: '',
    clientContact: '',
    location: '',
    startDate: '',
    endDate: '',
    estimatedCost: 0,
    projectType: 'resurfacing',
    area: 0,
    materials: {},
    milestones: [],
    notes: '',
    assignedCrew: []
  });

  useEffect(() => {
    loadProjects();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [projects, searchTerm, statusFilter, priorityFilter]);

  const loadProjects = async () => {
    // Mock data - in real implementation, fetch from Supabase
    const mockProjects: Project[] = [
      {
        id: '1',
        name: 'First Baptist Church Parking Lot',
        description: 'Complete resurfacing and striping of main parking area',
        status: 'active',
        priority: 'high',
        clientName: 'First Baptist Church',
        clientContact: 'Pastor Smith - (555) 123-4567',
        location: '123 Church St, Richmond, VA',
        coordinates: { lat: 37.5407, lng: -77.4360 },
        startDate: '2024-02-01',
        endDate: '2024-02-15',
        estimatedCost: 45000,
        actualCost: 42000,
        progress: 75,
        assignedCrew: ['John Smith', 'Mike Johnson', 'Sarah Davis'],
        projectType: 'resurfacing',
        area: 12500,
        materials: {
          asphalt: 25.5,
          sealcoat: 0,
          striping: 850
        },
        milestones: [
          {
            id: '1',
            name: 'Site Preparation',
            dueDate: '2024-02-03',
            completed: true,
            completedDate: '2024-02-02'
          },
          {
            id: '2',
            name: 'Asphalt Installation',
            dueDate: '2024-02-10',
            completed: true,
            completedDate: '2024-02-09'
          },
          {
            id: '3',
            name: 'Line Striping',
            dueDate: '2024-02-14',
            completed: false
          },
          {
            id: '4',
            name: 'Final Inspection',
            dueDate: '2024-02-15',
            completed: false
          }
        ],
        notes: 'Client wants extra wide handicap spaces. Weather dependent completion.',
        createdAt: '2024-01-15T10:00:00Z',
        updatedAt: '2024-02-08T14:30:00Z'
      },
      {
        id: '2',
        name: 'Grace Methodist Sealcoating',
        description: 'Sealcoating and crack repair for existing parking lot',
        status: 'planning',
        priority: 'medium',
        clientName: 'Grace Methodist Church',
        clientContact: 'Rev. Johnson - (555) 234-5678',
        location: '456 Methodist Ave, Richmond, VA',
        startDate: '2024-02-20',
        endDate: '2024-02-22',
        estimatedCost: 8500,
        actualCost: 0,
        progress: 15,
        assignedCrew: ['Tom Wilson'],
        projectType: 'sealcoating',
        area: 8000,
        materials: {
          sealcoat: 8.0,
          striping: 200
        },
        milestones: [
          {
            id: '1',
            name: 'Site Assessment',
            dueDate: '2024-02-18',
            completed: false
          },
          {
            id: '2',
            name: 'Crack Repair',
            dueDate: '2024-02-20',
            completed: false
          },
          {
            id: '3',
            name: 'Sealcoat Application',
            dueDate: '2024-02-21',
            completed: false
          }
        ],
        notes: 'Small budget project. Weather permitting.',
        createdAt: '2024-01-20T09:00:00Z',
        updatedAt: '2024-01-22T16:45:00Z'
      }
    ];
    setProjects(mockProjects);
  };

  const applyFilters = () => {
    let filtered = projects;

    if (searchTerm) {
      filtered = filtered.filter(project =>
        project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.location.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(project => project.status === statusFilter);
    }

    if (priorityFilter !== 'all') {
      filtered = filtered.filter(project => project.priority === priorityFilter);
    }

    setFilteredProjects(filtered);
  };

  const createProject = async () => {
    const project: Project = {
      ...newProject,
      id: Date.now().toString(),
      progress: 0,
      actualCost: 0,
      assignedCrew: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    } as Project;

    setProjects(prev => [...prev, project]);
    setNewProject({
      name: '',
      description: '',
      status: 'planning',
      priority: 'medium',
      clientName: '',
      clientContact: '',
      location: '',
      startDate: '',
      endDate: '',
      estimatedCost: 0,
      projectType: 'resurfacing',
      area: 0,
      materials: {},
      milestones: [],
      notes: '',
      assignedCrew: []
    });
    setIsCreateDialogOpen(false);

    toast({
      title: "Project Created",
      description: `${project.name} has been created successfully`,
    });
  };

  const updateProject = async (updatedProject: Project) => {
    setProjects(prev =>
      prev.map(p => p.id === updatedProject.id
        ? { ...updatedProject, updatedAt: new Date().toISOString() }
        : p
      )
    );

    toast({
      title: "Project Updated",
      description: `${updatedProject.name} has been updated`,
    });
  };

  const deleteProject = async (projectId: string) => {
    setProjects(prev => prev.filter(p => p.id !== projectId));
    toast({
      title: "Project Deleted",
      description: "Project has been removed from the system",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'planning': return 'bg-blue-500';
      case 'active': return 'bg-green-500';
      case 'on_hold': return 'bg-yellow-500';
      case 'completed': return 'bg-gray-500';
      case 'cancelled': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'low': return 'text-green-600';
      case 'medium': return 'text-yellow-600';
      case 'high': return 'text-orange-600';
      case 'urgent': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getProjectTypeIcon = (type: string) => {
    switch (type) {
      case 'new_construction': return '🏗️';
      case 'resurfacing': return '🛣️';
      case 'sealcoating': return '🖤';
      case 'striping': return '🎨';
      case 'repairs': return '🔧';
      default: return '📋';
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <FolderOpen className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-3xl font-bold text-foreground">Project Management</h1>
              <p className="text-muted-foreground">
                Manage asphalt paving projects from planning to completion
              </p>
            </div>
          </div>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                New Project
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create New Project</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Project Name</label>
                    <Input
                      value={newProject.name}
                      onChange={(e) => setNewProject(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Enter project name"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Client Name</label>
                    <Input
                      value={newProject.clientName}
                      onChange={(e) => setNewProject(prev => ({ ...prev, clientName: e.target.value }))}
                      placeholder="Enter client name"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="text-sm font-medium">Description</label>
                  <Textarea
                    value={newProject.description}
                    onChange={(e) => setNewProject(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Project description"
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="text-sm font-medium">Project Type</label>
                    <Select value={newProject.projectType} onValueChange={(value: any) => 
                      setNewProject(prev => ({ ...prev, projectType: value }))
                    }>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="new_construction">New Construction</SelectItem>
                        <SelectItem value="resurfacing">Resurfacing</SelectItem>
                        <SelectItem value="sealcoating">Sealcoating</SelectItem>
                        <SelectItem value="striping">Line Striping</SelectItem>
                        <SelectItem value="repairs">Repairs</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Priority</label>
                    <Select value={newProject.priority} onValueChange={(value: any) => 
                      setNewProject(prev => ({ ...prev, priority: value }))
                    }>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="urgent">Urgent</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Area (sq ft)</label>
                    <Input
                      type="number"
                      value={newProject.area}
                      onChange={(e) => setNewProject(prev => ({ ...prev, area: Number(e.target.value) }))}
                      placeholder="0"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Start Date</label>
                    <Input
                      type="date"
                      value={newProject.startDate}
                      onChange={(e) => setNewProject(prev => ({ ...prev, startDate: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">End Date</label>
                    <Input
                      type="date"
                      value={newProject.endDate}
                      onChange={(e) => setNewProject(prev => ({ ...prev, endDate: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Location</label>
                    <Input
                      value={newProject.location}
                      onChange={(e) => setNewProject(prev => ({ ...prev, location: e.target.value }))}
                      placeholder="Project location"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Estimated Cost</label>
                    <Input
                      type="number"
                      value={newProject.estimatedCost}
                      onChange={(e) => setNewProject(prev => ({ ...prev, estimatedCost: Number(e.target.value) }))}
                      placeholder="0"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium">Client Contact</label>
                  <Input
                    value={newProject.clientContact}
                    onChange={(e) => setNewProject(prev => ({ ...prev, clientContact: e.target.value }))}
                    placeholder="Contact information"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">Notes</label>
                  <Textarea
                    value={newProject.notes}
                    onChange={(e) => setNewProject(prev => ({ ...prev, notes: e.target.value }))}
                    placeholder="Additional notes"
                  />
                </div>

                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={createProject}>
                    Create Project
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Filters and Search */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-4 flex-wrap">
              <div className="flex-1 min-w-[200px]">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search projects..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="planning">Planning</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="on_hold">On Hold</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priority</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Project Stats */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <FolderOpen className="h-5 w-5 text-blue-500" />
                <div>
                  <div className="text-2xl font-bold">
                    {projects.filter(p => p.status === 'active').length}
                  </div>
                  <div className="text-sm text-muted-foreground">Active Projects</div>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-yellow-500" />
                <div>
                  <div className="text-2xl font-bold">
                    {projects.filter(p => p.status === 'planning').length}
                  </div>
                  <div className="text-sm text-muted-foreground">In Planning</div>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <div>
                  <div className="text-2xl font-bold">
                    {projects.filter(p => p.status === 'completed').length}
                  </div>
                  <div className="text-sm text-muted-foreground">Completed</div>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-primary" />
                <div>
                  <div className="text-2xl font-bold">
                    ${projects.reduce((sum, p) => sum + p.estimatedCost, 0).toLocaleString()}
                  </div>
                  <div className="text-sm text-muted-foreground">Total Value</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Projects Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredProjects.map((project) => (
            <Card key={project.id} className="cursor-pointer hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{getProjectTypeIcon(project.projectType)}</span>
                    <span className="truncate">{project.name}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className={`w-2 h-2 rounded-full ${getStatusColor(project.status)}`}></div>
                    <Badge variant="outline" className={getPriorityColor(project.priority)}>
                      {project.priority}
                    </Badge>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-sm text-muted-foreground line-clamp-2">
                  {project.description}
                </div>
                
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span className="truncate">{project.clientName}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span className="truncate">{project.location}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>{new Date(project.startDate).toLocaleDateString()} - {new Date(project.endDate).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                    <span>${project.estimatedCost.toLocaleString()}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center text-sm">
                    <span>Progress</span>
                    <span>{project.progress}%</span>
                  </div>
                  <Progress value={project.progress} className="h-2" />
                </div>

                <div className="flex justify-between items-center">
                  <Badge variant="outline" className="capitalize">
                    {project.status.replace('_', ' ')}
                  </Badge>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="sm" onClick={() => setSelectedProject(project)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => deleteProject(project.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredProjects.length === 0 && (
          <Card>
            <CardContent className="text-center py-12">
              <FolderOpen className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Projects Found</h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm || statusFilter !== 'all' || priorityFilter !== 'all'
                  ? 'No projects match your current filters'
                  : 'Create your first project to get started'
                }
              </p>
              {(!searchTerm && statusFilter === 'all' && priorityFilter === 'all') && (
                <Button onClick={() => setIsCreateDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Project
                </Button>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}