import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Header } from '@/components/Header';
import { AIAssistant } from '@/components/AIAssistant';
import { VoiceInterface } from '@/components/VoiceInterface';
import { 
  Brain, 
  Mic, 
  MessageSquare, 
  Calculator, 
  Settings, 
  Shield, 
  DollarSign,
  Sparkles,
  Zap,
  Bot
} from 'lucide-react';

export default function AIHubPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center gap-3">
          <Brain className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold text-foreground">AI Hub</h1>
            <p className="text-muted-foreground">
              Intelligent assistance for pavement operations and project management
            </p>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-primary" />
                Chat Assistant
              </CardTitle>
              <CardDescription>
                Get instant answers to your questions about pavement operations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Badge variant="default">Active</Badge>
                <Badge variant="secondary">GPT-4</Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mic className="h-5 w-5 text-primary" />
                Voice Commands
              </CardTitle>
              <CardDescription>
                Hands-free operation with voice-to-text and text-to-speech
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Badge variant="default">Enabled</Badge>
                <Badge variant="secondary">Whisper</Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calculator className="h-5 w-5 text-primary" />
                Smart Calculations
              </CardTitle>
              <CardDescription>
                AI-powered material calculations and cost estimations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Badge variant="default">Ready</Badge>
                <Badge variant="secondary">ML</Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="general" className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="general" className="flex items-center gap-2">
              <Bot className="h-4 w-4" />
              General
            </TabsTrigger>
            <TabsTrigger value="pavement" className="flex items-center gap-2">
              <Sparkles className="h-4 w-4" />
              Pavement
            </TabsTrigger>
            <TabsTrigger value="project" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Project
            </TabsTrigger>
            <TabsTrigger value="safety" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Safety
            </TabsTrigger>
            <TabsTrigger value="finance" className="flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Finance
            </TabsTrigger>
            <TabsTrigger value="voice" className="flex items-center gap-2">
              <Mic className="h-4 w-4" />
              Voice
            </TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bot className="h-5 w-5" />
                  General AI Assistant
                </CardTitle>
                <CardDescription>
                  Get help with general questions about the application, navigation, and basic functionality.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <AIAssistant context="general" />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="pavement" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5" />
                  Pavement Specialist
                </CardTitle>
                <CardDescription>
                  Expert guidance on asphalt operations, mix designs, quality control, and pavement construction.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <AIAssistant context="pavement" />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="project" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Project Manager
                </CardTitle>
                <CardDescription>
                  Assistance with project planning, scheduling, resource allocation, and progress tracking.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <AIAssistant context="project" />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="safety" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Safety Advisor
                </CardTitle>
                <CardDescription>
                  Safety protocols, OSHA compliance, hazard identification, and emergency procedures.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <AIAssistant context="safety" />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="finance" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Financial Advisor
                </CardTitle>
                <CardDescription>
                  Cost tracking, profitability analysis, pricing strategies, and financial reporting.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <AIAssistant context="finance" />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="voice" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Mic className="h-5 w-5" />
                    Voice Interface
                  </CardTitle>
                  <CardDescription>
                    Interact with AI using voice commands and get spoken responses.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <VoiceInterface />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="h-5 w-5" />
                    Voice Features
                  </CardTitle>
                  <CardDescription>
                    Advanced voice capabilities and settings
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Speech Recognition</span>
                    <Badge variant="default">Whisper-1</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Text-to-Speech</span>
                    <Badge variant="default">OpenAI TTS</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Voice Model</span>
                    <Badge variant="secondary">Alloy</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Language</span>
                    <Badge variant="secondary">English</Badge>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}