import { useState } from 'react';
import { DashboardLayout } from "../components/layout/dashboard-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Label } from "../components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Badge } from "../components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { 
  ShieldCheck, 
  AlertTriangle, 
  FileText, 
  Users, 
  HardHat, 
  Eye, 
  CheckCircle,
  XCircle,
  TrendingUp
} from "lucide-react";

interface SafetyIncident {
  id: string;
  date: string;
  type: 'injury' | 'near_miss' | 'property_damage' | 'environmental';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  location: string;
  employeeInvolved: string;
  status: 'open' | 'investigating' | 'resolved';
  actions: string[];
}

interface SafetyInspection {
  id: string;
  date: string;
  inspector: string;
  location: string;
  type: 'routine' | 'scheduled' | 'surprise';
  score: number;
  issues: number;
  status: 'pass' | 'fail' | 'conditional';
}

interface TrainingRecord {
  id: string;
  employeeName: string;
  course: string;
  completedDate: string;
  expiryDate: string;
  status: 'current' | 'expiring' | 'expired';
}

export default function Safety() {
  const [newIncidentType, setNewIncidentType] = useState('');
  const [selectedPeriod, setSelectedPeriod] = useState('30days');

  const safetyIncidents: SafetyIncident[] = [
    {
      id: '1',
      date: '2024-01-10',
      type: 'near_miss',
      severity: 'medium',
      description: 'Worker almost slipped on wet pavement during sealcoat application',
      location: 'Church Parking Lot - Section A',
      employeeInvolved: 'John Smith',
      status: 'resolved',
      actions: ['Added non-slip mats', 'Reviewed wet weather procedures', 'Additional training scheduled']
    },
    {
      id: '2',
      date: '2024-01-05',
      type: 'property_damage',
      severity: 'low',
      description: 'Minor scrape on vehicle bumper during backing maneuver',
      location: 'Equipment Yard',
      employeeInvolved: 'Mike Johnson',
      status: 'resolved',
      actions: ['Vehicle repaired', 'Spotter assigned for backing', 'Refresher training completed']
    },
    {
      id: '3',
      date: '2023-12-28',
      type: 'injury',
      severity: 'low',
      description: 'Minor cut on hand from handling equipment',
      location: 'Shopping Center Project',
      employeeInvolved: 'Sarah Williams',
      status: 'resolved',
      actions: ['First aid administered', 'Cut-resistant gloves provided', 'Tool safety review']
    }
  ];

  const safetyInspections: SafetyInspection[] = [
    {
      id: '1',
      date: '2024-01-12',
      inspector: 'David Chen',
      location: 'Equipment Yard',
      type: 'routine',
      score: 95,
      issues: 2,
      status: 'pass'
    },
    {
      id: '2',
      date: '2024-01-08',
      inspector: 'External Inspector',
      location: 'Church Parking Lot',
      type: 'scheduled',
      score: 88,
      issues: 5,
      status: 'conditional'
    },
    {
      id: '3',
      date: '2024-01-03',
      inspector: 'David Chen',
      location: 'Office Building',
      type: 'surprise',
      score: 92,
      issues: 3,
      status: 'pass'
    }
  ];

  const trainingRecords: TrainingRecord[] = [
    {
      id: '1',
      employeeName: 'Mike Johnson',
      course: 'OSHA 30-Hour Construction',
      completedDate: '2023-06-15',
      expiryDate: '2026-06-15',
      status: 'current'
    },
    {
      id: '2',
      employeeName: 'Sarah Williams',
      course: 'First Aid/CPR',
      completedDate: '2023-03-20',
      expiryDate: '2025-03-20',
      status: 'current'
    },
    {
      id: '3',
      employeeName: 'Robert Davis',
      course: 'Equipment Safety Training',
      completedDate: '2023-08-10',
      expiryDate: '2024-02-10',
      status: 'expiring'
    },
    {
      id: '4',
      employeeName: 'Lisa Martinez',
      course: 'Office Safety Training',
      completedDate: '2022-12-05',
      expiryDate: '2023-12-05',
      status: 'expired'
    }
  ];

  const getIncidentSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-red-100 text-red-800';
      case 'investigating': return 'bg-yellow-100 text-yellow-800';
      case 'resolved': return 'bg-green-100 text-green-800';
      case 'pass': return 'bg-green-100 text-green-800';
      case 'fail': return 'bg-red-100 text-red-800';
      case 'conditional': return 'bg-yellow-100 text-yellow-800';
      case 'current': return 'bg-green-100 text-green-800';
      case 'expiring': return 'bg-yellow-100 text-yellow-800';
      case 'expired': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getIncidentIcon = (type: string) => {
    switch (type) {
      case 'injury': return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'near_miss': return <Eye className="h-4 w-4 text-yellow-500" />;
      case 'property_damage': return <XCircle className="h-4 w-4 text-orange-500" />;
      case 'environmental': return <ShieldCheck className="h-4 w-4 text-blue-500" />;
      default: return <AlertTriangle className="h-4 w-4 text-gray-500" />;
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Safety Management</h1>
            <p className="text-muted-foreground">
              Monitor safety incidents, inspections, and training records
            </p>
          </div>
          <Button className="gap-2">
            <AlertTriangle className="h-4 w-4" />
            Report Incident
          </Button>
        </div>

        {/* Safety Metrics */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Days Incident-Free</CardTitle>
              <ShieldCheck className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">127</div>
              <p className="text-xs text-muted-foreground">Current streak</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Safety Score</CardTitle>
              <TrendingUp className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">92%</div>
              <p className="text-xs text-muted-foreground">+5% from last month</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Training Compliance</CardTitle>
              <HardHat className="h-4 w-4 text-purple-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">85%</div>
              <p className="text-xs text-muted-foreground">3 certifications expiring</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Open Issues</CardTitle>
              <AlertTriangle className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">2</div>
              <p className="text-xs text-muted-foreground">Require attention</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="incidents" className="space-y-6">
          <TabsList>
            <TabsTrigger value="incidents">Incidents</TabsTrigger>
            <TabsTrigger value="inspections">Inspections</TabsTrigger>
            <TabsTrigger value="training">Training</TabsTrigger>
            <TabsTrigger value="protocols">Protocols</TabsTrigger>
          </TabsList>

          <TabsContent value="incidents" className="space-y-6">
            {/* Incident Filters */}
            <Card>
              <CardContent className="pt-6">
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="space-y-2">
                    <Label>Time Period</Label>
                    <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="7days">Last 7 Days</SelectItem>
                        <SelectItem value="30days">Last 30 Days</SelectItem>
                        <SelectItem value="90days">Last 90 Days</SelectItem>
                        <SelectItem value="year">This Year</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Incident Type</Label>
                    <Select value={newIncidentType} onValueChange={setNewIncidentType}>
                      <SelectTrigger>
                        <SelectValue placeholder="All types" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Types</SelectItem>
                        <SelectItem value="injury">Injury</SelectItem>
                        <SelectItem value="near_miss">Near Miss</SelectItem>
                        <SelectItem value="property_damage">Property Damage</SelectItem>
                        <SelectItem value="environmental">Environmental</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-end">
                    <Button variant="outline" className="w-full">
                      Export Report
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Incidents List */}
            <div className="space-y-4">
              {safetyIncidents.map((incident) => (
                <Card key={incident.id}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4">
                        <div className="mt-1">
                          {getIncidentIcon(incident.type)}
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center gap-3">
                            <h3 className="font-semibold capitalize">
                              {incident.type.replace('_', ' ')} Incident
                            </h3>
                            <Badge className={getIncidentSeverityColor(incident.severity)}>
                              {incident.severity.toUpperCase()}
                            </Badge>
                            <Badge className={getStatusColor(incident.status)}>
                              {incident.status.toUpperCase()}
                            </Badge>
                          </div>
                          <p className="text-muted-foreground">{incident.description}</p>
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div><strong>Date:</strong> {incident.date}</div>
                            <div><strong>Location:</strong> {incident.location}</div>
                            <div><strong>Employee:</strong> {incident.employeeInvolved}</div>
                            <div><strong>ID:</strong> #{incident.id}</div>
                          </div>
                          {incident.actions.length > 0 && (
                            <div>
                              <div className="font-medium text-sm mb-1">Corrective Actions:</div>
                              <ul className="text-sm text-muted-foreground space-y-1">
                                {incident.actions.map((action, index) => (
                                  <li key={index} className="flex items-start gap-2">
                                    <CheckCircle className="h-3 w-3 text-green-500 mt-0.5 flex-shrink-0" />
                                    {action}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">View Details</Button>
                        <Button variant="outline" size="sm">Edit</Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="inspections" className="space-y-6">
            <div className="grid gap-4">
              {safetyInspections.map((inspection) => (
                <Card key={inspection.id}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center gap-3">
                          <h3 className="font-semibold">Safety Inspection</h3>
                          <Badge className={getStatusColor(inspection.status)}>
                            {inspection.status.toUpperCase()}
                          </Badge>
                          <Badge variant="outline" className="capitalize">
                            {inspection.type}
                          </Badge>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
                          <div><strong>Date:</strong> {inspection.date}</div>
                          <div><strong>Inspector:</strong> {inspection.inspector}</div>
                          <div><strong>Location:</strong> {inspection.location}</div>
                          <div><strong>Issues Found:</strong> {inspection.issues}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-3xl font-bold text-primary">{inspection.score}%</div>
                        <div className="text-sm text-muted-foreground">Safety Score</div>
                        <Button variant="outline" size="sm" className="mt-2">
                          View Report
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="training" className="space-y-6">
            <div className="grid gap-4">
              {trainingRecords.map((record) => (
                <Card key={record.id}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center gap-3">
                          <h3 className="font-semibold">{record.course}</h3>
                          <Badge className={getStatusColor(record.status)}>
                            {record.status.toUpperCase()}
                          </Badge>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
                          <div><strong>Employee:</strong> {record.employeeName}</div>
                          <div><strong>Completed:</strong> {record.completedDate}</div>
                          <div><strong>Expires:</strong> {record.expiryDate}</div>
                          <div><strong>Status:</strong> {record.status}</div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">View Certificate</Button>
                        {record.status === 'expiring' || record.status === 'expired' ? (
                          <Button size="sm">Schedule Renewal</Button>
                        ) : (
                          <Button variant="outline" size="sm">Update</Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="protocols" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Safety Protocols
                  </CardTitle>
                  <CardDescription>Standard operating procedures and guidelines</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="p-3 border rounded">
                      <div className="font-medium">Equipment Operation SOP</div>
                      <div className="text-sm text-muted-foreground">Last updated: Jan 5, 2024</div>
                    </div>
                    <div className="p-3 border rounded">
                      <div className="font-medium">Asphalt Paving Safety Protocol</div>
                      <div className="text-sm text-muted-foreground">Last updated: Dec 20, 2023</div>
                    </div>
                    <div className="p-3 border rounded">
                      <div className="font-medium">Emergency Response Procedures</div>
                      <div className="text-sm text-muted-foreground">Last updated: Nov 15, 2023</div>
                    </div>
                    <div className="p-3 border rounded">
                      <div className="font-medium">PPE Requirements</div>
                      <div className="text-sm text-muted-foreground">Last updated: Oct 30, 2023</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Safety Team
                  </CardTitle>
                  <CardDescription>Safety coordinators and emergency contacts</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="p-3 border rounded">
                      <div className="font-medium">David Chen - Safety Coordinator</div>
                      <div className="text-sm text-muted-foreground">Primary: (804) 555-0103</div>
                      <div className="text-sm text-muted-foreground">Emergency: (804) 555-9911</div>
                    </div>
                    <div className="p-3 border rounded">
                      <div className="font-medium">Emergency Services</div>
                      <div className="text-sm text-muted-foreground">911 - Police/Fire/Medical</div>
                      <div className="text-sm text-muted-foreground">Poison Control: 1-800-222-1222</div>
                    </div>
                    <div className="p-3 border rounded">
                      <div className="font-medium">Company Emergency Line</div>
                      <div className="text-sm text-muted-foreground">24/7 Hotline: (804) 555-HELP</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}