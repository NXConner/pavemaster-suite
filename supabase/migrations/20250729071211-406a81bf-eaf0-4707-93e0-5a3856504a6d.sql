-- Fix the ambiguous column reference in check_rate_limit function
CREATE OR REPLACE FUNCTION public.check_rate_limit(p_identifier text, p_action text, p_limit integer DEFAULT 10, p_window_minutes integer DEFAULT 15)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
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
$function$;