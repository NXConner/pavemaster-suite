import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import {
  Calculator,
  Copy,
  History,
  Save,
  Download,
  Upload,
  Settings,
  Plus,
  Minus,
  X,
  Divide,
  Equal,
  Delete,
  RotateCcw,
  Percent,
  PlusCircle,
  DollarSign,
  Ruler,
  Clock,
  TrendingUp,
  Zap
} from 'lucide-react';

interface CalculationHistory {
  id: string;
  expression: string;
  result: number;
  mode: string;
  timestamp: Date;
  metadata?: Record<string, any>;
}

interface CalculatorMode {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  component: React.ComponentType<any>;
}

interface SavedCalculation {
  id: string;
  name: string;
  expression: string;
  mode: string;
  variables: Record<string, number>;
  createdAt: Date;
}

// Basic Calculator Component
const BasicCalculator = ({ onResult }: { onResult: (result: number, expression: string) => void }) => {
  const [display, setDisplay] = useState('0');
  const [previousValue, setPreviousValue] = useState<number | null>(null);
  const [operation, setOperation] = useState<string | null>(null);
  const [waitingForOperand, setWaitingForOperand] = useState(false);

  const inputNumber = (num: string) => {
    if (waitingForOperand) {
      setDisplay(String(num));
      setWaitingForOperand(false);
    } else {
      setDisplay(display === '0' ? String(num) : display + num);
    }
  };

  const inputDot = () => {
    if (waitingForOperand) {
      setDisplay('0.');
      setWaitingForOperand(false);
    } else if (display.indexOf('.') === -1) {
      setDisplay(display + '.');
    }
  };

  const clear = () => {
    setDisplay('0');
    setPreviousValue(null);
    setOperation(null);
    setWaitingForOperand(false);
  };

  const performOperation = (nextOperation: string) => {
    const inputValue = parseFloat(display);

    if (previousValue === null) {
      setPreviousValue(inputValue);
    } else if (operation) {
      const currentValue = previousValue || 0;
      const newValue = calculate(currentValue, inputValue, operation);

      setDisplay(String(newValue));
      setPreviousValue(newValue);
      
      onResult(newValue, `${currentValue} ${operation} ${inputValue} = ${newValue}`);
    }

    setWaitingForOperand(true);
    setOperation(nextOperation);
  };

  const calculate = (firstValue: number, secondValue: number, operation: string): number => {
    switch (operation) {
      case '+':
        return firstValue + secondValue;
      case '-':
        return firstValue - secondValue;
      case '*':
        return firstValue * secondValue;
      case '/':
        return firstValue / secondValue;
      case '=':
        return secondValue;
      default:
        return secondValue;
    }
  };

  const percentage = () => {
    const value = parseFloat(display) / 100;
    setDisplay(String(value));
    onResult(value, `${display}% = ${value}`);
  };

  return (
    <div className="grid grid-cols-4 gap-2 max-w-xs mx-auto">
      <div className="col-span-4 p-4 bg-muted rounded text-right text-2xl font-mono">
        {display}
      </div>
      
      <Button variant="outline" onClick={clear}>C</Button>
      <Button variant="outline" onClick={() => setDisplay(display.slice(0, -1) || '0')}>
        <Delete className="h-4 w-4" />
      </Button>
      <Button variant="outline" onClick={percentage}>%</Button>
      <Button variant="outline" onClick={() => performOperation('/')}>÷</Button>

      <Button variant="outline" onClick={() => inputNumber('7')}>7</Button>
      <Button variant="outline" onClick={() => inputNumber('8')}>8</Button>
      <Button variant="outline" onClick={() => inputNumber('9')}>9</Button>
      <Button variant="outline" onClick={() => performOperation('*')}>×</Button>

      <Button variant="outline" onClick={() => inputNumber('4')}>4</Button>
      <Button variant="outline" onClick={() => inputNumber('5')}>5</Button>
      <Button variant="outline" onClick={() => inputNumber('6')}>6</Button>
      <Button variant="outline" onClick={() => performOperation('-')}>-</Button>

      <Button variant="outline" onClick={() => inputNumber('1')}>1</Button>
      <Button variant="outline" onClick={() => inputNumber('2')}>2</Button>
      <Button variant="outline" onClick={() => inputNumber('3')}>3</Button>
      <Button variant="outline" onClick={() => performOperation('+')}>+</Button>

      <Button variant="outline" className="col-span-2" onClick={() => inputNumber('0')}>0</Button>
      <Button variant="outline" onClick={inputDot}>.</Button>
      <Button onClick={() => performOperation('=')}>=</Button>
    </div>
  );
};

// Financial Calculator Component
const FinancialCalculator = ({ onResult }: { onResult: (result: number, expression: string) => void }) => {
  const [principal, setPrincipal] = useState('');
  const [rate, setRate] = useState('');
  const [time, setTime] = useState('');
  const [compoundFrequency, setCompoundFrequency] = useState('12');
  const [calculationType, setCalculationType] = useState('compound');

  const calculateCompoundInterest = () => {
    const P = parseFloat(principal);
    const r = parseFloat(rate) / 100;
    const t = parseFloat(time);
    const n = parseFloat(compoundFrequency);

    if (P && r && t && n) {
      const A = P * Math.pow(1 + r / n, n * t);
      const interest = A - P;
      
      onResult(A, `Compound Interest: Principal $${P}, Rate ${rate}%, Time ${t} years = $${A.toFixed(2)}`);
      return A;
    }
    return 0;
  };

  const calculateSimpleInterest = () => {
    const P = parseFloat(principal);
    const r = parseFloat(rate) / 100;
    const t = parseFloat(time);

    if (P && r && t) {
      const interest = P * r * t;
      const total = P + interest;
      
      onResult(total, `Simple Interest: Principal $${P}, Rate ${rate}%, Time ${t} years = $${total.toFixed(2)}`);
      return total;
    }
    return 0;
  };

  const calculateLoanPayment = () => {
    const P = parseFloat(principal);
    const r = parseFloat(rate) / 100 / 12; // Monthly rate
    const n = parseFloat(time) * 12; // Number of payments

    if (P && r && n) {
      const M = P * (r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
      
      onResult(M, `Monthly Payment: Loan $${P}, Rate ${rate}%/year, ${time} years = $${M.toFixed(2)}/month`);
      return M;
    }
    return 0;
  };

  const calculate = () => {
    switch (calculationType) {
      case 'compound':
        return calculateCompoundInterest();
      case 'simple':
        return calculateSimpleInterest();
      case 'loan':
        return calculateLoanPayment();
      default:
        return 0;
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="calc-type">Calculation Type</Label>
        <Select value={calculationType} onValueChange={setCalculationType}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="compound">Compound Interest</SelectItem>
            <SelectItem value="simple">Simple Interest</SelectItem>
            <SelectItem value="loan">Loan Payment</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="principal">
          {calculationType === 'loan' ? 'Loan Amount ($)' : 'Principal ($)'}
        </Label>
        <Input
          id="principal"
          type="number"
          value={principal}
          onChange={(e) => setPrincipal(e.target.value)}
          placeholder="Enter amount"
        />
      </div>

      <div>
        <Label htmlFor="rate">Annual Interest Rate (%)</Label>
        <Input
          id="rate"
          type="number"
          value={rate}
          onChange={(e) => setRate(e.target.value)}
          placeholder="Enter rate"
        />
      </div>

      <div>
        <Label htmlFor="time">
          {calculationType === 'loan' ? 'Loan Term (years)' : 'Time (years)'}
        </Label>
        <Input
          id="time"
          type="number"
          value={time}
          onChange={(e) => setTime(e.target.value)}
          placeholder="Enter years"
        />
      </div>

      {calculationType === 'compound' && (
        <div>
          <Label htmlFor="frequency">Compound Frequency (per year)</Label>
          <Select value={compoundFrequency} onValueChange={setCompoundFrequency}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">Annually</SelectItem>
              <SelectItem value="2">Semi-annually</SelectItem>
              <SelectItem value="4">Quarterly</SelectItem>
              <SelectItem value="12">Monthly</SelectItem>
              <SelectItem value="365">Daily</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}

      <Button onClick={calculate} className="w-full">
        Calculate
      </Button>
    </div>
  );
};

// Unit Converter Component
const UnitConverter = ({ onResult }: { onResult: (result: number, expression: string) => void }) => {
  const [value, setValue] = useState('');
  const [fromUnit, setFromUnit] = useState('ft');
  const [toUnit, setToUnit] = useState('m');
  const [category, setCategory] = useState('length');

  const conversions: Record<string, Record<string, number>> = {
    length: {
      ft: 1,
      m: 0.3048,
      in: 12,
      cm: 30.48,
      yd: 0.3333,
      mm: 304.8
    },
    area: {
      sqft: 1,
      sqm: 0.092903,
      sqyd: 0.111111,
      acre: 0.000022957,
      hectare: 0.0000092903
    },
    volume: {
      gal: 1,
      liter: 3.78541,
      cuft: 0.133681,
      barrel: 0.0238095
    },
    weight: {
      lb: 1,
      kg: 0.453592,
      oz: 16,
      ton: 0.0005,
      gram: 453.592
    }
  };

  const convert = () => {
    const inputValue = parseFloat(value);
    if (!inputValue || !conversions[category]) return;

    const baseValue = inputValue / conversions[category][fromUnit];
    const result = baseValue * conversions[category][toUnit];

    onResult(result, `${inputValue} ${fromUnit} = ${result.toFixed(6)} ${toUnit}`);
  };

  const unitOptions = category ? Object.keys(conversions[category]) : [];

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="category">Category</Label>
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="length">Length</SelectItem>
            <SelectItem value="area">Area</SelectItem>
            <SelectItem value="volume">Volume</SelectItem>
            <SelectItem value="weight">Weight</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="value">Value</Label>
        <Input
          id="value"
          type="number"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Enter value"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="from">From</Label>
          <Select value={fromUnit} onValueChange={setFromUnit}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {unitOptions.map(unit => (
                <SelectItem key={unit} value={unit}>{unit}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="to">To</Label>
          <Select value={toUnit} onValueChange={setToUnit}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {unitOptions.map(unit => (
                <SelectItem key={unit} value={unit}>{unit}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <Button onClick={convert} className="w-full">
        Convert
      </Button>
    </div>
  );
};

// Material Calculator Component
const MaterialCalculator = ({ onResult }: { onResult: (result: number, expression: string) => void }) => {
  const [length, setLength] = useState('');
  const [width, setWidth] = useState('');
  const [thickness, setThickness] = useState('');
  const [material, setMaterial] = useState('concrete');
  const [wasteFactor, setWasteFactor] = useState('10');

  const materialData: Record<string, { unit: string; coverage: number; name: string }> = {
    concrete: { unit: 'cubic yards', coverage: 1, name: 'Concrete' },
    asphalt: { unit: 'tons', coverage: 110, name: 'Asphalt' }, // lbs per sq ft per inch
    paint: { unit: 'gallons', coverage: 400, name: 'Paint' }, // sq ft per gallon
    gravel: { unit: 'tons', coverage: 100, name: 'Gravel' }, // sq ft per ton at 2" depth
    sand: { unit: 'tons', coverage: 120, name: 'Sand' }
  };

  const calculate = () => {
    const l = parseFloat(length);
    const w = parseFloat(width);
    const t = parseFloat(thickness) || 1;
    const waste = parseFloat(wasteFactor) / 100;

    if (!l || !w) return;

    const area = l * w;
    const volume = area * (t / 12); // Convert inches to feet

    let quantity = 0;
    let unit = '';

    switch (material) {
      case 'concrete':
        quantity = volume / 27; // Convert cubic feet to cubic yards
        unit = materialData[material].unit;
        break;
      case 'asphalt':
        quantity = (area * t * materialData[material].coverage) / 2000; // Convert to tons
        unit = materialData[material].unit;
        break;
      case 'paint':
        quantity = area / materialData[material].coverage;
        unit = materialData[material].unit;
        break;
      case 'gravel':
      case 'sand':
        quantity = area / materialData[material].coverage;
        unit = materialData[material].unit;
        break;
    }

    const totalQuantity = quantity * (1 + waste);

    onResult(totalQuantity, 
      `${materialData[material].name}: ${l}' × ${w}' × ${t}" = ${totalQuantity.toFixed(2)} ${unit} (${wasteFactor}% waste included)`
    );
  };

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="material">Material Type</Label>
        <Select value={material} onValueChange={setMaterial}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="concrete">Concrete</SelectItem>
            <SelectItem value="asphalt">Asphalt</SelectItem>
            <SelectItem value="paint">Paint</SelectItem>
            <SelectItem value="gravel">Gravel</SelectItem>
            <SelectItem value="sand">Sand</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="length">Length (ft)</Label>
          <Input
            id="length"
            type="number"
            value={length}
            onChange={(e) => setLength(e.target.value)}
            placeholder="Enter length"
          />
        </div>

        <div>
          <Label htmlFor="width">Width (ft)</Label>
          <Input
            id="width"
            type="number"
            value={width}
            onChange={(e) => setWidth(e.target.value)}
            placeholder="Enter width"
          />
        </div>
      </div>

      <div>
        <Label htmlFor="thickness">Thickness (inches)</Label>
        <Input
          id="thickness"
          type="number"
          value={thickness}
          onChange={(e) => setThickness(e.target.value)}
          placeholder="Enter thickness"
        />
      </div>

      <div>
        <Label htmlFor="waste">Waste Factor (%)</Label>
        <Input
          id="waste"
          type="number"
          value={wasteFactor}
          onChange={(e) => setWasteFactor(e.target.value)}
          placeholder="Enter waste percentage"
        />
      </div>

      <Button onClick={calculate} className="w-full">
        Calculate Materials
      </Button>
    </div>
  );
};

export default function UniversalCalculator() {
  const { toast } = useToast();
  
  const [history, setHistory] = useState<CalculationHistory[]>([]);
  const [savedCalculations, setSavedCalculations] = useState<SavedCalculation[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [currentMode, setCurrentMode] = useState('basic');
  const [showHistory, setShowHistory] = useState(false);

  const calculatorModes: CalculatorMode[] = [
    {
      id: 'basic',
      name: 'Basic Calculator',
      description: 'Standard arithmetic operations',
      icon: <Calculator className="h-4 w-4" />,
      component: BasicCalculator
    },
    {
      id: 'financial',
      name: 'Financial Calculator',
      description: 'Interest, loans, and financial calculations',
      icon: <DollarSign className="h-4 w-4" />,
      component: FinancialCalculator
    },
    {
      id: 'converter',
      name: 'Unit Converter',
      description: 'Convert between different units',
      icon: <Ruler className="h-4 w-4" />,
      component: UnitConverter
    },
    {
      id: 'material',
      name: 'Material Calculator',
      description: 'Calculate material quantities for projects',
      icon: <PlusCircle className="h-4 w-4" />,
      component: MaterialCalculator
    }
  ];

  const handleResult = (result: number, expression: string) => {
    const newEntry: CalculationHistory = {
      id: Date.now().toString(),
      expression,
      result,
      mode: currentMode,
      timestamp: new Date()
    };

    setHistory(prev => [newEntry, ...prev.slice(0, 49)]); // Keep last 50 entries

    toast({
      title: "Calculation Complete",
      description: `Result: ${result.toLocaleString()}`,
    });
  };

  const copyResult = (result: number) => {
    navigator.clipboard.writeText(result.toString());
    toast({
      title: "Copied",
      description: "Result copied to clipboard",
    });
  };

  const saveCalculation = (entry: CalculationHistory) => {
    const name = prompt('Enter a name for this calculation:');
    if (name) {
      const saved: SavedCalculation = {
        id: Date.now().toString(),
        name,
        expression: entry.expression,
        mode: entry.mode,
        variables: {},
        createdAt: new Date()
      };

      setSavedCalculations(prev => [...prev, saved]);
      toast({
        title: "Calculation Saved",
        description: `Saved as "${name}"`,
      });
    }
  };

  const exportHistory = () => {
    const data = {
      history,
      savedCalculations,
      exportDate: new Date().toISOString()
    };

    const dataStr = JSON.stringify(data, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `calculator-data-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);

    toast({
      title: "Data Exported",
      description: "Calculator data has been downloaded.",
    });
  };

  const CurrentCalculator = calculatorModes.find(mode => mode.id === currentMode)?.component || BasicCalculator;

  return (
    <>
      {/* Floating Calculator Button */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button
            className="fixed bottom-4 right-4 h-14 w-14 rounded-full shadow-lg z-50"
            size="lg"
          >
            <Calculator className="h-6 w-6" />
          </Button>
        </DialogTrigger>
        
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Calculator className="h-5 w-5" />
              Universal Calculator
            </DialogTitle>
          </DialogHeader>

          <Tabs value={currentMode} onValueChange={setCurrentMode} className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              {calculatorModes.map(mode => (
                <TabsTrigger key={mode.id} value={mode.id} className="flex items-center gap-1">
                  {mode.icon}
                  <span className="hidden sm:inline">{mode.name.split(' ')[0]}</span>
                </TabsTrigger>
              ))}
            </TabsList>

            {calculatorModes.map(mode => (
              <TabsContent key={mode.id} value={mode.id} className="space-y-4">
                <div className="text-center">
                  <h3 className="text-lg font-semibold">{mode.name}</h3>
                  <p className="text-sm text-muted-foreground">{mode.description}</p>
                </div>

                <Card>
                  <CardContent className="p-6">
                    <mode.component onResult={handleResult} />
                  </CardContent>
                </Card>
              </TabsContent>
            ))}
          </Tabs>

          {/* Calculator Actions */}
          <div className="flex gap-2 flex-wrap">
            <Button variant="outline" size="sm" onClick={() => setShowHistory(!showHistory)}>
              <History className="h-4 w-4 mr-2" />
              History ({history.length})
            </Button>
            <Button variant="outline" size="sm" onClick={exportHistory}>
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Button variant="outline" size="sm" onClick={() => setHistory([])}>
              <RotateCcw className="h-4 w-4 mr-2" />
              Clear History
            </Button>
          </div>

          {/* History Panel */}
          {showHistory && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Calculation History</CardTitle>
              </CardHeader>
              <CardContent className="max-h-60 overflow-y-auto">
                {history.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No calculations yet
                  </p>
                ) : (
                  <div className="space-y-2">
                    {history.slice(0, 10).map(entry => (
                      <div key={entry.id} className="flex items-center justify-between p-2 border rounded text-sm">
                        <div className="flex-1">
                          <p className="font-mono">{entry.expression}</p>
                          <p className="text-xs text-muted-foreground">
                            {entry.timestamp.toLocaleString()} • {entry.mode}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">
                            {entry.result.toLocaleString()}
                          </Badge>
                          <Button variant="ghost" size="sm" onClick={() => copyResult(entry.result)}>
                            <Copy className="h-3 w-3" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => saveCalculation(entry)}>
                            <Save className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}