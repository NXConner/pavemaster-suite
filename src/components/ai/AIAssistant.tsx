import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Avatar } from '../ui/avatar';
import { ScrollArea } from '../ui/scroll-area';
import { VoiceCommander } from '../ui/voice-commander';
import { 
  Bot, 
  User, 
  Send, 
  Image as ImageIcon,
  FileText,
  Calculator,
  MapPin,
  Zap,
  Brain,
  Search,
  Settings
} from 'lucide-react';
import { toast } from 'sonner';

interface Message {
  id: string;
  type: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  metadata?: {
    tools?: string[];
    confidence?: number;
    suggestions?: string[];
  };
}

interface AICapability {
  id: string;
  name: string;
  description: string;
  icon: any;
  active: boolean;
}

export default function AIAssistant() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [capabilities, setCapabilities] = useState<AICapability[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Initialize AI capabilities
    const aiCapabilities: AICapability[] = [
      {
        id: 'project-analysis',
        name: 'Project Analysis',
        description: 'Analyze project photos for surface conditions and recommendations',
        icon: ImageIcon,
        active: true
      },
      {
        id: 'cost-estimation',
        name: 'Smart Estimation',
        description: 'Generate accurate cost estimates using AI and historical data',
        icon: Calculator,
        active: true
      },
      {
        id: 'route-optimization',
        name: 'Route Planning',
        description: 'Optimize crew routes and scheduling for maximum efficiency',
        icon: MapPin,
        active: true
      },
      {
        id: 'predictive-maintenance',
        name: 'Predictive Maintenance',
        description: 'Predict equipment failures and maintenance needs',
        icon: Zap,
        active: false
      },
      {
        id: 'quality-control',
        name: 'Quality Control',
        description: 'AI-powered quality assessment and recommendations',
        icon: Search,
        active: true
      },
      {
        id: 'document-analysis',
        name: 'Document Processing',
        description: 'Extract insights from contracts, reports, and documentation',
        icon: FileText,
        active: true
      }
    ];

    setCapabilities(aiCapabilities);

    // Welcome message
    const welcomeMessage: Message = {
      id: 'welcome',
      type: 'assistant',
      content: 'Hello! I\'m your AI assistant for PaveMaster Suite. I can help you with project analysis, cost estimation, quality control, and much more. How can I assist you today?',
      timestamp: new Date(),
      metadata: {
        suggestions: [
          'Analyze this project photo',
          'Calculate material costs for 5000 sq ft',
          'Optimize my crew schedule',
          'Predict maintenance needs'
        ]
      }
    };

    setMessages([welcomeMessage]);
  }, []);

  useEffect(() => {
    // Auto-scroll to bottom when new messages are added
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isProcessing) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputValue,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsProcessing(true);

    // Simulate AI processing
    setTimeout(() => {
      const aiResponse = generateAIResponse(inputValue);
      setMessages(prev => [...prev, aiResponse]);
      setIsProcessing(false);
    }, 1500);
  };

  const generateAIResponse = (userInput: string): Message => {
    const input = userInput.toLowerCase();
    
    // Simple AI response logic - in a real app, this would use actual AI services
    let response = '';
    let tools: string[] = [];
    let suggestions: string[] = [];

    if (input.includes('photo') || input.includes('image') || input.includes('analyze')) {
      response = 'I can analyze project photos to assess surface conditions, identify issues, and provide recommendations. Please upload an image and I\'ll provide a detailed analysis including:\n\n• Surface condition assessment\n• Recommended repair methods\n• Material requirements\n• Cost estimates\n\nWould you like to upload a photo for analysis?';
      tools = ['computer-vision', 'surface-analysis'];
      suggestions = ['Upload project photo', 'Show analysis examples', 'Explain analysis process'];
    } else if (input.includes('cost') || input.includes('estimate') || input.includes('price')) {
      response = 'I can help you create accurate cost estimates using AI analysis and historical data. I consider:\n\n• Project size and complexity\n• Material costs and availability\n• Labor requirements\n• Equipment needs\n• Market conditions\n\nTo generate an estimate, I\'ll need project details like:\n- Project type (paving, sealcoating, etc.)\n- Area size\n- Location\n- Current surface condition';
      tools = ['cost-calculator', 'market-analysis'];
      suggestions = ['Start new estimate', 'View recent estimates', 'Compare pricing'];
    } else if (input.includes('schedule') || input.includes('route') || input.includes('optimize')) {
      response = 'I can optimize your crew schedules and routes using AI algorithms that consider:\n\n• Project locations and priorities\n• Crew skills and availability\n• Equipment requirements\n• Traffic patterns\n• Weather conditions\n\nThis can reduce travel time by up to 25% and improve project completion rates. Would you like me to analyze your current schedule?';
      tools = ['route-optimization', 'scheduling'];
      suggestions = ['Optimize current schedule', 'View route suggestions', 'Analyze efficiency'];
    } else if (input.includes('quality') || input.includes('inspect') || input.includes('check')) {
      response = 'I provide AI-powered quality control that can:\n\n• Analyze surface preparation quality\n• Verify material application thickness\n• Detect potential issues early\n• Generate compliance reports\n• Compare against industry standards\n\nThis helps ensure consistent quality and reduces callbacks. Would you like to start a quality inspection?';
      tools = ['quality-analysis', 'compliance-check'];
      suggestions = ['Start quality check', 'View standards', 'Generate report'];
    } else if (input.includes('maintenance') || input.includes('predict') || input.includes('equipment')) {
      response = 'I use predictive analytics to forecast equipment maintenance needs by analyzing:\n\n• Usage patterns and hours\n• Performance metrics\n• Historical maintenance data\n• Environmental conditions\n\nThis helps prevent unexpected breakdowns and reduces maintenance costs by up to 30%. I can predict maintenance needs 2-4 weeks in advance.';
      tools = ['predictive-analysis', 'maintenance-planning'];
      suggestions = ['Check equipment status', 'Schedule maintenance', 'View predictions'];
    } else {
      response = 'I\'m here to help with all aspects of your paving and construction operations! I can assist with:\n\n• 📸 Project photo analysis\n• 💰 Cost estimation and pricing\n• 🗺️ Route and schedule optimization\n• 🔍 Quality control and inspections\n• 🔧 Predictive maintenance\n• 📄 Document processing\n\nWhat would you like to work on today?';
      suggestions = ['Analyze project photos', 'Calculate project costs', 'Optimize schedules', 'Check equipment status'];
    }

    return {
      id: Date.now().toString(),
      type: 'assistant',
      content: response,
      timestamp: new Date(),
      metadata: {
        tools,
        confidence: Math.random() * 0.2 + 0.8, // 80-100%
        suggestions
      }
    };
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleVoiceCommand = (command: string) => {
    setInputValue(command);
    toast.success('Voice command received');
    
    // Auto-send voice commands
    setTimeout(() => {
      handleSendMessage();
    }, 500);
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInputValue(suggestion);
    inputRef.current?.focus();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-primary/10 via-background to-primary/10 border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-primary">
            <Brain className="w-6 h-6" />
            AI Assistant
          </CardTitle>
          <p className="text-muted-foreground">
            Your intelligent companion for project analysis, cost estimation, and operational optimization
          </p>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* AI Capabilities Sidebar */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">AI Capabilities</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {capabilities.map((capability) => {
                const IconComponent = capability.icon;
                return (
                  <div
                    key={capability.id}
                    className={`p-3 rounded-lg border transition-colors ${
                      capability.active ? 'bg-primary/5 border-primary/20' : 'bg-muted/50'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <IconComponent className={`w-5 h-5 mt-0.5 ${
                        capability.active ? 'text-primary' : 'text-muted-foreground'
                      }`} />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium text-sm">{capability.name}</h4>
                          <Badge variant={capability.active ? 'default' : 'secondary'} className="text-xs">
                            {capability.active ? 'Active' : 'Coming Soon'}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          {capability.description}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>

          {/* Voice Commander */}
          <div className="mt-4">
            <VoiceCommander onCommand={handleVoiceCommand} />
          </div>
        </div>

        {/* Chat Interface */}
        <div className="lg:col-span-3">
          <Card className="h-[600px] flex flex-col">
            <CardHeader className="border-b">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Bot className="w-5 h-5 text-primary" />
                  AI Chat
                </CardTitle>
                <Button variant="outline" size="sm">
                  <Settings className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>

            {/* Messages */}
            <ScrollArea className="flex-1 p-4" ref={scrollRef}>
              <div className="space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex gap-3 ${
                      message.type === 'user' ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    {message.type === 'assistant' && (
                      <Avatar className="w-8 h-8 bg-primary/10 flex items-center justify-center">
                        <Bot className="w-4 h-4 text-primary" />
                      </Avatar>
                    )}
                    
                    <div className={`max-w-[80%] ${
                      message.type === 'user' ? 'order-first' : ''
                    }`}>
                      <div className={`rounded-lg p-4 ${
                        message.type === 'user' 
                          ? 'bg-primary text-primary-foreground ml-auto' 
                          : 'bg-muted'
                      }`}>
                        <div className="whitespace-pre-wrap text-sm">{message.content}</div>
                        
                        {message.metadata?.tools && message.metadata.tools.length > 0 && (
                          <div className="flex gap-1 mt-2">
                            {message.metadata.tools.map((tool) => (
                              <Badge key={tool} variant="secondary" className="text-xs">
                                {tool}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                        <span>{message.timestamp.toLocaleTimeString()}</span>
                        {message.metadata?.confidence && (
                          <span>• {Math.round(message.metadata.confidence * 100)}% confidence</span>
                        )}
                      </div>

                      {/* Suggestions */}
                      {message.metadata?.suggestions && message.metadata.suggestions.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-3">
                          {message.metadata.suggestions.map((suggestion, index) => (
                            <Button
                              key={index}
                              variant="outline"
                              size="sm"
                              className="text-xs"
                              onClick={() => handleSuggestionClick(suggestion)}
                            >
                              {suggestion}
                            </Button>
                          ))}
                        </div>
                      )}
                    </div>

                    {message.type === 'user' && (
                      <Avatar className="w-8 h-8 bg-muted flex items-center justify-center">
                        <User className="w-4 h-4" />
                      </Avatar>
                    )}
                  </div>
                ))}

                {isProcessing && (
                  <div className="flex gap-3 justify-start">
                    <Avatar className="w-8 h-8 bg-primary/10 flex items-center justify-center">
                      <Bot className="w-4 h-4 text-primary" />
                    </Avatar>
                    <div className="bg-muted rounded-lg p-4">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-primary rounded-full animate-bounce" />
                        <div className="w-2 h-2 bg-primary rounded-full animate-bounce delay-100" />
                        <div className="w-2 h-2 bg-primary rounded-full animate-bounce delay-200" />
                        <span className="text-sm text-muted-foreground ml-2">AI is thinking...</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>

            {/* Input */}
            <div className="border-t p-4">
              <div className="flex gap-2">
                <Input
                  ref={inputRef}
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask me anything about your projects, costs, schedules, or operations..."
                  className="flex-1"
                  disabled={isProcessing}
                />
                <Button 
                  onClick={handleSendMessage}
                  disabled={!inputValue.trim() || isProcessing}
                  size="icon"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}