import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { toast } from '@/hooks/use-toast';
import {
  Shield,
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  AlertTriangle,
  CheckCircle,
  Clock,
  FileText,
  Users,
  Award,
  Calendar,
  MapPin,
  Eye,
  TrendingUp,
  TrendingDown,
  Target,
  Clipboard,
  HardHat,
  Zap,
  X
} from 'lucide-react';

interface SafetyIncident {
  id: string;
  reportNumber: string;
  type: 'injury' | 'near_miss' | 'property_damage' | 'environmental' | 'security';
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'reported' | 'investigating' | 'resolved' | 'closed';
  title: string;
  description: string;
  location: string;
  dateOccurred: string;
  timeOccurred: string;
  reportedBy: string;
  reportedDate: string;
  witnessedBy: string[];
  injuredPersons: Array<{
    name: string;
    role: string;
    injuryType: string;
    medicalAttention: boolean;
  }>;
  immediateActions: string;
  rootCause?: string;
  correctiveActions: string[];
  preventiveMeasures: string[];
  attachments: string[];
  investigation: {
    assignedTo: string;
    startDate: string;
    completedDate?: string;
    findings: string;
  };
}

interface SafetyProtocol {
  id: string;
  title: string;
  category: string;
  description: string;
  steps: string[];
  equipment: string[];
  compliance: string[];
  lastUpdated: string;
  nextReview: string;
  status: 'active' | 'under_review' | 'archived';
  attachments: string[];
}

interface SafetyTraining {
  id: string;
  employeeId: string;
  employeeName: string;
  trainingType: string;
  title: string;
  provider: string;
  completedDate: string;
  expiryDate: string;
  certificateNumber?: string;
  status: 'valid' | 'expiring' | 'expired';
  requiredBy: string;
}

export default function SafetyManagementPage() {
  const { toast } = useToast();
  
  const [incidents, setIncidents] = useState<SafetyIncident[]>([]);
  const [protocols, setProtocols] = useState<SafetyProtocol[]>([]);
  const [trainings, setTrainings] = useState<SafetyTraining[]>([]);
  const [filteredIncidents, setFilteredIncidents] = useState<SafetyIncident[]>([]);
  const [selectedIncident, setSelectedIncident] = useState<SafetyIncident | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isIncidentDialogOpen, setIsIncidentDialogOpen] = useState(false);
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  const [newIncident, setNewIncident] = useState({
    type: 'near_miss' as SafetyIncident['type'],
    severity: 'medium' as SafetyIncident['severity'],
    title: '',
    description: '',
    location: '',
    dateOccurred: '',
    timeOccurred: '',
    witnessedBy: [] as string[],
    immediateActions: '',
    newWitness: ''
  });

  useEffect(() => {
    loadIncidents();
    loadProtocols();
    loadTrainings();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [incidents, searchTerm, typeFilter, severityFilter, statusFilter]);

  const loadIncidents = async () => {
    // Mock data - in real implementation, fetch from Supabase
    const mockIncidents: SafetyIncident[] = [
      {
        id: '1',
        reportNumber: 'INC-2024-001',
        type: 'near_miss',
        severity: 'medium',
        status: 'investigating',
        title: 'Near miss with equipment',
        description: 'Employee almost struck by backing equipment due to lack of spotter',
        location: 'First Baptist Church Site',
        dateOccurred: new Date().toISOString().split('T')[0],
        timeOccurred: '10:30',
        reportedBy: 'John Smith',
        reportedDate: new Date().toISOString().split('T')[0],
        witnessedBy: ['Mike Johnson'],
        injuredPersons: [],
        immediateActions: 'Stopped work, briefed crew on spotter requirements',
        correctiveActions: ['Implement mandatory spotter protocol', 'Additional safety training'],
        preventiveMeasures: ['Install backup alarms', 'Mark equipment blind spots'],
        attachments: [],
        investigation: {
          assignedTo: 'Sarah Davis',
          startDate: new Date().toISOString().split('T')[0],
          findings: 'Investigation in progress'
        }
      },
      {
        id: '2',
        reportNumber: 'INC-2024-002',
        type: 'injury',
        severity: 'low',
        status: 'resolved',
        title: 'Minor cut on hand',
        description: 'Employee sustained small cut while handling materials without proper gloves',
        location: 'Material Storage Area',
        dateOccurred: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        timeOccurred: '14:15',
        reportedBy: 'Mike Johnson',
        reportedDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        witnessedBy: [],
        injuredPersons: [
          {
            name: 'Tom Wilson',
            role: 'Laborer',
            injuryType: 'Minor cut on left hand',
            medicalAttention: true
          }
        ],
        immediateActions: 'First aid applied, wound cleaned and bandaged',
        rootCause: 'Failure to use required PPE',
        correctiveActions: ['PPE refresher training', 'Improve PPE availability'],
        preventiveMeasures: ['Daily PPE checks', 'PPE station setup at material area'],
        attachments: [],
        investigation: {
          assignedTo: 'Sarah Davis',
          startDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          completedDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          findings: 'Employee failed to wear required cut-resistant gloves when handling sharp materials'
        }
      }
    ];
    setIncidents(mockIncidents);
  };

  const loadProtocols = async () => {
    // Mock protocols data
    const mockProtocols: SafetyProtocol[] = [
      {
        id: '1',
        title: 'Personal Protective Equipment (PPE)',
        category: 'General Safety',
        description: 'Standard PPE requirements for all construction activities',
        steps: [
          'Assess work area hazards',
          'Select appropriate PPE',
          'Inspect PPE before use',
          'Wear PPE properly',
          'Maintain and store PPE correctly'
        ],
        equipment: ['Hard hat', 'Safety glasses', 'High-vis vest', 'Steel-toe boots', 'Work gloves'],
        compliance: ['OSHA 1926.95', 'ANSI Z89.1'],
        lastUpdated: '2024-01-01',
        nextReview: '2024-07-01',
        status: 'active',
        attachments: []
      },
      {
        id: '2',
        title: 'Equipment Operation Safety',
        category: 'Equipment',
        description: 'Safe operation procedures for construction equipment',
        steps: [
          'Pre-operation inspection',
          'Verify operator certification',
          'Ensure spotter when backing',
          'Maintain safe distances',
          'Follow lockout/tagout procedures'
        ],
        equipment: ['Checklist forms', 'Communication devices', 'Warning devices'],
        compliance: ['OSHA 1926.601', 'OSHA 1926.602'],
        lastUpdated: '2024-01-15',
        nextReview: '2024-07-15',
        status: 'active',
        attachments: []
      }
    ];
    setProtocols(mockProtocols);
  };

  const loadTrainings = async () => {
    // Mock training data
    const mockTrainings: SafetyTraining[] = [
      {
        id: '1',
        employeeId: 'emp-1',
        employeeName: 'John Smith',
        trainingType: 'OSHA 30-Hour',
        title: 'OSHA 30-Hour Construction Safety',
        provider: 'Safety Training Institute',
        completedDate: '2023-02-15',
        expiryDate: '2026-02-15',
        certificateNumber: 'OSH-30-2023-001',
        status: 'valid',
        requiredBy: 'Federal Law'
      },
      {
        id: '2',
        employeeId: 'emp-2',
        employeeName: 'Mike Johnson',
        trainingType: 'Equipment Safety',
        title: 'Heavy Equipment Operation Safety',
        provider: 'Equipment Safety Corp',
        completedDate: '2023-06-10',
        expiryDate: '2025-06-10',
        certificateNumber: 'EQP-SAF-2023-045',
        status: 'expiring',
        requiredBy: 'Company Policy'
      },
      {
        id: '3',
        employeeId: 'emp-3',
        employeeName: 'Sarah Davis',
        trainingType: 'First Aid/CPR',
        title: 'First Aid and CPR Certification',
        provider: 'Red Cross',
        completedDate: '2022-08-20',
        expiryDate: '2024-08-20',
        status: 'expired',
        requiredBy: 'Company Policy'
      }
    ];
    setTrainings(mockTrainings);
  };

  const applyFilters = () => {
    let filtered = incidents;

    if (searchTerm) {
      filtered = filtered.filter(incident =>
        incident.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        incident.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        incident.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
        incident.reportedBy.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (typeFilter !== 'all') {
      filtered = filtered.filter(incident => incident.type === typeFilter);
    }

    if (severityFilter !== 'all') {
      filtered = filtered.filter(incident => incident.severity === severityFilter);
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(incident => incident.status === statusFilter);
    }

    setFilteredIncidents(filtered);
  };

  const createIncident = async () => {
    const incident: SafetyIncident = {
      id: Date.now().toString(),
      reportNumber: `INC-2024-${String(incidents.length + 1).padStart(3, '0')}`,
      type: newIncident.type,
      severity: newIncident.severity,
      status: 'reported',
      title: newIncident.title,
      description: newIncident.description,
      location: newIncident.location,
      dateOccurred: newIncident.dateOccurred,
      timeOccurred: newIncident.timeOccurred,
      reportedBy: 'Current User', // In real app, get from auth context
      reportedDate: new Date().toISOString().split('T')[0],
      witnessedBy: newIncident.witnessedBy,
      injuredPersons: [],
      immediateActions: newIncident.immediateActions,
      correctiveActions: [],
      preventiveMeasures: [],
      attachments: [],
      investigation: {
        assignedTo: '',
        startDate: '',
        findings: ''
      }
    };

    setIncidents(prev => [incident, ...prev]);
    setIsIncidentDialogOpen(false);
    
    // Reset form
    setNewIncident({
      type: 'near_miss',
      severity: 'medium',
      title: '',
      description: '',
      location: '',
      dateOccurred: '',
      timeOccurred: '',
      witnessedBy: [],
      immediateActions: '',
      newWitness: ''
    });

    toast({
      title: "Incident Reported",
      description: `Incident ${incident.reportNumber} has been reported`,
    });
  };

  const deleteIncident = (incidentId: string) => {
    setIncidents(prev => prev.filter(incident => incident.id !== incidentId));
    toast({
      title: "Incident Deleted",
      description: "Incident has been removed from records",
    });
  };

  const addWitness = () => {
    if (newIncident.newWitness.trim() && !newIncident.witnessedBy.includes(newIncident.newWitness.trim())) {
      setNewIncident(prev => ({
        ...prev,
        witnessedBy: [...prev.witnessedBy, prev.newWitness.trim()],
        newWitness: ''
      }));
    }
  };

  const removeWitness = (witness: string) => {
    setNewIncident(prev => ({
      ...prev,
      witnessedBy: prev.witnessedBy.filter(w => w !== witness)
    }));
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'injury': return 'text-red-600 bg-red-100';
      case 'near_miss': return 'text-yellow-600 bg-yellow-100';
      case 'property_damage': return 'text-orange-600 bg-orange-100';
      case 'environmental': return 'text-green-600 bg-green-100';
      case 'security': return 'text-purple-600 bg-purple-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-600';
      case 'high': return 'text-orange-600';
      case 'medium': return 'text-yellow-600';
      case 'low': return 'text-green-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'reported': return 'text-blue-600 bg-blue-100';
      case 'investigating': return 'text-yellow-600 bg-yellow-100';
      case 'resolved': return 'text-green-600 bg-green-100';
      case 'closed': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getTrainingStatusColor = (status: string) => {
    switch (status) {
      case 'valid': return 'text-green-600 bg-green-100';
      case 'expiring': return 'text-yellow-600 bg-yellow-100';
      case 'expired': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const calculateSafetyMetrics = () => {
    const totalIncidents = incidents.length;
    const injuryRate = incidents.filter(i => i.type === 'injury').length;
    const nearMissRate = incidents.filter(i => i.type === 'near_miss').length;
    const resolvedIncidents = incidents.filter(i => i.status === 'resolved').length;
    const resolutionRate = totalIncidents > 0 ? (resolvedIncidents / totalIncidents) * 100 : 0;

    const expiredTrainings = trainings.filter(t => t.status === 'expired').length;
    const expiringTrainings = trainings.filter(t => t.status === 'expiring').length;
    const validTrainings = trainings.filter(t => t.status === 'valid').length;
    const trainingCompliance = trainings.length > 0 ? (validTrainings / trainings.length) * 100 : 0;

    return {
      totalIncidents,
      injuryRate,
      nearMissRate,
      resolutionRate,
      expiredTrainings,
      expiringTrainings,
      trainingCompliance
    };
  };

  const metrics = calculateSafetyMetrics();

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Shield className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-3xl font-bold text-foreground">Safety Management</h1>
              <p className="text-muted-foreground">
                Monitor incidents, track training, and ensure compliance
              </p>
            </div>
          </div>
          <Dialog open={isIncidentDialogOpen} onOpenChange={setIsIncidentDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Report Incident
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Report Safety Incident</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Incident Type</label>
                    <Select value={newIncident.type} onValueChange={(value: any) => 
                      setNewIncident(prev => ({ ...prev, type: value }))
                    }>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="injury">Injury</SelectItem>
                        <SelectItem value="near_miss">Near Miss</SelectItem>
                        <SelectItem value="property_damage">Property Damage</SelectItem>
                        <SelectItem value="environmental">Environmental</SelectItem>
                        <SelectItem value="security">Security</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Severity</label>
                    <Select value={newIncident.severity} onValueChange={(value: any) => 
                      setNewIncident(prev => ({ ...prev, severity: value }))
                    }>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="critical">Critical</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div>
                  <label className="text-sm font-medium">Incident Title</label>
                  <Input
                    value={newIncident.title}
                    onChange={(e) => setNewIncident(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Brief description of incident"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">Detailed Description</label>
                  <Input
                    value={newIncident.description}
                    onChange={(e) => setNewIncident(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Detailed description of what happened"
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="text-sm font-medium">Location</label>
                    <Input
                      value={newIncident.location}
                      onChange={(e) => setNewIncident(prev => ({ ...prev, location: e.target.value }))}
                      placeholder="Incident location"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Date Occurred</label>
                    <Input
                      type="date"
                      value={newIncident.dateOccurred}
                      onChange={(e) => setNewIncident(prev => ({ ...prev, dateOccurred: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Time Occurred</label>
                    <Input
                      type="time"
                      value={newIncident.timeOccurred}
                      onChange={(e) => setNewIncident(prev => ({ ...prev, timeOccurred: e.target.value }))}
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium">Witnesses</label>
                  <div className="flex gap-2">
                    <Input
                      value={newIncident.newWitness}
                      onChange={(e) => setNewIncident(prev => ({ ...prev, newWitness: e.target.value }))}
                      placeholder="Add witness name..."
                      onKeyPress={(e) => e.key === 'Enter' && addWitness()}
                    />
                    <Button type="button" onClick={addWitness} size="sm">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {newIncident.witnessedBy.map((witness) => (
                      <Badge key={witness} variant="secondary" className="cursor-pointer" onClick={() => removeWitness(witness)}>
                        {witness} ×
                      </Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium">Immediate Actions Taken</label>
                  <Input
                    value={newIncident.immediateActions}
                    onChange={(e) => setNewIncident(prev => ({ ...prev, immediateActions: e.target.value }))}
                    placeholder="What immediate actions were taken?"
                  />
                </div>

                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsIncidentDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={createIncident}>
                    Report Incident
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Safety Metrics Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-red-500" />
                <div>
                  <div className="text-2xl font-bold text-red-600">
                    {metrics.totalIncidents}
                  </div>
                  <div className="text-sm text-muted-foreground">Total Incidents</div>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Target className="h-5 w-5 text-green-500" />
                <div>
                  <div className="text-2xl font-bold text-green-600">
                    {metrics.resolutionRate.toFixed(0)}%
                  </div>
                  <div className="text-sm text-muted-foreground">Resolution Rate</div>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Award className="h-5 w-5 text-blue-500" />
                <div>
                  <div className="text-2xl font-bold text-blue-600">
                    {metrics.trainingCompliance.toFixed(0)}%
                  </div>
                  <div className="text-sm text-muted-foreground">Training Compliance</div>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-yellow-500" />
                <div>
                  <div className="text-2xl font-bold text-yellow-600">
                    {metrics.expiringTrainings}
                  </div>
                  <div className="text-sm text-muted-foreground">Expiring Training</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-4 flex-wrap">
              <div className="flex-1 min-w-[200px]">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search incidents..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="injury">Injury</SelectItem>
                  <SelectItem value="near_miss">Near Miss</SelectItem>
                  <SelectItem value="property_damage">Property Damage</SelectItem>
                  <SelectItem value="environmental">Environmental</SelectItem>
                  <SelectItem value="security">Security</SelectItem>
                </SelectContent>
              </Select>
              <Select value={severityFilter} onValueChange={setSeverityFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Severity" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Severities</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="reported">Reported</SelectItem>
                  <SelectItem value="investigating">Investigating</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                  <SelectItem value="closed">Closed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="incidents">Incidents</TabsTrigger>
            <TabsTrigger value="protocols">Protocols</TabsTrigger>
            <TabsTrigger value="training">Training</TabsTrigger>
            <TabsTrigger value="compliance">Compliance</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Safety Performance
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-sm">
                      <span>Incident Resolution Rate</span>
                      <span className="font-medium">{metrics.resolutionRate.toFixed(0)}%</span>
                    </div>
                    <Progress value={metrics.resolutionRate} className="h-2" />
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-sm">
                      <span>Training Compliance</span>
                      <span className="font-medium">{metrics.trainingCompliance.toFixed(0)}%</span>
                    </div>
                    <Progress value={metrics.trainingCompliance} className="h-2" />
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-4 text-center">
                    <div>
                      <div className="text-2xl font-bold text-yellow-600">{metrics.nearMissRate}</div>
                      <div className="text-sm text-muted-foreground">Near Misses</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-red-600">{metrics.injuryRate}</div>
                      <div className="text-sm text-muted-foreground">Injuries</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    Recent Activity
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {incidents.slice(0, 4).map((incident) => (
                      <div key={incident.id} className="flex items-center justify-between p-3 border rounded-md">
                        <div className="flex items-center gap-3">
                          <AlertTriangle className={`h-4 w-4 ${getSeverityColor(incident.severity)}`} />
                          <div>
                            <div className="font-medium text-sm">{incident.title}</div>
                            <div className="text-xs text-muted-foreground">
                              {incident.reportNumber} • {formatDate(incident.dateOccurred)}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge variant="outline" className={getStatusColor(incident.status)}>
                            {incident.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="incidents" className="space-y-6">
            <div className="grid gap-4">
              {filteredIncidents.map((incident) => (
                <Card key={incident.id} className="cursor-pointer hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 space-y-3">
                        <div className="flex items-center gap-3">
                          <h3 className="font-semibold text-lg">{incident.title}</h3>
                          <Badge className={getTypeColor(incident.type)}>
                            {incident.type.replace('_', ' ')}
                          </Badge>
                          <Badge variant="outline" className={getSeverityColor(incident.severity)}>
                            {incident.severity}
                          </Badge>
                          <Badge className={getStatusColor(incident.status)}>
                            {incident.status}
                          </Badge>
                        </div>
                        
                        <div className="text-sm text-muted-foreground">
                          {incident.reportNumber} • Reported by {incident.reportedBy}
                        </div>

                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-3 w-3 text-muted-foreground" />
                            <span>{formatDate(incident.dateOccurred)} at {incident.timeOccurred}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <MapPin className="h-3 w-3 text-muted-foreground" />
                            <span>{incident.location}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Users className="h-3 w-3 text-muted-foreground" />
                            <span>{incident.witnessedBy.length} witnesses</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <FileText className="h-3 w-3 text-muted-foreground" />
                            <span>{incident.attachments.length} attachments</span>
                          </div>
                        </div>

                        <div className="text-sm">
                          <div className="font-medium">Description:</div>
                          <div className="text-muted-foreground">{incident.description}</div>
                        </div>

                        <div className="text-sm">
                          <div className="font-medium">Immediate Actions:</div>
                          <div className="text-muted-foreground">{incident.immediateActions}</div>
                        </div>

                        {incident.injuredPersons.length > 0 && (
                          <div className="text-sm">
                            <div className="font-medium text-red-600">Injured Persons:</div>
                            {incident.injuredPersons.map((person, index) => (
                              <div key={index} className="text-muted-foreground">
                                {person.name} ({person.role}) - {person.injuryType}
                                {person.medicalAttention && (
                                  <Badge variant="outline" className="ml-2 text-xs">Medical Attention</Badge>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => {
                          setSelectedIncident(incident);
                          setIsViewerOpen(true);
                        }}>
                          <Eye className="h-3 w-3" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => deleteIncident(incident.id)}>
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="protocols" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              {protocols.map((protocol) => (
                <Card key={protocol.id}>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>{protocol.title}</span>
                      <Badge variant={protocol.status === 'active' ? 'default' : 'secondary'}>
                        {protocol.status}
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="text-sm text-muted-foreground">
                      {protocol.description}
                    </div>

                    <div>
                      <div className="font-medium text-sm mb-2">Key Steps:</div>
                      <div className="space-y-1">
                        {protocol.steps.slice(0, 3).map((step, index) => (
                          <div key={index} className="text-sm flex items-center gap-2">
                            <CheckCircle className="h-3 w-3 text-green-500" />
                            <span>{step}</span>
                          </div>
                        ))}
                        {protocol.steps.length > 3 && (
                          <div className="text-sm text-muted-foreground">
                            +{protocol.steps.length - 3} more steps
                          </div>
                        )}
                      </div>
                    </div>

                    <div>
                      <div className="font-medium text-sm mb-2">Required Equipment:</div>
                      <div className="flex flex-wrap gap-1">
                        {protocol.equipment.slice(0, 3).map((item) => (
                          <Badge key={item} variant="secondary" className="text-xs">
                            {item}
                          </Badge>
                        ))}
                        {protocol.equipment.length > 3 && (
                          <Badge variant="secondary" className="text-xs">
                            +{protocol.equipment.length - 3}
                          </Badge>
                        )}
                      </div>
                    </div>

                    <div className="flex justify-between items-center text-sm text-muted-foreground">
                      <span>Last Updated: {formatDate(protocol.lastUpdated)}</span>
                      <span>Next Review: {formatDate(protocol.nextReview)}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="training" className="space-y-6">
            <div className="grid gap-4">
              {trainings.map((training) => (
                <Card key={training.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <Avatar className="h-10 w-10">
                          <AvatarFallback>
                            {training.employeeName.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{training.employeeName}</div>
                          <div className="text-sm text-muted-foreground">{training.title}</div>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <Badge className={getTrainingStatusColor(training.status)}>
                          {training.status}
                        </Badge>
                        <div className="text-sm text-muted-foreground mt-1">
                          Expires: {formatDate(training.expiryDate)}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="compliance" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clipboard className="h-5 w-5" />
                  Compliance Dashboard
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  <div className="p-4 border rounded-md text-center">
                    <HardHat className="h-8 w-8 mx-auto mb-2 text-blue-500" />
                    <div className="font-medium">OSHA Compliance</div>
                    <div className="text-2xl font-bold text-green-600">98%</div>
                    <div className="text-sm text-muted-foreground">Up to date</div>
                  </div>
                  <div className="p-4 border rounded-md text-center">
                    <Award className="h-8 w-8 mx-auto mb-2 text-yellow-500" />
                    <div className="font-medium">Training Records</div>
                    <div className="text-2xl font-bold text-yellow-600">85%</div>
                    <div className="text-sm text-muted-foreground">Needs attention</div>
                  </div>
                  <div className="p-4 border rounded-md text-center">
                    <FileText className="h-8 w-8 mx-auto mb-2 text-green-500" />
                    <div className="font-medium">Safety Protocols</div>
                    <div className="text-2xl font-bold text-green-600">100%</div>
                    <div className="text-sm text-muted-foreground">Current</div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-4">Action Items</h4>
                  <div className="space-y-2">
                    <div className="flex items-center gap-3 p-3 border rounded-md">
                      <AlertTriangle className="h-4 w-4 text-yellow-500" />
                      <div className="flex-1">
                        <div className="font-medium text-sm">Sarah Davis - First Aid/CPR Expired</div>
                        <div className="text-xs text-muted-foreground">Certification expired on Aug 20, 2024</div>
                      </div>
                      <Button size="sm" variant="outline">Schedule</Button>
                    </div>
                    <div className="flex items-center gap-3 p-3 border rounded-md">
                      <Clock className="h-4 w-4 text-orange-500" />
                      <div className="flex-1">
                        <div className="font-medium text-sm">Mike Johnson - Equipment Safety Expiring</div>
                        <div className="text-xs text-muted-foreground">Expires on June 10, 2025</div>
                      </div>
                      <Button size="sm" variant="outline">Renew</Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Incident Viewer Dialog */}
        <Dialog open={isViewerOpen} onOpenChange={setIsViewerOpen}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>
                {selectedIncident?.reportNumber} - {selectedIncident?.title}
              </DialogTitle>
            </DialogHeader>
            {selectedIncident && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="text-muted-foreground">Type</div>
                    <Badge className={getTypeColor(selectedIncident.type)}>
                      {selectedIncident.type.replace('_', ' ')}
                    </Badge>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Severity</div>
                    <Badge variant="outline" className={getSeverityColor(selectedIncident.severity)}>
                      {selectedIncident.severity}
                    </Badge>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Status</div>
                    <Badge className={getStatusColor(selectedIncident.status)}>
                      {selectedIncident.status}
                    </Badge>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Location</div>
                    <div className="font-medium">{selectedIncident.location}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Date & Time</div>
                    <div className="font-medium">
                      {formatDate(selectedIncident.dateOccurred)} at {selectedIncident.timeOccurred}
                    </div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Reported By</div>
                    <div className="font-medium">{selectedIncident.reportedBy}</div>
                  </div>
                </div>

                <div>
                  <div className="text-muted-foreground text-sm mb-2">Description</div>
                  <div className="p-3 border rounded-md bg-muted/50">
                    {selectedIncident.description}
                  </div>
                </div>

                <div>
                  <div className="text-muted-foreground text-sm mb-2">Immediate Actions</div>
                  <div className="p-3 border rounded-md bg-muted/50">
                    {selectedIncident.immediateActions}
                  </div>
                </div>

                {selectedIncident.witnessedBy.length > 0 && (
                  <div>
                    <div className="text-muted-foreground text-sm mb-2">Witnesses</div>
                    <div className="flex flex-wrap gap-1">
                      {selectedIncident.witnessedBy.map((witness) => (
                        <Badge key={witness} variant="secondary">
                          {witness}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {selectedIncident.investigation.findings && (
                  <div>
                    <div className="text-muted-foreground text-sm mb-2">Investigation Findings</div>
                    <div className="p-3 border rounded-md bg-muted/50">
                      {selectedIncident.investigation.findings}
                    </div>
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>

        {filteredIncidents.length === 0 && activeTab === 'incidents' && (
          <Card>
            <CardContent className="text-center py-12">
              <Shield className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Incidents Found</h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm || typeFilter !== 'all' || severityFilter !== 'all' || statusFilter !== 'all'
                  ? 'No incidents match your current filters'
                  : 'Great! No safety incidents have been reported'
                }
              </p>
              {(!searchTerm && typeFilter === 'all' && severityFilter === 'all' && statusFilter === 'all') && (
                <Button onClick={() => setIsIncidentDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Report Incident
                </Button>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}