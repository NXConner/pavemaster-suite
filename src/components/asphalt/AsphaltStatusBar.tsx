import { useState, useEffect } from 'react';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Separator } from '../ui/separator';
import {
  Shield,
  Zap,
  Signal,
  Clock,
  MapPin,
  Thermometer,
  Minimize2,
  Maximize2,
} from 'lucide-react';

export function AsphaltStatusBar() {
  const [isMinimized, setIsMinimized] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [systemData, setSystemData] = useState({
    networkStatus: 'ONLINE',
    powerLevel: 94,
    temperature: 72,
    location: 'Richmond, VA',
    uptime: '72:14:33',
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
      setSystemData(prev => ({
        ...prev,
        powerLevel: Math.max(80, Math.min(100, prev.powerLevel + (Math.random() - 0.5) * 2)),
        temperature: Math.max(65, Math.min(85, prev.temperature + (Math.random() - 0.5) * 0.5)),
      }));
    }, 1000);

    return () => { clearInterval(interval); };
  }, []);

  if (isMinimized) {
    return (
      <div className="fixed bottom-4 left-4 z-50">
        <Button
          size="sm"
          variant="outline"
          onClick={() => setIsMinimized(false)}
          className="bg-black/80 backdrop-blur-sm border-orange-500/30 text-orange-500 hover:bg-orange-500/20"
        >
          <Maximize2 className="h-4 w-4 mr-1" />
          Status
        </Button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-black/90 backdrop-blur-sm border-t border-orange-500/30 px-4 py-2 z-50">
      <div className="flex items-center justify-between text-xs font-mono">
        {/* Left Section */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-orange-500" />
            <span className="text-orange-500 font-bold">Asphalt-OS</span>
            <Badge className="bg-green-600 text-white text-xs">OPERATIONAL</Badge>
          </div>

          <Separator orientation="vertical" className="h-4 bg-orange-500/30" />

          <div className="flex items-center gap-2">
            <Signal className="h-3 w-3 text-green-400" />
            <span className="text-green-400">{systemData.networkStatus}</span>
          </div>

          <div className="flex items-center gap-2">
            <Zap className="h-3 w-3 text-yellow-400" />
            <span className="text-yellow-400">{systemData.powerLevel}% PWR</span>
          </div>

          <div className="flex items-center gap-2">
            <Thermometer className="h-3 w-3 text-blue-400" />
            <span className="text-blue-400">{Math.round(systemData.temperature)}°F</span>
          </div>
        </div>

        {/* Center Section */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <MapPin className="h-3 w-3 text-purple-400" />
            <span className="text-purple-400">{systemData.location}</span>
          </div>

          <Separator orientation="vertical" className="h-4 bg-orange-500/30" />

          <div className="flex items-center gap-2">
            <Clock className="h-3 w-3 text-cyan-400" />
            <span className="text-cyan-400">UPTIME: {systemData.uptime}</span>
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-4">
          <div className="text-orange-400">
            {currentTime.toLocaleTimeString()}
          </div>

          <Separator orientation="vertical" className="h-4 bg-orange-500/30" />

          <div className="text-orange-300">
            {currentTime.toLocaleDateString()}
          </div>

          <div className="ml-2 flex gap-1">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <div className="w-2 h-2 bg-orange-400 rounded-full animate-pulse animation-delay-200"></div>
            <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse animation-delay-400"></div>
          </div>

          <Button
            size="sm"
            variant="ghost"
            onClick={() => setIsMinimized(true)}
            className="text-orange-500 hover:bg-orange-500/20 h-6 w-6 p-0 ml-2"
          >
            <Minimize2 className="h-3 w-3" />
          </Button>
        </div>
      </div>
    </div>
  );
}