-- Fix Function Search Path Security Issues
-- Add secure search_path to all functions that are missing it

CREATE OR REPLACE FUNCTION public.update_created_at()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  NEW.created_at = now();
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_profiles
    WHERE id = _user_id
      AND (is_admin = true OR role = _role)
  )
$$;

CREATE OR REPLACE FUNCTION public.check_user_role(user_id uuid, allowed_roles text[])
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.user_profiles
        WHERE id = user_id
        AND (is_admin = true OR role = ANY(allowed_roles))
    );
END;
$$;

CREATE OR REPLACE FUNCTION public.update_employee_score(emp_id uuid, points_change integer)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  UPDATE public.employees
  SET performance_score = COALESCE(performance_score, 0) + points_change
  WHERE user_id = emp_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.create_violation(emp_id uuid, rule_id uuid, description_text text DEFAULT NULL::text)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  violation_id UUID;
  points_to_deduct INTEGER;
BEGIN
  -- Get point deduction for this rule
  SELECT point_deduction INTO points_to_deduct
  FROM public.compliance_rules
  WHERE id = rule_id;
  
  -- Create violation record
  INSERT INTO public.employee_violations (employee_id, rule_id, points_deducted, description, auto_generated)
  VALUES (emp_id, rule_id, points_to_deduct, description_text, true)
  RETURNING id INTO violation_id;
  
  -- Update employee score
  PERFORM public.update_employee_score(emp_id, points_to_deduct);
  
  RETURN violation_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.notify_violation(violation_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  -- Notification logic would go here
  -- For now, this is a placeholder
  NULL;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.create_security_alert_from_event()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
    INSERT INTO public.security_alerts (
        type,
        severity,
        status,
        description,
        event_id
    ) VALUES (
        NEW.type,
        NEW.severity,
        'new',
        NEW.description,
        NEW.id
    );
    RETURN NEW;
END;
$$;

-- Create missing tables that have RLS enabled but don't exist
CREATE TABLE IF NOT EXISTS public.app_configs (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    key text NOT NULL UNIQUE,
    value jsonb,
    description text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.blockchain_transactions (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    transaction_hash text NOT NULL UNIQUE,
    block_number bigint,
    from_address text,
    to_address text,
    value numeric,
    gas_used bigint,
    status text DEFAULT 'pending',
    created_at timestamp with time zone DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.document_hashes (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    document_id uuid,
    hash_value text NOT NULL,
    algorithm text DEFAULT 'sha256',
    created_at timestamp with time zone DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.geofences (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text NOT NULL,
    coordinates jsonb NOT NULL,
    radius numeric,
    type text DEFAULT 'circular',
    active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.project_tasks (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id uuid,
    title text NOT NULL,
    description text,
    assigned_to uuid,
    status text DEFAULT 'pending',
    due_date timestamp with time zone,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.roles (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text NOT NULL UNIQUE,
    description text,
    permissions jsonb DEFAULT '[]',
    created_at timestamp with time zone DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.routes (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text NOT NULL,
    path text NOT NULL,
    method text DEFAULT 'GET',
    description text,
    requires_auth boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.security_access_logs (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid,
    resource text,
    action text,
    ip_address inet,
    user_agent text,
    success boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.security_alerts (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    type text NOT NULL,
    severity text DEFAULT 'medium',
    status text DEFAULT 'new',
    description text NOT NULL,
    event_id uuid,
    resolved_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.security_audits (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    audit_type text NOT NULL,
    findings jsonb DEFAULT '[]',
    severity text DEFAULT 'medium',
    status text DEFAULT 'pending',
    conducted_by uuid,
    conducted_at timestamp with time zone DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.security_policies (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text NOT NULL,
    description text,
    policy_data jsonb NOT NULL,
    active boolean DEFAULT true,
    version integer DEFAULT 1,
    created_at timestamp with time zone DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.sync_status (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    entity_type text NOT NULL,
    entity_id uuid NOT NULL,
    last_sync timestamp with time zone,
    sync_status text DEFAULT 'pending',
    error_message text,
    created_at timestamp with time zone DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.tracking_events (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    event_type text NOT NULL,
    user_id uuid,
    entity_id uuid,
    entity_type text,
    event_data jsonb DEFAULT '{}',
    created_at timestamp with time zone DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.users (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    email text UNIQUE NOT NULL,
    name text,
    role text DEFAULT 'user',
    active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.app_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blockchain_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_hashes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.geofences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.routes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.security_access_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.security_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.security_audits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.security_policies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sync_status ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tracking_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Create comprehensive RLS policies for all tables

-- App Configs - Admin only
CREATE POLICY "Admins can manage app configs" ON public.app_configs
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.user_profiles 
    WHERE user_profiles.id = auth.uid() 
    AND (user_profiles.is_admin = true OR user_profiles.role = 'super_admin')
  )
);

-- Blockchain Transactions - Read for authenticated, insert for admins
CREATE POLICY "Authenticated users can view blockchain transactions" ON public.blockchain_transactions
FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Admins can manage blockchain transactions" ON public.blockchain_transactions
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.user_profiles 
    WHERE user_profiles.id = auth.uid() 
    AND (user_profiles.is_admin = true OR user_profiles.role = 'super_admin')
  )
);

-- Document Hashes - Based on document ownership
CREATE POLICY "Users can view document hashes" ON public.document_hashes
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.documents 
    WHERE documents.id = document_hashes.document_id 
    AND (documents.owner_id = auth.uid() OR 
         EXISTS (SELECT 1 FROM public.document_permissions 
                WHERE document_permissions.document_id = documents.id 
                AND document_permissions.user_id = auth.uid()))
  )
);

CREATE POLICY "System can insert document hashes" ON public.document_hashes
FOR INSERT WITH CHECK (true);

-- Geofences - Admin management, authenticated view
CREATE POLICY "Authenticated users can view geofences" ON public.geofences
FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Admins can manage geofences" ON public.geofences
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.user_profiles 
    WHERE user_profiles.id = auth.uid() 
    AND (user_profiles.is_admin = true OR user_profiles.role = 'super_admin')
  )
);

-- Project Tasks - Project based access
CREATE POLICY "Users can view project tasks" ON public.project_tasks
FOR SELECT USING (
  assigned_to = auth.uid() OR
  EXISTS (
    SELECT 1 FROM public.user_profiles 
    WHERE user_profiles.id = auth.uid() 
    AND (user_profiles.is_admin = true OR user_profiles.role = 'super_admin')
  )
);

CREATE POLICY "Users can manage assigned tasks" ON public.project_tasks
FOR ALL USING (
  assigned_to = auth.uid() OR
  EXISTS (
    SELECT 1 FROM public.user_profiles 
    WHERE user_profiles.id = auth.uid() 
    AND (user_profiles.is_admin = true OR user_profiles.role = 'super_admin')
  )
);

-- Roles - Admin only
CREATE POLICY "All users can view roles" ON public.roles
FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Admins can manage roles" ON public.roles
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.user_profiles 
    WHERE user_profiles.id = auth.uid() 
    AND (user_profiles.is_admin = true OR user_profiles.role = 'super_admin')
  )
);

-- Routes - Admin only
CREATE POLICY "Admins can manage routes" ON public.routes
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.user_profiles 
    WHERE user_profiles.id = auth.uid() 
    AND (user_profiles.is_admin = true OR user_profiles.role = 'super_admin')
  )
);

-- Security Access Logs - Admin view only
CREATE POLICY "Admins can view security access logs" ON public.security_access_logs
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.user_profiles 
    WHERE user_profiles.id = auth.uid() 
    AND (user_profiles.is_admin = true OR user_profiles.role = 'super_admin')
  )
);

CREATE POLICY "System can insert access logs" ON public.security_access_logs
FOR INSERT WITH CHECK (true);

-- Security Alerts - Admin management
CREATE POLICY "Admins can manage security alerts" ON public.security_alerts
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.user_profiles 
    WHERE user_profiles.id = auth.uid() 
    AND (user_profiles.is_admin = true OR user_profiles.role = 'super_admin')
  )
);

-- Security Audits - Admin only
CREATE POLICY "Admins can manage security audits" ON public.security_audits
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.user_profiles 
    WHERE user_profiles.id = auth.uid() 
    AND (user_profiles.is_admin = true OR user_profiles.role = 'super_admin')
  )
);

-- Security Policies - Admin only
CREATE POLICY "Admins can manage security policies" ON public.security_policies
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.user_profiles 
    WHERE user_profiles.id = auth.uid() 
    AND (user_profiles.is_admin = true OR user_profiles.role = 'super_admin')
  )
);

-- Sync Status - System and admin access
CREATE POLICY "Admins can view sync status" ON public.sync_status
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.user_profiles 
    WHERE user_profiles.id = auth.uid() 
    AND (user_profiles.is_admin = true OR user_profiles.role = 'super_admin')
  )
);

CREATE POLICY "System can manage sync status" ON public.sync_status
FOR ALL USING (true);

-- Tracking Events - User can view own, admins view all
CREATE POLICY "Users can view own tracking events" ON public.tracking_events
FOR SELECT USING (
  user_id = auth.uid() OR
  EXISTS (
    SELECT 1 FROM public.user_profiles 
    WHERE user_profiles.id = auth.uid() 
    AND (user_profiles.is_admin = true OR user_profiles.role = 'super_admin')
  )
);

CREATE POLICY "System can insert tracking events" ON public.tracking_events
FOR INSERT WITH CHECK (true);

-- Users table - Users can view own profile, admins can manage
CREATE POLICY "Users can view own profile" ON public.users
FOR SELECT USING (
  id = auth.uid() OR
  EXISTS (
    SELECT 1 FROM public.user_profiles 
    WHERE user_profiles.id = auth.uid() 
    AND (user_profiles.is_admin = true OR user_profiles.role = 'super_admin')
  )
);

CREATE POLICY "Admins can manage users" ON public.users
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.user_profiles 
    WHERE user_profiles.id = auth.uid() 
    AND (user_profiles.is_admin = true OR user_profiles.role = 'super_admin')
  )
);

-- Fix spatial reference systems security issue
DROP VIEW IF EXISTS public.spatial_reference_systems;
DROP MATERIALIZED VIEW IF EXISTS private.spatial_reference_systems;

-- Create a secure function to search spatial references
CREATE OR REPLACE FUNCTION public.search_spatial_references(
    p_search_term text DEFAULT NULL,
    p_limit integer DEFAULT 100
)
RETURNS TABLE (
    srid integer, 
    auth_name text, 
    auth_srid integer, 
    description text
) 
LANGUAGE sql 
STABLE 
SECURITY DEFINER 
SET search_path = ''
AS $$
    SELECT 
        public.spatial_ref_sys.srid, 
        public.spatial_ref_sys.auth_name, 
        public.spatial_ref_sys.auth_srid,
        COALESCE(public.spatial_ref_sys.srtext, public.spatial_ref_sys.proj4text) AS description
    FROM public.spatial_ref_sys
    WHERE 
        p_search_term IS NULL OR 
        (
            public.spatial_ref_sys.srtext ILIKE '%' || p_search_term || '%' OR 
            public.spatial_ref_sys.proj4text ILIKE '%' || p_search_term || '%' OR 
            public.spatial_ref_sys.auth_name ILIKE '%' || p_search_term || '%'
        )
    LIMIT p_limit;
$$;

-- Grant permissions
GRANT EXECUTE ON FUNCTION public.search_spatial_references(text, integer) TO authenticated;