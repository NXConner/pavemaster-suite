import { EventEmitter } from 'events';

export interface ContractParty {
  type: 'contractor' | 'client' | 'subcontractor' | 'supplier';
  businessName: string;
  legalName?: string;
  contactPerson: string;
  title: string;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    county: string;
  };
  phone: string;
  email: string;
  fax?: string;
  licenseNumber?: string;
  insuranceInfo?: {
    carrier: string;
    policyNumber: string;
    expirationDate: Date;
    coverageAmount: number;
  };
  bondInfo?: {
    company: string;
    bondNumber: string;
    amount: number;
  };
}

export interface ProjectDetails {
  name: string;
  description: string;
  location: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    county: string;
    coordinates?: { lat: number; lng: number };
  };
  scope: string[];
  specifications: {
    category: string;
    description: string;
    quantity: number;
    unit: string;
    unitPrice: number;
    totalPrice: number;
  }[];
  timeline: {
    startDate: Date;
    completionDate: Date;
    milestones: Array<{
      description: string;
      date: Date;
      payment?: number;
    }>;
  };
  permits: Array<{
    type: string;
    number: string;
    issuingAuthority: string;
    expirationDate: Date;
  }>;
}

export interface PaymentTerms {
  totalAmount: number;
  structure: 'lump_sum' | 'progress_payments' | 'time_and_materials' | 'unit_price';
  schedule: Array<{
    description: string;
    amount: number;
    dueDate: Date;
    condition?: string;
  }>;
  retainage: {
    percentage: number;
    releaseConditions: string[];
  };
  changeOrderProcess: {
    approvalRequired: boolean;
    timeLimit: number; // days
    documentationRequired: string[];
  };
  latePaymentPenalty: {
    rate: number; // percentage per month
    gracePeriod: number; // days
  };
}

export interface LegalTerms {
  disputeResolution: 'litigation' | 'arbitration' | 'mediation';
  governingLaw: string;
  jurisdiction: string;
  warranty: {
    workmanship: number; // years
    materials: number; // years
    conditions: string[];
  };
  liability: {
    limits: number;
    exclusions: string[];
    indemnification: string;
  };
  force_majeure: string[];
  termination: {
    forCause: string[];
    forConvenience: boolean;
    noticePeriod: number; // days
  };
}

export interface ContractTemplate {
  id: string;
  name: string;
  type: 'asphalt_paving' | 'sealcoating' | 'parking_lot' | 'road_construction' | 'maintenance' | 'custom';
  version: string;
  created: Date;
  lastModified: Date;
  isActive: boolean;
  virginiaCompliant: boolean;
  content: string; // HTML/Rich text template
  requiredFields: Array<{
    fieldId: string;
    label: string;
    type: 'text' | 'number' | 'date' | 'select' | 'textarea' | 'checkbox' | 'currency';
    required: boolean;
    validation?: {
      min?: number;
      max?: number;
      pattern?: string;
      options?: string[];
    };
    placeholder?: string;
    helpText?: string;
  }>;
  calculatedFields: Array<{
    fieldId: string;
    formula: string;
    dependencies: string[];
  }>;
  legalClauses: Array<{
    id: string;
    title: string;
    content: string;
    required: boolean;
    type: 'standard' | 'virginia_specific' | 'industry_specific';
  }>;
}

export interface Contract {
  id: string;
  templateId: string;
  status: 'draft' | 'pending_review' | 'pending_signature' | 'signed' | 'executed' | 'completed' | 'terminated';
  created: Date;
  lastModified: Date;
  
  parties: ContractParty[];
  projectDetails: ProjectDetails;
  paymentTerms: PaymentTerms;
  legalTerms: LegalTerms;
  
  fieldValues: Record<string, any>;
  attachments: Array<{
    id: string;
    name: string;
    type: string;
    size: number;
    uploadDate: Date;
    category: 'plan' | 'specification' | 'permit' | 'insurance' | 'bond' | 'other';
  }>;
  
  signatures: Array<{
    partyId: string;
    signedDate?: Date;
    signatureData?: string; // Base64 signature image
    ipAddress?: string;
    userAgent?: string;
  }>;
  
  revisions: Array<{
    version: number;
    date: Date;
    changes: string;
    modifiedBy: string;
  }>;
  
  compliance: {
    virginiaLaw: boolean;
    licenseVerified: boolean;
    insuranceVerified: boolean;
    bondVerified: boolean;
    permitsObtained: boolean;
  };
}

export interface EstimateData {
  projectId: string;
  measurements: {
    area: number;
    perimeter: number;
    thickness?: number;
    volume?: number;
  };
  materials: Array<{
    name: string;
    type: 'asphalt' | 'sealcoat' | 'primer' | 'aggregate' | 'equipment';
    quantity: number;
    unit: string;
    unitCost: number;
    totalCost: number;
    supplier?: string;
  }>;
  labor: Array<{
    role: string;
    hours: number;
    rate: number;
    totalCost: number;
  }>;
  equipment: Array<{
    type: string;
    hours: number;
    rate: number;
    totalCost: number;
  }>;
  overhead: {
    percentage: number;
    amount: number;
  };
  profit: {
    percentage: number;
    amount: number;
  };
  contingency: {
    percentage: number;
    amount: number;
  };
  totalEstimate: number;
}

export class VirginiaContractSystem extends EventEmitter {
  private templates: Map<string, ContractTemplate> = new Map();
  private contracts: Map<string, Contract> = new Map();
  private estimates: Map<string, EstimateData> = new Map();

  constructor() {
    super();
    this.initializeStandardTemplates();
  }

  private initializeStandardTemplates(): void {
    const templates: ContractTemplate[] = [
      {
        id: 'va_asphalt_paving',
        name: 'Virginia Asphalt Paving Contract',
        type: 'asphalt_paving',
        version: '2024.1',
        created: new Date(),
        lastModified: new Date(),
        isActive: true,
        virginiaCompliant: true,
        content: this.getAsphaltPavingTemplate(),
        requiredFields: this.getAsphaltPavingFields(),
        calculatedFields: this.getAsphaltCalculatedFields(),
        legalClauses: this.getVirginiaLegalClauses()
      },
      {
        id: 'va_sealcoating',
        name: 'Virginia Sealcoating Service Contract',
        type: 'sealcoating',
        version: '2024.1',
        created: new Date(),
        lastModified: new Date(),
        isActive: true,
        virginiaCompliant: true,
        content: this.getSealcoatingTemplate(),
        requiredFields: this.getSealcoatingFields(),
        calculatedFields: this.getSealcoatingCalculatedFields(),
        legalClauses: this.getVirginiaLegalClauses()
      },
      {
        id: 'va_parking_lot',
        name: 'Virginia Parking Lot Construction Contract',
        type: 'parking_lot',
        version: '2024.1',
        created: new Date(),
        lastModified: new Date(),
        isActive: true,
        virginiaCompliant: true,
        content: this.getParkingLotTemplate(),
        requiredFields: this.getParkingLotFields(),
        calculatedFields: this.getParkingLotCalculatedFields(),
        legalClauses: this.getVirginiaLegalClauses()
      }
    ];

    templates.forEach(template => {
      this.templates.set(template.id, template);
    });

    this.emit('templatesInitialized', templates.length);
  }

  // Template content generators
  private getAsphaltPavingTemplate(): string {
    return `
<div class="contract-header">
  <h1>ASPHALT PAVING CONTRACT</h1>
  <h2>Commonwealth of Virginia</h2>
</div>

<section class="parties">
  <h3>PARTIES</h3>
  <p>This contract is entered into between:</p>
  
  <div class="contractor-info">
    <h4>CONTRACTOR:</h4>
    <p>{{contractor.businessName}}</p>
    <p>{{contractor.address.street}}</p>
    <p>{{contractor.address.city}}, {{contractor.address.state}} {{contractor.address.zipCode}}</p>
    <p>License No: {{contractor.licenseNumber}}</p>
    <p>Phone: {{contractor.phone}} | Email: {{contractor.email}}</p>
  </div>
  
  <div class="client-info">
    <h4>CLIENT:</h4>
    <p>{{client.businessName}}</p>
    <p>{{client.address.street}}</p>
    <p>{{client.address.city}}, {{client.address.state}} {{client.address.zipCode}}</p>
    <p>Phone: {{client.phone}} | Email: {{client.email}}</p>
  </div>
</section>

<section class="project-details">
  <h3>PROJECT DETAILS</h3>
  <p><strong>Project Name:</strong> {{project.name}}</p>
  <p><strong>Location:</strong> {{project.location.street}}, {{project.location.city}}, {{project.location.state}} {{project.location.zipCode}}</p>
  <p><strong>Description:</strong> {{project.description}}</p>
  
  <h4>SCOPE OF WORK:</h4>
  <ul>
    {{#each project.scope}}
    <li>{{this}}</li>
    {{/each}}
  </ul>
  
  <h4>SPECIFICATIONS:</h4>
  <table class="specifications-table">
    <thead>
      <tr>
        <th>Item</th>
        <th>Description</th>
        <th>Quantity</th>
        <th>Unit</th>
        <th>Unit Price</th>
        <th>Total</th>
      </tr>
    </thead>
    <tbody>
      {{#each project.specifications}}
      <tr>
        <td>{{@index}}</td>
        <td>{{description}}</td>
        <td>{{quantity}}</td>
        <td>{{unit}}</td>
        <td>\${{unitPrice}}</td>
        <td>\${{totalPrice}}</td>
      </tr>
      {{/each}}
    </tbody>
  </table>
</section>

<section class="timeline">
  <h3>PROJECT TIMELINE</h3>
  <p><strong>Start Date:</strong> {{project.timeline.startDate}}</p>
  <p><strong>Completion Date:</strong> {{project.timeline.completionDate}}</p>
  
  <h4>MILESTONES:</h4>
  <ul>
    {{#each project.timeline.milestones}}
    <li>{{description}} - {{date}} {{#if payment}}(Payment: \${{payment}}){{/if}}</li>
    {{/each}}
  </ul>
</section>

<section class="payment-terms">
  <h3>PAYMENT TERMS</h3>
  <p><strong>Total Contract Amount:</strong> $\${payment.totalAmount}</p>
  <p><strong>Payment Structure:</strong> {{payment.structure}}</p>
  
  <h4>PAYMENT SCHEDULE:</h4>
  <table class="payment-schedule">
    <thead>
      <tr>
        <th>Description</th>
        <th>Amount</th>
        <th>Due Date</th>
        <th>Condition</th>
      </tr>
    </thead>
    <tbody>
      {{#each payment.schedule}}
      <tr>
        <td>{{description}}</td>
        <td>\${{amount}}</td>
        <td>{{dueDate}}</td>
        <td>{{condition}}</td>
      </tr>
      {{/each}}
    </tbody>
  </table>
  
  <p><strong>Retainage:</strong> {{payment.retainage.percentage}}% to be held until {{payment.retainage.releaseConditions}}</p>
</section>

<section class="legal-terms">
  <h3>LEGAL TERMS AND CONDITIONS</h3>
  
  <h4>WARRANTY:</h4>
  <p>Contractor warrants all workmanship for {{legal.warranty.workmanship}} years and materials for {{legal.warranty.materials}} years from completion date.</p>
  
  <h4>INSURANCE AND BONDING:</h4>
  <p>Contractor shall maintain comprehensive general liability insurance of not less than \${{legal.liability.limits}} and shall provide performance and payment bonds as required by Virginia law.</p>
  
  <h4>PERMITS AND COMPLIANCE:</h4>
  <p>Contractor shall obtain all necessary permits and comply with all applicable Virginia state and local regulations, including but not limited to:</p>
  <ul>
    <li>Virginia Department of Transportation (VDOT) requirements</li>
    <li>Local building codes and zoning ordinances</li>
    <li>Environmental protection regulations</li>
    <li>Occupational safety requirements</li>
  </ul>
  
  <h4>DISPUTE RESOLUTION:</h4>
  <p>Any disputes arising from this contract shall be resolved through {{legal.disputeResolution}} in accordance with Virginia law in {{legal.jurisdiction}}.</p>
  
  <h4>TERMINATION:</h4>
  <p>Either party may terminate this contract with {{legal.termination.noticePeriod}} days written notice for the following reasons:</p>
  <ul>
    {{#each legal.termination.forCause}}
    <li>{{this}}</li>
    {{/each}}
  </ul>
</section>

<section class="virginia-specific">
  <h3>VIRGINIA-SPECIFIC PROVISIONS</h3>
  
  <h4>MECHANIC'S LIEN RIGHTS:</h4>
  <p>In accordance with Virginia Code § 43-1 et seq., contractor and all subcontractors have mechanic's lien rights. Client acknowledges receipt of the required Virginia Mechanic's Lien Agent disclosure.</p>
  
  <h4>VIRGINIA CONTRACTOR LICENSE:</h4>
  <p>Contractor represents that it holds a valid Virginia contractor's license (License No: {{contractor.licenseNumber}}) and is in good standing with the Virginia Board for Contractors.</p>
  
  <h4>RIGHT TO RESCIND:</h4>
  <p>If this contract was solicited at client's residence, client has the right to cancel this contract within three (3) business days in accordance with Virginia Code § 59.1-21.1.</p>
  
  <h4>VIRGINIA PROMPT PAYMENT ACT:</h4>
  <p>Payment terms comply with Virginia Code § 2.2-4354 regarding prompt payment for construction contracts.</p>
</section>

<section class="signatures">
  <h3>SIGNATURES</h3>
  
  <div class="signature-block">
    <h4>CONTRACTOR:</h4>
    <div class="signature-line">
      <p>_________________________________</p>
      <p>{{contractor.contactPerson}}, {{contractor.title}}</p>
      <p>{{contractor.businessName}}</p>
      <p>Date: _________________</p>
    </div>
  </div>
  
  <div class="signature-block">
    <h4>CLIENT:</h4>
    <div class="signature-line">
      <p>_________________________________</p>
      <p>{{client.contactPerson}}, {{client.title}}</p>
      <p>{{client.businessName}}</p>
      <p>Date: _________________</p>
    </div>
  </div>
</section>
`;
  }

  private getAsphaltPavingFields(): ContractTemplate['requiredFields'] {
    return [
      { fieldId: 'contractor.businessName', label: 'Contractor Business Name', type: 'text', required: true },
      { fieldId: 'contractor.licenseNumber', label: 'VA Contractor License Number', type: 'text', required: true, validation: { pattern: '^[0-9]{7,10}$' } },
      { fieldId: 'contractor.contactPerson', label: 'Contractor Contact Person', type: 'text', required: true },
      { fieldId: 'contractor.title', label: 'Contractor Title', type: 'text', required: true },
      { fieldId: 'contractor.address.street', label: 'Contractor Street Address', type: 'text', required: true },
      { fieldId: 'contractor.address.city', label: 'Contractor City', type: 'text', required: true },
      { fieldId: 'contractor.address.state', label: 'Contractor State', type: 'select', required: true, validation: { options: ['VA'] } },
      { fieldId: 'contractor.address.zipCode', label: 'Contractor ZIP Code', type: 'text', required: true, validation: { pattern: '^[0-9]{5}(-[0-9]{4})?$' } },
      { fieldId: 'contractor.phone', label: 'Contractor Phone', type: 'text', required: true },
      { fieldId: 'contractor.email', label: 'Contractor Email', type: 'text', required: true },
      
      { fieldId: 'client.businessName', label: 'Client Name/Business', type: 'text', required: true },
      { fieldId: 'client.contactPerson', label: 'Client Contact Person', type: 'text', required: true },
      { fieldId: 'client.address.street', label: 'Client Street Address', type: 'text', required: true },
      { fieldId: 'client.address.city', label: 'Client City', type: 'text', required: true },
      { fieldId: 'client.address.state', label: 'Client State', type: 'text', required: true },
      { fieldId: 'client.address.zipCode', label: 'Client ZIP Code', type: 'text', required: true },
      { fieldId: 'client.phone', label: 'Client Phone', type: 'text', required: true },
      { fieldId: 'client.email', label: 'Client Email', type: 'text', required: true },
      
      { fieldId: 'project.name', label: 'Project Name', type: 'text', required: true },
      { fieldId: 'project.description', label: 'Project Description', type: 'textarea', required: true },
      { fieldId: 'project.location.street', label: 'Project Location', type: 'text', required: true },
      { fieldId: 'project.location.city', label: 'Project City', type: 'text', required: true },
      { fieldId: 'project.location.state', label: 'Project State', type: 'text', required: true },
      { fieldId: 'project.location.zipCode', label: 'Project ZIP Code', type: 'text', required: true },
      
      { fieldId: 'asphalt.area', label: 'Total Area (sq ft)', type: 'number', required: true, validation: { min: 1 } },
      { fieldId: 'asphalt.thickness', label: 'Asphalt Thickness (inches)', type: 'number', required: true, validation: { min: 1, max: 12 } },
      { fieldId: 'asphalt.type', label: 'Asphalt Mix Type', type: 'select', required: true, validation: { options: ['SM-9.5A', 'SM-12.5A', 'SM-19.0A', 'BM-25.0A'] } },
      { fieldId: 'asphalt.unitPrice', label: 'Unit Price per Sq Ft', type: 'currency', required: true, validation: { min: 0.50, max: 20.00 } },
      
      { fieldId: 'timeline.startDate', label: 'Project Start Date', type: 'date', required: true },
      { fieldId: 'timeline.completionDate', label: 'Project Completion Date', type: 'date', required: true },
      { fieldId: 'timeline.workDays', label: 'Estimated Work Days', type: 'number', required: true, validation: { min: 1, max: 365 } },
      
      { fieldId: 'payment.totalAmount', label: 'Total Contract Amount', type: 'currency', required: true },
      { fieldId: 'payment.structure', label: 'Payment Structure', type: 'select', required: true, validation: { options: ['lump_sum', 'progress_payments', 'time_and_materials'] } },
      { fieldId: 'payment.retainage', label: 'Retainage Percentage', type: 'number', required: true, validation: { min: 0, max: 10 } },
      
      { fieldId: 'warranty.workmanship', label: 'Workmanship Warranty (years)', type: 'number', required: true, validation: { min: 1, max: 10 } },
      { fieldId: 'warranty.materials', label: 'Materials Warranty (years)', type: 'number', required: true, validation: { min: 1, max: 25 } }
    ];
  }

  private getAsphaltCalculatedFields(): ContractTemplate['calculatedFields'] {
    return [
      { fieldId: 'asphalt.totalCost', formula: 'asphalt.area * asphalt.unitPrice', dependencies: ['asphalt.area', 'asphalt.unitPrice'] },
      { fieldId: 'asphalt.volume', formula: 'asphalt.area * asphalt.thickness / 12', dependencies: ['asphalt.area', 'asphalt.thickness'] },
      { fieldId: 'timeline.duration', formula: 'timeline.completionDate - timeline.startDate', dependencies: ['timeline.startDate', 'timeline.completionDate'] },
      { fieldId: 'payment.retainageAmount', formula: 'payment.totalAmount * payment.retainage / 100', dependencies: ['payment.totalAmount', 'payment.retainage'] }
    ];
  }

  private getSealcoatingTemplate(): string {
    return `
<div class="contract-header">
  <h1>SEALCOATING SERVICE CONTRACT</h1>
  <h2>Commonwealth of Virginia</h2>
</div>

<section class="parties">
  <h3>PARTIES</h3>
  <p>This sealcoating service contract is entered into between:</p>
  
  <div class="contractor-info">
    <h4>SERVICE PROVIDER:</h4>
    <p>{{contractor.businessName}}</p>
    <p>{{contractor.address.street}}</p>
    <p>{{contractor.address.city}}, {{contractor.address.state}} {{contractor.address.zipCode}}</p>
    <p>License No: {{contractor.licenseNumber}}</p>
    <p>Phone: {{contractor.phone}} | Email: {{contractor.email}}</p>
  </div>
  
  <div class="client-info">
    <h4>PROPERTY OWNER:</h4>
    <p>{{client.businessName}}</p>
    <p>{{client.address.street}}</p>
    <p>{{client.address.city}}, {{client.address.state}} {{client.address.zipCode}}</p>
    <p>Phone: {{client.phone}} | Email: {{client.email}}</p>
  </div>
</section>

<section class="service-details">
  <h3>SEALCOATING SERVICE DETAILS</h3>
  <p><strong>Property Address:</strong> {{project.location.street}}, {{project.location.city}}, {{project.location.state}} {{project.location.zipCode}}</p>
  
  <h4>SERVICES TO BE PROVIDED:</h4>
  <ul>
    <li>Surface cleaning and preparation</li>
    <li>Crack filling and repair (if included)</li>
    <li>Application of premium sealcoat material</li>
    <li>Line striping (if included)</li>
    <li>Site cleanup and restoration</li>
  </ul>
  
  <h4>SURFACE SPECIFICATIONS:</h4>
  <table class="specifications-table">
    <tr><td>Total Area:</td><td>{{sealcoat.area}} square feet</td></tr>
    <tr><td>Surface Type:</td><td>{{sealcoat.surfaceType}}</td></tr>
    <tr><td>Current Condition:</td><td>{{sealcoat.condition}}</td></tr>
    <tr><td>Coats to be Applied:</td><td>{{sealcoat.coats}}</td></tr>
    <tr><td>Sealcoat Material:</td><td>{{sealcoat.material}}</td></tr>
  </table>
</section>

<section class="pricing">
  <h3>PRICING</h3>
  <table class="pricing-table">
    <thead>
      <tr><th>Service</th><th>Quantity</th><th>Unit Price</th><th>Total</th></tr>
    </thead>
    <tbody>
      <tr><td>Sealcoating</td><td>{{sealcoat.area}} sq ft</td><td>\${{sealcoat.unitPrice}}</td><td>\${{sealcoat.totalCost}}</td></tr>
      {{#if crackFilling.included}}
      <tr><td>Crack Filling</td><td>{{crackFilling.linearFeet}} lin ft</td><td>\${{crackFilling.unitPrice}}</td><td>\${{crackFilling.totalCost}}</td></tr>
      {{/if}}
      {{#if striping.included}}
      <tr><td>Line Striping</td><td>{{striping.linearFeet}} lin ft</td><td>\${{striping.unitPrice}}</td><td>\${{striping.totalCost}}</td></tr>
      {{/if}}
    </tbody>
    <tfoot>
      <tr><td colspan="3"><strong>TOTAL:</strong></td><td><strong>\${{payment.totalAmount}}</strong></td></tr>
    </tfoot>
  </table>
</section>

<section class="timeline">
  <h3>SCHEDULING</h3>
  <p><strong>Scheduled Service Date:</strong> {{timeline.serviceDate}}</p>
  <p><strong>Weather Dependency:</strong> Service is weather dependent and may be rescheduled due to rain, extreme temperatures, or high humidity.</p>
  <p><strong>Drying Time:</strong> Surface will be ready for light traffic in 4-8 hours, heavy traffic in 24 hours.</p>
  <p><strong>Optimal Conditions:</strong> Temperature above 50°F, no rain forecast for 8 hours.</p>
</section>

<section class="warranty">
  <h3>WARRANTY</h3>
  <p>Contractor warrants the sealcoating application for {{warranty.sealcoat}} year(s) against material defects and workmanship issues, subject to the following conditions:</p>
  <ul>
    <li>Normal wear and weather exposure expected</li>
    <li>No warranty on surfaces with structural failures</li>
    <li>Annual maintenance recommended for optimal longevity</li>
    <li>Warranty void if surface is altered or damaged by client</li>
  </ul>
</section>
`;
  }

  private getSealcoatingFields(): ContractTemplate['requiredFields'] {
    return [
      { fieldId: 'sealcoat.area', label: 'Area to Sealcoat (sq ft)', type: 'number', required: true, validation: { min: 100 } },
      { fieldId: 'sealcoat.surfaceType', label: 'Surface Type', type: 'select', required: true, validation: { options: ['Asphalt', 'Blacktop', 'Concrete'] } },
      { fieldId: 'sealcoat.condition', label: 'Current Surface Condition', type: 'select', required: true, validation: { options: ['Excellent', 'Good', 'Fair', 'Poor'] } },
      { fieldId: 'sealcoat.coats', label: 'Number of Coats', type: 'select', required: true, validation: { options: ['1', '2'] } },
      { fieldId: 'sealcoat.material', label: 'Sealcoat Material Type', type: 'select', required: true, validation: { options: ['Coal Tar', 'Asphalt Emulsion', 'Petroleum Based'] } },
      { fieldId: 'sealcoat.unitPrice', label: 'Price per Square Foot', type: 'currency', required: true, validation: { min: 0.10, max: 1.00 } },
      { fieldId: 'crackFilling.included', label: 'Include Crack Filling', type: 'checkbox', required: false },
      { fieldId: 'crackFilling.linearFeet', label: 'Crack Filling (linear feet)', type: 'number', required: false, validation: { min: 0 } },
      { fieldId: 'crackFilling.unitPrice', label: 'Crack Filling Price per LF', type: 'currency', required: false, validation: { min: 0.50, max: 5.00 } },
      { fieldId: 'striping.included', label: 'Include Line Striping', type: 'checkbox', required: false },
      { fieldId: 'striping.linearFeet', label: 'Line Striping (linear feet)', type: 'number', required: false, validation: { min: 0 } },
      { fieldId: 'striping.unitPrice', label: 'Line Striping Price per LF', type: 'currency', required: false, validation: { min: 1.00, max: 10.00 } },
      { fieldId: 'timeline.serviceDate', label: 'Preferred Service Date', type: 'date', required: true },
      { fieldId: 'warranty.sealcoat', label: 'Sealcoat Warranty (years)', type: 'number', required: true, validation: { min: 1, max: 3 } }
    ];
  }

  private getSealcoatingCalculatedFields(): ContractTemplate['calculatedFields'] {
    return [
      { fieldId: 'sealcoat.totalCost', formula: 'sealcoat.area * sealcoat.unitPrice', dependencies: ['sealcoat.area', 'sealcoat.unitPrice'] },
      { fieldId: 'crackFilling.totalCost', formula: 'crackFilling.included ? crackFilling.linearFeet * crackFilling.unitPrice : 0', dependencies: ['crackFilling.included', 'crackFilling.linearFeet', 'crackFilling.unitPrice'] },
      { fieldId: 'striping.totalCost', formula: 'striping.included ? striping.linearFeet * striping.unitPrice : 0', dependencies: ['striping.included', 'striping.linearFeet', 'striping.unitPrice'] },
      { fieldId: 'payment.totalAmount', formula: 'sealcoat.totalCost + crackFilling.totalCost + striping.totalCost', dependencies: ['sealcoat.totalCost', 'crackFilling.totalCost', 'striping.totalCost'] }
    ];
  }

  private getParkingLotTemplate(): string {
    return `
<div class="contract-header">
  <h1>PARKING LOT CONSTRUCTION CONTRACT</h1>
  <h2>Commonwealth of Virginia</h2>
</div>

<section class="project-scope">
  <h3>PROJECT SCOPE</h3>
  <p><strong>Project Type:</strong> {{project.type}}</p>
  <p><strong>Total Area:</strong> {{parkingLot.totalArea}} square feet</p>
  <p><strong>Parking Spaces:</strong> {{parkingLot.spaces}} total ({{parkingLot.accessibleSpaces}} accessible)</p>
  
  <h4>CONSTRUCTION PHASES:</h4>
  <ol>
    <li>Site preparation and excavation</li>
    <li>Grading and compaction</li>
    <li>Base course installation</li>
    <li>Asphalt paving application</li>
    <li>Striping and signage installation</li>
    <li>Final inspection and cleanup</li>
  </ol>
  
  <h4>TECHNICAL SPECIFICATIONS:</h4>
  <table class="specifications-table">
    <tr><td>Excavation Depth:</td><td>{{parkingLot.excavationDepth}} inches</td></tr>
    <tr><td>Base Course:</td><td>{{parkingLot.baseThickness}} inches {{parkingLot.baseMaterial}}</td></tr>
    <tr><td>Asphalt Thickness:</td><td>{{parkingLot.asphaltThickness}} inches</td></tr>
    <tr><td>Asphalt Mix:</td><td>{{parkingLot.asphaltMix}}</td></tr>
    <tr><td>Compaction:</td><td>{{parkingLot.compaction}}% standard proctor</td></tr>
  </table>
</section>

<section class="drainage">
  <h3>DRAINAGE SYSTEM</h3>
  <p><strong>Surface Slope:</strong> {{drainage.slope}}% minimum toward drainage points</p>
  <p><strong>Storm Water Management:</strong> {{drainage.stormWater}}</p>
  {{#if drainage.catchBasins}}
  <p><strong>Catch Basins:</strong> {{drainage.catchBasins}} units</p>
  {{/if}}
  {{#if drainage.pipes}}
  <p><strong>Drainage Pipes:</strong> {{drainage.pipes}} linear feet</p>
  {{/if}}
</section>

<section class="compliance">
  <h3>CODE COMPLIANCE</h3>
  <h4>Americans with Disabilities Act (ADA):</h4>
  <ul>
    <li>{{parkingLot.accessibleSpaces}} accessible parking spaces ({{parkingLot.accessiblePercentage}}%)</li>
    <li>Van accessible spaces with 8-foot access aisles</li>
    <li>Accessible routes to building entrances</li>
    <li>Proper signage and markings per ADA standards</li>
  </ul>
  
  <h4>Virginia Building Code:</h4>
  <ul>
    <li>Fire lane markings and access</li>
    <li>Proper lighting levels for safety</li>
    <li>Traffic flow and circulation patterns</li>
    <li>Landscaping and environmental compliance</li>
  </ul>
</section>
`;
  }

  private getParkingLotFields(): ContractTemplate['requiredFields'] {
    return [
      { fieldId: 'parkingLot.totalArea', label: 'Total Parking Lot Area (sq ft)', type: 'number', required: true, validation: { min: 1000 } },
      { fieldId: 'parkingLot.spaces', label: 'Total Parking Spaces', type: 'number', required: true, validation: { min: 5 } },
      { fieldId: 'parkingLot.accessibleSpaces', label: 'Accessible Parking Spaces', type: 'number', required: true, validation: { min: 1 } },
      { fieldId: 'parkingLot.excavationDepth', label: 'Excavation Depth (inches)', type: 'number', required: true, validation: { min: 6, max: 36 } },
      { fieldId: 'parkingLot.baseThickness', label: 'Base Course Thickness (inches)', type: 'number', required: true, validation: { min: 4, max: 12 } },
      { fieldId: 'parkingLot.baseMaterial', label: 'Base Material Type', type: 'select', required: true, validation: { options: ['Crushed Stone', 'Recycled Concrete', 'Gravel'] } },
      { fieldId: 'parkingLot.asphaltThickness', label: 'Asphalt Thickness (inches)', type: 'number', required: true, validation: { min: 2, max: 6 } },
      { fieldId: 'parkingLot.asphaltMix', label: 'Asphalt Mix Type', type: 'select', required: true, validation: { options: ['SM-9.5A', 'SM-12.5A', 'BM-25.0A'] } },
      { fieldId: 'drainage.slope', label: 'Surface Slope Percentage', type: 'number', required: true, validation: { min: 1.0, max: 5.0 } },
      { fieldId: 'drainage.stormWater', label: 'Storm Water Management', type: 'select', required: true, validation: { options: ['On-site retention', 'Municipal system', 'Natural drainage'] } },
      { fieldId: 'striping.type', label: 'Striping Paint Type', type: 'select', required: true, validation: { options: ['Water-based', 'Solvent-based', 'Thermoplastic'] } },
      { fieldId: 'lighting.included', label: 'Include Lighting', type: 'checkbox', required: false },
      { fieldId: 'landscaping.included', label: 'Include Landscaping', type: 'checkbox', required: false }
    ];
  }

  private getParkingLotCalculatedFields(): ContractTemplate['calculatedFields'] {
    return [
      { fieldId: 'parkingLot.accessiblePercentage', formula: '(parkingLot.accessibleSpaces / parkingLot.spaces) * 100', dependencies: ['parkingLot.accessibleSpaces', 'parkingLot.spaces'] },
      { fieldId: 'parkingLot.excavationVolume', formula: 'parkingLot.totalArea * parkingLot.excavationDepth / 12', dependencies: ['parkingLot.totalArea', 'parkingLot.excavationDepth'] },
      { fieldId: 'parkingLot.baseVolume', formula: 'parkingLot.totalArea * parkingLot.baseThickness / 12', dependencies: ['parkingLot.totalArea', 'parkingLot.baseThickness'] },
      { fieldId: 'parkingLot.asphaltVolume', formula: 'parkingLot.totalArea * parkingLot.asphaltThickness / 12', dependencies: ['parkingLot.totalArea', 'parkingLot.asphaltThickness'] }
    ];
  }

  private getVirginiaLegalClauses(): ContractTemplate['legalClauses'] {
    return [
      {
        id: 'va_mechanic_lien',
        title: 'Virginia Mechanic\'s Lien Rights',
        content: 'In accordance with Virginia Code § 43-1 et seq., contractor and all subcontractors have mechanic\'s lien rights against the property for labor and materials furnished. Property owner acknowledges receipt of the required Virginia Mechanic\'s Lien Agent disclosure.',
        required: true,
        type: 'virginia_specific'
      },
      {
        id: 'va_contractor_license',
        title: 'Virginia Contractor License Requirement',
        content: 'Contractor represents and warrants that it holds a valid Virginia contractor\'s license and is in good standing with the Virginia Board for Contractors. License number and verification are attached hereto.',
        required: true,
        type: 'virginia_specific'
      },
      {
        id: 'va_prompt_payment',
        title: 'Virginia Prompt Payment Act Compliance',
        content: 'Payment terms and procedures comply with the Virginia Prompt Payment Act (Virginia Code § 2.2-4354) regarding prompt payment for construction contracts.',
        required: true,
        type: 'virginia_specific'
      },
      {
        id: 'va_right_to_rescind',
        title: 'Right to Cancel',
        content: 'If this contract was solicited at client\'s residence, client has the right to cancel this contract within three (3) business days in accordance with Virginia Code § 59.1-21.1.',
        required: false,
        type: 'virginia_specific'
      },
      {
        id: 'va_retainage',
        title: 'Virginia Retainage Requirements',
        content: 'Retainage shall not exceed five percent (5%) of the contract amount for public contracts or ten percent (10%) for private contracts in accordance with Virginia law.',
        required: true,
        type: 'virginia_specific'
      },
      {
        id: 'insurance_bonding',
        title: 'Insurance and Bonding Requirements',
        content: 'Contractor shall maintain comprehensive general liability insurance with minimum coverage of $1,000,000 per occurrence and shall provide performance and payment bonds as required by Virginia law for contracts exceeding $50,000.',
        required: true,
        type: 'standard'
      },
      {
        id: 'environmental_compliance',
        title: 'Environmental Compliance',
        content: 'Contractor shall comply with all applicable environmental regulations including stormwater management, erosion control, and hazardous material handling requirements.',
        required: true,
        type: 'industry_specific'
      }
    ];
  }

  // Contract management methods
  async createContract(templateId: string, initialData: Partial<Contract>): Promise<string> {
    const template = this.templates.get(templateId);
    if (!template) {
      throw new Error(`Template ${templateId} not found`);
    }

    const contractId = `contract_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const contract: Contract = {
      id: contractId,
      templateId,
      status: 'draft',
      created: new Date(),
      lastModified: new Date(),
      parties: initialData.parties || [],
      projectDetails: initialData.projectDetails || {} as ProjectDetails,
      paymentTerms: initialData.paymentTerms || {} as PaymentTerms,
      legalTerms: initialData.legalTerms || {} as LegalTerms,
      fieldValues: initialData.fieldValues || {},
      attachments: [],
      signatures: [],
      revisions: [],
      compliance: {
        virginiaLaw: false,
        licenseVerified: false,
        insuranceVerified: false,
        bondVerified: false,
        permitsObtained: false
      }
    };

    this.contracts.set(contractId, contract);
    this.emit('contractCreated', { contractId, templateId });
    
    return contractId;
  }

  async updateContract(contractId: string, updates: Partial<Contract>): Promise<void> {
    const contract = this.contracts.get(contractId);
    if (!contract) {
      throw new Error(`Contract ${contractId} not found`);
    }

    const updatedContract = {
      ...contract,
      ...updates,
      lastModified: new Date()
    };

    // Add revision entry
    if (updates.fieldValues) {
      updatedContract.revisions.push({
        version: contract.revisions.length + 1,
        date: new Date(),
        changes: 'Field values updated',
        modifiedBy: 'system' // In real implementation, use actual user ID
      });
    }

    this.contracts.set(contractId, updatedContract);
    this.emit('contractUpdated', { contractId });
  }

  async generateContractDocument(contractId: string): Promise<string> {
    const contract = this.contracts.get(contractId);
    if (!contract) {
      throw new Error(`Contract ${contractId} not found`);
    }

    const template = this.templates.get(contract.templateId);
    if (!template) {
      throw new Error(`Template ${contract.templateId} not found`);
    }

    // Process template with field values
    let processedContent = template.content;
    
    // Replace template variables with actual values
    Object.entries(contract.fieldValues).forEach(([key, value]) => {
      const regex = new RegExp(`{{${key}}}`, 'g');
      processedContent = processedContent.replace(regex, value?.toString() || '');
    });

    // Calculate any computed fields
    template.calculatedFields.forEach(field => {
      const calculatedValue = this.calculateField(field.formula, contract.fieldValues);
      const regex = new RegExp(`{{${field.fieldId}}}`, 'g');
      processedContent = processedContent.replace(regex, calculatedValue.toString());
    });

    return processedContent;
  }

  private calculateField(formula: string, fieldValues: Record<string, any>): number {
    // Simple formula calculator - in production, use a proper expression parser
    let expression = formula;
    
    // Replace field references with actual values
    Object.entries(fieldValues).forEach(([key, value]) => {
      const regex = new RegExp(key, 'g');
      expression = expression.replace(regex, value?.toString() || '0');
    });

    try {
      // Safely evaluate mathematical expressions
      return Function(`"use strict"; return (${expression})`)();
    } catch (error) {
      console.error('Formula calculation error:', error);
      return 0;
    }
  }

  async uploadCustomTemplate(templateData: Omit<ContractTemplate, 'id' | 'created' | 'lastModified'>): Promise<string> {
    const templateId = `custom_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const template: ContractTemplate = {
      ...templateData,
      id: templateId,
      created: new Date(),
      lastModified: new Date()
    };

    this.templates.set(templateId, template);
    this.emit('templateUploaded', { templateId });
    
    return templateId;
  }

  getTemplates(): ContractTemplate[] {
    return Array.from(this.templates.values());
  }

  getTemplate(templateId: string): ContractTemplate | undefined {
    return this.templates.get(templateId);
  }

  getContract(contractId: string): Contract | undefined {
    return this.contracts.get(contractId);
  }

  getContracts(): Contract[] {
    return Array.from(this.contracts.values());
  }

  async validateContractCompliance(contractId: string): Promise<{ isCompliant: boolean; issues: string[] }> {
    const contract = this.contracts.get(contractId);
    if (!contract) {
      throw new Error(`Contract ${contractId} not found`);
    }

    const issues: string[] = [];

    // Check Virginia-specific requirements
    if (!contract.fieldValues['contractor.licenseNumber']) {
      issues.push('Virginia contractor license number is required');
    }

    if (!contract.compliance.licenseVerified) {
      issues.push('Contractor license verification pending');
    }

    if (!contract.compliance.insuranceVerified) {
      issues.push('Insurance verification pending');
    }

    // Check contract value requirements
    const totalAmount = contract.fieldValues['payment.totalAmount'];
    if (totalAmount > 50000 && !contract.compliance.bondVerified) {
      issues.push('Performance bond required for contracts over $50,000');
    }

    // Check required fields
    const template = this.templates.get(contract.templateId);
    if (template) {
      template.requiredFields.forEach(field => {
        if (field.required && !contract.fieldValues[field.fieldId]) {
          issues.push(`Required field missing: ${field.label}`);
        }
      });
    }

    return {
      isCompliant: issues.length === 0,
      issues
    };
  }

  async exportContract(contractId: string, format: 'pdf' | 'docx' | 'html'): Promise<Blob> {
    const contractHtml = await this.generateContractDocument(contractId);
    
    switch (format) {
      case 'html':
        return new Blob([contractHtml], { type: 'text/html' });
      case 'pdf':
        // In production, use a PDF generation library like puppeteer or jsPDF
        return new Blob([contractHtml], { type: 'application/pdf' });
      case 'docx':
        // In production, use a DOCX generation library
        return new Blob([contractHtml], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
      default:
        throw new Error(`Unsupported format: ${format}`);
    }
  }
}

export default VirginiaContractSystem;