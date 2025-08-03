import { useState } from 'react';
import { DashboardLayout } from '../components/layout/dashboard-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Badge } from '../components/ui/badge';
import { Calculator, Package, FileText, TrendingUp, AlertTriangle } from 'lucide-react';

interface Material {
  id: string;
  name: string;
  type: 'asphalt' | 'sealcoat' | 'stripe_paint' | 'crack_filler' | 'aggregate';
  unit: string;
  costPerUnit: number;
  coverage: number; // coverage per unit
  supplier: string;
  inStock: number;
  minStock: number;
  description: string;
}

interface CalculationResult {
  area: number;
  materialNeeded: number;
  materialCost: number;
  laborCost: number;
  equipmentCost: number;
  overhead: number;
  totalCost: number;
  profit: number;
  finalPrice: number;
}

export default function Materials() {
  const [selectedMaterial, setSelectedMaterial] = useState<string>('');
  const [area, setArea] = useState<string>('');
  const [thickness, setThickness] = useState<string>('2');
  const [calculationResult, setCalculationResult] = useState<CalculationResult | null>(null);

  const materials: Material[] = [
    {
      id: '1',
      name: 'Hot Mix Asphalt',
      type: 'asphalt',
      unit: 'ton',
      costPerUnit: 85.00,
      coverage: 80, // sq ft per ton at 2" thickness
      supplier: 'Richmond Asphalt Supply',
      inStock: 25,
      minStock: 10,
      description: 'Premium hot mix asphalt for parking lots and roadways',
    },
    {
      id: '2',
      name: 'SealMaster Premium Sealcoat',
      type: 'sealcoat',
      unit: 'gallon',
      costPerUnit: 12.50,
      coverage: 80, // sq ft per gallon
      supplier: 'SealMaster',
      inStock: 150,
      minStock: 50,
      description: 'Professional grade coal tar emulsion sealcoat',
    },
    {
      id: '3',
      name: 'Traffic Paint - Yellow',
      type: 'stripe_paint',
      unit: 'gallon',
      costPerUnit: 45.00,
      coverage: 1560, // linear feet of 4" stripe per gallon
      supplier: 'Sherwin Williams',
      inStock: 20,
      minStock: 8,
      description: 'High-visibility traffic marking paint',
    },
    {
      id: '4',
      name: 'Rubberized Crack Filler',
      type: 'crack_filler',
      unit: 'gallon',
      costPerUnit: 28.00,
      coverage: 150, // linear feet of crack per gallon
      supplier: 'Crafco',
      inStock: 35,
      minStock: 15,
      description: 'Hot-applied rubberized crack filler',
    },
    {
      id: '5',
      name: '57 Stone Aggregate',
      type: 'aggregate',
      unit: 'ton',
      costPerUnit: 35.00,
      coverage: 100, // sq ft at 2" depth
      supplier: 'Blue Ridge Quarry',
      inStock: 45,
      minStock: 20,
      description: 'Crushed stone aggregate for base preparation',
    },
  ];

  const calculateMaterialNeeds = () => {
    const selectedMat = materials.find(m => m.id === selectedMaterial);
    const areaNum = parseFloat(area);
    const thicknessNum = parseFloat(thickness);

    if (!selectedMat || !areaNum) { return; }

    let materialNeeded = 0;
    let laborRate = 0;
    let equipmentRate = 0;

    switch (selectedMat.type) {
      case 'asphalt':
        // Calculate tons needed based on thickness
        materialNeeded = (areaNum * (thicknessNum / 2)) / selectedMat.coverage;
        laborRate = 1.25; // per sq ft
        equipmentRate = 0.75; // per sq ft
        break;
      case 'sealcoat':
        materialNeeded = areaNum / selectedMat.coverage;
        laborRate = 0.35; // per sq ft
        equipmentRate = 0.15; // per sq ft
        break;
      case 'stripe_paint':
        // Assuming 4" stripes, calculate linear feet needed
        const linearFeet = areaNum * 0.1; // rough estimate for parking lot striping
        materialNeeded = linearFeet / selectedMat.coverage;
        laborRate = 0.25; // per linear foot
        equipmentRate = 0.10; // per linear foot
        break;
      default:
        materialNeeded = areaNum / selectedMat.coverage;
        laborRate = 0.50;
        equipmentRate = 0.25;
    }

    const materialCost = materialNeeded * selectedMat.costPerUnit;
    const laborCost = areaNum * laborRate;
    const equipmentCost = areaNum * equipmentRate;
    const overhead = (materialCost + laborCost + equipmentCost) * 0.15;
    const totalCost = materialCost + laborCost + equipmentCost + overhead;
    const profit = totalCost * 0.25; // 25% profit margin
    const finalPrice = totalCost + profit;

    setCalculationResult({
      area: areaNum,
      materialNeeded,
      materialCost,
      laborCost,
      equipmentCost,
      overhead,
      totalCost,
      profit,
      finalPrice,
    });
  };

  const getStockStatus = (material: Material) => {
    if (material.inStock <= material.minStock) {
      return { status: 'low', color: 'bg-red-100 text-red-800', label: 'Low Stock' };
    } else if (material.inStock <= material.minStock * 2) {
      return { status: 'medium', color: 'bg-yellow-100 text-yellow-800', label: 'Medium Stock' };
    }
    return { status: 'good', color: 'bg-green-100 text-green-800', label: 'In Stock' };
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Materials & Supplies</h1>
            <p className="text-muted-foreground">
              Manage inventory, calculate material needs, and track costs
            </p>
          </div>
          <Button className="gap-2">
            <Package className="h-4 w-4" />
            Add Material
          </Button>
        </div>

        <Tabs defaultValue="calculator" className="space-y-6">
          <TabsList>
            <TabsTrigger value="calculator">Material Calculator</TabsTrigger>
            <TabsTrigger value="inventory">Inventory</TabsTrigger>
            <TabsTrigger value="suppliers">Suppliers</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
          </TabsList>

          <TabsContent value="calculator" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              {/* Calculator Input */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calculator className="h-5 w-5" />
                    Material Calculator
                  </CardTitle>
                  <CardDescription>Calculate material needs and costs for your project</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="material">Material Type</Label>
                    <Select value={selectedMaterial} onValueChange={setSelectedMaterial}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select material" />
                      </SelectTrigger>
                      <SelectContent>
                        {materials.map((material) => (
                          <SelectItem key={material.id} value={material.id}>
                            {material.name} - ${material.costPerUnit}/{material.unit}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="area">Area (sq ft)</Label>
                    <Input
                      id="area"
                      type="number"
                      placeholder="Enter area in square feet"
                      value={area}
                      onChange={(e) => { setArea(e.target.value); }}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="thickness">Thickness (inches)</Label>
                    <Select value={thickness} onValueChange={setThickness}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">1 inch</SelectItem>
                        <SelectItem value="1.5">1.5 inches</SelectItem>
                        <SelectItem value="2">2 inches</SelectItem>
                        <SelectItem value="2.5">2.5 inches</SelectItem>
                        <SelectItem value="3">3 inches</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Button onClick={calculateMaterialNeeds} className="w-full">
                    Calculate Materials
                  </Button>
                </CardContent>
              </Card>

              {/* Calculator Results */}
              {calculationResult && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      Calculation Results
                    </CardTitle>
                    <CardDescription>Detailed cost breakdown for your project</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Project Area:</span>
                        <div className="font-semibold">{calculationResult.area.toLocaleString()} sq ft</div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Material Needed:</span>
                        <div className="font-semibold">{calculationResult.materialNeeded.toFixed(2)} units</div>
                      </div>
                    </div>

                    <div className="space-y-2 border-t pt-4">
                      <div className="flex justify-between">
                        <span>Material Cost:</span>
                        <span className="font-semibold">${calculationResult.materialCost.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Labor Cost:</span>
                        <span className="font-semibold">${calculationResult.laborCost.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Equipment Cost:</span>
                        <span className="font-semibold">${calculationResult.equipmentCost.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Overhead (15%):</span>
                        <span className="font-semibold">${calculationResult.overhead.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Profit (25%):</span>
                        <span className="font-semibold">${calculationResult.profit.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between border-t pt-2 text-lg font-bold">
                        <span>Total Price:</span>
                        <span className="text-primary">${calculationResult.finalPrice.toFixed(2)}</span>
                      </div>
                    </div>

                    <Button className="w-full" variant="outline">
                      Generate Quote
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          <TabsContent value="inventory" className="space-y-6">
            <div className="grid gap-4">
              {materials.map((material) => {
                const stockStatus = getStockStatus(material);
                return (
                  <Card key={material.id}>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <div className="flex items-center gap-3">
                            <h3 className="font-semibold">{material.name}</h3>
                            <Badge variant="outline" className={stockStatus.color}>
                              {stockStatus.label}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">{material.description}</p>
                          <div className="flex items-center gap-4 text-sm">
                            <span><strong>Supplier:</strong> {material.supplier}</span>
                            <span><strong>Cost:</strong> ${material.costPerUnit}/{material.unit}</span>
                            <span><strong>Coverage:</strong> {material.coverage} sq ft/{material.unit}</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold">{material.inStock}</div>
                          <div className="text-sm text-muted-foreground">{material.unit}s in stock</div>
                          {material.inStock <= material.minStock && (
                            <div className="flex items-center gap-1 text-red-600 text-xs mt-1">
                              <AlertTriangle className="h-3 w-3" />
                              Reorder needed
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          <TabsContent value="suppliers" className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {['Richmond Asphalt Supply', 'SealMaster', 'Sherwin Williams', 'Crafco', 'Blue Ridge Quarry'].map((supplier) => (
                <Card key={supplier}>
                  <CardHeader>
                    <CardTitle className="text-lg">{supplier}</CardTitle>
                    <CardDescription>Primary material supplier</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      <div><strong>Contact:</strong> (804) 555-0123</div>
                      <div><strong>Terms:</strong> Net 30</div>
                      <div><strong>Delivery:</strong> 2-3 business days</div>
                      <div className="flex items-center gap-1">
                        <strong>Rating:</strong>
                        <div className="flex">★★★★☆</div>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" className="w-full mt-4">
                      Contact Supplier
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="reports" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Inventory Value
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">$18,425</div>
                  <p className="text-sm text-muted-foreground">Total inventory value</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5" />
                    Low Stock Items
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-red-600">2</div>
                  <p className="text-sm text-muted-foreground">Items need reordering</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Package className="h-5 w-5" />
                    Monthly Usage
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">$5,280</div>
                  <p className="text-sm text-muted-foreground">Materials consumed</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}