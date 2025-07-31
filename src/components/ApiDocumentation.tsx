import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Code, 
  Book, 
  Search, 
  Copy, 
  ExternalLink,
  Tag,
  Play,
  CheckCircle
} from 'lucide-react';

interface ApiEndpoint {
  id: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  path: string;
  description: string;
  category: string;
  parameters?: { name: string; type: string; required: boolean; description: string }[];
  example?: {
    request?: string;
    response?: string;
  };
}

const mockEndpoints: ApiEndpoint[] = [
  {
    id: '1',
    method: 'GET',
    path: '/api/projects',
    description: 'Retrieve all projects',
    category: 'Projects',
    parameters: [
      { name: 'page', type: 'number', required: false, description: 'Page number for pagination' },
      { name: 'limit', type: 'number', required: false, description: 'Number of items per page' },
      { name: 'status', type: 'string', required: false, description: 'Filter by project status' }
    ],
    example: {
      request: 'GET /api/projects?page=1&limit=10&status=active',
      response: `{
  "data": [
    {
      "id": "proj_123",
      "name": "Highway Repair Project",
      "status": "active",
      "startDate": "2024-01-15",
      "location": "Highway 101"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 25
  }
}`
    }
  },
  {
    id: '2',
    method: 'POST',
    path: '/api/projects',
    description: 'Create a new project',
    category: 'Projects',
    parameters: [
      { name: 'name', type: 'string', required: true, description: 'Project name' },
      { name: 'description', type: 'string', required: false, description: 'Project description' },
      { name: 'location', type: 'string', required: true, description: 'Project location' }
    ],
    example: {
      request: `POST /api/projects
Content-Type: application/json

{
  "name": "Parking Lot Resurfacing",
  "description": "Complete resurfacing of mall parking lot",
  "location": "Shopping Mall - Downtown"
}`,
      response: `{
  "id": "proj_124",
  "name": "Parking Lot Resurfacing",
  "status": "pending",
  "createdAt": "2024-01-28T10:30:00Z"
}`
    }
  },
  {
    id: '3',
    method: 'GET',
    path: '/api/equipment',
    description: 'Retrieve equipment inventory',
    category: 'Equipment',
    parameters: [
      { name: 'type', type: 'string', required: false, description: 'Filter by equipment type' },
      { name: 'status', type: 'string', required: false, description: 'Filter by availability status' }
    ]
  }
];

export default function ApiDocumentation() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const categories = ['all', ...Array.from(new Set(mockEndpoints.map(ep => ep.category)))];
  
  const filteredEndpoints = mockEndpoints.filter(endpoint => {
    const matchesSearch = endpoint.path.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         endpoint.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || endpoint.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getMethodColor = (method: string) => {
    switch (method) {
      case 'GET':
        return 'text-green-700 bg-green-50';
      case 'POST':
        return 'text-blue-700 bg-blue-50';
      case 'PUT':
        return 'text-orange-700 bg-orange-50';
      case 'DELETE':
        return 'text-red-700 bg-red-50';
      case 'PATCH':
        return 'text-purple-700 bg-purple-50';
      default:
        return 'text-gray-700 bg-gray-50';
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Book className="h-8 w-8" />
            API Documentation
          </h1>
          <p className="text-muted-foreground">
            Complete reference for the PaveMaster Suite API
          </p>
        </div>
        <Button variant="outline">
          <ExternalLink className="h-4 w-4 mr-2" />
          View in Postman
        </Button>
      </div>

      {/* Search and Filters */}
      <div className="flex items-center space-x-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search endpoints..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="border rounded-md px-3 py-2"
        >
          {categories.map(category => (
            <option key={category} value={category}>
              {category === 'all' ? 'All Categories' : category}
            </option>
          ))}
        </select>
      </div>

      {/* API Endpoints */}
      <div className="space-y-4">
        {filteredEndpoints.map((endpoint) => (
          <Card key={endpoint.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Badge className={getMethodColor(endpoint.method)}>
                    {endpoint.method}
                  </Badge>
                  <code className="text-sm bg-gray-100 px-2 py-1 rounded">
                    {endpoint.path}
                  </code>
                  <Badge variant="outline">
                    <Tag className="h-3 w-3 mr-1" />
                    {endpoint.category}
                  </Badge>
                </div>
                <Button size="sm" variant="outline">
                  <Play className="h-4 w-4 mr-2" />
                  Try it
                </Button>
              </div>
              <CardTitle className="text-lg">{endpoint.description}</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="parameters" className="w-full">
                <TabsList>
                  <TabsTrigger value="parameters">Parameters</TabsTrigger>
                  <TabsTrigger value="example">Example</TabsTrigger>
                  <TabsTrigger value="response">Response</TabsTrigger>
                </TabsList>
                
                <TabsContent value="parameters" className="space-y-4">
                  {endpoint.parameters && endpoint.parameters.length > 0 ? (
                    <div className="space-y-2">
                      {endpoint.parameters.map((param, index) => (
                        <div key={index} className="border rounded-lg p-3">
                          <div className="flex items-center space-x-2 mb-1">
                            <code className="text-sm font-medium">{param.name}</code>
                            <Badge variant={param.required ? "default" : "secondary"}>
                              {param.required ? 'Required' : 'Optional'}
                            </Badge>
                            <Badge variant="outline">{param.type}</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {param.description}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground">No parameters required</p>
                  )}
                </TabsContent>
                
                <TabsContent value="example" className="space-y-4">
                  {endpoint.example?.request && (
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium">Request</h4>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => copyToClipboard(endpoint.example!.request!, `${endpoint.id}-request`)}
                        >
                          {copiedId === `${endpoint.id}-request` ? (
                            <CheckCircle className="h-4 w-4 text-green-600" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                      <pre className="bg-gray-100 p-3 rounded-md text-sm overflow-x-auto">
                        <code>{endpoint.example.request}</code>
                      </pre>
                    </div>
                  )}
                </TabsContent>
                
                <TabsContent value="response" className="space-y-4">
                  {endpoint.example?.response && (
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium">Response</h4>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => copyToClipboard(endpoint.example!.response!, `${endpoint.id}-response`)}
                        >
                          {copiedId === `${endpoint.id}-response` ? (
                            <CheckCircle className="h-4 w-4 text-green-600" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                      <pre className="bg-gray-100 p-3 rounded-md text-sm overflow-x-auto">
                        <code>{endpoint.example.response}</code>
                      </pre>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredEndpoints.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <Code className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium mb-2">No endpoints found</h3>
            <p className="text-muted-foreground">
              Try adjusting your search criteria
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}