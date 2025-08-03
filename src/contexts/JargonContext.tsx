import React, { createContext, useContext, useState, useEffect } from 'react';

export type JargonMode = 'civilian' | 'military' | 'hybrid';

interface JargonContextType {
  jargonMode: JargonMode;
  setJargonMode: (mode: JargonMode) => void;
  getText: (key: string) => string;
  getTerms: (key: string) => {
    civilian: string;
    military: string;
    acronym?: string;
    definition?: string;
  };
}

// Comprehensive Military/Civilian Terminology Database
const TERMINOLOGY_DATABASE = {
  // Navigation & Core Terms
  dashboard: {
    civilian: 'Dashboard',
    military: 'Command Center',
    acronym: 'C2',
    definition: 'Command and Control Center',
  },
  projects: {
    civilian: 'Projects',
    military: 'Operations',
    acronym: 'OPS',
    definition: 'Operational Missions',
  },
  equipment: {
    civilian: 'Equipment',
    military: 'Assets',
    acronym: 'EQUIP',
    definition: 'Material Assets and Equipment',
  },
  fleet: {
    civilian: 'Fleet Management',
    military: 'Vehicle Command',
    acronym: 'VCOM',
    definition: 'Vehicle Command & Control',
  },
  employees: {
    civilian: 'Employees',
    military: 'Personnel',
    acronym: 'PERS',
    definition: 'Personnel Roster',
  },
  tracking: {
    civilian: 'Tracking',
    military: 'Surveillance',
    acronym: 'SURV',
    definition: 'Tactical Surveillance Network',
  },
  analytics: {
    civilian: 'Analytics',
    military: 'Intelligence',
    acronym: 'INTEL',
    definition: 'Intelligence Analysis',
  },
  settings: {
    civilian: 'Settings',
    military: 'Configuration',
    acronym: 'CONFIG',
    definition: 'System Configuration',
  },

  // Status & Operations
  active: {
    civilian: 'Active',
    military: 'Operational',
    acronym: 'OP',
    definition: 'Currently Operational',
  },
  inactive: {
    civilian: 'Inactive',
    military: 'Standby',
    acronym: 'STBY',
    definition: 'Standing By',
  },
  pending: {
    civilian: 'Pending',
    military: 'Awaiting Orders',
    acronym: 'AO',
    definition: 'Awaiting Orders',
  },
  complete: {
    civilian: 'Complete',
    military: 'Mission Complete',
    acronym: 'MCOM',
    definition: 'Mission Complete',
  },

  // Personnel Terms
  manager: {
    civilian: 'Manager',
    military: 'Commander',
    acronym: 'CDR',
    definition: 'Unit Commander',
  },
  supervisor: {
    civilian: 'Supervisor',
    military: 'Squad Leader',
    acronym: 'SL',
    definition: 'Squad Leader',
  },
  worker: {
    civilian: 'Worker',
    military: 'Operator',
    acronym: 'OPR',
    definition: 'Equipment Operator',
  },
  driver: {
    civilian: 'Driver',
    military: 'Transport Op',
    acronym: 'TOP',
    definition: 'Transportation Operator',
  },

  // Equipment & Assets
  vehicle: {
    civilian: 'Vehicle',
    military: 'Asset',
    acronym: 'VEH',
    definition: 'Mobile Asset',
  },
  truck: {
    civilian: 'Truck',
    military: 'Transport',
    acronym: 'TRANS',
    definition: 'Heavy Transport Vehicle',
  },

  // Location & Navigation
  location: {
    civilian: 'Location',
    military: 'Position',
    acronym: 'POS',
    definition: 'Grid Position',
  },
  address: {
    civilian: 'Address',
    military: 'Coordinates',
    acronym: 'COORD',
    definition: 'Grid Coordinates',
  },

  // Time & Scheduling
  schedule: {
    civilian: 'Schedule',
    military: 'Timeline',
    acronym: 'TL',
    definition: 'Mission Timeline',
  },
  deadline: {
    civilian: 'Deadline',
    military: 'Time Hack',
    acronym: 'TH',
    definition: 'Mission Time Hack',
  },

  // Communication
  message: {
    civilian: 'Message',
    military: 'Transmission',
    acronym: 'TX',
    definition: 'Radio Transmission',
  },
  notification: {
    civilian: 'Notification',
    military: 'Alert',
    acronym: 'ALERT',
    definition: 'System Alert',
  },

  // Safety & Security
  emergency: {
    civilian: 'Emergency',
    military: 'Code Red',
    acronym: 'CR',
    definition: 'Emergency Alert Status',
  },
  safety: {
    civilian: 'Safety',
    military: 'Security',
    acronym: 'SEC',
    definition: 'Security Protocol',
  },

  // Financial & Business
  cost: {
    civilian: 'Cost',
    military: 'Expenditure',
    acronym: 'EXP',
    definition: 'Mission Expenditure',
  },
  budget: {
    civilian: 'Budget',
    military: 'Allocation',
    acronym: 'ALLOC',
    definition: 'Resource Allocation',
  },

  // Veteran Resources
  benefits: {
    civilian: 'Benefits',
    military: 'Entitlements',
    acronym: 'ENT',
    definition: 'Veteran Entitlements',
  },
  assistance: {
    civilian: 'Assistance',
    military: 'Support',
    acronym: 'SUPP',
    definition: 'Veteran Support Services',
  },
  resources: {
    civilian: 'Resources',
    military: 'Assets',
    acronym: 'AST',
    definition: 'Available Assets',
  },

  // Technical Terms
  system: {
    civilian: 'System',
    military: 'Platform',
    acronym: 'PLT',
    definition: 'Technical Platform',
  },
  network: {
    civilian: 'Network',
    military: 'Grid',
    acronym: 'NET',
    definition: 'Communication Grid',
  },
  database: {
    civilian: 'Database',
    military: 'Repository',
    acronym: 'REPO',
    definition: 'Data Repository',
  },

  // Pavement/Construction Specific
  asphalt: {
    civilian: 'Asphalt',
    military: 'Surface Material',
    acronym: 'SURF',
    definition: 'Road Surface Material',
  },
  sealcoating: {
    civilian: 'Sealcoating',
    military: 'Surface Treatment',
    acronym: 'ST',
    definition: 'Protective Surface Treatment',
  },
  paving: {
    civilian: 'Paving',
    military: 'Surface Ops',
    acronym: 'SOPS',
    definition: 'Surface Operations',
  },

  // Church/Customer Specific
  client: {
    civilian: 'Client',
    military: 'Principal',
    acronym: 'PRIN',
    definition: 'Mission Principal',
  },
  church: {
    civilian: 'Church',
    military: 'Facility',
    acronym: 'FAC',
    definition: 'Target Facility',
  },
  parking_lot: {
    civilian: 'Parking Lot',
    military: 'Vehicle Staging Area',
    acronym: 'VSA',
    definition: 'Vehicle Staging Area',
  },
};

const JargonContext = createContext<JargonContextType | undefined>(undefined);

export function JargonProvider({ children }: { children: React.ReactNode }) {
  const [jargonMode, setJargonModeState] = useState<JargonMode>('hybrid');

  useEffect(() => {
    const saved = localStorage.getItem('jargonMode') as JargonMode;
    if (saved && ['civilian', 'military', 'hybrid'].includes(saved)) {
      setJargonModeState(saved);
    }
  }, []);

  const setJargonMode = (mode: JargonMode) => {
    setJargonModeState(mode);
    localStorage.setItem('jargonMode', mode);
  };

  const getText = (key: string): string => {
    const terms = TERMINOLOGY_DATABASE[key as keyof typeof TERMINOLOGY_DATABASE];
    if (!terms) { return key; }

    switch (jargonMode) {
      case 'civilian':
        return terms.civilian;
      case 'military':
        return terms.military + (terms.acronym ? ` (${terms.acronym})` : '');
      case 'hybrid':
        return `${terms.civilian} / ${terms.military}` + (terms.acronym ? ` (${terms.acronym})` : '');
      default:
        return terms.civilian;
    }
  };

  const getTerms = (key: string) => {
    return TERMINOLOGY_DATABASE[key as keyof typeof TERMINOLOGY_DATABASE] || {
      civilian: key,
      military: key,
      acronym: '',
      definition: '',
    };
  };

  return (
    <JargonContext.Provider value={{
      jargonMode,
      setJargonMode,
      getText,
      getTerms,
    }}>
      {children}
    </JargonContext.Provider>
  );
}

export function useJargon() {
  const context = useContext(JargonContext);
  if (context === undefined) {
    throw new Error('useJargon must be used within a JargonProvider');
  }
  return context;
}

// Convenience hooks for common use cases
export function useText(key: string): string {
  const { getText } = useJargon();
  return getText(key);
}

export function useTerms(key: string) {
  const { getTerms } = useJargon();
  return getTerms(key);
}