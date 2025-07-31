import React, { useState } from 'react';
import { Bot, BookOpen, Bell, TrendingUp, Shield, BarChart3, Wrench, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import AIAssistantChat from '@/components/ai-assistant/AIAssistantChat';
import AIPermissionManager from '@/components/ai-assistant/AIPermissionManager';
import { useAIAssistant } from '@/features/ai-services/hooks/useAIAssistant';

export default function AIAssistantPage() {
  const { 
    permissions, 
    actionLogs, 
    notifications, 
    hasPermission,
    isLoading 
  } = useAIAssistant();
  
  const [activeTab, setActiveTab] = useState('chat');

  const unreadNotifications = notifications.filter(n => !n.is_read).length;

  const getEnabledPermissionsCount = () => {
    if (!permissions) return 0;
    return Object.values(permissions.permissions).filter(Boolean).length;
  };

  const getTotalPermissionsCount = () => {
    if (!permissions) return 0;
    return Object.keys(permissions.permissions).length;
  };

  const getPermissionProgress = () => {
    const total = getTotalPermissionsCount();
    const enabled = getEnabledPermissionsCount();
    return total > 0 ? (enabled / total) * 100 : 0;
  };

  const getRecentSuccessRate = () => {
    const recentActions = actionLogs.slice(0, 20);
    if (recentActions.length === 0) return 100;
    const successful = recentActions.filter(log => log.success).length;
    return (successful / recentActions.length) * 100;
  };

  const asphaltTips = [
    {
      title: "Crack Sealing Best Practice",
      description: "Address cracks when they're less than 1/4 inch wide for maximum effectiveness and longevity.",
      category: "maintenance",
      icon: Wrench
    },
    {
      title: "Weather Requirements",
      description: "Optimal asphalt work: temperature above 50°F, dry conditions, and rising temperature trend.",
      category: "operations",
      icon: TrendingUp
    },
    {
      title: "Safety Protocol",
      description: "Always wear heat-resistant gloves when working with hot asphalt materials and sealants.",
      category: "safety",
      icon: AlertTriangle
    },
    {
      title: "Cost Optimization",
      description: "Schedule bulk material orders during off-peak seasons for 15-20% cost savings.",
      category: "financial",
      icon: BarChart3
    }
  ];

  const capabilityStatus = [
    {
      name: "Project Creation",
      enabled: hasPermission('create_projects'),
      description: "AI can create new projects with optimized parameters"
    },
    {
      name: "Cost Estimation",
      enabled: hasPermission('create_estimates'),
      description: "AI can generate detailed cost estimates"
    },
    {
      name: "Project Updates",
      enabled: hasPermission('edit_projects'),
      description: "AI can modify existing project details"
    },
    {
      name: "Data Analysis",
      enabled: hasPermission('access_analytics'),
      description: "AI can analyze project data and trends"
    },
    {
      name: "Report Generation",
      enabled: hasPermission('generate_reports'),
      description: "AI can create comprehensive reports"
    },
    {
      name: "Knowledge Upload",
      enabled: hasPermission('upload_documents'),
      description: "AI can add documents to knowledge base"
    }
  ];

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Bot className="w-8 h-8 text-primary" />
            Asphalt Expert AI Assistant
            {!permissions?.ai_enabled && (
              <Badge variant="destructive" className="ml-2">Disabled</Badge>
            )}
          </h1>
          <p className="text-muted-foreground mt-2">
            Your AI-powered expert for driveway repair, parking lot maintenance, estimating, and project management
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          {unreadNotifications > 0 && (
            <Badge variant="destructive" className="relative">
              <Bell className="w-4 h-4 mr-1" />
              {unreadNotifications} New Alerts
            </Badge>
          )}
          <div className={`w-3 h-3 rounded-full ${permissions?.ai_enabled ? 'bg-green-500' : 'bg-red-500'}`}></div>
          <span className="text-sm font-medium">
            {permissions?.ai_enabled ? 'AI Active' : 'AI Disabled'}
          </span>
        </div>
      </div>

      {/* AI Status Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            AI Assistant Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Permissions Enabled</span>
                <span className="text-sm text-muted-foreground">
                  {getEnabledPermissionsCount()}/{getTotalPermissionsCount()}
                </span>
              </div>
              <Progress value={getPermissionProgress()} className="w-full" />
            </div>

            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {actionLogs.length}
              </div>
              <div className="text-sm text-muted-foreground">Total AI Actions</div>
            </div>

            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {getRecentSuccessRate().toFixed(0)}%
              </div>
              <div className="text-sm text-muted-foreground">Success Rate</div>
            </div>

            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {permissions?.max_operations_per_hour || 0}
              </div>
              <div className="text-sm text-muted-foreground">Ops/Hour Limit</div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t">
            <h4 className="font-medium mb-3">Current Capabilities</h4>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {capabilityStatus.map((capability) => (
                <div 
                  key={capability.name}
                  className={`p-3 rounded border ${
                    capability.enabled ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    {capability.enabled ? (
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    ) : (
                      <XCircle className="w-4 h-4 text-gray-400" />
                    )}
                    <span className="text-sm font-medium">{capability.name}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">{capability.description}</p>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* AI Assistant Interface */}
        <div className="lg:col-span-3">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="chat" className="flex items-center gap-2">
                <Bot className="w-4 h-4" />
                AI Assistant
              </TabsTrigger>
              <TabsTrigger value="permissions" className="flex items-center gap-2">
                <Shield className="w-4 h-4" />
                Permissions & Control
              </TabsTrigger>
            </TabsList>

            <TabsContent value="chat" className="mt-6">
              <AIAssistantChat />
            </TabsContent>

            <TabsContent value="permissions" className="mt-6">
              <AIPermissionManager />
            </TabsContent>
          </Tabs>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Asphalt Expert Tips */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wrench className="w-5 h-5" />
                Expert Tips
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {asphaltTips.map((tip, index) => (
                <div key={index} className="p-3 border rounded-lg space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-sm flex items-center gap-2">
                      <tip.icon className="w-4 h-4" />
                      {tip.title}
                    </h4>
                    <Badge variant="outline" className="text-xs">
                      {tip.category}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">{tip.description}</p>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Recent AI Activity */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {actionLogs.slice(0, 5).map((log) => (
                <div key={log.id} className="flex items-center justify-between p-2 border rounded">
                  <div className="flex items-center gap-2">
                    {log.success ? (
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    ) : (
                      <XCircle className="w-4 h-4 text-red-600" />
                    )}
                    <div>
                      <div className="text-sm font-medium">
                        {log.action_type} {log.resource_type}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {log.timestamp.toLocaleTimeString()}
                      </div>
                    </div>
                  </div>
                  {log.ai_confidence && (
                    <Badge variant="outline" className="text-xs">
                      {log.ai_confidence}%
                    </Badge>
                  )}
                </div>
              ))}
              
              {actionLogs.length === 0 && (
                <div className="text-center py-4">
                  <Bot className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">No AI activity yet</p>
                  <p className="text-xs text-muted-foreground">Start chatting to see actions here</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => setActiveTab('chat')}
                disabled={!permissions?.ai_enabled}
              >
                <Bot className="w-4 h-4 mr-2" />
                Ask AI Expert
              </Button>
              
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => setActiveTab('permissions')}
              >
                <Shield className="w-4 h-4 mr-2" />
                Manage Permissions
              </Button>
              
              <Button 
                variant="outline" 
                className="w-full justify-start"
                disabled={!hasPermission('create_estimates')}
              >
                <BarChart3 className="w-4 h-4 mr-2" />
                Generate Estimate
              </Button>
              
              <Button 
                variant="outline" 
                className="w-full justify-start"
                disabled={!hasPermission('create_projects')}
              >
                <TrendingUp className="w-4 h-4 mr-2" />
                Create Project
              </Button>
            </CardContent>
          </Card>

          {/* System Status */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">System Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>AI Engine</span>
                <Badge variant={permissions?.ai_enabled ? "default" : "destructive"}>
                  {permissions?.ai_enabled ? "Online" : "Offline"}
                </Badge>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span>Knowledge Base</span>
                <Badge variant="default">Ready</Badge>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span>Safety Controls</span>
                <Badge variant="default">Active</Badge>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span>Monitoring</span>
                <Badge variant="default">Enabled</Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}