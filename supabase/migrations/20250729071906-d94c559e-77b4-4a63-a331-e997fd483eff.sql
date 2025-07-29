-- Ensure the rate_limits table exists with the correct unique constraint
-- Drop existing table if it exists to recreate with proper constraints
DROP TABLE IF EXISTS public.rate_limits CASCADE;

-- Create the rate_limits table with proper constraints
CREATE TABLE public.rate_limits (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  identifier TEXT NOT NULL,
  action TEXT NOT NULL,
  count INTEGER NOT NULL DEFAULT 1,
  window_start TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT rate_limits_identifier_action_unique UNIQUE(identifier, action)
);

-- Enable RLS on the rate_limits table
ALTER TABLE public.rate_limits ENABLE ROW LEVEL SECURITY;

-- Create a policy to allow the check_rate_limit function to work
CREATE POLICY "Allow rate limit checks" ON public.rate_limits
FOR ALL 
USING (true)
WITH CHECK (true);