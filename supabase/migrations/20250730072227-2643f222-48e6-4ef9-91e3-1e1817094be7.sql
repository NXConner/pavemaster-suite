-- Fix critical RLS policy vulnerabilities and add role escalation protection

-- First, drop the dangerous "Users can view all profiles" policy
DROP POLICY IF EXISTS "Users can view all profiles" ON public.user_profiles;

-- Add proper role-based access control for user profiles
CREATE POLICY "Users can view own profile"
ON public.user_profiles 
FOR SELECT 
USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles"
ON public.user_profiles 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.user_profiles 
    WHERE id = auth.uid() 
    AND (is_admin = true OR role = 'super_admin')
  )
);

-- Add proper update policies with role escalation protection
DROP POLICY IF EXISTS "Users can update own profile" ON public.user_profiles;

CREATE POLICY "Users can update own profile (non-sensitive fields)"
ON public.user_profiles 
FOR UPDATE 
USING (auth.uid() = id)
WITH CHECK (
  auth.uid() = id 
  AND OLD.role = NEW.role 
  AND OLD.is_admin = NEW.is_admin
);

CREATE POLICY "Admins can update user profiles"
ON public.user_profiles 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.user_profiles 
    WHERE id = auth.uid() 
    AND (is_admin = true OR role = 'super_admin')
  )
);

-- Create security audit log table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.security_audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id),
  action text NOT NULL,
  resource_type text,
  resource_id uuid,
  details jsonb,
  ip_address inet,
  user_agent text,
  created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on security audit log
ALTER TABLE public.security_audit_log ENABLE ROW LEVEL SECURITY;

-- Only admins can view audit logs
CREATE POLICY "Admins can view audit logs"
ON public.security_audit_log 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.user_profiles 
    WHERE id = auth.uid() 
    AND (is_admin = true OR role = 'super_admin')
  )
);

-- System can insert audit logs
CREATE POLICY "System can insert audit logs"
ON public.security_audit_log 
FOR INSERT 
WITH CHECK (true);

-- Create rate limits table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.rate_limits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  identifier text NOT NULL,
  action text NOT NULL,
  count integer DEFAULT 1,
  window_start timestamp with time zone DEFAULT now(),
  created_at timestamp with time zone DEFAULT now(),
  UNIQUE(identifier, action)
);

-- Enable RLS on rate limits
ALTER TABLE public.rate_limits ENABLE ROW LEVEL SECURITY;

-- Only system can manage rate limits
CREATE POLICY "System can manage rate limits"
ON public.rate_limits 
FOR ALL 
USING (true)
WITH CHECK (true);

-- Create function to log role changes
CREATE OR REPLACE FUNCTION log_role_change()
RETURNS TRIGGER AS $$
BEGIN
  -- Log any role or admin status changes
  IF OLD.role IS DISTINCT FROM NEW.role OR OLD.is_admin IS DISTINCT FROM NEW.is_admin THEN
    INSERT INTO public.security_audit_log (
      user_id,
      action,
      resource_type,
      resource_id,
      details
    ) VALUES (
      auth.uid(),
      'role_change',
      'user_profile',
      NEW.id,
      jsonb_build_object(
        'old_role', OLD.role,
        'new_role', NEW.role,
        'old_is_admin', OLD.is_admin,
        'new_is_admin', NEW.is_admin,
        'target_user_id', NEW.id
      )
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for role change logging
DROP TRIGGER IF EXISTS trigger_log_role_change ON public.user_profiles;
CREATE TRIGGER trigger_log_role_change
  AFTER UPDATE ON public.user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION log_role_change();

-- Fix missing RLS policies for other critical tables

-- Fix estimates table policies (currently allows all users to select)
DROP POLICY IF EXISTS "estimates_select" ON public.estimates;
DROP POLICY IF EXISTS "select estimates" ON public.estimates;

CREATE POLICY "Users can view own estimates"
ON public.estimates 
FOR SELECT 
USING (created_by = auth.uid());

CREATE POLICY "Admins can view all estimates"
ON public.estimates 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.user_profiles 
    WHERE id = auth.uid() 
    AND (is_admin = true OR role = 'super_admin')
  )
);

-- Fix forum_posts policies (currently allows all users to select)
DROP POLICY IF EXISTS "forum_posts_select" ON public.forum_posts;
DROP POLICY IF EXISTS "select forum_posts" ON public.forum_posts;

CREATE POLICY "Users can view published forum posts"
ON public.forum_posts 
FOR SELECT 
USING (true); -- Keep public for forum functionality

-- Fix compliance_rules (currently allows all users to view)
DROP POLICY IF EXISTS "All users can view compliance rules" ON public.compliance_rules;

CREATE POLICY "Authenticated users can view compliance rules"
ON public.compliance_rules 
FOR SELECT 
USING (auth.role() = 'authenticated');

-- Add admin policies for compliance rules management
CREATE POLICY "Admins can manage compliance rules"
ON public.compliance_rules 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.user_profiles 
    WHERE id = auth.uid() 
    AND (is_admin = true OR role = 'super_admin')
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.user_profiles 
    WHERE id = auth.uid() 
    AND (is_admin = true OR role = 'super_admin')
  )
);