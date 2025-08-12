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
import { Calculator, Save, Download, Info, TrendingUp, AlertTriangle } from 'lucide-react';

export const SealcoatCalculator = () => {
  const [measurements, setMeasurements] = useState({
    length: '',
    width: '',
    thickness: '0.25', // inches
    coats: '2',
    surfaceType: 'asphalt',
    condition: 'good',
  });

  const [results, setResults] = useState({
    area: 0,
    gallonsNeeded: 0,
    costEstimate: 0,
    coverage: 0,
    materials: {
      sealcoat: 0,
      sand: 0,
      primer: 0,
    },
  });

  const [materialCosts, setMaterialCosts] = useState({
    sealcoatPrice: 35, // per gallon
    sandPrice: 25, // per 50lb bag
    primerPrice: 45, // per gallon
    laborRate: 85, // per hour
  });

  // Sealcoat coverage rates (sq ft per gallon)
  const coverageRates = {
    asphalt: {
      excellent: 80,
      good: 70,
      fair: 60,
      poor: 50,
    },
    concrete: {
      excellent: 85,
      good: 75,
      fair: 65,
      poor: 55,
    },
  };

  const calculateResults = () => {
    const length = parseFloat(measurements.length) || 0;
    const width = parseFloat(measurements.width) || 0;
    const area = length * width;

    const coverage = coverageRates[measurements.surfaceType as keyof typeof coverageRates]?.[measurements.condition as keyof typeof coverageRates.asphalt] || 70;
    const coats = parseInt(measurements.coats) || 1;

    const gallonsNeeded = (area * coats) / coverage;
    const sandBags = Math.ceil(gallonsNeeded * 0.5); // Approximately 0.5 bags per gallon
    const primerGallons = measurements.condition === 'poor' ? gallonsNeeded * 0.25 : 0;

    const materialCost = (gallonsNeeded * materialCosts.sealcoatPrice)
                        + (sandBags * materialCosts.sandPrice)
                        + (primerGallons * materialCosts.primerPrice);

    const laborHours = area / 500; // Approximate 500 sq ft per hour
    const laborCost = laborHours * materialCosts.laborRate;

    setResults({
      area,
      gallonsNeeded,
      costEstimate: materialCost + laborCost,
      coverage,
      materials: {
        sealcoat: gallonsNeeded,
        sand: sandBags,
        primer: primerGallons,
      },
    });
  };

  useEffect(() => {
    calculateResults();
  }, [measurements, materialCosts]);

  const handleInputChange = (field: string, value: string) => {
    setMeasurements(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleCostChange = (field: string, value: string) => {
    setMaterialCosts(prev => ({
      ...prev,
      [field]: parseFloat(value) || 0,
    }));
  };

  const saveCalculation = () => {
    const calculation = {
      measurements,
      results,
      timestamp: new Date().toISOString(),
      type: 'sealcoat',
    };

    const saved = JSON.parse(localStorage.getItem('sealcoat-calculations') || '[]');
    saved.push(calculation);
    localStorage.setItem('sealcoat-calculations', JSON.stringify(saved));

    alert('Calculation saved successfully!');
  };

  const exportResults = () => {
    const content = `
Sealcoat Calculation Report
==========================
Date: ${new Date().toLocaleDateString()}

Project Details:
- Area: ${measurements.length}' × ${measurements.width}' = ${results.area.toFixed(0)} sq ft
- Surface Type: ${measurements.surfaceType}
- Condition: ${measurements.condition}
- Number of Coats: ${measurements.coats}

Material Requirements:
- Sealcoat: ${results.materials.sealcoat.toFixed(1)} gallons
- Sand: ${results.materials.sand} bags (50 lb each)
- Primer: ${results.materials.primer.toFixed(1)} gallons

Cost Estimate: $${results.costEstimate.toFixed(2)}
Coverage Rate: ${results.coverage} sq ft/gallon
    `.trim();

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sealcoat-calculation-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Calculator className="h-8 w-8" />
            Sealcoat Calculator
          </h1>
          <p className="text-muted-foreground">
            Calculate material requirements and costs for sealcoating projects
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Input Panel */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Project Measurements</CardTitle>
              <CardDescription>
                Enter the dimensions and specifications for your sealcoating project
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="length">Length (feet)</Label>
                  <Input
                    id="length"
                    type="number"
                    placeholder="100"
                    value={measurements.length}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => { handleInputChange('length', e.target.value); }}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="width">Width (feet)</Label>
                  <Input
                    id="width"
                    type="number"
                    placeholder="50"
                    value={measurements.width}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => { handleInputChange('width', e.target.value); }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="surfaceType">Surface Type</Label>
                  <Select value={measurements.surfaceType} onValueChange={(value) => { handleInputChange('surfaceType', value); }}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="asphalt">Asphalt</SelectItem>
                      <SelectItem value="concrete">Concrete</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="condition">Surface Condition</Label>
                  <Select value={measurements.condition} onValueChange={(value) => { handleInputChange('condition', value); }}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="excellent">Excellent</SelectItem>
                      <SelectItem value="good">Good</SelectItem>
                      <SelectItem value="fair">Fair</SelectItem>
                      <SelectItem value="poor">Poor</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="coats">Number of Coats</Label>
                <Select value={measurements.coats} onValueChange={(value) => { handleInputChange('coats', value); }}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 Coat</SelectItem>
                    <SelectItem value="2">2 Coats (Recommended)</SelectItem>
                    <SelectItem value="3">3 Coats</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Material Pricing</CardTitle>
              <CardDescription>
                Adjust material costs based on your local pricing
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="sealcoatPrice">Sealcoat ($/gallon)</Label>
                  <Input
                    id="sealcoatPrice"
                    type="number"
                    step="0.01"
                    value={materialCosts.sealcoatPrice}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => { handleCostChange('sealcoatPrice', e.target.value); }}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sandPrice">Sand ($/50lb bag)</Label>
                  <Input
                    id="sandPrice"
                    type="number"
                    step="0.01"
                    value={materialCosts.sandPrice}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => { handleCostChange('sandPrice', e.target.value); }}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="primerPrice">Primer ($/gallon)</Label>
                  <Input
                    id="primerPrice"
                    type="number"
                    step="0.01"
                    value={materialCosts.primerPrice}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => { handleCostChange('primerPrice', e.target.value); }}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="laborRate">Labor Rate ($/hour)</Label>
                  <Input
                    id="laborRate"
                    type="number"
                    step="0.01"
                    value={materialCosts.laborRate}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => { handleCostChange('laborRate', e.target.value); }}
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
                  {results.area.toFixed(0)} sq ft
                </div>
                <div className="text-sm text-muted-foreground">Total Area</div>
              </div>

              <Separator />

              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm">Sealcoat Needed:</span>
                  <Badge variant="outline">{results.materials.sealcoat.toFixed(1)} gal</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Sand Required:</span>
                  <Badge variant="outline">{results.materials.sand} bags</Badge>
                </div>
                {results.materials.primer > 0 && (
                  <div className="flex justify-between">
                    <span className="text-sm">Primer Needed:</span>
                    <Badge variant="outline">{results.materials.primer.toFixed(1)} gal</Badge>
                  </div>
                )}
              </div>

              <Separator />

              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  ${results.costEstimate.toFixed(2)}
                </div>
                <div className="text-sm text-muted-foreground">Total Estimated Cost</div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Info className="h-5 w-5" />
                Coverage Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between text-sm">
                <span>Coverage Rate:</span>
                <span>{results.coverage} sq ft/gal</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Cost per sq ft:</span>
                <span>${(results.costEstimate / results.area || 0).toFixed(3)}</span>
              </div>
              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription className="text-xs">
                  Coverage rates vary based on surface condition and porosity.
                  Poor surfaces may require primer application.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>

          {measurements.condition === 'poor' && (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Poor surface condition detected. Primer application recommended
                before sealcoat application.
              </AlertDescription>
            </Alert>
          )}
        </div>
      </div>

      <Tabs defaultValue="materials" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="materials">Materials</TabsTrigger>
          <TabsTrigger value="application">Application</TabsTrigger>
          <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
        </TabsList>

        <TabsContent value="materials" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Material Specifications</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium mb-2">Coal Tar Sealcoat</h4>
                  <p className="text-sm text-muted-foreground">
                    Provides excellent protection against oil, gas, and UV damage.
                    Ideal for high-traffic areas.
                  </p>
                </div>
                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium mb-2">Acrylic Sealcoat</h4>
                  <p className="text-sm text-muted-foreground">
                    Environmentally friendly option with good weather resistance.
                    Suitable for residential applications.
                  </p>
                </div>
                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium mb-2">Sand Additive</h4>
                  <p className="text-sm text-muted-foreground">
                    Improves traction and extends sealcoat life.
                    Typically 2-3 lbs per gallon of sealcoat.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="application" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Application Guidelines</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Weather Conditions</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Temperature: 50°F - 85°F</li>
                    <li>• Humidity: Less than 90%</li>
                    <li>• No rain for 24 hours before and after</li>
                    <li>• Wind speed: Less than 10 mph</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Application Steps</h4>
                  <ol className="text-sm text-muted-foreground space-y-1">
                    <li>1. Clean surface thoroughly</li>
                    <li>2. Apply primer if needed (poor surfaces)</li>
                    <li>3. Apply first coat of sealcoat</li>
                    <li>4. Allow 4-6 hours drying time</li>
                    <li>5. Apply second coat if specified</li>
                    <li>6. Cure for 24-48 hours before traffic</li>
                  </ol>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="maintenance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Maintenance Schedule</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Recommended Frequency</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• High traffic areas: Every 2-3 years</li>
                    <li>• Medium traffic areas: Every 3-4 years</li>
                    <li>• Low traffic areas: Every 4-5 years</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Inspection Points</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Wear patterns and fading</li>
                    <li>• Crack development</li>
                    <li>• Oil stain penetration</li>
                    <li>• Edge deterioration</li>
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