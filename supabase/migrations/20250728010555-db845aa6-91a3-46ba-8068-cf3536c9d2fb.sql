-- Fix database functions with proper search_path
CREATE OR REPLACE FUNCTION public.log_security_event(p_action text, p_resource_type text DEFAULT NULL::text, p_resource_id uuid DEFAULT NULL::uuid, p_details jsonb DEFAULT NULL::jsonb)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
BEGIN
  -- Only proceed if security_audit_log table exists
  INSERT INTO security_audit_log (
    user_id,
    action,
    resource_type,
    resource_id,
    details
  ) VALUES (
    auth.uid(),
    p_action,
    p_resource_type,
    p_resource_id,
    p_details
  );
EXCEPTION
  WHEN others THEN
    NULL;
END;
$function$;

CREATE OR REPLACE FUNCTION public.check_rate_limit(p_identifier text, p_action text, p_limit integer DEFAULT 10, p_window_minutes integer DEFAULT 15)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
DECLARE
  current_count integer;
  window_start timestamp with time zone;
BEGIN
  window_start := now() - (p_window_minutes || ' minutes')::interval;
  
  DELETE FROM rate_limits 
  WHERE window_start < (now() - (p_window_minutes || ' minutes')::interval);
  
  SELECT COALESCE(SUM(count), 0) INTO current_count
  FROM rate_limits
  WHERE identifier = p_identifier 
    AND action = p_action 
    AND window_start >= window_start;
  
  IF current_count < p_limit THEN
    INSERT INTO rate_limits (identifier, action, count, window_start)
    VALUES (p_identifier, p_action, 1, now())
    ON CONFLICT (identifier, action) 
    DO UPDATE SET count = rate_limits.count + 1, created_at = now();
    
    RETURN true;
  END IF;
  
  RETURN false;
END;
$function$;

-- Add basic RLS policies for tables that need them (only for existing columns)
-- Performance reviews policies
CREATE POLICY "Users can view own performance reviews" ON public.performance_reviews
FOR SELECT 
USING (employee_id = auth.uid());

CREATE POLICY "Admins can manage performance reviews" ON public.performance_reviews
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM user_profiles 
    WHERE id = auth.uid() AND (is_admin = true OR role = 'super_admin')
  )
);

-- Employee certifications policies
CREATE POLICY "Users can view own certifications" ON public.employee_certifications
FOR SELECT 
USING (employee_id = auth.uid());

CREATE POLICY "HR and admins can manage certifications" ON public.employee_certifications
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM user_profiles 
    WHERE id = auth.uid() AND (is_admin = true OR role IN ('super_admin', 'hr_manager'))
  )
);