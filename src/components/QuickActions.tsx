import { Plus, FileText, Calendar, Users, Truck, Calculator } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function QuickActions() {
  const actions = [
    { icon: Plus, label: 'New Project', color: 'bg-primary text-primary-foreground' },
    { icon: FileText, label: 'Create Quote', color: 'bg-secondary text-secondary-foreground' },
    { icon: Calendar, label: 'Schedule', color: 'bg-info text-info-foreground' },
    { icon: Users, label: 'Assign Crew', color: 'bg-success text-success-foreground' },
    { icon: Truck, label: 'Track Equipment', color: 'bg-warning text-warning-foreground' },
    { icon: Calculator, label: 'Cost Calculator', color: 'bg-accent text-accent-foreground' },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Quick Actions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-3">
          {actions.map((action, index) => (
            <Button
              key={index}
              variant="outline"
              className="h-20 flex-col gap-2 transition-all duration-300 hover:shadow-md"
            >
              <action.icon className="h-6 w-6" />
              <span className="text-xs font-medium">{action.label}</span>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}