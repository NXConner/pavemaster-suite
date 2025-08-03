import { useState, useEffect } from "react";
import { Shield, AlertTriangle, Activity, Satellite, Zap, Eye } from "lucide-react";
import { Card } from "./card";
import { Badge } from "./badge";
import { Progress } from "./progress";

interface DefconLevel {
  level: number;
  status: string;
  color: string;
  description: string;
  threat: "MINIMAL" | "LOW" | "ELEVATED" | "HIGH" | "CRITICAL";
}

const DEFCON_LEVELS: DefconLevel[] = [
  { level: 5, status: "EXERCISE", color: "hsl(120, 100%, 50%)", description: "Minimum threat level", threat: "MINIMAL" },
  { level: 4, status: "NORMAL", color: "hsl(60, 100%, 50%)", description: "Normal readiness", threat: "LOW" },
  { level: 3, status: "ELEVATED", color: "hsl(45, 100%, 50%)", description: "Increased watch", threat: "ELEVATED" },
  { level: 2, status: "ALERT", color: "hsl(30, 100%, 50%)", description: "High readiness", threat: "HIGH" },
  { level: 1, status: "EMERGENCY", color: "hsl(0, 100%, 50%)", description: "Maximum force ready", threat: "CRITICAL" }
];

export function MilitaryStatusBar() {
  const [currentDefcon] = useState(4);
  const [systemHealth, setSystemHealth] = useState(98);
  const [activeThreats, setActiveThreats] = useState(0);
  const [operationalSystems] = useState(12);
  const [totalSystems] = useState(12);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
      
      // Simulate dynamic status changes
      if (Math.random() < 0.1) {
        setSystemHealth(prev => Math.max(85, Math.min(100, prev + (Math.random() - 0.5) * 2)));
      }
      
      if (Math.random() < 0.05) {
        setActiveThreats(prev => Math.max(0, Math.min(5, prev + (Math.random() > 0.7 ? 1 : -1))));
      }
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const defconLevel = DEFCON_LEVELS.find(d => d.level === currentDefcon)!;
  const threatLevel = activeThreats > 3 ? "CRITICAL" : activeThreats > 1 ? "HIGH" : activeThreats > 0 ? "ELEVATED" : "LOW";

  return (
    <Card className="w-full border-2 border-primary/20 bg-card/50 backdrop-blur-md">
      <div className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-6 gap-4 items-center">
          
          {/* DEFCON Status */}
          <div className="flex items-center gap-3">
            <div className="relative">
              <Shield 
                className="h-8 w-8 text-primary animate-pulse" 
                style={{ color: defconLevel.color }}
              />
              <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-primary animate-ping" />
            </div>
            <div>
              <div className="text-xs font-mono text-muted-foreground">DEFCON</div>
              <div className="font-bold text-lg" style={{ color: defconLevel.color }}>
                {currentDefcon}
              </div>
              <div className="text-xs font-medium">{defconLevel.status}</div>
            </div>
          </div>

          {/* System Health */}
          <div className="flex items-center gap-3">
            <Activity className="h-6 w-6 text-success" />
            <div className="flex-1">
              <div className="text-xs font-mono text-muted-foreground">SYSTEM HEALTH</div>
              <Progress value={systemHealth} className="h-2 mt-1" />
              <div className="text-sm font-medium text-success">{systemHealth}%</div>
            </div>
          </div>

          {/* Active Threats */}
          <div className="flex items-center gap-3">
            <AlertTriangle 
              className={`h-6 w-6 ${activeThreats > 0 ? 'text-warning animate-pulse' : 'text-muted-foreground'}`} 
            />
            <div>
              <div className="text-xs font-mono text-muted-foreground">THREATS</div>
              <div className="font-bold text-lg">
                {activeThreats}
              </div>
              <Badge 
                variant={threatLevel === "CRITICAL" ? "destructive" : threatLevel === "HIGH" ? "secondary" : "outline"}
                className="text-xs px-1 py-0"
              >
                {threatLevel}
              </Badge>
            </div>
          </div>

          {/* Operational Systems */}
          <div className="flex items-center gap-3">
            <Satellite className="h-6 w-6 text-info" />
            <div>
              <div className="text-xs font-mono text-muted-foreground">SYSTEMS</div>
              <div className="font-bold text-lg text-info">
                {operationalSystems}/{totalSystems}
              </div>
              <div className="text-xs">OPERATIONAL</div>
            </div>
          </div>

          {/* Power Status */}
          <div className="flex items-center gap-3">
            <Zap className="h-6 w-6 text-warning" />
            <div>
              <div className="text-xs font-mono text-muted-foreground">POWER</div>
              <div className="font-bold text-lg text-warning">100%</div>
              <div className="text-xs">NOMINAL</div>
            </div>
          </div>

          {/* Current Time & Status */}
          <div className="flex items-center gap-3">
            <Eye className="h-6 w-6 text-primary" />
            <div>
              <div className="text-xs font-mono text-muted-foreground">LOCAL TIME</div>
              <div className="font-mono text-sm font-bold">
                {currentTime.toLocaleTimeString('en-US', { 
                  hour12: false,
                  hour: '2-digit',
                  minute: '2-digit',
                  second: '2-digit'
                })}
              </div>
              <div className="text-xs text-success">● ACTIVE</div>
            </div>
          </div>

        </div>

        {/* Alert Banner */}
        {activeThreats > 0 && (
          <div className="mt-4 p-2 bg-warning/10 border border-warning/20 rounded-lg">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-warning animate-pulse" />
              <span className="text-sm font-medium text-warning">
                {activeThreats} ACTIVE THREAT{activeThreats > 1 ? 'S' : ''} DETECTED - MONITORING
              </span>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}