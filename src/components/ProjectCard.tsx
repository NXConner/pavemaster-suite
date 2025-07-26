import { Calendar, MapPin, Users, DollarSign } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";

interface ProjectCardProps {
  project: {
    id: string;
    name: string;
    location: string;
    status: "active" | "completed" | "planned";
    progress: number;
    budget: number;
    spent: number;
    crewSize: number;
    dueDate: string;
  };
}

export function ProjectCard({ project }: ProjectCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "bg-success text-success-foreground";
      case "completed": return "bg-primary text-primary-foreground";
      case "planned": return "bg-warning text-warning-foreground";
      default: return "bg-muted text-muted-foreground";
    }
  };

  const budgetUsed = (project.spent / project.budget) * 100;

  return (
    <Card className="transition-all duration-300 hover:shadow-md hover:-translate-y-1">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold">{project.name}</CardTitle>
          <Badge className={getStatusColor(project.status)}>
            {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
          </Badge>
        </div>
        <div className="flex items-center text-sm text-muted-foreground">
          <MapPin className="mr-1 h-4 w-4" />
          {project.location}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <div className="mb-2 flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Progress</span>
            <span className="font-medium">{project.progress}%</span>
          </div>
          <Progress value={project.progress} className="h-2" />
        </div>
        
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center">
            <Users className="mr-2 h-4 w-4 text-primary" />
            <span className="text-muted-foreground">{project.crewSize} crew</span>
          </div>
          <div className="flex items-center">
            <Calendar className="mr-2 h-4 w-4 text-primary" />
            <span className="text-muted-foreground">{project.dueDate}</span>
          </div>
        </div>
        
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center">
            <DollarSign className="mr-1 h-4 w-4 text-primary" />
            <span className="text-muted-foreground">Budget</span>
          </div>
          <div className="text-right">
            <div className="font-medium">${project.spent.toLocaleString()} / ${project.budget.toLocaleString()}</div>
            <div className={`text-xs ${budgetUsed > 90 ? 'text-destructive' : budgetUsed > 75 ? 'text-warning' : 'text-success'}`}>
              {budgetUsed.toFixed(0)}% used
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}