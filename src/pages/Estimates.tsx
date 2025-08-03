import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Badge } from "../components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { AppSidebar } from "../components/layout/app-sidebar";
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
  Edit,
  Map,
  Camera,
  Ruler,
  Eye,
  Layers,
  Zap,
  Share,
  Settings
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
    <div className="flex h-screen">
      <AppSidebar />
      <div className="flex-1 p-6 overflow-auto">
        <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Visual Estimate Center</h1>
            <p className="text-muted-foreground">
              Advanced estimation with mapping integration and visual tools
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setShowCalculator(!showCalculator)} className="gap-2">
              <Calculator className="h-4 w-4" />
              Calculator
            </Button>
            <Button variant="outline" className="gap-2">
              <Map className="h-4 w-4" />
              Map View
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

        {/* Enhanced Estimation Tabs */}
        <Tabs defaultValue="estimates" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="estimates">Estimates</TabsTrigger>
            <TabsTrigger value="visual">Visual Tools</TabsTrigger>
            <TabsTrigger value="calculator">Advanced Calc</TabsTrigger>
            <TabsTrigger value="templates">Templates</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
          </TabsList>

          <TabsContent value="estimates" className="space-y-6">
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
                            <Map className="h-3 w-3" />
                            Map
                          </Button>
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
          </TabsContent>

          <TabsContent value="visual" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* Visual Estimation Canvas */}
              <div className="lg:col-span-3">
                <Card className="h-[500px]">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2">
                        <Camera className="h-5 w-5" />
                        Visual Estimation Canvas
                      </CardTitle>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          <Camera className="h-4 w-4 mr-2" />
                          Photo Import
                        </Button>
                        <Button variant="outline" size="sm">
                          <Map className="h-4 w-4 mr-2" />
                          Map Overlay
                        </Button>
                        <Button variant="outline" size="sm">
                          <Share className="h-4 w-4 mr-2" />
                          Share
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="relative h-[400px] bg-gradient-to-br from-slate-100 to-slate-200 rounded-lg overflow-hidden">
                      {/* Sample parking lot with measurements */}
                      <div className="absolute top-10 left-10 w-80 h-60 bg-gray-300 rounded border-2 border-blue-500">
                        <div className="p-4">
                          <div className="text-xs font-semibold mb-2 text-blue-600">Sample Estimate Area</div>
                          <div className="grid grid-cols-8 gap-1">
                            {Array.from({ length: 32 }).map((_, i) => (
                              <div
                                key={i}
                                className="h-4 w-6 border border-gray-500 bg-white"
                              />
                            ))}
                          </div>
                          {/* Measurement annotations */}
                          <div className="absolute -top-6 left-0 text-xs bg-blue-500 text-white px-2 py-1 rounded">
                            240 ft
                          </div>
                          <div className="absolute -left-12 top-1/2 -rotate-90 text-xs bg-blue-500 text-white px-2 py-1 rounded">
                            180 ft
                          </div>
                        </div>
                      </div>

                      {/* Estimation overlay */}
                      <div className="absolute top-10 right-10 bg-white/95 p-4 rounded-lg shadow-lg">
                        <div className="text-sm font-semibold mb-2">Live Calculations</div>
                        <div className="text-xs space-y-1">
                          <div className="flex justify-between">
                            <span>Area:</span>
                            <span className="font-medium">43,200 sq ft</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Perimeter:</span>
                            <span className="font-medium">840 ft</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Sealcoat:</span>
                            <span className="font-medium">$10,800</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Line Striping:</span>
                            <span className="font-medium">$2,400</span>
                          </div>
                          <hr className="my-2" />
                          <div className="flex justify-between font-semibold">
                            <span>Total:</span>
                            <span>$13,200</span>
                          </div>
                        </div>
                      </div>

                      {/* Drawing tools overlay */}
                      <div className="absolute bottom-4 left-4 flex gap-2">
                        <Button variant="outline" size="sm" className="bg-white/90">
                          <Ruler className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm" className="bg-white/90">
                          <Calculator className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm" className="bg-white/90">
                          <Layers className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm" className="bg-white/90">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Visual Tools Panel */}
              <div className="space-y-4">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">Drawing Tools</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {['Measure Distance', 'Calculate Area', 'Mark Repairs', 'Add Notes'].map((tool) => (
                      <Button key={tool} variant="outline" size="sm" className="w-full justify-start">
                        <Ruler className="h-4 w-4 mr-2" />
                        {tool}
                      </Button>
                    ))}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">Material Types</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {['Sealcoating', 'Crack Seal', 'Line Striping', 'Patching'].map((material) => (
                      <div key={material} className="flex items-center justify-between text-sm">
                        <span>{material}</span>
                        <Badge variant="outline">$0.25/sqft</Badge>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">AI Analysis</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Button size="sm" className="w-full">
                      <Zap className="h-4 w-4 mr-2" />
                      Auto-Detect Areas
                    </Button>
                    <div className="text-xs space-y-1">
                      <div>✓ Parking spaces identified</div>
                      <div>✓ Drive lanes mapped</div>
                      <div>⚠ 3 crack areas detected</div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="calculator" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Sealcoating Calculator</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Area (sq ft)</Label>
                    <Input placeholder="Enter area..." />
                  </div>
                  <div className="space-y-2">
                    <Label>Coats</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select coats" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">1 Coat</SelectItem>
                        <SelectItem value="2">2 Coats</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="pt-2 border-t">
                    <div className="flex justify-between font-semibold">
                      <span>Total:</span>
                      <span>$8,450</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Line Striping Calculator</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Linear Feet</Label>
                    <Input placeholder="Enter length..." />
                  </div>
                  <div className="space-y-2">
                    <Label>Line Width</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select width" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="4">4 inches</SelectItem>
                        <SelectItem value="6">6 inches</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="pt-2 border-t">
                    <div className="flex justify-between font-semibold">
                      <span>Total:</span>
                      <span>$2,150</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Crack Seal Calculator</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Crack Length (ft)</Label>
                    <Input placeholder="Enter length..." />
                  </div>
                  <div className="space-y-2">
                    <Label>Crack Width</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select width" />
                      </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="small">Small (&lt; 1/4&quot;)</SelectItem>
                          <SelectItem value="medium">Medium (1/4&quot; - 1/2&quot;)</SelectItem>
                          <SelectItem value="large">Large (&gt; 1/2&quot;)</SelectItem>
                        </SelectContent>
                    </Select>
                  </div>
                  <div className="pt-2 border-t">
                    <div className="flex justify-between font-semibold">
                      <span>Total:</span>
                      <span>$1,280</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="templates" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                'Church Parking Lot Package',
                'Commercial Sealcoating',
                'Residential Driveway',
                'Shopping Center Maintenance',
                'Municipal Contract',
                'Emergency Repair Service'
              ].map((template) => (
                <Card key={template} className="cursor-pointer hover:bg-muted/50">
                  <CardContent className="p-6 text-center">
                    <div className="flex items-center justify-center mb-4">
                      <FileText className="h-12 w-12 text-muted-foreground" />
                    </div>
                    <div className="font-medium mb-2">{template}</div>
                    <div className="text-sm text-muted-foreground mb-4">
                      Professional estimate template
                    </div>
                    <div className="flex gap-2 justify-center">
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button size="sm">
                        Use Template
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="reports" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Button variant="outline" className="h-24 flex-col">
                <FileText className="h-8 w-8 mb-2" />
                <span>Estimate Performance</span>
              </Button>
              <Button variant="outline" className="h-24 flex-col">
                <Calculator className="h-8 w-8 mb-2" />
                <span>Pricing Analysis</span>
              </Button>
              <Button variant="outline" className="h-24 flex-col">
                <DollarSign className="h-8 w-8 mb-2" />
                <span>Revenue Forecast</span>
              </Button>
            </div>
          </TabsContent>
        </Tabs>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common estimation tasks</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-4">
              <Button variant="outline" className="h-20 flex-col gap-2">
                <Map className="h-6 w-6" />
                <span>Map Integration</span>
              </Button>
              
              <Button variant="outline" className="h-20 flex-col gap-2">
                <Camera className="h-6 w-6" />
                <span>Photo Estimates</span>
              </Button>
              
              <Button variant="outline" className="h-20 flex-col gap-2">
                <Zap className="h-6 w-6" />
                <span>AI Analysis</span>
              </Button>
              
              <Button variant="outline" className="h-20 flex-col gap-2">
                <Settings className="h-6 w-6" />
                <span>Pricing Setup</span>
              </Button>
            </div>
          </CardContent>
        </Card>
        </div>
      </div>
    </div>
  );
}