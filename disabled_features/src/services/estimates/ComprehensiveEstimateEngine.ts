import { EventEmitter } from 'events';

export interface MaterialCost {
  id: string;
  name: string;
  type: 'asphalt' | 'sealcoat' | 'aggregate' | 'primer' | 'paint' | 'equipment_rental' | 'fuel' | 'other';
  category: string;
  unit: string;
  baseUnitCost: number;
  currentUnitCost: number;
  supplier: string;
  lastUpdated: Date;
  availability: 'in_stock' | 'limited' | 'backorder' | 'discontinued';
  minimumOrder: number;
  bulkDiscounts: Array<{
    quantity: number;
    discount: number; // percentage
  }>;
  seasonalPricing: Array<{
    season: 'spring' | 'summer' | 'fall' | 'winter';
    adjustment: number; // percentage
  }>;
  specifications: {
    grade?: string;
    density?: number;
    coverage?: number; // per unit
    viscosity?: string;
    temperature?: { min: number; max: number };
  };
  environmental: {
    ecoFriendly: boolean;
    voc: number; // volatile organic compounds
    recycledContent: number; // percentage
  };
}

export interface LaborRate {
  id: string;
  role: string;
  category: 'skilled' | 'semi_skilled' | 'general';
  baseHourlyRate: number;
  currentHourlyRate: number;
  overtime: {
    threshold: number; // hours per day
    multiplier: number; // 1.5 for time and half
  };
  benefits: {
    healthInsurance: number;
    workersComp: number;
    unemployment: number;
    socialSecurity: number;
    medicare: number;
    retirement: number;
  };
  productivity: {
    standard: number; // units per hour
    experience: 'novice' | 'experienced' | 'expert';
    efficiency: number; // 0.7 to 1.3
  };
  certifications: string[];
  union: boolean;
  prevailingWage?: number;
}

export interface EquipmentCost {
  id: string;
  name: string;
  type: 'paver' | 'roller' | 'distributor' | 'truck' | 'loader' | 'compactor' | 'sweeper' | 'striping' | 'other';
  size: string;
  hourlyRate: number;
  dailyRate: number;
  weeklyRate: number;
  operatorRequired: boolean;
  operatorRate?: number;
  fuelConsumption: number; // gallons per hour
  maintenance: {
    costPerHour: number;
    majorService: {
      hours: number;
      cost: number;
    };
  };
  transportation: {
    mobilization: number;
    demobilization: number;
    dailyTransport?: number;
  };
  productivity: {
    capacity: number;
    efficiency: number;
    conditions: Record<string, number>; // weather/site modifiers
  };
}

export interface ProjectMeasurements {
  area: number; // square feet/meters
  perimeter: number; // linear feet/meters
  thickness?: number; // inches/cm
  volume?: number; // cubic feet/meters
  linearFeet?: number; // for striping, crack sealing
  depth?: number; // excavation depth
  slope?: number; // percentage
  accessDifficulty: 'easy' | 'moderate' | 'difficult' | 'extreme';
  siteConditions: {
    existing: 'new' | 'overlay' | 'reconstruction';
    soil: 'excellent' | 'good' | 'fair' | 'poor';
    drainage: 'excellent' | 'adequate' | 'poor';
    access: 'excellent' | 'good' | 'limited' | 'difficult';
  };
}

export interface EstimateLineItem {
  id: string;
  category: 'material' | 'labor' | 'equipment' | 'subcontractor' | 'overhead' | 'other';
  name: string;
  description: string;
  unit: string;
  quantity: number;
  unitCost: number;
  totalCost: number;
  waste: number; // percentage
  tax: number; // percentage
  markup: number; // percentage
  notes?: string;
  riskFactor: number; // 1.0 = normal, >1.0 = higher risk
  contingency: number; // percentage
  schedule: {
    duration: number; // days
    dependency?: string[]; // other line item IDs
  };
}

export interface CostBreakdown {
  materials: {
    subtotal: number;
    tax: number;
    waste: number;
    total: number;
    items: EstimateLineItem[];
  };
  labor: {
    direct: number;
    benefits: number;
    overtime: number;
    total: number;
    items: EstimateLineItem[];
  };
  equipment: {
    rental: number;
    operation: number;
    transport: number;
    total: number;
    items: EstimateLineItem[];
  };
  subcontractors: {
    subtotal: number;
    total: number;
    items: EstimateLineItem[];
  };
  overhead: {
    general: number;
    administrative: number;
    insurance: number;
    bonding: number;
    total: number;
  };
  profit: {
    rate: number; // percentage
    amount: number;
  };
  contingency: {
    rate: number; // percentage
    amount: number;
  };
  totals: {
    subtotal: number;
    overhead: number;
    profit: number;
    contingency: number;
    total: number;
  };
}

export interface EstimateProject {
  id: string;
  name: string;
  type: 'asphalt_paving' | 'sealcoating' | 'parking_lot' | 'road_construction' | 'maintenance';
  status: 'draft' | 'in_progress' | 'completed' | 'approved' | 'declined';
  created: Date;
  lastModified: Date;
  client: {
    name: string;
    contact: string;
    email: string;
    phone: string;
  };
  location: {
    address: string;
    city: string;
    state: string;
    zipCode: string;
    coordinates?: { lat: number; lng: number };
  };
  measurements: ProjectMeasurements;
  specifications: {
    asphaltType?: string;
    thickness?: number;
    baseType?: string;
    striping?: boolean;
    sealcoating?: boolean;
    crackSealing?: boolean;
  };
  timeline: {
    estimateDate: Date;
    proposedStart: Date;
    proposedCompletion: Date;
    validUntil: Date;
  };
  costBreakdown: CostBreakdown;
  alternatives: Array<{
    id: string;
    name: string;
    description: string;
    costDifference: number;
    timeline: { start: Date; completion: Date };
  }>;
  riskAnalysis: {
    weatherRisk: number;
    materialRisk: number;
    laborRisk: number;
    scheduleRisk: number;
    overallRisk: 'low' | 'medium' | 'high';
    mitigation: string[];
  };
  competitiveAnalysis?: {
    marketPrice: { low: number; high: number; average: number };
    positioning: 'low' | 'competitive' | 'premium';
    advantages: string[];
  };
}

export interface PricingDatabase {
  lastUpdated: Date;
  region: string;
  materials: Map<string, MaterialCost>;
  labor: Map<string, LaborRate>;
  equipment: Map<string, EquipmentCost>;
  marketFactors: {
    inflation: number;
    fuelIndex: number;
    laborIndex: number;
    materialIndex: number;
    seasonalAdjustment: number;
  };
  competitors: Array<{
    name: string;
    averageMarkup: number;
    strengths: string[];
    weaknesses: string[];
  }>;
}

export class ComprehensiveEstimateEngine extends EventEmitter {
  private projects: Map<string, EstimateProject> = new Map();
  private pricingDatabase: PricingDatabase;
  private costCalculators: Map<string, Function> = new Map();
  private templates: Map<string, any> = new Map();

  constructor() {
    super();
    this.initializePricingDatabase();
    this.initializeCostCalculators();
    this.initializeTemplates();
  }

  private initializePricingDatabase(): void {
    this.pricingDatabase = {
      lastUpdated: new Date(),
      region: 'Virginia',
      materials: new Map(),
      labor: new Map(),
      equipment: new Map(),
      marketFactors: {
        inflation: 3.2,
        fuelIndex: 1.15,
        laborIndex: 1.08,
        materialIndex: 1.12,
        seasonalAdjustment: 1.0
      },
      competitors: [
        {
          name: 'Local Competitor A',
          averageMarkup: 15,
          strengths: ['Price competitive', 'Local reputation'],
          weaknesses: ['Limited equipment', 'Slower completion']
        }
      ]
    };

    // Initialize material costs
    this.addMaterialCosts();
    this.addLaborRates();
    this.addEquipmentCosts();
  }

  private addMaterialCosts(): void {
    const materials: MaterialCost[] = [
      {
        id: 'asphalt_sm95a',
        name: 'Asphalt Mix SM-9.5A',
        type: 'asphalt',
        category: 'Hot Mix Asphalt',
        unit: 'ton',
        baseUnitCost: 85.00,
        currentUnitCost: 92.50,
        supplier: 'Virginia Asphalt Co.',
        lastUpdated: new Date(),
        availability: 'in_stock',
        minimumOrder: 10,
        bulkDiscounts: [
          { quantity: 50, discount: 2 },
          { quantity: 100, discount: 4 },
          { quantity: 500, discount: 6 }
        ],
        seasonalPricing: [
          { season: 'spring', adjustment: 0 },
          { season: 'summer', adjustment: 5 },
          { season: 'fall', adjustment: -2 },
          { season: 'winter', adjustment: 8 }
        ],
        specifications: {
          grade: 'SM-9.5A',
          density: 145, // lbs per cubic foot
          coverage: 110 // square feet per ton at 1 inch
        },
        environmental: {
          ecoFriendly: false,
          voc: 0,
          recycledContent: 15
        }
      },
      {
        id: 'sealcoat_premium',
        name: 'Premium Coal Tar Sealcoat',
        type: 'sealcoat',
        category: 'Surface Treatment',
        unit: 'gallon',
        baseUnitCost: 3.25,
        currentUnitCost: 3.85,
        supplier: 'SealMaster Distributors',
        lastUpdated: new Date(),
        availability: 'in_stock',
        minimumOrder: 55,
        bulkDiscounts: [
          { quantity: 275, discount: 3 },
          { quantity: 550, discount: 5 }
        ],
        seasonalPricing: [
          { season: 'spring', adjustment: 8 },
          { season: 'summer', adjustment: 12 },
          { season: 'fall', adjustment: 5 },
          { season: 'winter', adjustment: -10 }
        ],
        specifications: {
          coverage: 80, // square feet per gallon
          viscosity: 'Standard',
          temperature: { min: 50, max: 85 }
        },
        environmental: {
          ecoFriendly: false,
          voc: 2.1,
          recycledContent: 0
        }
      },
      {
        id: 'aggregate_base',
        name: '21A Crushed Stone Base',
        type: 'aggregate',
        category: 'Base Material',
        unit: 'ton',
        baseUnitCost: 18.50,
        currentUnitCost: 21.75,
        supplier: 'Blue Ridge Quarry',
        lastUpdated: new Date(),
        availability: 'in_stock',
        minimumOrder: 25,
        bulkDiscounts: [
          { quantity: 100, discount: 5 },
          { quantity: 500, discount: 8 }
        ],
        seasonalPricing: [
          { season: 'spring', adjustment: 2 },
          { season: 'summer', adjustment: 0 },
          { season: 'fall', adjustment: 0 },
          { season: 'winter', adjustment: 15 }
        ],
        specifications: {
          grade: '21A',
          density: 120, // lbs per cubic foot
          coverage: 100 // square feet per ton at 1 inch
        },
        environmental: {
          ecoFriendly: true,
          voc: 0,
          recycledContent: 30
        }
      },
      {
        id: 'striping_paint',
        name: 'Water-Based Traffic Paint',
        type: 'paint',
        category: 'Marking Materials',
        unit: 'gallon',
        baseUnitCost: 48.00,
        currentUnitCost: 52.80,
        supplier: 'Traffic Paint Supply',
        lastUpdated: new Date(),
        availability: 'in_stock',
        minimumOrder: 5,
        bulkDiscounts: [
          { quantity: 25, discount: 4 },
          { quantity: 55, discount: 7 }
        ],
        seasonalPricing: [
          { season: 'spring', adjustment: 5 },
          { season: 'summer', adjustment: 8 },
          { season: 'fall', adjustment: 3 },
          { season: 'winter', adjustment: -5 }
        ],
        specifications: {
          coverage: 640, // linear feet per gallon at 4" width
          viscosity: 'Standard',
          temperature: { min: 40, max: 95 }
        },
        environmental: {
          ecoFriendly: true,
          voc: 0.8,
          recycledContent: 0
        }
      }
    ];

    materials.forEach(material => {
      this.pricingDatabase.materials.set(material.id, material);
    });
  }

  private addLaborRates(): void {
    const laborRates: LaborRate[] = [
      {
        id: 'paving_operator',
        role: 'Paving Machine Operator',
        category: 'skilled',
        baseHourlyRate: 32.00,
        currentHourlyRate: 35.50,
        overtime: { threshold: 8, multiplier: 1.5 },
        benefits: {
          healthInsurance: 8.50,
          workersComp: 4.20,
          unemployment: 0.60,
          socialSecurity: 2.20,
          medicare: 0.51,
          retirement: 3.20
        },
        productivity: {
          standard: 1500, // square feet per hour
          experience: 'experienced',
          efficiency: 1.1
        },
        certifications: ['Heavy Equipment Operation', 'Safety Training'],
        union: false
      },
      {
        id: 'roller_operator',
        role: 'Roller Operator',
        category: 'skilled',
        baseHourlyRate: 28.50,
        currentHourlyRate: 31.25,
        overtime: { threshold: 8, multiplier: 1.5 },
        benefits: {
          healthInsurance: 8.50,
          workersComp: 4.20,
          unemployment: 0.60,
          socialSecurity: 1.94,
          medicare: 0.45,
          retirement: 2.80
        },
        productivity: {
          standard: 2000,
          experience: 'experienced',
          efficiency: 1.0
        },
        certifications: ['Heavy Equipment Operation'],
        union: false
      },
      {
        id: 'general_laborer',
        role: 'General Laborer',
        category: 'general',
        baseHourlyRate: 18.50,
        currentHourlyRate: 20.75,
        overtime: { threshold: 8, multiplier: 1.5 },
        benefits: {
          healthInsurance: 8.50,
          workersComp: 3.80,
          unemployment: 0.60,
          socialSecurity: 1.29,
          medicare: 0.30,
          retirement: 1.85
        },
        productivity: {
          standard: 500,
          experience: 'novice',
          efficiency: 0.8
        },
        certifications: ['Safety Training'],
        union: false
      },
      {
        id: 'truck_driver',
        role: 'Truck Driver',
        category: 'skilled',
        baseHourlyRate: 24.00,
        currentHourlyRate: 26.50,
        overtime: { threshold: 8, multiplier: 1.5 },
        benefits: {
          healthInsurance: 8.50,
          workersComp: 3.20,
          unemployment: 0.60,
          socialSecurity: 1.64,
          medicare: 0.38,
          retirement: 2.40
        },
        productivity: {
          standard: 8, // loads per day
          experience: 'experienced',
          efficiency: 1.0
        },
        certifications: ['CDL', 'DOT Physical', 'Safety Training'],
        union: false
      }
    ];

    laborRates.forEach(rate => {
      this.pricingDatabase.labor.set(rate.id, rate);
    });
  }

  private addEquipmentCosts(): void {
    const equipment: EquipmentCost[] = [
      {
        id: 'asphalt_paver_large',
        name: 'Large Asphalt Paver (12-16 ft)',
        type: 'paver',
        size: 'Large',
        hourlyRate: 285.00,
        dailyRate: 2280.00,
        weeklyRate: 11400.00,
        operatorRequired: true,
        operatorRate: 35.50,
        fuelConsumption: 8.5,
        maintenance: {
          costPerHour: 15.20,
          majorService: { hours: 500, cost: 8500 }
        },
        transportation: {
          mobilization: 850.00,
          demobilization: 850.00,
          dailyTransport: 125.00
        },
        productivity: {
          capacity: 1500, // square feet per hour
          efficiency: 0.85,
          conditions: {
            ideal: 1.0,
            normal: 0.85,
            difficult: 0.65,
            extreme: 0.45
          }
        }
      },
      {
        id: 'steel_wheel_roller',
        name: 'Steel Wheel Roller (10-12 ton)',
        type: 'roller',
        size: 'Medium',
        hourlyRate: 165.00,
        dailyRate: 1320.00,
        weeklyRate: 6600.00,
        operatorRequired: true,
        operatorRate: 31.25,
        fuelConsumption: 6.2,
        maintenance: {
          costPerHour: 8.50,
          majorService: { hours: 750, cost: 4200 }
        },
        transportation: {
          mobilization: 450.00,
          demobilization: 450.00,
          dailyTransport: 85.00
        },
        productivity: {
          capacity: 2500,
          efficiency: 0.90,
          conditions: {
            ideal: 1.0,
            normal: 0.90,
            difficult: 0.75,
            extreme: 0.55
          }
        }
      },
      {
        id: 'distributor_truck',
        name: 'Asphalt Distributor Truck',
        type: 'distributor',
        size: 'Standard',
        hourlyRate: 225.00,
        dailyRate: 1800.00,
        weeklyRate: 9000.00,
        operatorRequired: true,
        operatorRate: 28.50,
        fuelConsumption: 12.5,
        maintenance: {
          costPerHour: 12.75,
          majorService: { hours: 400, cost: 6800 }
        },
        transportation: {
          mobilization: 650.00,
          demobilization: 650.00,
          dailyTransport: 95.00
        },
        productivity: {
          capacity: 3000, // square feet per hour
          efficiency: 0.80,
          conditions: {
            ideal: 1.0,
            normal: 0.80,
            difficult: 0.60,
            extreme: 0.40
          }
        }
      },
      {
        id: 'dump_truck',
        name: 'Dump Truck (15-20 yard)',
        type: 'truck',
        size: 'Large',
        hourlyRate: 95.00,
        dailyRate: 760.00,
        weeklyRate: 3800.00,
        operatorRequired: true,
        operatorRate: 26.50,
        fuelConsumption: 8.0,
        maintenance: {
          costPerHour: 6.25,
          majorService: { hours: 1000, cost: 3500 }
        },
        transportation: {
          mobilization: 125.00,
          demobilization: 125.00
        },
        productivity: {
          capacity: 6, // loads per day
          efficiency: 0.85,
          conditions: {
            ideal: 1.0,
            normal: 0.85,
            difficult: 0.70,
            extreme: 0.50
          }
        }
      }
    ];

    equipment.forEach(equip => {
      this.pricingDatabase.equipment.set(equip.id, equip);
    });
  }

  private initializeCostCalculators(): void {
    // Asphalt paving calculator
    this.costCalculators.set('asphalt_paving', (measurements: ProjectMeasurements, specifications: any) => {
      const area = measurements.area;
      const thickness = specifications.thickness || 2;
      const asphaltType = specifications.asphaltType || 'asphalt_sm95a';
      
      // Material calculations
      const volume = (area * thickness) / 12; // cubic feet
      const tons = (volume * 145) / 2000; // Convert to tons (145 lbs/cf)
      const asphaltMaterial = this.pricingDatabase.materials.get(asphaltType);
      const materialCost = tons * (asphaltMaterial?.currentUnitCost || 90);

      // Labor calculations
      const laborHours = area / 1200; // 1200 sf per hour average
      const paverOperator = this.pricingDatabase.labor.get('paving_operator');
      const laborCost = laborHours * (paverOperator?.currentHourlyRate || 35);

      // Equipment calculations
      const paver = this.pricingDatabase.equipment.get('asphalt_paver_large');
      const roller = this.pricingDatabase.equipment.get('steel_wheel_roller');
      const equipmentCost = laborHours * ((paver?.hourlyRate || 285) + (roller?.hourlyRate || 165));

      return {
        materials: materialCost,
        labor: laborCost,
        equipment: equipmentCost,
        total: materialCost + laborCost + equipmentCost
      };
    });

    // Sealcoating calculator
    this.costCalculators.set('sealcoating', (measurements: ProjectMeasurements, specifications: any) => {
      const area = measurements.area;
      const coats = specifications.coats || 1;
      const material = this.pricingDatabase.materials.get('sealcoat_premium');
      
      const gallons = (area * coats) / (material?.specifications.coverage || 80);
      const materialCost = gallons * (material?.currentUnitCost || 3.85);
      
      const laborHours = area / 2000; // 2000 sf per hour
      const laborer = this.pricingDatabase.labor.get('general_laborer');
      const laborCost = laborHours * (laborer?.currentHourlyRate || 20);

      const distributor = this.pricingDatabase.equipment.get('distributor_truck');
      const equipmentCost = laborHours * (distributor?.hourlyRate || 225);

      return {
        materials: materialCost,
        labor: laborCost,
        equipment: equipmentCost,
        total: materialCost + laborCost + equipmentCost
      };
    });

    // Parking lot calculator
    this.costCalculators.set('parking_lot', (measurements: ProjectMeasurements, specifications: any) => {
      const area = measurements.area;
      const excavationDepth = specifications.excavationDepth || 8;
      const baseThickness = specifications.baseThickness || 6;
      const asphaltThickness = specifications.asphaltThickness || 3;

      // Excavation
      const excavationVolume = (area * excavationDepth) / 12;
      const excavationCost = excavationVolume * 2.50; // per cubic foot

      // Base material
      const baseVolume = (area * baseThickness) / 12;
      const baseTons = (baseVolume * 120) / 2000;
      const baseMaterial = this.pricingDatabase.materials.get('aggregate_base');
      const baseCost = baseTons * (baseMaterial?.currentUnitCost || 21.75);

      // Asphalt
      const asphaltVolume = (area * asphaltThickness) / 12;
      const asphaltTons = (asphaltVolume * 145) / 2000;
      const asphaltMaterial = this.pricingDatabase.materials.get('asphalt_sm95a');
      const asphaltCost = asphaltTons * (asphaltMaterial?.currentUnitCost || 92.50);

      // Labor (comprehensive)
      const totalLaborHours = (area / 800) + (area / 1200) + (area / 2500); // excavation + paving + finishing
      const averageLaborRate = 28.50;
      const laborCost = totalLaborHours * averageLaborRate;

      // Equipment (comprehensive)
      const equipmentHours = totalLaborHours;
      const averageEquipmentRate = 185.00;
      const equipmentCost = equipmentHours * averageEquipmentRate;

      return {
        excavation: excavationCost,
        base: baseCost,
        asphalt: asphaltCost,
        labor: laborCost,
        equipment: equipmentCost,
        total: excavationCost + baseCost + asphaltCost + laborCost + equipmentCost
      };
    });
  }

  private initializeTemplates(): void {
    // Standard estimate templates
    this.templates.set('asphalt_paving', {
      name: 'Asphalt Paving Estimate',
      sections: ['materials', 'labor', 'equipment', 'overhead', 'profit'],
      defaultMarkup: 15,
      defaultOverhead: 12,
      riskFactors: { weather: 1.05, material: 1.03, labor: 1.02 }
    });

    this.templates.set('sealcoating', {
      name: 'Sealcoating Estimate',
      sections: ['materials', 'labor', 'equipment', 'overhead', 'profit'],
      defaultMarkup: 25,
      defaultOverhead: 10,
      riskFactors: { weather: 1.15, material: 1.02, labor: 1.01 }
    });
  }

  // Main estimation methods
  async createEstimate(projectData: Omit<EstimateProject, 'id' | 'created' | 'lastModified' | 'costBreakdown'>): Promise<string> {
    const projectId = `estimate_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const project: EstimateProject = {
      ...projectData,
      id: projectId,
      created: new Date(),
      lastModified: new Date(),
      costBreakdown: await this.calculateCostBreakdown(projectData.type, projectData.measurements, projectData.specifications)
    };

    this.projects.set(projectId, project);
    this.emit('estimateCreated', { projectId, type: project.type });
    
    return projectId;
  }

  async calculateCostBreakdown(projectType: string, measurements: ProjectMeasurements, specifications: any): Promise<CostBreakdown> {
    const calculator = this.costCalculators.get(projectType);
    if (!calculator) {
      throw new Error(`No calculator found for project type: ${projectType}`);
    }

    const baseCosts = calculator(measurements, specifications);
    
    // Apply market factors
    const adjustedCosts = this.applyMarketFactors(baseCosts);
    
    // Build detailed cost breakdown
    const costBreakdown: CostBreakdown = {
      materials: {
        subtotal: adjustedCosts.materials || 0,
        tax: (adjustedCosts.materials || 0) * 0.053, // 5.3% VA sales tax
        waste: (adjustedCosts.materials || 0) * 0.05, // 5% waste factor
        total: 0,
        items: []
      },
      labor: {
        direct: adjustedCosts.labor || 0,
        benefits: (adjustedCosts.labor || 0) * 0.35, // 35% benefits burden
        overtime: 0,
        total: 0,
        items: []
      },
      equipment: {
        rental: adjustedCosts.equipment || 0,
        operation: (adjustedCosts.equipment || 0) * 0.25, // fuel and operation
        transport: (adjustedCosts.equipment || 0) * 0.10, // transportation
        total: 0,
        items: []
      },
      subcontractors: {
        subtotal: 0,
        total: 0,
        items: []
      },
      overhead: {
        general: 0,
        administrative: 0,
        insurance: 0,
        bonding: 0,
        total: 0
      },
      profit: {
        rate: 15, // 15% profit margin
        amount: 0
      },
      contingency: {
        rate: 8, // 8% contingency
        amount: 0
      },
      totals: {
        subtotal: 0,
        overhead: 0,
        profit: 0,
        contingency: 0,
        total: 0
      }
    };

    // Calculate totals
    costBreakdown.materials.total = costBreakdown.materials.subtotal + 
                                   costBreakdown.materials.tax + 
                                   costBreakdown.materials.waste;

    costBreakdown.labor.total = costBreakdown.labor.direct + 
                               costBreakdown.labor.benefits + 
                               costBreakdown.labor.overtime;

    costBreakdown.equipment.total = costBreakdown.equipment.rental + 
                                   costBreakdown.equipment.operation + 
                                   costBreakdown.equipment.transport;

    const directCosts = costBreakdown.materials.total + 
                       costBreakdown.labor.total + 
                       costBreakdown.equipment.total + 
                       costBreakdown.subcontractors.total;

    // Calculate overhead (12% of direct costs)
    costBreakdown.overhead.general = directCosts * 0.08;
    costBreakdown.overhead.administrative = directCosts * 0.03;
    costBreakdown.overhead.insurance = directCosts * 0.006;
    costBreakdown.overhead.bonding = directCosts * 0.004;
    costBreakdown.overhead.total = costBreakdown.overhead.general + 
                                  costBreakdown.overhead.administrative + 
                                  costBreakdown.overhead.insurance + 
                                  costBreakdown.overhead.bonding;

    costBreakdown.totals.subtotal = directCosts;
    costBreakdown.totals.overhead = costBreakdown.overhead.total;

    // Calculate profit
    const costsWithOverhead = directCosts + costBreakdown.overhead.total;
    costBreakdown.profit.amount = costsWithOverhead * (costBreakdown.profit.rate / 100);
    costBreakdown.totals.profit = costBreakdown.profit.amount;

    // Calculate contingency
    const costsWithProfit = costsWithOverhead + costBreakdown.profit.amount;
    costBreakdown.contingency.amount = costsWithProfit * (costBreakdown.contingency.rate / 100);
    costBreakdown.totals.contingency = costBreakdown.contingency.amount;

    // Final total
    costBreakdown.totals.total = costsWithProfit + costBreakdown.contingency.amount;

    return costBreakdown;
  }

  private applyMarketFactors(baseCosts: any): any {
    const factors = this.pricingDatabase.marketFactors;
    
    return {
      materials: (baseCosts.materials || 0) * factors.materialIndex * factors.seasonalAdjustment,
      labor: (baseCosts.labor || 0) * factors.laborIndex,
      equipment: (baseCosts.equipment || 0) * factors.fuelIndex,
      excavation: baseCosts.excavation || 0,
      base: baseCosts.base || 0,
      asphalt: baseCosts.asphalt || 0
    };
  }

  async updatePricing(materialId?: string, laborId?: string, equipmentId?: string): Promise<void> {
    // Simulate real-time pricing updates
    if (materialId && this.pricingDatabase.materials.has(materialId)) {
      const material = this.pricingDatabase.materials.get(materialId)!;
      // Simulate price fluctuation ±5%
      const fluctuation = (Math.random() - 0.5) * 0.1; // ±5%
      material.currentUnitCost = material.baseUnitCost * (1 + fluctuation);
      material.lastUpdated = new Date();
    }

    this.pricingDatabase.lastUpdated = new Date();
    this.emit('pricingUpdated', { materialId, laborId, equipmentId });
  }

  generateDetailedEstimate(projectId: string): string {
    const project = this.projects.get(projectId);
    if (!project) {
      throw new Error(`Project ${projectId} not found`);
    }

    let report = `# DETAILED CONSTRUCTION ESTIMATE\n\n`;
    report += `**Project:** ${project.name}\n`;
    report += `**Type:** ${project.type.replace('_', ' ').toUpperCase()}\n`;
    report += `**Date:** ${project.timeline.estimateDate.toLocaleDateString()}\n`;
    report += `**Valid Until:** ${project.timeline.validUntil.toLocaleDateString()}\n\n`;

    report += `## CLIENT INFORMATION\n`;
    report += `**Name:** ${project.client.name}\n`;
    report += `**Contact:** ${project.client.contact}\n`;
    report += `**Phone:** ${project.client.phone}\n`;
    report += `**Email:** ${project.client.email}\n\n`;

    report += `## PROJECT LOCATION\n`;
    report += `${project.location.address}\n`;
    report += `${project.location.city}, ${project.location.state} ${project.location.zipCode}\n\n`;

    report += `## PROJECT MEASUREMENTS\n`;
    report += `**Area:** ${project.measurements.area.toLocaleString()} sq ft\n`;
    if (project.measurements.perimeter) {
      report += `**Perimeter:** ${project.measurements.perimeter.toLocaleString()} lin ft\n`;
    }
    if (project.measurements.thickness) {
      report += `**Thickness:** ${project.measurements.thickness}" inches\n`;
    }
    if (project.measurements.volume) {
      report += `**Volume:** ${project.measurements.volume.toLocaleString()} cu ft\n`;
    }
    report += `**Access Difficulty:** ${project.measurements.accessDifficulty}\n\n`;

    report += `## COST BREAKDOWN\n\n`;

    // Materials section
    report += `### MATERIALS\n`;
    report += `| Item | Quantity | Unit | Unit Cost | Total |\n`;
    report += `|------|----------|------|-----------|-------|\n`;
    report += `| Subtotal | | | | $${project.costBreakdown.materials.subtotal.toLocaleString()} |\n`;
    report += `| Tax (5.3%) | | | | $${project.costBreakdown.materials.tax.toLocaleString()} |\n`;
    report += `| Waste (5%) | | | | $${project.costBreakdown.materials.waste.toLocaleString()} |\n`;
    report += `| **Materials Total** | | | | **$${project.costBreakdown.materials.total.toLocaleString()}** |\n\n`;

    // Labor section
    report += `### LABOR\n`;
    report += `| Role | Hours | Rate | Benefits | Total |\n`;
    report += `|------|-------|------|----------|-------|\n`;
    report += `| Direct Labor | | | | $${project.costBreakdown.labor.direct.toLocaleString()} |\n`;
    report += `| Benefits (35%) | | | | $${project.costBreakdown.labor.benefits.toLocaleString()} |\n`;
    report += `| **Labor Total** | | | | **$${project.costBreakdown.labor.total.toLocaleString()}** |\n\n`;

    // Equipment section
    report += `### EQUIPMENT\n`;
    report += `| Equipment | Hours | Rate | Operation | Transport | Total |\n`;
    report += `|-----------|-------|------|-----------|-----------|-------|\n`;
    report += `| Rental | | | | | $${project.costBreakdown.equipment.rental.toLocaleString()} |\n`;
    report += `| Operation | | | | | $${project.costBreakdown.equipment.operation.toLocaleString()} |\n`;
    report += `| Transport | | | | | $${project.costBreakdown.equipment.transport.toLocaleString()} |\n`;
    report += `| **Equipment Total** | | | | | **$${project.costBreakdown.equipment.total.toLocaleString()}** |\n\n`;

    // Summary
    report += `## PROJECT SUMMARY\n\n`;
    report += `| Category | Amount |\n`;
    report += `|----------|--------|\n`;
    report += `| Direct Costs | $${project.costBreakdown.totals.subtotal.toLocaleString()} |\n`;
    report += `| Overhead (12%) | $${project.costBreakdown.totals.overhead.toLocaleString()} |\n`;
    report += `| Profit (${project.costBreakdown.profit.rate}%) | $${project.costBreakdown.totals.profit.toLocaleString()} |\n`;
    report += `| Contingency (${project.costBreakdown.contingency.rate}%) | $${project.costBreakdown.totals.contingency.toLocaleString()} |\n`;
    report += `| **TOTAL PROJECT COST** | **$${project.costBreakdown.totals.total.toLocaleString()}** |\n\n`;

    // Risk analysis
    report += `## RISK ANALYSIS\n`;
    report += `**Overall Risk Level:** ${project.riskAnalysis.overallRisk.toUpperCase()}\n\n`;
    report += `**Risk Factors:**\n`;
    report += `- Weather Risk: ${(project.riskAnalysis.weatherRisk * 100).toFixed(1)}%\n`;
    report += `- Material Risk: ${(project.riskAnalysis.materialRisk * 100).toFixed(1)}%\n`;
    report += `- Labor Risk: ${(project.riskAnalysis.laborRisk * 100).toFixed(1)}%\n`;
    report += `- Schedule Risk: ${(project.riskAnalysis.scheduleRisk * 100).toFixed(1)}%\n\n`;

    if (project.riskAnalysis.mitigation.length > 0) {
      report += `**Risk Mitigation Strategies:**\n`;
      project.riskAnalysis.mitigation.forEach(strategy => {
        report += `- ${strategy}\n`;
      });
    }

    // Timeline
    report += `\n## PROJECT TIMELINE\n`;
    report += `**Proposed Start Date:** ${project.timeline.proposedStart.toLocaleDateString()}\n`;
    report += `**Proposed Completion:** ${project.timeline.proposedCompletion.toLocaleDateString()}\n`;
    report += `**Estimate Valid Until:** ${project.timeline.validUntil.toLocaleDateString()}\n\n`;

    // Terms and conditions
    report += `## TERMS AND CONDITIONS\n`;
    report += `1. Prices subject to change if work is delayed beyond estimate validity period\n`;
    report += `2. Additional charges may apply for unforeseen site conditions\n`;
    report += `3. All work performed in accordance with Virginia building codes\n`;
    report += `4. Weather delays may affect schedule\n`;
    report += `5. Final payment due upon completion and acceptance\n`;

    return report;
  }

  getProject(projectId: string): EstimateProject | undefined {
    return this.projects.get(projectId);
  }

  getAllProjects(): EstimateProject[] {
    return Array.from(this.projects.values());
  }

  getPricingDatabase(): PricingDatabase {
    return { ...this.pricingDatabase };
  }

  async performMarketAnalysis(projectType: string, estimatedCost: number): Promise<any> {
    // Simulate competitive market analysis
    const basePrice = estimatedCost;
    const marketRange = {
      low: basePrice * 0.85,
      average: basePrice * 0.95,
      high: basePrice * 1.15
    };

    const positioning = estimatedCost <= marketRange.average ? 'competitive' : 
                       estimatedCost <= marketRange.high ? 'premium' : 'high';

    return {
      marketRange,
      positioning,
      competitiveAdvantages: [
        'Licensed and insured Virginia contractor',
        'High-quality materials and workmanship',
        'Comprehensive warranty coverage',
        'Experienced team with local knowledge'
      ],
      recommendations: positioning === 'high' ? 
        ['Consider value engineering options', 'Review material specifications', 'Optimize labor efficiency'] :
        ['Maintain competitive pricing', 'Emphasize quality differentiators']
    };
  }
}

export default ComprehensiveEstimateEngine;