import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Separator } from '../ui/separator';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Alert, AlertDescription } from '../ui/alert';
import { Calculator, Save, Download, Info, TrendingUp, Truck, Package } from 'lucide-react';

interface ProjectZone {
  id: string
  name: string
  length: number
  width: number
  thickness: number
  surfaceType: 'new' | 'overlay' | 'patch'
  mixType: 'standard' | 'premium' | 'recycled'
}

export const MaterialEstimator = () => {
  const [projectInfo, setProjectInfo] = useState({
    projectName: '',
    location: '',
    startDate: '',
    contractor: '',
  });

  const [zones, setZones] = useState<ProjectZone[]>([
    {
      id: '1',
      name: 'Main Area',
      length: 1000,
      width: 24,
      thickness: 3,
      surfaceType: 'new',
      mixType: 'standard',
    },
  ]);

  const [materialCosts, setMaterialCosts] = useState({
    standardMix: 85, // per ton
    premiumMix: 95, // per ton
    recycledMix: 75, // per ton
    aggregate: 35, // per ton
    bindingAgent: 450, // per ton
    fuelSurcharge: 15, // per ton
    deliveryRate: 125, // per hour
    laborRate: 95, // per hour
  });

  const [results, setResults] = useState({
    totalArea: 0,
    totalVolume: 0,
    asphaltTons: 0,
    aggregateTons: 0,
    bindingAgent: 0,
    totalCost: 0,
    deliveryTrips: 0,
    laborHours: 0,
  });

  // Asphalt density: approximately 145 lbs per cubic foot = 0.0725 tons per cubic foot
  const ASPHALT_DENSITY = 0.0725;

  // Mix ratios
  const mixCompositions = {
    standard: { asphalt: 0.94, aggregate: 0.06, binding: 0.05 },
    premium: { asphalt: 0.92, aggregate: 0.08, binding: 0.06 },
    recycled: { asphalt: 0.70, aggregate: 0.25, binding: 0.04, recycled: 0.30 },
  };

  const calculateResults = () => {
    let totalArea = 0;
    let totalVolume = 0;
    let totalAsphaltTons = 0;
    let totalAggregateTons = 0;
    let totalBindingAgent = 0;

    zones.forEach(zone => {
      const area = zone.length * zone.width;
      const volume = area * (zone.thickness / 12); // Convert inches to feet
      const tons = volume * ASPHALT_DENSITY;

      totalArea += area;
      totalVolume += volume;

      const composition = mixCompositions[zone.mixType as keyof typeof mixCompositions];

      totalAsphaltTons += tons * composition.asphalt;
      totalAggregateTons += tons * composition.aggregate;
      totalBindingAgent += tons * composition.binding;
    });

    // Calculate costs
    let materialCost = 0;
    zones.forEach(zone => {
      const area = zone.length * zone.width;
      const volume = area * (zone.thickness / 12);
      const tons = volume * ASPHALT_DENSITY;

      let mixPrice = materialCosts.standardMix;
      if (zone.mixType === 'premium') { mixPrice = materialCosts.premiumMix; }
      if (zone.mixType === 'recycled') { mixPrice = materialCosts.recycledMix; }

      materialCost += tons * mixPrice;
    });

    const aggregateCost = totalAggregateTons * materialCosts.aggregate;
    const bindingCost = totalBindingAgent * materialCosts.bindingAgent;
    const fuelCost = totalAsphaltTons * materialCosts.fuelSurcharge;

    // Delivery calculations (assume 25 tons per truck)
    const deliveryTrips = Math.ceil(totalAsphaltTons / 25);
    const deliveryCost = deliveryTrips * materialCosts.deliveryRate;

    // Labor calculations (estimate 2 tons per hour per crew)
    const laborHours = totalAsphaltTons / 2;
    const laborCost = laborHours * materialCosts.laborRate;

    const totalCost = materialCost + aggregateCost + bindingCost + fuelCost + deliveryCost + laborCost;

    setResults({
      totalArea,
      totalVolume,
      asphaltTons: totalAsphaltTons,
      aggregateTons: totalAggregateTons,
      bindingAgent: totalBindingAgent,
      totalCost,
      deliveryTrips,
      laborHours,
    });
  };

  useEffect(() => {
    calculateResults();
  }, [zones, materialCosts]);

  const addZone = () => {
    const newId = (Math.max(...zones.map(z => parseInt(z.id))) + 1).toString();
    setZones([...zones, {
      id: newId,
      name: `Zone ${newId}`,
      length: 500,
      width: 24,
      thickness: 3,
      surfaceType: 'new',
      mixType: 'standard',
    }]);
  };

  const removeZone = (id: string) => {
    if (zones.length > 1) {
      setZones(zones.filter(zone => zone.id !== id));
    }
  };

  const updateZone = (id: string, field: keyof ProjectZone, value: any) => {
    setZones(zones.map(zone =>
      zone.id === id ? { ...zone, [field]: value } : zone,
    ));
  };

  const handleCostChange = (field: string, value: string) => {
    setMaterialCosts(prev => ({
      ...prev,
      [field]: parseFloat(value) || 0,
    }));
  };

  const saveCalculation = () => {
    const calculation = {
      projectInfo,
      zones,
      results,
      timestamp: new Date().toISOString(),
      type: 'material-estimate',
    };

    const saved = JSON.parse(localStorage.getItem('material-calculations') || '[]');
    saved.push(calculation);
    localStorage.setItem('material-calculations', JSON.stringify(saved));

    alert('Calculation saved successfully!');
  };

  const exportResults = () => {
    const content = `
Material Estimation Report
=========================
Date: ${new Date().toLocaleDateString()}
Project: ${projectInfo.projectName || 'Unnamed Project'}
Location: ${projectInfo.location || 'Not specified'}
Contractor: ${projectInfo.contractor || 'Not specified'}

Project Zones:
${zones.map((zone, index) => `
Zone ${index + 1}: ${zone.name}
- Dimensions: ${zone.length}' × ${zone.width}' × ${zone.thickness}"
- Area: ${(zone.length * zone.width).toLocaleString()} sq ft
- Surface Type: ${zone.surfaceType}
- Mix Type: ${zone.mixType}
`).join('')}

Material Requirements:
- Total Area: ${results.totalArea.toLocaleString()} sq ft
- Total Volume: ${results.totalVolume.toFixed(0)} cubic feet
- Asphalt Mix: ${results.asphaltTons.toFixed(1)} tons
- Aggregate: ${results.aggregateTons.toFixed(1)} tons
- Binding Agent: ${results.bindingAgent.toFixed(1)} tons

Logistics:
- Delivery Trips: ${results.deliveryTrips} trucks
- Labor Hours: ${results.laborHours.toFixed(1)} hours

Total Cost Estimate: $${results.totalCost.toFixed(2)}
Cost per sq ft: $${(results.totalCost / results.totalArea).toFixed(2)}
    `.trim();

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `material-estimate-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Calculator className="h-8 w-8" />
            Material Estimator
          </h1>
          <p className="text-muted-foreground">
            Calculate material requirements and costs for asphalt paving projects
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={saveCalculation} variant="outline" size="sm">
            <Save className="h-4 w-4 mr-2" />
            Save
          </Button>
          <Button onClick={exportResults} variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Input Panel */}
        <div className="lg:col-span-3 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Project Information</CardTitle>
              <CardDescription>
                Basic project details and contractor information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="projectName">Project Name</Label>
                  <Input
                    id="projectName"
                    placeholder="Highway 101 Paving"
                    value={projectInfo.projectName}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => { setProjectInfo(prev => ({ ...prev, projectName: e.target.value })); }}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    placeholder="San Francisco, CA"
                    value={projectInfo.location}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => { setProjectInfo(prev => ({ ...prev, location: e.target.value })); }}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="startDate">Start Date</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={projectInfo.startDate}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => { setProjectInfo(prev => ({ ...prev, startDate: e.target.value })); }}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contractor">Contractor</Label>
                  <Input
                    id="contractor"
                    placeholder="ABC Paving Company"
                    value={projectInfo.contractor}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => { setProjectInfo(prev => ({ ...prev, contractor: e.target.value })); }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Project Zones
                <Button onClick={addZone} size="sm">
                  <Package className="h-4 w-4 mr-2" />
                  Add Zone
                </Button>
              </CardTitle>
              <CardDescription>
                Define different areas or sections of your paving project
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {zones.map((zone, index) => (
                <div key={zone.id} className="p-4 border rounded-lg space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-2 flex-1 mr-4">
                      <Label>Zone Name</Label>
                      <Input
                        value={zone.name}
                        onChange={(e) => { updateZone(zone.id, 'name', e.target.value); }}
                        placeholder={`Zone ${index + 1}`}
                      />
                    </div>
                    {zones.length > 1 && (
                      <Button
                        onClick={() => { removeZone(zone.id); }}
                        variant="outline"
                        size="sm"
                      >
                        Remove
                      </Button>
                    )}
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label>Length (feet)</Label>
                      <Input
                        type="number"
                        value={zone.length}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => { updateZone(zone.id, 'length', parseInt(e.target.value) || 0); }}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Width (feet)</Label>
                      <Input
                        type="number"
                        value={zone.width}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => { updateZone(zone.id, 'width', parseInt(e.target.value) || 0); }}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Thickness (inches)</Label>
                      <Select
                        value={zone.thickness.toString()}
                        onValueChange={(value: string) => { updateZone(zone.id, 'thickness', parseInt(value)); }}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="2">2"</SelectItem>
                          <SelectItem value="3">3"</SelectItem>
                          <SelectItem value="4">4"</SelectItem>
                          <SelectItem value="6">6"</SelectItem>
                          <SelectItem value="8">8"</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Surface Type</Label>
                      <Select
                        value={zone.surfaceType}
                        onValueChange={(value) => { updateZone(zone.id, 'surfaceType', value as 'new' | 'overlay' | 'patch'); }}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="new">New Construction</SelectItem>
                          <SelectItem value="overlay">Overlay</SelectItem>
                          <SelectItem value="patch">Patch Repair</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Mix Type</Label>
                      <Select
                        value={zone.mixType}
                        onValueChange={(value) => { updateZone(zone.id, 'mixType', value as 'standard' | 'premium' | 'recycled'); }}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="standard">Standard Mix</SelectItem>
                          <SelectItem value="premium">Premium Mix</SelectItem>
                          <SelectItem value="recycled">Recycled Mix</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="p-3 bg-card rounded text-sm">
                    <strong>Zone Summary:</strong> {(zone.length * zone.width).toLocaleString()} sq ft,
                    {((zone.length * zone.width * zone.thickness / 12) * ASPHALT_DENSITY).toFixed(1)} tons estimated
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Material Pricing</CardTitle>
              <CardDescription>
                Adjust material costs based on your local pricing and market conditions
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="standardMix">Standard Mix ($/ton)</Label>
                  <Input
                    id="standardMix"
                    type="number"
                    step="0.01"
                    value={materialCosts.standardMix}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => { handleCostChange('standardMix', e.target.value); }}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="premiumMix">Premium Mix ($/ton)</Label>
                  <Input
                    id="premiumMix"
                    type="number"
                    step="0.01"
                    value={materialCosts.premiumMix}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => { handleCostChange('premiumMix', e.target.value); }}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="recycledMix">Recycled Mix ($/ton)</Label>
                  <Input
                    id="recycledMix"
                    type="number"
                    step="0.01"
                    value={materialCosts.recycledMix}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => { handleCostChange('recycledMix', e.target.value); }}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="aggregate">Aggregate ($/ton)</Label>
                  <Input
                    id="aggregate"
                    type="number"
                    step="0.01"
                    value={materialCosts.aggregate}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => { handleCostChange('aggregate', e.target.value); }}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bindingAgent">Binding Agent ($/ton)</Label>
                  <Input
                    id="bindingAgent"
                    type="number"
                    step="0.01"
                    value={materialCosts.bindingAgent}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => { handleCostChange('bindingAgent', e.target.value); }}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fuelSurcharge">Fuel Surcharge ($/ton)</Label>
                  <Input
                    id="fuelSurcharge"
                    type="number"
                    step="0.01"
                    value={materialCosts.fuelSurcharge}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => { handleCostChange('fuelSurcharge', e.target.value); }}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="deliveryRate">Delivery Rate ($/hour)</Label>
                  <Input
                    id="deliveryRate"
                    type="number"
                    step="0.01"
                    value={materialCosts.deliveryRate}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => { handleCostChange('deliveryRate', e.target.value); }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Results Panel */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Project Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">
                  {results.totalArea.toLocaleString()} sq ft
                </div>
                <div className="text-sm text-muted-foreground">Total Area</div>
              </div>

              <Separator />

              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm">Asphalt Mix:</span>
                  <Badge variant="outline">{results.asphaltTons.toFixed(1)} tons</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Aggregate:</span>
                  <Badge variant="outline">{results.aggregateTons.toFixed(1)} tons</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Binding Agent:</span>
                  <Badge variant="outline">{results.bindingAgent.toFixed(1)} tons</Badge>
                </div>
              </div>

              <Separator />

              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  ${results.totalCost.toFixed(2)}
                </div>
                <div className="text-sm text-muted-foreground">Total Estimated Cost</div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Truck className="h-5 w-5" />
                Logistics
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between text-sm">
                <span>Delivery Trips:</span>
                <span>{results.deliveryTrips} trucks</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Labor Hours:</span>
                <span>{results.laborHours.toFixed(1)} hours</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Cost per sq ft:</span>
                <span>${(results.totalCost / results.totalArea || 0).toFixed(2)}</span>
              </div>
              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription className="text-xs">
                  Estimates include 5% waste factor. Actual requirements may vary
                  based on site conditions and compaction rates.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </div>
      </div>

      <Tabs defaultValue="materials" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="materials">Material Types</TabsTrigger>
          <TabsTrigger value="specifications">Specifications</TabsTrigger>
          <TabsTrigger value="logistics">Logistics</TabsTrigger>
        </TabsList>

        <TabsContent value="materials" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Asphalt Mix Types</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium mb-2">Standard Mix</h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    Basic hot mix asphalt suitable for most applications.
                    Good durability and cost-effective.
                  </p>
                  <ul className="text-xs text-muted-foreground space-y-1">
                    <li>• 94% asphalt content</li>
                    <li>• 6% aggregate filler</li>
                    <li>• Standard performance grade</li>
                  </ul>
                </div>
                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium mb-2">Premium Mix</h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    Enhanced mix with superior performance characteristics.
                    Ideal for high-traffic areas.
                  </p>
                  <ul className="text-xs text-muted-foreground space-y-1">
                    <li>• 92% asphalt content</li>
                    <li>• 8% premium aggregate</li>
                    <li>• Enhanced binder grade</li>
                  </ul>
                </div>
                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium mb-2">Recycled Mix</h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    Environmentally friendly option incorporating recycled materials.
                    Sustainable and cost-effective.
                  </p>
                  <ul className="text-xs text-muted-foreground space-y-1">
                    <li>• 70% new asphalt</li>
                    <li>• 30% recycled content</li>
                    <li>• 25% reclaimed aggregate</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="specifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Technical Specifications</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium mb-3">Thickness Guidelines</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Residential streets: 2-3 inches</li>
                    <li>• Commercial areas: 3-4 inches</li>
                    <li>• Heavy traffic: 4-6 inches</li>
                    <li>• Industrial/highways: 6-8 inches</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium mb-3">Density Requirements</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Compacted density: 145 lbs/ft³</li>
                    <li>• Air void content: 3-5%</li>
                    <li>• VMA (Voids in Mineral Aggregate): 14-16%</li>
                    <li>• Compaction temperature: 250-300°F</li>
                  </ul>
                </div>
              </div>

              <Separator />

              <div>
                <h4 className="font-medium mb-3">Quality Standards</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• AASHTO M 323 specifications</li>
                    <li>• Superpave performance grading</li>
                    <li>• Marshall stability testing</li>
                  </ul>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• ASTM D6926 compaction standards</li>
                    <li>• Temperature monitoring requirements</li>
                    <li>• Quality control testing protocols</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="logistics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Delivery & Scheduling</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Delivery Planning</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Standard truck capacity: 25 tons</li>
                    <li>• Delivery window: 7 AM - 4 PM</li>
                    <li>• Hot mix temperature: 300°F minimum</li>
                    <li>• Maximum haul time: 2 hours</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Equipment Requirements</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Paver capacity: 500-1000 tons/day</li>
                    <li>• Roller compaction: Steel wheel + pneumatic</li>
                    <li>• Material transfer vehicles for large projects</li>
                    <li>• Temperature monitoring equipment</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Weather Considerations</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Minimum air temperature: 50°F</li>
                    <li>• No precipitation during placement</li>
                    <li>• Wind speed less than 25 mph</li>
                    <li>• Surface temperature above 40°F</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};