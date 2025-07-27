#!/usr/bin/env node

/**
 * API Documentation Generation Script
 * Generates OpenAPI/Swagger documentation and exports it to various formats
 */

const fs = require('fs');
const path = require('path');

// Since we're using ES modules in the main app, we'll create a simple version here
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
  },
  paths: {
    '/ai-assistant': {
      post: {
        tags: ['AI & ML'],
        summary: 'AI Assistant Chat',
        description: 'Send messages to the AI assistant for business insights and recommendations',
        security: [{ bearerAuth: [] }, { apiKey: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  message: { type: 'string', description: 'User message' },
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
                    response: { type: 'string' },
                    context: { type: 'string' },
                  },
                },
              },
            },
          },
          400: {
            description: 'Bad request',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    error: { type: 'string' },
                  },
                },
              },
            },
          },
        },
      },
    },
    '/voice-to-text': {
      post: {
        tags: ['Voice & Audio'],
        summary: 'Voice to Text Transcription',
        description: 'Convert audio recordings to text using AI transcription',
        security: [{ bearerAuth: [] }, { apiKey: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  audio: { type: 'string', format: 'base64' },
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
                    text: { type: 'string' },
                  },
                },
              },
            },
          },
        },
      },
    },
    '/text-to-speech': {
      post: {
        tags: ['Voice & Audio'],
        summary: 'Text to Speech Conversion',
        description: 'Convert text to speech audio using AI voice synthesis',
        security: [{ bearerAuth: [] }, { apiKey: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  text: { type: 'string' },
                  voice: { 
                    type: 'string', 
                    enum: ['alloy', 'echo', 'fable', 'onyx', 'nova', 'shimmer']
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
                    audioContent: { type: 'string', format: 'base64' },
                  },
                },
              },
            },
          },
        },
      },
    },
  },
};

// Create docs directory if it doesn't exist
const docsDir = path.join(process.cwd(), 'docs');
if (!fs.existsSync(docsDir)) {
  fs.mkdirSync(docsDir, { recursive: true });
}

// Generate API documentation files
try {
  // Generate swagger.json
  const swaggerPath = path.join(docsDir, 'swagger.json');
  fs.writeFileSync(swaggerPath, JSON.stringify(swaggerDefinition, null, 2));
  console.log('✅ Generated swagger.json');

  // Generate API documentation markdown
  const markdownContent = generateMarkdownDocs(swaggerDefinition);
  const markdownPath = path.join(docsDir, 'API_DOCUMENTATION.md');
  fs.writeFileSync(markdownPath, markdownContent);
  console.log('✅ Generated API_DOCUMENTATION.md');

  // Generate Postman collection
  const postmanCollection = generatePostmanCollection(swaggerDefinition);
  const postmanPath = path.join(docsDir, 'Pavement_Performance_Suite.postman_collection.json');
  fs.writeFileSync(postmanPath, JSON.stringify(postmanCollection, null, 2));
  console.log('✅ Generated Postman collection');

  console.log('\n🎉 API documentation generated successfully!');
  console.log(`📁 Files created in: ${docsDir}`);
  console.log('   - swagger.json (OpenAPI specification)');
  console.log('   - API_DOCUMENTATION.md (Human-readable docs)');
  console.log('   - Pavement_Performance_Suite.postman_collection.json (Postman collection)');
  
} catch (error) {
  console.error('❌ Error generating API documentation:', error);
  process.exit(1);
}

function generateMarkdownDocs(spec) {
  return `# Pavement Performance Suite API Documentation

## Overview
${spec.info.description}

**Version:** ${spec.info.version}  
**Base URL:** ${spec.servers[0].url}

## Authentication
This API uses Bearer token authentication. Include your JWT token in the Authorization header:
\`\`\`
Authorization: Bearer YOUR_JWT_TOKEN
\`\`\`

Alternatively, you can use the API key in the header:
\`\`\`
apikey: YOUR_API_KEY
\`\`\`

## Endpoints

### AI Assistant
**POST** \`/ai-assistant\`

Send messages to the AI assistant for business insights and recommendations.

**Request Body:**
\`\`\`json
{
  "message": "What's the optimal temperature for asphalt paving?",
  "context": "pavement",
  "conversation": [
    {
      "role": "user",
      "content": "Previous message"
    }
  ]
}
\`\`\`

**Response:**
\`\`\`json
{
  "response": "Based on current conditions, optimal temperature is 70-85°F",
  "context": "pavement"
}
\`\`\`

### Voice to Text
**POST** \`/voice-to-text\`

Convert audio recordings to text using AI transcription.

**Request Body:**
\`\`\`json
{
  "audio": "BASE64_ENCODED_AUDIO_DATA"
}
\`\`\`

**Response:**
\`\`\`json
{
  "text": "Transcribed text from audio"
}
\`\`\`

### Text to Speech
**POST** \`/text-to-speech\`

Convert text to speech audio using AI voice synthesis.

**Request Body:**
\`\`\`json
{
  "text": "Text to convert to speech",
  "voice": "alloy"
}
\`\`\`

**Response:**
\`\`\`json
{
  "audioContent": "BASE64_ENCODED_AUDIO_CONTENT"
}
\`\`\`

## Error Handling
All endpoints return errors in the following format:
\`\`\`json
{
  "error": "Error message description"
}
\`\`\`

## Rate Limiting
API calls are subject to rate limiting based on your subscription plan. Include appropriate error handling for 429 (Too Many Requests) responses.

## Support
For API support, contact: ${spec.info.contact.email}
`;
}

function generatePostmanCollection(spec) {
  return {
    info: {
      name: 'Pavement Performance Suite API',
      description: spec.info.description,
      version: spec.info.version,
      schema: 'https://schema.getpostman.com/json/collection/v2.1.0/collection.json',
    },
    auth: {
      type: 'bearer',
      bearer: [
        {
          key: 'token',
          value: '{{jwt_token}}',
          type: 'string',
        },
      ],
    },
    variable: [
      {
        key: 'base_url',
        value: spec.servers[0].url,
        type: 'string',
      },
      {
        key: 'jwt_token',
        value: 'YOUR_JWT_TOKEN',
        type: 'string',
      },
    ],
    item: [
      {
        name: 'AI Assistant',
        request: {
          method: 'POST',
          header: [
            {
              key: 'Content-Type',
              value: 'application/json',
            },
          ],
          url: {
            raw: '{{base_url}}/ai-assistant',
            host: ['{{base_url}}'],
            path: ['ai-assistant'],
          },
          body: {
            mode: 'raw',
            raw: JSON.stringify({
              message: "What's the optimal temperature for asphalt paving?",
              context: 'pavement',
            }, null, 2),
          },
        },
      },
      {
        name: 'Voice to Text',
        request: {
          method: 'POST',
          header: [
            {
              key: 'Content-Type',
              value: 'application/json',
            },
          ],
          url: {
            raw: '{{base_url}}/voice-to-text',
            host: ['{{base_url}}'],
            path: ['voice-to-text'],
          },
          body: {
            mode: 'raw',
            raw: JSON.stringify({
              audio: 'BASE64_ENCODED_AUDIO_DATA',
            }, null, 2),
          },
        },
      },
      {
        name: 'Text to Speech',
        request: {
          method: 'POST',
          header: [
            {
              key: 'Content-Type',
              value: 'application/json',
            },
          ],
          url: {
            raw: '{{base_url}}/text-to-speech',
            host: ['{{base_url}}'],
            path: ['text-to-speech'],
          },
          body: {
            mode: 'raw',
            raw: JSON.stringify({
              text: 'Asphalt temperature is optimal for paving operations.',
              voice: 'alloy',
            }, null, 2),
          },
        },
      },
    ],
  };
}