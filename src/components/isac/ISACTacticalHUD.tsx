import { useState, useEffect } from 'react';
import { Card, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import {
  Shield,
  Zap,
  Activity,
  Satellite,
  Radio,
  AlertTriangle,
  CheckCircle,
} from 'lucide-react';

interface SystemStatus {
  id: string;
  name: string;
  status: 'online' | 'offline' | 'warning' | 'critical';
  value: number;
  unit: string;
}

export function ISACTacticalHUD() {
  const [systems, setSystems] = useState<SystemStatus[]>([
    { id: 'power', name: 'Power Grid', status: 'online', value: 94, unit: '%' },
    { id: 'comms', name: 'Communications', status: 'online', value: 98, unit: '%' },
    { id: 'sensors', name: 'Sensor Array', status: 'warning', value: 73, unit: '%' },
    { id: 'defense', name: 'Defense Grid', status: 'critical', value: 45, unit: '%' },
  ]);

  const [threatLevel, setThreatLevel] = useState<'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL'>('MODERATE');
  const [activeOperations, setActiveOperations] = useState(3);

  useEffect(() => {
    const interval = setInterval(() => {
      setSystems(prev => prev.map(system => ({
        ...system,
        value: Math.max(0, Math.min(100, system.value + (Math.random() - 0.5) * 10)),
      })));
    }, 5000);

    return () => { clearInterval(interval); };
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'text-green-400';
      case 'warning': return 'text-yellow-400';
      case 'critical': return 'text-red-400';
      case 'offline': return 'text-gray-400';
      default: return 'text-gray-400';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'online': return <CheckCircle className="h-4 w-4 text-green-400" />;
      case 'warning': return <AlertTriangle className="h-4 w-4 text-yellow-400" />;
      case 'critical': return <AlertTriangle className="h-4 w-4 text-red-400" />;
      case 'offline': return <AlertTriangle className="h-4 w-4 text-gray-400" />;
      default: return <CheckCircle className="h-4 w-4 text-gray-400" />;
    }
  };

  const getThreatColor = (level: string) => {
    switch (level) {
      case 'LOW': return 'bg-green-600';
      case 'MODERATE': return 'bg-yellow-600';
      case 'HIGH': return 'bg-orange-600';
      case 'CRITICAL': return 'bg-red-600';
      default: return 'bg-gray-600';
    }
  };

  return (
    <div className="fixed top-4 right-4 w-80 space-y-2 z-50 pointer-events-none">
      {/* ISAC Header */}
      <Card className="bg-black/80 backdrop-blur-sm border-orange-500/30">
        <CardContent className="p-3">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-orange-500" />
              <span className="text-orange-500 font-mono text-sm font-bold">ISAC-OS</span>
            </div>
            <Badge className={getThreatColor(threatLevel)}>
              THREAT: {threatLevel}
            </Badge>
          </div>
          <div className="text-xs text-orange-300/80 font-mono">
            {new Date().toLocaleTimeString()} - TACTICAL OVERRIDE ACTIVE
          </div>
        </CardContent>
      </Card>

      {/* System Status */}
      <Card className="bg-black/80 backdrop-blur-sm border-orange-500/30">
        <CardContent className="p-3">
          <div className="text-xs text-orange-400 font-bold mb-2 font-mono">SYSTEM STATUS</div>
          <div className="space-y-2">
            {systems.map((system) => (
              <div key={system.id} className="flex items-center justify-between">
                <div className="flex items-center gap-2 flex-1">
                  {getStatusIcon(system.status)}
                  <span className={`text-xs font-mono ${getStatusColor(system.status)}`}>
                    {system.name}
                  </span>
                </div>
                <div className="flex items-center gap-2 min-w-0">
                  <Progress
                    value={system.value}
                    className="w-12 h-1"
                  />
                  <span className={`text-xs font-mono ${getStatusColor(system.status)} min-w-0`}>
                    {Math.round(system.value)}{system.unit}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Operations Status */}
      <Card className="bg-black/80 backdrop-blur-sm border-orange-500/30">
        <CardContent className="p-3">
          <div className="text-xs text-orange-400 font-bold mb-2 font-mono">ACTIVE OPERATIONS</div>
          <div className="grid grid-cols-2 gap-2">
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-green-400" />
              <span className="text-xs font-mono text-green-400">{activeOperations} ACTIVE</span>
            </div>
            <div className="flex items-center gap-2">
              <Satellite className="h-4 w-4 text-blue-400" />
              <span className="text-xs font-mono text-blue-400">SAT LINK</span>
            </div>
            <div className="flex items-center gap-2">
              <Radio className="h-4 w-4 text-purple-400" />
              <span className="text-xs font-mono text-purple-400">COMMS UP</span>
            </div>
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-yellow-400" />
              <span className="text-xs font-mono text-yellow-400">PWR NORM</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card className="bg-black/80 backdrop-blur-sm border-orange-500/30 pointer-events-auto">
        <CardContent className="p-2">
          <div className="grid grid-cols-2 gap-1">
            <button
              className="px-2 py-1 text-xs font-mono bg-orange-500/20 hover:bg-orange-500/30 border border-orange-500/30 rounded text-orange-400 transition-colors"
              onClick={() => {
                setThreatLevel(prev =>
                  prev === 'LOW' ? 'MODERATE'
                    : prev === 'MODERATE' ? 'HIGH'
                      : prev === 'HIGH' ? 'CRITICAL' : 'LOW',
                );
              }}
            >
              THREAT
            </button>
            <button
              className="px-2 py-1 text-xs font-mono bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 rounded text-blue-400 transition-colors"
              onClick={() => { setActiveOperations(prev => prev === 3 ? 5 : 3); }}
            >
              OPS
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}