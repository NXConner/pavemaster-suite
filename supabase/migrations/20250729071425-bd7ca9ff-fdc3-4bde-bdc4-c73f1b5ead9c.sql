-- First, let's see if the rate_limits table exists and check its structure
-- If it doesn't exist, create it with the proper constraints

-- Create the rate_limits table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.rate_limits (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  identifier TEXT NOT NULL,
  action TEXT NOT NULL,
  count INTEGER NOT NULL DEFAULT 1,
  window_start TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(identifier, action)
);

-- Enable RLS on the rate_limits table
ALTER TABLE public.rate_limits ENABLE ROW LEVEL SECURITY;

-- Create a policy to allow the check_rate_limit function to work
CREATE POLICY "Allow rate limit checks" ON public.rate_limits
FOR ALL 
USING (true)
WITH CHECK (true);