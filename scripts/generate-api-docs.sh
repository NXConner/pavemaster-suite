#!/bin/bash

# API Documentation Generation Script for PaveMaster Suite
# Generates comprehensive API documentation with examples and interactive UI

set -e

echo "📚 Generating API Documentation for PaveMaster Suite"
echo "==================================================="

# Configuration
DOCS_DIR="./docs/api"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_DIR="./docs/api-backups"

# Create directories if they don't exist
mkdir -p "$DOCS_DIR"
mkdir -p "$BACKUP_DIR"

echo "📁 Documentation Directory: $DOCS_DIR"
echo "🕒 Generation Time: $TIMESTAMP"
echo ""

# Backup existing documentation
if [ -d "$DOCS_DIR" ] && [ "$(ls -A $DOCS_DIR)" ]; then
    echo "💾 Backing up existing documentation..."
    tar -czf "$BACKUP_DIR/api-docs-backup-$TIMESTAMP.tar.gz" -C "$DOCS_DIR" .
    echo "✅ Backup created: $BACKUP_DIR/api-docs-backup-$TIMESTAMP.tar.gz"
    echo ""
fi

# Check if required dependencies are installed
echo "🔍 Checking dependencies..."

if ! npm list swagger-jsdoc >/dev/null 2>&1; then
    echo "📦 Installing swagger-jsdoc..."
    npm install swagger-jsdoc
fi

if ! npm list js-yaml >/dev/null 2>&1; then
    echo "📦 Installing js-yaml..."
    npm install js-yaml
fi

echo "✅ Dependencies verified"
echo ""

# Generate API documentation
echo "🔧 Generating API documentation..."
node scripts/generate-api-docs.js

if [ $? -eq 0 ]; then
    echo "✅ API documentation generated successfully!"
else
    echo "❌ Error generating API documentation"
    exit 1
fi

echo ""

# Validate generated files
echo "🔍 Validating generated files..."

REQUIRED_FILES=(
    "$DOCS_DIR/openapi.json"
    "$DOCS_DIR/openapi.yaml"
    "$DOCS_DIR/index.html"
)

for file in "${REQUIRED_FILES[@]}"; do
    if [ -f "$file" ]; then
        echo "✅ $file"
    else
        echo "❌ Missing: $file"
        exit 1
    fi
done

echo ""

# Generate additional documentation files
echo "📄 Generating additional documentation..."

# Create API usage examples
cat > "$DOCS_DIR/usage-examples.md" << 'EOF'
# PaveMaster Suite API Usage Examples

## Authentication

### Login
```bash
curl -X POST https://api.pavemaster.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "user@pavemaster.com", "password": "SecurePassword123!"}'
```

### Use Bearer Token
```bash
curl -X GET https://api.pavemaster.com/api/projects \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## Projects

### Get All Projects
```bash
curl -X GET "https://api.pavemaster.com/api/projects?status=in-progress&page=1&limit=10" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Create New Project
```bash
curl -X POST https://api.pavemaster.com/api/projects \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Main Street Resurfacing",
    "description": "Complete resurfacing of Main Street",
    "client_name": "City of Springfield",
    "start_date": "2024-03-01",
    "end_date": "2024-03-15",
    "budget": 250000.00
  }'
```

### Update Project Status
```bash
curl -X PUT https://api.pavemaster.com/api/projects/PROJECT_ID \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"status": "completed"}'
```

## Equipment Management

### Get Available Equipment
```bash
curl -X GET "https://api.pavemaster.com/api/equipment?status=available" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Add New Equipment
```bash
curl -X POST https://api.pavemaster.com/api/equipment \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Asphalt Paver #2",
    "type": "Paver",
    "model": "CAT AP1055F",
    "purchase_date": "2024-01-15"
  }'
```

## Fleet Management

### Get Fleet Status
```bash
curl -X GET https://api.pavemaster.com/api/fleet \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Get Vehicle Location
```bash
curl -X GET https://api.pavemaster.com/api/fleet/VEHICLE_ID/location \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## JavaScript/TypeScript Examples

### Using Fetch API
```typescript
// Login and get token
async function login(email: string, password: string) {
  const response = await fetch('/api/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  });
  
  if (!response.ok) {
    throw new Error('Login failed');
  }
  
  const data = await response.json();
  return data.token;
}

// Get projects with authentication
async function getProjects(token: string) {
  const response = await fetch('/api/projects', {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  
  if (!response.ok) {
    throw new Error('Failed to fetch projects');
  }
  
  return response.json();
}
```

### Using Axios
```typescript
import axios from 'axios';

// Configure axios instance
const api = axios.create({
  baseURL: 'https://api.pavemaster.com',
  timeout: 10000,
});

// Add authentication interceptor
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Use the API
async function createProject(projectData: any) {
  try {
    const response = await api.post('/api/projects', projectData);
    return response.data;
  } catch (error) {
    console.error('Error creating project:', error);
    throw error;
  }
}
```

## Error Handling

### Common Error Responses
```json
{
  "error": "Invalid credentials",
  "code": "AUTH_INVALID",
  "details": {
    "field": "password",
    "message": "Password is incorrect"
  }
}
```

### Handling Validation Errors
```typescript
try {
  await createProject(projectData);
} catch (error) {
  if (error.response?.status === 422) {
    // Handle validation errors
    const validationErrors = error.response.data.details;
    console.log('Validation errors:', validationErrors);
  } else if (error.response?.status === 401) {
    // Handle authentication errors
    console.log('Authentication required');
    redirectToLogin();
  }
}
```

## Rate Limiting

The API implements rate limiting to ensure fair usage:
- **Authentication endpoints**: 5 requests per minute
- **Data retrieval**: 100 requests per minute
- **Data modification**: 50 requests per minute

### Rate Limit Headers
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1640995200
```

## Pagination

Large datasets are paginated:

```bash
curl -X GET "https://api.pavemaster.com/api/projects?page=2&limit=20" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

Response includes pagination metadata:
```json
{
  "projects": [...],
  "pagination": {
    "current_page": 2,
    "total_pages": 5,
    "total_items": 98,
    "items_per_page": 20
  }
}
```
EOF

# Create API testing guide
cat > "$DOCS_DIR/testing-guide.md" << 'EOF'
# API Testing Guide

## Testing Tools

### Postman Collection
Import the provided Postman collection for interactive API testing:
1. Download `pavemaster-api.postman_collection.json`
2. Import into Postman
3. Set environment variables for base URL and authentication token

### Newman (CLI Testing)
```bash
# Install Newman
npm install -g newman

# Run collection
newman run pavemaster-api.postman_collection.json \
  --environment pavemaster-api.postman_environment.json
```

### cURL Testing Scripts
Use the provided shell scripts for automated testing:
```bash
# Run all API tests
./scripts/test-api.sh

# Test specific endpoints
./scripts/test-api.sh --endpoint auth
./scripts/test-api.sh --endpoint projects
```

## Test Data

### Sample Users
- **Admin**: admin@pavemaster.com / AdminPass123!
- **Manager**: manager@pavemaster.com / ManagerPass123!
- **Crew Lead**: crew@pavemaster.com / CrewPass123!

### Sample Projects
Test projects are automatically created during database seeding.

## Automated Testing

### Integration Tests
```bash
# Run API integration tests
npm run test:api
```

### Load Testing
```bash
# Run performance tests
npm run test:performance
```

### Security Testing
```bash
# Run security tests
npm run test:security
```
EOF

echo "✅ Additional documentation generated"
echo ""

# Create deployment-ready package
echo "📦 Creating deployment package..."

PACKAGE_DIR="$DOCS_DIR/deployment"
mkdir -p "$PACKAGE_DIR"

# Copy all files to deployment directory
cp "$DOCS_DIR"/*.json "$PACKAGE_DIR/"
cp "$DOCS_DIR"/*.yaml "$PACKAGE_DIR/"
cp "$DOCS_DIR"/*.html "$PACKAGE_DIR/"
cp "$DOCS_DIR"/*.md "$PACKAGE_DIR/"

echo "✅ Deployment package created: $PACKAGE_DIR"
echo ""

# Generate summary report
echo "📊 Documentation Summary"
echo "========================"
echo "📁 Base Directory: $DOCS_DIR"
echo "📄 OpenAPI Specification: openapi.json, openapi.yaml"
echo "🌐 Interactive Documentation: index.html"
echo "📖 Usage Examples: usage-examples.md"
echo "🧪 Testing Guide: testing-guide.md"
echo "📦 Deployment Package: $PACKAGE_DIR"
echo ""

# File sizes
echo "📏 File Sizes:"
for file in "$DOCS_DIR"/*.json "$DOCS_DIR"/*.yaml "$DOCS_DIR"/*.html "$DOCS_DIR"/*.md; do
    if [ -f "$file" ]; then
        size=$(du -h "$file" | cut -f1)
        basename_file=$(basename "$file")
        echo "  $basename_file: $size"
    fi
done

echo ""
echo "🎉 API documentation generation completed successfully!"
echo ""
echo "📋 Next Steps:"
echo "  1. Review generated documentation in $DOCS_DIR"
echo "  2. Open index.html in browser for interactive documentation"
echo "  3. Test API endpoints using provided examples"
echo "  4. Deploy documentation to web server or documentation platform"
echo "  5. Share API documentation with development team and stakeholders"