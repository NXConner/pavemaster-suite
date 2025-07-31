import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Code, Download, ExternalLink, Copy, Check, FileText, Globe } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

// Simple API documentation data without external dependencies
const apiDocumentation = {
  title: "PaveMaster Suite API",
  version: "1.0.0",
  description: "Comprehensive API for pavement management operations",
  baseUrl: "https://api.pavementperformancesuite.com",
  endpoints: [
    {
      path: "/api/projects",
      method: "GET",
      description: "Get all projects",
      parameters: [
        { name: "page", type: "number", description: "Page number" },
        { name: "limit", type: "number", description: "Items per page" }
      ],
      response: {
        "data": [
          {
            "id": "string",
            "name": "string",
            "status": "active | completed | pending",
            "created_at": "ISO 8601 date"
          }
        ],
        "pagination": {
          "page": "number",
          "total": "number"
        }
      }
    },
    {
      path: "/api/projects",
      method: "POST",
      description: "Create a new project",
      body: {
        "name": "string (required)",
        "description": "string",
        "client_id": "string (required)",
        "estimated_cost": "number"
      },
      response: {
        "id": "string",
        "name": "string",
        "status": "pending",
        "created_at": "ISO 8601 date"
      }
    },
    {
      path: "/api/equipment",
      method: "GET",
      description: "Get equipment list",
      parameters: [
        { name: "status", type: "string", description: "Filter by status" },
        { name: "type", type: "string", description: "Filter by equipment type" }
      ],
      response: {
        "data": [
          {
            "id": "string",
            "name": "string",
            "type": "string",
            "status": "available | in_use | maintenance",
            "location": "object"
          }
        ]
      }
    }
  ]
};

export default function ApiDocumentation() {
  const [copiedExample, setCopiedExample] = useState<string | null>(null);
  const [selectedEndpoint, setSelectedEndpoint] = useState(0);
  const { toast } = useToast();

  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedExample(label);
      toast({
        title: 'Copied to clipboard',
        description: `${label} example copied successfully`,
      });
      setTimeout(() => { setCopiedExample(null); }, 2000);
    } catch (err) {
      toast({
        title: 'Copy failed',
        description: 'Failed to copy to clipboard',
        variant: 'destructive',
      });
    }
  };

  const downloadSpec = () => {
    const blob = new Blob([JSON.stringify(apiDocumentation, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'api-specification.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: 'Download started',
      description: 'API specification downloaded successfully',
    });
  };

  const generateCurlExample = (endpoint: any) => {
    const baseUrl = apiDocumentation.baseUrl;
    if (endpoint.method === 'GET') {
      return `curl -X GET "${baseUrl}${endpoint.path}" \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json"`;
    } else if (endpoint.method === 'POST') {
      return `curl -X POST "${baseUrl}${endpoint.path}" \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '${JSON.stringify(endpoint.body, null, 2)}'`;
    }
    return '';
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">API Documentation</h1>
          <p className="text-muted-foreground mt-2">
            {apiDocumentation.description}
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={downloadSpec} variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Download Spec
          </Button>
          <Button variant="outline" asChild>
            <a href={apiDocumentation.baseUrl} target="_blank" rel="noopener noreferrer">
              <Globe className="h-4 w-4 mr-2" />
              API Base URL
            </a>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                API Endpoints
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {apiDocumentation.endpoints.map((endpoint, index) => (
                  <Button
                    key={index}
                    variant={selectedEndpoint === index ? "default" : "outline"}
                    className="w-full justify-start"
                    onClick={() => setSelectedEndpoint(index)}
                  >
                    <Badge 
                      variant={endpoint.method === 'GET' ? 'secondary' : 'default'}
                      className="mr-2"
                    >
                      {endpoint.method}
                    </Badge>
                    {endpoint.path}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2">
          <Tabs defaultValue="details" className="space-y-4">
            <TabsList>
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="example">Example</TabsTrigger>
              <TabsTrigger value="response">Response</TabsTrigger>
            </TabsList>

            <TabsContent value="details">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Badge variant={apiDocumentation.endpoints[selectedEndpoint].method === 'GET' ? 'secondary' : 'default'}>
                      {apiDocumentation.endpoints[selectedEndpoint].method}
                    </Badge>
                    {apiDocumentation.endpoints[selectedEndpoint].path}
                  </CardTitle>
                  <CardDescription>
                    {apiDocumentation.endpoints[selectedEndpoint].description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {apiDocumentation.endpoints[selectedEndpoint].parameters && (
                    <div className="space-y-4">
                      <h4 className="font-semibold">Parameters</h4>
                      <div className="border rounded-lg overflow-hidden">
                        <table className="w-full">
                          <thead>
                            <tr className="border-b bg-muted/50">
                              <th className="text-left p-3">Name</th>
                              <th className="text-left p-3">Type</th>
                              <th className="text-left p-3">Description</th>
                            </tr>
                          </thead>
                          <tbody>
                            {apiDocumentation.endpoints[selectedEndpoint].parameters?.map((param, index) => (
                              <tr key={index} className="border-b">
                                <td className="p-3 font-mono text-sm">{param.name}</td>
                                <td className="p-3">
                                  <Badge variant="outline">{param.type}</Badge>
                                </td>
                                <td className="p-3">{param.description}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {apiDocumentation.endpoints[selectedEndpoint].body && (
                    <div className="space-y-4 mt-6">
                      <h4 className="font-semibold">Request Body</h4>
                      <div className="bg-muted/50 p-4 rounded-lg">
                        <pre className="text-sm overflow-x-auto">
                          <code>{JSON.stringify(apiDocumentation.endpoints[selectedEndpoint].body, null, 2)}</code>
                        </pre>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="example">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    cURL Example
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(generateCurlExample(apiDocumentation.endpoints[selectedEndpoint]), 'cURL example')}
                    >
                      {copiedExample === 'cURL example' ? (
                        <Check className="h-4 w-4" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="bg-black text-green-400 p-4 rounded-lg font-mono text-sm overflow-x-auto">
                    <pre>{generateCurlExample(apiDocumentation.endpoints[selectedEndpoint])}</pre>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="response">
              <Card>
                <CardHeader>
                  <CardTitle>Response Format</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="bg-muted/50 p-4 rounded-lg">
                    <pre className="text-sm overflow-x-auto">
                      <code>{JSON.stringify(apiDocumentation.endpoints[selectedEndpoint].response, null, 2)}</code>
                    </pre>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Authentication</CardTitle>
          <CardDescription>
            All API requests require authentication using a Bearer token
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h4 className="font-semibold mb-2">Authentication Header</h4>
              <div className="bg-muted/50 p-3 rounded-lg">
                <code>Authorization: Bearer YOUR_API_KEY</code>
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Getting an API Key</h4>
              <p className="text-sm text-muted-foreground">
                Contact your system administrator or visit the settings page to generate an API key.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}