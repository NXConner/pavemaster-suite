import React, { useState, useRef, useEffect } from 'react';
import { Send, Upload, FileText, AlertTriangle, TrendingUp, Calculator, Bot, Wrench, MapPin, DollarSign, Clock, CheckCircle, XCircle, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useAIAssistant } from '@/features/ai-services/hooks/useAIAssistant';
import { EnhancedAIResponse } from '@/features/ai-services/schemas/ai-assistant-schema';

interface ChatMessage {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  queryType?: string;
  intent?: string;
  response?: EnhancedAIResponse;
  actionResults?: any;
}

const QUICK_ACTIONS = [
  { 
    label: 'Estimate Calculator',
    type: 'estimation',
    intent: 'create',
    icon: Calculator,
    query: 'Calculate estimate for asphalt driveway repair',
    description: 'Get instant cost estimates'
  },
  { 
    label: 'Repair Guidance',
    type: 'repair_guidance',
    intent: 'explain',
    icon: Wrench,
    query: 'How do I repair cracks in asphalt parking lot?',
    description: 'Step-by-step repair instructions'
  },
  { 
    label: 'Create Project',
    type: 'project_planning',
    intent: 'create',
    icon: MapPin,
    query: 'Create a new sealcoating project',
    description: 'AI-optimized project creation'
  },
  { 
    label: 'Safety Guidelines',
    type: 'safety_guidance',
    intent: 'explain',
    icon: AlertTriangle,
    query: 'What are current safety requirements for asphalt work?',
    description: 'OSHA compliance and safety protocols'
  },
  { 
    label: 'Material Selection',
    type: 'material_selection',
    intent: 'recommend',
    icon: FileText,
    query: 'Recommend materials for pothole repair',
    description: 'Expert material recommendations'
  },
  { 
    label: 'Cost Optimization',
    type: 'cost_optimization',
    intent: 'analyze',
    icon: DollarSign,
    query: 'How can I reduce costs on my current projects?',
    description: 'AI-powered cost savings analysis'
  }
];

const CONTEXT_TEMPLATES = {
  estimation: {
    surface_area: '',
    work_type: 'crack_sealing',
    surface_type: 'asphalt_concrete',
    urgency_level: 'medium',
    budget_range: '',
    timeline: '',
    location: ''
  },
  repair_guidance: {
    repair_type: 'crack_sealing',
    surface_type: 'asphalt_concrete',
    urgency_level: 'medium',
    weather_conditions: 'dry'
  },
  project_planning: {
    work_type: 'sealcoating',
    surface_area: '',
    location: '',
    timeline: '',
    budget_range: ''
  }
};

export default function AIAssistantChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [selectedQueryType, setSelectedQueryType] = useState<string>('general_inquiry');
  const [selectedIntent, setSelectedIntent] = useState<string>('explain');
  const [showContextDialog, setShowContextDialog] = useState(false);
  const [contextData, setContextData] = useState<any>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const { 
    queryAssistant, 
    hasPermission,
    permissions,
    isLoading, 
    error,
    submitFeedback 
  } = useAIAssistant();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (query?: string, queryType?: string, intent?: string, context?: any) => {
    const messageContent = query || inputValue.trim();
    const type = queryType || selectedQueryType;
    const intentType = intent || selectedIntent;
    
    if (!messageContent) return;

    // Check if AI is enabled
    if (!permissions?.ai_enabled) {
      setMessages(prev => [...prev, {
        id: `error-${Date.now()}`,
        type: 'assistant',
        content: 'AI Assistant is currently disabled. Please enable it in the settings to continue.',
        timestamp: new Date()
      }]);
      return;
    }

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      type: 'user',
      content: messageContent,
      timestamp: new Date(),
      queryType: type,
      intent: intentType
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');

    try {
      const response = await queryAssistant(
        messageContent, 
        type as any,
        intentType as any,
        { ...contextData, ...context, urgency_level: 'medium' }
      );

      const assistantMessage: ChatMessage = {
        id: `assistant-${Date.now()}`,
        type: 'assistant',
        content: response.response,
        timestamp: new Date(),
        response: response,
        actionResults: response.actionResults
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (err) {
      const errorMessage: ChatMessage = {
        id: `error-${Date.now()}`,
        type: 'assistant',
        content: 'I apologize, but I encountered an error processing your request. Please check my permissions and try again.',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, errorMessage]);
    }
  };

  const handleQuickAction = (action: typeof QUICK_ACTIONS[0]) => {
    // Set context template for the action
    const template = CONTEXT_TEMPLATES[action.type as keyof typeof CONTEXT_TEMPLATES];
    if (template) {
      setContextData(template);
    }
    
    handleSendMessage(action.query, action.type, action.intent);
  };

  const handleFeedback = async (messageId: string, feedback: 'helpful' | 'somewhat_helpful' | 'not_helpful') => {
    const message = messages.find(m => m.id === messageId);
    if (message?.response) {
      await submitFeedback(message.response.query_id, feedback);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const getIntentIcon = (intent: string) => {
    switch (intent) {
      case 'create': return <MapPin className="w-3 h-3" />;
      case 'update': return <Settings className="w-3 h-3" />;
      case 'analyze': return <TrendingUp className="w-3 h-3" />;
      case 'recommend': return <CheckCircle className="w-3 h-3" />;
      default: return <Bot className="w-3 h-3" />;
    }
  };

  const getPermissionStatus = (action: string) => {
    return hasPermission(action);
  };

  return (
    <div className="flex flex-col h-full max-h-[800px]">
      {/* Header */}
      <Card className="mb-4">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full animate-pulse ${permissions?.ai_enabled ? 'bg-green-500' : 'bg-red-500'}`}></div>
            Asphalt Expert AI Assistant
            {!permissions?.ai_enabled && (
              <Badge variant="destructive" className="ml-2">Disabled</Badge>
            )}
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            AI expert for driveway repair, parking lot maintenance, estimating, and project management
          </p>
        </CardHeader>
      </Card>

      {/* Quick Actions */}
      {messages.length === 0 && (
        <Card className="mb-4">
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <Bot className="w-4 h-4" />
              What can I help you with?
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {QUICK_ACTIONS.map((action) => {
                const hasRequiredPermission = action.intent === 'create' ? 
                  getPermissionStatus('create_projects') || getPermissionStatus('create_estimates') :
                  action.intent === 'update' ? getPermissionStatus('edit_projects') :
                  action.intent === 'analyze' ? getPermissionStatus('access_analytics') :
                  true; // explain and recommend don't need special permissions

                return (
                  <Button
                    key={action.type}
                    variant="outline"
                    className="h-auto p-4 flex flex-col items-start gap-2 text-left"
                    onClick={() => handleQuickAction(action)}
                    disabled={!permissions?.ai_enabled || !hasRequiredPermission}
                  >
                    <div className="flex items-center gap-2 w-full">
                      <action.icon className="w-4 h-4 text-primary" />
                      <span className="font-medium">{action.label}</span>
                      {getIntentIcon(action.intent)}
                    </div>
                    <span className="text-xs text-muted-foreground">{action.description}</span>
                    {!hasRequiredPermission && (
                      <Badge variant="outline" className="text-xs">
                        Permission Required
                      </Badge>
                    )}
                  </Button>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Messages */}
      <Card className="flex-1 flex flex-col">
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-[85%] ${message.type === 'user' ? 'ml-4' : 'mr-4'}`}>
                  <div
                    className={`p-4 rounded-lg ${
                      message.type === 'user'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      {message.type === 'assistant' && <Bot className="w-4 h-4" />}
                      {message.queryType && (
                        <Badge variant="outline" className="text-xs">
                          {message.queryType.replace('_', ' ')}
                        </Badge>
                      )}
                      {message.intent && (
                        <Badge variant="secondary" className="text-xs flex items-center gap-1">
                          {getIntentIcon(message.intent)}
                          {message.intent}
                        </Badge>
                      )}
                    </div>
                    
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    
                    {message.response && (
                      <div className="mt-4 space-y-3 border-t pt-3">
                        {/* Confidence Score */}
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary" className="text-xs">
                            Confidence: {message.response.confidence_score}%
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {message.response.processing_time_ms}ms
                          </span>
                        </div>

                        {/* Action Results */}
                        {message.actionResults && (
                          <div className="bg-green-50 p-3 rounded border border-green-200">
                            <h4 className="text-sm font-medium text-green-800 mb-2 flex items-center gap-1">
                              <CheckCircle className="w-4 h-4" />
                              AI Actions Completed
                            </h4>
                            <div className="space-y-1 text-xs text-green-700">
                              {message.actionResults.createdProject && (
                                <div>✅ Created project: {message.actionResults.createdProject.title}</div>
                              )}
                              {message.actionResults.createdEstimate && (
                                <div>✅ Generated estimate: {formatCurrency(message.actionResults.createdEstimate.total_cost)}</div>
                              )}
                              {message.actionResults.updatedProject && (
                                <div>✅ Updated project: {message.actionResults.updatedProject.title}</div>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Repair Recommendations */}
                        {message.response.repair_recommendations.length > 0 && (
                          <div className="bg-blue-50 p-3 rounded border">
                            <h4 className="text-sm font-medium mb-2 flex items-center gap-1">
                              <Wrench className="w-4 h-4" />
                              Repair Recommendations
                            </h4>
                            <div className="space-y-2">
                              {message.response.repair_recommendations.map((rec, index) => (
                                <div key={index} className="bg-white p-2 rounded text-xs">
                                  <div className="flex items-center justify-between mb-1">
                                    <span className="font-medium">{rec.repair_type}</span>
                                    <Badge 
                                      variant={rec.priority === 'critical' ? 'destructive' : 
                                               rec.priority === 'high' ? 'default' : 'secondary'}
                                      className="text-xs"
                                    >
                                      {rec.priority}
                                    </Badge>
                                  </div>
                                  <p className="text-muted-foreground">{rec.description}</p>
                                  {rec.estimated_cost && (
                                    <div className="mt-1 text-green-600 font-medium">
                                      Est. Cost: ${rec.estimated_cost}/sq ft
                                    </div>
                                  )}
                                  {rec.timeline && (
                                    <div className="flex items-center gap-1 mt-1 text-muted-foreground">
                                      <Clock className="w-3 h-3" />
                                      {rec.timeline}
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Material Specifications */}
                        {message.response.material_specifications.length > 0 && (
                          <div className="bg-purple-50 p-3 rounded border">
                            <h4 className="text-sm font-medium mb-2">Material Specifications</h4>
                            <div className="space-y-2">
                              {message.response.material_specifications.map((spec, index) => (
                                <div key={index} className="bg-white p-2 rounded text-xs">
                                  <div className="font-medium">{spec.material_type}</div>
                                  <div className="text-muted-foreground">{spec.specification}</div>
                                  {spec.cost_per_unit && (
                                    <div className="text-green-600">
                                      {formatCurrency(spec.cost_per_unit)} per unit
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Safety Considerations */}
                        {message.response.safety_considerations.length > 0 && (
                          <div className="bg-red-50 p-3 rounded border border-red-200">
                            <h4 className="text-sm font-medium mb-2 flex items-center gap-1 text-red-800">
                              <AlertTriangle className="w-4 h-4" />
                              Safety Considerations
                            </h4>
                            <div className="space-y-2">
                              {message.response.safety_considerations.map((safety, index) => (
                                <div key={index} className="bg-white p-2 rounded text-xs">
                                  <div className="font-medium text-red-700">{safety.hazard_type}</div>
                                  <div className="text-muted-foreground">{safety.safety_measure}</div>
                                  {safety.required_ppe.length > 0 && (
                                    <div className="mt-1">
                                      <span className="font-medium">PPE Required: </span>
                                      {safety.required_ppe.join(', ')}
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Cost Estimates */}
                        {message.response.cost_estimates && (
                          <div className="bg-green-50 p-3 rounded border">
                            <h4 className="text-sm font-medium mb-2 flex items-center gap-1">
                              <DollarSign className="w-4 h-4" />
                              Cost Estimate
                            </h4>
                            <div className="grid grid-cols-2 gap-2 text-xs">
                              {message.response.cost_estimates.material_cost && (
                                <div>Material: {formatCurrency(message.response.cost_estimates.material_cost)}</div>
                              )}
                              {message.response.cost_estimates.labor_cost && (
                                <div>Labor: {formatCurrency(message.response.cost_estimates.labor_cost)}</div>
                              )}
                              {message.response.cost_estimates.equipment_cost && (
                                <div>Equipment: {formatCurrency(message.response.cost_estimates.equipment_cost)}</div>
                              )}
                              {message.response.cost_estimates.permit_cost && (
                                <div>Permits: {formatCurrency(message.response.cost_estimates.permit_cost)}</div>
                              )}
                            </div>
                            {message.response.cost_estimates.total_estimate && (
                              <div className="mt-2 pt-2 border-t font-medium text-green-700">
                                Total: {formatCurrency(message.response.cost_estimates.total_estimate)}
                              </div>
                            )}
                            {message.response.cost_estimates.confidence_level && (
                              <p className="text-xs text-muted-foreground mt-1">
                                {message.response.cost_estimates.confidence_level}
                              </p>
                            )}
                          </div>
                        )}

                        {/* Regulatory Alerts */}
                        {message.response.regulatory_alerts.length > 0 && (
                          <div className="space-y-2">
                            {message.response.regulatory_alerts.map((alert, index) => (
                              <div
                                key={index}
                                className={`p-2 rounded border-l-4 text-xs ${
                                  alert.severity === 'critical'
                                    ? 'border-red-500 bg-red-50'
                                    : alert.severity === 'warning'
                                    ? 'border-yellow-500 bg-yellow-50'
                                    : 'border-blue-500 bg-blue-50'
                                }`}
                              >
                                <div className="font-medium">{alert.regulation_type}</div>
                                <div>{alert.description}</div>
                                {alert.compliance_deadline && (
                                  <div className="text-muted-foreground mt-1">
                                    Deadline: {alert.compliance_deadline.toLocaleDateString()}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Follow-up Suggestions */}
                        {message.response.follow_up_suggestions.length > 0 && (
                          <div>
                            <h4 className="text-sm font-medium mb-1">Follow-up Questions</h4>
                            <div className="space-y-1">
                              {message.response.follow_up_suggestions.map((suggestion, index) => (
                                <Button
                                  key={index}
                                  variant="ghost"
                                  size="sm"
                                  className="h-auto p-2 text-xs text-left justify-start w-full"
                                  onClick={() => handleSendMessage(suggestion)}
                                >
                                  {suggestion}
                                </Button>
                              ))}
                            </div>
                          </div>
                        )}

                        <Separator />

                        {/* Feedback */}
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground">Was this helpful?</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 px-2 text-xs"
                            onClick={() => handleFeedback(message.id, 'helpful')}
                          >
                            👍
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 px-2 text-xs"
                            onClick={() => handleFeedback(message.id, 'not_helpful')}
                          >
                            👎
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1 flex items-center gap-2">
                    {message.timestamp.toLocaleTimeString()}
                    {message.type === 'assistant' && message.response?.confidence_score && (
                      <Badge variant="outline" className="text-xs">
                        {message.response.confidence_score}% confident
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-muted p-3 rounded-lg max-w-[80%]">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    <span className="text-sm text-muted-foreground ml-2">AI analyzing...</span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        {/* Input */}
        <div className="p-4 border-t space-y-3">
          <div className="flex gap-2">
            <Select value={selectedQueryType} onValueChange={setSelectedQueryType}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="general_inquiry">General</SelectItem>
                <SelectItem value="estimation">Estimation</SelectItem>
                <SelectItem value="repair_guidance">Repair Guide</SelectItem>
                <SelectItem value="material_selection">Materials</SelectItem>
                <SelectItem value="safety_guidance">Safety</SelectItem>
                <SelectItem value="regulation_lookup">Regulations</SelectItem>
                <SelectItem value="project_planning">Project Plan</SelectItem>
                <SelectItem value="cost_optimization">Cost Optimize</SelectItem>
              </SelectContent>
            </Select>

            <Select value={selectedIntent} onValueChange={setSelectedIntent}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="explain">Explain</SelectItem>
                <SelectItem value="create">Create</SelectItem>
                <SelectItem value="update">Update</SelectItem>
                <SelectItem value="analyze">Analyze</SelectItem>
                <SelectItem value="recommend">Recommend</SelectItem>
                <SelectItem value="search">Search</SelectItem>
              </SelectContent>
            </Select>

            <Dialog open={showContextDialog} onOpenChange={setShowContextDialog}>
              <DialogTrigger asChild>
                <Button variant="outline" size="icon">
                  <Settings className="w-4 h-4" />
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Query Context</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Surface Area (sq ft)</label>
                    <Input
                      value={contextData.surface_area || ''}
                      onChange={(e) => setContextData(prev => ({ ...prev, surface_area: e.target.value }))}
                      placeholder="e.g., 5000"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Location</label>
                    <Input
                      value={contextData.location || ''}
                      onChange={(e) => setContextData(prev => ({ ...prev, location: e.target.value }))}
                      placeholder="e.g., Richmond, VA"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Budget Range</label>
                    <Input
                      value={contextData.budget_range || ''}
                      onChange={(e) => setContextData(prev => ({ ...prev, budget_range: e.target.value }))}
                      placeholder="e.g., $10,000-15,000"
                    />
                  </div>
                  <Button onClick={() => setShowContextDialog(false)}>
                    Save Context
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <div className="flex gap-2">
            <Textarea
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Ask about asphalt repair, cost estimates, project management, safety protocols..."
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              className="flex-1 min-h-[60px]"
              disabled={!permissions?.ai_enabled}
            />
            <Button 
              onClick={() => handleSendMessage()}
              disabled={isLoading || !inputValue.trim() || !permissions?.ai_enabled}
              size="icon"
              className="self-end"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}
          {!permissions?.ai_enabled && (
            <p className="text-sm text-muted-foreground">
              AI Assistant is disabled. Enable it in settings to start chatting.
            </p>
          )}
        </div>
      </Card>
    </div>
  );
}