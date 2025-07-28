-- Database setup script for Pavement Performance Suite
-- Run this in your Supabase SQL editor

-- Create ai_models table
CREATE TABLE IF NOT EXISTS public.ai_models (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    model_type VARCHAR(100) NOT NULL,
    version VARCHAR(50),
    status VARCHAR(50) DEFAULT 'active',
    configuration JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on status for efficient queries
CREATE INDEX IF NOT EXISTS idx_ai_models_status ON public.ai_models(status);

-- Enable RLS
ALTER TABLE public.ai_models ENABLE ROW LEVEL SECURITY;

-- Create policy for authenticated users
CREATE POLICY "Allow authenticated users to view ai_models" ON public.ai_models
    FOR SELECT USING (auth.role() = 'authenticated');

-- Insert sample AI models data
INSERT INTO public.ai_models (name, description, model_type, version, status, configuration) VALUES
('GPT-4', 'Advanced language model for text generation and analysis', 'language_model', '4.0', 'active', '{"max_tokens": 4096, "temperature": 0.7}'),
('DALL-E 3', 'Image generation model for creating visual content', 'image_generation', '3.0', 'active', '{"resolution": "1024x1024", "style": "natural"}'),
('Claude', 'Anthropic''s conversational AI assistant', 'conversational', '2.1', 'active', '{"context_window": 100000, "temperature": 0.8}'),
('CodeLlama', 'Specialized model for code generation and analysis', 'code_generation', '34B', 'active', '{"max_length": 2048, "temperature": 0.1}')
ON CONFLICT (id) DO NOTHING;

-- Create third_party_apps table
CREATE TABLE IF NOT EXISTS public.third_party_apps (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    app_type VARCHAR(100) NOT NULL,
    version VARCHAR(50),
    status VARCHAR(50) DEFAULT 'available',
    api_key VARCHAR(255),
    configuration JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on status for efficient queries
CREATE INDEX IF NOT EXISTS idx_third_party_apps_status ON public.third_party_apps(status);

-- Enable RLS
ALTER TABLE public.third_party_apps ENABLE ROW LEVEL SECURITY;

-- Create policy for authenticated users
CREATE POLICY "Allow authenticated users to view third_party_apps" ON public.third_party_apps
    FOR SELECT USING (auth.role() = 'authenticated');

-- Create policy for updating app status
CREATE POLICY "Allow authenticated users to update third_party_apps" ON public.third_party_apps
    FOR UPDATE USING (auth.role() = 'authenticated');

-- Insert sample third-party apps data
INSERT INTO public.third_party_apps (name, description, app_type, version, status, configuration) VALUES
('Stripe', 'Payment processing and billing platform', 'payment_processing', '2023-10-16', 'installed', '{"webhook_url": "https://api.stripe.com/webhooks", "currency": "USD"}'),
('Slack', 'Team communication and collaboration platform', 'communication', 'latest', 'installed', '{"workspace": "pavement-suite", "channels": ["#general", "#alerts"]}'),
('Google Maps', 'Mapping and location services', 'mapping', 'v3', 'available', '{"api_key": "YOUR_GOOGLE_MAPS_API_KEY", "libraries": ["places", "geometry"]}'),
('QuickBooks', 'Accounting and financial management', 'accounting', '2024', 'available', '{"company_id": "123456789", "sync_frequency": "daily"}'),
('Zapier', 'Workflow automation platform', 'automation', 'latest', 'installed', '{"webhooks_enabled": true, "automation_count": 15}'),
('HubSpot', 'Customer relationship management', 'crm', 'latest', 'available', '{"portal_id": "987654321", "api_key": "YOUR_HUBSPOT_API_KEY"}')
ON CONFLICT (id) DO NOTHING;

-- Create audit_logs table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id),
    action VARCHAR(255) NOT NULL,
    resource VARCHAR(255),
    details JSONB,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    ip_address INET,
    user_agent TEXT
);

-- Create index on timestamp for efficient queries
CREATE INDEX IF NOT EXISTS idx_audit_logs_timestamp ON public.audit_logs(timestamp);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON public.audit_logs(user_id);

-- Enable RLS
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Create policy for authenticated users
CREATE POLICY "Allow authenticated users to view their own audit logs" ON public.audit_logs
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Allow authenticated users to insert audit logs" ON public.audit_logs
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON public.ai_models TO authenticated;
GRANT ALL ON public.third_party_apps TO authenticated;
GRANT ALL ON public.audit_logs TO authenticated; 