-- Drop existing conflicting policies and recreate them properly
DROP POLICY IF EXISTS "System can manage rate limits" ON public.rate_limits;
DROP POLICY IF EXISTS "System can insert security events" ON public.security_audit_log;
DROP POLICY IF EXISTS "Admins can view security events" ON public.security_audit_log;

-- Create proper policies for rate_limits
CREATE POLICY "System can manage rate limits" ON public.rate_limits
  FOR ALL USING (true) WITH CHECK (true);

-- Create proper policies for security_audit_log  
CREATE POLICY "System can insert security events" ON public.security_audit_log
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins can view security events" ON public.security_audit_log
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = auth.uid() 
      AND (is_admin = true OR role = 'super_admin')
    )
  );