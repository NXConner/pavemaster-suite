import { useState } from "react";
import { Settings, Layout, Eye, EyeOff, GripVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";

interface DashboardWidget {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  position: number;
  category: 'metrics' | 'projects' | 'activity' | 'tools';
}

export function DashboardCustomizer() {
  const [widgets, setWidgets] = useState<DashboardWidget[]>([
    { id: 'revenue', name: 'Total Revenue', description: 'Monthly revenue tracking', enabled: true, position: 0, category: 'metrics' },
    { id: 'projects', name: 'Active Projects', description: 'Current project count', enabled: true, position: 1, category: 'metrics' },
    { id: 'crew', name: 'Crew Members', description: 'Available crew members', enabled: true, position: 2, category: 'metrics' },
    { id: 'fleet', name: 'Fleet Status', description: 'Equipment availability', enabled: true, position: 3, category: 'metrics' },
    { id: 'projectCards', name: 'Project Cards', description: 'Active project overview', enabled: true, position: 4, category: 'projects' },
    { id: 'quickActions', name: 'Quick Actions', description: 'Common task shortcuts', enabled: true, position: 5, category: 'tools' },
    { id: 'recentActivity', name: 'Recent Activity', description: 'Latest system activity', enabled: true, position: 6, category: 'activity' },
    { id: 'weather', name: 'Weather Widget', description: 'Current weather conditions', enabled: false, position: 7, category: 'tools' },
    { id: 'calendar', name: 'Schedule Calendar', description: 'Upcoming appointments', enabled: false, position: 8, category: 'activity' },
    { id: 'notifications', name: 'Notifications', description: 'System alerts and messages', enabled: false, position: 9, category: 'activity' },
  ]);

  const toggleWidget = (widgetId: string) => {
    setWidgets(prev => prev.map(widget => 
      widget.id === widgetId 
        ? { ...widget, enabled: !widget.enabled }
        : widget
    ));
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      metrics: 'bg-primary/10 text-primary',
      projects: 'bg-secondary/10 text-secondary',
      activity: 'bg-info/10 text-info',
      tools: 'bg-success/10 text-success'
    };
    return colors[category as keyof typeof colors] || 'bg-muted';
  };

  const groupedWidgets = widgets.reduce((acc, widget) => {
    if (!acc[widget.category]) acc[widget.category] = [];
    acc[widget.category].push(widget);
    return acc;
  }, {} as Record<string, DashboardWidget[]>);

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="flex items-center space-x-2">
          <Settings className="h-4 w-4" />
          <span>Customize Dashboard</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Layout className="h-5 w-5" />
            <span>Dashboard Customization</span>
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          <div className="text-sm text-muted-foreground">
            Customize which widgets appear on your dashboard and arrange them to suit your workflow.
          </div>

          {Object.entries(groupedWidgets).map(([category, categoryWidgets]) => (
            <Card key={category}>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg capitalize flex items-center space-x-2">
                  <span>{category} Widgets</span>
                  <Badge variant="secondary" className="ml-2">
                    {categoryWidgets.filter(w => w.enabled).length}/{categoryWidgets.length}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {categoryWidgets.map((widget) => (
                    <div key={widget.id} className="flex items-center justify-between p-3 rounded-lg border bg-card">
                      <div className="flex items-center space-x-3">
                        <GripVertical className="h-4 w-4 text-muted-foreground cursor-grab" />
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <Label htmlFor={widget.id} className="font-medium cursor-pointer">
                              {widget.name}
                            </Label>
                            <Badge variant="outline" className={getCategoryColor(widget.category)}>
                              {widget.category}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">{widget.description}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {widget.enabled ? (
                          <Eye className="h-4 w-4 text-success" />
                        ) : (
                          <EyeOff className="h-4 w-4 text-muted-foreground" />
                        )}
                        <Switch
                          id={widget.id}
                          checked={widget.enabled}
                          onCheckedChange={() => toggleWidget(widget.id)}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}

          <div className="flex justify-between pt-4">
            <Button variant="outline">
              Reset to Default
            </Button>
            <div className="space-x-2">
              <Button variant="outline">
                Cancel
              </Button>
              <Button>
                Save Layout
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}