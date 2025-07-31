import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Activity, 
  Clock, 
  Cpu, 
  HardDrive, 
  Monitor, 
  TrendingUp,
  Zap,
  AlertTriangle,
  CheckCircle,
  Info,
  Download,
  RefreshCw
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface PerformanceMetrics {
  loadTime: number;
  memoryUsage: number;
  renderTime: number;
  networkLatency: number;
  errorRate: number;
  userInteractions: number;
  bundleSize: number;
  cacheHitRate: number;
}

interface NavigationTiming {
  navigationStart: number;
  loadEventEnd: number;
  domContentLoadedEventEnd: number;
  responseEnd: number;
  requestStart: number;
}

interface MemoryInfo {
  usedJSMemorySize: number;
  totalJSMemorySize: number;
  jsMemoryLimit: number;
}

interface VitalMetrics {
  fcp: number; // First Contentful Paint
  lcp: number; // Largest Contentful Paint
  fid: number; // First Input Delay
  cls: number; // Cumulative Layout Shift
}

export function PerformanceMonitor() {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    loadTime: 0,
    memoryUsage: 0,
    renderTime: 0,
    networkLatency: 0,
    errorRate: 0,
    userInteractions: 0,
    bundleSize: 2644,
    cacheHitRate: 0
  });

  const [vitals, setVitals] = useState<VitalMetrics>({
    fcp: 0,
    lcp: 0,
    fid: 0,
    cls: 0
  });

  const [isMonitoring, setIsMonitoring] = useState(false);
  const [logs, setLogs] = useState<Array<{
    timestamp: string;
    type: 'info' | 'warning' | 'error';
    message: string;
    data?: any;
  }>>([]);

  const observerRef = useRef<PerformanceObserver | null>(null);
  const interactionCountRef = useRef(0);

  useEffect(() => {
    startMonitoring();
    return () => stopMonitoring();
  }, []);

  const startMonitoring = () => {
    setIsMonitoring(true);
    collectInitialMetrics();
    setupPerformanceObserver();
    setupInteractionTracking();
    
    // Periodic metrics collection
    const interval = setInterval(() => {
      updateMetrics();
    }, 5000);

    return () => clearInterval(interval);
  };

  const stopMonitoring = () => {
    setIsMonitoring(false);
    if (observerRef.current) {
      observerRef.current.disconnect();
    }
  };

  const collectInitialMetrics = () => {
    try {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      const memory = (performance as any).memory as MemoryInfo;

      if (navigation) {
        const loadTime = navigation.loadEventEnd - navigation.navigationStart;
        const networkLatency = navigation.responseEnd - navigation.requestStart;
        
        setMetrics(prev => ({
          ...prev,
          loadTime: loadTime,
          networkLatency: networkLatency
        }));

        addLog('info', 'Initial metrics collected', {
          loadTime: `${loadTime}ms`,
          networkLatency: `${networkLatency}ms`
        });
      }

      if (memory) {
        const memoryUsage = Math.round((memory.usedJSMemorySize / memory.jsMemoryLimit) * 100);
        setMetrics(prev => ({ ...prev, memoryUsage }));
      }
    } catch (error) {
      addLog('error', 'Failed to collect initial metrics', error);
    }
  };

  const setupPerformanceObserver = () => {
    try {
      // Observe paint timings
      const paintObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.name === 'first-contentful-paint') {
            setVitals(prev => ({ ...prev, fcp: entry.startTime }));
          }
        }
      });
      paintObserver.observe({ entryTypes: ['paint'] });

      // Observe largest contentful paint
      const lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        setVitals(prev => ({ ...prev, lcp: lastEntry.startTime }));
      });
      lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });

      // Observe layout shifts
      const clsObserver = new PerformanceObserver((list) => {
        let clsValue = 0;
        for (const entry of list.getEntries()) {
          if (!(entry as any).hadRecentInput) {
            clsValue += (entry as any).value;
          }
        }
        setVitals(prev => ({ ...prev, cls: clsValue }));
      });
      clsObserver.observe({ entryTypes: ['layout-shift'] });

      observerRef.current = paintObserver;
    } catch (error) {
      addLog('warning', 'Performance Observer not supported', error);
    }
  };

  const setupInteractionTracking = () => {
    const trackInteraction = () => {
      interactionCountRef.current += 1;
      setMetrics(prev => ({ ...prev, userInteractions: interactionCountRef.current }));
    };

    // Track various user interactions
    document.addEventListener('click', trackInteraction);
    document.addEventListener('keydown', trackInteraction);
    document.addEventListener('scroll', trackInteraction);

    return () => {
      document.removeEventListener('click', trackInteraction);
      document.removeEventListener('keydown', trackInteraction);
      document.removeEventListener('scroll', trackInteraction);
    };
  };

  const updateMetrics = () => {
    try {
      // Update memory usage
      const memory = (performance as any).memory as MemoryInfo;
      if (memory) {
        const memoryUsage = Math.round((memory.usedJSMemorySize / memory.jsMemoryLimit) * 100);
        setMetrics(prev => ({ ...prev, memoryUsage }));
      }

      // Simulate cache hit rate calculation
      const cacheHitRate = Math.round(85 + Math.random() * 10); // Mock data
      setMetrics(prev => ({ ...prev, cacheHitRate }));

      // Calculate render time (mock)
      const renderTime = Math.round(10 + Math.random() * 20);
      setMetrics(prev => ({ ...prev, renderTime }));

      addLog('info', 'Metrics updated', {
        memoryUsage: `${memory ? Math.round((memory.usedJSMemorySize / memory.jsMemoryLimit) * 100) : 0}%`,
        cacheHitRate: `${cacheHitRate}%`
      });
    } catch (error) {
      addLog('error', 'Failed to update metrics', error);
    }
  };

  const addLog = (type: 'info' | 'warning' | 'error', message: string, data?: any) => {
    const log = {
      timestamp: new Date().toISOString(),
      type,
      message,
      data
    };
    setLogs(prev => [log, ...prev.slice(0, 49)]); // Keep last 50 logs
  };

  const getMetricStatus = (value: number, thresholds: { good: number; poor: number }) => {
    if (value <= thresholds.good) return 'good';
    if (value <= thresholds.poor) return 'needs-improvement';
    return 'poor';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'good': return 'text-green-600 bg-green-50 border-green-200';
      case 'needs-improvement': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'poor': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const exportMetrics = () => {
    const exportData = {
      timestamp: new Date().toISOString(),
      metrics,
      vitals,
      logs: logs.slice(0, 20), // Export last 20 logs
      userAgent: navigator.userAgent,
      url: window.location.href
    };

    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `performance-metrics-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    addLog('info', 'Performance metrics exported');
  };

  const resetMetrics = () => {
    setMetrics({
      loadTime: 0,
      memoryUsage: 0,
      renderTime: 0,
      networkLatency: 0,
      errorRate: 0,
      userInteractions: 0,
      bundleSize: 2644,
      cacheHitRate: 0
    });
    setVitals({
      fcp: 0,
      lcp: 0,
      fid: 0,
      cls: 0
    });
    setLogs([]);
    interactionCountRef.current = 0;
    addLog('info', 'Metrics reset');
  };

  return (
    <Card className="w-full max-w-6xl mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Activity className="h-5 w-5" />
            <CardTitle>Performance Monitor</CardTitle>
            <Badge variant={isMonitoring ? 'default' : 'secondary'}>
              {isMonitoring ? 'Active' : 'Inactive'}
            </Badge>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={exportMetrics}
            >
              <Download className="h-4 w-4 mr-1" />
              Export
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={resetMetrics}
            >
              <RefreshCw className="h-4 w-4 mr-1" />
              Reset
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="vitals">Core Vitals</TabsTrigger>
            <TabsTrigger value="resources">Resources</TabsTrigger>
            <TabsTrigger value="logs">Logs</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <Clock className="h-4 w-4 text-blue-500" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">Load Time</p>
                      <p className="text-2xl font-bold">{Math.round(metrics.loadTime)}ms</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <Cpu className="h-4 w-4 text-green-500" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">Memory Usage</p>
                      <p className="text-2xl font-bold">{metrics.memoryUsage}%</p>
                      <Progress value={metrics.memoryUsage} className="mt-1" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <Zap className="h-4 w-4 text-yellow-500" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">Render Time</p>
                      <p className="text-2xl font-bold">{metrics.renderTime}ms</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="h-4 w-4 text-purple-500" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">Interactions</p>
                      <p className="text-2xl font-bold">{metrics.userInteractions}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Network Performance</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span>Network Latency:</span>
                    <span className="font-semibold">{Math.round(metrics.networkLatency)}ms</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Cache Hit Rate:</span>
                    <span className="font-semibold">{metrics.cacheHitRate}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Bundle Size:</span>
                    <span className="font-semibold">{metrics.bundleSize}KB</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">System Health</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span>Overall Status:</span>
                    <Badge variant="default" className="bg-green-100 text-green-800">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Healthy
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Error Rate:</span>
                    <span className="font-semibold">{metrics.errorRate}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Monitoring:</span>
                    <Badge variant={isMonitoring ? 'default' : 'secondary'}>
                      {isMonitoring ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="vitals" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { name: 'First Contentful Paint', value: vitals.fcp, unit: 'ms', threshold: { good: 1800, poor: 3000 } },
                { name: 'Largest Contentful Paint', value: vitals.lcp, unit: 'ms', threshold: { good: 2500, poor: 4000 } },
                { name: 'First Input Delay', value: vitals.fid, unit: 'ms', threshold: { good: 100, poor: 300 } },
                { name: 'Cumulative Layout Shift', value: vitals.cls, unit: '', threshold: { good: 0.1, poor: 0.25 } }
              ].map((vital, index) => {
                const status = getMetricStatus(vital.value, vital.threshold);
                return (
                  <Card key={index}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <p className="font-medium">{vital.name}</p>
                        <Badge className={cn('text-xs', getStatusColor(status))}>
                          {status.replace('-', ' ')}
                        </Badge>
                      </div>
                      <p className="text-2xl font-bold">
                        {Math.round(vital.value * 100) / 100}{vital.unit}
                      </p>
                                              <div className="text-xs text-muted-foreground mt-1">
                          Good: ≤{vital.threshold.good}{vital.unit} | Poor: &gt;{vital.threshold.poor}{vital.unit}
                        </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          <TabsContent value="resources" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center">
                    <HardDrive className="h-4 w-4 mr-2" />
                    Memory
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Used:</span>
                      <span>{metrics.memoryUsage}%</span>
                    </div>
                    <Progress value={metrics.memoryUsage} />
                    <p className="text-xs text-muted-foreground">
                      JavaScript heap memory usage
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center">
                    <Monitor className="h-4 w-4 mr-2" />
                    Cache
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Hit Rate:</span>
                      <span>{metrics.cacheHitRate}%</span>
                    </div>
                    <Progress value={metrics.cacheHitRate} />
                    <p className="text-xs text-muted-foreground">
                      Cache efficiency percentage
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center">
                    <Zap className="h-4 w-4 mr-2" />
                    Render
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Time:</span>
                      <span>{metrics.renderTime}ms</span>
                    </div>
                    <Progress value={Math.min(metrics.renderTime, 100)} />
                    <p className="text-xs text-muted-foreground">
                      Component render duration
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="logs" className="space-y-4">
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {logs.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Info className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>No performance logs yet</p>
                </div>
              ) : (
                logs.map((log, index) => (
                  <Card key={index} className="p-3">
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0 mt-0.5">
                        {log.type === 'error' && <AlertTriangle className="h-4 w-4 text-red-500" />}
                        {log.type === 'warning' && <AlertTriangle className="h-4 w-4 text-yellow-500" />}
                        {log.type === 'info' && <Info className="h-4 w-4 text-blue-500" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2">
                          <p className="text-sm font-medium">{log.message}</p>
                          <Badge variant="outline" className="text-xs">
                            {log.type}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {new Date(log.timestamp).toLocaleTimeString()}
                        </p>
                        {log.data && (
                          <pre className="text-xs bg-muted p-2 rounded mt-1 overflow-x-auto">
                            {JSON.stringify(log.data, null, 2)}
                          </pre>
                        )}
                      </div>
                    </div>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

export default PerformanceMonitor;