import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from '@/hooks/use-toast';
import {
  Calendar,
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  Clock,
  Users,
  MapPin,
  AlertTriangle,
  CheckCircle,
  Cloud,
  Wrench,
  FileText,
  ChevronLeft,
  ChevronRight,
  X,
  Sun,
  CloudRain,
  Snowflake
} from 'lucide-react';

interface ScheduleEvent {
  id: string;
  title: string;
  projectId: string;
  projectName: string;
  type: 'work' | 'maintenance' | 'meeting' | 'delivery';
  startDate: string;
  endDate: string;
  startTime: string;
  endTime: string;
  location: string;
  assignedCrew: string[];
  assignedEquipment: string[];
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled' | 'delayed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  weather: {
    condition: 'sunny' | 'cloudy' | 'rainy' | 'stormy' | 'snow';
    temperature: number;
    precipitation: number;
    windSpeed: number;
  };
  notes?: string;
  dependencies?: string[];
  conflicts?: Array<{
    type: 'crew' | 'equipment' | 'weather' | 'resource';
    description: string;
    severity: 'low' | 'medium' | 'high';
  }>;
}

interface ResourceAllocation {
  id: string;
  resourceId: string;
  resourceName: string;
  resourceType: 'crew' | 'equipment';
  eventId: string;
  startDate: string;
  endDate: string;
  utilizationHours: number;
}

export default function SchedulingSystemPage() {
  const { toast } = useToast();
  
  const [events, setEvents] = useState<ScheduleEvent[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<ScheduleEvent[]>([]);
  const [resourceAllocations, setResourceAllocations] = useState<ResourceAllocation[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<ScheduleEvent | null>(null);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'week' | 'month' | 'day'>('week');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('calendar');

  const [newEvent, setNewEvent] = useState({
    title: '',
    projectId: '',
    type: 'work' as ScheduleEvent['type'],
    startDate: '',
    endDate: '',
    startTime: '08:00',
    endTime: '17:00',
    location: '',
    assignedCrew: [] as string[],
    assignedEquipment: [] as string[],
    priority: 'medium' as ScheduleEvent['priority'],
    notes: ''
  });

  useEffect(() => {
    loadEvents();
    loadResourceAllocations();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [events, searchTerm, statusFilter, priorityFilter]);

  const loadEvents = async () => {
    // Mock data - in real implementation, fetch from Supabase
    const mockEvents: ScheduleEvent[] = [
      {
        id: '1',
        title: 'Site Preparation and Base Work',
        projectId: 'proj-1',
        projectName: 'First Baptist Church Parking Lot',
        type: 'work',
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        startTime: '07:00',
        endTime: '16:00',
        location: 'First Baptist Church, Richmond VA',
        assignedCrew: ['John Smith', 'Mike Johnson'],
        assignedEquipment: ['Caterpillar AP655F', 'Ford F-550 Dump Truck'],
        status: 'in_progress',
        priority: 'high',
        weather: {
          condition: 'sunny',
          temperature: 72,
          precipitation: 0,
          windSpeed: 5
        },
        notes: 'Weather conditions favorable for asphalt work',
        dependencies: [],
        conflicts: []
      },
      {
        id: '2',
        title: 'Equipment Maintenance - Roller Service',
        projectId: 'maint-1',
        projectName: 'Maintenance',
        type: 'maintenance',
        startDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        endDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        startTime: '08:00',
        endTime: '12:00',
        location: 'Service Center',
        assignedCrew: ['Mike Johnson'],
        assignedEquipment: ['Volvo DD140HF'],
        status: 'scheduled',
        priority: 'medium',
        weather: {
          condition: 'cloudy',
          temperature: 68,
          precipitation: 10,
          windSpeed: 8
        },
        notes: 'Hydraulic system repair and oil change',
        conflicts: [
          {
            type: 'equipment',
            description: 'Roller needed for Grace Methodist project same day',
            severity: 'medium'
          }
        ]
      },
      {
        id: '3',
        title: 'Sealcoating Application',
        projectId: 'proj-2',
        projectName: 'Grace Methodist Sealcoating',
        type: 'work',
        startDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        endDate: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        startTime: '06:00',
        endTime: '14:00',
        location: 'Grace Methodist Church, Richmond VA',
        assignedCrew: ['Sarah Davis', 'John Smith'],
        assignedEquipment: ['Ford F-550 Dump Truck'],
        status: 'scheduled',
        priority: 'medium',
        weather: {
          condition: 'rainy',
          temperature: 65,
          precipitation: 80,
          windSpeed: 12
        },
        notes: 'May need to reschedule due to rain forecast',
        conflicts: [
          {
            type: 'weather',
            description: 'High precipitation forecast - not suitable for sealcoating',
            severity: 'high'
          }
        ]
      }
    ];
    setEvents(mockEvents);
  };

  const loadResourceAllocations = async () => {
    // Mock resource allocation data
    const mockAllocations: ResourceAllocation[] = [
      {
        id: '1',
        resourceId: 'crew-1',
        resourceName: 'John Smith',
        resourceType: 'crew',
        eventId: '1',
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        utilizationHours: 72
      }
    ];
    setResourceAllocations(mockAllocations);
  };

  const applyFilters = () => {
    let filtered = events;

    if (searchTerm) {
      filtered = filtered.filter(event =>
        event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.projectName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.location.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(event => event.status === statusFilter);
    }

    if (priorityFilter !== 'all') {
      filtered = filtered.filter(event => event.priority === priorityFilter);
    }

    setFilteredEvents(filtered);
  };

  const createEvent = async () => {
    const event: ScheduleEvent = {
      id: Date.now().toString(),
      title: newEvent.title,
      projectId: newEvent.projectId,
      projectName: getProjectName(newEvent.projectId),
      type: newEvent.type,
      startDate: newEvent.startDate,
      endDate: newEvent.endDate,
      startTime: newEvent.startTime,
      endTime: newEvent.endTime,
      location: newEvent.location,
      assignedCrew: newEvent.assignedCrew,
      assignedEquipment: newEvent.assignedEquipment,
      status: 'scheduled',
      priority: newEvent.priority,
      weather: {
        condition: 'sunny',
        temperature: 70,
        precipitation: 0,
        windSpeed: 5
      },
      notes: newEvent.notes,
      dependencies: [],
      conflicts: detectConflicts(newEvent)
    };

    setEvents(prev => [...prev, event]);
    setIsCreateDialogOpen(false);
    
    // Reset form
    setNewEvent({
      title: '',
      projectId: '',
      type: 'work',
      startDate: '',
      endDate: '',
      startTime: '08:00',
      endTime: '17:00',
      location: '',
      assignedCrew: [],
      assignedEquipment: [],
      priority: 'medium',
      notes: ''
    });

    toast({
      title: "Event Scheduled",
      description: `${event.title} has been added to the schedule`,
    });
  };

  const deleteEvent = (eventId: string) => {
    setEvents(prev => prev.filter(event => event.id !== eventId));
    toast({
      title: "Event Cancelled",
      description: "Event has been removed from the schedule",
    });
  };

  const detectConflicts = (eventData: any): ScheduleEvent['conflicts'] => {
    const conflicts: ScheduleEvent['conflicts'] = [];
    
    // Check for crew conflicts
    events.forEach(existingEvent => {
      if (existingEvent.startDate === eventData.startDate) {
        const crewOverlap = existingEvent.assignedCrew.some(crew => 
          eventData.assignedCrew.includes(crew)
        );
        if (crewOverlap) {
          conflicts?.push({
            type: 'crew',
            description: 'Crew member already assigned to another task',
            severity: 'high'
          });
        }
      }
    });

    return conflicts;
  };

  const getProjectName = (projectId: string): string => {
    const projects = {
      'proj-1': 'First Baptist Church Parking Lot',
      'proj-2': 'Grace Methodist Sealcoating',
      'maint-1': 'Maintenance'
    };
    return projects[projectId as keyof typeof projects] || 'Unknown Project';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'text-blue-600 bg-blue-100';
      case 'in_progress': return 'text-green-600 bg-green-100';
      case 'completed': return 'text-gray-600 bg-gray-100';
      case 'cancelled': return 'text-red-600 bg-red-100';
      case 'delayed': return 'text-yellow-600 bg-yellow-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'text-red-600';
      case 'high': return 'text-orange-600';
      case 'medium': return 'text-blue-600';
      case 'low': return 'text-gray-600';
      default: return 'text-gray-600';
    }
  };

  const getWeatherIcon = (condition: string) => {
    switch (condition) {
      case 'sunny': return <Sun className="h-4 w-4 text-yellow-500" />;
      case 'cloudy': return <Cloud className="h-4 w-4 text-gray-500" />;
      case 'rainy': return <CloudRain className="h-4 w-4 text-blue-500" />;
      case 'snow': return <Snowflake className="h-4 w-4 text-blue-300" />;
      default: return <Cloud className="h-4 w-4 text-gray-500" />;
    }
  };

  const getConflictColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'text-red-600 bg-red-50 border-red-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'low': return 'text-blue-600 bg-blue-50 border-blue-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  };

  const navigateDate = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    if (viewMode === 'week') {
      newDate.setDate(newDate.getDate() + (direction === 'next' ? 7 : -7));
    } else if (viewMode === 'month') {
      newDate.setMonth(newDate.getMonth() + (direction === 'next' ? 1 : -1));
    } else {
      newDate.setDate(newDate.getDate() + (direction === 'next' ? 1 : -1));
    }
    setCurrentDate(newDate);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Calendar className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-3xl font-bold text-foreground">Scheduling System</h1>
              <p className="text-muted-foreground">
                Manage project timelines, resources, and optimize schedules
              </p>
            </div>
          </div>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Schedule Event
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Schedule New Event</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Event Title</label>
                    <Input
                      value={newEvent.title}
                      onChange={(e) => setNewEvent(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="Enter event title"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Type</label>
                    <Select value={newEvent.type} onValueChange={(value: any) => 
                      setNewEvent(prev => ({ ...prev, type: value }))
                    }>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="work">Work</SelectItem>
                        <SelectItem value="maintenance">Maintenance</SelectItem>
                        <SelectItem value="meeting">Meeting</SelectItem>
                        <SelectItem value="delivery">Delivery</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div>
                  <label className="text-sm font-medium">Project</label>
                  <Select value={newEvent.projectId} onValueChange={(value) => 
                    setNewEvent(prev => ({ ...prev, projectId: value }))
                  }>
                    <SelectTrigger>
                      <SelectValue placeholder="Select project" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="proj-1">First Baptist Church Parking Lot</SelectItem>
                      <SelectItem value="proj-2">Grace Methodist Sealcoating</SelectItem>
                      <SelectItem value="maint-1">Maintenance</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Start Date</label>
                    <Input
                      type="date"
                      value={newEvent.startDate}
                      onChange={(e) => setNewEvent(prev => ({ ...prev, startDate: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">End Date</label>
                    <Input
                      type="date"
                      value={newEvent.endDate}
                      onChange={(e) => setNewEvent(prev => ({ ...prev, endDate: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Start Time</label>
                    <Input
                      type="time"
                      value={newEvent.startTime}
                      onChange={(e) => setNewEvent(prev => ({ ...prev, startTime: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">End Time</label>
                    <Input
                      type="time"
                      value={newEvent.endTime}
                      onChange={(e) => setNewEvent(prev => ({ ...prev, endTime: e.target.value }))}
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium">Location</label>
                  <Input
                    value={newEvent.location}
                    onChange={(e) => setNewEvent(prev => ({ ...prev, location: e.target.value }))}
                    placeholder="Enter location"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">Priority</label>
                  <Select value={newEvent.priority} onValueChange={(value: any) => 
                    setNewEvent(prev => ({ ...prev, priority: value }))
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
                  <label className="text-sm font-medium">Notes</label>
                  <Input
                    value={newEvent.notes}
                    onChange={(e) => setNewEvent(prev => ({ ...prev, notes: e.target.value }))}
                    placeholder="Additional notes..."
                  />
                </div>

                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={createEvent}>
                    Schedule Event
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-4 flex-wrap">
              <div className="flex-1 min-w-[200px]">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search events..."
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
                  <SelectItem value="scheduled">Scheduled</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                  <SelectItem value="delayed">Delayed</SelectItem>
                </SelectContent>
              </Select>
              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priorities</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
              <div className="flex gap-1">
                <Button
                  variant={viewMode === 'day' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('day')}
                >
                  Day
                </Button>
                <Button
                  variant={viewMode === 'week' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('week')}
                >
                  Week
                </Button>
                <Button
                  variant={viewMode === 'month' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('month')}
                >
                  Month
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Calendar Navigation */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <Button variant="outline" onClick={() => navigateDate('prev')}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <h2 className="text-xl font-semibold">
                {currentDate.toLocaleDateString('en-US', { 
                  month: 'long', 
                  year: 'numeric',
                  ...(viewMode === 'day' && { day: 'numeric' })
                })}
              </h2>
              <Button variant="outline" onClick={() => navigateDate('next')}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="calendar">Calendar View</TabsTrigger>
            <TabsTrigger value="timeline">Timeline</TabsTrigger>
            <TabsTrigger value="resources">Resource Allocation</TabsTrigger>
            <TabsTrigger value="conflicts">Conflict Resolution</TabsTrigger>
          </TabsList>

          <TabsContent value="calendar" className="space-y-6">
            {/* Event List */}
            <div className="grid gap-4">
              {filteredEvents.map((event) => (
                <Card key={event.id} className="cursor-pointer hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 space-y-3">
                        <div className="flex items-center gap-3">
                          <h3 className="font-semibold text-lg">{event.title}</h3>
                          <Badge className={getStatusColor(event.status)}>
                            {event.status.replace('_', ' ')}
                          </Badge>
                          <Badge variant="outline" className={getPriorityColor(event.priority)}>
                            {event.priority}
                          </Badge>
                        </div>
                        
                        <div className="text-sm text-muted-foreground">
                          {event.projectName}
                        </div>

                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-3 w-3 text-muted-foreground" />
                            <span>{formatDate(event.startDate)} - {formatDate(event.endDate)}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="h-3 w-3 text-muted-foreground" />
                            <span>{event.startTime} - {event.endTime}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <MapPin className="h-3 w-3 text-muted-foreground" />
                            <span className="truncate">{event.location}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            {getWeatherIcon(event.weather.condition)}
                            <span>{event.weather.temperature}°F</span>
                            {event.weather.precipitation > 50 && (
                              <span className="text-blue-500">({event.weather.precipitation}%)</span>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-4 text-sm">
                          <div className="flex items-center gap-2">
                            <Users className="h-3 w-3 text-muted-foreground" />
                            <span>Crew: {event.assignedCrew.join(', ')}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Wrench className="h-3 w-3 text-muted-foreground" />
                            <span>Equipment: {event.assignedEquipment.length}</span>
                          </div>
                        </div>

                        {event.conflicts && event.conflicts.length > 0 && (
                          <div className="space-y-2">
                            <div className="text-sm font-medium text-red-600">Conflicts Detected</div>
                            {event.conflicts.map((conflict, index) => (
                              <div key={index} className={`p-2 rounded-md border text-sm ${getConflictColor(conflict.severity)}`}>
                                <div className="flex items-center gap-2">
                                  <AlertTriangle className="h-3 w-3" />
                                  <span className="font-medium capitalize">{conflict.type} Conflict</span>
                                  <Badge variant="outline" className="text-xs">
                                    {conflict.severity}
                                  </Badge>
                                </div>
                                <div className="mt-1 text-xs">{conflict.description}</div>
                              </div>
                            ))}
                          </div>
                        )}

                        {event.notes && (
                          <div className="text-sm">
                            <span className="font-medium">Notes: </span>
                            <span className="text-muted-foreground">{event.notes}</span>
                          </div>
                        )}
                      </div>

                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => deleteEvent(event.id)}>
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="timeline" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Project Timeline</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredEvents.map((event) => (
                    <div key={event.id} className="flex items-center gap-4 p-4 border rounded-md">
                      <div className="w-4 h-4 rounded-full bg-primary"></div>
                      <div className="flex-1">
                        <div className="font-medium">{event.title}</div>
                        <div className="text-sm text-muted-foreground">
                          {formatDate(event.startDate)} - {formatDate(event.endDate)}
                        </div>
                      </div>
                      <Badge className={getStatusColor(event.status)}>
                        {event.status.replace('_', ' ')}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="resources" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Resource Utilization</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <h4 className="font-medium mb-2">Crew Allocation</h4>
                      <div className="space-y-2">
                        {['John Smith', 'Mike Johnson', 'Sarah Davis'].map((crew) => (
                          <div key={crew} className="flex items-center justify-between p-2 border rounded">
                            <span>{crew}</span>
                            <Badge variant="outline">
                              {events.filter(e => e.assignedCrew.includes(crew)).length} assignments
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h4 className="font-medium mb-2">Equipment Allocation</h4>
                      <div className="space-y-2">
                        {['Caterpillar AP655F', 'Volvo DD140HF', 'Ford F-550 Dump Truck'].map((equipment) => (
                          <div key={equipment} className="flex items-center justify-between p-2 border rounded">
                            <span className="truncate">{equipment}</span>
                            <Badge variant="outline">
                              {events.filter(e => e.assignedEquipment.includes(equipment)).length} assignments
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="conflicts" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Schedule Conflicts</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {events.filter(e => e.conflicts && e.conflicts.length > 0).map((event) => (
                    <div key={event.id} className="p-4 border rounded-md">
                      <div className="font-medium mb-2">{event.title}</div>
                      <div className="space-y-2">
                        {event.conflicts?.map((conflict, index) => (
                          <div key={index} className={`p-2 rounded border ${getConflictColor(conflict.severity)}`}>
                            <div className="flex items-center justify-between">
                              <span className="font-medium capitalize">{conflict.type} Conflict</span>
                              <Badge variant="outline" className="text-xs">
                                {conflict.severity}
                              </Badge>
                            </div>
                            <div className="text-sm mt-1">{conflict.description}</div>
                            <div className="flex gap-2 mt-2">
                              <Button size="sm" variant="outline">
                                Resolve
                              </Button>
                              <Button size="sm" variant="outline">
                                Reschedule
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                  {events.filter(e => e.conflicts && e.conflicts.length > 0).length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      <CheckCircle className="h-12 w-12 mx-auto mb-2 text-green-500" />
                      <div>No conflicts detected</div>
                      <div className="text-sm">All scheduled events are properly allocated</div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {filteredEvents.length === 0 && (
          <Card>
            <CardContent className="text-center py-12">
              <Calendar className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Events Found</h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm || statusFilter !== 'all' || priorityFilter !== 'all'
                  ? 'No events match your current filters'
                  : 'Schedule your first event to get started'
                }
              </p>
              {(!searchTerm && statusFilter === 'all' && priorityFilter === 'all') && (
                <Button onClick={() => setIsCreateDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Schedule Event
                </Button>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}