/**
 * Pavement-related types for ISAC-OS
 */

import { BaseEntity } from './index';

export interface PavementSection extends BaseEntity {
  name: string;
  location: GeoLocation;
  surfaceType: SurfaceType;
  condition: PavementCondition;
  measurements: Measurement[];
}

export interface GeoLocation {
  latitude: number;
  longitude: number;
  elevation?: number;
}

export type SurfaceType = 'asphalt' | 'concrete' | 'gravel' | 'brick' | 'stone';

export interface PavementCondition {
  iri: number; // International Roughness Index
  pci: number; // Pavement Condition Index
  rutting: number;
  cracking: CrackingData;
  lastInspection: Date;
}

export interface CrackingData {
  longitudinal: number;
  transverse: number;
  alligator: number;
  block: number;
}

export interface Measurement extends BaseEntity {
  type: MeasurementType;
  value: number;
  unit: string;
  timestamp: Date;
  deviceId?: string;
  quality: QualityIndicator;
}

export type MeasurementType = 
  | 'temperature'
  | 'humidity'
  | 'stress'
  | 'strain'
  | 'displacement'
  | 'load'
  | 'vibration';

export type QualityIndicator = 'excellent' | 'good' | 'fair' | 'poor';

export interface AnalysisResult extends BaseEntity {
  sectionId: string;
  analysisType: AnalysisType;
  results: Record<string, any>;
  confidence: number;
  recommendations: string[];
  computedAt: Date;
}

export type AnalysisType = 
  | 'structural_integrity'
  | 'life_cycle_assessment'
  | 'maintenance_prediction'
  | 'performance_evaluation';