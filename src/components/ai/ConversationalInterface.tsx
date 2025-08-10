import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Textarea } from '../ui/textarea';
import { ScrollArea } from '../ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import {
  MessageSquare,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Send,
  Bot,
  User,
  Settings,
  Languages,
  Brain,
  Sparkles,
  Zap,
  History,
  BookOpen,
  Target,
  AlertCircle,
  CheckCircle,
  Clock,
  Globe,
  Headphones,
  Command,
  BarChart3,
} from 'lucide-react';

// Interfaces
interface Message {
  id: string;
  type: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  confidence?: number;
  intent?: string;
  entities?: Entity[];
  audio?: boolean;
}

interface Entity {
  type: 'project' | 'date' | 'person' | 'location' | 'measurement' | 'action';
  value: string;
  confidence: number;
  start: number;
  end: number;
}

interface Intent {
  name: string;
  confidence: number;
  parameters: Record<string, any>;
}

interface ConversationContext {
  userId: string;
  sessionId: string;
  currentTopic?: string;
  lastIntent?: string;
  entities: Entity[];
  memory: Record<string, any>;
  preferences: {
    language: string;
    voiceEnabled: boolean;
    responseStyle: 'concise' | 'detailed' | 'technical';
  };
}

interface VoiceSettings {
  recognition: {
    language: string;
    continuous: boolean;
    interimResults: boolean;
  };
  synthesis: {
    voice: string;
    rate: number;
    pitch: number;
    volume: number;
  };
}

// NLP Engine
class NLPEngine {
  private intents: Map<string, RegExp[]> = new Map();
  private entityPatterns: Map<string, RegExp> = new Map();
  private context: ConversationContext;

  constructor(context: ConversationContext) {
    this.context = context;
    this.initializeIntents();
    this.initializeEntityPatterns();
  }

  private initializeIntents() {
    // Project Management Intents
    this.intents.set('create_project', [
      /create\s+(?:a\s+)?(?:new\s+)?project/i,
      /start\s+(?:a\s+)?(?:new\s+)?project/i,
      /new\s+project/i,
    ]);

    this.intents.set('view_project', [
      /show\s+(?:me\s+)?project/i,
      /view\s+project/i,
      /open\s+project/i,
      /display\s+project/i,
    ]);

    this.intents.set('update_project', [
      /update\s+project/i,
      /modify\s+project/i,
      /change\s+project/i,
      /edit\s+project/i,
    ]);

    // Scheduling Intents
    this.intents.set('schedule_task', [
      /schedule\s+(?:a\s+)?task/i,
      /create\s+(?:a\s+)?schedule/i,
      /plan\s+(?:a\s+)?task/i,
    ]);

    // Reporting Intents
    this.intents.set('generate_report', [
      /generate\s+(?:a\s+)?report/i,
      /create\s+(?:a\s+)?report/i,
      /show\s+(?:me\s+)?(?:a\s+)?report/i,
    ]);

    // Analytics Intents
    this.intents.set('view_analytics', [
      /show\s+(?:me\s+)?analytics/i,
      /view\s+analytics/i,
      /display\s+statistics/i,
      /show\s+(?:me\s+)?stats/i,
    ]);

    // General Help
    this.intents.set('help', [
      /help/i,
      /how\s+(?:do\s+)?(?:i|can\s+i)/i,
      /what\s+can\s+(?:you|i)\s+do/i,
      /assist/i,
    ]);
  }

  private initializeEntityPatterns() {
    this.entityPatterns.set('date', /\b\d{1,2}\/\d{1,2}\/\d{4}\b|\b\d{4}-\d{2}-\d{2}\b|today|tomorrow|yesterday|next\s+week|last\s+week/gi);
    this.entityPatterns.set('measurement', /\b\d+(?:\.\d+)?\s*(?:ft|feet|in|inches|yd|yards|m|meters|km|kilometers|mi|miles|sq\s*ft|tons|lbs|pounds)\b/gi);
    this.entityPatterns.set('money', /\$\d+(?:,\d{3})*(?:\.\d{2})?/gi);
    this.entityPatterns.set('percentage', /\b\d+(?:\.\d+)?%/gi);
    this.entityPatterns.set('phone', /\b\d{3}-\d{3}-\d{4}\b|\(\d{3}\)\s*\d{3}-\d{4}/gi);
  }

  async processMessage(message: string): Promise<{intent: Intent | null, entities: Entity[]}> {
    const intent = await this.detectIntent(message);
    const entities = await this.extractEntities(message);

    return { intent, entities };
  }

  private async detectIntent(message: string): Promise<Intent | null> {
    let bestMatch: Intent | null = null;
    let highestConfidence = 0;

    for (const [intentName, patterns] of this.intents) {
      for (const pattern of patterns) {
        if (pattern.test(message)) {
          const confidence = this.calculateConfidence(message, pattern);
          if (confidence > highestConfidence) {
            highestConfidence = confidence;
            bestMatch = {
              name: intentName,
              confidence,
              parameters: this.extractParameters(message, intentName),
            };
          }
        }
      }
    }

    return bestMatch;
  }

  private async extractEntities(message: string): Promise<Entity[]> {
    const entities: Entity[] = [];

    for (const [entityType, pattern] of this.entityPatterns) {
      let match;
      while ((match = pattern.exec(message)) !== null) {
        entities.push({
          type: entityType as any,
          value: match[0],
          confidence: 0.9,
          start: match.index,
          end: match.index + match[0].length,
        });
      }
    }

    return entities;
  }

  private calculateConfidence(message: string, pattern: RegExp): number {
    const match = message.match(pattern);
    if (!match) { return 0; }

    // Simple confidence calculation based on match length and position
    const matchLength = match[0].length;
    const messageLength = message.length;
    const position = message.indexOf(match[0]);

    let confidence = (matchLength / messageLength) * 0.6;
    if (position === 0) { confidence += 0.2; } // Bonus for starting with intent
    if (position + matchLength === messageLength) { confidence += 0.2; } // Bonus for ending with intent

    return Math.min(confidence, 1.0);
  }

  private extractParameters(message: string, intentName: string): Record<string, any> {
    const parameters: Record<string, any> = {};

    switch (intentName) {
      case 'create_project': {
        const nameMatch = message.match(/project\s+(?:called\s+|named\s+)?['"]?([^'"]+)['"]?/i);
        if (nameMatch) { parameters.name = nameMatch[1].trim(); }
        break;
      }

      case 'schedule_task': {
        const taskMatch = message.match(/task\s+['"]?([^'"]+)['"]?/i);
        if (taskMatch) { parameters.task = taskMatch[1].trim(); }
        break;
      }
    }

    return parameters;
  }
}

// Voice Interface
class VoiceInterface {
  private recognition: any = null;
  private synthesis: SpeechSynthesis | null = null;
  private isListening = false;
  private settings: VoiceSettings;

  constructor(settings: VoiceSettings) {
    this.settings = settings;
    this.initializeRecognition();
    this.initializeSynthesis();
  }

  private initializeRecognition() {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      this.recognition = new SpeechRecognition();

      this.recognition.continuous = this.settings.recognition.continuous;
      this.recognition.interimResults = this.settings.recognition.interimResults;
      this.recognition.lang = this.settings.recognition.language;
    }
  }

  private initializeSynthesis() {
    if ('speechSynthesis' in window) {
      this.synthesis = window.speechSynthesis;
    }
  }

  async startListening(onResult: (text: string, isFinal: boolean) => void): Promise<void> {
    if (!this.recognition) {
      throw new Error('Speech recognition not supported');
    }

    return new Promise((resolve, reject) => {
      this.recognition.onresult = (event: any) => {
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i].transcript;
          const isFinal = event.results[i].isFinal;
          onResult(transcript, isFinal);
        }
      };

      this.recognition.onerror = (event: any) => {
        reject(new Error(`Speech recognition error: ${event.error}`));
      };

      this.recognition.onend = () => {
        this.isListening = false;
        resolve();
      };

      this.recognition.start();
      this.isListening = true;
    });
  }

  stopListening() {
    if (this.recognition && this.isListening) {
      this.recognition.stop();
    }
  }

  async speak(text: string): Promise<void> {
    if (!this.synthesis) {
      throw new Error('Speech synthesis not supported');
    }

    return new Promise((resolve, reject) => {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.voice = this.synthesis!.getVoices().find(v => v.name === this.settings.synthesis.voice) || null;
      utterance.rate = this.settings.synthesis.rate;
      utterance.pitch = this.settings.synthesis.pitch;
      utterance.volume = this.settings.synthesis.volume;

      utterance.onend = () => { resolve(); };
      utterance.onerror = (event) => { reject(new Error(`Speech synthesis error: ${event.error}`)); };

      this.synthesis!.speak(utterance);
    });
  }

  getAvailableVoices(): SpeechSynthesisVoice[] {
    return this.synthesis ? this.synthesis.getVoices() : [];
  }
}

// Action Executor
class ActionExecutor {
  async executeAction(intent: Intent, entities: Entity[], context: ConversationContext): Promise<string> {
    switch (intent.name) {
      case 'create_project':
        return this.createProject(intent.parameters, entities);

      case 'view_project':
        return this.viewProject(intent.parameters, entities);

      case 'schedule_task':
        return this.scheduleTask(intent.parameters, entities);

      case 'generate_report':
        return this.generateReport(intent.parameters, entities);

      case 'view_analytics':
        return this.viewAnalytics(intent.parameters, entities);

      case 'help':
        return this.provideHelp(intent.parameters);

      default:
        return 'I understand you want to do something, but I\'m not sure exactly what. Could you please rephrase your request?';
    }
  }

  private async createProject(parameters: Record<string, any>, entities: Entity[]): Promise<string> {
    const name = parameters.name || 'New Project';

    // Simulate project creation
    const projectId = `proj_${Date.now()}`;

    return `I've created a new project called "${name}" with ID ${projectId}. The project is now ready for you to add tasks, team members, and resources. Would you like me to help you set up the initial project details?`;
  }

  private async viewProject(parameters: Record<string, any>, entities: Entity[]): Promise<string> {
    // Simulate project retrieval
    return `Here are your current projects:
    
1. **Highway Resurfacing** - 75% complete
2. **Shopping Mall Parking** - 40% complete  
3. **Residential Street Repair** - 90% complete

Which project would you like to view in detail?`;
  }

  private async scheduleTask(parameters: Record<string, any>, entities: Entity[]): Promise<string> {
    const taskName = parameters.task || 'New Task';
    const dateEntity = entities.find(e => e.type === 'date');
    const date = dateEntity?.value || 'today';

    return `I've scheduled the task "${taskName}" for ${date}. The task has been added to your project timeline and team members will be notified. Would you like me to set any specific requirements or assign team members?`;
  }

  private async generateReport(parameters: Record<string, any>, entities: Entity[]): Promise<string> {
    return `I can generate several types of reports for you:

1. **Project Progress Report** - Overview of all active projects
2. **Financial Summary** - Budget analysis and cost tracking
3. **Team Performance Report** - Productivity and efficiency metrics
4. **Equipment Utilization** - Asset usage and maintenance status

Which type of report would you like me to generate?`;
  }

  private async viewAnalytics(parameters: Record<string, any>, entities: Entity[]): Promise<string> {
    return `Here's a summary of your current analytics:

📊 **Key Metrics:**
- Active Projects: 12
- Completion Rate: 94%
- Budget Efficiency: 98%
- Team Productivity: ↗️ 15%

📈 **Trends:**
- Project delivery time improved by 22%
- Material waste reduced by 18%
- Client satisfaction score: 4.8/5

Would you like me to show detailed analytics for any specific area?`;
  }

  private async provideHelp(parameters: Record<string, any>): Promise<string> {
    return `I'm your PaveMaster AI assistant! Here's what I can help you with:

🚀 **Project Management:**
- Create, view, and update projects
- Schedule tasks and manage timelines
- Track progress and milestones

📊 **Analytics & Reporting:**
- Generate custom reports
- View performance analytics
- Monitor KPIs and trends

🗣️ **Voice Commands:**
- Use voice to navigate the system
- Dictate notes and updates
- Get audio feedback

Just tell me what you'd like to do, and I'll help you get it done!`;
  }
}

export const ConversationalInterface: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [context, setContext] = useState<ConversationContext>({
    userId: 'user_1',
    sessionId: `session_${Date.now()}`,
    entities: [],
    memory: {},
    preferences: {
      language: 'en-US',
      voiceEnabled: true,
      responseStyle: 'detailed',
    },
  });
  const [voiceSettings, setVoiceSettings] = useState<VoiceSettings>({
    recognition: {
      language: 'en-US',
      continuous: false,
      interimResults: true,
    },
    synthesis: {
      voice: '',
      rate: 1,
      pitch: 1,
      volume: 1,
    },
  });

  const nlpEngine = useRef<NLPEngine | null>(null);
  const voiceInterface = useRef<VoiceInterface | null>(null);
  const actionExecutor = useRef<ActionExecutor>(new ActionExecutor());
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    nlpEngine.current = new NLPEngine(context);
    voiceInterface.current = new VoiceInterface(voiceSettings);

    // Add welcome message
    setMessages([{
      id: '1',
      type: 'assistant',
      content: 'Hello! I\'m your PaveMaster AI assistant. I can help you manage projects, generate reports, analyze data, and much more. You can type your questions or use voice commands. How can I assist you today?',
      timestamp: new Date(),
      confidence: 1.0,
    }]);

    return () => {
      if (voiceInterface.current) {
        voiceInterface.current.stopListening();
      }
    };
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const processMessage = async (text: string, isVoice = false) => {
    if (!text.trim() || !nlpEngine.current) { return; }

    const userMessage: Message = {
      id: `msg_${Date.now()}`,
      type: 'user',
      content: text,
      timestamp: new Date(),
      audio: isVoice,
    };

    setMessages(prev => [...prev, userMessage]);
    setIsProcessing(true);

    try {
      const { intent, entities } = await nlpEngine.current.processMessage(text);

      let response = '';
      if (intent) {
        response = await actionExecutor.current.executeAction(intent, entities, context);

        // Update context
        setContext(prev => ({
          ...prev,
          lastIntent: intent.name,
          entities: [...prev.entities, ...entities],
        }));
      } else {
        response = 'I\'m not sure I understand. Could you please rephrase your request or ask for help to see what I can do?';
      }

      const assistantMessage: Message = {
        id: `msg_${Date.now() + 1}`,
        type: 'assistant',
        content: response,
        timestamp: new Date(),
        confidence: intent?.confidence || 0.5,
        intent: intent?.name,
        entities,
      };

      setMessages(prev => [...prev, assistantMessage]);

      // Speak response if voice is enabled
      if (context.preferences.voiceEnabled && voiceInterface.current) {
        setIsSpeaking(true);
        try {
          await voiceInterface.current.speak(response);
        } catch (error) {
          console.error('Speech synthesis error:', error);
        } finally {
          setIsSpeaking(false);
        }
      }
    } catch (error) {
      console.error('Error processing message:', error);
      const errorMessage: Message = {
        id: `msg_${Date.now() + 1}`,
        type: 'assistant',
        content: 'I encountered an error processing your request. Please try again.',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSendMessage = async () => {
    await processMessage(inputText);
    setInputText('');
  };

  const handleVoiceInput = async () => {
    if (!voiceInterface.current) { return; }

    if (isListening) {
      voiceInterface.current.stopListening();
      setIsListening(false);
    } else {
      try {
        setIsListening(true);
        await voiceInterface.current.startListening((text, isFinal) => {
          if (isFinal) {
            processMessage(text, true);
            setIsListening(false);
          } else {
            setInputText(text);
          }
        });
      } catch (error) {
        console.error('Voice recognition error:', error);
        setIsListening(false);
      }
    }
  };

  const clearConversation = () => {
    setMessages([{
      id: '1',
      type: 'assistant',
      content: 'Conversation cleared. How can I help you today?',
      timestamp: new Date(),
    }]);
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Bot className="h-6 w-6 text-blue-600" />
              <CardTitle>PaveMaster AI Assistant</CardTitle>
              <Badge variant="secondary" className="ml-2">
                <Sparkles className="h-3 w-3 mr-1" />
                Phase 2.2
              </Badge>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant={context.preferences.voiceEnabled ? 'default' : 'secondary'}>
                {context.preferences.voiceEnabled ? <Volume2 className="h-3 w-3 mr-1" /> : <VolumeX className="h-3 w-3 mr-1" />}
                Voice {context.preferences.voiceEnabled ? 'On' : 'Off'}
              </Badge>
              <Badge variant="outline">
                <Globe className="h-3 w-3 mr-1" />
                {context.preferences.language}
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="chat" className="w-full">
            <TabsList>
              <TabsTrigger value="chat">
                <MessageSquare className="h-4 w-4 mr-2" />
                Chat
              </TabsTrigger>
              <TabsTrigger value="voice">
                <Headphones className="h-4 w-4 mr-2" />
                Voice Settings
              </TabsTrigger>
              <TabsTrigger value="context">
                <Brain className="h-4 w-4 mr-2" />
                Context
              </TabsTrigger>
              <TabsTrigger value="commands">
                <Command className="h-4 w-4 mr-2" />
                Commands
              </TabsTrigger>
            </TabsList>

            <TabsContent value="chat" className="space-y-4">
              <Card>
                <CardContent className="p-4">
                  <ScrollArea className="h-96 w-full pr-4">
                    {messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'} mb-4`}
                      >
                        <div className={`flex ${message.type === 'user' ? 'flex-row-reverse' : 'flex-row'} items-start space-x-2 max-w-3xl`}>
                          <Avatar className="h-8 w-8">
                            <AvatarFallback>
                              {message.type === 'user' ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                            </AvatarFallback>
                          </Avatar>
                          <div className={`rounded-lg p-3 ${
                            message.type === 'user'
                              ? 'bg-blue-600 text-white'
                              : 'bg-gray-100 dark:bg-gray-800'
                          }`}>
                            <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                            <div className="flex items-center mt-2 space-x-2 text-xs opacity-70">
                              <Clock className="h-3 w-3" />
                              <span>{message.timestamp.toLocaleTimeString()}</span>
                              {message.confidence && (
                                <>
                                  <Target className="h-3 w-3" />
                                  <span>{Math.round(message.confidence * 100)}%</span>
                                </>
                              )}
                              {message.audio && <Mic className="h-3 w-3" />}
                            </div>
                            {message.intent && (
                              <Badge variant="outline" className="mt-2 text-xs">
                                {message.intent}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                    {isProcessing && (
                      <div className="flex justify-start mb-4">
                        <div className="flex items-center space-x-2">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback>
                              <Bot className="h-4 w-4" />
                            </AvatarFallback>
                          </Avatar>
                          <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-3">
                            <div className="flex items-center space-x-2">
                              <div className="animate-pulse flex space-x-1">
                                <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                                <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                                <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                              </div>
                              <span className="text-sm text-gray-500">Processing...</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                    <div ref={messagesEndRef} />
                  </ScrollArea>
                </CardContent>
              </Card>

              <div className="flex space-x-2">
                <div className="flex-1 relative">
                  <Input
                    value={inputText}
                    onChange={(e) => { setInputText(e.target.value); }}
                    placeholder="Type your message or use voice input..."
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    disabled={isProcessing}
                  />
                  {isListening && (
                    <div className="absolute right-2 top-2 flex items-center space-x-1">
                      <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                      <span className="text-xs text-red-500">Listening...</span>
                    </div>
                  )}
                </div>
                <Button
                  onClick={handleVoiceInput}
                  variant={isListening ? 'destructive' : 'outline'}
                  size="icon"
                  disabled={isProcessing || isSpeaking}
                >
                  {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                </Button>
                <Button
                  onClick={handleSendMessage}
                  disabled={!inputText.trim() || isProcessing}
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>

              <div className="flex justify-between">
                <Button variant="outline" size="sm" onClick={clearConversation}>
                  <History className="h-4 w-4 mr-2" />
                  Clear Chat
                </Button>
                <div className="flex items-center space-x-2 text-sm text-gray-500">
                  <Badge variant="secondary">
                    {messages.filter(m => m.type === 'user').length} messages
                  </Badge>
                  {isSpeaking && (
                    <Badge variant="default">
                      <Volume2 className="h-3 w-3 mr-1" />
                      Speaking
                    </Badge>
                  )}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="voice" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Voice Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Recognition Language</Label>
                      <Select
                        value={voiceSettings.recognition.language}
                        onValueChange={(value) => {
 setVoiceSettings(prev => ({
                          ...prev,
                          recognition: { ...prev.recognition, language: value },
                        }));
}}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="en-US">English (US)</SelectItem>
                          <SelectItem value="en-GB">English (UK)</SelectItem>
                          <SelectItem value="es-ES">Spanish</SelectItem>
                          <SelectItem value="fr-FR">French</SelectItem>
                          <SelectItem value="de-DE">German</SelectItem>
                          <SelectItem value="zh-CN">Chinese</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Response Style</Label>
                      <Select
                        value={context.preferences.responseStyle}
                        onValueChange={(value: any) => {
 setContext(prev => ({
                          ...prev,
                          preferences: { ...prev.preferences, responseStyle: value },
                        }));
}}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="concise">Concise</SelectItem>
                          <SelectItem value="detailed">Detailed</SelectItem>
                          <SelectItem value="technical">Technical</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Speech Rate: {voiceSettings.synthesis.rate}</Label>
                      <input
                        type="range"
                        min="0.5"
                        max="2"
                        step="0.1"
                        value={voiceSettings.synthesis.rate}
                        onChange={(e) => {
 setVoiceSettings(prev => ({
                          ...prev,
                          synthesis: { ...prev.synthesis, rate: parseFloat(e.target.value) },
                        }));
}}
                        className="w-full"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Speech Pitch: {voiceSettings.synthesis.pitch}</Label>
                      <input
                        type="range"
                        min="0.5"
                        max="2"
                        step="0.1"
                        value={voiceSettings.synthesis.pitch}
                        onChange={(e) => {
 setVoiceSettings(prev => ({
                          ...prev,
                          synthesis: { ...prev.synthesis, pitch: parseFloat(e.target.value) },
                        }));
}}
                        className="w-full"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Speech Volume: {voiceSettings.synthesis.volume}</Label>
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.1"
                        value={voiceSettings.synthesis.volume}
                        onChange={(e) => {
 setVoiceSettings(prev => ({
                          ...prev,
                          synthesis: { ...prev.synthesis, volume: parseFloat(e.target.value) },
                        }));
}}
                        className="w-full"
                      />
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="voiceEnabled"
                      checked={context.preferences.voiceEnabled}
                      onChange={(e) => {
 setContext(prev => ({
                        ...prev,
                        preferences: { ...prev.preferences, voiceEnabled: e.target.checked },
                      }));
}}
                    />
                    <Label htmlFor="voiceEnabled">Enable voice responses</Label>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="context" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Conversation Context</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium">Session ID</Label>
                      <p className="text-sm text-gray-500">{context.sessionId}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Last Intent</Label>
                      <p className="text-sm text-gray-500">{context.lastIntent || 'None'}</p>
                    </div>
                  </div>

                  <div>
                    <Label className="text-sm font-medium">Extracted Entities</Label>
                    <div className="mt-2 space-y-1">
                      {context.entities.length > 0 ? (
                        context.entities.map((entity, index) => (
                          <Badge key={index} variant="outline" className="mr-2">
                            {entity.type}: {entity.value}
                          </Badge>
                        ))
                      ) : (
                        <p className="text-sm text-gray-500">No entities extracted yet</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <Label className="text-sm font-medium">Memory</Label>
                    <div className="mt-2 p-3 bg-card dark:bg-gray-800 rounded-lg">
                      <pre className="text-xs overflow-auto">
                        {JSON.stringify(context.memory, null, 2)}
                      </pre>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="commands" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Available Commands</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4">
                    <div>
                      <h4 className="font-medium mb-2 flex items-center">
                        <Target className="h-4 w-4 mr-2" />
                        Project Management
                      </h4>
                      <div className="space-y-1 text-sm text-gray-600">
                        <p>• "Create a new project called [name]"</p>
                        <p>• "Show me my projects"</p>
                        <p>• "Update project [name]"</p>
                        <p>• "Schedule a task [description] for [date]"</p>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium mb-2 flex items-center">
                        <BarChart3 className="h-4 w-4 mr-2" />
                        Analytics & Reporting
                      </h4>
                      <div className="space-y-1 text-sm text-gray-600">
                        <p>• "Generate a progress report"</p>
                        <p>• "Show me analytics"</p>
                        <p>• "Display performance statistics"</p>
                        <p>• "Create a financial summary"</p>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium mb-2 flex items-center">
                        <Mic className="h-4 w-4 mr-2" />
                        Voice Commands
                      </h4>
                      <div className="space-y-1 text-sm text-gray-600">
                        <p>• Press the microphone button to start voice input</p>
                        <p>• Say "Help" to get assistance</p>
                        <p>• Voice responses can be enabled in settings</p>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium mb-2 flex items-center">
                        <BookOpen className="h-4 w-4 mr-2" />
                        General
                      </h4>
                      <div className="space-y-1 text-sm text-gray-600">
                        <p>• "Help" - Show available commands</p>
                        <p>• "What can you do?" - Show capabilities</p>
                        <p>• Natural language works - just ask!</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};