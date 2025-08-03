import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import {
  FileText,
  Plus,
  Calendar,
  User,
  Building,
  MapPin,
  Clock,
  Zap,
  CheckCircle,
  Download,
  Edit,
} from 'lucide-react';

export default function Contracts() {
  const [activeTab, setActiveTab] = useState('active');
  const [webhookUrl, setWebhookUrl] = useState('');

  const mockContracts = [
    {
      id: 'CTR001',
      title: 'First Baptist Church - Parking Lot Repair',
      client: 'First Baptist Church',
      client_email: 'admin@firstbaptist.org',
      client_phone: '(804) 555-0123',
      value: 45000.00,
      start_date: '2024-01-15',
      end_date: '2024-02-28',
      status: 'active',
      progress: 65,
      terms: 'Net 30 payment terms',
      scope: 'Complete asphalt repair, sealcoating, and line striping',
      location: '123 Church Street, Richmond, VA',
    },
    {
      id: 'CTR002',
      title: 'Community Center - Driveway Paving',
      client: 'Richmond Community Center',
      client_email: 'manager@rccenter.org',
      client_phone: '(804) 555-0456',
      value: 28000.00,
      start_date: '2024-02-01',
      end_date: '2024-02-15',
      status: 'pending',
      progress: 0,
      terms: 'Net 15 payment terms',
      scope: 'New asphalt driveway installation',
      location: '456 Community Lane, Richmond, VA',
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'default';
      case 'pending': return 'secondary';
      case 'completed': return 'outline';
      case 'cancelled': return 'destructive';
      default: return 'outline';
    }
  };

  const triggerZapier = async (contractData: any) => {
    if (!webhookUrl) { return; }

    try {
      await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        mode: 'no-cors',
        body: JSON.stringify({
          event: 'contract_created',
          contract: contractData,
          timestamp: new Date().toISOString(),
        }),
      });
    } catch (error) {
      console.error('Zapier webhook failed:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Contract Management</h1>
          <p className="text-muted-foreground">Manage client contracts and project agreements</p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Contract
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>Create New Contract</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="contract-title">Contract Title</Label>
                  <Input id="contract-title" placeholder="Enter contract title" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contract-value">Contract Value ($)</Label>
                  <Input id="contract-value" type="number" placeholder="0.00" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="client-name">Client Name</Label>
                  <Input id="client-name" placeholder="Enter client name" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="client-email">Client Email</Label>
                  <Input id="client-email" type="email" placeholder="client@example.com" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="project-scope">Project Scope</Label>
                <Textarea id="project-scope" placeholder="Describe the project scope..." />
              </div>
              <Button className="w-full">Create Contract</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="active">Active</TabsTrigger>
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="zapier">Zapier</TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="space-y-4">
          {mockContracts.filter(c => c.status === 'active').map((contract) => (
            <Card key={contract.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      <CardTitle className="text-lg">{contract.title}</CardTitle>
                      <Badge variant={getStatusColor(contract.status)}>{contract.status}</Badge>
                    </div>
                    <CardDescription className="flex items-center gap-2">
                      <Building className="h-3 w-3" />
                      {contract.client}
                    </CardDescription>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-green-600">${contract.value.toLocaleString()}</p>
                    <p className="text-sm text-muted-foreground">{contract.progress}% Complete</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-3">
                  <div>
                    <div className="flex items-center gap-2 text-sm font-medium mb-1">
                      <MapPin className="h-3 w-3" />
                      Location
                    </div>
                    <p className="text-sm text-muted-foreground">{contract.location}</p>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 text-sm font-medium mb-1">
                      <Calendar className="h-3 w-3" />
                      Timeline
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {new Date(contract.start_date).toLocaleDateString()} - {new Date(contract.end_date).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 text-sm font-medium mb-1">
                      <User className="h-3 w-3" />
                      Contact
                    </div>
                    <p className="text-sm text-muted-foreground">{contract.client_phone}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <Edit className="h-3 w-3 mr-1" />
                    Edit
                  </Button>
                  <Button variant="outline" size="sm">
                    <Download className="h-3 w-3 mr-1" />
                    Download
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="pending" className="space-y-4">
          {mockContracts.filter(c => c.status === 'pending').map((contract) => (
            <Card key={contract.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      <CardTitle className="text-lg">{contract.title}</CardTitle>
                      <Badge variant="secondary">Pending Approval</Badge>
                    </div>
                    <CardDescription>{contract.client}</CardDescription>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold">${contract.value.toLocaleString()}</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2">
                  <Button size="sm">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Approve
                  </Button>
                  <Button variant="outline" size="sm">
                    <Edit className="h-3 w-3 mr-1" />
                    Review
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="completed" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Completed Contracts</CardTitle>
              <CardDescription>View finished project contracts</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">No completed contracts to display</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-3">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total Contract Value</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">$73,000</div>
                <p className="text-xs text-muted-foreground">+12% from last month</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Active Contracts</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">1</div>
                <p className="text-xs text-muted-foreground">65% average completion</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">100%</div>
                <p className="text-xs text-muted-foreground">On-time delivery</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="zapier" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                Contract Zapier Integration
              </CardTitle>
              <CardDescription>Automate contract notifications and workflows</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="webhook-url">Zapier Webhook URL</Label>
                <Input
                  id="webhook-url"
                  value={webhookUrl}
                  onChange={(e) => { setWebhookUrl(e.target.value); }}
                  placeholder="https://hooks.zapier.com/hooks/catch/..."
                />
              </div>
              <Button
                className="w-full"
                onClick={() => triggerZapier({ test: true })}
                disabled={!webhookUrl}
              >
                <Zap className="h-4 w-4 mr-2" />
                Test Integration
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}