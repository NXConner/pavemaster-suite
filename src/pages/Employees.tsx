import { DashboardLayout } from '../components/layout/dashboard-layout';
import { DashboardCard } from '../components/ui/dashboard-card';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { 
  Plus, 
  Users, 
  Phone, 
  Mail, 
  MapPin, 
  Calendar, 
  Clock, 
  Award,
  Activity,
  Star,
  Briefcase
} from 'lucide-react';

// Mock employee data
const employees = [
  {
    id: 1,
    name: 'John Davis',
    role: 'Senior Paver Operator',
    department: 'Operations',
    status: 'active',
    location: 'Main St Project',
    phone: '(555) 123-4567',
    email: 'john.davis@pavemaster.com',
    hireDate: '2020-03-15',
    experience: '8 years',
    certifications: ['CDL Class A', 'Paver Operation', 'Safety Training'],
    performanceScore: 98,
    hoursThisWeek: 42,
    projects: 24,
    avatar: 'JD'
  },
  {
    id: 2,
    name: 'Mike Wilson',
    role: 'Equipment Technician',
    department: 'Maintenance',
    status: 'active',
    location: 'Church Project',
    phone: '(555) 234-5678',
    email: 'mike.wilson@pavemaster.com',
    hireDate: '2019-07-22',
    experience: '12 years',
    certifications: ['Hydraulics', 'Engine Repair', 'Electrical Systems'],
    performanceScore: 95,
    hoursThisWeek: 40,
    projects: 18,
    avatar: 'MW'
  },
  {
    id: 3,
    name: 'Sarah Johnson',
    role: 'Project Manager',
    department: 'Operations',
    status: 'active',
    location: 'Office',
    phone: '(555) 345-6789',
    email: 'sarah.johnson@pavemaster.com',
    hireDate: '2018-01-10',
    experience: '15 years',
    certifications: ['PMP', 'Construction Management', 'OSHA 30'],
    performanceScore: 99,
    hoursThisWeek: 45,
    projects: 8,
    avatar: 'SJ'
  },
  {
    id: 4,
    name: 'Robert Chen',
    role: 'Sealcoat Specialist',
    department: 'Operations',
    status: 'active',
    location: 'Industrial Project',
    phone: '(555) 456-7890',
    email: 'robert.chen@pavemaster.com',
    hireDate: '2021-05-18',
    experience: '5 years',
    certifications: ['Sealcoat Application', 'Material Safety', 'Quality Control'],
    performanceScore: 92,
    hoursThisWeek: 38,
    projects: 16,
    avatar: 'RC'
  },
  {
    id: 5,
    name: 'Lisa Martinez',
    role: 'Safety Coordinator',
    department: 'Safety',
    status: 'active',
    location: 'Office',
    phone: '(555) 567-8901',
    email: 'lisa.martinez@pavemaster.com',
    hireDate: '2022-02-14',
    experience: '10 years',
    certifications: ['OSHA 30', 'First Aid/CPR', 'Safety Management'],
    performanceScore: 97,
    hoursThisWeek: 40,
    projects: 12,
    avatar: 'LM'
  },
  {
    id: 6,
    name: 'David Brown',
    role: 'Crew Leader',
    department: 'Operations',
    status: 'vacation',
    location: 'Off Duty',
    phone: '(555) 678-9012',
    email: 'david.brown@pavemaster.com',
    hireDate: '2017-09-30',
    experience: '18 years',
    certifications: ['Leadership', 'CDL Class B', 'Safety Training'],
    performanceScore: 94,
    hoursThisWeek: 0,
    projects: 32,
    avatar: 'DB'
  }
];

const getStatusColor = (status: string) => {
  switch (status) {
    case 'active': return 'bg-success text-success-foreground';
    case 'vacation': return 'bg-info text-info-foreground';
    case 'sick': return 'bg-warning text-warning-foreground';
    case 'inactive': return 'bg-muted text-muted-foreground';
    default: return 'bg-muted text-muted-foreground';
  }
};

const getPerformanceColor = (score: number) => {
  if (score >= 95) return 'text-success';
  if (score >= 85) return 'text-primary';
  if (score >= 75) return 'text-warning';
  return 'text-destructive';
};

export default function Employees() {
  const activeEmployees = employees.filter(e => e.status === 'active').length;
  const totalHours = employees.reduce((sum, e) => sum + e.hoursThisWeek, 0);
  const avgPerformance = Math.round(
    employees.reduce((sum, e) => sum + e.performanceScore, 0) / employees.length
  );

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Employee Management</h1>
            <p className="text-muted-foreground">
              Manage your team and track performance
            </p>
          </div>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Employee
          </Button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <DashboardCard
            title="Total Employees"
            value={employees.length.toString()}
            description="Active team members"
            icon={<Users className="h-4 w-4" />}
          />
          <DashboardCard
            title="On Duty"
            value={activeEmployees.toString()}
            description="Currently working"
            trend={{ value: 8, isPositive: true, label: 'attendance rate' }}
            icon={<Activity className="h-4 w-4" />}
          />
          <DashboardCard
            title="Hours This Week"
            value={totalHours.toString()}
            description="Total hours logged"
            trend={{ value: 12, isPositive: true, label: 'vs last week' }}
            icon={<Clock className="h-4 w-4" />}
          />
          <DashboardCard
            title="Avg Performance"
            value={`${avgPerformance}%`}
            description="Team performance score"
            trend={{ value: 3, isPositive: true, label: 'improvement' }}
            icon={<Star className="h-4 w-4" />}
          />
        </div>

        {/* Employee Grid */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Team Directory</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
            {employees.map((employee) => (
              <Card key={employee.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start gap-4">
                    <div className="h-12 w-12 rounded-full bg-primary flex items-center justify-center">
                      <span className="text-sm font-medium text-primary-foreground">
                        {employee.avatar}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-lg truncate">{employee.name}</CardTitle>
                      <p className="text-sm text-muted-foreground truncate">{employee.role}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <div className={`px-2 py-1 rounded-full text-xs ${getStatusColor(employee.status)}`}>
                          {employee.status.charAt(0).toUpperCase() + employee.status.slice(1)}
                        </div>
                        <span className="text-xs text-muted-foreground">{employee.department}</span>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Contact Info */}
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <Phone className="h-3 w-3 text-muted-foreground" />
                      <span>{employee.phone}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail className="h-3 w-3 text-muted-foreground" />
                      <span className="truncate text-xs">{employee.email}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-3 w-3 text-muted-foreground" />
                      <span className="truncate">{employee.location}</span>
                    </div>
                  </div>

                  {/* Performance & Hours */}
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm">Performance Score</span>
                        <span className={`text-sm font-medium ${getPerformanceColor(employee.performanceScore)}`}>
                          {employee.performanceScore}%
                        </span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full transition-all ${
                            employee.performanceScore >= 95 ? 'bg-success' :
                            employee.performanceScore >= 85 ? 'bg-primary' :
                            employee.performanceScore >= 75 ? 'bg-warning' : 'bg-destructive'
                          }`}
                          style={{ width: `${employee.performanceScore}%` }}
                        />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Hours:</span>
                        <span className="font-medium">{employee.hoursThisWeek}h</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Projects:</span>
                        <span className="font-medium">{employee.projects}</span>
                      </div>
                    </div>
                  </div>

                  {/* Experience & Certifications */}
                  <div className="p-3 bg-muted/50 rounded space-y-2">
                    <div className="flex justify-between items-center text-sm">
                      <span className="flex items-center gap-1">
                        <Briefcase className="h-3 w-3" />
                        Experience
                      </span>
                      <span className="font-medium">{employee.experience}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        Hire Date
                      </span>
                      <span>{new Date(employee.hireDate).toLocaleDateString()}</span>
                    </div>
                    <div className="text-sm">
                      <div className="flex items-center gap-1 mb-1">
                        <Award className="h-3 w-3" />
                        <span>Certifications</span>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {employee.certifications.map((cert, index) => (
                          <span 
                            key={index}
                            className="px-2 py-1 bg-primary/10 text-primary text-xs rounded"
                          >
                            {cert}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="flex-1">
                      View Profile
                    </Button>
                    <Button variant="outline" size="sm">
                      <Phone className="h-3 w-3" />
                    </Button>
                    <Button variant="outline" size="sm">
                      <Mail className="h-3 w-3" />
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