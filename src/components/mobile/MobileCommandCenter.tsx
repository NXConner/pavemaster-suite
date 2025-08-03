import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { 
  Command, 
  Map, 
  Users, 
  Truck,
  Activity,
  Shield,
  Zap,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

interface MissionStatus {
  id: string;
  name: string;
  status: 'active' | 'standby' | 'completed' | 'alert';
  progress: number;
  team: string;
  location: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
}

const MOCK_MISSIONS: MissionStatus[] = [
  {
    id: '1',
    name: 'Alpha Sector Paving',
    status: 'active',
    progress: 75,
    team: 'Crew-A',
    location: '1st Baptist Church',
    priority: 'high'
  },
  {
    id: '2',
    name: 'Bravo Line Striping',
    status: 'standby',
    progress: 0,
    team: 'Crew-B',
    location: 'Grace Methodist',
    priority: 'medium'
  },
  {
    id: '3',
    name: 'Sealcoat Operation',
    status: 'alert',
    progress: 45,
    team: 'Crew-C',
    location: 'Trinity Lutheran',
    priority: 'critical'
  }
];

export function MobileCommandCenter() {
  const [missions] = useState<MissionStatus[]>(MOCK_MISSIONS);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    missions: true,
    teams: false,
    alerts: false
  });

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-500 bg-green-500/10 border-green-500/30';
      case 'standby': return 'text-blue-500 bg-blue-500/10 border-blue-500/30';
      case 'completed': return 'text-gray-500 bg-gray-500/10 border-gray-500/30';
      case 'alert': return 'text-red-500 bg-red-500/10 border-red-500/30';
      default: return 'text-muted-foreground bg-muted border-border';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'destructive';
      case 'high': return 'default';
      case 'medium': return 'secondary';
      case 'low': return 'outline';
      default: return 'outline';
    }
  };

  return (
    <div className="min-h-screen bg-background p-4 space-y-4">
      {/* Header */}
      <Card className="border-border/50 bg-surface/90 backdrop-blur-sm">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Command className="h-5 w-5 text-primary" />
            Mobile Command Center
            <Badge variant="outline" className="ml-auto">
              {missions.filter(m => m.status === 'active').length} Active
            </Badge>
          </CardTitle>
        </CardHeader>
      </Card>

      {/* Mission Status */}
      <Card className="border-border/50 bg-surface/90 backdrop-blur-sm">
        <CardHeader 
          className="pb-2 cursor-pointer"
          onClick={() => toggleSection('missions')}
        >
          <CardTitle className="flex items-center justify-between text-base">
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-primary" />
              Mission Status
            </div>
            {expandedSections.missions ? 
              <ChevronUp className="h-4 w-4" /> : 
              <ChevronDown className="h-4 w-4" />
            }
          </CardTitle>
        </CardHeader>
        
        {expandedSections.missions && (
          <CardContent className="pt-0">
            <div className="space-y-3">
              {missions.map((mission) => (
                <div 
                  key={mission.id}
                  className={`p-3 rounded-lg border transition-all ${getStatusColor(mission.status)}`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="space-y-1">
                      <h4 className="font-medium text-sm">{mission.name}</h4>
                      <p className="text-xs text-muted-foreground">{mission.location}</p>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <Badge variant={getPriorityColor(mission.priority)} className="text-xs">
                        {mission.priority}
                      </Badge>
                      <span className="text-xs text-muted-foreground">{mission.team}</span>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span>Progress</span>
                      <span>{mission.progress}%</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div 
                        className="h-2 rounded-full bg-primary transition-all duration-300"
                        style={{ width: `${mission.progress}%` }}
                      />
                    </div>
                  </div>
                  
                  <div className="flex gap-2 mt-3">
                    <Button size="sm" variant="outline" className="flex-1 text-xs">
                      <Map className="h-3 w-3 mr-1" />
                      Track
                    </Button>
                    <Button size="sm" variant="outline" className="flex-1 text-xs">
                      Details
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        )}
      </Card>

      {/* Team Status */}
      <Card className="border-border/50 bg-surface/90 backdrop-blur-sm">
        <CardHeader 
          className="pb-2 cursor-pointer"
          onClick={() => toggleSection('teams')}
        >
          <CardTitle className="flex items-center justify-between text-base">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-primary" />
              Team Status
            </div>
            {expandedSections.teams ? 
              <ChevronUp className="h-4 w-4" /> : 
              <ChevronDown className="h-4 w-4" />
            }
          </CardTitle>
        </CardHeader>
        
        {expandedSections.teams && (
          <CardContent className="pt-0">
            <div className="grid grid-cols-2 gap-3">
              {['Crew-A', 'Crew-B', 'Crew-C', 'Crew-D'].map((crew, idx) => (
                <div key={crew} className="p-3 rounded-lg border border-border/50 bg-surface/50">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-sm">{crew}</span>
                    <div className={`w-2 h-2 rounded-full ${
                      idx < 2 ? 'bg-green-500' : idx === 2 ? 'bg-red-500' : 'bg-gray-500'
                    }`} />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {idx < 2 ? 'Active' : idx === 2 ? 'Alert' : 'Standby'}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        )}
      </Card>

      {/* Quick Actions */}
      <Card className="border-border/50 bg-surface/90 backdrop-blur-sm">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <Zap className="h-4 w-4 text-primary" />
            Quick Actions
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="grid grid-cols-2 gap-3">
            <Button variant="outline" className="h-12 flex-col gap-1">
              <Truck className="h-4 w-4" />
              <span className="text-xs">Dispatch</span>
            </Button>
            <Button variant="outline" className="h-12 flex-col gap-1">
              <Map className="h-4 w-4" />
              <span className="text-xs">Navigation</span>
            </Button>
            <Button variant="outline" className="h-12 flex-col gap-1">
              <Shield className="h-4 w-4" />
              <span className="text-xs">Safety</span>
            </Button>
            <Button variant="outline" className="h-12 flex-col gap-1">
              <Activity className="h-4 w-4" />
              <span className="text-xs">Reports</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}