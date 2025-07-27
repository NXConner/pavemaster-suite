import React, { useState } from 'react';
import SwaggerUI from 'swagger-ui-react';
import 'swagger-ui-react/swagger-ui.css';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Code, Download, ExternalLink, Copy, Check } from 'lucide-react';
import { swaggerSpec, apiExamples } from '@/lib/apiDocumentation';
import { useToast } from '@/hooks/use-toast';

export default function ApiDocumentation() {
  const [copiedExample, setCopiedExample] = useState<string | null>(null);
  const { toast } = useToast();

  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedExample(label);
      toast({
        title: "Copied to clipboard",
        description: `${label} example copied successfully`,
      });
      setTimeout(() => setCopiedExample(null), 2000);
    } catch (err) {
      toast({
        title: "Copy failed",
        description: "Failed to copy to clipboard",
        variant: "destructive",
      });
    }
  };

  const downloadSpec = () => {
    const blob = new Blob([JSON.stringify(swaggerSpec, null, 2)], {
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
      title: "Download started",
      description: "API specification downloaded successfully",
    });
  };

  const ApiExample = ({ title, example, type }: { 
    title: string; 
    example: any; 
    type: 'request' | 'response';
  }) => (
    <Card className="mb-4">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium">{title}</CardTitle>
          <div className="flex gap-2">
            <Badge variant={type === 'request' ? 'default' : 'secondary'}>
              {type === 'request' ? 'Request' : 'Response'}
            </Badge>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => copyToClipboard(JSON.stringify(example, null, 2), `${title} ${type}`)}
            >
              {copiedExample === `${title} ${type}` ? (
                <Check className="h-4 w-4 text-green-500" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <pre className="bg-muted p-3 rounded-md text-sm overflow-x-auto">
          <code>{JSON.stringify(example, null, 2)}</code>
        </pre>
      </CardContent>
    </Card>
  );

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">API Documentation</h1>
          <p className="text-muted-foreground">
            Comprehensive API documentation for the Pavement Performance Suite
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={downloadSpec} variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Download Spec
          </Button>
          <Button asChild>
            <a 
              href="https://editor.swagger.io/" 
              target="_blank" 
              rel="noopener noreferrer"
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Swagger Editor
            </a>
          </Button>
        </div>
      </div>

      <Tabs defaultValue="interactive" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="interactive">Interactive API</TabsTrigger>
          <TabsTrigger value="examples">Code Examples</TabsTrigger>
          <TabsTrigger value="specification">Raw Specification</TabsTrigger>
        </TabsList>

        <TabsContent value="interactive" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Code className="h-5 w-5" />
                Interactive API Explorer
              </CardTitle>
              <CardDescription>
                Test API endpoints directly from this interface. Requires valid authentication.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="border rounded-lg overflow-hidden">
                <SwaggerUI 
                  spec={swaggerSpec}
                  deepLinking={true}
                  displayRequestDuration={true}
                  tryItOutEnabled={true}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="examples" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>API Examples & Testing</CardTitle>
              <CardDescription>
                Ready-to-use examples for all API endpoints with sample requests and responses
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              
              {/* AI Assistant Examples */}
              <div>
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <Badge variant="outline">POST</Badge>
                  AI Assistant
                </h3>
                <div className="grid gap-4 md:grid-cols-2">
                  <ApiExample 
                    title="AI Assistant Request" 
                    example={apiExamples.aiAssistant.request}
                    type="request"
                  />
                  <ApiExample 
                    title="AI Assistant Response" 
                    example={apiExamples.aiAssistant.response}
                    type="response"
                  />
                </div>
              </div>

              {/* Voice to Text Examples */}
              <div>
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <Badge variant="outline">POST</Badge>
                  Voice to Text
                </h3>
                <div className="grid gap-4 md:grid-cols-2">
                  <ApiExample 
                    title="Voice to Text Request" 
                    example={apiExamples.voiceToText.request}
                    type="request"
                  />
                  <ApiExample 
                    title="Voice to Text Response" 
                    example={apiExamples.voiceToText.response}
                    type="response"
                  />
                </div>
              </div>

              {/* Text to Speech Examples */}
              <div>
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <Badge variant="outline">POST</Badge>
                  Text to Speech
                </h3>
                <div className="grid gap-4 md:grid-cols-2">
                  <ApiExample 
                    title="Text to Speech Request" 
                    example={apiExamples.textToSpeech.request}
                    type="request"
                  />
                  <ApiExample 
                    title="Text to Speech Response" 
                    example={apiExamples.textToSpeech.response}
                    type="response"
                  />
                </div>
              </div>

              {/* cURL Examples */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">cURL Examples</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">AI Assistant</h4>
                    <pre className="bg-muted p-3 rounded-md text-sm overflow-x-auto">
                      <code>{`curl -X POST "https://your-project.supabase.co/functions/v1/ai-assistant" \\
  -H "Authorization: Bearer YOUR_TOKEN" \\
  -H "Content-Type: application/json" \\
  -d '{
    "message": "What is the optimal temperature for asphalt paving?",
    "context": "pavement"
  }'`}</code>
                    </pre>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">Voice to Text</h4>
                    <pre className="bg-muted p-3 rounded-md text-sm overflow-x-auto">
                      <code>{`curl -X POST "https://your-project.supabase.co/functions/v1/voice-to-text" \\
  -H "Authorization: Bearer YOUR_TOKEN" \\
  -H "Content-Type: application/json" \\
  -d '{
    "audio": "BASE64_ENCODED_AUDIO_DATA"
  }'`}</code>
                    </pre>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">Text to Speech</h4>
                    <pre className="bg-muted p-3 rounded-md text-sm overflow-x-auto">
                      <code>{`curl -X POST "https://your-project.supabase.co/functions/v1/text-to-speech" \\
  -H "Authorization: Bearer YOUR_TOKEN" \\
  -H "Content-Type: application/json" \\
  -d '{
    "text": "Asphalt temperature is optimal for paving operations.",
    "voice": "alloy"
  }'`}</code>
                    </pre>
                  </div>
                </CardContent>
              </Card>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="specification" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>OpenAPI 3.0 Specification</CardTitle>
              <CardDescription>
                Raw JSON specification file for import into API development tools
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex justify-end mb-4">
                <Button
                  variant="outline"
                  onClick={() => copyToClipboard(JSON.stringify(swaggerSpec, null, 2), 'API Specification')}
                >
                  {copiedExample === 'API Specification' ? (
                    <Check className="h-4 w-4 mr-2 text-green-500" />
                  ) : (
                    <Copy className="h-4 w-4 mr-2" />
                  )}
                  Copy Specification
                </Button>
              </div>
              <pre className="bg-muted p-4 rounded-md text-xs overflow-auto max-h-96">
                <code>{JSON.stringify(swaggerSpec, null, 2)}</code>
              </pre>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}