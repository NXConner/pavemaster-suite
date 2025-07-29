/**
 * API Documentation Configuration
 * Defines OpenAPI/Swagger specification for all API endpoints
 */

// OpenAPI specification configuration
const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'Pavement Performance Suite API',
    version: '1.0.0',
    description: 'Comprehensive API for asphalt paving and sealing business operations',
    contact: {
      name: 'API Support',
      email: 'support@pavementperformance.com',
    },
    license: {
      name: 'MIT',
      url: 'https://opensource.org/licenses/MIT',
    },
  },
  servers: [
    {
      url: 'https://your-project.supabase.co/functions/v1',
      description: 'Production server',
    },
    {
      url: 'http://localhost:54321/functions/v1',
      description: 'Development server',
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
      apiKey: {
        type: 'apiKey',
        in: 'header',
        name: 'apikey',
      },
    },
    schemas: {
      // User schemas
      User: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          email: { type: 'string', format: 'email' },
          first_name: { type: 'string' },
          last_name: { type: 'string' },
          role: { type: 'string', enum: ['admin', 'manager', 'crew', 'driver'] },
          created_at: { type: 'string', format: 'date-time' },
          updated_at: { type: 'string', format: 'date-time' },
        },
      },
      
      // Project schemas
      Project: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          name: { type: 'string' },
          description: { type: 'string' },
          status: { type: 'string', enum: ['planning', 'in-progress', 'completed', 'on-hold'] },
          client_name: { type: 'string' },
          start_date: { type: 'string', format: 'date' },
          end_date: { type: 'string', format: 'date' },
          estimated_cost: { type: 'number', format: 'decimal' },
          actual_cost: { type: 'number', format: 'decimal' },
          location: { type: 'string' },
          created_by: { type: 'string', format: 'uuid' },
          created_at: { type: 'string', format: 'date-time' },
          updated_at: { type: 'string', format: 'date-time' },
        },
      },

      // Equipment schemas
      Equipment: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          name: { type: 'string' },
          type: { type: 'string', enum: ['truck', 'paver', 'roller', 'sprayer', 'other'] },
          model: { type: 'string' },
          year: { type: 'integer' },
          status: { type: 'string', enum: ['available', 'in-use', 'maintenance', 'retired'] },
          last_maintenance: { type: 'string', format: 'date' },
          next_maintenance: { type: 'string', format: 'date' },
          created_at: { type: 'string', format: 'date-time' },
          updated_at: { type: 'string', format: 'date-time' },
        },
      },

      // Material calculation schemas
      MaterialCalculation: {
        type: 'object',
        properties: {
          area: { type: 'number', description: 'Area in square feet' },
          thickness: { type: 'number', description: 'Thickness in inches' },
          density: { type: 'number', description: 'Asphalt density in pounds per cubic foot' },
          tons_needed: { type: 'number', description: 'Total tons of material needed' },
          cost_per_ton: { type: 'number', description: 'Cost per ton of material' },
          total_cost: { type: 'number', description: 'Total material cost' },
        },
      },

      // IoT device schemas
      IoTDevice: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          name: { type: 'string' },
          type: { type: 'string', enum: ['gps', 'temperature', 'fuel', 'camera', 'sensor'] },
          status: { type: 'string', enum: ['online', 'offline', 'error'] },
          last_reading: { type: 'object' },
          battery_level: { type: 'number', minimum: 0, maximum: 100 },
          location: {
            type: 'object',
            properties: {
              latitude: { type: 'number' },
              longitude: { type: 'number' },
            },
          },
          created_at: { type: 'string', format: 'date-time' },
          updated_at: { type: 'string', format: 'date-time' },
        },
      },

      // Error response schema
      Error: {
        type: 'object',
        properties: {
          error: { type: 'string' },
          message: { type: 'string' },
          code: { type: 'string' },
        },
      },

      // Success response schema
      Success: {
        type: 'object',
        properties: {
          success: { type: 'boolean' },
          message: { type: 'string' },
          data: { type: 'object' },
        },
      },
    },
  },
  security: [
    {
      bearerAuth: [],
    },
    {
      apiKey: [],
    },
  ],
};

// API endpoints documentation
const apiDocumentation = {
  '/ai-assistant': {
    post: {
      tags: ['AI & ML'],
      summary: 'AI Assistant Chat',
      description: 'Send messages to the AI assistant for business insights and recommendations',
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                message: { type: 'string', description: 'User message to the AI assistant' },
                context: { 
                  type: 'string', 
                  enum: ['general', 'pavement', 'project', 'safety', 'finance'],
                  description: 'Context for the AI assistant'
                },
                conversation: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      role: { type: 'string', enum: ['user', 'assistant'] },
                      content: { type: 'string' },
                    },
                  },
                  description: 'Previous conversation history'
                },
              },
              required: ['message'],
            },
          },
        },
      },
      responses: {
        200: {
          description: 'AI assistant response',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  response: { type: 'string', description: 'AI assistant response' },
                  context: { type: 'string', description: 'Response context' },
                },
              },
            },
          },
        },
        400: { $ref: '#/components/schemas/Error' },
        500: { $ref: '#/components/schemas/Error' },
      },
    },
  },

  '/voice-to-text': {
    post: {
      tags: ['Voice & Audio'],
      summary: 'Voice to Text Transcription',
      description: 'Convert audio recordings to text using AI transcription',
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                audio: { 
                  type: 'string', 
                  format: 'base64',
                  description: 'Base64 encoded audio data'
                },
              },
              required: ['audio'],
            },
          },
        },
      },
      responses: {
        200: {
          description: 'Transcription result',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  text: { type: 'string', description: 'Transcribed text' },
                },
              },
            },
          },
        },
        400: { $ref: '#/components/schemas/Error' },
        500: { $ref: '#/components/schemas/Error' },
      },
    },
  },

  '/text-to-speech': {
    post: {
      tags: ['Voice & Audio'],
      summary: 'Text to Speech Conversion',
      description: 'Convert text to speech audio using AI voice synthesis',
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                text: { type: 'string', description: 'Text to convert to speech' },
                voice: { 
                  type: 'string', 
                  enum: ['alloy', 'echo', 'fable', 'onyx', 'nova', 'shimmer'],
                  description: 'Voice type for speech synthesis'
                },
              },
              required: ['text'],
            },
          },
        },
      },
      responses: {
        200: {
          description: 'Speech synthesis result',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  audioContent: { 
                    type: 'string', 
                    format: 'base64',
                    description: 'Base64 encoded audio content'
                  },
                },
              },
            },
          },
        },
        400: { $ref: '#/components/schemas/Error' },
        500: { $ref: '#/components/schemas/Error' },
      },
    },
  },
};

// Static swagger specification (no Node.js dependencies)
export const swaggerSpec = {
  ...swaggerDefinition,
  paths: apiDocumentation,
};

// API examples for testing
export const apiExamples = {
  aiAssistant: {
    request: {
      message: "What's the optimal temperature for asphalt paving today?",
      context: "pavement",
      conversation: [
        { role: "user", content: "Good morning" },
        { role: "assistant", content: "Good morning! How can I help with your paving operations today?" }
      ]
    },
    response: {
      response: "Based on current weather conditions, the optimal temperature for asphalt paving is between 50-85°F ambient temperature. Current conditions show 72°F, which is ideal for paving operations.",
      context: "pavement"
    }
  },

  voiceToText: {
    request: {
      audio: "UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N+QQAoUXrTp66hVFApGn+D0u2IdBTCQ1/DJeyw=" 
    },
    response: {
      text: "The asphalt temperature is 275 degrees Fahrenheit and ready for application."
    }
  },

  textToSpeech: {
    request: {
      text: "Asphalt temperature is optimal. Begin paving operations.",
      voice: "alloy"
    },
    response: {
      audioContent: "SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjU4Ljc2LjEwMAAAAAAAAAAAAAAA//tQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWGluZwAAAA8AAAAEAAABIADAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDV1dXV1dXV1dXV1dXV1dXV1dXV1dXV1dXV6urq6urq6urq6urq6urq6urq6urq6urq6v////////////////////////////////8AAAAATGF2YzU4LjEz"
    }
  }
};

export default swaggerSpec;