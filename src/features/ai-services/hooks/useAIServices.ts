import { useState, useCallback, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import axios from 'axios';
import { 
  PredictiveMaintenanceAnalysis,
  QualityControlAssessment,
  PredictiveInsights,
  PredictiveMaintenanceSchema,
  QualityControlSchema,
  PredictiveInsightsSchema
} from '../schemas/ai-services-schema';

// OpenAI API Configuration
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';

// Supabase client initialization
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!, 
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// AI Services Hook
export function useAIServices() {
  const [predictiveMaintenanceAnalyses, setPredictiveMaintenanceAnalyses] = useState<PredictiveMaintenanceAnalysis[]>([]);
  const [qualityControlAssessments, setQualityControlAssessments] = useState<QualityControlAssessment[]>([]);
  const [predictiveInsights, setPredictiveInsights] = useState<PredictiveInsights[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Predictive Maintenance Analysis
  const analyzePredictiveMaintenance = useCallback(async (
    equipmentId: string, 
    healthMetrics: any
  ) => {
    setIsLoading(true);
    setError(null);

    try {
      // Validate health metrics
      const validatedHealthMetrics = {
        ...healthMetrics,
        wear_percentage: calculateWearPercentage(healthMetrics)
      };

      // Determine maintenance risk level
      const maintenanceRiskLevel = determineMaintenanceRiskLevel(validatedHealthMetrics);

      // Predict failure probability
      const failureProbability = predictFailureProbability(validatedHealthMetrics);

      // Generate recommended actions
      const recommendedActions = generateMaintenanceRecommendations(
        maintenanceRiskLevel, 
        failureProbability
      );

      // Prepare predictive maintenance analysis
      const predictiveMaintenanceAnalysis: PredictiveMaintenanceAnalysis = {
        equipmentId,
        health_metrics: validatedHealthMetrics,
        maintenance_risk_level: maintenanceRiskLevel,
        failure_probability: failureProbability,
        recommended_actions: recommendedActions,
        recommended_maintenance_window: calculateMaintenanceWindow(),
        estimated_maintenance_cost: estimateMaintenanceCost(maintenanceRiskLevel),
        estimated_downtime_hours: estimateDowntime(maintenanceRiskLevel),
        analysis_timestamp: new Date(),
        analyzed_by: 'AI_MAINTENANCE_ENGINE'
      };

      // Validate the analysis
      const validatedAnalysis = PredictiveMaintenanceSchema.parse(predictiveMaintenanceAnalysis);

      // Save to Supabase
      const { data, error } = await supabase
        .from('predictive_maintenance_analyses')
        .insert(validatedAnalysis)
        .select();

      if (error) throw error;

      // Update local state
      setPredictiveMaintenanceAnalyses(prev => [...prev, validatedAnalysis]);

      return validatedAnalysis;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Predictive maintenance analysis failed';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Quality Control Assessment
  const assessQualityControl = useCallback(async (
    projectId: string, 
    measurementType: string, 
    qualityMetrics: any,
    analysisImages?: string[]
  ) => {
    setIsLoading(true);
    setError(null);

    try {
      // Determine overall quality level
      const qualityLevel = determineQualityLevel(qualityMetrics);

      // Calculate confidence score
      const confidenceScore = calculateConfidenceScore(qualityMetrics);

      // Generate improvement recommendations
      const improvementRecommendations = generateQualityImprovementRecommendations(
        qualityLevel, 
        qualityMetrics
      );

      // Determine if rework is required
      const reworkRequired = qualityLevel === 'needs_improvement' || qualityLevel === 'critical_failure';

      // Prepare quality control assessment
      const qualityControlAssessment: QualityControlAssessment = {
        projectId,
        measurement_type: measurementType as any,
        quality_metrics: qualityMetrics,
        quality_level: qualityLevel,
        confidence_score: confidenceScore,
        improvement_recommendations: improvementRecommendations,
        rework_required: reworkRequired,
        estimated_rework_cost: reworkRequired ? estimateReworkCost(qualityMetrics) : undefined,
        analysis_images: analysisImages?.map(url => ({ url })),
        analysis_timestamp: new Date(),
        analyzed_by: 'AI_QUALITY_CONTROL_ENGINE'
      };

      // Validate the assessment
      const validatedAssessment = QualityControlSchema.parse(qualityControlAssessment);

      // Save to Supabase
      const { data, error } = await supabase
        .from('quality_control_assessments')
        .insert(validatedAssessment)
        .select();

      if (error) throw error;

      // Update local state
      setQualityControlAssessments(prev => [...prev, validatedAssessment]);

      return validatedAssessment;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Quality control assessment failed';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Generate Predictive Insights
  const generatePredictiveInsights = useCallback(async (
    projectId: string
  ) => {
    setIsLoading(true);
    setError(null);

    try {
      // Fetch project-related data from various sources
      const projectData = await fetchProjectData(projectId);
      const maintenanceHistories = await fetchMaintenanceHistories(projectId);
      const performanceMetrics = await calculatePerformanceMetrics(projectData, maintenanceHistories);

      // Assess risk factors
      const riskFactors = assessProjectRisks(projectData, maintenanceHistories);

      // Generate optimization suggestions
      const optimizationSuggestions = generateOptimizationRecommendations(
        performanceMetrics, 
        riskFactors
      );

      // Calculate potential cost savings
      const potentialCostSavings = estimateCostSavings(
        performanceMetrics, 
        riskFactors
      );

      // Prepare predictive insights
      const predictiveInsights: PredictiveInsights = {
        projectId,
        performance_forecast: {
          expected_lifespan: performanceMetrics.expectedLifespan,
          predicted_maintenance_frequency: performanceMetrics.maintenanceFrequency,
          estimated_total_lifecycle_cost: performanceMetrics.totalLifecycleCost
        },
        risk_factors: {
          environmental_risk: riskFactors.environmentalRisk,
          usage_intensity_risk: riskFactors.usageIntensityRisk,
          material_degradation_risk: riskFactors.materialDegradationRisk
        },
        optimization_suggestions: optimizationSuggestions,
        potential_cost_savings: potentialCostSavings,
        analysis_timestamp: new Date(),
        analyzed_by: 'AI_PREDICTIVE_INSIGHTS_ENGINE'
      };

      // Validate the insights
      const validatedInsights = PredictiveInsightsSchema.parse(predictiveInsights);

      // Save to Supabase
      const { data, error } = await supabase
        .from('predictive_insights')
        .insert(validatedInsights)
        .select();

      if (error) throw error;

      // Update local state
      setPredictiveInsights(prev => [...prev, validatedInsights]);

      return validatedInsights;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Predictive insights generation failed';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    predictiveMaintenanceAnalyses,
    qualityControlAssessments,
    predictiveInsights,
    isLoading,
    error,
    analyzePredictiveMaintenance,
    assessQualityControl,
    generatePredictiveInsights
  };
}

// Utility Functions for AI Analysis
function calculateWearPercentage(healthMetrics: any): number {
  // Complex wear calculation based on multiple metrics
  const usageScore = (healthMetrics.usage_hours || 0) / 10000 * 50;
  const cycleScore = (healthMetrics.cycles_completed || 0) / 50000 * 30;
  const anomalyScore = (healthMetrics.anomaly_score || 0) / 100 * 20;

  return Math.min(100, usageScore + cycleScore + anomalyScore);
}

function determineMaintenanceRiskLevel(healthMetrics: any) {
  const wearPercentage = healthMetrics.wear_percentage;
  
  if (wearPercentage < 20) return 'low';
  if (wearPercentage < 50) return 'moderate';
  if (wearPercentage < 80) return 'high';
  return 'critical';
}

function predictFailureProbability(healthMetrics: any): number {
  const wearPercentage = healthMetrics.wear_percentage;
  const anomalyScore = healthMetrics.anomaly_score || 0;
  
  return Math.min(100, wearPercentage + anomalyScore);
}

function generateMaintenanceRecommendations(
  riskLevel: string, 
  failureProbability: number
): string[] {
  const recommendations: string[] = [];

  switch (riskLevel) {
    case 'low':
      recommendations.push('Continue regular maintenance');
      break;
    case 'moderate':
      recommendations.push('Schedule preventive maintenance');
      recommendations.push('Increase inspection frequency');
      break;
    case 'high':
      recommendations.push('Immediate maintenance recommended');
      recommendations.push('Consider component replacement');
      break;
    case 'critical':
      recommendations.push('Urgent equipment replacement required');
      recommendations.push('Cease operations until repairs completed');
      break;
  }

  if (failureProbability > 80) {
    recommendations.push('High risk of imminent failure');
  }

  return recommendations;
}

function calculateMaintenanceWindow() {
  const now = new Date();
  return {
    earliest_date: now,
    latest_date: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000) // 30 days from now
  };
}

function estimateMaintenanceCost(riskLevel: string): number {
  switch (riskLevel) {
    case 'low': return 500;
    case 'moderate': return 2000;
    case 'high': return 5000;
    case 'critical': return 15000;
    default: return 0;
  }
}

function estimateDowntime(riskLevel: string): number {
  switch (riskLevel) {
    case 'low': return 2;
    case 'moderate': return 8;
    case 'high': return 24;
    case 'critical': return 72;
    default: return 0;
  }
}

function determineQualityLevel(qualityMetrics: any) {
  const metrics = [
    qualityMetrics.surface_roughness,
    qualityMetrics.surface_evenness,
    qualityMetrics.asphalt_density,
    qualityMetrics.material_consistency,
    qualityMetrics.line_width_accuracy,
    qualityMetrics.line_color_uniformity
  ].filter(metric => metric !== undefined);

  const averageQuality = metrics.reduce((a, b) => a + b, 0) / metrics.length;

  if (averageQuality > 90) return 'excellent';
  if (averageQuality > 75) return 'good';
  if (averageQuality > 60) return 'acceptable';
  if (averageQuality > 40) return 'needs_improvement';
  return 'critical_failure';
}

function calculateConfidenceScore(qualityMetrics: any): number {
  const metrics = [
    qualityMetrics.surface_roughness,
    qualityMetrics.surface_evenness,
    qualityMetrics.asphalt_density,
    qualityMetrics.material_consistency,
    qualityMetrics.line_width_accuracy,
    qualityMetrics.line_color_uniformity
  ].filter(metric => metric !== undefined);

  return metrics.reduce((a, b) => a + b, 0) / metrics.length;
}

function generateQualityImprovementRecommendations(
  qualityLevel: string, 
  qualityMetrics: any
): string[] {
  const recommendations: string[] = [];

  switch (qualityLevel) {
    case 'excellent':
      recommendations.push('Maintain current high-quality standards');
      break;
    case 'good':
      recommendations.push('Minor refinements recommended');
      break;
    case 'acceptable':
      recommendations.push('Consider process improvements');
      break;
    case 'needs_improvement':
      recommendations.push('Significant process redesign required');
      recommendations.push('Retrain team on quality standards');
      break;
    case 'critical_failure':
      recommendations.push('Immediate corrective action needed');
      recommendations.push('Comprehensive quality management review');
      break;
  }

  // Specific metric-based recommendations
  if (qualityMetrics.surface_roughness && qualityMetrics.surface_roughness < 60) {
    recommendations.push('Address surface roughness issues');
  }

  if (qualityMetrics.line_width_accuracy && qualityMetrics.line_width_accuracy < 70) {
    recommendations.push('Improve line striping precision');
  }

  return recommendations;
}

function estimateReworkCost(qualityMetrics: any): number {
  const metrics = [
    qualityMetrics.surface_roughness,
    qualityMetrics.surface_evenness,
    qualityMetrics.asphalt_density,
    qualityMetrics.material_consistency,
    qualityMetrics.line_width_accuracy,
    qualityMetrics.line_color_uniformity
  ].filter(metric => metric !== undefined);

  const averageQuality = metrics.reduce((a, b) => a + b, 0) / metrics.length;
  return Math.max(1000, (100 - averageQuality) * 100);
}

// Placeholder functions for data fetching and analysis
async function fetchProjectData(projectId: string) {
  // Fetch project-related data from Supabase
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('id', projectId)
    .single();

  if (error) throw error;
  return data;
}

async function fetchMaintenanceHistories(projectId: string) {
  // Fetch maintenance histories from Supabase
  const { data, error } = await supabase
    .from('maintenance_records')
    .select('*')
    .eq('project_id', projectId);

  if (error) throw error;
  return data || [];
}

async function calculatePerformanceMetrics(
  projectData: any, 
  maintenanceHistories: any[]
) {
  // Complex performance metrics calculation
  return {
    expectedLifespan: 10, // years
    maintenanceFrequency: maintenanceHistories.length / 10, // times per year
    totalLifecycleCost: projectData.estimated_cost * 1.5
  };
}

function assessProjectRisks(
  projectData: any, 
  maintenanceHistories: any[]
) {
  // Complex risk assessment
  return {
    environmentalRisk: 40,
    usageIntensityRisk: 60,
    materialDegradationRisk: 50
  };
}

function generateOptimizationRecommendations(
  performanceMetrics: any, 
  riskFactors: any
): string[] {
  const recommendations: string[] = [];

  if (performanceMetrics.maintenanceFrequency > 2) {
    recommendations.push('Reduce maintenance frequency through proactive management');
  }

  if (riskFactors.materialDegradationRisk > 50) {
    recommendations.push('Investigate material selection and application techniques');
  }

  if (riskFactors.usageIntensityRisk > 70) {
    recommendations.push('Consider equipment upgrades or usage optimization');
  }

  return recommendations;
}

function estimateCostSavings(
  performanceMetrics: any, 
  riskFactors: any
): number {
  const maintenanceEfficiencySavings = performanceMetrics.maintenanceFrequency * 1000;
  const riskReductionSavings = (100 - riskFactors.materialDegradationRisk) * 50;

  return Math.max(0, maintenanceEfficiencySavings + riskReductionSavings);
}

// Specific hook for continuous AI monitoring
export function useAIMonitoring(projectId: string) {
  const { 
    generatePredictiveInsights, 
    isLoading, 
    error 
  } = useAIServices();

  useEffect(() => {
    const runAIMonitoring = async () => {
      try {
        await generatePredictiveInsights(projectId);
      } catch (err) {
        console.error('AI monitoring failed', err);
      }
    };

    // Initial monitoring
    runAIMonitoring();

    // Run monitoring every 24 hours
    const intervalId = setInterval(runAIMonitoring, 24 * 60 * 60 * 1000);

    // Cleanup interval on unmount
    return () => clearInterval(intervalId);
  }, [projectId, generatePredictiveInsights]);

  return { isLoading, error };
}