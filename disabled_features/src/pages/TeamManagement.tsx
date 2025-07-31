import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import {
  Users,
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  Clock,
  Award,
  TrendingUp,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Star,
  CheckCircle,
  AlertCircle,
  UserCheck,
  Settings,
  MoreHorizontal,
  FileText,
  DollarSign
} from 'lucide-react';

interface Employee {
  id: string;
  employeeNumber: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  position: string;
  department: string;
  hireDate: string;
  hourlyRate: number;
  status: 'active' | 'inactive' | 'on_leave' | 'terminated';
  skills: string[];
  certifications: Array<{
    name: string;
    issuedDate: string;
    expiryDate: string;
    issuer: string;
  }>;
  performance: {
    rating: number;
    lastReview: string;
    goals: string[];
  };
  currentProject?: string;
  location: string;
  emergencyContact: {
    name: string;
    phone: string;
    relationship: string;
  };
  timeTracking: {
    hoursThisWeek: number;
    hoursThisMonth: number;
    overtimeHours: number;
  };
  documents: EmployeeDocument[];
  veteranStatus?: {
    isVeteran: boolean;
    branch?: string;
    rank?: string;
    serviceYears?: string;
    disabilityRating?: number;
  };
}

interface EmployeeDocument {
  id: string;
  type: 'contract' | 'license' | 'id' | 'certification' | 'medical' | 'background' | 'w4' | 'i9' | 'other';
  name: string;
  fileName: string;
  uploadDate: string;
  expirationDate?: string;
  verified: boolean;
  required: boolean;
}

interface TimeEntry {
  id: string;
  employeeId: string;
  projectId: string;
  projectName: string;
  date: string;
  clockIn: string;
  clockOut?: string;
  totalHours: number;
  breakTime: number;
  overtime: boolean;
  notes?: string;
}

export default function TeamManagementPage() {
  const { toast } = useToast();
  
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [filteredEmployees, setFilteredEmployees] = useState<Employee[]>([]);
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [departmentFilter, setDepartmentFilter] = useState<string>('all');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  const [newEmployee, setNewEmployee] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    position: '',
    department: 'operations',
    hourlyRate: 0,
    skills: [] as string[],
    newSkill: ''
  });

  useEffect(() => {
    loadEmployees();
    loadTimeEntries();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [employees, searchTerm, statusFilter, departmentFilter]);

  const loadEmployees = async () => {
    // Mock data - in real implementation, fetch from Supabase
    const mockEmployees: Employee[] = [
      {
        id: '1',
        employeeNumber: 'EMP001',
        firstName: 'John',
        lastName: 'Smith',
        email: 'john.smith@company.com',
        phone: '(555) 123-4567',
        position: 'Crew Leader',
        department: 'operations',
        hireDate: '2022-03-15',
        hourlyRate: 28.50,
        status: 'active',
        skills: ['Equipment Operation', 'Team Leadership', 'Safety Management', 'Quality Control'],
        certifications: [
          {
            name: 'CDL Class A',
            issuedDate: '2022-01-10',
            expiryDate: '2026-01-10',
            issuer: 'Virginia DMV'
          },
          {
            name: 'OSHA 30-Hour',
            issuedDate: '2022-02-15',
            expiryDate: '2025-02-15',
            issuer: 'OSHA Training Institute'
          }
        ],
        performance: {
          rating: 4.8,
          lastReview: '2024-01-15',
          goals: ['Complete foreman training', 'Mentor new employees', 'Reduce equipment downtime']
        },
        currentProject: 'First Baptist Church Parking Lot',
        location: 'Field - Site 1',
        emergencyContact: {
          name: 'Jane Smith',
          phone: '(555) 123-4568',
          relationship: 'Spouse'
        },
        timeTracking: {
          hoursThisWeek: 42,
          hoursThisMonth: 168,
          overtimeHours: 8
        }
      },
      {
        id: '2',
        employeeNumber: 'EMP002',
        firstName: 'Mike',
        lastName: 'Johnson',
        email: 'mike.johnson@company.com',
        phone: '(555) 234-5678',
        position: 'Equipment Operator',
        department: 'operations',
        hireDate: '2021-08-20',
        hourlyRate: 24.00,
        status: 'active',
        skills: ['Paver Operation', 'Roller Operation', 'Equipment Maintenance', 'Material Handling'],
        certifications: [
          {
            name: 'Equipment Operator License',
            issuedDate: '2021-07-01',
            expiryDate: '2025-07-01',
            issuer: 'Virginia Department of Professional Regulation'
          }
        ],
        performance: {
          rating: 4.6,
          lastReview: '2024-01-20',
          goals: ['Master new paver technology', 'Reduce fuel consumption', 'Zero safety incidents']
        },
        currentProject: 'Grace Methodist Sealcoating',
        location: 'Equipment Yard',
        emergencyContact: {
          name: 'Robert Johnson',
          phone: '(555) 234-5679',
          relationship: 'Father'
        },
        timeTracking: {
          hoursThisWeek: 40,
          hoursThisMonth: 160,
          overtimeHours: 0
        }
      },
      {
        id: '3',
        employeeNumber: 'EMP003',
        firstName: 'Sarah',
        lastName: 'Davis',
        email: 'sarah.davis@company.com',
        phone: '(555) 345-6789',
        position: 'Quality Inspector',
        department: 'quality',
        hireDate: '2023-01-10',
        hourlyRate: 26.00,
        status: 'active',
        skills: ['Quality Inspection', 'Testing Procedures', 'Documentation', 'Compliance'],
        certifications: [
          {
            name: 'Asphalt Quality Inspector',
            issuedDate: '2023-02-01',
            expiryDate: '2026-02-01',
            issuer: 'Asphalt Institute'
          }
        ],
        performance: {
          rating: 4.9,
          lastReview: '2024-01-10',
          goals: ['Implement new testing protocols', 'Train field crews', 'Digital transformation']
        },
        location: 'Office',
        emergencyContact: {
          name: 'Michael Davis',
          phone: '(555) 345-6790',
          relationship: 'Brother'
        },
        timeTracking: {
          hoursThisWeek: 38,
          hoursThisMonth: 152,
          overtimeHours: 0
        }
      }
    ];
    setEmployees(mockEmployees);
  };

  const loadTimeEntries = async () => {
    // Mock time tracking data
    const mockTimeEntries: TimeEntry[] = [
      {
        id: '1',
        employeeId: '1',
        projectId: 'proj-1',
        projectName: 'First Baptist Church Parking Lot',
        date: new Date().toISOString().split('T')[0],
        clockIn: '07:00',
        clockOut: '16:30',
        totalHours: 8.5,
        breakTime: 1,
        overtime: false,
        notes: 'Regular workday, completed site preparation'
      },
      {
        id: '2',
        employeeId: '2',
        projectId: 'proj-2',
        projectName: 'Grace Methodist Sealcoating',
        date: new Date().toISOString().split('T')[0],
        clockIn: '07:30',
        clockOut: '16:00',
        totalHours: 8,
        breakTime: 0.5,
        overtime: false,
        notes: 'Equipment maintenance and material prep'
      }
    ];
    setTimeEntries(mockTimeEntries);
  };

  const applyFilters = () => {
    let filtered = employees;

    if (searchTerm) {
      filtered = filtered.filter(employee =>
        `${employee.firstName} ${employee.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        employee.position.toLowerCase().includes(searchTerm.toLowerCase()) ||
        employee.employeeNumber.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(employee => employee.status === statusFilter);
    }

    if (departmentFilter !== 'all') {
      filtered = filtered.filter(employee => employee.department === departmentFilter);
    }

    setFilteredEmployees(filtered);
  };

  const createEmployee = async () => {
    const employee: Employee = {
      id: Date.now().toString(),
      employeeNumber: `EMP${String(employees.length + 1).padStart(3, '0')}`,
      firstName: newEmployee.firstName,
      lastName: newEmployee.lastName,
      email: newEmployee.email,
      phone: newEmployee.phone,
      position: newEmployee.position,
      department: newEmployee.department,
      hireDate: new Date().toISOString().split('T')[0],
      hourlyRate: newEmployee.hourlyRate,
      status: 'active',
      skills: newEmployee.skills,
      certifications: [],
      performance: {
        rating: 0,
        lastReview: '',
        goals: []
      },
      location: 'Office',
      emergencyContact: {
        name: '',
        phone: '',
        relationship: ''
      },
      timeTracking: {
        hoursThisWeek: 0,
        hoursThisMonth: 0,
        overtimeHours: 0
      }
    };

    setEmployees(prev => [...prev, employee]);
    setIsCreateDialogOpen(false);
    
    // Reset form
    setNewEmployee({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      position: '',
      department: 'operations',
      hourlyRate: 0,
      skills: [],
      newSkill: ''
    });

    toast({
      title: "Employee Added",
      description: `${employee.firstName} ${employee.lastName} has been added to the team`,
    });
  };

  const deleteEmployee = (employeeId: string) => {
    setEmployees(prev => prev.filter(emp => emp.id !== employeeId));
    toast({
      title: "Employee Removed",
      description: "Employee has been removed from the team",
    });
  };

  const addSkill = () => {
    if (newEmployee.newSkill.trim() && !newEmployee.skills.includes(newEmployee.newSkill.trim())) {
      setNewEmployee(prev => ({
        ...prev,
        skills: [...prev.skills, prev.newSkill.trim()],
        newSkill: ''
      }));
    }
  };

  const removeSkill = (skill: string) => {
    setNewEmployee(prev => ({
      ...prev,
      skills: prev.skills.filter(s => s !== skill)
    }));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-600';
      case 'inactive': return 'text-gray-600';
      case 'on_leave': return 'text-yellow-600';
      case 'terminated': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getPerformanceColor = (rating: number) => {
    if (rating >= 4.5) return 'text-green-600';
    if (rating >= 4.0) return 'text-blue-600';
    if (rating >= 3.5) return 'text-yellow-600';
    return 'text-red-600';
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Users className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-3xl font-bold text-foreground">Team Management</h1>
              <p className="text-muted-foreground">
                Manage employees, track performance, and handle time tracking
              </p>
            </div>
          </div>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Employee
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Add New Employee</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">First Name</label>
                    <Input
                      value={newEmployee.firstName}
                      onChange={(e) => setNewEmployee(prev => ({ ...prev, firstName: e.target.value }))}
                      placeholder="Enter first name"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Last Name</label>
                    <Input
                      value={newEmployee.lastName}
                      onChange={(e) => setNewEmployee(prev => ({ ...prev, lastName: e.target.value }))}
                      placeholder="Enter last name"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Email</label>
                    <Input
                      type="email"
                      value={newEmployee.email}
                      onChange={(e) => setNewEmployee(prev => ({ ...prev, email: e.target.value }))}
                      placeholder="Enter email address"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Phone</label>
                    <Input
                      value={newEmployee.phone}
                      onChange={(e) => setNewEmployee(prev => ({ ...prev, phone: e.target.value }))}
                      placeholder="Enter phone number"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="text-sm font-medium">Position</label>
                    <Input
                      value={newEmployee.position}
                      onChange={(e) => setNewEmployee(prev => ({ ...prev, position: e.target.value }))}
                      placeholder="Enter position"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Department</label>
                    <Select value={newEmployee.department} onValueChange={(value) => 
                      setNewEmployee(prev => ({ ...prev, department: value }))
                    }>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="operations">Operations</SelectItem>
                        <SelectItem value="quality">Quality</SelectItem>
                        <SelectItem value="administration">Administration</SelectItem>
                        <SelectItem value="maintenance">Maintenance</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Hourly Rate</label>
                    <Input
                      type="number"
                      step="0.01"
                      value={newEmployee.hourlyRate}
                      onChange={(e) => setNewEmployee(prev => ({ ...prev, hourlyRate: Number(e.target.value) }))}
                      placeholder="0.00"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium">Skills</label>
                  <div className="flex gap-2 mt-1">
                    <Input
                      value={newEmployee.newSkill}
                      onChange={(e) => setNewEmployee(prev => ({ ...prev, newSkill: e.target.value }))}
                      placeholder="Add skill..."
                      onKeyPress={(e) => e.key === 'Enter' && addSkill()}
                    />
                    <Button type="button" onClick={addSkill} size="sm">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {newEmployee.skills.map((skill) => (
                      <Badge key={skill} variant="secondary" className="cursor-pointer" onClick={() => removeSkill(skill)}>
                        {skill} ×
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={createEmployee}>
                    Add Employee
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
                    placeholder="Search employees..."
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
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="on_leave">On Leave</SelectItem>
                  <SelectItem value="terminated">Terminated</SelectItem>
                </SelectContent>
              </Select>
              <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Department" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Departments</SelectItem>
                  <SelectItem value="operations">Operations</SelectItem>
                  <SelectItem value="quality">Quality</SelectItem>
                  <SelectItem value="administration">Administration</SelectItem>
                  <SelectItem value="maintenance">Maintenance</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Team Stats */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-blue-500" />
                <div>
                  <div className="text-2xl font-bold">
                    {employees.filter(e => e.status === 'active').length}
                  </div>
                  <div className="text-sm text-muted-foreground">Active Employees</div>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-green-500" />
                <div>
                  <div className="text-2xl font-bold">
                    {employees.reduce((sum, e) => sum + e.timeTracking.hoursThisWeek, 0)}
                  </div>
                  <div className="text-sm text-muted-foreground">Hours This Week</div>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Award className="h-5 w-5 text-yellow-500" />
                <div>
                  <div className="text-2xl font-bold">
                    {(employees.reduce((sum, e) => sum + e.performance.rating, 0) / employees.length).toFixed(1)}
                  </div>
                  <div className="text-sm text-muted-foreground">Avg Performance</div>
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
                    {formatCurrency(employees.reduce((sum, e) => sum + (e.hourlyRate * e.timeTracking.hoursThisWeek), 0))}
                  </div>
                  <div className="text-sm text-muted-foreground">Weekly Payroll</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Team Overview</TabsTrigger>
            <TabsTrigger value="timesheets">Time Tracking</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
            <TabsTrigger value="skills">Skills & Training</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Employee Cards */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredEmployees.map((employee) => (
                <Card key={employee.id} className="cursor-pointer hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <Avatar className="h-12 w-12">
                        <AvatarFallback>
                          {employee.firstName[0]}{employee.lastName[0]}
                        </AvatarFallback>
                      </Avatar>
                      
                      <div className="flex-1 space-y-2">
                        <div>
                          <h3 className="font-semibold text-lg">
                            {employee.firstName} {employee.lastName}
                          </h3>
                          <p className="text-sm text-muted-foreground">{employee.position}</p>
                          <Badge variant="outline" className={getStatusColor(employee.status)}>
                            {employee.status.replace('_', ' ')}
                          </Badge>
                        </div>
                        
                        <div className="space-y-1 text-sm">
                          <div className="flex items-center gap-2">
                            <Mail className="h-3 w-3 text-muted-foreground" />
                            <span>{employee.email}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Phone className="h-3 w-3 text-muted-foreground" />
                            <span>{employee.phone}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <MapPin className="h-3 w-3 text-muted-foreground" />
                            <span>{employee.location}</span>
                          </div>
                          {employee.currentProject && (
                            <div className="flex items-center gap-2">
                              <FileText className="h-3 w-3 text-muted-foreground" />
                              <span className="truncate">{employee.currentProject}</span>
                            </div>
                          )}
                        </div>

                        <div className="space-y-2">
                          <div className="flex justify-between items-center text-sm">
                            <span>Performance</span>
                            <span className={`font-medium ${getPerformanceColor(employee.performance.rating)}`}>
                              {employee.performance.rating}/5.0
                            </span>
                          </div>
                          <Progress value={employee.performance.rating * 20} className="h-2" />
                        </div>

                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <div className="text-muted-foreground">Hours/Week</div>
                            <div className="font-medium">{employee.timeTracking.hoursThisWeek}</div>
                          </div>
                          <div>
                            <div className="text-muted-foreground">Hourly Rate</div>
                            <div className="font-medium">{formatCurrency(employee.hourlyRate)}</div>
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-1">
                          {employee.skills.slice(0, 3).map((skill) => (
                            <Badge key={skill} variant="secondary" className="text-xs">
                              {skill}
                            </Badge>
                          ))}
                          {employee.skills.length > 3 && (
                            <Badge variant="secondary" className="text-xs">
                              +{employee.skills.length - 3}
                            </Badge>
                          )}
                        </div>

                        <div className="flex gap-2 pt-2">
                          <Button variant="outline" size="sm" className="flex-1">
                            <Edit className="h-3 w-3 mr-1" />
                            Edit
                          </Button>
                          <Button variant="outline" size="sm">
                            <MoreHorizontal className="h-3 w-3" />
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => deleteEmployee(employee.id)}>
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="timesheets" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Time Tracking
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {timeEntries.map((entry) => {
                    const employee = employees.find(e => e.id === entry.employeeId);
                    return (
                      <div key={entry.id} className="flex items-center gap-4 p-4 border rounded-md">
                        <Avatar className="h-10 w-10">
                          <AvatarFallback>
                            {employee?.firstName[0]}{employee?.lastName[0]}
                          </AvatarFallback>
                        </Avatar>
                        
                        <div className="flex-1">
                          <div className="font-medium">
                            {employee?.firstName} {employee?.lastName}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {entry.projectName} • {new Date(entry.date).toLocaleDateString()}
                          </div>
                        </div>
                        
                        <div className="text-right">
                          <div className="font-medium">{entry.totalHours} hours</div>
                          <div className="text-sm text-muted-foreground">
                            {entry.clockIn} - {entry.clockOut || 'Active'}
                          </div>
                        </div>
                        
                        {entry.overtime && (
                          <Badge variant="secondary">Overtime</Badge>
                        )}
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="performance" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              {employees.map((employee) => (
                <Card key={employee.id}>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>{employee.firstName} {employee.lastName}</span>
                      <div className={`text-lg font-bold ${getPerformanceColor(employee.performance.rating)}`}>
                        {employee.performance.rating}/5.0
                      </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm">Performance Rating</span>
                        <span className="text-sm text-muted-foreground">
                          Last review: {employee.performance.lastReview ? new Date(employee.performance.lastReview).toLocaleDateString() : 'Not reviewed'}
                        </span>
                      </div>
                      <Progress value={employee.performance.rating * 20} className="h-3" />
                    </div>
                    
                    {employee.performance.goals.length > 0 && (
                      <div>
                        <div className="text-sm font-medium mb-2">Current Goals</div>
                        <div className="space-y-1">
                          {employee.performance.goals.map((goal, index) => (
                            <div key={index} className="flex items-center gap-2 text-sm">
                              <CheckCircle className="h-3 w-3 text-blue-500" />
                              <span>{goal}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="skills" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              {employees.map((employee) => (
                <Card key={employee.id}>
                  <CardHeader>
                    <CardTitle>{employee.firstName} {employee.lastName}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <div className="text-sm font-medium mb-2">Skills</div>
                      <div className="flex flex-wrap gap-1">
                        {employee.skills.map((skill) => (
                          <Badge key={skill} variant="secondary">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    
                    {employee.certifications.length > 0 && (
                      <div>
                        <div className="text-sm font-medium mb-2">Certifications</div>
                        <div className="space-y-2">
                          {employee.certifications.map((cert, index) => (
                            <div key={index} className="p-3 border rounded-md">
                              <div className="flex justify-between items-start">
                                <div>
                                  <div className="font-medium">{cert.name}</div>
                                  <div className="text-sm text-muted-foreground">{cert.issuer}</div>
                                </div>
                                <Badge
                                  variant={new Date(cert.expiryDate) > new Date() ? "default" : "destructive"}
                                >
                                  {new Date(cert.expiryDate) > new Date() ? 'Valid' : 'Expired'}
                                </Badge>
                              </div>
                              <div className="text-xs text-muted-foreground mt-1">
                                Expires: {new Date(cert.expiryDate).toLocaleDateString()}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>

        {filteredEmployees.length === 0 && (
          <Card>
            <CardContent className="text-center py-12">
              <Users className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Employees Found</h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm || statusFilter !== 'all' || departmentFilter !== 'all'
                  ? 'No employees match your current filters'
                  : 'Add your first team member to get started'
                }
              </p>
              {(!searchTerm && statusFilter === 'all' && departmentFilter === 'all') && (
                <Button onClick={() => setIsCreateDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Employee
                </Button>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}