import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  FileText,
  Users,
  HardHat,
  MapPin,
  Calendar,
  Eye,
  Award,
  TrendingUp,
  TrendingDown,
  Minus
} from 'lucide-react';

interface SafetyIncident {
  id: string;
  title: string;
  type: 'injury' | 'near_miss' | 'property_damage' | 'environmental';
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'open' | 'investigating' | 'resolved' | 'closed';
  reportedBy: string;
  location: string;
  date: Date;
  description: string;
}

interface SafetyTraining {
  id: string;
  title: string;
  type: 'certification' | 'refresher' | 'onboarding' | 'specialized';
  employee: string;
  completedDate?: Date;
  expiryDate?: Date;
  status: 'completed' | 'in_progress' | 'overdue' | 'scheduled';
}

interface SafetyMetric {
  name: string;
  current: number;
  target: number;
  trend: 'up' | 'down' | 'stable';
  unit: string;
}

export default function SafetyHub() {
  const [incidents, setIncidents] = useState<SafetyIncident[]>([]);
  const [trainings, setTrainings] = useState<SafetyTraining[]>([]);
  const [metrics, setMetrics] = useState<SafetyMetric[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate fetching safety data
    const mockIncidents: SafetyIncident[] = [
      {
        id: '1',
        title: 'Slip on wet pavement',
        type: 'injury',
        severity: 'low',
        status: 'investigating',
        reportedBy: 'Mike Johnson',
        location: 'Church parking lot - Site A',
        date: new Date(Date.now() - 86400000), // Yesterday
        description: 'Employee slipped on wet pavement during sealcoating operation'
      },
      {
        id: '2',
        title: 'Equipment malfunction warning',
        type: 'near_miss',
        severity: 'medium',
        status: 'open',
        reportedBy: 'Sarah Davis',
        location: 'Equipment yard',
        date: new Date(Date.now() - 172800000), // 2 days ago
        description: 'Asphalt spreader showed warning lights during startup'
      },
      {
        id: '3',
        title: 'Chemical spill contained',
        type: 'environmental',
        severity: 'high',
        status: 'resolved',
        reportedBy: 'Tom Wilson',
        location: 'Storage facility',
        date: new Date(Date.now() - 432000000), // 5 days ago
        description: 'Small sealcoat material spill properly contained and cleaned'
      }
    ];

    const mockTrainings: SafetyTraining[] = [
      {
        id: '1',
        title: 'OSHA 10-Hour Construction Safety',
        type: 'certification',
        employee: 'John Smith',
        completedDate: new Date(Date.now() - 5184000000), // 60 days ago
        expiryDate: new Date(Date.now() + 31536000000), // 1 year from now
        status: 'completed'
      },
      {
        id: '2',
        title: 'Hazmat Handling Refresher',
        type: 'refresher',
        employee: 'Mike Johnson',
        expiryDate: new Date(Date.now() + 7776000000), // 3 months from now
        status: 'scheduled'
      },
      {
        id: '3',
        title: 'Equipment Safety Orientation',
        type: 'onboarding',
        employee: 'New Hire #1',
        status: 'in_progress'
      },
      {
        id: '4',
        title: 'Fall Protection Certification',
        type: 'specialized',
        employee: 'Sarah Davis',
        completedDate: new Date(Date.now() - 15552000000), // 6 months ago
        expiryDate: new Date(Date.now() - 2592000000), // 1 month ago (overdue)
        status: 'overdue'
      }
    ];

    const mockMetrics: SafetyMetric[] = [
      {
        name: 'Days Since Last Incident',
        current: 15,
        target: 30,
        trend: 'up',
        unit: 'days'
      },
      {
        name: 'Training Completion Rate',
        current: 87,
        target: 95,
        trend: 'up',
        unit: '%'
      },
      {
        name: 'Safety Inspections',
        current: 24,
        target: 20,
        trend: 'up',
        unit: 'this month'
      },
      {
        name: 'Near Miss Reports',
        current: 8,
        target: 10,
        trend: 'down',
        unit: 'this month'
      }
    ];

    setIncidents(mockIncidents);
    setTrainings(mockTrainings);
    setMetrics(mockMetrics);
    setLoading(false);
  }, []);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'low': return 'text-green-600 bg-green-50';
      case 'medium': return 'text-yellow-600 bg-yellow-50';
      case 'high': return 'text-orange-600 bg-orange-50';
      case 'critical': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
      case 'resolved':
      case 'closed':
        return 'text-green-600 bg-green-50';
      case 'in_progress':
      case 'investigating':
        return 'text-blue-600 bg-blue-50';
      case 'scheduled':
      case 'open':
        return 'text-yellow-600 bg-yellow-50';
      case 'overdue':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'injury': return <AlertTriangle className="h-4 w-4" />;
      case 'near_miss': return <Eye className="h-4 w-4" />;
      case 'property_damage': return <HardHat className="h-4 w-4" />;
      case 'environmental': return <Shield className="h-4 w-4" />;
      default: return <AlertTriangle className="h-4 w-4" />;
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'down': return <TrendingDown className="h-4 w-4 text-red-600" />;
      case 'stable': return <Minus className="h-4 w-4 text-gray-600" />;
      default: return <Minus className="h-4 w-4 text-gray-600" />;
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-96">Loading safety data...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Safety Management</h1>
          <p className="text-muted-foreground">
            Monitor safety incidents, training, and compliance
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2">
            <FileText className="h-4 w-4" />
            New Report
          </Button>
          <Button className="gap-2">
            <Award className="h-4 w-4" />
            Safety Training
          </Button>
        </div>
      </div>

      {/* Safety Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((metric, index) => (
          <Card key={index}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{metric.name}</p>
                  <div className="flex items-center gap-2">
                    <p className="text-2xl font-bold">{metric.current}</p>
                    <span className="text-sm text-muted-foreground">{metric.unit}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">Target: {metric.target} {metric.unit}</p>
                </div>
                <div className="flex flex-col items-center">
                  {getTrendIcon(metric.trend)}
                  <Shield className="h-8 w-8 text-muted-foreground mt-2" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Incidents */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Recent Incidents
            </CardTitle>
            <CardDescription>
              Latest safety incidents and their status
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {incidents.map((incident) => (
                <div key={incident.id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {getTypeIcon(incident.type)}
                      <h4 className="font-medium">{incident.title}</h4>
                    </div>
                    <div className="flex gap-2">
                      <Badge className={getSeverityColor(incident.severity)}>
                        {incident.severity}
                      </Badge>
                      <Badge className={getStatusColor(incident.status)}>
                        {incident.status}
                      </Badge>
                    </div>
                  </div>
                  
                  <p className="text-sm text-muted-foreground mb-2">
                    {incident.description}
                  </p>
                  
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      {incident.reportedBy}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {incident.location}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {incident.date.toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Training Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5" />
              Training Status
            </CardTitle>
            <CardDescription>
              Employee safety training and certifications
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {trainings.map((training) => (
                <div key={training.id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h4 className="font-medium">{training.title}</h4>
                      <p className="text-sm text-muted-foreground">{training.employee}</p>
                    </div>
                    <Badge className={getStatusColor(training.status)}>
                      {training.status}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span className="capitalize">{training.type} training</span>
                    {training.completedDate && (
                      <span>Completed: {training.completedDate.toLocaleDateString()}</span>
                    )}
                    {training.expiryDate && (
                      <span className={training.expiryDate < new Date() ? 'text-red-600' : ''}>
                        Expires: {training.expiryDate.toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Safety Compliance Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5" />
            Compliance Overview
          </CardTitle>
          <CardDescription>
            OSHA and safety regulation compliance status
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-3">
              <h4 className="font-medium">OSHA Compliance</h4>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Safety Training</span>
                  <Badge variant="default">Compliant</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Equipment Inspections</span>
                  <Badge variant="default">Compliant</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Incident Reporting</span>
                  <Badge variant="outline">Needs Attention</Badge>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="font-medium">Documentation</h4>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Safety Manual</span>
                  <Badge variant="default">Updated</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Emergency Procedures</span>
                  <Badge variant="default">Current</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Training Records</span>
                  <Badge variant="default">Complete</Badge>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="font-medium">Inspections</h4>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Daily Safety Checks</span>
                  <Badge variant="default">Current</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Monthly Audits</span>
                  <Badge variant="default">Scheduled</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Annual Review</span>
                  <Badge variant="outline">Due Soon</Badge>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}