import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Ruler, Calculator, Square, Circle, Triangle, MapPin } from 'lucide-react';

export default function Measurements() {
  const [areaResults, setAreaResults] = useState<{ [key: string]: number }>({});
  const [materialResults, setMaterialResults] = useState<{ [key: string]: number }>({});

  const calculateRectangularArea = (length: number, width: number) => {
    const area = length * width;
    setAreaResults({ ...areaResults, rectangular: area });
    return area;
  };

  const calculateCircularArea = (radius: number) => {
    const area = Math.PI * radius * radius;
    setAreaResults({ ...areaResults, circular: area });
    return area;
  };

  const calculateTriangularArea = (base: number, height: number) => {
    const area = (base * height) / 2;
    setAreaResults({ ...areaResults, triangular: area });
    return area;
  };

  const calculateAsphaltMaterial = (area: number, thickness: number) => {
    // Asphalt calculation: area (sq ft) × thickness (inches) × 110 lbs/sq ft/inch / 2000 lbs/ton
    const tons = (area * thickness * 110) / 2000;
    setMaterialResults({ ...materialResults, asphalt: tons });
    return tons;
  };

  const calculateSealcoatMaterial = (area: number, coverage: number = 80) => {
    // Sealcoat calculation: area (sq ft) / coverage rate (sq ft/gallon)
    const gallons = area / coverage;
    setMaterialResults({ ...materialResults, sealcoat: gallons });
    return gallons;
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-3">
        <Ruler className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold text-foreground">Measurements & Calculations</h1>
          <p className="text-muted-foreground">Calculate areas, volumes, and material requirements</p>
        </div>
      </div>

      <Tabs defaultValue="area" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="area">Area Calculator</TabsTrigger>
          <TabsTrigger value="materials">Material Calculator</TabsTrigger>
          <TabsTrigger value="converter">Unit Converter</TabsTrigger>
        </TabsList>

        <TabsContent value="area" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Rectangular Area */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Square className="h-5 w-5" />
                  Rectangular Area
                </CardTitle>
                <CardDescription>Calculate area of rectangular spaces</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="rect-length">Length (ft)</Label>
                  <Input
                    id="rect-length"
                    type="number"
                    placeholder="Enter length"
                    onChange={(e) => {
                      const length = parseFloat(e.target.value) || 0;
                      const width = parseFloat((document.getElementById('rect-width') as HTMLInputElement)?.value) || 0;
                      if (length && width) calculateRectangularArea(length, width);
                    }}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="rect-width">Width (ft)</Label>
                  <Input
                    id="rect-width"
                    type="number"
                    placeholder="Enter width"
                    onChange={(e) => {
                      const width = parseFloat(e.target.value) || 0;
                      const length = parseFloat((document.getElementById('rect-length') as HTMLInputElement)?.value) || 0;
                      if (length && width) calculateRectangularArea(length, width);
                    }}
                  />
                </div>
                {areaResults.rectangular && (
                  <div className="p-3 bg-muted rounded-lg">
                    <p className="font-semibold">Area: {areaResults.rectangular.toFixed(2)} sq ft</p>
                    <p className="text-sm text-muted-foreground">
                      {(areaResults.rectangular / 43560).toFixed(4)} acres
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Circular Area */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Circle className="h-5 w-5" />
                  Circular Area
                </CardTitle>
                <CardDescription>Calculate area of circular spaces</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="circle-radius">Radius (ft)</Label>
                  <Input
                    id="circle-radius"
                    type="number"
                    placeholder="Enter radius"
                    onChange={(e) => {
                      const radius = parseFloat(e.target.value) || 0;
                      if (radius) calculateCircularArea(radius);
                    }}
                  />
                </div>
                {areaResults.circular && (
                  <div className="p-3 bg-muted rounded-lg">
                    <p className="font-semibold">Area: {areaResults.circular.toFixed(2)} sq ft</p>
                    <p className="text-sm text-muted-foreground">
                      {(areaResults.circular / 43560).toFixed(4)} acres
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Triangular Area */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Triangle className="h-5 w-5" />
                  Triangular Area
                </CardTitle>
                <CardDescription>Calculate area of triangular spaces</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="triangle-base">Base (ft)</Label>
                  <Input
                    id="triangle-base"
                    type="number"
                    placeholder="Enter base"
                    onChange={(e) => {
                      const base = parseFloat(e.target.value) || 0;
                      const height = parseFloat((document.getElementById('triangle-height') as HTMLInputElement)?.value) || 0;
                      if (base && height) calculateTriangularArea(base, height);
                    }}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="triangle-height">Height (ft)</Label>
                  <Input
                    id="triangle-height"
                    type="number"
                    placeholder="Enter height"
                    onChange={(e) => {
                      const height = parseFloat(e.target.value) || 0;
                      const base = parseFloat((document.getElementById('triangle-base') as HTMLInputElement)?.value) || 0;
                      if (base && height) calculateTriangularArea(base, height);
                    }}
                  />
                </div>
                {areaResults.triangular && (
                  <div className="p-3 bg-muted rounded-lg">
                    <p className="font-semibold">Area: {areaResults.triangular.toFixed(2)} sq ft</p>
                    <p className="text-sm text-muted-foreground">
                      {(areaResults.triangular / 43560).toFixed(4)} acres
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="materials" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Asphalt Calculator */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calculator className="h-5 w-5" />
                  Asphalt Calculator
                </CardTitle>
                <CardDescription>Calculate tons of asphalt needed</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="asphalt-area">Area (sq ft)</Label>
                  <Input
                    id="asphalt-area"
                    type="number"
                    placeholder="Enter area"
                    onChange={(e) => {
                      const area = parseFloat(e.target.value) || 0;
                      const thickness = parseFloat((document.getElementById('asphalt-thickness') as HTMLInputElement)?.value) || 0;
                      if (area && thickness) calculateAsphaltMaterial(area, thickness);
                    }}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="asphalt-thickness">Thickness (inches)</Label>
                  <Input
                    id="asphalt-thickness"
                    type="number"
                    placeholder="Enter thickness"
                    step="0.25"
                    onChange={(e) => {
                      const thickness = parseFloat(e.target.value) || 0;
                      const area = parseFloat((document.getElementById('asphalt-area') as HTMLInputElement)?.value) || 0;
                      if (area && thickness) calculateAsphaltMaterial(area, thickness);
                    }}
                  />
                </div>
                {materialResults.asphalt && (
                  <div className="p-3 bg-muted rounded-lg">
                    <p className="font-semibold">Asphalt Needed: {materialResults.asphalt.toFixed(2)} tons</p>
                    <p className="text-sm text-muted-foreground">
                      Add 5-10% for waste and compaction
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Sealcoat Calculator */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calculator className="h-5 w-5" />
                  Sealcoat Calculator
                </CardTitle>
                <CardDescription>Calculate gallons of sealcoat needed</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="sealcoat-area">Area (sq ft)</Label>
                  <Input
                    id="sealcoat-area"
                    type="number"
                    placeholder="Enter area"
                    onChange={(e) => {
                      const area = parseFloat(e.target.value) || 0;
                      const coverage = parseFloat((document.getElementById('sealcoat-coverage') as HTMLInputElement)?.value) || 80;
                      if (area) calculateSealcoatMaterial(area, coverage);
                    }}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sealcoat-coverage">Coverage (sq ft/gal)</Label>
                  <Input
                    id="sealcoat-coverage"
                    type="number"
                    placeholder="80"
                    defaultValue="80"
                    onChange={(e) => {
                      const coverage = parseFloat(e.target.value) || 80;
                      const area = parseFloat((document.getElementById('sealcoat-area') as HTMLInputElement)?.value) || 0;
                      if (area) calculateSealcoatMaterial(area, coverage);
                    }}
                  />
                </div>
                {materialResults.sealcoat && (
                  <div className="p-3 bg-muted rounded-lg">
                    <p className="font-semibold">Sealcoat Needed: {materialResults.sealcoat.toFixed(2)} gallons</p>
                    <p className="text-sm text-muted-foreground">
                      Includes 2 coats standard application
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="converter" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Length Conversion</CardTitle>
                <CardDescription>Convert between different length units</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Feet</Label>
                  <Input type="number" placeholder="Enter feet" />
                </div>
                <div className="space-y-2">
                  <Label>Meters</Label>
                  <Input type="number" placeholder="Enter meters" />
                </div>
                <div className="space-y-2">
                  <Label>Yards</Label>
                  <Input type="number" placeholder="Enter yards" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Area Conversion</CardTitle>
                <CardDescription>Convert between different area units</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Square Feet</Label>
                  <Input type="number" placeholder="Enter sq ft" />
                </div>
                <div className="space-y-2">
                  <Label>Square Meters</Label>
                  <Input type="number" placeholder="Enter sq m" />
                </div>
                <div className="space-y-2">
                  <Label>Acres</Label>
                  <Input type="number" placeholder="Enter acres" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Volume Conversion</CardTitle>
                <CardDescription>Convert between different volume units</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Cubic Feet</Label>
                  <Input type="number" placeholder="Enter cu ft" />
                </div>
                <div className="space-y-2">
                  <Label>Cubic Yards</Label>
                  <Input type="number" placeholder="Enter cu yd" />
                </div>
                <div className="space-y-2">
                  <Label>Gallons</Label>
                  <Input type="number" placeholder="Enter gallons" />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Quick Reference */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Reference</CardTitle>
          <CardDescription>Common measurements and conversion factors</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
            <div>
              <h4 className="font-semibold mb-2">Asphalt</h4>
              <p>• 110 lbs per sq ft per inch</p>
              <p>• 2000 lbs = 1 ton</p>
              <p>• Typical thickness: 2-4 inches</p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Sealcoat</h4>
              <p>• Coverage: 60-100 sq ft/gal</p>
              <p>• 2 coats recommended</p>
              <p>• Dry time: 4-8 hours</p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Conversions</h4>
              <p>• 1 acre = 43,560 sq ft</p>
              <p>• 1 sq yd = 9 sq ft</p>
              <p>• 1 cu yd = 27 cu ft</p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Parking</h4>
              <p>• Standard space: 9' × 18'</p>
              <p>• Compact space: 8' × 16'</p>
              <p>• Aisle width: 24' minimum</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}