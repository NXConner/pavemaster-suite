import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { AnimatedButton } from './AnimatedButton';
import { cn } from '@/lib/utils';
import {
  MapPin,
  Users,
  Calendar,
  DollarSign,
  Eye,
  Edit,
  MoreVertical,
  Clock,
  AlertTriangle,
} from 'lucide-react';

interface ProjectCardProps {
  project: {
    id: string;
    name: string;
    location: string;
    status: string;
    progress: number;
    budget: number;
    spent: number;
    crewSize: number;
    dueDate: string;
    priority?: 'low' | 'medium' | 'high' | 'urgent';
    type?: string;
    manager?: string;
    lastUpdate?: string;
  };
  onView?: (projectId: string) => void;
  onEdit?: (projectId: string) => void;
  className?: string;
}

export function ProjectCard({ project, onView, onEdit, className }: ProjectCardProps) {
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return 'bg-success text-success-foreground';
      case 'in progress':
        return 'bg-primary text-primary-foreground';
      case 'pending':
        return 'bg-warning text-warning-foreground';
      case 'on hold':
        return 'bg-destructive text-destructive-foreground';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case 'urgent':
        return 'bg-destructive text-destructive-foreground';
      case 'high':
        return 'bg-warning text-warning-foreground';
      case 'medium':
        return 'bg-primary text-primary-foreground';
      case 'low':
        return 'bg-muted text-muted-foreground';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const budgetUsage = (project.spent / project.budget) * 100;
  const isOverBudget = budgetUsage > 100;
  const isNearDeadline = new Date(project.dueDate) <= new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  return (
    <Card
      className={cn(
        'group relative transition-all duration-500 hover:shadow-xl hover:scale-[1.02] hover:-translate-y-1 animate-fade-in overflow-hidden',
        'before:absolute before:inset-0 before:bg-gradient-to-br before:from-primary/5 before:to-transparent before:opacity-0 before:transition-opacity before:duration-300 hover:before:opacity-100',
        isOverBudget && 'ring-2 ring-destructive/20',
        isNearDeadline && 'ring-2 ring-warning/20',
        className,
      )}
    >
      {/* Priority indicator */}
      {project.priority && project.priority !== 'low' && (
        <div className={cn(
          'absolute top-0 right-0 w-0 h-0 border-l-[20px] border-b-[20px]',
          'border-l-transparent transition-all duration-300',
          project.priority === 'urgent' && 'border-b-destructive',
          project.priority === 'high' && 'border-b-warning',
          project.priority === 'medium' && 'border-b-primary',
        )}>
          {project.priority === 'urgent' && (
            <AlertTriangle className="absolute -top-4 -right-4 h-3 w-3 text-destructive-foreground" />
          )}
        </div>
      )}

      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-2 flex-1">
            <CardTitle className="text-lg font-semibold transition-colors duration-200 group-hover:text-primary line-clamp-2">
              {project.name}
            </CardTitle>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                <span className="truncate">{project.location}</span>
              </div>
              {project.type && (
                <Badge variant="outline" className="text-xs">
                  {project.type}
                </Badge>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Badge className={cn(getStatusColor(project.status), 'transition-all duration-200')}>
              {project.status}
            </Badge>
            {project.priority && (
              <Badge variant="outline" className={cn('text-xs', getPriorityColor(project.priority))}>
                {project.priority}
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Progress Section */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium">Progress</span>
            <span className="text-muted-foreground">{project.progress}%</span>
          </div>
          <Progress
            value={project.progress}
            className="h-2 transition-all duration-300 group-hover:h-3"
          />
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-2 text-sm">
            <Users className="h-4 w-4 text-primary transition-transform duration-300 group-hover:scale-110" />
            <div>
              <span className="text-muted-foreground">Crew:</span>
              <span className="ml-1 font-medium">{project.crewSize}</span>
            </div>
          </div>

          <div className="flex items-center gap-2 text-sm">
            <Calendar className="h-4 w-4 text-primary transition-transform duration-300 group-hover:scale-110" />
            <div>
              <span className="text-muted-foreground">Due:</span>
              <span className={cn(
                'ml-1 font-medium',
                isNearDeadline && 'text-warning',
              )}>
                {new Date(project.dueDate).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>

        {/* Budget Information */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-primary transition-transform duration-300 group-hover:scale-110" />
              <span className="font-medium">Budget</span>
            </div>
            <div className="text-right">
              <div className={cn(
                'font-medium',
                isOverBudget && 'text-destructive',
              )}>
                ${project.spent.toLocaleString()} / ${project.budget.toLocaleString()}
              </div>
              <div className={cn(
                'text-xs',
                isOverBudget ? 'text-destructive' : 'text-muted-foreground',
              )}>
                {budgetUsage.toFixed(1)}% used
              </div>
            </div>
          </div>

          <div className="h-1.5 bg-muted rounded-full overflow-hidden">
            <div
              className={cn(
                'h-full transition-all duration-500',
                isOverBudget ? 'bg-destructive' : budgetUsage > 80 ? 'bg-warning' : 'bg-primary',
              )}
              style={{ width: `${Math.min(budgetUsage, 100)}%` }}
            />
          </div>
        </div>

        {/* Additional Info */}
        {(project.manager || project.lastUpdate) && (
          <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t">
            {project.manager && (
              <span>Manager: {project.manager}</span>
            )}
            {project.lastUpdate && (
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                <span>{project.lastUpdate}</span>
              </div>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-2">
          <div className="flex gap-2">
            <AnimatedButton
              variant="outline"
              size="sm"
              animation="scale"
              onClick={() => onView?.(project.id)}
              className="transition-all duration-200"
            >
              <Eye className="h-4 w-4 mr-1" />
              View
            </AnimatedButton>
            <AnimatedButton
              variant="outline"
              size="sm"
              animation="scale"
              onClick={() => onEdit?.(project.id)}
              className="transition-all duration-200"
            >
              <Edit className="h-4 w-4 mr-1" />
              Edit
            </AnimatedButton>
          </div>

          <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <MoreVertical className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>

      {/* Animated border effect */}
      <div className="absolute inset-0 rounded-lg opacity-0 transition-opacity duration-300 group-hover:opacity-100 pointer-events-none">
        <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-primary/10 via-transparent to-primary/10" />
      </div>
    </Card>
  );
}