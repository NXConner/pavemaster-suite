/**
 * Jobs Manager - Complete Job/Work Order Management System
 * Interfaces with the new jobs database table for full project lifecycle management
 */

import React, { useState, useEffect, useCallback, memo } from 'react';
import { Plus, Search, Filter, Calendar, MapPin, Users, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { VirtualTable, VirtualTableColumn } from '@/components/ui/virtual-table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { performanceMonitor } from '@/lib/performance';

interface Job {
  id: string;
  project_id: string;
  assigned_crew: string[];
  status: 'pending' | 'assigned' | 'in_progress' | 'completed' | 'cancelled' | 'on_hold';
  scheduled_date: string;
  actual_start: string | null;
  actual_end: string | null;
  address: string;
  job_type: 'asphalt_laying' | 'sealcoating' | 'line_striping' | 'crack_sealing' | 'inspection' | 'maintenance' | 'demolition';
  priority: 'low' | 'normal' | 'high' | 'urgent' | 'emergency';
  description: string;
  estimated_hours: number;
  actual_hours: number | null;
  estimated_cost: number;
  actual_cost: number | null;
  created_at: string;
  updated_at: string;
  // Joined data
  project_name?: string;
  crew_names?: string[];
}

interface Project {
  id: string;
  name: string;
}

interface Employee {
  id: string;
  name: string;
  role: string;
}

const JobsManager: React.FC = memo(() => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedPriority, setSelectedPriority] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  // Performance tracking
  useEffect(() => {
    const startTime = performance.now();
    performanceMonitor.recordMetric('jobs_manager_load', performance.now() - startTime, 'ms');
  }, []);

  // Load jobs data
  const loadJobs = useCallback(async () => {
    try {
      setLoading(true);
      const startTime = performance.now();

      const { data: jobsData, error } = await supabase
        .from('jobs')
        .select(`
          *,
          projects!inner(id, name),
          employees!jobs_assigned_crew_fkey(id, name, role)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Transform the data
      const transformedJobs: Job[] = jobsData?.map(job => ({
        ...job,
        project_name: job.projects?.name,
        crew_names: job.employees?.map(emp => emp.name) || []
      })) || [];

      setJobs(transformedJobs);
      
      performanceMonitor.recordMetric('jobs_data_load', performance.now() - startTime, 'ms', {
        jobsCount: transformedJobs.length
      });
    } catch (error) {
      console.error('Error loading jobs:', error);
      toast({
        title: "Error",
        description: "Failed to load jobs data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  // Load projects and employees for dropdowns
  const loadReferenceData = useCallback(async () => {
    try {
      const [projectsResult, employeesResult] = await Promise.all([
        supabase.from('projects').select('id, name').order('name'),
        supabase.from('employees').select('id, name, role').order('name')
      ]);

      if (projectsResult.data) setProjects(projectsResult.data);
      if (employeesResult.data) setEmployees(employeesResult.data);
    } catch (error) {
      console.error('Error loading reference data:', error);
    }
  }, []);

  useEffect(() => {
    loadJobs();
    loadReferenceData();
  }, [loadJobs, loadReferenceData]);

  // Filter jobs based on selected criteria
  const filteredJobs = React.useMemo(() => {
    let filtered = jobs;

    if (selectedStatus !== 'all') {
      filtered = filtered.filter(job => job.status === selectedStatus);
    }

    if (selectedPriority !== 'all') {
      filtered = filtered.filter(job => job.priority === selectedPriority);
    }

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(job =>
        job.description.toLowerCase().includes(term) ||
        job.address.toLowerCase().includes(term) ||
        job.project_name?.toLowerCase().includes(term) ||
        job.job_type.toLowerCase().includes(term)
      );
    }

    return filtered;
  }, [jobs, selectedStatus, selectedPriority, searchTerm]);

  // Table columns configuration
  const columns: VirtualTableColumn<Job>[] = [
    {
      id: 'id',
      header: 'Job ID',
      width: 100,
      sortable: true,
      renderer: (value) => (
        <span className="font-mono text-xs">{value.slice(0, 8)}</span>
      )
    },
    {
      id: 'project_name',
      header: 'Project',
      width: 150,
      sortable: true,
      renderer: (value) => (
        <span className="font-medium">{value}</span>
      )
    },
    {
      id: 'job_type',
      header: 'Type',
      width: 120,
      sortable: true,
      renderer: (value) => (
        <Badge variant="outline">
          {value.replace('_', ' ')}
        </Badge>
      )
    },
    {
      id: 'status',
      header: 'Status',
      width: 120,
      sortable: true,
      renderer: (value) => {
        const colors = {
          pending: 'bg-yellow-500',
          assigned: 'bg-blue-500',
          in_progress: 'bg-purple-500',
          completed: 'bg-green-500',
          cancelled: 'bg-red-500',
          on_hold: 'bg-gray-500'
        };
        return (
          <Badge className={colors[value as keyof typeof colors]}>
            {value.replace('_', ' ')}
          </Badge>
        );
      }
    },
    {
      id: 'priority',
      header: 'Priority',
      width: 100,
      sortable: true,
      renderer: (value) => {
        const colors = {
          low: 'bg-gray-500',
          normal: 'bg-blue-500',
          high: 'bg-orange-500',
          urgent: 'bg-red-500',
          emergency: 'bg-red-600'
        };
        return (
          <Badge className={colors[value as keyof typeof colors]}>
            {value}
          </Badge>
        );
      }
    },
    {
      id: 'scheduled_date',
      header: 'Scheduled',
      width: 120,
      sortable: true,
      renderer: (value) => (
        <div className="flex items-center gap-1">
          <Calendar className="h-3 w-3" />
          <span className="text-xs">
            {new Date(value).toLocaleDateString()}
          </span>
        </div>
      )
    },
    {
      id: 'address',
      header: 'Location',
      width: 200,
      renderer: (value) => (
        <div className="flex items-center gap-1">
          <MapPin className="h-3 w-3" />
          <span className="text-xs truncate">{value}</span>
        </div>
      )
    },
    {
      id: 'crew_names',
      header: 'Crew',
      width: 150,
      renderer: (value: string[]) => (
        <div className="flex items-center gap-1">
          <Users className="h-3 w-3" />
          <span className="text-xs">
            {value?.length || 0} members
          </span>
        </div>
      )
    },
    {
      id: 'estimated_hours',
      header: 'Est. Hours',
      width: 100,
      sortable: true,
      renderer: (value) => (
        <div className="flex items-center gap-1">
          <Clock className="h-3 w-3" />
          <span className="text-xs">{value}h</span>
        </div>
      )
    },
    {
      id: 'estimated_cost',
      header: 'Est. Cost',
      width: 120,
      sortable: true,
      renderer: (value) => (
        <span className="text-xs font-medium">
          ${value.toLocaleString()}
        </span>
      )
    }
  ];

  const statusCounts = React.useMemo(() => {
    const counts = jobs.reduce((acc, job) => {
      acc[job.status] = (acc[job.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    return {
      total: jobs.length,
      pending: counts.pending || 0,
      in_progress: counts.in_progress || 0,
      completed: counts.completed || 0,
      overdue: jobs.filter(job => 
        new Date(job.scheduled_date) < new Date() && 
        !['completed', 'cancelled'].includes(job.status)
      ).length
    };
  }, [jobs]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Jobs Management</h1>
          <p className="text-muted-foreground">
            Manage work orders and track job progress
          </p>
        </div>
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Job
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Job</DialogTitle>
            </DialogHeader>
            {/* Job creation form would go here */}
            <div className="p-4">
              <p>Job creation form implementation...</p>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Status Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Jobs</p>
                <p className="text-2xl font-bold">{statusCounts.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Clock className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Pending</p>
                <p className="text-2xl font-bold">{statusCounts.pending}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-purple-100 rounded-lg">
                <AlertCircle className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">In Progress</p>
                <p className="text-2xl font-bold">{statusCounts.in_progress}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Completed</p>
                <p className="text-2xl font-bold">{statusCounts.completed}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-red-100 rounded-lg">
                <AlertCircle className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Overdue</p>
                <p className="text-2xl font-bold">{statusCounts.overdue}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search jobs..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>

            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="assigned">Assigned</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
                <SelectItem value="on_hold">On Hold</SelectItem>
              </SelectContent>
            </Select>

            <Select value={selectedPriority} onValueChange={setSelectedPriority}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priority</SelectItem>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="normal">Normal</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="urgent">Urgent</SelectItem>
                <SelectItem value="emergency">Emergency</SelectItem>
              </SelectContent>
            </Select>

            <Button variant="outline" onClick={() => {
              setSelectedStatus('all');
              setSelectedPriority('all');
              setSearchTerm('');
            }}>
              <Filter className="h-4 w-4 mr-2" />
              Clear Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Jobs Table */}
      <Card>
        <CardHeader>
          <CardTitle>
            Jobs ({filteredJobs.length.toLocaleString()})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <VirtualTable
            data={filteredJobs}
            columns={columns}
            height={600}
            itemHeight={60}
            onRowClick={(job) => {
              // Navigate to job details
              console.log('Navigate to job:', job.id);
            }}
          />
        </CardContent>
      </Card>
    </div>
  );
});

JobsManager.displayName = 'JobsManager';

export default JobsManager;