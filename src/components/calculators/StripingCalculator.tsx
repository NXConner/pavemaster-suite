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
import { Calculator, Save, Download, Info, TrendingUp, Plus, Minus } from 'lucide-react';

interface StripingLine {
  id: string
  type: 'solid' | 'dashed' | 'double'
  width: number // inches
  length: number // feet
  color: 'white' | 'yellow'
}

export const StripingCalculator = () => {
  const [projectDetails, setProjectDetails] = useState({
    projectName: '',
    location: '',
    temperature: '70',
    humidity: '50',
  });

  const [lines, setLines] = useState<StripingLine[]>([
    { id: '1', type: 'solid', width: 4, length: 1000, color: 'white' },
  ]);

  const [materialCosts, setMaterialCosts] = useState({
    whitePaint: 65, // per gallon
    yellowPaint: 68, // per gallon
    glassBeads: 120, // per 50lb bag
    primer: 45, // per gallon
    laborRate: 95, // per hour
  });

  const [results, setResults] = useState({
    totalLength: 0,
    whitePaint: 0,
    yellowPaint: 0,
    glassBeads: 0,
    primer: 0,
    totalCost: 0,
    paintCoverage: 0,
  });

  // Paint coverage rates (linear feet per gallon by width)
  const getCoverageRate = (width: number, type: string) => {
    const baseRate = type === 'dashed' ? 1.8 : 1.0; // Dashed lines use less paint
    const widthFactor = 4 / width; // 4-inch standard
    return Math.round(320 * widthFactor * baseRate); // Base coverage for 4" solid line
  };

  const calculateResults = () => {
    let totalLength = 0;
    let whitePaintNeeded = 0;
    let yellowPaintNeeded = 0;
    let totalLinearFeet = 0;

    lines.forEach(line => {
      const lineLength = line.length;
      totalLength += lineLength;
      totalLinearFeet += lineLength;

      const coverage = getCoverageRate(line.width, line.type);
      const paintNeeded = lineLength / coverage;

      if (line.color === 'white') {
        whitePaintNeeded += paintNeeded;
      } else {
        yellowPaintNeeded += paintNeeded;
      }
    });

    // Glass beads: approximately 6 lbs per gallon of paint
    const totalPaint = whitePaintNeeded + yellowPaintNeeded;
    const glassBeadsNeeded = Math.ceil((totalPaint * 6) / 50); // 50lb bags

    // Primer for new asphalt (10% of paint needed)
    const primerNeeded = totalPaint * 0.1;

    // Cost calculation
    const paintCost = (whitePaintNeeded * materialCosts.whitePaint)
                     + (yellowPaintNeeded * materialCosts.yellowPaint);
    const beadsCost = glassBeadsNeeded * materialCosts.glassBeads;
    const primerCost = primerNeeded * materialCosts.primer;

    // Labor: approximately 100-150 linear feet per hour depending on complexity
    const laborHours = totalLinearFeet / 125;
    const laborCost = laborHours * materialCosts.laborRate;

    setResults({
      totalLength,
      whitePaint: whitePaintNeeded,
      yellowPaint: yellowPaintNeeded,
      glassBeads: glassBeadsNeeded,
      primer: primerNeeded,
      totalCost: paintCost + beadsCost + primerCost + laborCost,
      paintCoverage: totalLinearFeet / (totalPaint || 1),
    });
  };

  useEffect(() => {
    calculateResults();
  }, [lines, materialCosts]);

  const addLine = () => {
    const newId = (Math.max(...lines.map(l => parseInt(l.id))) + 1).toString();
    setLines([...lines, {
      id: newId,
      type: 'solid',
      width: 4,
      length: 100,
      color: 'white',
    }]);
  };

  const removeLine = (id: string) => {
    if (lines.length > 1) {
      setLines(lines.filter(line => line.id !== id));
    }
  };

  const updateLine = (id: string, field: keyof StripingLine, value: any) => {
    setLines(lines.map(line =>
      line.id === id ? { ...line, [field]: value } : line,
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
      projectDetails,
      lines,
      results,
      timestamp: new Date().toISOString(),
      type: 'striping',
    };

    const saved = JSON.parse(localStorage.getItem('striping-calculations') || '[]');
    saved.push(calculation);
    localStorage.setItem('striping-calculations', JSON.stringify(saved));

    alert('Calculation saved successfully!');
  };

  const exportResults = () => {
    const content = `
Striping Calculation Report
==========================
Date: ${new Date().toLocaleDateString()}
Project: ${projectDetails.projectName || 'Unnamed Project'}
Location: ${projectDetails.location || 'Not specified'}

Line Details:
${lines.map((line, index) => `
Line ${index + 1}: ${line.type} ${line.color} line
- Width: ${line.width}"
- Length: ${line.length.toLocaleString()} ft
- Type: ${line.type}
`).join('')}

Material Requirements:
- White Paint: ${results.whitePaint.toFixed(1)} gallons
- Yellow Paint: ${results.yellowPaint.toFixed(1)} gallons
- Glass Beads: ${results.glassBeads} bags (50 lb each)
- Primer: ${results.primer.toFixed(1)} gallons

Total Cost Estimate: $${results.totalCost.toFixed(2)}
Total Length: ${results.totalLength.toLocaleString()} linear feet
    `.trim();

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `striping-calculation-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Calculator className="h-8 w-8" />
            Striping Calculator
          </h1>
          <p className="text-muted-foreground">
            Calculate paint and material requirements for road striping projects
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
                Basic project details and environmental conditions
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="projectName">Project Name</Label>
                  <Input
                    id="projectName"
                    placeholder="Highway 101 Striping"
                    value={projectDetails.projectName}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => { setProjectDetails(prev => ({ ...prev, projectName: e.target.value })); }}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    placeholder="San Francisco, CA"
                    value={projectDetails.location}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => { setProjectDetails(prev => ({ ...prev, location: e.target.value })); }}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="temperature">Temperature (°F)</Label>
                  <Input
                    id="temperature"
                    type="number"
                    value={projectDetails.temperature}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => { setProjectDetails(prev => ({ ...prev, temperature: e.target.value })); }}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="humidity">Humidity (%)</Label>
                  <Input
                    id="humidity"
                    type="number"
                    value={projectDetails.humidity}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => { setProjectDetails(prev => ({ ...prev, humidity: e.target.value })); }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Striping Lines
                <Button onClick={addLine} size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Line
                </Button>
              </CardTitle>
              <CardDescription>
                Define each striping line for your project
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {lines.map((line, index) => (
                <div key={line.id} className="p-4 border rounded-lg space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">Line {index + 1}</h4>
                    {lines.length > 1 && (
                      <Button
                        onClick={() => { removeLine(line.id); }}
                        variant="outline"
                        size="sm"
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                    )}
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="space-y-2">
                      <Label>Type</Label>
                      <Select
                        value={line.type}
                        onValueChange={(value: 'solid' | 'dashed' | 'double') => { updateLine(line.id, 'type', value); }}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="solid">Solid</SelectItem>
                          <SelectItem value="dashed">Dashed</SelectItem>
                          <SelectItem value="double">Double</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Width (inches)</Label>
                      <Select
                        value={line.width.toString()}
                        onValueChange={(value) => { updateLine(line.id, 'width', parseInt(value)); }}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="4">4"</SelectItem>
                          <SelectItem value="6">6"</SelectItem>
                          <SelectItem value="8">8"</SelectItem>
                          <SelectItem value="12">12"</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Length (feet)</Label>
                      <Input
                        type="number"
                        value={line.length}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => { updateLine(line.id, 'length', parseInt(e.target.value) || 0); }}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Color</Label>
                      <Select
                        value={line.color}
                        onValueChange={(value: 'white' | 'yellow') => { updateLine(line.id, 'color', value); }}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="white">White</SelectItem>
                          <SelectItem value="yellow">Yellow</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="text-sm text-muted-foreground">
                    Estimated coverage: {getCoverageRate(line.width, line.type)} ft/gallon
                  </div>
                </div>
              ))}
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
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="whitePaint">White Paint ($/gallon)</Label>
                  <Input
                    id="whitePaint"
                    type="number"
                    step="0.01"
                    value={materialCosts.whitePaint}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => { handleCostChange('whitePaint', e.target.value); }}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="yellowPaint">Yellow Paint ($/gallon)</Label>
                  <Input
                    id="yellowPaint"
                    type="number"
                    step="0.01"
                    value={materialCosts.yellowPaint}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => { handleCostChange('yellowPaint', e.target.value); }}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="glassBeads">Glass Beads ($/50lb bag)</Label>
                  <Input
                    id="glassBeads"
                    type="number"
                    step="0.01"
                    value={materialCosts.glassBeads}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => { handleCostChange('glassBeads', e.target.value); }}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="primer">Primer ($/gallon)</Label>
                  <Input
                    id="primer"
                    type="number"
                    step="0.01"
                    value={materialCosts.primer}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => { handleCostChange('primer', e.target.value); }}
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
                  {results.totalLength.toLocaleString()} ft
                </div>
                <div className="text-sm text-muted-foreground">Total Length</div>
              </div>

              <Separator />

              <div className="space-y-3">
                {results.whitePaint > 0 && (
                  <div className="flex justify-between">
                    <span className="text-sm">White Paint:</span>
                    <Badge variant="outline">{results.whitePaint.toFixed(1)} gal</Badge>
                  </div>
                )}
                {results.yellowPaint > 0 && (
                  <div className="flex justify-between">
                    <span className="text-sm">Yellow Paint:</span>
                    <Badge variant="outline">{results.yellowPaint.toFixed(1)} gal</Badge>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-sm">Glass Beads:</span>
                  <Badge variant="outline">{results.glassBeads} bags</Badge>
                </div>
                {results.primer > 0 && (
                  <div className="flex justify-between">
                    <span className="text-sm">Primer:</span>
                    <Badge variant="outline">{results.primer.toFixed(1)} gal</Badge>
                  </div>
                )}
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
                <Info className="h-5 w-5" />
                Coverage Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between text-sm">
                <span>Avg Coverage:</span>
                <span>{results.paintCoverage.toFixed(0)} ft/gal</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Cost per ft:</span>
                <span>${(results.totalCost / results.totalLength || 0).toFixed(3)}</span>
              </div>
              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription className="text-xs">
                  Coverage rates include 10% waste factor. Actual coverage may vary
                  based on surface conditions and application method.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </div>
      </div>

      <Tabs defaultValue="specifications" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="specifications">Specifications</TabsTrigger>
          <TabsTrigger value="application">Application</TabsTrigger>
          <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
        </TabsList>

        <TabsContent value="specifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Paint Specifications</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium mb-3">White Paint Standards</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Federal Spec: TT-P-1952</li>
                    <li>• AASHTO M 249 Type I</li>
                    <li>• Reflectance: ≥85%</li>
                    <li>• Hiding power: ≥98%</li>
                    <li>• Drying time: 5-15 minutes</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium mb-3">Yellow Paint Standards</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Federal Spec: TT-P-1952</li>
                    <li>• AASHTO M 249 Type II</li>
                    <li>• Color coordinates per ASTM D6628</li>
                    <li>• UV resistance rating</li>
                    <li>• Drying time: 5-15 minutes</li>
                  </ul>
                </div>
              </div>

              <Separator />

              <div>
                <h4 className="font-medium mb-3">Glass Bead Requirements</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Size: AASHTO M 247 Type I</li>
                    <li>• Application rate: 6 lbs/gallon</li>
                    <li>• Roundness: ≥70%</li>
                  </ul>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Refractive index: 1.50-1.54</li>
                    <li>• Gradation: 150-850 microns</li>
                    <li>• Coating: Silane treated</li>
                  </ul>
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
                    <li>• Temperature: 50°F - 95°F</li>
                    <li>• Humidity: Less than 85%</li>
                    <li>• Wind speed: Less than 25 mph</li>
                    <li>• No precipitation during application</li>
                    <li>• Surface temperature: Above dew point + 5°F</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Surface Preparation</h4>
                  <ol className="text-sm text-muted-foreground space-y-1">
                    <li>1. Clean surface of debris and contaminants</li>
                    <li>2. Remove existing paint if required</li>
                    <li>3. Apply primer to new asphalt surfaces</li>
                    <li>4. Ensure surface is completely dry</li>
                    <li>5. Pre-mark line locations</li>
                  </ol>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Application Process</h4>
                  <ol className="text-sm text-muted-foreground space-y-1">
                    <li>1. Calibrate striping equipment</li>
                    <li>2. Apply paint at specified thickness</li>
                    <li>3. Apply glass beads immediately</li>
                    <li>4. Maintain consistent speed and pressure</li>
                    <li>5. Allow proper curing time</li>
                  </ol>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="maintenance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Maintenance & Inspection</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Inspection Schedule</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Initial: 30 days after installation</li>
                    <li>• Regular: Every 6 months</li>
                    <li>• High-traffic areas: Every 3 months</li>
                    <li>• After severe weather events</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Performance Criteria</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Retroreflectivity: ≥100 mcd/m²/lux (white)</li>
                    <li>• Retroreflectivity: ≥80 mcd/m²/lux (yellow)</li>
                    <li>• Color retention per ASTM standards</li>
                    <li>• Adhesion and durability testing</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Replacement Indicators</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Retroreflectivity below minimum levels</li>
                    <li>• Significant color fading or change</li>
                    <li>• Paint deterioration or peeling</li>
                                          <li>• Line width reduction &gt;25%</li>
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