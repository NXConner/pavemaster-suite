import { useState } from "react";
import { Users, Shield, Layers, Info } from "lucide-react";
import { Button } from "./button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./select";
import { Card, CardContent, CardHeader, CardTitle } from "./card";
import { Badge } from "./badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./tooltip";
import { useJargon, type JargonMode } from "../../contexts/JargonContext";

interface JargonConfig {
  id: JargonMode;
  name: string;
  description: string;
  icon: React.ComponentType<any>;
  badge: string;
  examples: string[];
}

const JARGON_CONFIGURATIONS: JargonConfig[] = [
  {
    id: "civilian",
    name: "Civilian Terminology",
    description: "Standard business and construction industry terms",
    icon: Users,
    badge: "CIV",
    examples: ["Projects", "Employees", "Equipment", "Dashboard"]
  },
  {
    id: "military",
    name: "Military Terminology", 
    description: "Military and tactical operational terminology",
    icon: Shield,
    badge: "MIL",
    examples: ["Operations (OPS)", "Personnel (PERS)", "Assets (EQUIP)", "Command Center (C2)"]
  },
  {
    id: "hybrid",
    name: "Hybrid Mode",
    description: "Combined civilian/military terminology with acronyms",
    icon: Layers,
    badge: "HYB",
    examples: ["Projects / Operations (OPS)", "Employees / Personnel (PERS)"]
  }
];

export function JargonSwitcher() {
  const { jargonMode, setJargonMode, getText, getTerms } = useJargon();
  const [showExamples, setShowExamples] = useState(false);

  const currentConfig = JARGON_CONFIGURATIONS.find(config => config.id === jargonMode);

  const handleJargonChange = (newMode: string) => {
    setJargonMode(newMode as JargonMode);
  };

  const sampleTerms = ['dashboard', 'projects', 'employees', 'equipment', 'tracking'];

  return (
    <TooltipProvider>
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {currentConfig && <currentConfig.icon className="h-5 w-5" />}
            Terminology Configuration
            <Badge variant="outline" className="ml-auto">
              {currentConfig?.badge}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Jargon Mode Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Communication Mode</label>
            <Select value={jargonMode} onValueChange={handleJargonChange}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {JARGON_CONFIGURATIONS.map((config) => (
                  <SelectItem key={config.id} value={config.id}>
                    <div className="flex items-center gap-2">
                      <config.icon className="h-4 w-4" />
                      <div className="flex-1">
                        <div className="font-medium flex items-center gap-2">
                          {config.name}
                          <Badge variant="secondary" className="text-xs">
                            {config.badge}
                          </Badge>
                        </div>
                        <div className="text-xs text-muted-foreground">{config.description}</div>
                      </div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Current Configuration Display */}
          <div className="p-3 bg-muted rounded-lg space-y-2">
            <div className="flex items-center justify-between">
              <div className="text-xs font-mono text-muted-foreground">ACTIVE MODE</div>
              <Badge variant="outline">{currentConfig?.badge}</Badge>
            </div>
            <div className="text-sm font-medium">{currentConfig?.name}</div>
            <div className="text-xs text-muted-foreground">{currentConfig?.description}</div>
          </div>

          {/* Live Examples Toggle */}
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">Show Live Examples</label>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowExamples(!showExamples)}
              className="flex items-center gap-2"
            >
              <Info className="h-4 w-4" />
              {showExamples ? "Hide" : "Show"}
            </Button>
          </div>

          {/* Live Examples */}
          {showExamples && (
            <div className="space-y-3">
              <div className="text-xs font-mono text-muted-foreground uppercase tracking-wider">
                Live Terminology Examples
              </div>
              <div className="grid gap-2">
                {sampleTerms.map((term) => {
                  const terms = getTerms(term);
                  return (
                    <div key={term} className="p-2 bg-card border rounded-md">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">
                          {getText(term)}
                        </span>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                              <Info className="h-3 w-3" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <div className="space-y-1 text-xs">
                              <div><strong>Civilian:</strong> {terms.civilian}</div>
                              <div><strong>Military:</strong> {terms.military}</div>
                              {terms.acronym && <div><strong>Acronym:</strong> {terms.acronym}</div>}
                              {terms.definition && <div><strong>Definition:</strong> {terms.definition}</div>}
                            </div>
                          </TooltipContent>
                        </Tooltip>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Veteran Resources Section */}
          <div className="p-3 bg-gradient-to-r from-blue-50 to-red-50 dark:from-blue-950 dark:to-red-950 rounded-lg border">
            <div className="flex items-center gap-2 mb-2">
              <Shield className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium">Veteran Integration</span>
            </div>
            <div className="text-xs text-muted-foreground">
              This terminology system is designed to accommodate both civilian contractors and military veterans, 
              ensuring seamless communication across all team members regardless of background.
            </div>
          </div>

          {/* Quick Access Acronyms */}
          <div className="space-y-2">
            <div className="text-xs font-mono text-muted-foreground uppercase tracking-wider">
              Common Acronyms
            </div>
            <div className="flex flex-wrap gap-1">
              {Object.entries({
                'C2': 'Command & Control',
                'OPS': 'Operations', 
                'PERS': 'Personnel',
                'EQUIP': 'Equipment',
                'SURV': 'Surveillance',
                'INTEL': 'Intelligence'
              }).map(([acronym, definition]) => (
                <Tooltip key={acronym}>
                  <TooltipTrigger asChild>
                    <Badge variant="secondary" className="cursor-help text-xs">
                      {acronym}
                    </Badge>
                  </TooltipTrigger>
                  <TooltipContent>
                    <div className="text-xs">{definition}</div>
                  </TooltipContent>
                </Tooltip>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </TooltipProvider>
  );
}