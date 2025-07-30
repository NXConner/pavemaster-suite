import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { useToast } from '@/hooks/use-toast';

// Types for jargon system
export type JargonMode = 'military' | 'civilian' | 'hybrid';
export type TerminologyContext = 'general' | 'tactical' | 'operations' | 'logistics' | 'personnel' | 'equipment' | 'communications' | 'security' | 'financial' | 'legal';

export interface TermMapping {
  id: string;
  civilian: string;
  military: string;
  context: TerminologyContext;
  description?: string;
  aliases?: string[];
  priority: number; // Higher number = higher priority for matching
  examples?: {
    civilian: string[];
    military: string[];
  };
}

export interface VeteranProfile {
  id: string;
  employeeId: string;
  branch: 'Army' | 'Navy' | 'Air Force' | 'Marines' | 'Coast Guard' | 'Space Force';
  rank: string;
  serviceYears: string;
  specializations: string[];
  securityClearance?: 'Confidential' | 'Secret' | 'Top Secret' | 'TS/SCI';
  combatExperience: boolean;
  leadershipExperience: boolean;
  technicalSkills: string[];
  preferredJargon: JargonMode;
  customTerminology: TermMapping[];
}

export interface JargonPreferences {
  mode: JargonMode;
  autoDetect: boolean;
  contextSensitive: boolean;
  showTooltips: boolean;
  pronunciationGuide: boolean;
  abbreviationExpansion: boolean;
  enabledContexts: TerminologyContext[];
  customMappings: TermMapping[];
}

export interface JargonState {
  mode: JargonMode;
  preferences: JargonPreferences;
  termMappings: TermMapping[];
  veteranProfiles: VeteranProfile[];
  currentProfile: VeteranProfile | null;
  isLoading: boolean;
  lastUpdated: string | null;
  statistics: {
    totalMappings: number;
    activeContexts: number;
    translationsApplied: number;
    veteranCount: number;
  };
}

type JargonAction =
  | { type: 'SET_MODE'; payload: JargonMode }
  | { type: 'UPDATE_PREFERENCES'; payload: Partial<JargonPreferences> }
  | { type: 'ADD_TERM_MAPPING'; payload: TermMapping }
  | { type: 'UPDATE_TERM_MAPPING'; payload: TermMapping }
  | { type: 'REMOVE_TERM_MAPPING'; payload: string }
  | { type: 'ADD_VETERAN_PROFILE'; payload: VeteranProfile }
  | { type: 'UPDATE_VETERAN_PROFILE'; payload: VeteranProfile }
  | { type: 'SET_CURRENT_PROFILE'; payload: VeteranProfile | null }
  | { type: 'BULK_LOAD_MAPPINGS'; payload: TermMapping[] }
  | { type: 'INCREMENT_TRANSLATION_COUNT' }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'RESET_STATE' };

// Default terminology mappings - comprehensive military/civilian dictionary
const defaultTermMappings: TermMapping[] = [
  // General Operations
  {
    id: 'op-001',
    civilian: 'meeting',
    military: 'briefing',
    context: 'general',
    priority: 10,
    description: 'A gathering to discuss information or plans',
    examples: {
      civilian: ['team meeting', 'project meeting', 'status meeting'],
      military: ['mission briefing', 'intel briefing', 'operational briefing']
    }
  },
  {
    id: 'op-002',
    civilian: 'task',
    military: 'mission',
    context: 'operations',
    priority: 10,
    description: 'An assigned piece of work or objective',
    examples: {
      civilian: ['project task', 'work assignment', 'action item'],
      military: ['combat mission', 'reconnaissance mission', 'support mission']
    }
  },
  {
    id: 'op-003',
    civilian: 'schedule',
    military: 'battle rhythm',
    context: 'operations',
    priority: 8,
    description: 'A planned sequence of events or activities',
    examples: {
      civilian: ['work schedule', 'project timeline', 'calendar'],
      military: ['operational tempo', 'duty roster', 'exercise schedule']
    }
  },
  {
    id: 'op-004',
    civilian: 'deadline',
    military: 'time hack',
    context: 'operations',
    priority: 9,
    description: 'A specific time by which something must be completed',
    examples: {
      civilian: ['project deadline', 'due date', 'completion date'],
      military: ['H-hour', 'zero hour', 'execution time']
    }
  },
  {
    id: 'op-005',
    civilian: 'update',
    military: 'sitrep',
    context: 'communications',
    priority: 10,
    description: 'Current status information',
    aliases: ['situation report'],
    examples: {
      civilian: ['status update', 'progress report', 'information update'],
      military: ['situation report', 'intelligence update', 'operational update']
    }
  },

  // Personnel & Leadership
  {
    id: 'per-001',
    civilian: 'supervisor',
    military: 'commanding officer',
    context: 'personnel',
    priority: 10,
    aliases: ['CO', 'commander'],
    description: 'Person in charge of operations or personnel',
    examples: {
      civilian: ['manager', 'supervisor', 'team lead'],
      military: ['commanding officer', 'platoon leader', 'section chief']
    }
  },
  {
    id: 'per-002',
    civilian: 'employee',
    military: 'service member',
    context: 'personnel',
    priority: 8,
    description: 'A person working for the organization',
    examples: {
      civilian: ['staff member', 'worker', 'team member'],
      military: ['soldier', 'sailor', 'airman', 'marine']
    }
  },
  {
    id: 'per-003',
    civilian: 'team',
    military: 'unit',
    context: 'personnel',
    priority: 9,
    description: 'A group of people working together',
    examples: {
      civilian: ['work team', 'project group', 'department'],
      military: ['squad', 'platoon', 'company', 'battalion']
    }
  },
  {
    id: 'per-004',
    civilian: 'training',
    military: 'exercise',
    context: 'personnel',
    priority: 8,
    description: 'Learning or practice activities',
    examples: {
      civilian: ['skills training', 'professional development', 'workshop'],
      military: ['field exercise', 'combat training', 'drill']
    }
  },

  // Tactical & Security
  {
    id: 'tac-001',
    civilian: 'plan',
    military: 'tactical plan',
    context: 'tactical',
    priority: 9,
    aliases: ['OPLAN', 'operational plan'],
    description: 'A detailed strategy for achieving objectives',
    examples: {
      civilian: ['business plan', 'project plan', 'strategy'],
      military: ['operational plan', 'battle plan', 'contingency plan']
    }
  },
  {
    id: 'tac-002',
    civilian: 'area',
    military: 'AOR',
    context: 'tactical',
    priority: 7,
    aliases: ['area of responsibility'],
    description: 'A designated geographical or functional zone',
    examples: {
      civilian: ['work area', 'territory', 'region'],
      military: ['area of operations', 'sector', 'zone']
    }
  },
  {
    id: 'tac-003',
    civilian: 'checkpoint',
    military: 'control point',
    context: 'tactical',
    priority: 8,
    aliases: ['CP'],
    description: 'A designated location for monitoring or control',
    examples: {
      civilian: ['inspection point', 'quality gate', 'milestone'],
      military: ['checkpoint', 'roadblock', 'observation post']
    }
  },

  // Equipment & Logistics
  {
    id: 'equ-001',
    civilian: 'equipment',
    military: 'gear',
    context: 'equipment',
    priority: 7,
    description: 'Tools, machinery, or apparatus used for work',
    examples: {
      civilian: ['tools', 'machinery', 'devices'],
      military: ['tactical gear', 'field equipment', 'ordnance']
    }
  },
  {
    id: 'equ-002',
    civilian: 'vehicle',
    military: 'transport',
    context: 'logistics',
    priority: 6,
    description: 'Means of transportation',
    examples: {
      civilian: ['truck', 'van', 'company car'],
      military: ['tactical vehicle', 'convoy', 'mobility asset']
    }
  },
  {
    id: 'equ-003',
    civilian: 'supplies',
    military: 'provisions',
    context: 'logistics',
    priority: 7,
    description: 'Materials needed for operations',
    examples: {
      civilian: ['materials', 'inventory', 'stock'],
      military: ['rations', 'ammunition', 'consumables']
    }
  },

  // Communications
  {
    id: 'com-001',
    civilian: 'message',
    military: 'transmission',
    context: 'communications',
    priority: 8,
    description: 'Information sent from one party to another',
    examples: {
      civilian: ['email', 'memo', 'notification'],
      military: ['radio traffic', 'signal', 'dispatch']
    }
  },
  {
    id: 'com-002',
    civilian: 'emergency',
    military: 'priority',
    context: 'communications',
    priority: 10,
    aliases: ['flash', 'immediate'],
    description: 'Urgent situation requiring immediate attention',
    examples: {
      civilian: ['crisis', 'urgent matter', 'critical issue'],
      military: ['flash traffic', 'emergency action', 'red alert']
    }
  },

  // Financial & Legal
  {
    id: 'fin-001',
    civilian: 'budget',
    military: 'funding allocation',
    context: 'financial',
    priority: 8,
    description: 'Financial resources allocated for specific purposes',
    examples: {
      civilian: ['project budget', 'financial plan', 'cost estimate'],
      military: ['appropriation', 'fiscal allocation', 'program funds']
    }
  },
  {
    id: 'leg-001',
    civilian: 'compliance',
    military: 'regulations adherence',
    context: 'legal',
    priority: 8,
    description: 'Following rules and requirements',
    examples: {
      civilian: ['regulatory compliance', 'policy adherence', 'standards'],
      military: ['standing orders', 'ROE compliance', 'protocol adherence']
    }
  }
];

const initialState: JargonState = {
  mode: 'civilian',
  preferences: {
    mode: 'civilian',
    autoDetect: true,
    contextSensitive: true,
    showTooltips: true,
    pronunciationGuide: false,
    abbreviationExpansion: true,
    enabledContexts: ['general', 'operations', 'personnel'],
    customMappings: []
  },
  termMappings: defaultTermMappings,
  veteranProfiles: [],
  currentProfile: null,
  isLoading: false,
  lastUpdated: null,
  statistics: {
    totalMappings: defaultTermMappings.length,
    activeContexts: 3,
    translationsApplied: 0,
    veteranCount: 0
  }
};

function jargonReducer(state: JargonState, action: JargonAction): JargonState {
  switch (action.type) {
    case 'SET_MODE':
      return {
        ...state,
        mode: action.payload,
        preferences: {
          ...state.preferences,
          mode: action.payload
        }
      };

    case 'UPDATE_PREFERENCES':
      return {
        ...state,
        preferences: {
          ...state.preferences,
          ...action.payload
        }
      };

    case 'ADD_TERM_MAPPING':
      return {
        ...state,
        termMappings: [...state.termMappings, action.payload],
        statistics: {
          ...state.statistics,
          totalMappings: state.statistics.totalMappings + 1
        }
      };

    case 'UPDATE_TERM_MAPPING':
      return {
        ...state,
        termMappings: state.termMappings.map(mapping =>
          mapping.id === action.payload.id ? action.payload : mapping
        )
      };

    case 'REMOVE_TERM_MAPPING':
      return {
        ...state,
        termMappings: state.termMappings.filter(mapping => mapping.id !== action.payload),
        statistics: {
          ...state.statistics,
          totalMappings: state.statistics.totalMappings - 1
        }
      };

    case 'ADD_VETERAN_PROFILE':
      return {
        ...state,
        veteranProfiles: [...state.veteranProfiles, action.payload],
        statistics: {
          ...state.statistics,
          veteranCount: state.statistics.veteranCount + 1
        }
      };

    case 'UPDATE_VETERAN_PROFILE':
      return {
        ...state,
        veteranProfiles: state.veteranProfiles.map(profile =>
          profile.id === action.payload.id ? action.payload : profile
        )
      };

    case 'SET_CURRENT_PROFILE':
      return {
        ...state,
        currentProfile: action.payload
      };

    case 'BULK_LOAD_MAPPINGS':
      return {
        ...state,
        termMappings: [...state.termMappings, ...action.payload],
        statistics: {
          ...state.statistics,
          totalMappings: state.termMappings.length + action.payload.length
        }
      };

    case 'INCREMENT_TRANSLATION_COUNT':
      return {
        ...state,
        statistics: {
          ...state.statistics,
          translationsApplied: state.statistics.translationsApplied + 1
        }
      };

    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload
      };

    case 'RESET_STATE':
      return initialState;

    default:
      return state;
  }
}

interface JargonContextType {
  state: JargonState;
  dispatch: React.Dispatch<JargonAction>;
  translateText: (text: string, targetMode?: JargonMode) => string;
  translateTerms: (terms: string[], targetMode?: JargonMode) => string[];
  findMappingsByContext: (context: TerminologyContext) => TermMapping[];
  addCustomMapping: (mapping: Omit<TermMapping, 'id'>) => void;
  toggleJargonMode: () => void;
  setJargonMode: (mode: JargonMode) => void;
  updatePreferences: (preferences: Partial<JargonPreferences>) => void;
  addVeteranProfile: (profile: Omit<VeteranProfile, 'id'>) => void;
  selectVeteranProfile: (profileId: string) => void;
  getContextualSuggestions: (text: string) => TermMapping[];
  exportSettings: () => string;
  importSettings: (settings: string) => Promise<void>;
  resetToDefaults: () => void;
}

const JargonContext = createContext<JargonContextType | undefined>(undefined);

export function JargonProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(jargonReducer, initialState);
  const { toast } = useToast();

  // Load saved preferences on mount
  useEffect(() => {
    const loadSavedPreferences = () => {
      try {
        const saved = localStorage.getItem('jargon-preferences');
        if (saved) {
          const preferences = JSON.parse(saved);
          dispatch({ type: 'UPDATE_PREFERENCES', payload: preferences });
        }

        const savedProfiles = localStorage.getItem('veteran-profiles');
        if (savedProfiles) {
          const profiles = JSON.parse(savedProfiles);
          profiles.forEach((profile: VeteranProfile) => {
            dispatch({ type: 'ADD_VETERAN_PROFILE', payload: profile });
          });
        }

        const savedMappings = localStorage.getItem('custom-mappings');
        if (savedMappings) {
          const mappings = JSON.parse(savedMappings);
          dispatch({ type: 'BULK_LOAD_MAPPINGS', payload: mappings });
        }
      } catch (error) {
        console.error('Error loading jargon preferences:', error);
      }
    };

    loadSavedPreferences();
  }, []);

  // Save preferences when they change
  useEffect(() => {
    localStorage.setItem('jargon-preferences', JSON.stringify(state.preferences));
  }, [state.preferences]);

  // Save profiles when they change
  useEffect(() => {
    localStorage.setItem('veteran-profiles', JSON.stringify(state.veteranProfiles));
  }, [state.veteranProfiles]);

  // Core translation function
  const translateText = (text: string, targetMode: JargonMode = state.mode): string => {
    if (!text || targetMode === 'hybrid') return text;

    let translatedText = text;
    const mappings = state.termMappings
      .filter(mapping => state.preferences.enabledContexts.includes(mapping.context))
      .sort((a, b) => b.priority - a.priority); // Higher priority first

    for (const mapping of mappings) {
      const sourceKey = targetMode === 'military' ? 'civilian' : 'military';
      const targetKey = targetMode === 'military' ? 'military' : 'civilian';
      
      const sourceTerms = [mapping[sourceKey], ...(mapping.aliases || [])];
      
      for (const sourceTerm of sourceTerms) {
        const regex = new RegExp(`\\b${sourceTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi');
        if (regex.test(translatedText)) {
          translatedText = translatedText.replace(regex, mapping[targetKey]);
          dispatch({ type: 'INCREMENT_TRANSLATION_COUNT' });
        }
      }
    }

    return translatedText;
  };

  // Translate array of terms
  const translateTerms = (terms: string[], targetMode: JargonMode = state.mode): string[] => {
    return terms.map(term => translateText(term, targetMode));
  };

  // Find mappings by context
  const findMappingsByContext = (context: TerminologyContext): TermMapping[] => {
    return state.termMappings.filter(mapping => mapping.context === context);
  };

  // Add custom mapping
  const addCustomMapping = (mapping: Omit<TermMapping, 'id'>) => {
    const newMapping: TermMapping = {
      ...mapping,
      id: `custom-${Date.now()}`
    };
    dispatch({ type: 'ADD_TERM_MAPPING', payload: newMapping });
    
    toast({
      title: "Custom mapping added",
      description: `"${mapping.civilian}" ↔ "${mapping.military}"`,
    });
  };

  // Toggle between modes
  const toggleJargonMode = () => {
    const modes: JargonMode[] = ['civilian', 'military', 'hybrid'];
    const currentIndex = modes.indexOf(state.mode);
    const nextMode = modes[(currentIndex + 1) % modes.length];
    setJargonMode(nextMode);
  };

  // Set specific mode
  const setJargonMode = (mode: JargonMode) => {
    dispatch({ type: 'SET_MODE', payload: mode });
    
    toast({
      title: "Jargon mode changed",
      description: `Switched to ${mode} terminology`,
      duration: 2000,
    });
  };

  // Update preferences
  const updatePreferences = (preferences: Partial<JargonPreferences>) => {
    dispatch({ type: 'UPDATE_PREFERENCES', payload: preferences });
  };

  // Add veteran profile
  const addVeteranProfile = (profile: Omit<VeteranProfile, 'id'>) => {
    const newProfile: VeteranProfile = {
      ...profile,
      id: `profile-${Date.now()}`
    };
    dispatch({ type: 'ADD_VETERAN_PROFILE', payload: newProfile });
    
    toast({
      title: "Veteran profile added",
      description: `Profile for ${profile.branch} ${profile.rank}`,
    });
  };

  // Select veteran profile
  const selectVeteranProfile = (profileId: string) => {
    const profile = state.veteranProfiles.find(p => p.id === profileId);
    if (profile) {
      dispatch({ type: 'SET_CURRENT_PROFILE', payload: profile });
      setJargonMode(profile.preferredJargon);
    }
  };

  // Get contextual suggestions
  const getContextualSuggestions = (text: string): TermMapping[] => {
    const words = text.toLowerCase().split(/\s+/);
    return state.termMappings.filter(mapping => {
      const allTerms = [
        mapping.civilian.toLowerCase(),
        mapping.military.toLowerCase(),
        ...(mapping.aliases || []).map(a => a.toLowerCase())
      ];
      return words.some(word => allTerms.some(term => term.includes(word)));
    });
  };

  // Export settings
  const exportSettings = (): string => {
    return JSON.stringify({
      preferences: state.preferences,
      customMappings: state.termMappings.filter(m => m.id.startsWith('custom-')),
      veteranProfiles: state.veteranProfiles
    }, null, 2);
  };

  // Import settings
  const importSettings = async (settings: string): Promise<void> => {
    try {
      const parsed = JSON.parse(settings);
      
      if (parsed.preferences) {
        dispatch({ type: 'UPDATE_PREFERENCES', payload: parsed.preferences });
      }
      
      if (parsed.customMappings) {
        dispatch({ type: 'BULK_LOAD_MAPPINGS', payload: parsed.customMappings });
      }
      
      if (parsed.veteranProfiles) {
        parsed.veteranProfiles.forEach((profile: VeteranProfile) => {
          dispatch({ type: 'ADD_VETERAN_PROFILE', payload: profile });
        });
      }
      
      toast({
        title: "Settings imported",
        description: "Jargon settings have been successfully imported",
      });
    } catch (error) {
      toast({
        title: "Import failed",
        description: "Invalid settings format",
        variant: "destructive",
      });
    }
  };

  // Reset to defaults
  const resetToDefaults = () => {
    dispatch({ type: 'RESET_STATE' });
    localStorage.removeItem('jargon-preferences');
    localStorage.removeItem('veteran-profiles');
    localStorage.removeItem('custom-mappings');
    
    toast({
      title: "Settings reset",
      description: "All jargon settings have been reset to defaults",
    });
  };

  const value: JargonContextType = {
    state,
    dispatch,
    translateText,
    translateTerms,
    findMappingsByContext,
    addCustomMapping,
    toggleJargonMode,
    setJargonMode,
    updatePreferences,
    addVeteranProfile,
    selectVeteranProfile,
    getContextualSuggestions,
    exportSettings,
    importSettings,
    resetToDefaults
  };

  return (
    <JargonContext.Provider value={value}>
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