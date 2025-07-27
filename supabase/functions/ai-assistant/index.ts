import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const systemPrompts = {
  general: `You are an AI assistant for the Pavement Performance Suite application. You help with general queries about the application, navigation, and basic functionality.`,
  
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

Provide practical financial guidance for small business owners in the construction industry.`
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, context = 'general', conversation = [] } = await req.json();

    if (!message) {
      throw new Error('Message is required');
    }

    const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
    if (!OPENAI_API_KEY) {
      throw new Error('OpenAI API key not configured');
    }

    console.log(`Processing ${context} query:`, message.substring(0, 100) + '...');

    // Build conversation context
    const messages = [
      {
        role: 'system',
        content: systemPrompts[context as keyof typeof systemPrompts] || systemPrompts.general
      }
    ];

    // Add conversation history (last 10 messages)
    if (conversation.length > 0) {
      const recentMessages = conversation.slice(-10).map((msg: any) => ({
        role: msg.role,
        content: msg.content
      }));
      messages.push(...recentMessages);
    }

    // Add current message
    messages.push({
      role: 'user',
      content: message
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
      timestamp: new Date().toISOString()
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