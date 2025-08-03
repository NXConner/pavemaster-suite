
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';

import {
  Clock,
  MapPin,
  Users,
  Truck,
  CloudRain,
  AlertTriangle,
  Plus,
  CalendarDays,
  Zap,
} from 'lucide-react';

export default function Schedule() {
  const [activeTab, setActiveTab] = useState('calendar');

  const mockEvents = [
    {
      id: 'SCH001',
      title: 'Base Layer Preparation - First Baptist Church',
      description: 'Excavation, grading, and compaction of base materials',
      start_date: '2024-01-16T08:00:00Z',
      end_date: '2024-01-16T17:00:00Z',
      status: 'scheduled',
      priority: 'high',
      location: { address: '123 Church Street, Richmond, VA' },
      assigned_crew: ['John Mitchell', 'Mike Johnson', 'Tom Wilson'],
      equipment_needed: ['Excavator', 'Compactor', 'Grade Laser'],
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Advanced Schedule Management</h1>
          <p className="text-muted-foreground">Weather-integrated project scheduling with resource optimization</p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Schedule Event
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="calendar">Calendar View</TabsTrigger>
          <TabsTrigger value="weather">Weather Integration</TabsTrigger>
          <TabsTrigger value="resources">Resource Planning</TabsTrigger>
          <TabsTrigger value="zapier">Zapier Integration</TabsTrigger>
        </TabsList>

        <TabsContent value="calendar" className="space-y-6">
          <div className="space-y-4">
            {mockEvents.map((event) => (
              <Card key={event.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <CalendarDays className="h-4 w-4" />
                        <CardTitle className="text-lg">{event.title}</CardTitle>
                        <Badge variant="destructive">{event.priority}</Badge>
                        <Badge variant="secondary">{event.status}</Badge>
                      </div>
                      <CardDescription className="flex items-center gap-2">
                        <Clock className="h-3 w-3" />
                        {new Date(event.start_date).toLocaleString()} - {new Date(event.end_date).toLocaleString()}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">{event.description}</p>

                  <div className="grid gap-4 md:grid-cols-3">
                    <div>
                      <div className="flex items-center gap-2 text-sm font-medium mb-1">
                        <MapPin className="h-3 w-3" />
                        Location
                      </div>
                      <p className="text-sm text-muted-foreground">{event.location.address}</p>
                    </div>

                    <div>
                      <div className="flex items-center gap-2 text-sm font-medium mb-1">
                        <Users className="h-3 w-3" />
                        Assigned Crew ({event.assigned_crew.length})
                      </div>
                      <p className="text-sm text-muted-foreground">{event.assigned_crew.join(', ')}</p>
                    </div>

                    <div>
                      <div className="flex items-center gap-2 text-sm font-medium mb-1">
                        <Truck className="h-3 w-3" />
                        Equipment ({event.equipment_needed.length})
                      </div>
                      <p className="text-sm text-muted-foreground">{event.equipment_needed.join(', ')}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="weather" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CloudRain className="h-5 w-5" />
                Weather Forecast Integration
              </CardTitle>
              <CardDescription>Weather conditions for scheduled work</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-start gap-3 p-3 bg-red-50 dark:bg-red-950 rounded-lg">
                <AlertTriangle className="h-4 w-4 text-red-600 mt-0.5" />
                <div>
                  <p className="font-medium text-red-800 dark:text-red-200">Weather Alert</p>
                  <p className="text-sm text-red-600 dark:text-red-300">
                    High precipitation chance may affect scheduled asphalt work
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="resources" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Crew Allocation
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {['John Mitchell', 'Mike Johnson', 'Sarah Davis'].map((crew, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">{crew}</p>
                        <p className="text-sm text-muted-foreground">Available</p>
                      </div>
                      <Badge variant="outline">85% utilized</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Truck className="h-5 w-5" />
                  Equipment Schedule
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {['Paver', 'Excavator', 'Compactor'].map((equipment, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">{equipment}</p>
                        <p className="text-sm text-muted-foreground">Available</p>
                      </div>
                      <Badge variant="default">Available</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="zapier" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                Schedule Zapier Integration
              </CardTitle>
              <CardDescription>Automate schedule notifications and updates</CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full">
                <Zap className="h-4 w-4 mr-2" />
                Configure Schedule Integration
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}