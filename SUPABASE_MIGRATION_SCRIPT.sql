-- AI Assistant System Migration Script for Supabase
-- This script creates all necessary tables for the AI assistant functionality

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enable vector extension for embeddings (requires pgvector)
CREATE EXTENSION IF NOT EXISTS vector;

-- AI Permissions Table
CREATE TABLE ai_permissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT NOT NULL,
  ai_enabled BOOLEAN DEFAULT true,
  permissions JSONB NOT NULL DEFAULT '{
    "create_projects": true,
    "edit_projects": true,
    "delete_projects": false,
    "search_projects": true,
    "create_estimates": true,
    "edit_estimates": true,
    "delete_estimates": false,
    "create_team_members": false,
    "edit_team_members": false,
    "delete_team_members": false,
    "create_equipment": true,
    "edit_equipment": true,
    "delete_equipment": false,
    "create_invoices": true,
    "edit_financial_data": false,
    "delete_financial_records": false,
    "create_schedules": true,
    "edit_schedules": true,
    "delete_schedules": false,
    "edit_safety_protocols": true,
    "create_compliance_reports": true,
    "upload_documents": true,
    "edit_knowledge_base": true,
    "delete_documents": false,
    "generate_reports": true,
    "access_analytics": true,
    "export_data": true
  }',
  restricted_areas TEXT[] DEFAULT '{}',
  max_operations_per_hour INTEGER DEFAULT 100,
  require_approval_for TEXT[] DEFAULT '{"delete_projects", "edit_financial_data"}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- AI Action Logs Table
CREATE TABLE ai_action_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT NOT NULL,
  action_type TEXT NOT NULL CHECK (action_type IN ('create', 'read', 'update', 'delete', 'search', 'generate', 'analyze', 'export')),
  resource_type TEXT NOT NULL CHECK (resource_type IN ('project', 'estimate', 'team_member', 'equipment', 'invoice', 'schedule', 'document', 'report')),
  resource_id TEXT,
  action_details JSONB DEFAULT '{}',
  success BOOLEAN NOT NULL,
  error_message TEXT,
  ai_confidence INTEGER CHECK (ai_confidence >= 0 AND ai_confidence <= 100),
  user_approved BOOLEAN,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enhanced Knowledge Documents Table
CREATE TABLE knowledge_documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  document_type TEXT NOT NULL CHECK (document_type IN (
    'federal_regulation', 'state_regulation', 'industry_standard', 'company_policy',
    'best_practices', 'technical_specification', 'safety_guideline', 'estimation_guide',
    'accounting_procedure', 'equipment_manual', 'training_material', 'repair_procedure',
    'material_specification', 'quality_standard', 'environmental_guideline'
  )),
  content TEXT NOT NULL,
  asphalt_categories TEXT[] DEFAULT '{}' CHECK (
    array_length(asphalt_categories, 1) IS NULL OR 
    NOT (asphalt_categories && ARRAY[
      'driveway_repair', 'parking_lot_maintenance', 'pothole_repair', 'crack_sealing',
      'sealcoating', 'line_striping', 'surface_preparation', 'material_selection',
      'equipment_operation', 'quality_control', 'environmental_compliance',
      'safety_procedures', 'cost_estimation', 'project_planning'
    ] = FALSE)
  ),
  repair_types TEXT[] DEFAULT '{}' CHECK (
    array_length(repair_types, 1) IS NULL OR 
    NOT (repair_types && ARRAY[
      'minor_crack_repair', 'major_crack_repair', 'pothole_patching', 'full_depth_repair',
      'surface_overlay', 'mill_and_fill', 'preventive_maintenance', 'drainage_repair',
      'edge_repair', 'joint_sealing'
    ] = FALSE)
  ),
  applicable_surfaces TEXT[] DEFAULT '{}' CHECK (
    array_length(applicable_surfaces, 1) IS NULL OR 
    NOT (applicable_surfaces && ARRAY[
      'asphalt_concrete', 'portland_cement_concrete', 'composite_pavement',
      'gravel', 'crushed_stone', 'recycled_asphalt'
    ] = FALSE)
  ),
  tags TEXT[] DEFAULT '{}',
  source TEXT,
  version TEXT,
  effective_date DATE,
  uploaded_by TEXT NOT NULL,
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_updated TIMESTAMP WITH TIME ZONE,
  file_url TEXT,
  extracted_text TEXT,
  embeddings vector(1536), -- OpenAI embedding dimension
  is_active BOOLEAN DEFAULT true,
  access_level TEXT DEFAULT 'internal' CHECK (access_level IN ('public', 'internal', 'restricted'))
);

-- AI Assistant Queries Table
CREATE TABLE ai_assistant_queries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT NOT NULL,
  session_id TEXT,
  query TEXT NOT NULL,
  query_type TEXT NOT NULL CHECK (query_type IN (
    'estimation', 'regulation_lookup', 'best_practices', 'troubleshooting',
    'safety_guidance', 'accounting_advice', 'equipment_guidance', 'project_planning',
    'quality_standards', 'repair_guidance', 'material_selection', 'cost_optimization',
    'schedule_planning', 'team_management', 'general_inquiry', 'data_analysis', 'report_generation'
  )),
  intent TEXT CHECK (intent IN ('search', 'create', 'update', 'delete', 'analyze', 'recommend', 'explain')),
  context JSONB DEFAULT '{}',
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- AI Assistant Responses Table
CREATE TABLE ai_assistant_responses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  query_id UUID NOT NULL REFERENCES ai_assistant_queries(id) ON DELETE CASCADE,
  response TEXT NOT NULL,
  confidence_score INTEGER CHECK (confidence_score >= 0 AND confidence_score <= 100),
  repair_recommendations JSONB DEFAULT '[]',
  material_specifications JSONB DEFAULT '[]',
  safety_considerations JSONB DEFAULT '[]',
  quality_standards JSONB DEFAULT '[]',
  environmental_considerations JSONB DEFAULT '[]',
  suggested_actions JSONB DEFAULT '[]',
  sources JSONB DEFAULT '[]',
  cost_estimates JSONB,
  regulatory_alerts JSONB DEFAULT '[]',
  recommendations TEXT[] DEFAULT '{}',
  follow_up_suggestions TEXT[] DEFAULT '{}',
  related_topics TEXT[] DEFAULT '{}',
  generated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  processing_time_ms INTEGER
);

-- AI Settings Table
CREATE TABLE ai_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT NOT NULL,
  ai_personality TEXT DEFAULT 'professional' CHECK (ai_personality IN ('professional', 'friendly', 'technical', 'concise')),
  response_detail_level TEXT DEFAULT 'detailed' CHECK (response_detail_level IN ('basic', 'detailed', 'comprehensive')),
  auto_execute_safe_actions BOOLEAN DEFAULT false,
  require_confirmation_for TEXT[] DEFAULT '{"delete", "financial"}',
  preferred_units TEXT DEFAULT 'imperial' CHECK (preferred_units IN ('imperial', 'metric')),
  cost_estimation_precision TEXT DEFAULT 'moderate' CHECK (cost_estimation_precision IN ('rough', 'moderate', 'precise')),
  include_regulatory_checks BOOLEAN DEFAULT true,
  enable_proactive_suggestions BOOLEAN DEFAULT true,
  max_suggestions_per_response INTEGER DEFAULT 5 CHECK (max_suggestions_per_response >= 1 AND max_suggestions_per_response <= 10),
  learning_from_feedback BOOLEAN DEFAULT true,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Enhanced Notifications Table
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN (
    'regulation_update', 'safety_alert', 'best_practice_tip', 'equipment_maintenance',
    'cost_optimization', 'weather_advisory', 'compliance_reminder', 'training_reminder',
    'ai_suggestion', 'approval_required'
  )),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
  category TEXT NOT NULL,
  data JSONB DEFAULT '{}',
  is_read BOOLEAN DEFAULT false,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE
);

-- AI Learning/Feedback Table
CREATE TABLE ai_learning (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  query_id UUID NOT NULL REFERENCES ai_assistant_queries(id) ON DELETE CASCADE,
  user_feedback TEXT NOT NULL CHECK (user_feedback IN ('helpful', 'somewhat_helpful', 'not_helpful')),
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  feedback_text TEXT,
  suggested_improvements TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for Performance
CREATE INDEX idx_ai_action_logs_user_id ON ai_action_logs(user_id);
CREATE INDEX idx_ai_action_logs_timestamp ON ai_action_logs(timestamp DESC);
CREATE INDEX idx_ai_action_logs_resource_type ON ai_action_logs(resource_type);
CREATE INDEX idx_ai_action_logs_success ON ai_action_logs(success);

CREATE INDEX idx_knowledge_documents_asphalt_categories ON knowledge_documents USING GIN(asphalt_categories);
CREATE INDEX idx_knowledge_documents_repair_types ON knowledge_documents USING GIN(repair_types);
CREATE INDEX idx_knowledge_documents_tags ON knowledge_documents USING GIN(tags);
CREATE INDEX idx_knowledge_documents_active ON knowledge_documents(is_active);
CREATE INDEX idx_knowledge_documents_document_type ON knowledge_documents(document_type);

-- Vector similarity search index (for semantic search)
CREATE INDEX idx_knowledge_documents_embeddings ON knowledge_documents 
USING ivfflat (embeddings vector_cosine_ops) WITH (lists = 100);

CREATE INDEX idx_ai_queries_user_id ON ai_assistant_queries(user_id);
CREATE INDEX idx_ai_queries_timestamp ON ai_assistant_queries(timestamp DESC);
CREATE INDEX idx_ai_queries_type ON ai_assistant_queries(query_type);
CREATE INDEX idx_ai_queries_session ON ai_assistant_queries(session_id);

CREATE INDEX idx_ai_responses_query_id ON ai_assistant_responses(query_id);
CREATE INDEX idx_ai_responses_confidence ON ai_assistant_responses(confidence_score DESC);
CREATE INDEX idx_ai_responses_timestamp ON ai_assistant_responses(generated_at DESC);

CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_unread ON notifications(user_id, is_read) WHERE is_read = false;
CREATE INDEX idx_notifications_priority ON notifications(priority);
CREATE INDEX idx_notifications_created_at ON notifications(created_at DESC);

-- Row Level Security (RLS) Policies
ALTER TABLE ai_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_action_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE knowledge_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_assistant_queries ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_assistant_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_learning ENABLE ROW LEVEL SECURITY;

-- RLS Policies for ai_permissions
CREATE POLICY "Users can view their own AI permissions" ON ai_permissions
  FOR SELECT USING (auth.uid()::text = user_id);

CREATE POLICY "Users can update their own AI permissions" ON ai_permissions
  FOR UPDATE USING (auth.uid()::text = user_id);

CREATE POLICY "Users can insert their own AI permissions" ON ai_permissions
  FOR INSERT WITH CHECK (auth.uid()::text = user_id);

-- RLS Policies for ai_action_logs
CREATE POLICY "Users can view their own action logs" ON ai_action_logs
  FOR SELECT USING (auth.uid()::text = user_id);

CREATE POLICY "System can insert action logs" ON ai_action_logs
  FOR INSERT WITH CHECK (true);

-- RLS Policies for knowledge_documents
CREATE POLICY "Users can view active public/internal documents" ON knowledge_documents
  FOR SELECT USING (is_active = true AND access_level IN ('public', 'internal'));

CREATE POLICY "Users can insert documents they upload" ON knowledge_documents
  FOR INSERT WITH CHECK (auth.uid()::text = uploaded_by);

CREATE POLICY "Users can update documents they uploaded" ON knowledge_documents
  FOR UPDATE USING (auth.uid()::text = uploaded_by);

-- RLS Policies for ai_assistant_queries
CREATE POLICY "Users can view their own queries" ON ai_assistant_queries
  FOR SELECT USING (auth.uid()::text = user_id);

CREATE POLICY "Users can insert their own queries" ON ai_assistant_queries
  FOR INSERT WITH CHECK (auth.uid()::text = user_id);

-- RLS Policies for ai_assistant_responses
CREATE POLICY "Users can view responses to their queries" ON ai_assistant_responses
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM ai_assistant_queries 
      WHERE ai_assistant_queries.id = ai_assistant_responses.query_id 
      AND ai_assistant_queries.user_id = auth.uid()::text
    )
  );

CREATE POLICY "System can insert responses" ON ai_assistant_responses
  FOR INSERT WITH CHECK (true);

-- RLS Policies for ai_settings
CREATE POLICY "Users can view their own AI settings" ON ai_settings
  FOR SELECT USING (auth.uid()::text = user_id);

CREATE POLICY "Users can update their own AI settings" ON ai_settings
  FOR UPDATE USING (auth.uid()::text = user_id);

CREATE POLICY "Users can insert their own AI settings" ON ai_settings
  FOR INSERT WITH CHECK (auth.uid()::text = user_id);

-- RLS Policies for notifications
CREATE POLICY "Users can view their own notifications" ON notifications
  FOR SELECT USING (auth.uid()::text = user_id);

CREATE POLICY "Users can update their own notifications" ON notifications
  FOR UPDATE USING (auth.uid()::text = user_id);

CREATE POLICY "System can insert notifications" ON notifications
  FOR INSERT WITH CHECK (true);

-- RLS Policies for ai_learning
CREATE POLICY "Users can view feedback for their queries" ON ai_learning
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM ai_assistant_queries 
      WHERE ai_assistant_queries.id = ai_learning.query_id 
      AND ai_assistant_queries.user_id = auth.uid()::text
    )
  );

CREATE POLICY "Users can insert feedback for their queries" ON ai_learning
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM ai_assistant_queries 
      WHERE ai_assistant_queries.id = ai_learning.query_id 
      AND ai_assistant_queries.user_id = auth.uid()::text
    )
  );

-- Functions for automatic timestamp updates
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for automatic timestamp updates
CREATE TRIGGER update_ai_permissions_updated_at BEFORE UPDATE ON ai_permissions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ai_settings_updated_at BEFORE UPDATE ON ai_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_knowledge_documents_updated_at BEFORE UPDATE ON knowledge_documents
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_notifications_updated_at BEFORE UPDATE ON notifications
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Storage bucket for document uploads (Run in Supabase dashboard)
-- INSERT INTO storage.buckets (id, name, public) VALUES ('documents', 'documents', false);

-- Storage RLS policies (Run in Supabase dashboard)
-- CREATE POLICY "Users can upload documents" ON storage.objects
--   FOR INSERT WITH CHECK (bucket_id = 'documents' AND auth.role() = 'authenticated');

-- CREATE POLICY "Users can view documents" ON storage.objects
--   FOR SELECT USING (bucket_id = 'documents' AND auth.role() = 'authenticated');

-- Sample data for testing (optional)
-- Insert default AI permissions for existing users
-- This should be run after users exist in your system

-- Example: Insert sample knowledge document
INSERT INTO knowledge_documents (
  title,
  document_type,
  content,
  asphalt_categories,
  repair_types,
  applicable_surfaces,
  tags,
  uploaded_by
) VALUES (
  'Asphalt Crack Sealing Best Practices',
  'best_practices',
  'Crack sealing is a preventive maintenance procedure that involves cleaning and filling cracks in asphalt pavement. Best practices include: 1) Clean cracks thoroughly, 2) Use appropriate sealant material, 3) Apply when temperature is above 40°F, 4) Allow proper curing time.',
  ARRAY['crack_sealing', 'preventive_maintenance'],
  ARRAY['minor_crack_repair', 'major_crack_repair'],
  ARRAY['asphalt_concrete'],
  ARRAY['maintenance', 'preventive', 'crack sealing', 'best practices'],
  'system'
);

-- Example: Insert sample notification
INSERT INTO notifications (
  user_id,
  type,
  title,
  message,
  priority,
  category
) VALUES (
  'system',
  'ai_suggestion',
  'AI Assistant Setup Complete',
  'Your AI assistant is now configured and ready to help with asphalt repair, estimating, and project management.',
  'medium',
  'system'
);

COMMENT ON TABLE ai_permissions IS 'Stores AI permission settings for each user';
COMMENT ON TABLE ai_action_logs IS 'Logs all AI actions for audit and monitoring';
COMMENT ON TABLE knowledge_documents IS 'Stores documents for AI knowledge base with asphalt expertise';
COMMENT ON TABLE ai_assistant_queries IS 'Stores user queries to the AI assistant';
COMMENT ON TABLE ai_assistant_responses IS 'Stores AI responses with comprehensive asphalt expertise';
COMMENT ON TABLE ai_settings IS 'User-specific AI assistant settings and preferences';
COMMENT ON TABLE notifications IS 'System and AI-generated notifications';
COMMENT ON TABLE ai_learning IS 'User feedback for continuous AI improvement';

-- Migration complete message
SELECT 'AI Assistant database migration completed successfully!' as status;