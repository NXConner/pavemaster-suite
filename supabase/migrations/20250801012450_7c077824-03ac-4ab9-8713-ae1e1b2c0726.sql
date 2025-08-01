-- Fix Function Search Path Security Issues
-- Add secure search_path to existing functions

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

CREATE OR REPLACE FUNCTION public.check_rate_limit(p_identifier text, p_action text, p_limit integer DEFAULT 10, p_window_minutes integer DEFAULT 15)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  current_count integer;
  time_threshold timestamp with time zone;
BEGIN
  time_threshold := now() - (p_window_minutes || ' minutes')::interval;
  
  -- Clean up old rate limit records
  DELETE FROM public.rate_limits 
  WHERE created_at < time_threshold;
  
  -- Get current count for this identifier and action
  SELECT COALESCE(SUM(count), 0) INTO current_count
  FROM public.rate_limits
  WHERE identifier = p_identifier 
    AND action = p_action 
    AND created_at >= time_threshold;
  
  -- Check if under limit
  IF current_count < p_limit THEN
    INSERT INTO public.rate_limits (identifier, action, count, window_start)
    VALUES (p_identifier, p_action, 1, now())
    ON CONFLICT (identifier, action) 
    DO UPDATE SET count = public.rate_limits.count + 1, created_at = now();
    
    RETURN true;
  END IF;
  
  RETURN false;
END;
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