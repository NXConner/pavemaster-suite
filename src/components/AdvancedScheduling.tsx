import { useState } from "react";
import { Calendar, Clock, Users, Truck, MapPin, Cloud, AlertTriangle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

interface ScheduleItem {
  id: string;
  projectName: string;
  location: string;
  startTime: string;
  endTime: string;
  crew: string[];
  equipment: string[];
  status: 'scheduled' | 'in-progress' | 'completed' | 'delayed' | 'cancelled';
  weather: 'optimal' | 'marginal' | 'poor';
  priority: 'low' | 'medium' | 'high' | 'urgent';
}

export function AdvancedScheduling() {
  const { toast } = useToast();
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [viewMode, setViewMode] = useState<'day' | 'week' | 'month'>('week');

  const mockSchedule: ScheduleItem[] = [
    {
      id: "1",
      projectName: "Highway 101 Resurfacing",
      location: "San Francisco, CA",
      startTime: "07:00",
      endTime: "16:00",
      crew: ["John Smith", "Mike Johnson", "Sarah Davis"],
      equipment: ["Paver-001", "Roller-003", "Truck-007"],
      status: 'scheduled',
      weather: 'optimal',
      priority: 'high'
    },
    {
      id: "2",
      projectName: "Shopping Center Parking",
      location: "Oakland, CA", 
      startTime: "08:00",
      endTime: "15:00",
      crew: ["Tom Wilson", "Lisa Chen"],
      equipment: ["Sealcoat-002", "Striping-001"],
      status: 'in-progress',
      weather: 'marginal',
      priority: 'medium'
    },
    {
      id: "3",
      projectName: "Industrial Park Access",
      location: "San Jose, CA",
      startTime: "09:00", 
      endTime: "17:00",
      crew: ["David Brown", "Jennifer Lee", "Carlos Rodriguez"],
      equipment: ["Paver-002", "Truck-005"],
      status: 'scheduled',
      weather: 'poor',
      priority: 'urgent'
    }
  ];

  const getStatusColor = (status: string) => {
    const colors = {
      scheduled: 'bg-blue-100 text-blue-800 border-blue-200',
      'in-progress': 'bg-green-100 text-green-800 border-green-200',
      completed: 'bg-gray-100 text-gray-800 border-gray-200',
      delayed: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      cancelled: 'bg-red-100 text-red-800 border-red-200'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getWeatherIcon = (weather: string) => {
    if (weather === 'poor') return <AlertTriangle className="h-4 w-4 text-red-500" />;
    if (weather === 'marginal') return <Cloud className="h-4 w-4 text-yellow-500" />;
    return <Cloud className="h-4 w-4 text-green-500" />;
  };

  const getPriorityColor = (priority: string) => {
    const colors = {
      low: 'bg-green-500',
      medium: 'bg-yellow-500', 
      high: 'bg-orange-500',
      urgent: 'bg-red-500'
    };
    return colors[priority as keyof typeof colors];
  };

  const handleReschedule = (itemId: string) => {
    toast({
      title: "Reschedule Requested",
      description: "Scheduling system will optimize based on weather and resource availability.",
    });
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <Calendar className="h-5 w-5" />
            <span>Advanced Scheduling System</span>
          </CardTitle>
          <div className="flex items-center space-x-2">
            <Select value={viewMode} onValueChange={(value: 'day' | 'week' | 'month') => setViewMode(value)}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="day">Day View</SelectItem>
                <SelectItem value="week">Week View</SelectItem>
                <SelectItem value="month">Month View</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm">
              Auto-Optimize
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs value={viewMode} onValueChange={(value: string) => setViewMode(value as 'day' | 'week' | 'month')}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="day">Today</TabsTrigger>
            <TabsTrigger value="week">This Week</TabsTrigger>
            <TabsTrigger value="month">This Month</TabsTrigger>
          </TabsList>
          
          <TabsContent value="week" className="space-y-4">
            <div className="grid gap-4">
              {mockSchedule.map((item) => (
                <Card key={item.id} className="p-4 border-l-4" style={{borderLeftColor: `var(--${getPriorityColor(item.priority).replace('bg-', '')})`}}>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h3 className="font-semibold text-foreground">{item.projectName}</h3>
                        <Badge variant="outline" className={getStatusColor(item.status)}>
                          {item.status}
                        </Badge>
                        {getWeatherIcon(item.weather)}
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center space-x-2">
                          <MapPin className="h-4 w-4" />
                          <span>{item.location}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Clock className="h-4 w-4" />
                          <span>{item.startTime} - {item.endTime}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Users className="h-4 w-4" />
                          <span>{item.crew.length} crew members</span>
                        </div>
                      </div>
                      
                      <div className="mt-3 flex flex-wrap gap-2">
                        <div className="text-xs">
                          <span className="font-medium">Crew:</span> {item.crew.join(", ")}
                        </div>
                      </div>
                      
                      <div className="mt-2 flex flex-wrap gap-2">
                        <div className="text-xs">
                          <span className="font-medium">Equipment:</span> {item.equipment.join(", ")}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm" onClick={() => handleReschedule(item.id)}>
                        Reschedule
                      </Button>
                      <Button variant="outline" size="sm">
                        Details
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="day" className="space-y-4">
            <div className="text-center text-muted-foreground py-8">
              <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Day view scheduling interface would be implemented here</p>
            </div>
          </TabsContent>
          
          <TabsContent value="month" className="space-y-4">
            <div className="text-center text-muted-foreground py-8">
              <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Month view calendar interface would be implemented here</p>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}