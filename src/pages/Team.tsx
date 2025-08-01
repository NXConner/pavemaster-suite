import { useState } from 'react';
import { DashboardLayout } from "../components/layout/dashboard-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Badge } from "../components/ui/badge";
import { Avatar, AvatarFallback } from "../components/ui/avatar";
import { Users, UserPlus, Calendar, Clock, Phone, Mail, MapPin, Award } from "lucide-react";

interface TeamMember {
  id: string;
  name: string;
  role: string;
  department: string;
  email: string;
  phone: string;
  location: string;
  status: 'active' | 'on_leave' | 'inactive';
  skills: string[];
  certifications: string[];
  hourlyRate: number;
  yearsExperience: number;
  currentProject?: string;
  profileImage?: string;
}

interface Shift {
  id: string;
  employeeId: string;
  date: string;
  startTime: string;
  endTime: string;
  project: string;
  hoursWorked: number;
  overtime: number;
}

export default function Team() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');

  const teamMembers: TeamMember[] = [
    {
      id: '1',
      name: 'Mike Johnson',
      role: 'Foreman',
      department: 'Operations',
      email: 'mike.johnson@pavemaster.com',
      phone: '(804) 555-0101',
      location: 'Richmond, VA',
      status: 'active',
      skills: ['Asphalt Paving', 'Crew Leadership', 'Quality Control'],
      certifications: ['VDOT Certified', 'OSHA 30'],
      hourlyRate: 28.50,
      yearsExperience: 12,
      currentProject: 'Church Parking Lot - Phase 2'
    },
    {
      id: '2',
      name: 'Sarah Williams',
      role: 'Equipment Operator',
      department: 'Operations',
      email: 'sarah.williams@pavemaster.com',
      phone: '(804) 555-0102',
      location: 'Richmond, VA',
      status: 'active',
      skills: ['Heavy Equipment', 'Paver Operation', 'Roller Operation'],
      certifications: ['CDL Class A', 'Equipment Safety'],
      hourlyRate: 24.00,
      yearsExperience: 8,
      currentProject: 'Shopping Center Reseal'
    },
    {
      id: '3',
      name: 'David Chen',
      role: 'Safety Coordinator',
      department: 'Safety',
      email: 'david.chen@pavemaster.com',
      phone: '(804) 555-0103',
      location: 'Richmond, VA',
      status: 'active',
      skills: ['Safety Management', 'Training', 'Incident Investigation'],
      certifications: ['OSHA 30', 'First Aid/CPR', 'Safety Manager'],
      hourlyRate: 26.00,
      yearsExperience: 10,
      currentProject: 'Safety Training Program'
    },
    {
      id: '4',
      name: 'Lisa Martinez',
      role: 'Administrative Assistant',
      department: 'Administration',
      email: 'lisa.martinez@pavemaster.com',
      phone: '(804) 555-0104',
      location: 'Richmond, VA',
      status: 'active',
      skills: ['Project Coordination', 'Customer Service', 'Documentation'],
      certifications: ['Administrative Professional'],
      hourlyRate: 18.00,
      yearsExperience: 5
    },
    {
      id: '5',
      name: 'Robert Davis',
      role: 'Crew Member',
      department: 'Operations',
      email: 'robert.davis@pavemaster.com',
      phone: '(804) 555-0105',
      location: 'Richmond, VA',
      status: 'on_leave',
      skills: ['Manual Labor', 'Equipment Maintenance', 'Site Preparation'],
      certifications: ['OSHA 10'],
      hourlyRate: 16.50,
      yearsExperience: 3
    }
  ];

  const recentShifts: Shift[] = [
    {
      id: '1',
      employeeId: '1',
      date: '2024-01-15',
      startTime: '07:00',
      endTime: '16:00',
      project: 'Church Parking Lot',
      hoursWorked: 8,
      overtime: 0
    },
    {
      id: '2',
      employeeId: '2',
      date: '2024-01-15',
      startTime: '07:00',
      endTime: '17:30',
      project: 'Shopping Center',
      hoursWorked: 9.5,
      overtime: 1.5
    },
    {
      id: '3',
      employeeId: '3',
      date: '2024-01-15',
      startTime: '08:00',
      endTime: '16:30',
      project: 'Safety Inspection',
      hoursWorked: 8,
      overtime: 0
    }
  ];

  const filteredMembers = teamMembers.filter(member => {
    const matchesSearch = member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         member.role.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDepartment = selectedDepartment === 'all' || member.department === selectedDepartment;
    const matchesStatus = selectedStatus === 'all' || member.status === selectedStatus;
    
    return matchesSearch && matchesDepartment && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'on_leave': return 'bg-yellow-100 text-yellow-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active': return 'Active';
      case 'on_leave': return 'On Leave';
      case 'inactive': return 'Inactive';
      default: return 'Unknown';
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Team Management</h1>
            <p className="text-muted-foreground">
              Manage your team members, schedules, and assignments
            </p>
          </div>
          <Button className="gap-2">
            <UserPlus className="h-4 w-4" />
            Add Team Member
          </Button>
        </div>

        {/* Quick Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Team Members</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{teamMembers.length}</div>
              <p className="text-xs text-muted-foreground">
                {teamMembers.filter(m => m.status === 'active').length} active
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">On Active Projects</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {teamMembers.filter(m => m.currentProject).length}
              </div>
              <p className="text-xs text-muted-foreground">Currently deployed</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Hours (Week)</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">342</div>
              <p className="text-xs text-muted-foreground">+12 overtime hours</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Experience</CardTitle>
              <Award className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {Math.round(teamMembers.reduce((sum, m) => sum + m.yearsExperience, 0) / teamMembers.length)}
              </div>
              <p className="text-xs text-muted-foreground">years per team member</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="roster" className="space-y-6">
          <TabsList>
            <TabsTrigger value="roster">Team Roster</TabsTrigger>
            <TabsTrigger value="schedule">Schedule</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
            <TabsTrigger value="payroll">Payroll</TabsTrigger>
          </TabsList>

          <TabsContent value="roster" className="space-y-6">
            {/* Filters */}
            <Card>
              <CardContent className="pt-6">
                <div className="grid gap-4 md:grid-cols-4">
                  <div className="space-y-2">
                    <Label htmlFor="search">Search Team Members</Label>
                    <Input
                      id="search"
                      placeholder="Search by name or role..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="department">Department</Label>
                    <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Departments</SelectItem>
                        <SelectItem value="Operations">Operations</SelectItem>
                        <SelectItem value="Safety">Safety</SelectItem>
                        <SelectItem value="Administration">Administration</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="status">Status</Label>
                    <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Statuses</SelectItem>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="on_leave">On Leave</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-end">
                    <Button variant="outline" className="w-full">
                      Reset Filters
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Team Members */}
            <div className="grid gap-4">
              {filteredMembers.map((member) => (
                <Card key={member.id}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4">
                        <Avatar className="h-12 w-12">
                          <AvatarFallback>
                            {member.name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div className="space-y-1">
                          <div className="flex items-center gap-3">
                            <h3 className="font-semibold text-lg">{member.name}</h3>
                            <Badge className={getStatusColor(member.status)}>
                              {getStatusLabel(member.status)}
                            </Badge>
                          </div>
                          <p className="text-muted-foreground">{member.role} • {member.department}</p>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Mail className="h-3 w-3" />
                              {member.email}
                            </div>
                            <div className="flex items-center gap-1">
                              <Phone className="h-3 w-3" />
                              {member.phone}
                            </div>
                            <div className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {member.location}
                            </div>
                          </div>
                          {member.currentProject && (
                            <div className="flex items-center gap-1 text-sm">
                              <Calendar className="h-3 w-3 text-blue-500" />
                              <span className="text-blue-600">Current: {member.currentProject}</span>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="text-right space-y-1">
                        <div className="text-lg font-semibold">${member.hourlyRate}/hr</div>
                        <div className="text-sm text-muted-foreground">{member.yearsExperience} years exp.</div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm">Edit</Button>
                          <Button variant="outline" size="sm">Schedule</Button>
                        </div>
                      </div>
                    </div>
                    
                    {/* Skills and Certifications */}
                    <div className="mt-4 space-y-2">
                      <div>
                        <span className="text-sm font-medium">Skills: </span>
                        <div className="flex gap-1 flex-wrap mt-1">
                          {member.skills.map((skill, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {skill}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <div>
                        <span className="text-sm font-medium">Certifications: </span>
                        <div className="flex gap-1 flex-wrap mt-1">
                          {member.certifications.map((cert, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {cert}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="schedule" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Weekly Schedule</CardTitle>
                <CardDescription>Current week's work assignments and hours</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentShifts.map((shift) => {
                    const employee = teamMembers.find(m => m.id === shift.employeeId);
                    return (
                      <div key={shift.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center gap-4">
                          <Avatar>
                            <AvatarFallback>
                              {employee?.name.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">{employee?.name}</div>
                            <div className="text-sm text-muted-foreground">{shift.project}</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-medium">{shift.startTime} - {shift.endTime}</div>
                          <div className="text-sm text-muted-foreground">
                            {shift.hoursWorked}h {shift.overtime > 0 && `(${shift.overtime}h OT)`}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="performance" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Performance Metrics</CardTitle>
                  <CardDescription>Team performance indicators</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span>Productivity Score</span>
                      <span className="font-semibold">87%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Safety Record</span>
                      <span className="font-semibold text-green-600">100 days incident-free</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Quality Rating</span>
                      <span className="font-semibold">4.8/5</span>
                    </div>
                    <div className="flex justify-between">
                      <span>On-Time Completion</span>
                      <span className="font-semibold">92%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Training & Development</CardTitle>
                  <CardDescription>Upcoming training and certifications</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="p-3 border rounded">
                      <div className="font-medium">OSHA 30 Refresher</div>
                      <div className="text-sm text-muted-foreground">Due: January 30, 2024</div>
                      <div className="text-sm text-muted-foreground">3 team members</div>
                    </div>
                    <div className="p-3 border rounded">
                      <div className="font-medium">Equipment Safety Training</div>
                      <div className="text-sm text-muted-foreground">Scheduled: February 5, 2024</div>
                      <div className="text-sm text-muted-foreground">All crew members</div>
                    </div>
                    <div className="p-3 border rounded">
                      <div className="font-medium">First Aid/CPR Renewal</div>
                      <div className="text-sm text-muted-foreground">Due: March 15, 2024</div>
                      <div className="text-sm text-muted-foreground">2 team members</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="payroll" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Payroll Summary</CardTitle>
                <CardDescription>Current pay period overview</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="space-y-2">
                    <div className="text-2xl font-bold">$8,420</div>
                    <div className="text-sm text-muted-foreground">Regular Hours</div>
                  </div>
                  <div className="space-y-2">
                    <div className="text-2xl font-bold">$645</div>
                    <div className="text-sm text-muted-foreground">Overtime</div>
                  </div>
                  <div className="space-y-2">
                    <div className="text-2xl font-bold">$9,065</div>
                    <div className="text-sm text-muted-foreground">Total Gross Pay</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}