// deno-lint-ignore-file no-explicit-any
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Use project URL directly; service role key must be set as an Edge Function secret
const SUPABASE_URL = 'https://vodglzbgqsafghlihivy.supabase.co';
const SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

if (!SERVICE_ROLE_KEY) {
  console.warn('[security-log] Missing SUPABASE_SERVICE_ROLE_KEY. Set it in Edge Function secrets.');
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY || '');

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: { ...corsHeaders } });
  }

  try {
    const { type, severity, action, userId, ip, userAgent, metadata } = await req.json();

    const headers = Object.fromEntries(req.headers.entries());
    const source_ip = ip || headers['x-forwarded-for'] || headers['cf-connecting-ip'] || headers['x-real-ip'] || 'unknown';
    const ua = userAgent || headers['user-agent'] || 'unknown';

    // Basic validation
    const allowedTypes = ['authentication','authorization','input_validation','rate_limit','data_access','security_violation','system_error'];
    const allowedSeverities = ['low','medium','high','critical','info'];

    const safeType = allowedTypes.includes(type) ? type : 'security_violation';
    const safeSeverity = allowedSeverities.includes(severity) ? severity : 'medium';

    const insert = {
      type: safeType,
      severity: safeSeverity,
      description: action || 'security_event',
      user_id: userId || null,
      source_ip,
      user_agent: ua,
      metadata: metadata || {},
      resource_type: null,
      resource_id: null,
    };

    const { error } = await supabase.from('security_events').insert(insert);
    if (error) {
      console.error('[security-log] Insert error:', error.message);
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  } catch (err: any) {
    console.error('[security-log] Handler error:', err?.message || err);
    return new Response(JSON.stringify({ error: 'invalid_request' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  }
});