import { useState } from 'react';
import { Users, Phone, Clock, MapPin, Award, Settings, Plus, Search } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';

interface CrewMember {
  id: string;
  name: string;
  role: string;
  phone: string;
  email: string;
  status: 'available' | 'busy' | 'off-duty' | 'on-leave';
  location: string;
  skills: string[];
  rating: number;
  hoursThisWeek: number;
  currentProject?: string;
  certifications: string[];
  experience: number; // years
}

interface CrewTeam {
  id: string;
  name: string;
  leader: string;
  members: string[];
  status: 'active' | 'standby' | 'assigned';
  currentProject?: string;
  specialization: string;
}

export function CrewManagement() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const crewMembers: CrewMember[] = [
    {
      id: '1',
      name: 'John Smith',
      role: 'Crew Leader',
      phone: '(555) 123-4567',
      email: 'john.smith@company.com',
      status: 'busy',
      location: 'Highway 101 Site',
      skills: ['Asphalt Paving', 'Equipment Operation', 'Team Leadership'],
      rating: 4.8,
      hoursThisWeek: 42,
      currentProject: 'Highway 101 Resurfacing',
      certifications: ['CDL', 'Safety Training', 'Equipment Operator'],
      experience: 8,
    },
    {
      id: '2',
      name: 'Mike Johnson',
      role: 'Equipment Operator',
      phone: '(555) 234-5678',
      email: 'mike.johnson@company.com',
      status: 'available',
      location: 'Base Yard',
      skills: ['Paver Operation', 'Roller Operation', 'Maintenance'],
      rating: 4.6,
      hoursThisWeek: 38,
      certifications: ['CDL', 'Equipment Operator', 'Hydraulics'],
      experience: 12,
    },
    {
      id: '3',
      name: 'Sarah Davis',
      role: 'Quality Inspector',
      phone: '(555) 345-6789',
      email: 'sarah.davis@company.com',
      status: 'busy',
      location: 'Shopping Center Site',
      skills: ['Quality Control', 'Testing', 'Documentation'],
      rating: 4.9,
      hoursThisWeek: 40,
      currentProject: 'Shopping Center Parking',
      certifications: ['Quality Inspector', 'Materials Testing', 'Safety'],
      experience: 6,
    },
    {
      id: '4',
      name: 'Tom Wilson',
      role: 'Truck Driver',
      phone: '(555) 456-7890',
      email: 'tom.wilson@company.com',
      status: 'available',
      location: 'En Route',
      skills: ['Heavy Vehicle Operation', 'Material Transport', 'Route Planning'],
      rating: 4.7,
      hoursThisWeek: 35,
      certifications: ['CDL Class A', 'Hazmat', 'Safety Training'],
      experience: 15,
    },
  ];

  const teams: CrewTeam[] = [
    {
      id: '1',
      name: 'Alpha Team',
      leader: 'John Smith',
      members: ['1', '2', '3'],
      status: 'assigned',
      currentProject: 'Highway 101 Resurfacing',
      specialization: 'Highway Paving',
    },
    {
      id: '2',
      name: 'Beta Team',
      leader: 'Sarah Davis',
      members: ['4'],
      status: 'active',
      currentProject: 'Shopping Center Parking',
      specialization: 'Commercial Paving',
    },
  ];

  const getStatusColor = (status: string) => {
    const colors = {
      available: 'bg-green-100 text-green-800 border-green-200',
      busy: 'bg-blue-100 text-blue-800 border-blue-200',
      'off-duty': 'bg-gray-100 text-gray-800 border-gray-200',
      'on-leave': 'bg-yellow-100 text-yellow-800 border-yellow-200',
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getRatingStars = (rating: number) => {
    return '★'.repeat(Math.floor(rating)) + '☆'.repeat(5 - Math.floor(rating));
  };

  const filteredMembers = crewMembers.filter(member => {
    const matchesSearch = member.name.toLowerCase().includes(searchTerm.toLowerCase())
                         || member.role.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || member.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleAssignProject = (memberId: string) => {
    toast({
      title: 'Assignment Updated',
      description: 'Crew member has been assigned to the selected project.',
    });
  };

  const handleContactMember = (member: CrewMember) => {
    toast({
      title: 'Contacting ' + member.name,
      description: 'Opening communication channel...',
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-foreground">Crew Management</h2>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Add Member
          </Button>
          <Button variant="outline" size="sm">
            <Settings className="h-4 w-4 mr-2" />
            Team Settings
          </Button>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="flex items-center space-x-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search crew members..."
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); }}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="available">Available</SelectItem>
            <SelectItem value="busy">Busy</SelectItem>
            <SelectItem value="off-duty">Off Duty</SelectItem>
            <SelectItem value="on-leave">On Leave</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Tabs defaultValue="individuals" className="space-y-4">
        <TabsList>
          <TabsTrigger value="individuals">Individual Members</TabsTrigger>
          <TabsTrigger value="teams">Teams</TabsTrigger>
          <TabsTrigger value="schedule">Schedule</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
        </TabsList>

        <TabsContent value="individuals" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredMembers.map((member) => (
              <Card key={member.id} className="p-4">
                <div className="flex items-start space-x-3">
                  <Avatar className="h-12 w-12">
                    <AvatarFallback>{member.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-semibold text-foreground truncate">{member.name}</h3>
                      <Badge variant="outline" className={getStatusColor(member.status)}>
                        {member.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{member.role}</p>

                    <div className="space-y-2 text-xs">
                      <div className="flex items-center space-x-2">
                        <Phone className="h-3 w-3" />
                        <span>{member.phone}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <MapPin className="h-3 w-3" />
                        <span className="truncate">{member.location}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Clock className="h-3 w-3" />
                        <span>{member.hoursThisWeek}h this week</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Award className="h-3 w-3" />
                        <span>{getRatingStars(member.rating)} ({member.rating})</span>
                      </div>
                    </div>

                    {member.currentProject && (
                      <div className="mt-2 p-2 bg-muted rounded text-xs">
                        <span className="font-medium">Current: </span>
                        {member.currentProject}
                      </div>
                    )}

                    <div className="mt-3 flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 text-xs"
                        onClick={() => { handleContactMember(member); }}
                      >
                        Contact
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 text-xs"
                        onClick={() => { handleAssignProject(member.id); }}
                      >
                        Assign
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="teams" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {teams.map((team) => (
              <Card key={team.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{team.name}</CardTitle>
                    <Badge variant="outline" className={getStatusColor(team.status)}>
                      {team.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <span className="text-sm font-medium">Team Leader: </span>
                      <span className="text-sm text-muted-foreground">{team.leader}</span>
                    </div>
                    <div>
                      <span className="text-sm font-medium">Members: </span>
                      <span className="text-sm text-muted-foreground">{team.members.length}</span>
                    </div>
                    <div>
                      <span className="text-sm font-medium">Specialization: </span>
                      <span className="text-sm text-muted-foreground">{team.specialization}</span>
                    </div>
                    {team.currentProject && (
                      <div className="p-2 bg-muted rounded">
                        <span className="text-sm font-medium">Current Project: </span>
                        <span className="text-sm text-muted-foreground">{team.currentProject}</span>
                      </div>
                    )}
                    <div className="flex space-x-2 pt-2">
                      <Button variant="outline" size="sm" className="flex-1">
                        Manage Team
                      </Button>
                      <Button variant="outline" size="sm" className="flex-1">
                        Assign Project
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="schedule" className="space-y-4">
          <div className="text-center text-muted-foreground py-8">
            <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Crew scheduling interface would be implemented here</p>
          </div>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <div className="text-center text-muted-foreground py-8">
            <Award className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Performance analytics and reviews would be implemented here</p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}