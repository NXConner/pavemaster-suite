import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Search, Users, Phone, Mail, Calendar, MapPin, Settings, Star } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

interface TeamMember {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  role: string;
  department: string;
  status: 'active' | 'inactive' | 'on-leave';
  hire_date: string;
  avatar_url?: string;
  skills: string[];
  current_project?: string;
  performance_score?: number;
  hourly_rate?: number;
  address?: string;
  emergency_contact_name?: string;
}

export default function Team() {
  const { user } = useAuth();
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('all');

  useEffect(() => {
    if (user) {
      fetchTeamMembers();
    }
  }, [user]);

  const fetchTeamMembers = async () => {
    try {
      const { data, error } = await supabase
        .from('employees')
        .select('*')
        .order('first_name');
      
      if (error) throw error;
      // Transform database data to match our interface
      const transformedData = data?.map(emp => ({
        id: emp.id,
        first_name: emp.first_name,
        last_name: emp.last_name,
        email: emp.email,
        phone: emp.phone || '',
        role: emp.role || 'Employee',
        department: emp.department || 'Operations',
        status: (emp.employment_status === 'active' ? 'active' : 
                emp.employment_status === 'inactive' ? 'inactive' : 'on-leave') as 'active' | 'inactive' | 'on-leave',
        hire_date: emp.hire_date || new Date().toISOString().split('T')[0],
        avatar_url: emp.avatar_url,
        skills: emp.skills || [],
        performance_score: emp.performance_score,
        hourly_rate: emp.hourly_rate,
        address: emp.address,
        emergency_contact_name: emp.emergency_contact_name
      })) || [];
      setTeamMembers(transformedData);
    } catch (error) {
      console.error('Error fetching team members:', error);
      // Fallback to mock data
      setTeamMembers([
        {
          id: '1',
          first_name: 'John',
          last_name: 'Smith',
          email: 'john.smith@company.com',
          phone: '(555) 123-4567',
          role: 'Crew Leader',
          department: 'Operations',
          status: 'active',
          hire_date: '2023-03-15',
          avatar_url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
          skills: ['Sealcoating', 'Line Striping', 'Equipment Operation'],
          current_project: 'First Baptist Church Parking Lot',
          performance_score: 92,
          hourly_rate: 28,
          address: '123 Main St, Richmond, VA',
          emergency_contact_name: 'Jane Smith (Wife)'
        },
        {
          id: '2',
          first_name: 'Maria',
          last_name: 'Rodriguez',
          email: 'maria.rodriguez@company.com',
          phone: '(555) 234-5678',
          role: 'Equipment Operator',
          department: 'Operations',
          status: 'active',
          hire_date: '2023-06-01',
          skills: ['Heavy Equipment', 'Asphalt Paving', 'Safety'],
          current_project: 'Trinity Methodist Crack Sealing',
          performance_score: 88,
          hourly_rate: 26,
          address: '456 Oak Ave, Richmond, VA',
          emergency_contact_name: 'Carlos Rodriguez (Husband)'
        },
        {
          id: '3',
          first_name: 'David',
          last_name: 'Johnson',
          email: 'david.johnson@company.com',
          phone: '(555) 345-6789',
          role: 'Project Manager',
          department: 'Management',
          status: 'active',
          hire_date: '2022-11-10',
          skills: ['Project Management', 'Client Relations', 'Estimating'],
          performance_score: 95,
          hourly_rate: 35,
          address: '789 Pine St, Richmond, VA',
          emergency_contact_name: 'Sarah Johnson (Wife)'
        },
        {
          id: '4',
          first_name: 'Mike',
          last_name: 'Wilson',
          email: 'mike.wilson@company.com',
          phone: '(555) 456-7890',
          role: 'Driver',
          department: 'Logistics',
          status: 'on-leave',
          hire_date: '2023-08-20',
          skills: ['CDL', 'Material Transport', 'Vehicle Maintenance'],
          performance_score: 85,
          hourly_rate: 22,
          address: '321 Elm St, Richmond, VA',
          emergency_contact_name: 'Lisa Wilson (Wife)'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-success text-success-foreground';
      case 'inactive': return 'bg-destructive text-destructive-foreground';
      case 'on-leave': return 'bg-warning text-warning-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const departments = ['all', 'Operations', 'Management', 'Logistics', 'Administration'];
  
  const filteredMembers = teamMembers.filter(member => {
    const matchesSearch = 
      `${member.first_name} ${member.last_name}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.role.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDepartment = departmentFilter === 'all' || member.department === departmentFilter;
    return matchesSearch && matchesDepartment;
  });

  const departmentCounts = departments.reduce((acc, dept) => {
    acc[dept] = dept === 'all' ? teamMembers.length : teamMembers.filter(m => m.department === dept).length;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Users className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold text-foreground">Team Management</h1>
            <p className="text-muted-foreground">Manage your crew and track performance</p>
          </div>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Add Team Member
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Team</p>
                <p className="text-2xl font-bold">{teamMembers.length}</p>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active</p>
                <p className="text-2xl font-bold">{teamMembers.filter(m => m.status === 'active').length}</p>
              </div>
              <div className="h-8 w-8 rounded-lg bg-green-100 flex items-center justify-center">
                <span className="text-green-600 text-sm font-bold">A</span>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">On Leave</p>
                <p className="text-2xl font-bold">{teamMembers.filter(m => m.status === 'on-leave').length}</p>
              </div>
              <div className="h-8 w-8 rounded-lg bg-yellow-100 flex items-center justify-center">
                <span className="text-yellow-600 text-sm font-bold">L</span>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg Performance</p>
                <p className="text-2xl font-bold">
                  {Math.round(teamMembers.reduce((sum, m) => sum + (m.performance_score || 0), 0) / teamMembers.length)}%
                </p>
              </div>
              <Star className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-4 flex-1">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search team members..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <select
            value={departmentFilter}
            onChange={(e) => setDepartmentFilter(e.target.value)}
            className="px-3 py-2 border border-input bg-background rounded-md text-sm"
          >
            {departments.map(dept => (
              <option key={dept} value={dept}>
                {dept === 'all' ? 'All Departments' : dept} ({departmentCounts[dept]})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Team Members Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredMembers.map((member) => (
          <Card key={member.id} className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader className="text-center">
              <Avatar className="w-16 h-16 mx-auto mb-2">
                <AvatarImage src={member.avatar_url} alt={`${member.first_name} ${member.last_name}`} />
                <AvatarFallback className="text-lg">
                  {member.first_name[0]}{member.last_name[0]}
                </AvatarFallback>
              </Avatar>
              <div>
                <CardTitle className="text-lg">{member.first_name} {member.last_name}</CardTitle>
                <CardDescription>{member.role}</CardDescription>
              </div>
              <Badge className={getStatusColor(member.status)}>
                {member.status.replace('-', ' ')}
              </Badge>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span className="truncate">{member.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span>{member.phone}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>Since {new Date(member.hire_date).toLocaleDateString()}</span>
                </div>
                {member.current_project && (
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span className="truncate text-xs">{member.current_project}</span>
                  </div>
                )}
              </div>

              {member.performance_score && (
                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span>Performance</span>
                    <span>{member.performance_score}%</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div 
                      className="bg-primary h-2 rounded-full transition-all" 
                      style={{ width: `${member.performance_score}%` }}
                    />
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <p className="text-sm font-medium">Skills:</p>
                <div className="flex flex-wrap gap-1">
                  {member.skills.slice(0, 3).map((skill, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {skill}
                    </Badge>
                  ))}
                  {member.skills.length > 3 && (
                    <Badge variant="secondary" className="text-xs">
                      +{member.skills.length - 3}
                    </Badge>
                  )}
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <Button variant="outline" size="sm" className="flex-1">
                  View Profile
                </Button>
                <Button variant="outline" size="sm">
                  <Settings className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredMembers.length === 0 && !loading && (
        <Card>
          <CardContent className="py-12 text-center">
            <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Team Members Found</h3>
            <p className="text-muted-foreground mb-4">
              {searchQuery || departmentFilter !== 'all' 
                ? 'Try adjusting your search or filters.' 
                : 'Add your first team member to get started.'}
            </p>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Team Member
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}