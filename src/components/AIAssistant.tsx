import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import {
  Bot,
  User,
  Send,
  Loader2,
  Brain,
  Sparkles,
  Mic,
  Volume2,
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { VoiceInterface } from './VoiceInterface';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  type?: 'text' | 'voice';
}

interface AIAssistantProps {
  className?: string;
  context?: string;
}

export function AIAssistant({ className = '', context = 'general' }: AIAssistantProps) {
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showVoiceInterface, setShowVoiceInterface] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const addMessage = (role: 'user' | 'assistant', content: string, type: 'text' | 'voice' = 'text') => {
    const newMessage: Message = {
      id: Date.now().toString(),
      role,
      content,
      timestamp: new Date(),
      type,
    };

    setMessages(prev => [...prev, newMessage]);
    return newMessage;
  };

  const sendMessage = async (message: string, type: 'text' | 'voice' = 'text') => {
    if (!message.trim()) { return; }

    addMessage('user', message, type);
    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('ai-assistant', {
        body: {
          message,
          context,
          conversation: messages.slice(-10), // Send last 10 messages for context
        },
      });

      if (error) { throw error; }

      addMessage('assistant', data.response, type);
    } catch (error) {
      console.error('Error sending message:', error);
      addMessage('assistant', 'Sorry, I encountered an error. Please try again.', type);
      toast({
        title: 'Error',
        description: 'Failed to get AI response',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
    setInput('');
  };

  const handleVoiceTranscription = (text: string) => {
    sendMessage(text, 'voice');
  };

  const handleVoiceResponse = (text: string) => {
    // Voice response is handled by the VoiceInterface component
  };

  const getSystemPrompts = () => {
    switch (context) {
      case 'pavement':
        return 'You are a specialized AI assistant for pavement and asphalt operations. Help with calculations, material specs, and best practices.';
      case 'project':
        return 'You are a project management AI assistant. Help with scheduling, resource allocation, and project coordination.';
      case 'safety':
        return 'You are a safety AI assistant for construction operations. Focus on safety protocols, compliance, and risk management.';
      default:
        return 'You are a helpful AI assistant for the Pavement Performance Suite application.';
    }
  };

  return (
    <Card className={`flex flex-col h-[600px] ${className}`}>
      <CardHeader className="flex-shrink-0">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-primary" />
            AI Assistant
            <Badge variant="secondary" className="text-xs">
              {context}
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant={showVoiceInterface ? 'default' : 'outline'}
              size="sm"
              onClick={() => { setShowVoiceInterface(!showVoiceInterface); }}
            >
              {showVoiceInterface ? <Volume2 className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
            </Button>
          </div>
        </CardTitle>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col gap-4 p-4">
        {/* Voice Interface */}
        {showVoiceInterface && (
          <VoiceInterface
            onTranscription={handleVoiceTranscription}
            onResponse={handleVoiceResponse}
            className="mb-4"
          />
        )}

        {/* Messages */}
        <ScrollArea className="flex-1 pr-4">
          <div className="space-y-4">
            {messages.length === 0 && (
              <div className="text-center text-muted-foreground py-8">
                <Sparkles className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Start a conversation with the AI assistant</p>
                <p className="text-sm">{getSystemPrompts()}</p>
              </div>
            )}

            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-3 ${
                  message.role === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                {message.role === 'assistant' && (
                  <div className="flex-shrink-0 w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                    <Bot className="h-4 w-4 text-primary-foreground" />
                  </div>
                )}

                <div
                  className={`max-w-[80%] rounded-lg px-4 py-2 ${
                    message.role === 'user'
                      ? 'bg-primary text-primary-foreground ml-12'
                      : 'bg-muted text-foreground mr-12'
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <p className="text-xs opacity-70">
                      {message.timestamp.toLocaleTimeString()}
                    </p>
                    {message.type === 'voice' && (
                      <Badge variant="outline" className="text-xs h-4">
                        <Mic className="h-2 w-2 mr-1" />
                        Voice
                      </Badge>
                    )}
                  </div>
                </div>

                {message.role === 'user' && (
                  <div className="flex-shrink-0 w-8 h-8 bg-secondary rounded-full flex items-center justify-center">
                    <User className="h-4 w-4 text-secondary-foreground" />
                  </div>
                )}
              </div>
            ))}

            {isLoading && (
              <div className="flex gap-3 justify-start">
                <div className="flex-shrink-0 w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                  <Bot className="h-4 w-4 text-primary-foreground" />
                </div>
                <div className="bg-muted text-foreground rounded-lg px-4 py-2 mr-12">
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <p className="text-sm">Thinking...</p>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        {/* Input Form */}
        <form onSubmit={handleSubmit} className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => { setInput(e.target.value); }}
            placeholder="Ask me anything about pavement operations..."
            disabled={isLoading}
            className="flex-1"
          />
          <Button
            type="submit"
            disabled={isLoading || !input.trim()}
            size="icon"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}