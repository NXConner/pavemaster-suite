import { useState, useCallback, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { 
  AIPermission,
  AIActionLog,
  AsphaltKnowledge,
  AIProjectAction,
  EnhancedAIQuery,
  EnhancedAIResponse,
  AISettings,
  Notification,
  AILearning,
  AIPermissionSchema,
  AIActionLogSchema,
  AsphaltKnowledgeSchema,
  AIProjectActionSchema,
  EnhancedAIQuerySchema,
  EnhancedAIResponseSchema,
  AISettingsSchema,
  NotificationSchema,
  AILearningSchema
} from '../schemas/ai-assistant-schema';

// Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!, 
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Enhanced AI Assistant Hook with Full Project Control
export function useAIAssistant() {
  const [permissions, setPermissions] = useState<AIPermission | null>(null);
  const [settings, setSettings] = useState<AISettings | null>(null);
  const [actionLogs, setActionLogs] = useState<AIActionLog[]>([]);
  const [knowledgeDocuments, setKnowledgeDocuments] = useState<AsphaltKnowledge[]>([]);
  const [queries, setQueries] = useState<EnhancedAIQuery[]>([]);
  const [responses, setResponses] = useState<EnhancedAIResponse[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check if AI has permission for specific action
  const hasPermission = useCallback((action: string): boolean => {
    if (!permissions?.ai_enabled) return false;
    if (permissions.restricted_areas.includes(action)) return false;
    
    const permissionKey = action as keyof typeof permissions.permissions;
    return permissions.permissions[permissionKey] || false;
  }, [permissions]);

  // Log AI action
  const logAction = useCallback(async (
    actionType: AIActionLog['action_type'],
    resourceType: AIActionLog['resource_type'],
    resourceId?: string,
    actionDetails: any = {},
    success: boolean = true,
    errorMessage?: string,
    aiConfidence?: number
  ) => {
    try {
      const actionLog: AIActionLog = {
        user_id: 'current_user', // Replace with actual user ID
        action_type: actionType,
        resource_type: resourceType,
        resource_id: resourceId,
        action_details: actionDetails,
        success,
        error_message: errorMessage,
        ai_confidence: aiConfidence
      };

      const validatedLog = AIActionLogSchema.parse(actionLog);

      const { data, error } = await supabase
        .from('ai_action_logs')
        .insert(validatedLog)
        .select()
        .single();

      if (error) throw error;

      setActionLogs(prev => [data, ...prev.slice(0, 99)]); // Keep last 100 logs
      return data;
    } catch (err) {
      console.error('Failed to log action:', err);
    }
  }, []);

  // AI Project Management Functions
  const createProject = useCallback(async (projectData: any) => {
    if (!hasPermission('create_projects')) {
      throw new Error('AI does not have permission to create projects');
    }

    setIsLoading(true);
    setError(null);

    try {
      // Analyze project data for optimization
      const aiAnalysis = await analyzeProjectData(projectData);
      
      // Enhanced project data with AI recommendations
      const enhancedProjectData = {
        ...projectData,
        ai_analysis: aiAnalysis,
        estimated_cost: aiAnalysis.cost_estimate,
        recommended_timeline: aiAnalysis.timeline_recommendation,
        risk_factors: aiAnalysis.risks_identified,
        quality_requirements: aiAnalysis.quality_standards
      };

      const { data, error } = await supabase
        .from('projects')
        .insert(enhancedProjectData)
        .select()
        .single();

      if (error) throw error;

      await logAction('create', 'project', data.id, enhancedProjectData, true, undefined, aiAnalysis.confidence_score);

      // Create notification for successful project creation
      await createNotification({
        type: 'ai_suggestion',
        title: 'AI Created New Project',
        message: `Successfully created project "${data.title}" with AI-optimized parameters`,
        priority: 'medium',
        category: 'project_management',
        data: { project_id: data.id, ai_confidence: aiAnalysis.confidence_score }
      });

      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Project creation failed';
      setError(errorMessage);
      await logAction('create', 'project', undefined, projectData, false, errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [hasPermission, logAction]);

  // AI-Enhanced Search Function
  const searchProjects = useCallback(async (
    query: string,
    filters: any = {},
    includeAIRecommendations: boolean = true
  ) => {
    if (!hasPermission('search_projects')) {
      throw new Error('AI does not have permission to search projects');
    }

    setIsLoading(true);
    setError(null);

    try {
      // Build search query
      let searchQuery = supabase
        .from('projects')
        .select('*');

      // Apply filters
      if (filters.status) {
        searchQuery = searchQuery.eq('status', filters.status);
      }
      if (filters.location) {
        searchQuery = searchQuery.ilike('location', `%${filters.location}%`);
      }
      if (filters.work_type) {
        searchQuery = searchQuery.eq('work_type', filters.work_type);
      }

      // Apply text search if query provided
      if (query) {
        searchQuery = searchQuery.or(`title.ilike.%${query}%,description.ilike.%${query}%`);
      }

      const { data, error } = await searchQuery;

      if (error) throw error;

      let results = data || [];

      // Add AI recommendations if enabled
      if (includeAIRecommendations && results.length > 0) {
        results = await Promise.all(results.map(async (project) => {
          const recommendations = await generateProjectRecommendations(project);
          return {
            ...project,
            ai_recommendations: recommendations
          };
        }));
      }

      await logAction('read', 'project', undefined, { query, filters, results_count: results.length }, true);

      return results;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Search failed';
      setError(errorMessage);
      await logAction('read', 'project', undefined, { query, filters }, false, errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [hasPermission, logAction]);

  // AI Project Update Function
  const updateProject = useCallback(async (projectId: string, updates: any) => {
    if (!hasPermission('edit_projects')) {
      throw new Error('AI does not have permission to edit projects');
    }

    setIsLoading(true);
    setError(null);

    try {
      // Analyze the updates for potential improvements
      const updateAnalysis = await analyzeProjectUpdates(projectId, updates);
      
      // Enhanced updates with AI suggestions
      const enhancedUpdates = {
        ...updates,
        last_ai_update: new Date(),
        ai_confidence: updateAnalysis.confidence_score,
        ai_suggestions: updateAnalysis.suggestions
      };

      const { data, error } = await supabase
        .from('projects')
        .update(enhancedUpdates)
        .eq('id', projectId)
        .select()
        .single();

      if (error) throw error;

      await logAction('update', 'project', projectId, enhancedUpdates, true, undefined, updateAnalysis.confidence_score);

      // Create notification if significant changes detected
      if (updateAnalysis.significant_changes) {
        await createNotification({
          type: 'ai_suggestion',
          title: 'AI Updated Project',
          message: `Project "${data.title}" updated with AI-optimized parameters`,
          priority: updateAnalysis.risk_level === 'high' ? 'high' : 'medium',
          category: 'project_management',
          data: { project_id: projectId, changes: updateAnalysis.changes_summary }
        });
      }

      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Project update failed';
      setError(errorMessage);
      await logAction('update', 'project', projectId, updates, false, errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [hasPermission, logAction]);

  // AI Estimate Generation
  const generateEstimate = useCallback(async (projectData: any) => {
    if (!hasPermission('create_estimates')) {
      throw new Error('AI does not have permission to create estimates');
    }

    setIsLoading(true);
    setError(null);

    try {
      const estimate = await calculateAsphaltEstimate(projectData);
      
      const estimateData = {
        project_id: projectData.project_id,
        surface_area: projectData.surface_area,
        work_type: projectData.work_type,
        material_costs: estimate.material_costs,
        labor_costs: estimate.labor_costs,
        equipment_costs: estimate.equipment_costs,
        total_cost: estimate.total_cost,
        ai_confidence: estimate.confidence_score,
        breakdown: estimate.detailed_breakdown,
        recommendations: estimate.cost_optimization_tips,
        created_by: 'AI_ASSISTANT',
        created_at: new Date()
      };

      const { data, error } = await supabase
        .from('estimates')
        .insert(estimateData)
        .select()
        .single();

      if (error) throw error;

      await logAction('create', 'estimate', data.id, estimateData, true, undefined, estimate.confidence_score);

      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Estimate generation failed';
      setError(errorMessage);
      await logAction('create', 'estimate', undefined, projectData, false, errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [hasPermission, logAction]);

  // Enhanced Query Assistant with Project Control
  const queryAssistant = useCallback(async (
    query: string,
    queryType: EnhancedAIQuery['query_type'],
    intent: EnhancedAIQuery['intent'] = 'explain',
    context?: EnhancedAIQuery['context']
  ) => {
    setIsLoading(true);
    setError(null);

    try {
      const startTime = Date.now();

      // Create enhanced query record
      const assistantQuery: EnhancedAIQuery = {
        user_id: 'current_user',
        query,
        query_type: queryType,
        intent,
        context,
        session_id: `session_${Date.now()}`
      };

      const validatedQuery = EnhancedAIQuerySchema.parse(assistantQuery);

      // Save query to database
      const { data: queryData, error: queryError } = await supabase
        .from('ai_assistant_queries')
        .insert(validatedQuery)
        .select()
        .single();

      if (queryError) throw queryError;

      // Search asphalt knowledge base
      const relevantDocuments = await searchAsphaltKnowledge(query, queryType, context);

      // Generate comprehensive AI response
      const aiResponse = await generateAsphaltExpertResponse(
        query, 
        queryType, 
        intent, 
        relevantDocuments, 
        context
      );

      // Execute actions if intent requires it and AI has permission
      let actionResults = null;
      if (intent !== 'explain' && intent !== 'search') {
        actionResults = await executeAIAction(intent, queryType, aiResponse, context);
      }

      // Create comprehensive response
      const assistantResponse: EnhancedAIResponse = {
        query_id: queryData.id!,
        response: aiResponse.response,
        confidence_score: aiResponse.confidence,
        repair_recommendations: aiResponse.repairRecommendations || [],
        material_specifications: aiResponse.materialSpecs || [],
        safety_considerations: aiResponse.safetyConsiderations || [],
        quality_standards: aiResponse.qualityStandards || [],
        environmental_considerations: aiResponse.environmentalConsiderations || [],
        suggested_actions: aiResponse.suggestedActions || [],
        sources: relevantDocuments.map(doc => ({
          document_id: doc.id!,
          document_title: doc.title,
          relevance_score: doc.relevance_score || 0,
          excerpt: doc.excerpt
        })),
        cost_estimates: aiResponse.costEstimates,
        regulatory_alerts: aiResponse.regulatoryAlerts || [],
        recommendations: aiResponse.recommendations || [],
        follow_up_suggestions: aiResponse.followUpSuggestions || [],
        related_topics: aiResponse.relatedTopics || [],
        processing_time_ms: Date.now() - startTime
      };

      const validatedResponse = EnhancedAIResponseSchema.parse(assistantResponse);

      // Save response to database
      const { data: responseData, error: responseError } = await supabase
        .from('ai_assistant_responses')
        .insert(validatedResponse)
        .select()
        .single();

      if (responseError) throw responseError;

      // Update local state
      setQueries(prev => [queryData, ...prev.slice(0, 49)]);
      setResponses(prev => [responseData, ...prev.slice(0, 49)]);

      // Log the query action
      await logAction('read', 'document', undefined, { 
        query_type: queryType, 
        intent,
        confidence: aiResponse.confidence 
      }, true, undefined, aiResponse.confidence);

      return { ...responseData, actionResults };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'AI query failed';
      setError(errorMessage);
      await logAction('read', 'document', undefined, { query, query_type: queryType }, false, errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [logAction]);

  // Execute AI Actions based on intent
  const executeAIAction = useCallback(async (
    intent: string,
    queryType: string,
    aiResponse: any,
    context?: any
  ) => {
    const results: any = {};

    switch (intent) {
      case 'create':
        if (queryType === 'project_planning' && hasPermission('create_projects')) {
          if (aiResponse.suggestedProjectData) {
            results.createdProject = await createProject(aiResponse.suggestedProjectData);
          }
        }
        if (queryType === 'estimation' && hasPermission('create_estimates')) {
          if (context?.project_id || aiResponse.estimationData) {
            results.createdEstimate = await generateEstimate(
              context || aiResponse.estimationData
            );
          }
        }
        break;

      case 'update':
        if (context?.project_id && hasPermission('edit_projects')) {
          if (aiResponse.suggestedUpdates) {
            results.updatedProject = await updateProject(
              context.project_id,
              aiResponse.suggestedUpdates
            );
          }
        }
        break;

      case 'analyze':
        if (hasPermission('access_analytics')) {
          results.analysis = await generateAnalysisReport(queryType, context);
        }
        break;

      case 'recommend':
        results.recommendations = aiResponse.recommendations || [];
        break;
    }

    return results;
  }, [hasPermission, createProject, generateEstimate, updateProject]);

  // Load AI Settings
  const loadAISettings = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('ai_settings')
        .select('*')
        .eq('user_id', 'current_user')
        .single();

      if (error && error.code !== 'PGRST116') throw error;

      if (data) {
        setSettings(data);
      } else {
        // Create default settings
        const defaultSettings: AISettings = {
          user_id: 'current_user',
          ai_personality: 'professional',
          response_detail_level: 'detailed',
          auto_execute_safe_actions: false,
          require_confirmation_for: ['delete', 'financial'],
          preferred_units: 'imperial',
          cost_estimation_precision: 'moderate',
          include_regulatory_checks: true,
          enable_proactive_suggestions: true,
          max_suggestions_per_response: 5,
          learning_from_feedback: true
        };

        const { data: newSettings, error: createError } = await supabase
          .from('ai_settings')
          .insert(defaultSettings)
          .select()
          .single();

        if (createError) throw createError;
        setSettings(newSettings);
      }
    } catch (err) {
      console.error('Failed to load AI settings:', err);
    }
  }, []);

  // Load AI Permissions
  const loadAIPermissions = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('ai_permissions')
        .select('*')
        .eq('user_id', 'current_user')
        .single();

      if (error && error.code !== 'PGRST116') throw error;

      if (data) {
        setPermissions(data);
      } else {
        // Create default permissions
        const defaultPermissions: AIPermission = {
          user_id: 'current_user',
          ai_enabled: true,
          permissions: {
            create_projects: true,
            edit_projects: true,
            delete_projects: false,
            search_projects: true,
            create_estimates: true,
            edit_estimates: true,
            delete_estimates: false,
            create_team_members: false,
            edit_team_members: false,
            delete_team_members: false,
            create_equipment: true,
            edit_equipment: true,
            delete_equipment: false,
            create_invoices: true,
            edit_financial_data: false,
            delete_financial_records: false,
            create_schedules: true,
            edit_schedules: true,
            delete_schedules: false,
            edit_safety_protocols: true,
            create_compliance_reports: true,
            upload_documents: true,
            edit_knowledge_base: true,
            delete_documents: false,
            generate_reports: true,
            access_analytics: true,
            export_data: true
          },
          restricted_areas: [],
          max_operations_per_hour: 100,
          require_approval_for: ['delete_projects', 'edit_financial_data']
        };

        const { data: newPermissions, error: createError } = await supabase
          .from('ai_permissions')
          .insert(defaultPermissions)
          .select()
          .single();

        if (createError) throw createError;
        setPermissions(newPermissions);
      }
    } catch (err) {
      console.error('Failed to load AI permissions:', err);
    }
  }, []);

  // Update AI Permissions
  const updateAIPermissions = useCallback(async (newPermissions: Partial<AIPermission>) => {
    try {
      const { data, error } = await supabase
        .from('ai_permissions')
        .update(newPermissions)
        .eq('user_id', 'current_user')
        .select()
        .single();

      if (error) throw error;

      setPermissions(data);
      await logAction('update', 'project', 'ai_permissions', newPermissions, true);
    } catch (err) {
      console.error('Failed to update AI permissions:', err);
      throw err;
    }
  }, [logAction]);

  // Create Notification
  const createNotification = useCallback(async (notificationData: Partial<Notification>) => {
    try {
      const notification: Notification = {
        user_id: 'current_user',
        type: notificationData.type || 'ai_suggestion',
        title: notificationData.title || 'AI Notification',
        message: notificationData.message || '',
        priority: notificationData.priority || 'medium',
        category: notificationData.category || 'general',
        data: notificationData.data
      };

      const validatedNotification = NotificationSchema.parse(notification);

      const { data, error } = await supabase
        .from('notifications')
        .insert(validatedNotification)
        .select()
        .single();

      if (error) throw error;

      setNotifications(prev => [data, ...prev.slice(0, 49)]);
      return data;
    } catch (err) {
      console.error('Failed to create notification:', err);
    }
  }, []);

  // Load user notifications
  const loadNotifications = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', 'current_user')
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;

      setNotifications(data || []);
    } catch (err) {
      console.error('Failed to load notifications:', err);
    }
  }, []);

  // Mark notification as read
  const markNotificationRead = useCallback(async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true, updated_at: new Date() })
        .eq('id', notificationId);

      if (error) throw error;

      setNotifications(prev => 
        prev.map(n => n.id === notificationId ? { ...n, is_read: true } : n)
      );
    } catch (err) {
      console.error('Failed to mark notification as read:', err);
    }
  }, []);

  // Submit Learning Feedback
  const submitFeedback = useCallback(async (
    queryId: string,
    feedback: AILearning['user_feedback'],
    rating?: number,
    feedbackText?: string
  ) => {
    try {
      const learningData: AILearning = {
        query_id: queryId,
        user_feedback: feedback,
        rating,
        feedback_text: feedbackText
      };

      const validatedLearning = AILearningSchema.parse(learningData);

      const { error } = await supabase
        .from('ai_learning')
        .insert(validatedLearning);

      if (error) throw error;
    } catch (err) {
      console.error('Failed to submit feedback:', err);
    }
  }, []);

  // Load data on mount
  useEffect(() => {
    loadAISettings();
    loadAIPermissions();
    loadNotifications();
  }, [loadAISettings, loadAIPermissions, loadNotifications]);

  return {
    // State
    permissions,
    settings,
    actionLogs,
    knowledgeDocuments,
    queries,
    responses,
    notifications,
    isLoading,
    error,

    // Permission checks
    hasPermission,

    // Project management
    createProject,
    updateProject,
    searchProjects,
    generateEstimate,

    // Core AI functions
    queryAssistant,
    logAction,

    // Settings management
    updateAIPermissions,
    loadAISettings,
    loadAIPermissions,

    // Notifications
    createNotification,
    loadNotifications,
    markNotificationRead,
    submitFeedback
  };
}

// Utility Functions for Asphalt Expertise

async function analyzeProjectData(projectData: any) {
  // AI analysis of project data for optimization
  const analysis = {
    confidence_score: 85,
    cost_estimate: calculateProjectCost(projectData),
    timeline_recommendation: calculateTimeline(projectData),
    risks_identified: identifyProjectRisks(projectData),
    quality_standards: getQualityRequirements(projectData),
    material_recommendations: getMaterialRecommendations(projectData)
  };

  return analysis;
}

async function analyzeProjectUpdates(projectId: string, updates: any) {
  // Analyze the impact of project updates
  return {
    confidence_score: 90,
    significant_changes: Object.keys(updates).length > 3,
    risk_level: updates.budget_change > 20 ? 'high' : 'medium',
    suggestions: ['Consider weather impact', 'Update material orders'],
    changes_summary: `Updated ${Object.keys(updates).join(', ')}`
  };
}

async function calculateAsphaltEstimate(projectData: any) {
  // Comprehensive asphalt project estimation
  const materialCosts = calculateMaterialCosts(projectData);
  const laborCosts = calculateLaborCosts(projectData);
  const equipmentCosts = calculateEquipmentCosts(projectData);

  return {
    material_costs: materialCosts,
    labor_costs: laborCosts,
    equipment_costs: equipmentCosts,
    total_cost: materialCosts + laborCosts + equipmentCosts,
    confidence_score: 88,
    detailed_breakdown: generateCostBreakdown(projectData),
    cost_optimization_tips: [
      'Consider bulk material ordering for 15% savings',
      'Schedule during off-peak season for labor savings',
      'Use recycled asphalt content where appropriate'
    ]
  };
}

async function searchAsphaltKnowledge(
  query: string,
  queryType: string,
  context?: any
): Promise<Array<AsphaltKnowledge & { relevance_score?: number; excerpt?: string }>> {
  try {
    // Enhanced search with asphalt-specific categories
    const { data, error } = await supabase
      .from('knowledge_documents')
      .select('*')
      .eq('is_active', true)
      .contains('asphalt_categories', [getAsphaltCategory(queryType)])
      .ilike('content', `%${query}%`)
      .limit(5);

    if (error) throw error;

    return (data || []).map(doc => ({
      ...doc,
      relevance_score: calculateRelevanceScore(doc, query, context),
      excerpt: extractRelevantExcerpt(doc.content, query)
    }));
  } catch (err) {
    console.error('Asphalt knowledge search failed:', err);
    return [];
  }
}

async function generateAsphaltExpertResponse(
  query: string,
  queryType: string,
  intent: string,
  relevantDocuments: any[],
  context?: any
) {
  // Generate expert response based on asphalt knowledge
  const expertiseMap = getAsphaltExpertise(queryType, query, context);
  
  return {
    response: `Based on asphalt industry expertise for ${queryType}: ${expertiseMap.guidance}`,
    confidence: expertiseMap.confidence,
    repairRecommendations: expertiseMap.repairRecommendations,
    materialSpecs: expertiseMap.materialSpecs,
    safetyConsiderations: expertiseMap.safetyConsiderations,
    qualityStandards: expertiseMap.qualityStandards,
    environmentalConsiderations: expertiseMap.environmentalConsiderations,
    suggestedActions: expertiseMap.suggestedActions,
    costEstimates: expertiseMap.costEstimates,
    regulatoryAlerts: expertiseMap.regulatoryAlerts,
    recommendations: expertiseMap.recommendations,
    followUpSuggestions: expertiseMap.followUpSuggestions,
    relatedTopics: expertiseMap.relatedTopics
  };
}

// Helper functions (simplified implementations)
function calculateProjectCost(projectData: any): number {
  return projectData.surface_area * 8.50; // $8.50 per sq ft average
}

function calculateTimeline(projectData: any): string {
  const days = Math.ceil(projectData.surface_area / 1000); // 1000 sq ft per day
  return `${days} working days`;
}

function identifyProjectRisks(projectData: any): string[] {
  const risks = [];
  if (projectData.season === 'winter') risks.push('Weather delays');
  if (projectData.budget < calculateProjectCost(projectData) * 1.1) risks.push('Budget constraints');
  return risks;
}

function getQualityRequirements(projectData: any): string[] {
  return ['ASTM D3515 compliance', 'Minimum 4" thickness', 'Proper compaction'];
}

function getMaterialRecommendations(projectData: any): string[] {
  return ['19mm dense graded mix', 'Hot mix asphalt', 'Proper tack coat'];
}

function calculateMaterialCosts(projectData: any): number {
  return projectData.surface_area * 3.25; // Material cost per sq ft
}

function calculateLaborCosts(projectData: any): number {
  return projectData.surface_area * 2.50; // Labor cost per sq ft
}

function calculateEquipmentCosts(projectData: any): number {
  return projectData.surface_area * 1.75; // Equipment cost per sq ft
}

function generateCostBreakdown(projectData: any): any[] {
  return [
    { item: 'Asphalt Mix', quantity: projectData.surface_area, unit_cost: 3.25, total_cost: calculateMaterialCosts(projectData) },
    { item: 'Labor', quantity: projectData.surface_area, unit_cost: 2.50, total_cost: calculateLaborCosts(projectData) },
    { item: 'Equipment', quantity: projectData.surface_area, unit_cost: 1.75, total_cost: calculateEquipmentCosts(projectData) }
  ];
}

function getAsphaltCategory(queryType: string): string {
  const categoryMap: Record<string, string> = {
    'repair_guidance': 'driveway_repair',
    'estimation': 'cost_estimation',
    'safety_guidance': 'safety_procedures',
    'material_selection': 'material_selection'
  };
  return categoryMap[queryType] || 'project_planning';
}

function calculateRelevanceScore(doc: any, query: string, context?: any): number {
  let score = 0;
  if (doc.content.toLowerCase().includes(query.toLowerCase())) score += 50;
  if (context?.work_type && doc.repair_types.includes(context.work_type)) score += 30;
  return Math.min(100, score + Math.random() * 20);
}

function extractRelevantExcerpt(content: string, query: string): string {
  const queryIndex = content.toLowerCase().indexOf(query.toLowerCase());
  if (queryIndex === -1) return content.substring(0, 200) + '...';
  
  const start = Math.max(0, queryIndex - 100);
  const end = Math.min(content.length, queryIndex + 200);
  return content.substring(start, end) + '...';
}

function getAsphaltExpertise(queryType: string, query: string, context?: any) {
  // Comprehensive asphalt expertise mapping
  const expertiseMap: Record<string, any> = {
    'repair_guidance': {
      guidance: "For asphalt repairs, assess damage type first. Crack sealing for hairline cracks, patching for potholes, and overlay for widespread surface damage.",
      confidence: 92,
      repairRecommendations: [
        {
          repair_type: "Crack Sealing",
          priority: "high",
          description: "Address cracks before they allow water penetration",
          estimated_cost: 0.75,
          timeline: "1-2 days",
          materials_needed: ["Hot pour crack sealant", "Crack router", "Squeegee"],
          equipment_required: ["Crack sealing machine", "Router", "Torch"],
          weather_requirements: "Dry conditions, temperature above 40°F"
        }
      ],
      materialSpecs: [
        {
          material_type: "Hot Mix Asphalt",
          specification: "ASTM D3515, 19mm dense graded",
          quantity: "Based on repair area depth",
          supplier_recommendations: ["Local asphalt plant", "Regional suppliers"],
          cost_per_unit: 85.00
        }
      ],
      safetyConsiderations: [
        {
          hazard_type: "Hot materials",
          safety_measure: "Use heat-resistant gloves and face protection",
          required_ppe: ["Heat-resistant gloves", "Safety glasses", "Hard hat"],
          training_required: true
        }
      ]
    },
    'estimation': {
      guidance: "Accurate asphalt estimation requires surface area calculation, depth requirements, material specifications, and current pricing.",
      confidence: 88,
      costEstimates: {
        material_cost: context?.surface_area ? calculateMaterialCosts(context) : undefined,
        labor_cost: context?.surface_area ? calculateLaborCosts(context) : undefined,
        equipment_cost: context?.surface_area ? calculateEquipmentCosts(context) : undefined,
        total_estimate: context?.surface_area ? calculateProjectCost(context) : undefined,
        confidence_level: "High - based on current market rates"
      }
    }
  };

  return expertiseMap[queryType] || {
    guidance: "I can help with asphalt driveway and parking lot repairs. Please specify your needs.",
    confidence: 70,
    repairRecommendations: [],
    recommendations: ["Provide more context", "Specify repair type", "Include surface area"],
    followUpSuggestions: ["What type of damage are you seeing?", "What's the surface area?"],
    relatedTopics: ["Asphalt Repair", "Maintenance", "Cost Estimation"]
  };
}

async function generateProjectRecommendations(project: any) {
  // Generate AI recommendations for existing projects
  return [
    "Consider preventive maintenance schedule",
    "Monitor for drainage issues",
    "Plan material orders 2 weeks in advance"
  ];
}

async function generateAnalysisReport(queryType: string, context?: any) {
  // Generate comprehensive analysis reports
  return {
    analysis_type: queryType,
    summary: "Analysis complete",
    findings: ["Key insight 1", "Key insight 2"],
    recommendations: ["Action 1", "Action 2"]
  };
}