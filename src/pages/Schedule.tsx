import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CalendarDays, Plus, Clock, Users, MapPin, Sun, CloudRain, AlertTriangle } from 'lucide-react';

interface ScheduledJob {
  id: string;
  title: string;
  customer: string;
  location: string;
  date: string;
  startTime: string;
  endTime: string;
  status: 'scheduled' | 'in-progress' | 'completed' | 'cancelled' | 'delayed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  crew: string[];
  equipment: string[];
  weatherSensitive: boolean;
  estimatedDuration: number; // in hours
  notes?: string;
}

interface WeatherAlert {
  date: string;
  condition: string;
  severity: 'low' | 'medium' | 'high';
  impact: string;
}

export default function Schedule() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [viewMode, setViewMode] = useState<'day' | 'week' | 'month'>('week');

  // Mock data
  const scheduledJobs: ScheduledJob[] = [
    {
      id: '1',
      title: 'Sealcoating - First Baptist Church',
      customer: 'First Baptist Church',
      location: '123 Church St, Richmond, VA',
      date: '2024-01-22',
      startTime: '08:00',
      endTime: '16:00',
      status: 'scheduled',
      priority: 'high',
      crew: ['John Smith', 'Maria Rodriguez'],
      equipment: ['Sealcoat Sprayer #1', 'Line Striper'],
      weatherSensitive: true,
      estimatedDuration: 8,
      notes: 'Need to coordinate with church service schedule'
    },
    {
      id: '2',
      title: 'Crack Sealing - Trinity Methodist',
      customer: 'Trinity Methodist Church',
      location: '456 Faith Ave, Richmond, VA',
      date: '2024-01-22',
      startTime: '09:00',
      endTime: '13:00',
      status: 'in-progress',
      priority: 'medium',
      crew: ['David Johnson'],
      equipment: ['Crack Sealing Machine'],
      weatherSensitive: false,
      estimatedDuration: 4
    },
    {
      id: '3',
      title: 'Line Striping - Grace Community',
      customer: 'Grace Community Church',
      location: '789 Hope Blvd, Richmond, VA',
      date: '2024-01-23',
      startTime: '10:00',
      endTime: '14:00',
      status: 'scheduled',
      priority: 'low',
      crew: ['Mike Wilson', 'John Smith'],
      equipment: ['Line Striper'],
      weatherSensitive: true,
      estimatedDuration: 4
    }
  ];

  const weatherAlerts: WeatherAlert[] = [
    {
      date: '2024-01-22',
      condition: 'Light Rain Expected',
      severity: 'medium',
      impact: 'May delay sealcoating work'
    },
    {
      date: '2024-01-24',
      condition: 'High Winds',
      severity: 'high',
      impact: 'Line striping not recommended'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-success text-success-foreground';
      case 'in-progress': return 'bg-warning text-warning-foreground';
      case 'scheduled': return 'bg-info text-info-foreground';
      case 'cancelled': return 'bg-destructive text-destructive-foreground';
      case 'delayed': return 'bg-orange-500 text-white';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getWeatherSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'bg-red-100 border-red-300 text-red-800';
      case 'medium': return 'bg-yellow-100 border-yellow-300 text-yellow-800';
      case 'low': return 'bg-blue-100 border-blue-300 text-blue-800';
      default: return 'bg-gray-100 border-gray-300 text-gray-800';
    }
  };

  const selectedDateJobs = scheduledJobs.filter(
    job => job.date === selectedDate.toISOString().split('T')[0]
  );

  const thisWeekJobs = scheduledJobs.filter(job => {
    const jobDate = new Date(job.date);
    const startOfWeek = new Date(selectedDate);
    startOfWeek.setDate(selectedDate.getDate() - selectedDate.getDay());
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    return jobDate >= startOfWeek && jobDate <= endOfWeek;
  });

  const todayJobs = scheduledJobs.filter(
    job => job.date === new Date().toISOString().split('T')[0]
  );

  const upcomingJobs = scheduledJobs.filter(job => {
    const jobDate = new Date(job.date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return jobDate >= today;
  }).slice(0, 5);

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <CalendarDays className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold text-foreground">Schedule</h1>
            <p className="text-muted-foreground">Manage jobs, crews, and equipment scheduling</p>
          </div>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Schedule Job
        </Button>
      </div>

      {/* Weather Alerts */}
      {weatherAlerts.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-yellow-600" />
            Weather Alerts
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {weatherAlerts.map((alert, index) => (
              <div
                key={index}
                className={`p-4 rounded-lg border ${getWeatherSeverityColor(alert.severity)}`}
              >
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold">{alert.condition}</h4>
                  <span className="text-sm">{new Date(alert.date).toLocaleDateString()}</span>
                </div>
                <p className="text-sm">{alert.impact}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Calendar</CardTitle>
            <CardDescription>Select a date to view scheduled jobs</CardDescription>
          </CardHeader>
          <CardContent>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={(date) => date && setSelectedDate(date)}
              className="rounded-md border"
              modifiers={{
                hasJobs: scheduledJobs.map(job => new Date(job.date))
              }}
              modifiersClassNames={{
                hasJobs: "bg-primary text-primary-foreground"
              }}
            />
          </CardContent>
        </Card>

        {/* Schedule Overview */}
        <div className="lg:col-span-2 space-y-6">
          {/* Today's Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Today's Schedule</CardTitle>
              <CardDescription>{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</CardDescription>
            </CardHeader>
            <CardContent>
              {todayJobs.length > 0 ? (
                <div className="space-y-4">
                  {todayJobs.map((job) => (
                    <div key={job.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex-1">
                        <h4 className="font-semibold">{job.title}</h4>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {job.startTime} - {job.endTime}
                          </span>
                          <span className="flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            {job.crew.length} crew
                          </span>
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {job.customer}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${getPriorityColor(job.priority)}`} />
                        <Badge className={getStatusColor(job.status)}>
                          {job.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-8">No jobs scheduled for today</p>
              )}
            </CardContent>
          </Card>

          {/* Upcoming Jobs */}
          <Card>
            <CardHeader>
              <CardTitle>Upcoming Jobs</CardTitle>
              <CardDescription>Next 5 scheduled jobs</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {upcomingJobs.map((job) => (
                  <div key={job.id} className="flex items-center justify-between p-3 border rounded-lg hover:shadow-md transition-shadow cursor-pointer">
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold">{job.title}</h4>
                        <div className="flex items-center gap-2">
                          <div className={`w-3 h-3 rounded-full ${getPriorityColor(job.priority)}`} />
                          <Badge className={getStatusColor(job.status)}>
                            {job.status}
                          </Badge>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <CalendarDays className="h-3 w-3" />
                          {new Date(job.date).toLocaleDateString()}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {job.startTime} - {job.endTime}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {job.customer}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 mt-2 text-sm">
                        <span className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          {job.crew.join(', ')}
                        </span>
                        {job.weatherSensitive && (
                          <span className="flex items-center gap-1 text-yellow-600">
                            <Sun className="h-3 w-3" />
                            Weather Sensitive
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Selected Date Jobs */}
      {selectedDateJobs.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Jobs for {selectedDate.toLocaleDateString()}</CardTitle>
            <CardDescription>{selectedDateJobs.length} job(s) scheduled</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {selectedDateJobs.map((job) => (
                <Card key={job.id} className="border-l-4 border-l-primary">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">{job.title}</CardTitle>
                        <CardDescription>{job.customer}</CardDescription>
                      </div>
                      <Badge className={getStatusColor(job.status)}>
                        {job.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="text-sm space-y-1">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span>{job.startTime} - {job.endTime} ({job.estimatedDuration}h)</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span className="truncate">{job.location}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <span>{job.crew.join(', ')}</span>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <h5 className="text-sm font-medium">Equipment:</h5>
                      <div className="flex flex-wrap gap-1">
                        {job.equipment.map((item, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {item}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {job.notes && (
                      <div className="text-sm text-muted-foreground">
                        <strong>Notes:</strong> {job.notes}
                      </div>
                    )}

                    <div className="flex gap-2 pt-2">
                      <Button variant="outline" size="sm" className="flex-1">
                        Edit
                      </Button>
                      <Button size="sm" className="flex-1">
                        Start Job
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}