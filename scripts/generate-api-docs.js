/**
 * API Documentation Generator for PaveMaster Suite
 * Generates OpenAPI/Swagger documentation from JSDoc comments and route definitions
 */

const swaggerJSDoc = require('swagger-jsdoc');
const fs = require('fs');
const path = require('path');

// Swagger definition
const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'PaveMaster Suite API',
    version: '1.0.0',
    description: 'Comprehensive API documentation for the PaveMaster Suite - AI-assisted pavement analysis and performance tracking system',
    contact: {
      name: 'PaveMaster Support',
      email: 'support@pavemaster.com',
      url: 'https://pavemaster.com/support'
    },
    license: {
      name: 'MIT',
      url: 'https://opensource.org/licenses/MIT'
    }
  },
  servers: [
    {
      url: 'http://localhost:8080',
      description: 'Development server'
    },
    {
      url: 'https://api.pavemaster.com',
      description: 'Production server'
    },
    {
      url: 'https://staging-api.pavemaster.com',
      description: 'Staging server'
    }
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT'
      },
      apiKey: {
        type: 'apiKey',
        in: 'header',
        name: 'X-API-Key'
      }
    },
    schemas: {
      Error: {
        type: 'object',
        properties: {
          error: {
            type: 'string',
            description: 'Error message'
          },
          code: {
            type: 'string',
            description: 'Error code'
          },
          details: {
            type: 'object',
            description: 'Additional error details'
          }
        }
      },
      User: {
        type: 'object',
        properties: {
          id: {
            type: 'string',
            format: 'uuid',
            description: 'Unique user identifier'
          },
          email: {
            type: 'string',
            format: 'email',
            description: 'User email address'
          },
          name: {
            type: 'string',
            description: 'User full name'
          },
          role: {
            type: 'string',
            enum: ['admin', 'manager', 'crew', 'driver'],
            description: 'User role in the system'
          },
          created_at: {
            type: 'string',
            format: 'date-time',
            description: 'Account creation timestamp'
          },
          updated_at: {
            type: 'string',
            format: 'date-time',
            description: 'Last update timestamp'
          }
        }
      },
      Project: {
        type: 'object',
        properties: {
          id: {
            type: 'string',
            format: 'uuid',
            description: 'Unique project identifier'
          },
          name: {
            type: 'string',
            description: 'Project name'
          },
          description: {
            type: 'string',
            description: 'Project description'
          },
          status: {
            type: 'string',
            enum: ['planning', 'in-progress', 'completed', 'on-hold'],
            description: 'Current project status'
          },
          client_name: {
            type: 'string',
            description: 'Client name'
          },
          start_date: {
            type: 'string',
            format: 'date',
            description: 'Project start date'
          },
          end_date: {
            type: 'string',
            format: 'date',
            description: 'Project end date'
          },
          budget: {
            type: 'number',
            format: 'decimal',
            description: 'Project budget'
          },
          created_at: {
            type: 'string',
            format: 'date-time'
          },
          updated_at: {
            type: 'string',
            format: 'date-time'
          }
        }
      },
      Equipment: {
        type: 'object',
        properties: {
          id: {
            type: 'string',
            format: 'uuid',
            description: 'Unique equipment identifier'
          },
          name: {
            type: 'string',
            description: 'Equipment name'
          },
          type: {
            type: 'string',
            description: 'Equipment type'
          },
          model: {
            type: 'string',
            description: 'Equipment model'
          },
          status: {
            type: 'string',
            enum: ['available', 'in-use', 'maintenance', 'retired'],
            description: 'Current equipment status'
          },
          purchase_date: {
            type: 'string',
            format: 'date',
            description: 'Equipment purchase date'
          },
          last_maintenance: {
            type: 'string',
            format: 'date',
            description: 'Last maintenance date'
          },
          next_maintenance: {
            type: 'string',
            format: 'date',
            description: 'Next scheduled maintenance date'
          }
        }
      },
      Vehicle: {
        type: 'object',
        properties: {
          id: {
            type: 'string',
            format: 'uuid',
            description: 'Unique vehicle identifier'
          },
          make: {
            type: 'string',
            description: 'Vehicle make'
          },
          model: {
            type: 'string',
            description: 'Vehicle model'
          },
          year: {
            type: 'integer',
            description: 'Vehicle year'
          },
          license_plate: {
            type: 'string',
            description: 'Vehicle license plate'
          },
          vin: {
            type: 'string',
            description: 'Vehicle identification number'
          },
          status: {
            type: 'string',
            enum: ['available', 'in-use', 'maintenance', 'retired'],
            description: 'Current vehicle status'
          },
          assigned_driver: {
            type: 'string',
            format: 'uuid',
            description: 'Assigned driver user ID'
          },
          mileage: {
            type: 'integer',
            description: 'Current vehicle mileage'
          },
          fuel_level: {
            type: 'number',
            format: 'decimal',
            description: 'Current fuel level percentage'
          },
          gps_location: {
            type: 'object',
            properties: {
              latitude: {
                type: 'number',
                format: 'decimal'
              },
              longitude: {
                type: 'number',
                format: 'decimal'
              },
              timestamp: {
                type: 'string',
                format: 'date-time'
              }
            }
          }
        }
      }
    }
  },
  security: [
    {
      bearerAuth: []
    }
  ]
};

// Options for swagger-jsdoc
const options = {
  definition: swaggerDefinition,
  apis: [
    './src/api/**/*.js',
    './src/api/**/*.ts',
    './src/routes/**/*.js',
    './src/routes/**/*.ts',
    './docs/api-examples.js'
  ]
};

// Initialize swagger-jsdoc
const specs = swaggerJSDoc(options);

// Generate API documentation
function generateApiDocs() {
  const outputDir = './docs/api';
  
  // Create output directory if it doesn't exist
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // Write OpenAPI spec to JSON file
  const jsonPath = path.join(outputDir, 'openapi.json');
  fs.writeFileSync(jsonPath, JSON.stringify(specs, null, 2));
  
  // Write OpenAPI spec to YAML file
  const yaml = require('js-yaml');
  const yamlPath = path.join(outputDir, 'openapi.yaml');
  fs.writeFileSync(yamlPath, yaml.dump(specs));

  // Generate HTML documentation
  const swaggerUiAssetPath = path.join(outputDir, 'index.html');
  const htmlTemplate = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>PaveMaster Suite API Documentation</title>
  <link rel="stylesheet" type="text/css" href="https://unpkg.com/swagger-ui-dist@4.15.5/swagger-ui.css" />
  <style>
    html {
      box-sizing: border-box;
      overflow: -moz-scrollbars-vertical;
      overflow-y: scroll;
    }
    *, *:before, *:after {
      box-sizing: inherit;
    }
    body {
      margin:0;
      background: #fafafa;
    }
  </style>
</head>
<body>
  <div id="swagger-ui"></div>
  <script src="https://unpkg.com/swagger-ui-dist@4.15.5/swagger-ui-bundle.js"></script>
  <script src="https://unpkg.com/swagger-ui-dist@4.15.5/swagger-ui-standalone-preset.js"></script>
  <script>
    window.onload = function() {
      const ui = SwaggerUIBundle({
        url: './openapi.json',
        dom_id: '#swagger-ui',
        deepLinking: true,
        presets: [
          SwaggerUIBundle.presets.apis,
          SwaggerUIStandalonePreset
        ],
        plugins: [
          SwaggerUIBundle.plugins.DownloadUrl
        ],
        layout: "StandaloneLayout"
      });
    };
  </script>
</body>
</html>
  `;
  
  fs.writeFileSync(swaggerUiAssetPath, htmlTemplate);

  console.log('✅ API documentation generated successfully!');
  console.log(`📁 Output directory: ${outputDir}`);
  console.log(`📄 JSON spec: ${jsonPath}`);
  console.log(`📄 YAML spec: ${yamlPath}`);
  console.log(`🌐 HTML docs: ${swaggerUiAssetPath}`);
}

// Run the generator
if (require.main === module) {
  try {
    generateApiDocs();
  } catch (error) {
    console.error('❌ Error generating API documentation:', error.message);
    process.exit(1);
  }
}

module.exports = { generateApiDocs, specs };