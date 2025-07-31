import * as React from 'react';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { 
  Calendar, 
  Clock, 
  DollarSign, 
  MapPin, 
  Users, 
  AlertTriangle,
  CheckCircle,
  Eye,
  Edit,
  MoreHorizontal
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export interface Project {
  id: string;
  name: string;
  description?: string;
  status: 'planning' | 'active' | 'on-hold' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'critical';
  progress: number;
  startDate: Date;
  endDate: Date;
  budget: number;
  spent: number;
  location: string;
  manager: {
    id: string;
    name: string;
    avatar?: string;
  };
  team: Array<{
    id: string;
    name: string;
    avatar?: string;
  }>;
  type: 'residential' | 'commercial' | 'infrastructure' | 'renovation';
  tags?: string[];
  lastUpdate: Date;
  issues?: number;
  riskLevel?: 'low' | 'medium' | 'high';
}

interface ProjectCardProps {
  project: Project;
  onView?: (project: Project) => void;
  onEdit?: (project: Project) => void;
  onStatusChange?: (project: Project, status: Project['status']) => void;
  className?: string;
  variant?: 'default' | 'compact' | 'detailed';
}

const statusConfig = {
  planning: { label: 'Planning', color: 'bg-blue-500', textColor: 'text-blue-700' },
  active: { label: 'Active', color: 'bg-green-500', textColor: 'text-green-700' },
  'on-hold': { label: 'On Hold', color: 'bg-yellow-500', textColor: 'text-yellow-700' },
  completed: { label: 'Completed', color: 'bg-gray-500', textColor: 'text-gray-700' },
  cancelled: { label: 'Cancelled', color: 'bg-red-500', textColor: 'text-red-700' },
};

const priorityConfig = {
  low: { label: 'Low', variant: 'outline' as const },
  medium: { label: 'Medium', variant: 'secondary' as const },
  high: { label: 'High', variant: 'default' as const },
  critical: { label: 'Critical', variant: 'destructive' as const },
};

const typeConfig = {
  residential: { label: 'Residential', icon: '🏠' },
  commercial: { label: 'Commercial', icon: '🏢' },
  infrastructure: { label: 'Infrastructure', icon: '🌉' },
  renovation: { label: 'Renovation', icon: '🔨' },
};

export const ProjectCard = ({
  project,
  onView,
  onEdit,
  onStatusChange,
  className,
  variant = 'default',
}: ProjectCardProps) => {
  const status = statusConfig[project.status];
  const priority = priorityConfig[project.priority];
  const type = typeConfig[project.type];
  
  const daysRemaining = Math.ceil(
    (project.endDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
  );
  
  const budgetUsed = (project.spent / project.budget) * 100;
  const isOverBudget = budgetUsed > 100;
  const isNearDeadline = daysRemaining <= 7 && daysRemaining > 0;
  const isOverdue = daysRemaining < 0;

  if (variant === 'compact') {
    return (
      <Card className={cn('hover:shadow-md transition-shadow', className)}>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs">{type.icon}</span>
                <h3 className="font-medium truncate">{project.name}</h3>
                <Badge variant={priority.variant} className="text-xs">
                  {priority.label}
                </Badge>
              </div>
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {project.endDate.toLocaleDateString()}
                </span>
                <span>{project.progress}%</span>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <div
                className={cn('w-2 h-2 rounded-full', status.color)}
                title={status.label}
              />
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                    <MoreHorizontal className="h-3 w-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => onView?.(project)}>
                    <Eye className="h-4 w-4 mr-2" />
                    View
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onEdit?.(project)}>
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn('hover:shadow-lg transition-all duration-200', className)}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-lg">{type.icon}</span>
              <h3 className="font-semibold text-lg truncate">{project.name}</h3>
              {project.riskLevel === 'high' && (
                <AlertTriangle className="h-4 w-4 text-red-500" />
              )}
            </div>
            {project.description && (
              <p className="text-sm text-muted-foreground line-clamp-2">
                {project.description}
              </p>
            )}
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onView?.(project)}>
                <Eye className="h-4 w-4 mr-2" />
                View Details
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onEdit?.(project)}>
                <Edit className="h-4 w-4 mr-2" />
                Edit Project
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant={priority.variant}>{priority.label}</Badge>
          <Badge variant="outline" className={status.textColor}>
            {status.label}
          </Badge>
          <Badge variant="outline">{type.label}</Badge>
          {project.tags?.map((tag) => (
            <Badge key={tag} variant="secondary" className="text-xs">
              {tag}
            </Badge>
          ))}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Progress */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span>Progress</span>
            <span className="font-medium">{project.progress}%</span>
          </div>
          <Progress value={project.progress} className="h-2" />
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-muted-foreground">
              <DollarSign className="h-4 w-4" />
              <span>Budget</span>
            </div>
            <div>
              <div className="font-medium">
                ${project.spent.toLocaleString()} / ${project.budget.toLocaleString()}
              </div>
              <div className={cn('text-xs', isOverBudget ? 'text-red-500' : 'text-muted-foreground')}>
                {budgetUsed.toFixed(1)}% used
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>Timeline</span>
            </div>
            <div>
              <div className="font-medium">
                {isOverdue ? 'Overdue' : `${daysRemaining} days left`}
              </div>
              <div className={cn(
                'text-xs',
                isOverdue ? 'text-red-500' : 
                isNearDeadline ? 'text-yellow-500' : 'text-muted-foreground'
              )}>
                Due {project.endDate.toLocaleDateString()}
              </div>
            </div>
          </div>
        </div>

        {/* Location and Team */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin className="h-4 w-4" />
            <span>{project.location}</span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Team</span>
            </div>
            <div className="flex items-center -space-x-2">
              <Avatar className="h-6 w-6 border-2 border-background">
                <AvatarImage src={project.manager.avatar} />
                <AvatarFallback className="text-xs">
                  {project.manager.name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              {project.team.slice(0, 3).map((member) => (
                <Avatar key={member.id} className="h-6 w-6 border-2 border-background">
                  <AvatarImage src={member.avatar} />
                  <AvatarFallback className="text-xs">
                    {member.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
              ))}
              {project.team.length > 3 && (
                <div className="h-6 w-6 rounded-full bg-muted border-2 border-background flex items-center justify-center">
                  <span className="text-xs font-medium">+{project.team.length - 3}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Issues Alert */}
        {project.issues && project.issues > 0 && (
          <div className="flex items-center gap-2 p-2 bg-yellow-50 rounded-lg border border-yellow-200">
            <AlertTriangle className="h-4 w-4 text-yellow-600" />
            <span className="text-sm text-yellow-800">
              {project.issues} active issue{project.issues !== 1 ? 's' : ''}
            </span>
          </div>
        )}
      </CardContent>

      <CardFooter className="pt-0">
        <div className="flex items-center justify-between w-full">
          <span className="text-xs text-muted-foreground">
            Updated {project.lastUpdate.toLocaleDateString()}
          </span>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => onView?.(project)}>
              <Eye className="h-4 w-4 mr-1" />
              View
            </Button>
            <Button size="sm" onClick={() => onEdit?.(project)}>
              <Edit className="h-4 w-4 mr-1" />
              Edit
            </Button>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
};