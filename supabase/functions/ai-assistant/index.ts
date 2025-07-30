import 'https://deno.land/x/xhr@0.1.0/mod.ts';
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Rate limiting storage
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

function checkRateLimit(identifier: string, maxRequests: number = 15, windowMinutes: number = 15): boolean {
  const now = Date.now();
  const windowMs = windowMinutes * 60 * 1000;
  const existing = rateLimitMap.get(identifier);

  // Clean up expired entries
  if (existing && now > existing.resetTime) {
    rateLimitMap.delete(identifier);
  }

  const current = rateLimitMap.get(identifier) || { count: 0, resetTime: now + windowMs };

  if (current.count >= maxRequests) {
    return false;
  }

  current.count++;
  rateLimitMap.set(identifier, current);
  return true;
}

function sanitizeInput(input: string): string {
  return input
    .trim()
    .slice(0, 2000) // Limit message length
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .replace(/['"]/g, ''); // Remove quotes to prevent injection
}

function validateRequest(body: any): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!body.message || typeof body.message !== 'string') {
    errors.push('Message is required and must be a string');
  }

  if (body.message && body.message.length > 2000) {
    errors.push('Message too long (max 2000 characters)');
  }

  if (body.context && typeof body.context !== 'string') {
    errors.push('Context must be a string');
  }

  if (body.conversation && !Array.isArray(body.conversation)) {
    errors.push('Conversation must be an array');
  }

  if (body.conversation && body.conversation.length > 20) {
    errors.push('Conversation history too long');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

const systemPrompts = {
  general: 'You are an AI assistant for the Pavement Performance Suite application. You help with general queries about the application, navigation, and basic functionality.',

  pavement: `You are a specialized AI assistant for pavement and asphalt operations. You have extensive knowledge about:
- Asphalt mix designs and specifications
- Pavement construction best practices
- Material calculations (quantities, coverage rates, costs)
- Quality control and testing procedures
- Equipment operation and maintenance
- Weather considerations for paving operations
- Safety protocols for asphalt work
- Sealcoating and line striping operations
- Church parking lot repair and maintenance

Provide accurate, technical guidance while being accessible to contractors and field workers.`,

  project: `You are a project management AI assistant specialized in construction and pavement projects. You help with:
- Project planning and scheduling
- Resource allocation and crew management
- Cost estimation and budget tracking
- Timeline optimization
- Risk assessment and mitigation
- Communication and coordination
- Progress monitoring and reporting
- Equipment scheduling and logistics

Focus on practical, actionable advice for small to medium construction businesses.`,

  safety: `You are a safety AI assistant for construction and pavement operations. You emphasize:
- OSHA compliance and regulations
- Hazard identification and assessment
- Personal protective equipment (PPE) requirements
- Traffic control and work zone safety
- Hot asphalt handling safety
- Equipment safety protocols
- Emergency procedures
- Safety training and certification
- Incident prevention and reporting

Always prioritize safety in your recommendations and provide specific, actionable safety guidance.`,

  finance: `You are a financial AI assistant for construction businesses. You help with:
- Cost tracking and expense management
- Project profitability analysis
- Cash flow management
- Tax preparation and record keeping
- Equipment ROI calculations
- Pricing strategies
- Invoice management
- Financial reporting and analysis

Provide practical financial guidance for small business owners in the construction industry.`,
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get request body with size limit
    const body = await req.json().catch(() => null);

    if (!body) {
      throw new Error('Invalid request body');
    }

    // Validate request
    const validation = validateRequest(body);
    if (!validation.isValid) {
      return new Response(JSON.stringify({ error: validation.errors.join(', ') }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Get client IP for rate limiting
    const clientIP = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';

    // Check rate limit
    if (!checkRateLimit(clientIP)) {
      console.warn(`Rate limit exceeded for IP: ${clientIP}`);
      return new Response(JSON.stringify({ error: 'Rate limit exceeded. Please wait before making another request.' }), {
        status: 429,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { message, context = 'general', conversation = [] } = body;

    // Sanitize inputs
    const sanitizedMessage = sanitizeInput(message);
    const sanitizedContext = context ? sanitizeInput(context) : 'general';

    if (!sanitizedMessage) {
      throw new Error('Message is required');
    }

    const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
    if (!OPENAI_API_KEY) {
      throw new Error('OpenAI API key not configured');
    }

    console.log(`Processing ${sanitizedContext} query:`, sanitizedMessage.substring(0, 100) + '...');

    // Build conversation context
    const messages = [
      {
        role: 'system',
        content: systemPrompts[sanitizedContext as keyof typeof systemPrompts] || systemPrompts.general,
      },
    ];

    // Add conversation history (last 5 messages for security)
    if (conversation.length > 0) {
      const recentMessages = conversation.slice(-5).map((msg: any) => ({
        role: msg.role === 'user' ? 'user' : 'assistant', // Sanitize role
        content: sanitizeInput(msg.content || ''),
      })).filter(msg => msg.content.length > 0);
      messages.push(...recentMessages);
    }

    // Add current message
    messages.push({
      role: 'user',
      content: sanitizedMessage,
    });

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: messages,
        temperature: 0.7,
        max_tokens: 1000,
        presence_penalty: 0.1,
        frequency_penalty: 0.1,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('OpenAI API error:', error);
      throw new Error(error.error?.message || 'Failed to get AI response');
    }

    const data = await response.json();
    const aiResponse = data.choices[0].message.content;

    console.log('AI response generated successfully');

    return new Response(JSON.stringify({
      response: aiResponse,
      context,
      timestamp: new Date().toISOString(),
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in ai-assistant function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});