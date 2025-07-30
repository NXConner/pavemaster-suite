import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Slider } from '@/components/ui/slider';
import {
  Calculator, Ruler, Zap, Gauge, Thermometer, Droplets, Wind,
  Building2, Hammer, Wrench, Cog, CircuitBoard, BarChart3,
  Download, Upload, Save, History, Share2, Copy, Settings,
  TrendingUp, AlertTriangle, Info, Star, BookOpen, Eye,
  Layers, Compass, Triangle, Square, Circle, Hexagon
} from 'lucide-react';

// Ultimate calculator suite interfaces
interface CalculationHistory {
  id: string;
  timestamp: Date;
  calculatorType: string;
  inputs: Record<string, any>;
  result: any;
  formula: string;
  notes?: string;
  starred: boolean;
}

interface UnitConversion {
  category: string;
  from: string;
  to: string;
  factor: number;
  offset?: number;
}

interface EngineeringFormula {
  id: string;
  name: string;
  category: string;
  formula: string;
  variables: Variable[];
  description: string;
  units: string;
  references: string[];
  complexity: 'basic' | 'intermediate' | 'advanced' | 'expert';
}

interface Variable {
  name: string;
  symbol: string;
  description: string;
  defaultUnit: string;
  type: 'number' | 'select' | 'boolean';
  options?: string[];
  min?: number;
  max?: number;
}

interface CalculatorMode {
  id: string;
  name: string;
  icon: React.ComponentType<any>;
  description: string;
  category: string;
  complexity: number;
}

interface SavedCalculation {
  id: string;
  name: string;
  description: string;
  calculatorType: string;
  inputs: Record<string, any>;
  result: any;
  tags: string[];
  createdDate: Date;
  lastUsed: Date;
  useCount: number;
}

const UltimateCalculatorSuite: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeCalculator, setActiveCalculator] = useState('basic');
  const [history, setHistory] = useState<CalculationHistory[]>([]);
  const [savedCalculations, setSavedCalculations] = useState<SavedCalculation[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Calculator modes
  const calculatorModes: CalculatorMode[] = [
    { id: 'basic', name: 'Basic Calculator', icon: Calculator, description: 'Standard arithmetic operations', category: 'general', complexity: 1 },
    { id: 'scientific', name: 'Scientific Calculator', icon: CircuitBoard, description: 'Advanced mathematical functions', category: 'general', complexity: 2 },
    { id: 'construction', name: 'Construction Calculator', icon: Building2, description: 'Building and construction calculations', category: 'construction', complexity: 3 },
    { id: 'structural', name: 'Structural Engineering', icon: Layers, description: 'Beam, column, and load calculations', category: 'engineering', complexity: 4 },
    { id: 'electrical', name: 'Electrical Engineering', icon: Zap, description: 'Power, current, and circuit calculations', category: 'engineering', complexity: 4 },
    { id: 'fluid', name: 'Fluid Mechanics', icon: Droplets, description: 'Flow, pressure, and hydraulic calculations', category: 'engineering', complexity: 4 },
    { id: 'thermal', name: 'Thermal Engineering', icon: Thermometer, description: 'Heat transfer and thermodynamic calculations', category: 'engineering', complexity: 4 },
    { id: 'geotechnical', name: 'Geotechnical Engineering', icon: Hammer, description: 'Soil mechanics and foundation calculations', category: 'engineering', complexity: 5 },
    { id: 'surveying', name: 'Surveying & Mapping', icon: Compass, description: 'Land surveying and coordinate calculations', category: 'surveying', complexity: 3 },
    { id: 'materials', name: 'Materials Engineering', icon: Cog, description: 'Material properties and testing calculations', category: 'engineering', complexity: 4 },
    { id: 'environmental', name: 'Environmental Engineering', icon: Wind, description: 'Environmental and sustainability calculations', category: 'engineering', complexity: 4 },
    { id: 'economics', name: 'Engineering Economics', icon: TrendingUp, description: 'Cost analysis and financial calculations', category: 'economics', complexity: 3 }
  ];

  // Unit conversion data
  const unitConversions: Record<string, UnitConversion[]> = {
    length: [
      { category: 'length', from: 'ft', to: 'm', factor: 0.3048 },
      { category: 'length', from: 'in', to: 'mm', factor: 25.4 },
      { category: 'length', from: 'yd', to: 'm', factor: 0.9144 },
      { category: 'length', from: 'mi', to: 'km', factor: 1.60934 }
    ],
    area: [
      { category: 'area', from: 'ft²', to: 'm²', factor: 0.092903 },
      { category: 'area', from: 'in²', to: 'cm²', factor: 6.4516 },
      { category: 'area', from: 'ac', to: 'm²', factor: 4046.86 }
    ],
    volume: [
      { category: 'volume', from: 'ft³', to: 'm³', factor: 0.0283168 },
      { category: 'volume', from: 'gal', to: 'L', factor: 3.78541 },
      { category: 'volume', from: 'yd³', to: 'm³', factor: 0.764555 }
    ],
    force: [
      { category: 'force', from: 'lbf', to: 'N', factor: 4.44822 },
      { category: 'force', from: 'kip', to: 'kN', factor: 4.44822 },
      { category: 'force', from: 'tonf', to: 'kN', factor: 8.89644 }
    ],
    pressure: [
      { category: 'pressure', from: 'psi', to: 'kPa', factor: 6.89476 },
      { category: 'pressure', from: 'psf', to: 'Pa', factor: 47.8803 },
      { category: 'pressure', from: 'atm', to: 'kPa', factor: 101.325 }
    ],
    temperature: [
      { category: 'temperature', from: '°F', to: '°C', factor: 5/9, offset: -32 },
      { category: 'temperature', from: '°C', to: 'K', factor: 1, offset: 273.15 }
    ]
  };

  // Engineering formulas database
  const engineeringFormulas: EngineeringFormula[] = [
    {
      id: 'beam-moment',
      name: 'Simple Beam Maximum Moment',
      category: 'structural',
      formula: 'M = (w * L²) / 8',
      variables: [
        { name: 'Load', symbol: 'w', description: 'Uniformly distributed load', defaultUnit: 'kN/m', type: 'number', min: 0 },
        { name: 'Length', symbol: 'L', description: 'Span length', defaultUnit: 'm', type: 'number', min: 0 }
      ],
      description: 'Maximum moment in a simply supported beam with uniform load',
      units: 'kN⋅m',
      references: ['AISC Steel Construction Manual', 'Structural Analysis by Hibbeler'],
      complexity: 'basic'
    },
    {
      id: 'ohms-law',
      name: 'Ohm\'s Law',
      category: 'electrical',
      formula: 'V = I * R',
      variables: [
        { name: 'Current', symbol: 'I', description: 'Electric current', defaultUnit: 'A', type: 'number', min: 0 },
        { name: 'Resistance', symbol: 'R', description: 'Electrical resistance', defaultUnit: 'Ω', type: 'number', min: 0 }
      ],
      description: 'Fundamental relationship between voltage, current, and resistance',
      units: 'V',
      references: ['Fundamentals of Electric Circuits'],
      complexity: 'basic'
    },
    {
      id: 'concrete-volume',
      name: 'Concrete Volume Calculation',
      category: 'construction',
      formula: 'V = L * W * H',
      variables: [
        { name: 'Length', symbol: 'L', description: 'Length of concrete element', defaultUnit: 'ft', type: 'number', min: 0 },
        { name: 'Width', symbol: 'W', description: 'Width of concrete element', defaultUnit: 'ft', type: 'number', min: 0 },
        { name: 'Height', symbol: 'H', description: 'Height/thickness of concrete element', defaultUnit: 'ft', type: 'number', min: 0 }
      ],
      description: 'Calculate volume of concrete needed for rectangular elements',
      units: 'ft³',
      references: ['ACI Manual of Concrete Practice'],
      complexity: 'basic'
    },
    {
      id: 'bearing-capacity',
      name: 'Terzaghi Bearing Capacity',
      category: 'geotechnical',
      formula: 'qu = c*Nc + γ*D*Nq + 0.5*γ*B*Nγ',
      variables: [
        { name: 'Cohesion', symbol: 'c', description: 'Soil cohesion', defaultUnit: 'kPa', type: 'number', min: 0 },
        { name: 'Unit Weight', symbol: 'γ', description: 'Soil unit weight', defaultUnit: 'kN/m³', type: 'number', min: 0 },
        { name: 'Depth', symbol: 'D', description: 'Foundation depth', defaultUnit: 'm', type: 'number', min: 0 },
        { name: 'Width', symbol: 'B', description: 'Foundation width', defaultUnit: 'm', type: 'number', min: 0 }
      ],
      description: 'Ultimate bearing capacity using Terzaghi equation',
      units: 'kPa',
      references: ['Foundation Analysis and Design by Bowles'],
      complexity: 'advanced'
    }
  ];

  const addToHistory = useCallback((calculatorType: string, inputs: Record<string, any>, result: any, formula: string) => {
    const newEntry: CalculationHistory = {
      id: Date.now().toString(),
      timestamp: new Date(),
      calculatorType,
      inputs,
      result,
      formula,
      starred: false
    };
    
    setHistory(prev => [newEntry, ...prev.slice(0, 99)]); // Keep last 100 entries
  }, []);

  const saveCalculation = useCallback((name: string, description: string, calculatorType: string, inputs: Record<string, any>, result: any, tags: string[]) => {
    const newSaved: SavedCalculation = {
      id: Date.now().toString(),
      name,
      description,
      calculatorType,
      inputs,
      result,
      tags,
      createdDate: new Date(),
      lastUsed: new Date(),
      useCount: 1
    };
    
    setSavedCalculations(prev => [...prev, newSaved]);
  }, []);

  const filteredFormulas = useMemo(() => {
    return engineeringFormulas.filter(formula => {
      const matchesSearch = !searchQuery || 
        formula.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        formula.description.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesCategory = selectedCategory === 'all' || formula.category === selectedCategory;
      
      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, selectedCategory]);

  const renderCalculator = () => {
    switch (activeCalculator) {
      case 'basic':
        return <BasicCalculator onResult={addToHistory} />;
      case 'scientific':
        return <ScientificCalculator onResult={addToHistory} />;
      case 'construction':
        return <ConstructionCalculator onResult={addToHistory} />;
      case 'structural':
        return <StructuralCalculator onResult={addToHistory} formulas={filteredFormulas.filter(f => f.category === 'structural')} />;
      case 'electrical':
        return <ElectricalCalculator onResult={addToHistory} formulas={filteredFormulas.filter(f => f.category === 'electrical')} />;
      case 'fluid':
        return <FluidMechanicsCalculator onResult={addToHistory} />;
      case 'thermal':
        return <ThermalCalculator onResult={addToHistory} />;
      case 'geotechnical':
        return <GeotechnicalCalculator onResult={addToHistory} formulas={filteredFormulas.filter(f => f.category === 'geotechnical')} />;
      case 'surveying':
        return <SurveyingCalculator onResult={addToHistory} />;
      case 'materials':
        return <MaterialsCalculator onResult={addToHistory} />;
      case 'environmental':
        return <EnvironmentalCalculator onResult={addToHistory} />;
      case 'economics':
        return <EngineeringEconomicsCalculator onResult={addToHistory} />;
      default:
        return <BasicCalculator onResult={addToHistory} />;
    }
  };

  if (!isOpen) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg z-50 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
        size="icon"
      >
        <Calculator className="h-6 w-6 text-white" />
      </Button>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-7xl h-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-t-xl">
          <div className="flex items-center gap-3">
            <Calculator className="h-8 w-8" />
            <div>
              <h2 className="text-2xl font-bold">Ultimate Calculator Suite</h2>
              <p className="text-blue-100">Professional engineering calculations</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" className="text-white hover:bg-white hover:bg-opacity-20">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Button variant="ghost" size="sm" className="text-white hover:bg-white hover:bg-opacity-20">
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setIsOpen(false)}
              className="text-white hover:bg-white hover:bg-opacity-20"
            >
              ✕
            </Button>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex overflow-hidden">
          {/* Sidebar - Calculator Selection */}
          <div className="w-80 bg-gray-50 border-r overflow-y-auto">
            <div className="p-4">
              <div className="mb-4">
                <Input
                  placeholder="Search calculators..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full"
                />
              </div>
              
              <div className="mb-4">
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value="general">General</SelectItem>
                    <SelectItem value="construction">Construction</SelectItem>
                    <SelectItem value="engineering">Engineering</SelectItem>
                    <SelectItem value="surveying">Surveying</SelectItem>
                    <SelectItem value="economics">Economics</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                {calculatorModes
                  .filter(mode => 
                    selectedCategory === 'all' || mode.category === selectedCategory
                  )
                  .filter(mode =>
                    !searchQuery || 
                    mode.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    mode.description.toLowerCase().includes(searchQuery.toLowerCase())
                  )
                  .map((mode) => (
                    <Card
                      key={mode.id}
                      className={`cursor-pointer transition-all hover:shadow-md ${
                        activeCalculator === mode.id ? 'ring-2 ring-blue-500 bg-blue-50' : ''
                      }`}
                      onClick={() => setActiveCalculator(mode.id)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg ${
                            activeCalculator === mode.id ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-600'
                          }`}>
                            <mode.icon className="h-5 w-5" />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold text-sm">{mode.name}</h3>
                            <p className="text-xs text-gray-500 mt-1">{mode.description}</p>
                            <div className="flex items-center gap-2 mt-2">
                              <Badge variant="outline" className="text-xs">
                                {mode.category}
                              </Badge>
                              <div className="flex">
                                {Array.from({ length: mode.complexity }, (_, i) => (
                                  <Star key={i} className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
              </div>
            </div>
          </div>

          {/* Main Calculator Area */}
          <div className="flex-1 flex flex-col">
            <Tabs defaultValue="calculator" className="flex-1 flex flex-col">
              <TabsList className="grid w-full grid-cols-4 bg-gray-100 m-4 mb-0">
                <TabsTrigger value="calculator">Calculator</TabsTrigger>
                <TabsTrigger value="history">History</TabsTrigger>
                <TabsTrigger value="saved">Saved</TabsTrigger>
                <TabsTrigger value="formulas">Formulas</TabsTrigger>
              </TabsList>

              <TabsContent value="calculator" className="flex-1 p-6 overflow-y-auto">
                {renderCalculator()}
              </TabsContent>

              <TabsContent value="history" className="flex-1 p-6 overflow-y-auto">
                <HistoryPanel history={history} onReuse={(entry) => {
                  // Reuse calculation logic
                  console.log('Reusing calculation:', entry);
                }} />
              </TabsContent>

              <TabsContent value="saved" className="flex-1 p-6 overflow-y-auto">
                <SavedCalculationsPanel 
                  savedCalculations={savedCalculations} 
                  onLoad={(saved) => {
                    // Load saved calculation logic
                    console.log('Loading saved calculation:', saved);
                  }}
                />
              </TabsContent>

              <TabsContent value="formulas" className="flex-1 p-6 overflow-y-auto">
                <FormulasPanel formulas={filteredFormulas} />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
};

// Basic Calculator Component
const BasicCalculator: React.FC<{ onResult: (type: string, inputs: any, result: any, formula: string) => void }> = ({ onResult }) => {
  const [display, setDisplay] = useState('0');
  const [previousValue, setPreviousValue] = useState<string | null>(null);
  const [operation, setOperation] = useState<string | null>(null);

  const calculate = (a: number, b: number, op: string): number => {
    switch (op) {
      case '+': return a + b;
      case '-': return a - b;
      case '×': return a * b;
      case '÷': return a / b;
      default: return b;
    }
  };

  const handleNumber = (num: string) => {
    setDisplay(prev => prev === '0' ? num : prev + num);
  };

  const handleOperation = (op: string) => {
    if (previousValue && operation && display !== '0') {
      const result = calculate(parseFloat(previousValue), parseFloat(display), operation);
      setDisplay(result.toString());
      onResult('basic', { a: previousValue, b: display, operation }, result, `${previousValue} ${operation} ${display} = ${result}`);
    }
    setPreviousValue(display);
    setOperation(op);
    setDisplay('0');
  };

  const handleEquals = () => {
    if (previousValue && operation) {
      const result = calculate(parseFloat(previousValue), parseFloat(display), operation);
      setDisplay(result.toString());
      onResult('basic', { a: previousValue, b: display, operation }, result, `${previousValue} ${operation} ${display} = ${result}`);
      setPreviousValue(null);
      setOperation(null);
    }
  };

  const handleClear = () => {
    setDisplay('0');
    setPreviousValue(null);
    setOperation(null);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calculator className="h-5 w-5" />
          Basic Calculator
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="bg-gray-900 text-white p-4 rounded-lg mb-4">
          <div className="text-right text-3xl font-mono">{display}</div>
          {operation && <div className="text-right text-sm text-gray-400">{previousValue} {operation}</div>}
        </div>
        
        <div className="grid grid-cols-4 gap-2">
          <Button variant="outline" onClick={handleClear} className="col-span-2">Clear</Button>
          <Button variant="outline" onClick={() => setDisplay(prev => prev.slice(0, -1) || '0')}>⌫</Button>
          <Button variant="outline" onClick={() => handleOperation('÷')}>÷</Button>
          
          <Button variant="outline" onClick={() => handleNumber('7')}>7</Button>
          <Button variant="outline" onClick={() => handleNumber('8')}>8</Button>
          <Button variant="outline" onClick={() => handleNumber('9')}>9</Button>
          <Button variant="outline" onClick={() => handleOperation('×')}>×</Button>
          
          <Button variant="outline" onClick={() => handleNumber('4')}>4</Button>
          <Button variant="outline" onClick={() => handleNumber('5')}>5</Button>
          <Button variant="outline" onClick={() => handleNumber('6')}>6</Button>
          <Button variant="outline" onClick={() => handleOperation('-')}>-</Button>
          
          <Button variant="outline" onClick={() => handleNumber('1')}>1</Button>
          <Button variant="outline" onClick={() => handleNumber('2')}>2</Button>
          <Button variant="outline" onClick={() => handleNumber('3')}>3</Button>
          <Button variant="outline" onClick={() => handleOperation('+')} className="row-span-2">+</Button>
          
          <Button variant="outline" onClick={() => handleNumber('0')} className="col-span-2">0</Button>
          <Button variant="outline" onClick={() => setDisplay(prev => prev.includes('.') ? prev : prev + '.')}>.</Button>
          
          <Button onClick={handleEquals} className="col-span-3 bg-blue-600 hover:bg-blue-700 text-white">=</Button>
        </div>
      </CardContent>
    </Card>
  );
};

// Scientific Calculator Component
const ScientificCalculator: React.FC<{ onResult: (type: string, inputs: any, result: any, formula: string) => void }> = ({ onResult }) => {
  const [display, setDisplay] = useState('0');
  const [memory, setMemory] = useState(0);

  const scientificFunctions = {
    sin: (x: number) => Math.sin(x * Math.PI / 180),
    cos: (x: number) => Math.cos(x * Math.PI / 180),
    tan: (x: number) => Math.tan(x * Math.PI / 180),
    log: (x: number) => Math.log10(x),
    ln: (x: number) => Math.log(x),
    sqrt: (x: number) => Math.sqrt(x),
    square: (x: number) => x * x,
    cube: (x: number) => x * x * x,
    factorial: (x: number) => {
      if (x <= 1) return 1;
      return x * scientificFunctions.factorial(x - 1);
    }
  };

  const handleFunction = (func: keyof typeof scientificFunctions) => {
    const value = parseFloat(display);
    const result = scientificFunctions[func](value);
    setDisplay(result.toString());
    onResult('scientific', { input: value, function: func }, result, `${func}(${value}) = ${result}`);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CircuitBoard className="h-5 w-5" />
          Scientific Calculator
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="bg-gray-900 text-white p-4 rounded-lg mb-4">
          <div className="text-right text-3xl font-mono">{display}</div>
          <div className="text-right text-sm text-gray-400">Memory: {memory}</div>
        </div>
        
        <div className="grid grid-cols-6 gap-2">
          {/* Scientific functions */}
          <Button variant="outline" onClick={() => handleFunction('sin')}>sin</Button>
          <Button variant="outline" onClick={() => handleFunction('cos')}>cos</Button>
          <Button variant="outline" onClick={() => handleFunction('tan')}>tan</Button>
          <Button variant="outline" onClick={() => handleFunction('log')}>log</Button>
          <Button variant="outline" onClick={() => handleFunction('ln')}>ln</Button>
          <Button variant="outline" onClick={() => setDisplay(Math.PI.toString())}>π</Button>
          
          <Button variant="outline" onClick={() => handleFunction('sqrt')}>√</Button>
          <Button variant="outline" onClick={() => handleFunction('square')}>x²</Button>
          <Button variant="outline" onClick={() => handleFunction('cube')}>x³</Button>
          <Button variant="outline" onClick={() => setDisplay(Math.E.toString())}>e</Button>
          <Button variant="outline" onClick={() => handleFunction('factorial')}>x!</Button>
          <Button variant="outline" onClick={() => setDisplay((1/parseFloat(display)).toString())}>1/x</Button>
        </div>
        
        <div className="mt-4 grid grid-cols-4 gap-2">
          <Button variant="outline" onClick={() => setMemory(parseFloat(display))}>MS</Button>
          <Button variant="outline" onClick={() => setDisplay(memory.toString())}>MR</Button>
          <Button variant="outline" onClick={() => setMemory(memory + parseFloat(display))}>M+</Button>
          <Button variant="outline" onClick={() => setMemory(0)}>MC</Button>
        </div>
      </CardContent>
    </Card>
  );
};

// Construction Calculator Component
const ConstructionCalculator: React.FC<{ onResult: (type: string, inputs: any, result: any, formula: string) => void }> = ({ onResult }) => {
  const [inputs, setInputs] = useState({
    length: '',
    width: '',
    height: '',
    thickness: '',
    wasteFactor: '10'
  });

  const calculateConcrete = () => {
    const volume = parseFloat(inputs.length) * parseFloat(inputs.width) * parseFloat(inputs.height);
    const wasteAdjusted = volume * (1 + parseFloat(inputs.wasteFactor) / 100);
    const cubicYards = wasteAdjusted / 27; // Convert cubic feet to cubic yards
    
    onResult('construction-concrete', inputs, {
      volume: volume.toFixed(2),
      volumeWithWaste: wasteAdjusted.toFixed(2),
      cubicYards: cubicYards.toFixed(2)
    }, `Volume = ${inputs.length} × ${inputs.width} × ${inputs.height} = ${volume.toFixed(2)} ft³`);
  };

  const calculateRebar = () => {
    const area = parseFloat(inputs.length) * parseFloat(inputs.width);
    const spacing = 12; // 12 inches on center
    const lengthBars = Math.ceil(parseFloat(inputs.width) / (spacing / 12));
    const widthBars = Math.ceil(parseFloat(inputs.length) / (spacing / 12));
    const totalLength = (lengthBars * parseFloat(inputs.length)) + (widthBars * parseFloat(inputs.width));
    
    onResult('construction-rebar', inputs, {
      lengthBars,
      widthBars,
      totalLength: totalLength.toFixed(2),
      area: area.toFixed(2)
    }, `Rebar calculation for ${area.toFixed(2)} ft² area`);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building2 className="h-5 w-5" />
          Construction Calculator
        </CardTitle>
        <CardDescription>Calculate materials for construction projects</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Input fields */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="length">Length (ft)</Label>
            <Input
              id="length"
              type="number"
              value={inputs.length}
              onChange={(e) => setInputs(prev => ({ ...prev, length: e.target.value }))}
              placeholder="Enter length"
            />
          </div>
          <div>
            <Label htmlFor="width">Width (ft)</Label>
            <Input
              id="width"
              type="number"
              value={inputs.width}
              onChange={(e) => setInputs(prev => ({ ...prev, width: e.target.value }))}
              placeholder="Enter width"
            />
          </div>
          <div>
            <Label htmlFor="height">Height/Thickness (ft)</Label>
            <Input
              id="height"
              type="number"
              value={inputs.height}
              onChange={(e) => setInputs(prev => ({ ...prev, height: e.target.value }))}
              placeholder="Enter height"
            />
          </div>
          <div>
            <Label htmlFor="wasteFactor">Waste Factor (%)</Label>
            <Input
              id="wasteFactor"
              type="number"
              value={inputs.wasteFactor}
              onChange={(e) => setInputs(prev => ({ ...prev, wasteFactor: e.target.value }))}
              placeholder="Waste percentage"
            />
          </div>
        </div>

        {/* Calculation buttons */}
        <div className="grid grid-cols-2 gap-4">
          <Button onClick={calculateConcrete} className="flex items-center gap-2">
            <Square className="h-4 w-4" />
            Calculate Concrete
          </Button>
          <Button onClick={calculateRebar} variant="outline" className="flex items-center gap-2">
            <Layers className="h-4 w-4" />
            Calculate Rebar
          </Button>
        </div>

        {/* Quick reference */}
        <div className="bg-blue-50 p-4 rounded-lg">
          <h4 className="font-semibold mb-2">Quick Reference</h4>
          <ul className="text-sm space-y-1">
            <li>• 1 cubic yard = 27 cubic feet</li>
            <li>• Standard rebar spacing: 12" on center</li>
            <li>• Typical waste factor: 5-15%</li>
            <li>• Concrete coverage: #4 rebar = 1.5" clear</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

// Structural Calculator Component
const StructuralCalculator: React.FC<{ 
  onResult: (type: string, inputs: any, result: any, formula: string) => void;
  formulas: EngineeringFormula[];
}> = ({ onResult, formulas }) => {
  const [selectedFormula, setSelectedFormula] = useState<string>('');
  const [inputs, setInputs] = useState<Record<string, string>>({});

  const currentFormula = formulas.find(f => f.id === selectedFormula);

  const calculateResult = () => {
    if (!currentFormula) return;

    // Simple formula evaluation (in production, use a proper math parser)
    let formula = currentFormula.formula;
    const numericInputs: Record<string, number> = {};

    currentFormula.variables.forEach(variable => {
      const value = parseFloat(inputs[variable.symbol] || '0');
      numericInputs[variable.symbol] = value;
      formula = formula.replace(new RegExp(variable.symbol, 'g'), value.toString());
    });

    try {
      const result = Function('"use strict"; return (' + formula + ')')();
      onResult('structural', numericInputs, result, `${currentFormula.name}: ${formula} = ${result.toFixed(4)} ${currentFormula.units}`);
    } catch (error) {
      console.error('Formula calculation error:', error);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Layers className="h-5 w-5" />
          Structural Engineering Calculator
        </CardTitle>
        <CardDescription>Calculate structural engineering parameters</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <Label htmlFor="formula-select">Select Formula</Label>
          <Select value={selectedFormula} onValueChange={setSelectedFormula}>
            <SelectTrigger>
              <SelectValue placeholder="Choose a structural formula" />
            </SelectTrigger>
            <SelectContent>
              {formulas.map(formula => (
                <SelectItem key={formula.id} value={formula.id}>
                  {formula.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {currentFormula && (
          <>
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-semibold mb-2">{currentFormula.name}</h4>
              <p className="text-sm text-gray-600 mb-2">{currentFormula.description}</p>
              <div className="font-mono text-lg bg-white p-2 rounded border">
                {currentFormula.formula}
              </div>
              <div className="mt-2 text-sm text-gray-500">
                Result units: {currentFormula.units}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {currentFormula.variables.map(variable => (
                <div key={variable.symbol}>
                  <Label htmlFor={variable.symbol}>
                    {variable.name} ({variable.symbol}) - {variable.defaultUnit}
                  </Label>
                  <Input
                    id={variable.symbol}
                    type="number"
                    value={inputs[variable.symbol] || ''}
                    onChange={(e) => setInputs(prev => ({ ...prev, [variable.symbol]: e.target.value }))}
                    placeholder={variable.description}
                  />
                </div>
              ))}
            </div>

            <Button onClick={calculateResult} className="w-full">
              Calculate Result
            </Button>

            {currentFormula.references.length > 0 && (
              <div className="bg-yellow-50 p-4 rounded-lg">
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <BookOpen className="h-4 w-4" />
                  References
                </h4>
                <ul className="text-sm space-y-1">
                  {currentFormula.references.map((ref, index) => (
                    <li key={index}>• {ref}</li>
                  ))}
                </ul>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};

// Electrical Calculator Component  
const ElectricalCalculator: React.FC<{
  onResult: (type: string, inputs: any, result: any, formula: string) => void;
  formulas: EngineeringFormula[];
}> = ({ onResult, formulas }) => {
  const [calculationType, setCalculationType] = useState('ohms-law');
  const [inputs, setInputs] = useState<Record<string, string>>({});

  const calculations = {
    'ohms-law': {
      name: 'Ohm\'s Law',
      fields: [
        { key: 'voltage', label: 'Voltage (V)', unit: 'V' },
        { key: 'current', label: 'Current (A)', unit: 'A' },
        { key: 'resistance', label: 'Resistance (Ω)', unit: 'Ω' }
      ],
      calculate: (inputs: Record<string, number>) => {
        if (inputs.voltage && inputs.current) {
          return { resistance: inputs.voltage / inputs.current };
        } else if (inputs.voltage && inputs.resistance) {
          return { current: inputs.voltage / inputs.resistance };
        } else if (inputs.current && inputs.resistance) {
          return { voltage: inputs.current * inputs.resistance };
        }
        return {};
      }
    },
    'power': {
      name: 'Power Calculations',
      fields: [
        { key: 'power', label: 'Power (W)', unit: 'W' },
        { key: 'voltage', label: 'Voltage (V)', unit: 'V' },
        { key: 'current', label: 'Current (A)', unit: 'A' }
      ],
      calculate: (inputs: Record<string, number>) => {
        if (inputs.voltage && inputs.current) {
          return { power: inputs.voltage * inputs.current };
        } else if (inputs.power && inputs.voltage) {
          return { current: inputs.power / inputs.voltage };
        } else if (inputs.power && inputs.current) {
          return { voltage: inputs.power / inputs.current };
        }
        return {};
      }
    }
  };

  const currentCalc = calculations[calculationType as keyof typeof calculations];

  const performCalculation = () => {
    const numericInputs: Record<string, number> = {};
    Object.entries(inputs).forEach(([key, value]) => {
      if (value) numericInputs[key] = parseFloat(value);
    });

    const result = currentCalc.calculate(numericInputs);
    onResult('electrical', numericInputs, result, `${currentCalc.name} calculation`);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="h-5 w-5" />
          Electrical Engineering Calculator
        </CardTitle>
        <CardDescription>Calculate electrical parameters and circuit values</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <Label htmlFor="calc-type">Calculation Type</Label>
          <Select value={calculationType} onValueChange={setCalculationType}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ohms-law">Ohm's Law</SelectItem>
              <SelectItem value="power">Power Calculations</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {currentCalc.fields.map(field => (
            <div key={field.key}>
              <Label htmlFor={field.key}>{field.label}</Label>
              <Input
                id={field.key}
                type="number"
                value={inputs[field.key] || ''}
                onChange={(e) => setInputs(prev => ({ ...prev, [field.key]: e.target.value }))}
                placeholder={`Enter ${field.label.toLowerCase()}`}
              />
            </div>
          ))}
        </div>

        <Button onClick={performCalculation} className="w-full">
          Calculate
        </Button>

        <div className="bg-blue-50 p-4 rounded-lg">
          <h4 className="font-semibold mb-2">Electrical Safety Notes</h4>
          <ul className="text-sm space-y-1">
            <li>• Always de-energize circuits before working</li>
            <li>• Use proper PPE and lockout/tagout procedures</li>
            <li>• Verify calculations with licensed electrician</li>
            <li>• Follow local electrical codes and standards</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

// Additional calculator components would be implemented similarly...
// For brevity, I'll implement placeholder components for the remaining calculators

const FluidMechanicsCalculator: React.FC<{ onResult: any }> = ({ onResult }) => (
  <Card>
    <CardHeader>
      <CardTitle className="flex items-center gap-2">
        <Droplets className="h-5 w-5" />
        Fluid Mechanics Calculator
      </CardTitle>
    </CardHeader>
    <CardContent>
      <p>Advanced fluid flow and hydraulic calculations coming soon...</p>
    </CardContent>
  </Card>
);

const ThermalCalculator: React.FC<{ onResult: any }> = ({ onResult }) => (
  <Card>
    <CardHeader>
      <CardTitle className="flex items-center gap-2">
        <Thermometer className="h-5 w-5" />
        Thermal Engineering Calculator
      </CardTitle>
    </CardHeader>
    <CardContent>
      <p>Heat transfer and thermodynamic calculations coming soon...</p>
    </CardContent>
  </Card>
);

const GeotechnicalCalculator: React.FC<{ onResult: any; formulas: any[] }> = ({ onResult, formulas }) => (
  <Card>
    <CardHeader>
      <CardTitle className="flex items-center gap-2">
        <Hammer className="h-5 w-5" />
        Geotechnical Engineering Calculator
      </CardTitle>
    </CardHeader>
    <CardContent>
      <p>Soil mechanics and foundation calculations coming soon...</p>
    </CardContent>
  </Card>
);

const SurveyingCalculator: React.FC<{ onResult: any }> = ({ onResult }) => (
  <Card>
    <CardHeader>
      <CardTitle className="flex items-center gap-2">
        <Compass className="h-5 w-5" />
        Surveying & Mapping Calculator
      </CardTitle>
    </CardHeader>
    <CardContent>
      <p>Land surveying and coordinate calculations coming soon...</p>
    </CardContent>
  </Card>
);

const MaterialsCalculator: React.FC<{ onResult: any }> = ({ onResult }) => (
  <Card>
    <CardHeader>
      <CardTitle className="flex items-center gap-2">
        <Cog className="h-5 w-5" />
        Materials Engineering Calculator
      </CardTitle>
    </CardHeader>
    <CardContent>
      <p>Material properties and testing calculations coming soon...</p>
    </CardContent>
  </Card>
);

const EnvironmentalCalculator: React.FC<{ onResult: any }> = ({ onResult }) => (
  <Card>
    <CardHeader>
      <CardTitle className="flex items-center gap-2">
        <Wind className="h-5 w-5" />
        Environmental Engineering Calculator
      </CardTitle>
    </CardHeader>
    <CardContent>
      <p>Environmental and sustainability calculations coming soon...</p>
    </CardContent>
  </Card>
);

const EngineeringEconomicsCalculator: React.FC<{ onResult: any }> = ({ onResult }) => (
  <Card>
    <CardHeader>
      <CardTitle className="flex items-center gap-2">
        <TrendingUp className="h-5 w-5" />
        Engineering Economics Calculator
      </CardTitle>
    </CardHeader>
    <CardContent>
      <p>Cost analysis and financial calculations coming soon...</p>
    </CardContent>
  </Card>
);

// History Panel Component
const HistoryPanel: React.FC<{
  history: CalculationHistory[];
  onReuse: (entry: CalculationHistory) => void;
}> = ({ history, onReuse }) => (
  <div className="space-y-4">
    <h3 className="text-lg font-semibold">Calculation History</h3>
    {history.length === 0 ? (
      <p className="text-gray-500">No calculations yet</p>
    ) : (
      <div className="space-y-3">
        {history.map(entry => (
          <Card key={entry.id}>
            <CardContent className="p-4">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-medium">{entry.calculatorType}</p>
                  <p className="text-sm text-gray-600">{entry.formula}</p>
                  <p className="text-xs text-gray-400">
                    {entry.timestamp.toLocaleString()}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => onReuse(entry)}>
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="outline">
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )}
  </div>
);

// Saved Calculations Panel Component
const SavedCalculationsPanel: React.FC<{
  savedCalculations: SavedCalculation[];
  onLoad: (saved: SavedCalculation) => void;
}> = ({ savedCalculations, onLoad }) => (
  <div className="space-y-4">
    <h3 className="text-lg font-semibold">Saved Calculations</h3>
    {savedCalculations.length === 0 ? (
      <p className="text-gray-500">No saved calculations</p>
    ) : (
      <div className="space-y-3">
        {savedCalculations.map(saved => (
          <Card key={saved.id}>
            <CardContent className="p-4">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-medium">{saved.name}</p>
                  <p className="text-sm text-gray-600">{saved.description}</p>
                  <div className="flex gap-2 mt-2">
                    {saved.tags.map(tag => (
                      <Badge key={tag} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
                <Button size="sm" onClick={() => onLoad(saved)}>
                  Load
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )}
  </div>
);

// Formulas Panel Component
const FormulasPanel: React.FC<{ formulas: EngineeringFormula[] }> = ({ formulas }) => (
  <div className="space-y-4">
    <h3 className="text-lg font-semibold">Engineering Formulas Reference</h3>
    <div className="space-y-4">
      {formulas.map(formula => (
        <Card key={formula.id}>
          <CardContent className="p-4">
            <div className="flex justify-between items-start mb-2">
              <h4 className="font-medium">{formula.name}</h4>
              <Badge variant={
                formula.complexity === 'basic' ? 'default' :
                formula.complexity === 'intermediate' ? 'secondary' :
                formula.complexity === 'advanced' ? 'destructive' : 'outline'
              }>
                {formula.complexity}
              </Badge>
            </div>
            <p className="text-sm text-gray-600 mb-2">{formula.description}</p>
            <div className="font-mono text-sm bg-gray-50 p-2 rounded mb-2">
              {formula.formula}
            </div>
            <div className="text-xs text-gray-500">
              Units: {formula.units} | Category: {formula.category}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  </div>
);

export default UltimateCalculatorSuite;