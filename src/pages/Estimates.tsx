import { useState } from "react";
import { DashboardLayout } from "../components/layout/dashboard-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Badge } from "../components/ui/badge";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { 
  Calculator, 
  Plus, 
  FileText,
  DollarSign,
  Clock,
  CheckCircle,
  Send,
  Download,
  Edit
} from "lucide-react";

interface Estimate {
  id: string;
  projectName: string;
  client: string;
  status: 'draft' | 'sent' | 'approved' | 'rejected';
  totalAmount: number;
  createdDate: string;
  validUntil: string;
}

const mockEstimates: Estimate[] = [
  {
    id: '1',
    projectName: 'Office Complex Sealcoating',
    client: 'Corporate Center LLC',
    status: 'sent',
    totalAmount: 18500,
    createdDate: '2024-01-15',
    validUntil: '2024-02-15'
  },
  {
    id: '2',
    projectName: 'Retail Strip Asphalt Repair',
    client: 'Metro Shopping Plaza',
    status: 'approved',
    totalAmount: 25000,
    createdDate: '2024-01-10',
    validUntil: '2024-02-10'
  },
  {
    id: '3',
    projectName: 'Church Parking Expansion',
    client: 'Grace Community Church',
    status: 'draft',
    totalAmount: 32000,
    createdDate: '2024-01-20',
    validUntil: '2024-02-20'
  }
];

const getStatusColor = (status: string) => {
  switch (status) {
    case 'approved': return 'bg-green-500';
    case 'sent': return 'bg-blue-500';
    case 'draft': return 'bg-yellow-500';
    case 'rejected': return 'bg-red-500';
    default: return 'bg-gray-500';
  }
};

const getStatusText = (status: string) => {
  switch (status) {
    case 'approved': return 'Approved';
    case 'sent': return 'Sent';
    case 'draft': return 'Draft';
    case 'rejected': return 'Rejected';
    default: return 'Unknown';
  }
};

export default function Estimates() {
  const [showCalculator, setShowCalculator] = useState(false);
  const [area, setArea] = useState('');
  const [thickness, setThickness] = useState('');
  const [materialType, setMaterialType] = useState('');

  const calculateEstimate = () => {
    const areaNum = parseFloat(area);
    const thicknessNum = parseFloat(thickness);
    
    if (!areaNum || !thicknessNum) return 0;
    
    const baseRate = materialType === 'sealcoating' ? 0.25 : 2.50;
    const materialCost = areaNum * baseRate;
    const laborCost = materialCost * 0.6;
    const equipmentCost = materialCost * 0.3;
    const overhead = (materialCost + laborCost + equipmentCost) * 0.2;
    
    return materialCost + laborCost + equipmentCost + overhead;
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Estimate Center</h1>
            <p className="text-muted-foreground">
              Create and manage project estimates and proposals
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setShowCalculator(!showCalculator)} className="gap-2">
              <Calculator className="h-4 w-4" />
              Calculator
            </Button>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              New Estimate
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Estimates</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">24</div>
              <p className="text-xs text-muted-foreground">This month</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Value</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">$186K</div>
              <p className="text-xs text-muted-foreground">Awaiting approval</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Approval Rate</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">78%</div>
              <p className="text-xs text-muted-foreground">Last 30 days</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Response</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">3.2 days</div>
              <p className="text-xs text-muted-foreground">Client response time</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Quick Calculator */}
          {showCalculator && (
            <Card className="lg:col-span-1">
              <CardHeader>
                <CardTitle>Quick Calculator</CardTitle>
                <CardDescription>Fast estimate calculations</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="area">Area (sq ft)</Label>
                  <Input
                    id="area"
                    placeholder="Enter area..."
                    value={area}
                    onChange={(e) => setArea(e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="thickness">Thickness (inches)</Label>
                  <Input
                    id="thickness"
                    placeholder="Enter thickness..."
                    value={thickness}
                    onChange={(e) => setThickness(e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="material">Material Type</Label>
                  <Select value={materialType} onValueChange={setMaterialType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select material" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sealcoating">Sealcoating</SelectItem>
                      <SelectItem value="asphalt">Asphalt</SelectItem>
                      <SelectItem value="concrete">Concrete</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="pt-4 border-t">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Estimated Total:</span>
                    <span className="text-lg font-bold text-primary">
                      ${calculateEstimate().toLocaleString()}
                    </span>
                  </div>
                </div>
                
                <Button className="w-full gap-2">
                  <FileText className="h-4 w-4" />
                  Create Estimate
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Estimates List */}
          <Card className={showCalculator ? "lg:col-span-2" : "lg:col-span-3"}>
            <CardHeader>
              <CardTitle>Recent Estimates</CardTitle>
              <CardDescription>Manage your project estimates and proposals</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {mockEstimates.map((estimate) => (
                <div key={estimate.id} className="border rounded-lg p-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">{estimate.projectName}</h3>
                        <div className={`w-2 h-2 rounded-full ${getStatusColor(estimate.status)}`}></div>
                        <Badge variant="outline">{getStatusText(estimate.status)}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{estimate.client}</p>
                    </div>
                    
                    <div className="text-right">
                      <div className="text-lg font-bold">
                        ${estimate.totalAmount.toLocaleString()}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Valid until {new Date(estimate.validUntil).toLocaleDateString()}
                      </div>
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <div className="text-sm text-muted-foreground">Created</div>
                      <div className="font-medium">
                        {new Date(estimate.createdDate).toLocaleDateString()}
                      </div>
                    </div>
                    
                    <div>
                      <div className="text-sm text-muted-foreground">Status</div>
                      <div className="font-medium capitalize">{estimate.status}</div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t">
                    <div className="flex items-center gap-2">
                      {estimate.status === 'approved' && (
                        <>
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          <span className="text-sm text-green-600">Approved - Ready to Schedule</span>
                        </>
                      )}
                      {estimate.status === 'sent' && (
                        <>
                          <Send className="h-4 w-4 text-blue-500" />
                          <span className="text-sm text-blue-600">Sent - Awaiting Response</span>
                        </>
                      )}
                      {estimate.status === 'draft' && (
                        <>
                          <Edit className="h-4 w-4 text-yellow-500" />
                          <span className="text-sm text-yellow-600">Draft - Needs Review</span>
                        </>
                      )}
                    </div>
                    
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" className="gap-1">
                        <Download className="h-3 w-3" />
                        PDF
                      </Button>
                      <Button variant="outline" size="sm" className="gap-1">
                        <Edit className="h-3 w-3" />
                        Edit
                      </Button>
                      {estimate.status === 'draft' && (
                        <Button size="sm" className="gap-1">
                          <Send className="h-3 w-3" />
                          Send
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common estimation tasks</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <Button variant="outline" className="h-20 flex-col gap-2">
                <Calculator className="h-6 w-6" />
                <span>Material Calculator</span>
              </Button>
              
              <Button variant="outline" className="h-20 flex-col gap-2">
                <FileText className="h-6 w-6" />
                <span>Template Library</span>
              </Button>
              
              <Button variant="outline" className="h-20 flex-col gap-2">
                <DollarSign className="h-6 w-6" />
                <span>Pricing Guide</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}