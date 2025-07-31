import React, { useState, useRef, useEffect } from 'react';
import { Bot, MessageSquare, X, Minimize2, Maximize2, Lightbulb, AlertTriangle, DollarSign, Wrench, Send, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { useAIAssistant } from '@/features/ai-services/hooks/useAIAssistant';

interface AIMessage {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  suggestion?: boolean;
}

interface AIIntegrationWidgetProps {
  context?: {
    page?: string;
    projectId?: string;
    projectType?: string;
    location?: string;
    surface_area?: number;
    current_data?: any;
  };
  suggestions?: string[];
  floating?: boolean;
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
  size?: 'compact' | 'medium' | 'large';
}

const CONTEXT_SUGGESTIONS = {
  projects: [
    "What's the best approach for this project?",
    "Estimate costs for this project",
    "What safety precautions should I take?",
    "Recommend materials for this work"
  ],
  estimates: [
    "How can I improve this estimate?",
    "What factors affect pricing?",
    "Compare material options",
    "Identify cost savings opportunities"
  ],
  equipment: [
    "When should I service this equipment?",
    "What maintenance is required?",
    "Troubleshoot performance issues",
    "Optimize equipment usage"
  ],
  safety: [
    "What PPE is required?",
    "Check compliance requirements",
    "Identify potential hazards",
    "Review safety protocols"
  ],
  default: [
    "Ask me about asphalt repair",
    "Get cost estimates",
    "Safety guidelines",
    "Best practices"
  ]
};

export default function AIIntegrationWidget({
  context,
  suggestions,
  floating = true,
  position = 'bottom-right',
  size = 'medium'
}: AIIntegrationWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<AIMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { 
    queryAssistant, 
    permissions,
    isLoading,
    error 
  } = useAIAssistant();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const getContextualSuggestions = () => {
    if (suggestions) return suggestions;
    
    const pageType = context?.page || 'default';
    return CONTEXT_SUGGESTIONS[pageType as keyof typeof CONTEXT_SUGGESTIONS] || CONTEXT_SUGGESTIONS.default;
  };

  const handleSendMessage = async (message?: string) => {
    const messageContent = message || inputValue.trim();
    if (!messageContent) return;

    const userMessage: AIMessage = {
      id: `user-${Date.now()}`,
      type: 'user',
      content: messageContent,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');

    if (!permissions?.ai_enabled) {
      const errorMessage: AIMessage = {
        id: `error-${Date.now()}`,
        type: 'assistant',
        content: 'AI Assistant is currently disabled. Please enable it in settings.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
      return;
    }

    try {
      const response = await queryAssistant(
        messageContent,
        getQueryType(messageContent),
        'explain',
        {
          ...context,
          widget_context: true,
          urgency_level: 'medium'
        }
      );

      const assistantMessage: AIMessage = {
        id: `assistant-${Date.now()}`,
        type: 'assistant',
        content: response.response,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);

      // Add follow-up suggestions if available
      if (response.follow_up_suggestions.length > 0) {
        response.follow_up_suggestions.slice(0, 2).forEach((suggestion, index) => {
          const suggestionMessage: AIMessage = {
            id: `suggestion-${Date.now()}-${index}`,
            type: 'assistant',
            content: suggestion,
            timestamp: new Date(),
            suggestion: true
          };
          setMessages(prev => [...prev, suggestionMessage]);
        });
      }
    } catch (err) {
      const errorMessage: AIMessage = {
        id: `error-${Date.now()}`,
        type: 'assistant',
        content: 'I encountered an error processing your request. Please try again.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    }
  };

  const getQueryType = (message: string): string => {
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('cost') || lowerMessage.includes('price') || lowerMessage.includes('estimate')) {
      return 'estimation';
    } else if (lowerMessage.includes('repair') || lowerMessage.includes('fix') || lowerMessage.includes('maintenance')) {
      return 'repair_guidance';
    } else if (lowerMessage.includes('safety') || lowerMessage.includes('ppe') || lowerMessage.includes('hazard')) {
      return 'safety_guidance';
    } else if (lowerMessage.includes('material') || lowerMessage.includes('asphalt') || lowerMessage.includes('concrete')) {
      return 'material_selection';
    } else if (lowerMessage.includes('regulation') || lowerMessage.includes('standard') || lowerMessage.includes('compliance')) {
      return 'regulation_lookup';
    } else {
      return 'general_inquiry';
    }
  };

  const getWidgetSize = () => {
    switch (size) {
      case 'compact':
        return { width: '320px', height: '400px' };
      case 'large':
        return { width: '480px', height: '600px' };
      default:
        return { width: '380px', height: '500px' };
    }
  };

  const getPositionStyles = () => {
    if (!floating) return {};
    
    const base = {
      position: 'fixed' as const,
      zIndex: 1000,
      ...getWidgetSize()
    };

    switch (position) {
      case 'bottom-left':
        return { ...base, bottom: '20px', left: '20px' };
      case 'top-right':
        return { ...base, top: '20px', right: '20px' };
      case 'top-left':
        return { ...base, top: '20px', left: '20px' };
      default:
        return { ...base, bottom: '20px', right: '20px' };
    }
  };

  const getAIStatusIcon = () => {
    if (!permissions?.ai_enabled) {
      return <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />;
    }
    return <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />;
  };

  const contextualPrompts = getContextualSuggestions();

  if (!isOpen && floating) {
    return (
      <div style={getPositionStyles()}>
        <Button
          onClick={() => setIsOpen(true)}
          className="rounded-full h-12 w-12 shadow-lg"
          size="icon"
        >
          <Bot className="w-6 h-6" />
        </Button>
      </div>
    );
  }

  return (
    <div style={floating ? getPositionStyles() : { width: '100%', height: getWidgetSize().height }}>
      <Card className="h-full flex flex-col shadow-lg">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-sm">
              <Bot className="w-4 h-4" />
              AI Assistant
              {getAIStatusIcon()}
            </CardTitle>
            <div className="flex items-center gap-1">
              {!isMinimized && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsMinimized(true)}
                >
                  <Minimize2 className="w-3 h-3" />
                </Button>
              )}
              {isMinimized && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsMinimized(false)}
                >
                  <Maximize2 className="w-3 h-3" />
                </Button>
              )}
              {floating && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsOpen(false)}
                >
                  <X className="w-3 h-3" />
                </Button>
              )}
            </div>
          </div>
          {context && !isMinimized && (
            <div className="text-xs text-muted-foreground">
              {context.page && (
                <Badge variant="outline" className="text-xs mr-1">
                  {context.page}
                </Badge>
              )}
              {context.projectType && (
                <Badge variant="outline" className="text-xs">
                  {context.projectType}
                </Badge>
              )}
            </div>
          )}
        </CardHeader>

        {!isMinimized && (
          <CardContent className="flex-1 flex flex-col p-3 pt-0">
            {/* Messages */}
            <ScrollArea className="flex-1 mb-3">
              <div className="space-y-3">
                {messages.length === 0 && (
                  <div className="space-y-3">
                    <div className="text-xs text-muted-foreground text-center py-2">
                      👋 Ask me anything about asphalt repair, estimates, or safety!
                    </div>
                    
                    <div className="space-y-2">
                      {contextualPrompts.slice(0, 3).map((prompt, index) => (
                        <Button
                          key={index}
                          variant="outline"
                          size="sm"
                          className="w-full text-xs h-auto p-2 text-left justify-start"
                          onClick={() => handleSendMessage(prompt)}
                          disabled={!permissions?.ai_enabled}
                        >
                          <Lightbulb className="w-3 h-3 mr-2 flex-shrink-0" />
                          {prompt}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}

                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[85%] rounded-lg p-2 text-xs ${
                        message.type === 'user'
                          ? 'bg-primary text-primary-foreground'
                          : message.suggestion
                          ? 'bg-blue-50 border border-blue-200 cursor-pointer hover:bg-blue-100'
                          : 'bg-muted'
                      }`}
                      onClick={message.suggestion ? () => handleSendMessage(message.content) : undefined}
                    >
                      {message.suggestion && (
                        <div className="flex items-center gap-1 mb-1">
                          <Lightbulb className="w-3 h-3 text-blue-600" />
                          <span className="text-blue-600 font-medium">Suggestion</span>
                        </div>
                      )}
                      <p>{message.content}</p>
                      <div className="text-xs text-muted-foreground mt-1">
                        {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </div>
                ))}

                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-muted rounded-lg p-2 max-w-[85%]">
                      <div className="flex items-center gap-2">
                        <Loader2 className="w-3 h-3 animate-spin" />
                        <span className="text-xs text-muted-foreground">Thinking...</span>
                      </div>
                    </div>
                  </div>
                )}
                
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            {/* Input */}
            <div className="space-y-2">
              {error && (
                <div className="text-xs text-destructive bg-destructive/10 p-2 rounded">
                  {error}
                </div>
              )}
              
              <div className="flex gap-2">
                <Input
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder={permissions?.ai_enabled ? "Ask me anything..." : "AI is disabled"}
                  className="text-xs"
                  disabled={!permissions?.ai_enabled || isLoading}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                />
                <Button
                  size="sm"
                  onClick={() => handleSendMessage()}
                  disabled={!permissions?.ai_enabled || isLoading || !inputValue.trim()}
                >
                  <Send className="w-3 h-3" />
                </Button>
              </div>

              {!permissions?.ai_enabled && (
                <div className="text-xs text-center text-muted-foreground">
                  Enable AI Assistant in settings to start chatting
                </div>
              )}
            </div>
          </CardContent>
        )}

        {isMinimized && (
          <CardContent className="p-3 pt-0">
            <div className="text-center">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMinimized(false)}
                className="text-xs"
              >
                <MessageSquare className="w-3 h-3 mr-1" />
                Expand Chat
              </Button>
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  );
}