/**
 * Calculation utility functions for pavement analysis
 */

export function calculateMean(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

export function calculateMedian(values: number[]): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0
    ? (sorted[mid - 1] + sorted[mid]) / 2
    : sorted[mid];
}

export function calculateStandardDeviation(values: number[]): number {
  if (values.length === 0) return 0;
  const mean = calculateMean(values);
  const squaredDiffs = values.map(value => Math.pow(value - mean, 2));
  const avgSquaredDiff = calculateMean(squaredDiffs);
  return Math.sqrt(avgSquaredDiff);
}

export function calculatePCI(
  cracking: number,
  rutting: number,
  iri: number
): number {
  // Simplified PCI calculation (actual calculation is more complex)
  const crackingScore = Math.max(0, 100 - cracking * 10);
  const ruttingScore = Math.max(0, 100 - rutting * 20);
  const roughnessScore = Math.max(0, 100 - iri * 5);
  
  return Math.round((crackingScore + ruttingScore + roughnessScore) / 3);
}

export function calculateLoadCapacity(
  thickness: number,
  elasticModulus: number,
  poissonRatio: number
): number {
  // Simplified load capacity calculation
  const factor = (elasticModulus * Math.pow(thickness, 3)) / 
                 (12 * (1 - Math.pow(poissonRatio, 2)));
  return factor;
}

export function interpolateLinear(
  x: number,
  x1: number,
  y1: number,
  x2: number,
  y2: number
): number {
  if (x2 === x1) return y1;
  return y1 + ((x - x1) * (y2 - y1)) / (x2 - x1);
}