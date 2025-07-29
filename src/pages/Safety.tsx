import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Shield, AlertTriangle, FileText, Users, Calendar, CheckCircle, XCircle, Clock, Plus } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

interface SafetyIncident {
  id: string;
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'open' | 'investigating' | 'resolved' | 'closed';
  reportedBy: string;
  reportedAt: string;
  location: string;
  injuryType?: string;
  actionsTaken?: string;
  followUpRequired: boolean;
}

interface SafetyTraining {
  id: string;
  title: string;
  description: string;
  requiredFor: string[];
  duration: number; // in hours
  expirationMonths: number;
  status: 'active' | 'expired' | 'pending';
}

interface EmployeeCertification {
  id: string;
  employeeId: string;
  employeeName: string;
  certification: string;
  issueDate: string;
  expiryDate: string;
  status: 'valid' | 'expiring' | 'expired';
}

export default function Safety() {
  const { user } = useAuth();
  const [incidents, setIncidents] = useState<SafetyIncident[]>([]);
  const [trainings, setTrainings] = useState<SafetyTraining[]>([]);
  const [certifications, setCertifications] = useState<EmployeeCertification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mock data - replace with actual API calls
    setTimeout(() => {
      setIncidents([
        {
          id: '1',
          title: 'Near Miss - Equipment Malfunction',
          description: 'Sealcoat sprayer had pressure buildup, operator noticed before failure',
          severity: 'medium',
          status: 'resolved',
          reportedBy: 'John Smith',
          reportedAt: '2024-01-18T10:30:00Z',
          location: 'First Baptist Church Job Site',
          actionsTaken: 'Equipment inspected and pressure relief valve replaced',
          followUpRequired: false
        },
        {
          id: '2',
          title: 'Slip and Fall',
          description: 'Worker slipped on wet pavement during sealcoat application',
          severity: 'high',
          status: 'investigating',
          reportedBy: 'Maria Rodriguez',
          reportedAt: '2024-01-20T14:15:00Z',
          location: 'Trinity Methodist Church',
          injuryType: 'Minor knee injury',
          followUpRequired: true
        }
      ]);

      setTrainings([
        {
          id: '1',
          title: 'OSHA 10-Hour Construction Safety',
          description: 'Basic construction safety training covering hazard recognition and prevention',
          requiredFor: ['All Employees'],
          duration: 10,
          expirationMonths: 36,
          status: 'active'
        },
        {
          id: '2',
          title: 'Chemical Handling & Safety',
          description: 'Proper handling of sealcoating materials and chemicals',
          requiredFor: ['Equipment Operators', 'Crew Leaders'],
          duration: 4,
          expirationMonths: 12,
          status: 'active'
        },
        {
          id: '3',
          title: 'Equipment Operation Safety',
          description: 'Safe operation of construction equipment and machinery',
          requiredFor: ['Equipment Operators'],
          duration: 6,
          expirationMonths: 24,
          status: 'active'
        }
      ]);

      setCertifications([
        {
          id: '1',
          employeeId: '1',
          employeeName: 'John Smith',
          certification: 'OSHA 10-Hour Construction Safety',
          issueDate: '2023-06-15',
          expiryDate: '2026-06-15',
          status: 'valid'
        },
        {
          id: '2',
          employeeId: '2',
          employeeName: 'Maria Rodriguez',
          certification: 'Chemical Handling & Safety',
          issueDate: '2023-03-20',
          expiryDate: '2024-03-20',
          status: 'expiring'
        },
        {
          id: '3',
          employeeId: '3',
          employeeName: 'David Johnson',
          certification: 'Equipment Operation Safety',
          issueDate: '2022-11-10',
          expiryDate: '2024-11-10',
          status: 'valid'
        },
        {
          id: '4',
          employeeId: '4',
          employeeName: 'Mike Wilson',
          certification: 'OSHA 10-Hour Construction Safety',
          issueDate: '2021-08-20',
          expiryDate: '2024-08-20',
          status: 'expired'
        }
      ]);

      setLoading(false);
    }, 1000);
  }, []);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-600 text-white';
      case 'high': return 'bg-red-500 text-white';
      case 'medium': return 'bg-yellow-500 text-white';
      case 'low': return 'bg-green-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'resolved': case 'closed': return 'bg-success text-success-foreground';
      case 'investigating': return 'bg-warning text-warning-foreground';
      case 'open': return 'bg-destructive text-destructive-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getCertificationStatusColor = (status: string) => {
    switch (status) {
      case 'valid': return 'bg-success text-success-foreground';
      case 'expiring': return 'bg-warning text-warning-foreground';
      case 'expired': return 'bg-destructive text-destructive-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getCertificationIcon = (status: string) => {
    switch (status) {
      case 'valid': return <CheckCircle className="h-4 w-4" />;
      case 'expiring': return <Clock className="h-4 w-4" />;
      case 'expired': return <XCircle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const safetyScore = Math.round((
    (incidents.filter(i => i.status === 'resolved' || i.status === 'closed').length / Math.max(incidents.length, 1)) * 40 +
    (certifications.filter(c => c.status === 'valid').length / Math.max(certifications.length, 1)) * 60
  ));

  const expiringCertifications = certifications.filter(c => c.status === 'expiring' || c.status === 'expired');

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Shield className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold text-foreground">Safety Management</h1>
            <p className="text-muted-foreground">Monitor incidents, training, and safety compliance</p>
          </div>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Report Incident
        </Button>
      </div>

      {/* Safety Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Safety Score</p>
                <p className="text-2xl font-bold">{safetyScore}%</p>
                <Progress value={safetyScore} className="mt-2 h-2" />
              </div>
              <Shield className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Open Incidents</p>
                <p className="text-2xl font-bold text-red-600">
                  {incidents.filter(i => i.status === 'open' || i.status === 'investigating').length}
                </p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Valid Certifications</p>
                <p className="text-2xl font-bold text-green-600">
                  {certifications.filter(c => c.status === 'valid').length}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Training Programs</p>
                <p className="text-2xl font-bold">{trainings.filter(t => t.status === 'active').length}</p>
              </div>
              <FileText className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Alerts */}
      {expiringCertifications.length > 0 && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-yellow-800">
              <AlertTriangle className="h-5 w-5" />
              Certification Alerts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {expiringCertifications.map((cert) => (
                <div key={cert.id} className="flex items-center justify-between text-sm">
                  <span>{cert.employeeName} - {cert.certification}</span>
                  <Badge className={getCertificationStatusColor(cert.status)}>
                    {cert.status === 'expiring' ? `Expires ${new Date(cert.expiryDate).toLocaleDateString()}` : 'Expired'}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="incidents" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="incidents">Incidents</TabsTrigger>
          <TabsTrigger value="training">Training</TabsTrigger>
          <TabsTrigger value="certifications">Certifications</TabsTrigger>
        </TabsList>

        <TabsContent value="incidents" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Safety Incidents</CardTitle>
              <CardDescription>Track and manage workplace safety incidents</CardDescription>
            </CardHeader>
            <CardContent>
              {incidents.length > 0 ? (
                <div className="space-y-4">
                  {incidents.map((incident) => (
                    <Card key={incident.id} className="border-l-4 border-l-red-500">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div>
                            <CardTitle className="text-lg">{incident.title}</CardTitle>
                            <CardDescription className="mt-1">{incident.description}</CardDescription>
                          </div>
                          <div className="flex flex-col gap-2">
                            <Badge className={getSeverityColor(incident.severity)}>
                              {incident.severity}
                            </Badge>
                            <Badge className={getStatusColor(incident.status)}>
                              {incident.status}
                            </Badge>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                          <div>
                            <span className="text-muted-foreground">Reported by:</span>
                            <p className="font-medium">{incident.reportedBy}</p>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Date:</span>
                            <p className="font-medium">{new Date(incident.reportedAt).toLocaleDateString()}</p>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Location:</span>
                            <p className="font-medium">{incident.location}</p>
                          </div>
                        </div>
                        
                        {incident.injuryType && (
                          <div>
                            <span className="text-muted-foreground text-sm">Injury Type:</span>
                            <p className="font-medium">{incident.injuryType}</p>
                          </div>
                        )}
                        
                        {incident.actionsTaken && (
                          <div>
                            <span className="text-muted-foreground text-sm">Actions Taken:</span>
                            <p className="text-sm">{incident.actionsTaken}</p>
                          </div>
                        )}

                        <div className="flex items-center justify-between pt-2">
                          <div className="flex items-center gap-2">
                            {incident.followUpRequired && (
                              <Badge variant="outline" className="text-orange-600 border-orange-600">
                                Follow-up Required
                              </Badge>
                            )}
                          </div>
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm">
                              View Details
                            </Button>
                            {incident.status !== 'closed' && (
                              <Button size="sm">
                                Update Status
                              </Button>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Shield className="h-12 w-12 text-green-600 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2 text-green-600">No Incidents Reported</h3>
                  <p className="text-muted-foreground">Great job maintaining a safe workplace!</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="training" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Safety Training Programs</CardTitle>
              <CardDescription>Manage required safety training and certifications</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {trainings.map((training) => (
                  <Card key={training.id}>
                    <CardHeader>
                      <CardTitle className="text-lg">{training.title}</CardTitle>
                      <CardDescription>{training.description}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="space-y-2 text-sm">
                        <div>
                          <span className="text-muted-foreground">Duration:</span>
                          <span className="ml-2 font-medium">{training.duration} hours</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Valid for:</span>
                          <span className="ml-2 font-medium">{training.expirationMonths} months</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Required for:</span>
                          <div className="mt-1">
                            {training.requiredFor.map((role, index) => (
                              <Badge key={index} variant="secondary" className="mr-1 mb-1">
                                {role}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                      <Button className="w-full">Schedule Training</Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="certifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Employee Certifications</CardTitle>
              <CardDescription>Track employee safety certifications and renewal dates</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {certifications.map((cert) => (
                  <div key={cert.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium">{cert.employeeName}</h4>
                        <Badge className={getCertificationStatusColor(cert.status)}>
                          {getCertificationIcon(cert.status)}
                          <span className="ml-1">{cert.status}</span>
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{cert.certification}</p>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>Issued: {new Date(cert.issueDate).toLocaleDateString()}</span>
                        <span>Expires: {new Date(cert.expiryDate).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        View Certificate
                      </Button>
                      {cert.status === 'expiring' || cert.status === 'expired' ? (
                        <Button size="sm">
                          Renew
                        </Button>
                      ) : (
                        <Button variant="outline" size="sm">
                          Update
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}