import { useState } from 'react';
import { DashboardLayout } from '../components/layout/dashboard-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { Avatar } from '../components/ui/avatar';
import { useJargon } from '../contexts/JargonContext';
import { Plus, Search, UserPlus, Shield, Wrench, Truck } from 'lucide-react';

interface Employee {
  id: string;
  name: string;
  role: string;
  status: 'active' | 'inactive' | 'on-leave';
  email: string;
  phone: string;
  department: string;
  hireDate: string;
}

const mockEmployees: Employee[] = [
  {
    id: '1',
    name: 'John Mitchell',
    role: 'Crew Chief',
    status: 'active',
    email: 'j.mitchell@pavemaster.com',
    phone: '(555) 123-4567',
    department: 'Operations',
    hireDate: '2022-03-15',
  },
  {
    id: '2',
    name: 'Sarah Chen',
    role: 'Equipment Operator',
    status: 'active',
    email: 's.chen@pavemaster.com',
    phone: '(555) 234-5678',
    department: 'Operations',
    hireDate: '2023-01-10',
  },
  {
    id: '3',
    name: 'Mike Rodriguez',
    role: 'Safety Coordinator',
    status: 'active',
    email: 'm.rodriguez@pavemaster.com',
    phone: '(555) 345-6789',
    department: 'Safety',
    hireDate: '2021-11-08',
  },
];

const getRoleIcon = (role: string) => {
  if (role.includes('Chief') || role.includes('Supervisor')) { return Shield; }
  if (role.includes('Operator') || role.includes('Mechanic')) { return Wrench; }
  if (role.includes('Driver')) { return Truck; }
  return Shield;
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'active': return 'bg-green-500';
    case 'inactive': return 'bg-red-500';
    case 'on-leave': return 'bg-yellow-500';
    default: return 'bg-card0';
  }
};

export default function Employees() {
  const [searchTerm, setSearchTerm] = useState('');
  const { getText } = useJargon();

  const filteredEmployees = mockEmployees.filter(employee =>
    employee.name.toLowerCase().includes(searchTerm.toLowerCase())
    || employee.role.toLowerCase().includes(searchTerm.toLowerCase())
    || employee.department.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{getText('personnel')}</h1>
            <p className="text-muted-foreground">
              Manage your team and crew assignments
            </p>
          </div>
          <Button className="gap-2">
            <UserPlus className="h-4 w-4" />
            Add Employee
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Employees</CardTitle>
              <Shield className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">12</div>
              <p className="text-xs text-muted-foreground">+2 from last month</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active</CardTitle>
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">10</div>
              <p className="text-xs text-muted-foreground">Currently working</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">On Leave</CardTitle>
              <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">2</div>
              <p className="text-xs text-muted-foreground">Temporary absence</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Departments</CardTitle>
              <Wrench className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">4</div>
              <p className="text-xs text-muted-foreground">Active divisions</p>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filter */}
        <Card>
          <CardHeader>
            <CardTitle>Employee Directory</CardTitle>
            <CardDescription>Search and manage your team members</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search employees..."
                  value={searchTerm}
                  onChange={(e) => { setSearchTerm(e.target.value); }}
                  className="pl-10"
                />
              </div>
              <Button variant="outline" className="gap-2">
                <Plus className="h-4 w-4" />
                Filter
              </Button>
            </div>

            {/* Employee List */}
            <div className="space-y-4">
              {filteredEmployees.map((employee) => {
                const RoleIcon = getRoleIcon(employee.role);
                return (
                  <div key={employee.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="flex items-center gap-4">
                      <Avatar className="h-10 w-10">
                        <div className="w-full h-full bg-primary/10 flex items-center justify-center">
                          <RoleIcon className="h-5 w-5 text-primary" />
                        </div>
                      </Avatar>

                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold">{employee.name}</h3>
                          <div className={`w-2 h-2 rounded-full ${getStatusColor(employee.status)}`}></div>
                        </div>
                        <p className="text-sm text-muted-foreground">{employee.role}</p>
                        <p className="text-xs text-muted-foreground">{employee.email}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <Badge variant="outline">{employee.department}</Badge>
                        <p className="text-xs text-muted-foreground mt-1">
                          Hired: {new Date(employee.hireDate).toLocaleDateString()}
                        </p>
                      </div>

                      <Button variant="outline" size="sm">
                        View Details
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}