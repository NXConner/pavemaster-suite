import { EventEmitter } from 'events';

export interface KnowledgeCategory {
  id: string;
  name: string;
  description: string;
  parentCategory?: string;
  subcategories: string[];
  icon: string;
  color: string;
  accessLevel: 'public' | 'internal' | 'restricted';
}

export interface KnowledgeFormula {
  id: string;
  name: string;
  description: string;
  category: string;
  formula: string;
  variables: Array<{
    name: string;
    description: string;
    unit: string;
    type: 'number' | 'text' | 'boolean' | 'select';
    defaultValue?: any;
    options?: string[];
    validation?: {
      min?: number;
      max?: number;
      required?: boolean;
    };
  }>;
  examples: Array<{
    title: string;
    inputs: Record<string, any>;
    output: any;
    explanation: string;
  }>;
  references: string[];
  lastUpdated: Date;
  accuracy: 'exact' | 'approximate' | 'estimate';
  industry: 'construction' | 'asphalt' | 'sealcoating' | 'general';
}

export interface KnowledgeCalculation {
  id: string;
  name: string;
  description: string;
  category: string;
  type: 'formula' | 'table' | 'calculator' | 'converter';
  inputs: Array<{
    id: string;
    label: string;
    type: 'number' | 'select' | 'checkbox' | 'text';
    unit?: string;
    required: boolean;
    defaultValue?: any;
    options?: Array<{ value: any; label: string }>;
    validation?: {
      min?: number;
      max?: number;
      pattern?: string;
    };
  }>;
  outputs: Array<{
    id: string;
    label: string;
    unit?: string;
    format?: 'currency' | 'percentage' | 'decimal' | 'integer';
    precision?: number;
  }>;
  calculationLogic: string; // JavaScript function as string
  conversionFactors?: Record<string, number>;
  lookupTables?: Record<string, any>;
  relatedCalculations: string[];
}

export interface KnowledgeDocument {
  id: string;
  title: string;
  content: string;
  type: 'procedure' | 'specification' | 'regulation' | 'best_practice' | 'troubleshooting' | 'reference';
  category: string;
  tags: string[];
  format: 'markdown' | 'html' | 'pdf' | 'video' | 'image';
  author: string;
  created: Date;
  lastModified: Date;
  version: string;
  status: 'draft' | 'review' | 'approved' | 'archived';
  attachments: Array<{
    id: string;
    name: string;
    url: string;
    type: string;
    size: number;
  }>;
  relatedDocuments: string[];
  accessCount: number;
  ratings: Array<{
    userId: string;
    rating: number;
    comment?: string;
    date: Date;
  }>;
}

export interface KnowledgeDataSet {
  id: string;
  name: string;
  description: string;
  category: string;
  type: 'material_properties' | 'cost_data' | 'performance_metrics' | 'historical_data' | 'benchmarks';
  structure: 'table' | 'json' | 'csv' | 'xml';
  data: any;
  schema: Record<string, {
    type: string;
    description: string;
    unit?: string;
    constraints?: any;
  }>;
  lastUpdated: Date;
  source: string;
  reliability: 'high' | 'medium' | 'low';
  updateFrequency: 'real_time' | 'daily' | 'weekly' | 'monthly' | 'annual' | 'static';
}

export interface SearchQuery {
  text: string;
  category?: string;
  type?: string;
  tags?: string[];
  dateRange?: { from: Date; to: Date };
  author?: string;
  industry?: string;
  exactMatch?: boolean;
}

export interface SearchResult {
  item: KnowledgeFormula | KnowledgeCalculation | KnowledgeDocument | KnowledgeDataSet;
  type: 'formula' | 'calculation' | 'document' | 'dataset';
  relevanceScore: number;
  matchedFields: string[];
  highlights: string[];
}

export class UniversalKnowledgeBase extends EventEmitter {
  private categories: Map<string, KnowledgeCategory> = new Map();
  private formulas: Map<string, KnowledgeFormula> = new Map();
  private calculations: Map<string, KnowledgeCalculation> = new Map();
  private documents: Map<string, KnowledgeDocument> = new Map();
  private datasets: Map<string, KnowledgeDataSet> = new Map();
  private searchIndex: Map<string, Set<string>> = new Map();
  private recentlyAccessed: Array<{ id: string; type: string; timestamp: Date }> = [];

  constructor() {
    super();
    this.initializeStandardKnowledge();
    this.buildSearchIndex();
  }

  private initializeStandardKnowledge(): void {
    this.initializeCategories();
    this.initializeFormulas();
    this.initializeCalculations();
    this.initializeDocuments();
    this.initializeDataSets();
  }

  private initializeCategories(): void {
    const categories: KnowledgeCategory[] = [
      {
        id: 'asphalt',
        name: 'Asphalt & Paving',
        description: 'Knowledge related to asphalt materials, paving processes, and quality control',
        subcategories: ['materials', 'equipment', 'procedures', 'quality_control'],
        icon: 'road',
        color: '#2563eb',
        accessLevel: 'public'
      },
      {
        id: 'sealcoating',
        name: 'Sealcoating',
        description: 'Surface treatments, sealcoating materials, and application methods',
        subcategories: ['materials', 'application', 'weather', 'maintenance'],
        icon: 'paint-brush',
        color: '#dc2626',
        accessLevel: 'public'
      },
      {
        id: 'calculations',
        name: 'Calculations & Formulas',
        description: 'Mathematical formulas and calculation methods for construction projects',
        subcategories: ['area', 'volume', 'materials', 'costs', 'conversions'],
        icon: 'calculator',
        color: '#059669',
        accessLevel: 'public'
      },
      {
        id: 'regulations',
        name: 'Regulations & Standards',
        description: 'Building codes, industry standards, and regulatory requirements',
        subcategories: ['virginia_codes', 'federal_standards', 'ada_compliance', 'environmental'],
        icon: 'shield-check',
        color: '#7c3aed',
        accessLevel: 'public'
      },
      {
        id: 'equipment',
        name: 'Equipment & Machinery',
        description: 'Construction equipment specifications, operation, and maintenance',
        subcategories: ['pavers', 'rollers', 'trucks', 'maintenance', 'safety'],
        icon: 'truck',
        color: '#ea580c',
        accessLevel: 'internal'
      },
      {
        id: 'procedures',
        name: 'Procedures & Best Practices',
        description: 'Step-by-step procedures and industry best practices',
        subcategories: ['preparation', 'installation', 'quality_control', 'safety', 'cleanup'],
        icon: 'clipboard-list',
        color: '#0891b2',
        accessLevel: 'internal'
      }
    ];

    categories.forEach(category => {
      this.categories.set(category.id, category);
    });
  }

  private initializeFormulas(): void {
    const formulas: KnowledgeFormula[] = [
      {
        id: 'asphalt_tonnage',
        name: 'Asphalt Tonnage Calculation',
        description: 'Calculate the amount of asphalt needed in tons based on area and thickness',
        category: 'calculations',
        formula: '(area * thickness * density) / (12 * 2000)',
        variables: [
          {
            name: 'area',
            description: 'Total area to be paved',
            unit: 'square feet',
            type: 'number',
            validation: { min: 1, required: true }
          },
          {
            name: 'thickness',
            description: 'Asphalt thickness',
            unit: 'inches',
            type: 'number',
            defaultValue: 2,
            validation: { min: 0.5, max: 12, required: true }
          },
          {
            name: 'density',
            description: 'Asphalt density',
            unit: 'lbs per cubic foot',
            type: 'number',
            defaultValue: 145,
            validation: { min: 130, max: 160, required: true }
          }
        ],
        examples: [
          {
            title: 'Standard Driveway',
            inputs: { area: 1000, thickness: 2, density: 145 },
            output: 12.08,
            explanation: 'A 1000 sq ft driveway with 2" thick asphalt requires approximately 12 tons'
          },
          {
            title: 'Parking Lot',
            inputs: { area: 50000, thickness: 3, density: 145 },
            output: 906.25,
            explanation: 'A 50,000 sq ft parking lot with 3" thick asphalt requires approximately 906 tons'
          }
        ],
        references: ['AASHTO M323', 'Virginia DOT Standards'],
        lastUpdated: new Date(),
        accuracy: 'exact',
        industry: 'asphalt'
      },
      {
        id: 'sealcoat_coverage',
        name: 'Sealcoat Coverage Calculation',
        description: 'Calculate gallons of sealcoat needed based on area and application rate',
        category: 'calculations',
        formula: 'area / coverage_rate * coats',
        variables: [
          {
            name: 'area',
            description: 'Area to be sealcoated',
            unit: 'square feet',
            type: 'number',
            validation: { min: 1, required: true }
          },
          {
            name: 'coverage_rate',
            description: 'Coverage rate of sealcoat material',
            unit: 'square feet per gallon',
            type: 'number',
            defaultValue: 80,
            validation: { min: 60, max: 120, required: true }
          },
          {
            name: 'coats',
            description: 'Number of coats to apply',
            unit: 'coats',
            type: 'number',
            defaultValue: 2,
            validation: { min: 1, max: 3, required: true }
          }
        ],
        examples: [
          {
            title: 'Residential Driveway',
            inputs: { area: 800, coverage_rate: 80, coats: 2 },
            output: 20,
            explanation: 'An 800 sq ft driveway needs 20 gallons for two coats'
          }
        ],
        references: ['SealMaster Technical Guide', 'ISSA A105'],
        lastUpdated: new Date(),
        accuracy: 'approximate',
        industry: 'sealcoating'
      },
      {
        id: 'ada_parking_spaces',
        name: 'ADA Parking Space Requirements',
        description: 'Calculate required accessible parking spaces based on total spaces',
        category: 'regulations',
        formula: 'getADARequiredSpaces(total_spaces)',
        variables: [
          {
            name: 'total_spaces',
            description: 'Total number of parking spaces',
            unit: 'spaces',
            type: 'number',
            validation: { min: 1, required: true }
          }
        ],
        examples: [
          {
            title: 'Small Lot (25 spaces)',
            inputs: { total_spaces: 25 },
            output: 1,
            explanation: '1-25 spaces require 1 accessible space'
          },
          {
            title: 'Large Lot (150 spaces)',
            inputs: { total_spaces: 150 },
            output: 5,
            explanation: '101-150 spaces require 5 accessible spaces'
          }
        ],
        references: ['ADA Standards for Accessible Design', '2010 ADA Standards'],
        lastUpdated: new Date(),
        accuracy: 'exact',
        industry: 'construction'
      },
      {
        id: 'compaction_requirements',
        name: 'Soil Compaction Requirements',
        description: 'Determine compaction requirements based on soil type and load',
        category: 'procedures',
        formula: 'getCompactionRequirement(soil_type, load_type)',
        variables: [
          {
            name: 'soil_type',
            description: 'Type of soil or base material',
            unit: 'category',
            type: 'select',
            options: ['clay', 'sand', 'gravel', 'crushed_stone', 'recycled_concrete'],
            validation: { required: true }
          },
          {
            name: 'load_type',
            description: 'Expected traffic load',
            unit: 'category',
            type: 'select',
            options: ['light', 'medium', 'heavy', 'industrial'],
            validation: { required: true }
          }
        ],
        examples: [
          {
            title: 'Driveway Base',
            inputs: { soil_type: 'crushed_stone', load_type: 'light' },
            output: '95% Standard Proctor',
            explanation: 'Light traffic areas require 95% compaction'
          }
        ],
        references: ['ASTM D698', 'Virginia DOT Road Design Manual'],
        lastUpdated: new Date(),
        accuracy: 'exact',
        industry: 'construction'
      }
    ];

    formulas.forEach(formula => {
      this.formulas.set(formula.id, formula);
    });
  }

  private initializeCalculations(): void {
    const calculations: KnowledgeCalculation[] = [
      {
        id: 'material_cost_calculator',
        name: 'Material Cost Calculator',
        description: 'Calculate total material costs including waste and tax',
        category: 'calculations',
        type: 'calculator',
        inputs: [
          {
            id: 'quantity',
            label: 'Quantity Needed',
            type: 'number',
            unit: 'units',
            required: true,
            validation: { min: 0 }
          },
          {
            id: 'unit_cost',
            label: 'Unit Cost',
            type: 'number',
            unit: 'dollars',
            required: true,
            validation: { min: 0 }
          },
          {
            id: 'waste_percentage',
            label: 'Waste Percentage',
            type: 'number',
            unit: '%',
            required: false,
            defaultValue: 5,
            validation: { min: 0, max: 50 }
          },
          {
            id: 'tax_rate',
            label: 'Tax Rate',
            type: 'number',
            unit: '%',
            required: false,
            defaultValue: 5.3,
            validation: { min: 0, max: 15 }
          }
        ],
        outputs: [
          {
            id: 'subtotal',
            label: 'Subtotal',
            unit: 'dollars',
            format: 'currency',
            precision: 2
          },
          {
            id: 'waste_cost',
            label: 'Waste Cost',
            unit: 'dollars',
            format: 'currency',
            precision: 2
          },
          {
            id: 'tax_amount',
            label: 'Tax Amount',
            unit: 'dollars',
            format: 'currency',
            precision: 2
          },
          {
            id: 'total_cost',
            label: 'Total Cost',
            unit: 'dollars',
            format: 'currency',
            precision: 2
          }
        ],
        calculationLogic: `
          function calculate(inputs) {
            const subtotal = inputs.quantity * inputs.unit_cost;
            const waste_cost = subtotal * (inputs.waste_percentage / 100);
            const subtotal_with_waste = subtotal + waste_cost;
            const tax_amount = subtotal_with_waste * (inputs.tax_rate / 100);
            const total_cost = subtotal_with_waste + tax_amount;
            
            return {
              subtotal,
              waste_cost,
              tax_amount,
              total_cost
            };
          }
        `,
        relatedCalculations: ['markup_calculator', 'profit_margin_calculator']
      },
      {
        id: 'unit_converter',
        name: 'Construction Unit Converter',
        description: 'Convert between common construction units',
        category: 'calculations',
        type: 'converter',
        inputs: [
          {
            id: 'value',
            label: 'Value to Convert',
            type: 'number',
            required: true,
            validation: { min: 0 }
          },
          {
            id: 'from_unit',
            label: 'From Unit',
            type: 'select',
            required: true,
            options: [
              { value: 'sq_ft', label: 'Square Feet' },
              { value: 'sq_yd', label: 'Square Yards' },
              { value: 'acres', label: 'Acres' },
              { value: 'cu_ft', label: 'Cubic Feet' },
              { value: 'cu_yd', label: 'Cubic Yards' },
              { value: 'tons', label: 'Tons' },
              { value: 'lbs', label: 'Pounds' },
              { value: 'gallons', label: 'Gallons' }
            ]
          },
          {
            id: 'to_unit',
            label: 'To Unit',
            type: 'select',
            required: true,
            options: [
              { value: 'sq_ft', label: 'Square Feet' },
              { value: 'sq_yd', label: 'Square Yards' },
              { value: 'acres', label: 'Acres' },
              { value: 'cu_ft', label: 'Cubic Feet' },
              { value: 'cu_yd', label: 'Cubic Yards' },
              { value: 'tons', label: 'Tons' },
              { value: 'lbs', label: 'Pounds' },
              { value: 'gallons', label: 'Gallons' }
            ]
          }
        ],
        outputs: [
          {
            id: 'converted_value',
            label: 'Converted Value',
            format: 'decimal',
            precision: 4
          }
        ],
        calculationLogic: `
          function calculate(inputs) {
            const conversions = {
              'sq_ft_to_sq_yd': 1/9,
              'sq_ft_to_acres': 1/43560,
              'sq_yd_to_sq_ft': 9,
              'cu_ft_to_cu_yd': 1/27,
              'cu_yd_to_cu_ft': 27,
              'tons_to_lbs': 2000,
              'lbs_to_tons': 1/2000
            };
            
            const key = inputs.from_unit + '_to_' + inputs.to_unit;
            const factor = conversions[key] || 1;
            
            return {
              converted_value: inputs.value * factor
            };
          }
        `,
        conversionFactors: {
          'sq_ft_to_sq_yd': 0.111111,
          'sq_ft_to_acres': 0.0000229568,
          'cu_ft_to_cu_yd': 0.037037,
          'tons_to_lbs': 2000,
          'gallons_to_liters': 3.78541
        },
        relatedCalculations: ['area_calculator', 'volume_calculator']
      },
      {
        id: 'project_timeline_calculator',
        name: 'Project Timeline Calculator',
        description: 'Calculate project duration based on scope and crew size',
        category: 'procedures',
        type: 'calculator',
        inputs: [
          {
            id: 'project_type',
            label: 'Project Type',
            type: 'select',
            required: true,
            options: [
              { value: 'asphalt_paving', label: 'Asphalt Paving' },
              { value: 'sealcoating', label: 'Sealcoating' },
              { value: 'parking_lot', label: 'Parking Lot Construction' },
              { value: 'crack_sealing', label: 'Crack Sealing' }
            ]
          },
          {
            id: 'area',
            label: 'Project Area',
            type: 'number',
            unit: 'sq ft',
            required: true,
            validation: { min: 1 }
          },
          {
            id: 'crew_size',
            label: 'Crew Size',
            type: 'number',
            unit: 'workers',
            required: true,
            defaultValue: 4,
            validation: { min: 1, max: 20 }
          },
          {
            id: 'weather_factor',
            label: 'Weather Risk Factor',
            type: 'select',
            required: false,
            defaultValue: 'normal',
            options: [
              { value: 'ideal', label: 'Ideal Conditions' },
              { value: 'normal', label: 'Normal Conditions' },
              { value: 'challenging', label: 'Challenging Conditions' }
            ]
          }
        ],
        outputs: [
          {
            id: 'base_duration',
            label: 'Base Duration',
            unit: 'days',
            format: 'decimal',
            precision: 1
          },
          {
            id: 'adjusted_duration',
            label: 'Weather-Adjusted Duration',
            unit: 'days',
            format: 'decimal',
            precision: 1
          },
          {
            id: 'buffer_days',
            label: 'Recommended Buffer',
            unit: 'days',
            format: 'integer'
          }
        ],
        calculationLogic: `
          function calculate(inputs) {
            const productivity = {
              asphalt_paving: 800,  // sq ft per day per worker
              sealcoating: 2000,
              parking_lot: 600,
              crack_sealing: 1200
            };
            
            const weather_factors = {
              ideal: 0.9,
              normal: 1.0,
              challenging: 1.3
            };
            
            const base_rate = productivity[inputs.project_type] || 800;
            const daily_capacity = base_rate * inputs.crew_size;
            const base_duration = inputs.area / daily_capacity;
            const weather_factor = weather_factors[inputs.weather_factor] || 1.0;
            const adjusted_duration = base_duration * weather_factor;
            const buffer_days = Math.ceil(adjusted_duration * 0.2);
            
            return {
              base_duration,
              adjusted_duration,
              buffer_days
            };
          }
        `,
        relatedCalculations: ['crew_cost_calculator', 'material_scheduling']
      }
    ];

    calculations.forEach(calculation => {
      this.calculations.set(calculation.id, calculation);
    });
  }

  private initializeDocuments(): void {
    const documents: KnowledgeDocument[] = [
      {
        id: 'virginia_paving_standards',
        title: 'Virginia Department of Transportation Paving Standards',
        content: `# VDOT Paving Standards and Specifications

## Overview
This document outlines the Virginia Department of Transportation standards for asphalt paving operations, material specifications, and quality control procedures.

## Material Specifications

### Hot Mix Asphalt (HMA)
- **SM-9.5A**: Surface mix for light to medium traffic
- **SM-12.5A**: Surface mix for medium to heavy traffic  
- **SM-19.0A**: Surface mix for heavy traffic
- **BM-25.0A**: Base mix for heavy traffic applications

### Aggregate Requirements
- Gradation must meet VDOT specifications
- Los Angeles Abrasion loss ≤ 40%
- Soundness loss ≤ 12%
- Sand equivalent ≥ 45%

### Asphalt Binder
- Performance Grade (PG) binder selection based on climate
- Virginia typically uses PG 64-22 or PG 70-22
- Recycled asphalt content up to 25% allowed

## Construction Procedures

### Weather Limitations
- Air temperature ≥ 40°F for paving operations
- No precipitation during paving
- Wind speed ≤ 25 mph
- Relative humidity ≤ 85%

### Compaction Requirements
- Initial rolling within 5 minutes of placement
- Minimum 92% theoretical maximum density
- Edge compaction critical for joint integrity

### Quality Control
- Nuclear density testing every 500 tons minimum
- Core samples for verification testing
- Temperature monitoring throughout process

## Acceptance Criteria
- Density: 92% minimum of theoretical maximum
- Thickness: ±0.2 inches of specified thickness
- Surface tolerance: ±0.02 feet from grade

## References
- VDOT Road and Bridge Specifications
- AASHTO Standards
- Virginia Administrative Code`,
        type: 'specification',
        category: 'regulations',
        tags: ['virginia', 'vdot', 'standards', 'specifications', 'quality_control'],
        format: 'markdown',
        author: 'Virginia DOT',
        created: new Date('2024-01-01'),
        lastModified: new Date(),
        version: '2024.1',
        status: 'approved',
        attachments: [],
        relatedDocuments: ['ada_compliance_guide', 'environmental_regulations'],
        accessCount: 156,
        ratings: [
          { userId: 'user1', rating: 5, comment: 'Comprehensive and up-to-date', date: new Date() }
        ]
      },
      {
        id: 'sealcoating_best_practices',
        title: 'Sealcoating Application Best Practices',
        content: `# Sealcoating Best Practices Guide

## Pre-Application Preparation

### Surface Cleaning
1. Remove all debris, oil stains, and vegetation
2. Power wash if necessary
3. Allow 24 hours drying time minimum
4. Inspect for cracks requiring filling

### Weather Conditions
- Temperature: 50°F to 85°F
- Humidity: Less than 85%
- No rain forecast for 8 hours
- Light winds preferred (< 10 mph)

### Material Preparation
- Stir sealcoat thoroughly before application
- Check viscosity and add water if needed
- Maintain consistent temperature
- Use additives as specified

## Application Techniques

### Spray Application
- Maintain consistent speed and overlap
- Use proper nozzle size for coverage rate
- Apply in thin, even coats
- Avoid pooling or heavy application

### Squeegee Application
- Use for small areas or detail work
- Maintain consistent pressure
- Work in manageable sections
- Ensure even distribution

### Two-Coat System
- Allow first coat to dry completely
- Apply second coat perpendicular to first
- Maintain consistent coverage rate
- Total application rate: 0.15-0.20 gal/sq yd

## Quality Control

### Coverage Verification
- Use coverage rate cards
- Check for uniform appearance
- Identify any missed areas
- Document application rates

### Curing Process
- Protect from traffic for minimum times:
  - Foot traffic: 4-8 hours
  - Vehicle traffic: 24-48 hours
- Monitor weather conditions
- Provide adequate ventilation

## Troubleshooting

### Common Issues
- **Tracking**: Reduce application rate, increase drying time
- **Poor Adhesion**: Improve surface cleaning, check moisture
- **Uneven Coverage**: Adjust equipment, improve technique
- **Premature Wear**: Review material quality, application rate

## Safety Considerations
- Use proper PPE
- Ensure adequate ventilation
- Keep MSDS sheets available
- Follow manufacturer guidelines
- Protect surrounding surfaces`,
        type: 'best_practice',
        category: 'sealcoating',
        tags: ['sealcoating', 'application', 'quality', 'procedures', 'troubleshooting'],
        format: 'markdown',
        author: 'Industry Expert',
        created: new Date('2024-01-15'),
        lastModified: new Date(),
        version: '1.2',
        status: 'approved',
        attachments: [
          {
            id: 'coverage_chart',
            name: 'Coverage Rate Chart.pdf',
            url: '/documents/coverage_chart.pdf',
            type: 'application/pdf',
            size: 125000
          }
        ],
        relatedDocuments: ['material_specifications', 'safety_procedures'],
        accessCount: 89,
        ratings: []
      },
      {
        id: 'cost_estimation_guide',
        title: 'Construction Cost Estimation Guide',
        content: `# Construction Cost Estimation Guide

## Estimation Fundamentals

### Cost Components
1. **Direct Costs**
   - Materials
   - Labor
   - Equipment
   - Subcontractors

2. **Indirect Costs**
   - Overhead
   - Supervision
   - Insurance
   - Permits

3. **Profit and Risk**
   - Profit margin (10-20%)
   - Contingency (5-15%)
   - Risk factors

### Estimation Methods
- **Unit Cost Method**: Cost per unit of work
- **Assembly Method**: Group related activities
- **Parametric Method**: Cost based on key parameters
- **Historical Method**: Based on similar projects

## Material Estimation

### Asphalt Quantities
\`\`\`
Tons Required = (Area × Thickness × Density) ÷ (12 × 2000)
- Area: Square feet
- Thickness: Inches  
- Density: 145 lbs/cu ft (typical)
\`\`\`

### Waste Factors
- Asphalt: 3-5%
- Aggregate: 5-8%
- Sealcoat: 2-3%
- Paint: 10-15%

## Labor Estimation

### Productivity Rates (per day)
- Asphalt paving: 800-1200 sq ft per worker
- Sealcoating: 1500-2500 sq ft per worker
- Crack sealing: 800-1200 linear feet per worker
- Line striping: 2000-3000 linear feet per worker

### Labor Burden
- Base wages: 100%
- Benefits: 30-40%
- Workers comp: 8-15%
- Taxes: 8-12%
- Total burden: 50-70%

## Equipment Costs

### Rental Rates (typical)
- Small paver: $200-300/day
- Large paver: $400-600/day
- Roller: $150-250/day
- Distributor truck: $300-450/day

### Operating Costs
- Fuel: $8-15/hour
- Maintenance: 15-25% of rental
- Operator: $25-40/hour

## Market Factors

### Regional Adjustments
- Urban vs rural: ±15%
- Labor availability: ±10%
- Material transportation: ±5%
- Competition level: ±20%

### Seasonal Factors
- Spring: High demand (+10-15%)
- Summer: Peak season (+15-20%)
- Fall: Good conditions (baseline)
- Winter: Limited work (-10% or suspended)

## Risk Assessment

### High Risk Factors
- New construction vs overlay
- Complex site conditions
- Weather-dependent work
- Material price volatility
- Tight schedules

### Contingency Guidelines
- Simple projects: 5-8%
- Standard projects: 8-12%
- Complex projects: 12-20%
- High-risk projects: 20%+

## Accuracy Levels

### Estimate Types
- **Conceptual** (±25-50%): Preliminary planning
- **Budget** (±15-25%): Funding approval
- **Definitive** (±5-15%): Bid preparation
- **Control** (±3-5%): Project execution`,
        type: 'reference',
        category: 'calculations',
        tags: ['estimating', 'costs', 'bidding', 'project_management'],
        format: 'markdown',
        author: 'Construction Estimator',
        created: new Date('2024-02-01'),
        lastModified: new Date(),
        version: '3.1',
        status: 'approved',
        attachments: [],
        relatedDocuments: ['material_cost_database', 'labor_rate_guide'],
        accessCount: 234,
        ratings: [
          { userId: 'user2', rating: 4, comment: 'Very helpful for new estimators', date: new Date() }
        ]
      }
    ];

    documents.forEach(document => {
      this.documents.set(document.id, document);
    });
  }

  private initializeDataSets(): void {
    const datasets: KnowledgeDataSet[] = [
      {
        id: 'virginia_material_costs',
        name: 'Virginia Material Cost Database',
        description: 'Current material costs for construction materials in Virginia markets',
        category: 'calculations',
        type: 'cost_data',
        structure: 'table',
        data: {
          materials: [
            {
              id: 'asphalt_sm95a',
              name: 'Hot Mix Asphalt SM-9.5A',
              unit: 'ton',
              cost: 92.50,
              region: 'Northern Virginia',
              supplier: 'Virginia Asphalt Co.',
              lastUpdated: '2024-01-15'
            },
            {
              id: 'aggregate_21a',
              name: '21A Crushed Stone',
              unit: 'ton',
              cost: 21.75,
              region: 'Statewide',
              supplier: 'Blue Ridge Quarry',
              lastUpdated: '2024-01-10'
            },
            {
              id: 'sealcoat_premium',
              name: 'Premium Coal Tar Sealcoat',
              unit: 'gallon',
              cost: 3.85,
              region: 'Statewide',
              supplier: 'SealMaster',
              lastUpdated: '2024-01-20'
            }
          ]
        },
        schema: {
          id: { type: 'string', description: 'Unique material identifier' },
          name: { type: 'string', description: 'Material name' },
          unit: { type: 'string', description: 'Unit of measure' },
          cost: { type: 'number', description: 'Cost per unit', unit: 'USD' },
          region: { type: 'string', description: 'Geographic region' },
          supplier: { type: 'string', description: 'Primary supplier' },
          lastUpdated: { type: 'date', description: 'Last price update' }
        },
        lastUpdated: new Date(),
        source: 'Market Research',
        reliability: 'high',
        updateFrequency: 'weekly'
      },
      {
        id: 'equipment_productivity',
        name: 'Equipment Productivity Database',
        description: 'Productivity rates for construction equipment under various conditions',
        category: 'equipment',
        type: 'performance_metrics',
        structure: 'table',
        data: {
          equipment: [
            {
              type: 'asphalt_paver',
              size: 'large',
              productivity: {
                ideal: 1500,
                normal: 1200,
                difficult: 900,
                extreme: 600
              },
              unit: 'sq_ft_per_hour',
              factors: {
                weather: { good: 1.0, fair: 0.85, poor: 0.65 },
                operator: { expert: 1.1, experienced: 1.0, novice: 0.8 },
                material: { new: 1.0, recycled: 0.9 }
              }
            },
            {
              type: 'sealcoat_distributor',
              size: 'standard',
              productivity: {
                ideal: 3000,
                normal: 2400,
                difficult: 1800,
                extreme: 1200
              },
              unit: 'sq_ft_per_hour',
              factors: {
                weather: { good: 1.0, fair: 0.8, poor: 0.6 },
                surface: { smooth: 1.0, rough: 0.85, cracked: 0.7 }
              }
            }
          ]
        },
        schema: {
          type: { type: 'string', description: 'Equipment type' },
          size: { type: 'string', description: 'Equipment size category' },
          productivity: { type: 'object', description: 'Productivity rates by condition' },
          unit: { type: 'string', description: 'Productivity unit of measure' },
          factors: { type: 'object', description: 'Adjustment factors' }
        },
        lastUpdated: new Date(),
        source: 'Field Data Collection',
        reliability: 'high',
        updateFrequency: 'monthly'
      }
    ];

    datasets.forEach(dataset => {
      this.datasets.set(dataset.id, dataset);
    });
  }

  private buildSearchIndex(): void {
    // Build search index for quick text search
    this.searchIndex.clear();

    // Index formulas
    this.formulas.forEach(formula => {
      this.addToSearchIndex(formula.name, 'formula', formula.id);
      this.addToSearchIndex(formula.description, 'formula', formula.id);
      formula.variables.forEach(variable => {
        this.addToSearchIndex(variable.name, 'formula', formula.id);
        this.addToSearchIndex(variable.description, 'formula', formula.id);
      });
    });

    // Index calculations
    this.calculations.forEach(calculation => {
      this.addToSearchIndex(calculation.name, 'calculation', calculation.id);
      this.addToSearchIndex(calculation.description, 'calculation', calculation.id);
    });

    // Index documents
    this.documents.forEach(document => {
      this.addToSearchIndex(document.title, 'document', document.id);
      this.addToSearchIndex(document.content, 'document', document.id);
      document.tags.forEach(tag => {
        this.addToSearchIndex(tag, 'document', document.id);
      });
    });

    // Index datasets
    this.datasets.forEach(dataset => {
      this.addToSearchIndex(dataset.name, 'dataset', dataset.id);
      this.addToSearchIndex(dataset.description, 'dataset', dataset.id);
    });
  }

  private addToSearchIndex(text: string, type: string, id: string): void {
    const words = text.toLowerCase().split(/\s+/);
    words.forEach(word => {
      const key = `${word}:${type}`;
      if (!this.searchIndex.has(key)) {
        this.searchIndex.set(key, new Set());
      }
      this.searchIndex.get(key)!.add(id);
    });
  }

  // Public API methods
  async search(query: SearchQuery): Promise<SearchResult[]> {
    const results: SearchResult[] = [];
    const searchTerms = query.text.toLowerCase().split(/\s+/);

    // Search formulas
    this.formulas.forEach(formula => {
      const relevanceScore = this.calculateRelevanceScore(formula, searchTerms, query);
      if (relevanceScore > 0) {
        results.push({
          item: formula,
          type: 'formula',
          relevanceScore,
          matchedFields: this.getMatchedFields(formula, searchTerms),
          highlights: this.getHighlights(formula.description, searchTerms)
        });
      }
    });

    // Search calculations
    this.calculations.forEach(calculation => {
      const relevanceScore = this.calculateRelevanceScore(calculation, searchTerms, query);
      if (relevanceScore > 0) {
        results.push({
          item: calculation,
          type: 'calculation',
          relevanceScore,
          matchedFields: this.getMatchedFields(calculation, searchTerms),
          highlights: this.getHighlights(calculation.description, searchTerms)
        });
      }
    });

    // Search documents
    this.documents.forEach(document => {
      const relevanceScore = this.calculateRelevanceScore(document, searchTerms, query);
      if (relevanceScore > 0) {
        results.push({
          item: document,
          type: 'document',
          relevanceScore,
          matchedFields: this.getMatchedFields(document, searchTerms),
          highlights: this.getHighlights(document.content, searchTerms)
        });
      }
    });

    // Search datasets
    this.datasets.forEach(dataset => {
      const relevanceScore = this.calculateRelevanceScore(dataset, searchTerms, query);
      if (relevanceScore > 0) {
        results.push({
          item: dataset,
          type: 'dataset',
          relevanceScore,
          matchedFields: this.getMatchedFields(dataset, searchTerms),
          highlights: this.getHighlights(dataset.description, searchTerms)
        });
      }
    });

    // Sort by relevance score
    results.sort((a, b) => b.relevanceScore - a.relevanceScore);

    // Track access
    this.trackAccess(query.text);

    return results;
  }

  private calculateRelevanceScore(item: any, searchTerms: string[], query: SearchQuery): number {
    let score = 0;

    // Check if category filter matches
    if (query.category && item.category !== query.category) {
      return 0;
    }

    // Check if type filter matches
    if (query.type && item.type !== query.type) {
      return 0;
    }

    // Calculate text relevance
    const textFields = [item.name || item.title, item.description, item.content].filter(Boolean);
    textFields.forEach(field => {
      const fieldText = field.toLowerCase();
      searchTerms.forEach(term => {
        if (query.exactMatch) {
          if (fieldText.includes(term)) {
            score += 10;
          }
        } else {
          const termRegex = new RegExp(term, 'gi');
          const matches = fieldText.match(termRegex);
          if (matches) {
            score += matches.length * 5;
          }
        }
      });
    });

    // Boost score for tag matches
    if (item.tags) {
      item.tags.forEach((tag: string) => {
        searchTerms.forEach(term => {
          if (tag.toLowerCase().includes(term)) {
            score += 15;
          }
        });
      });
    }

    return score;
  }

  private getMatchedFields(item: any, searchTerms: string[]): string[] {
    const matchedFields: string[] = [];
    const fieldsToCheck = [
      { name: 'name', value: item.name || item.title },
      { name: 'description', value: item.description },
      { name: 'content', value: item.content }
    ];

    fieldsToCheck.forEach(field => {
      if (field.value) {
        const fieldText = field.value.toLowerCase();
        searchTerms.forEach(term => {
          if (fieldText.includes(term)) {
            matchedFields.push(field.name);
          }
        });
      }
    });

    return Array.from(new Set(matchedFields));
  }

  private getHighlights(text: string, searchTerms: string[]): string[] {
    if (!text) return [];

    const highlights: string[] = [];
    const sentences = text.split(/[.!?]+/);

    sentences.forEach(sentence => {
      const sentenceLower = sentence.toLowerCase();
      searchTerms.forEach(term => {
        if (sentenceLower.includes(term)) {
          highlights.push(sentence.trim());
        }
      });
    });

    return Array.from(new Set(highlights)).slice(0, 3);
  }

  private trackAccess(searchTerm: string): void {
    this.recentlyAccessed.unshift({
      id: searchTerm,
      type: 'search',
      timestamp: new Date()
    });

    // Keep only last 100 accesses
    this.recentlyAccessed = this.recentlyAccessed.slice(0, 100);
  }

  // CRUD operations
  addFormula(formula: Omit<KnowledgeFormula, 'id' | 'lastUpdated'>): string {
    const id = `formula_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const newFormula: KnowledgeFormula = {
      ...formula,
      id,
      lastUpdated: new Date()
    };

    this.formulas.set(id, newFormula);
    this.buildSearchIndex(); // Rebuild search index
    this.emit('formulaAdded', { id });
    
    return id;
  }

  addCalculation(calculation: Omit<KnowledgeCalculation, 'id'>): string {
    const id = `calc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const newCalculation: KnowledgeCalculation = {
      ...calculation,
      id
    };

    this.calculations.set(id, newCalculation);
    this.buildSearchIndex();
    this.emit('calculationAdded', { id });
    
    return id;
  }

  addDocument(document: Omit<KnowledgeDocument, 'id' | 'created' | 'accessCount' | 'ratings'>): string {
    const id = `doc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const newDocument: KnowledgeDocument = {
      ...document,
      id,
      created: new Date(),
      accessCount: 0,
      ratings: []
    };

    this.documents.set(id, newDocument);
    this.buildSearchIndex();
    this.emit('documentAdded', { id });
    
    return id;
  }

  getFormula(id: string): KnowledgeFormula | undefined {
    return this.formulas.get(id);
  }

  getCalculation(id: string): KnowledgeCalculation | undefined {
    return this.calculations.get(id);
  }

  getDocument(id: string): KnowledgeDocument | undefined {
    const document = this.documents.get(id);
    if (document) {
      // Increment access count
      document.accessCount++;
      this.trackAccess(id);
    }
    return document;
  }

  getDataset(id: string): KnowledgeDataSet | undefined {
    return this.datasets.get(id);
  }

  getCategories(): KnowledgeCategory[] {
    return Array.from(this.categories.values());
  }

  getRecentlyAccessed(): Array<{ id: string; type: string; timestamp: Date }> {
    return this.recentlyAccessed.slice(0, 10);
  }

  async executeCalculation(calculationId: string, inputs: Record<string, any>): Promise<Record<string, any>> {
    const calculation = this.calculations.get(calculationId);
    if (!calculation) {
      throw new Error(`Calculation ${calculationId} not found`);
    }

    try {
      // Safely execute the calculation logic
      const func = new Function('inputs', calculation.calculationLogic + '\nreturn calculate(inputs);');
      const results = func(inputs);
      
      this.emit('calculationExecuted', { calculationId, inputs, results });
      return results;
    } catch (error) {
      this.emit('calculationError', { calculationId, error: error.message });
      throw new Error(`Calculation execution failed: ${error.message}`);
    }
  }

  exportKnowledgeBase(): any {
    return {
      categories: Array.from(this.categories.values()),
      formulas: Array.from(this.formulas.values()),
      calculations: Array.from(this.calculations.values()),
      documents: Array.from(this.documents.values()),
      datasets: Array.from(this.datasets.values()),
      exportDate: new Date().toISOString(),
      version: '1.0.0'
    };
  }

  async importKnowledgeBase(data: any): Promise<void> {
    try {
      if (data.categories) {
        data.categories.forEach((category: KnowledgeCategory) => {
          this.categories.set(category.id, category);
        });
      }

      if (data.formulas) {
        data.formulas.forEach((formula: KnowledgeFormula) => {
          this.formulas.set(formula.id, formula);
        });
      }

      if (data.calculations) {
        data.calculations.forEach((calculation: KnowledgeCalculation) => {
          this.calculations.set(calculation.id, calculation);
        });
      }

      if (data.documents) {
        data.documents.forEach((document: KnowledgeDocument) => {
          this.documents.set(document.id, document);
        });
      }

      if (data.datasets) {
        data.datasets.forEach((dataset: KnowledgeDataSet) => {
          this.datasets.set(dataset.id, dataset);
        });
      }

      this.buildSearchIndex();
      this.emit('knowledgeBaseImported', { itemCount: Object.keys(data).length });
    } catch (error) {
      this.emit('importError', { error: error.message });
      throw error;
    }
  }
}

export default UniversalKnowledgeBase;