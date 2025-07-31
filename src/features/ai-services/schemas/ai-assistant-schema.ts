import { z } from 'zod';

// AI Permission Schema
export const AIPermissionSchema = z.object({
  id: z.string().uuid().optional(),
  user_id: z.string(),
  ai_enabled: z.boolean().default(true),
  permissions: z.object({
    // CRUD Operations
    create_projects: z.boolean().default(true),
    edit_projects: z.boolean().default(true),
    delete_projects: z.boolean().default(false),
    search_projects: z.boolean().default(true),
    
    // Data Management
    create_estimates: z.boolean().default(true),
    edit_estimates: z.boolean().default(true),
    delete_estimates: z.boolean().default(false),
    
    // Team Management
    create_team_members: z.boolean().default(false),
    edit_team_members: z.boolean().default(false),
    delete_team_members: z.boolean().default(false),
    
    // Equipment Management
    create_equipment: z.boolean().default(true),
    edit_equipment: z.boolean().default(true),
    delete_equipment: z.boolean().default(false),
    
    // Financial Operations
    create_invoices: z.boolean().default(true),
    edit_financial_data: z.boolean().default(false),
    delete_financial_records: z.boolean().default(false),
    
    // Scheduling
    create_schedules: z.boolean().default(true),
    edit_schedules: z.boolean().default(true),
    delete_schedules: z.boolean().default(false),
    
    // Safety & Compliance
    edit_safety_protocols: z.boolean().default(true),
    create_compliance_reports: z.boolean().default(true),
    
    // Knowledge Base
    upload_documents: z.boolean().default(true),
    edit_knowledge_base: z.boolean().default(true),
    delete_documents: z.boolean().default(false),
    
    // Analytics & Reporting
    generate_reports: z.boolean().default(true),
    access_analytics: z.boolean().default(true),
    export_data: z.boolean().default(true)
  }),
  restricted_areas: z.array(z.string()).default([]),
  max_operations_per_hour: z.number().default(100),
  require_approval_for: z.array(z.string()).default(['delete_projects', 'edit_financial_data']),
  created_at: z.date().default(() => new Date()),
  updated_at: z.date().optional()
});

// AI Action Log Schema
export const AIActionLogSchema = z.object({
  id: z.string().uuid().optional(),
  user_id: z.string(),
  action_type: z.enum([
    'create', 'read', 'update', 'delete',
    'search', 'generate', 'analyze', 'export'
  ]),
  resource_type: z.enum([
    'project', 'estimate', 'team_member', 'equipment',
    'invoice', 'schedule', 'document', 'report'
  ]),
  resource_id: z.string().optional(),
  action_details: z.record(z.any()),
  success: z.boolean(),
  error_message: z.string().optional(),
  ai_confidence: z.number().min(0).max(100).optional(),
  user_approved: z.boolean().optional(),
  timestamp: z.date().default(() => new Date())
});

// Enhanced Knowledge Document Schema for Asphalt Expertise
export const AsphaltKnowledgeSchema = z.object({
  id: z.string().uuid().optional(),
  title: z.string().min(1, 'Title is required'),
  document_type: z.enum([
    'federal_regulation',
    'state_regulation', 
    'industry_standard',
    'company_policy',
    'best_practices',
    'technical_specification',
    'safety_guideline',
    'estimation_guide',
    'accounting_procedure',
    'equipment_manual',
    'training_material',
    'repair_procedure',
    'material_specification',
    'quality_standard',
    'environmental_guideline'
  ]),
  content: z.string().min(1, 'Content is required'),
  asphalt_categories: z.array(z.enum([
    'driveway_repair',
    'parking_lot_maintenance',
    'pothole_repair',
    'crack_sealing',
    'sealcoating',
    'line_striping',
    'surface_preparation',
    'material_selection',
    'equipment_operation',
    'quality_control',
    'environmental_compliance',
    'safety_procedures',
    'cost_estimation',
    'project_planning'
  ])).default([]),
  repair_types: z.array(z.enum([
    'minor_crack_repair',
    'major_crack_repair',
    'pothole_patching',
    'full_depth_repair',
    'surface_overlay',
    'mill_and_fill',
    'preventive_maintenance',
    'drainage_repair',
    'edge_repair',
    'joint_sealing'
  ])).default([]),
  applicable_surfaces: z.array(z.enum([
    'asphalt_concrete',
    'portland_cement_concrete',
    'composite_pavement',
    'gravel',
    'crushed_stone',
    'recycled_asphalt'
  ])).default([]),
  tags: z.array(z.string()).default([]),
  source: z.string().optional(),
  version: z.string().optional(),
  effective_date: z.date().optional(),
  uploaded_by: z.string(),
  uploaded_at: z.date().default(() => new Date()),
  file_url: z.string().url().optional(),
  extracted_text: z.string().optional(),
  embeddings: z.array(z.number()).optional(),
  is_active: z.boolean().default(true),
  access_level: z.enum(['public', 'internal', 'restricted']).default('internal')
});

// AI Project Management Schema
export const AIProjectActionSchema = z.object({
  id: z.string().uuid().optional(),
  project_id: z.string().optional(),
  action_type: z.enum([
    'create_project',
    'update_project_status',
    'add_team_member',
    'update_estimate',
    'schedule_work',
    'create_report',
    'update_equipment',
    'log_progress',
    'quality_check',
    'safety_inspection'
  ]),
  ai_analysis: z.object({
    confidence_score: z.number().min(0).max(100),
    reasoning: z.string(),
    risks_identified: z.array(z.string()).default([]),
    recommendations: z.array(z.string()).default([]),
    cost_impact: z.number().optional(),
    timeline_impact: z.number().optional()
  }),
  proposed_changes: z.record(z.any()),
  requires_approval: z.boolean().default(false),
  approved_by: z.string().optional(),
  approved_at: z.date().optional(),
  executed_at: z.date().optional(),
  created_at: z.date().default(() => new Date())
});

// Enhanced AI Assistant Query Schema
export const EnhancedAIQuerySchema = z.object({
  id: z.string().uuid().optional(),
  user_id: z.string(),
  session_id: z.string().optional(),
  query: z.string().min(1, 'Query is required'),
  query_type: z.enum([
    'estimation',
    'regulation_lookup',
    'best_practices',
    'troubleshooting',
    'safety_guidance',
    'accounting_advice',
    'equipment_guidance',
    'project_planning',
    'quality_standards',
    'repair_guidance',
    'material_selection',
    'cost_optimization',
    'schedule_planning',
    'team_management',
    'general_inquiry',
    'data_analysis',
    'report_generation'
  ]),
  intent: z.enum([
    'search', 'create', 'update', 'delete', 'analyze', 'recommend', 'explain'
  ]).optional(),
  context: z.object({
    project_id: z.string().optional(),
    location: z.string().optional(),
    work_type: z.string().optional(),
    surface_type: z.string().optional(),
    repair_type: z.string().optional(),
    urgency_level: z.enum(['low', 'medium', 'high', 'critical']).optional(),
    budget_range: z.string().optional(),
    timeline: z.string().optional(),
    weather_conditions: z.string().optional()
  }).optional(),
  timestamp: z.date().default(() => new Date())
});

// Enhanced AI Assistant Response Schema
export const EnhancedAIResponseSchema = z.object({
  id: z.string().uuid().optional(),
  query_id: z.string(),
  response: z.string().min(1, 'Response is required'),
  confidence_score: z.number().min(0).max(100),
  
  // Asphalt-specific expertise
  repair_recommendations: z.array(z.object({
    repair_type: z.string(),
    priority: z.enum(['low', 'medium', 'high', 'critical']),
    description: z.string(),
    estimated_cost: z.number().optional(),
    timeline: z.string().optional(),
    materials_needed: z.array(z.string()).default([]),
    equipment_required: z.array(z.string()).default([]),
    weather_requirements: z.string().optional()
  })).default([]),
  
  material_specifications: z.array(z.object({
    material_type: z.string(),
    specification: z.string(),
    quantity: z.string().optional(),
    supplier_recommendations: z.array(z.string()).default([]),
    cost_per_unit: z.number().optional()
  })).default([]),
  
  safety_considerations: z.array(z.object({
    hazard_type: z.string(),
    safety_measure: z.string(),
    required_ppe: z.array(z.string()).default([]),
    training_required: z.boolean().default(false)
  })).default([]),
  
  quality_standards: z.array(z.object({
    standard_type: z.string(),
    requirement: z.string(),
    testing_method: z.string().optional(),
    acceptance_criteria: z.string().optional()
  })).default([]),
  
  environmental_considerations: z.array(z.object({
    consideration_type: z.string(),
    requirement: z.string(),
    compliance_standard: z.string().optional()
  })).default([]),
  
  // Action recommendations
  suggested_actions: z.array(z.object({
    action_type: z.string(),
    description: z.string(),
    priority: z.enum(['low', 'medium', 'high']),
    estimated_duration: z.string().optional(),
    resource_requirements: z.array(z.string()).default([])
  })).default([]),
  
  sources: z.array(z.object({
    document_id: z.string(),
    document_title: z.string(),
    relevance_score: z.number().min(0).max(100),
    excerpt: z.string().optional()
  })).default([]),
  
  cost_estimates: z.object({
    material_cost: z.number().optional(),
    labor_cost: z.number().optional(),
    equipment_cost: z.number().optional(),
    permit_cost: z.number().optional(),
    total_estimate: z.number().optional(),
    confidence_level: z.string().optional(),
    cost_breakdown: z.array(z.object({
      item: z.string(),
      quantity: z.number(),
      unit_cost: z.number(),
      total_cost: z.number()
    })).default([])
  }).optional(),
  
  regulatory_alerts: z.array(z.object({
    regulation_type: z.string(),
    description: z.string(),
    compliance_deadline: z.date().optional(),
    severity: z.enum(['info', 'warning', 'critical'])
  })).default([]),
  
  recommendations: z.array(z.string()).default([]),
  follow_up_suggestions: z.array(z.string()).default([]),
  related_topics: z.array(z.string()).default([]),
  
  generated_at: z.date().default(() => new Date()),
  processing_time_ms: z.number().optional()
});

// AI Settings Schema
export const AISettingsSchema = z.object({
  id: z.string().uuid().optional(),
  user_id: z.string(),
  ai_personality: z.enum(['professional', 'friendly', 'technical', 'concise']).default('professional'),
  response_detail_level: z.enum(['basic', 'detailed', 'comprehensive']).default('detailed'),
  auto_execute_safe_actions: z.boolean().default(false),
  require_confirmation_for: z.array(z.string()).default(['delete', 'financial']),
  preferred_units: z.enum(['imperial', 'metric']).default('imperial'),
  cost_estimation_precision: z.enum(['rough', 'moderate', 'precise']).default('moderate'),
  include_regulatory_checks: z.boolean().default(true),
  enable_proactive_suggestions: z.boolean().default(true),
  max_suggestions_per_response: z.number().min(1).max(10).default(5),
  learning_from_feedback: z.boolean().default(true),
  updated_at: z.date().default(() => new Date())
});

// Export types
export type AIPermission = z.infer<typeof AIPermissionSchema>;
export type AIActionLog = z.infer<typeof AIActionLogSchema>;
export type AsphaltKnowledge = z.infer<typeof AsphaltKnowledgeSchema>;
export type AIProjectAction = z.infer<typeof AIProjectActionSchema>;
export type EnhancedAIQuery = z.infer<typeof EnhancedAIQuerySchema>;
export type EnhancedAIResponse = z.infer<typeof EnhancedAIResponseSchema>;
export type AISettings = z.infer<typeof AISettingsSchema>;

// Legacy schemas for backward compatibility
export const KnowledgeDocumentSchema = AsphaltKnowledgeSchema;
export const AIAssistantQuerySchema = EnhancedAIQuerySchema;
export const AIAssistantResponseSchema = EnhancedAIResponseSchema;
export const NotificationSchema = z.object({
  id: z.string().uuid().optional(),
  user_id: z.string(),
  type: z.enum([
    'regulation_update',
    'safety_alert',
    'best_practice_tip',
    'equipment_maintenance',
    'cost_optimization',
    'weather_advisory',
    'compliance_reminder',
    'training_reminder',
    'ai_suggestion',
    'approval_required'
  ]),
  title: z.string().min(1, 'Title is required'),
  message: z.string().min(1, 'Message is required'),
  priority: z.enum(['low', 'medium', 'high', 'critical']).default('medium'),
  category: z.string(),
  data: z.record(z.any()).optional(),
  is_read: z.boolean().default(false),
  expires_at: z.date().optional(),
  created_at: z.date().default(() => new Date()),
  updated_at: z.date().optional()
});

export const AILearningSchema = z.object({
  id: z.string().uuid().optional(),
  query_id: z.string(),
  user_feedback: z.enum(['helpful', 'somewhat_helpful', 'not_helpful']),
  rating: z.number().min(1).max(5).optional(),
  feedback_text: z.string().optional(),
  suggested_improvements: z.string().optional(),
  created_at: z.date().default(() => new Date())
});

export type KnowledgeDocument = z.infer<typeof KnowledgeDocumentSchema>;
export type AIAssistantQuery = z.infer<typeof AIAssistantQuerySchema>;
export type AIAssistantResponse = z.infer<typeof AIAssistantResponseSchema>;
export type Notification = z.infer<typeof NotificationSchema>;
export type AILearning = z.infer<typeof AILearningSchema>;