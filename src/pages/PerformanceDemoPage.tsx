import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { EnhancedDashboardLayout } from '../components/layout/enhanced-dashboard-layout';
import { Card, CardHeader, CardTitle, CardContent, StatCard } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Icon } from '../components/ui/icon';
import { Loading } from '../components/ui/loading';
import { VirtualTable, VirtualColumnDef, generateLargeDataset } from '../components/ui/virtual-table';
import { cacheManager, httpCache } from '../lib/cache-manager';
import { bundleOptimizer } from '../lib/bundle-optimizer';
import {
  Database,
  Zap,
  Clock,
  HardDrive,
  Activity,
  TrendingUp,
  Eye,
  Edit,
  Trash2,
  Download,
  RefreshCw,
  Settings,
  BarChart3,
  Gauge,
  Timer,
  Cpu,
  Memory,
  Network
} from 'lucide-react';

interface ProjectData {
  id: string;
  name: string;
  company: string;
  location: string;
  status: string;
  budget: number;
  progress: number;
  startDate: string;
  manager: string;
  priority: number;
  risk: string;
  type: string;
  duration: number;
}

export default function PerformanceDemoPage() {
  const [selectedVariant, setSelectedVariant] = useState<'default' | 'tactical'>('default');
  const [dataSize, setDataSize] = useState(50000);
  const [data, setData] = useState<ProjectData[]>([]);
  const [loading, setLoading] = useState(false);
  const [cacheStats, setCacheStats] = useState<any>({});
  const [bundleMetrics, setBundleMetrics] = useState<any>({});
  const [performanceMetrics, setPerformanceMetrics] = useState({
    renderTime: 0,
    memoryUsage: 0,
    virtualizedRows: 0,
    totalRows: 0,
  });

  // Generate data with performance tracking
  const generateData = useCallback(async (size: number) => {
    setLoading(true);
    const startTime = performance.now();
    
    try {
      // Simulate async data generation
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const newData = generateLargeDataset(size);
      setData(newData);
      
      const endTime = performance.now();
      setPerformanceMetrics(prev => ({
        ...prev,
        renderTime: endTime - startTime,
        totalRows: size,
        virtualizedRows: Math.min(size, 50), // Estimate visible rows
      }));
      
      // Cache the generated data
      await cacheManager.set(`project-data-${size}`, newData, 1000 * 60 * 10); // 10 minutes
      
    } catch (error) {
      console.error('Data generation failed:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Load cached data or generate new
  const loadData = useCallback(async (size: number) => {
    const cacheKey = `project-data-${size}`;
    const cached = await cacheManager.get<ProjectData[]>(cacheKey);
    
    if (cached) {
      setData(cached);
      setPerformanceMetrics(prev => ({
        ...prev,
        renderTime: 0, // Instant from cache
        totalRows: size,
        virtualizedRows: Math.min(size, 50),
      }));
    } else {
      await generateData(size);
    }
  }, [generateData]);

  // Update cache stats
  const updateCacheStats = useCallback(async () => {
    const stats = cacheManager.getAnalytics();
    setCacheStats(stats);
  }, []);

  // Update bundle metrics
  const updateBundleMetrics = useCallback(() => {
    const metrics = bundleOptimizer.getMetrics();
    setBundleMetrics(metrics);
  }, []);

  // Initialize performance monitoring
  useEffect(() => {
    const interval = setInterval(() => {
      updateCacheStats();
      updateBundleMetrics();
      
      // Update memory usage if available
      if ('memory' in performance) {
        const memInfo = (performance as any).memory;
        setPerformanceMetrics(prev => ({
          ...prev,
          memoryUsage: memInfo.usedJSHeapSize,
        }));
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [updateCacheStats, updateBundleMetrics]);

  // Load initial data
  useEffect(() => {
    loadData(dataSize);
  }, [loadData, dataSize]);

  // Table columns configuration
  const columns: VirtualColumnDef<ProjectData>[] = useMemo(() => [
    {
      id: 'id',
      header: 'Project ID',
      accessorKey: 'id',
      width: 140,
      sortable: true,
      cell: (value) => (
        <span className="font-mono text-sm">{value}</span>
      ),
    },
    {
      id: 'name',
      header: 'Project Name',
      accessorKey: 'name',
      width: 200,
      sortable: true,
    },
    {
      id: 'company',
      header: 'Company',
      accessorKey: 'company',
      width: 160,
      sortable: true,
      filterable: true,
    },
    {
      id: 'location',
      header: 'Location',
      accessorKey: 'location',
      width: 140,
      sortable: true,
      filterable: true,
    },
    {
      id: 'status',
      header: 'Status',
      accessorKey: 'status',
      width: 120,
      sortable: true,
      filterable: true,
      cell: (value) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          value === 'Active' ? 'bg-green-100 text-green-800' :
          value === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
          value === 'Completed' ? 'bg-blue-100 text-blue-800' :
          'bg-gray-100 text-gray-800'
        }`}>
          {value}
        </span>
      ),
    },
    {
      id: 'budget',
      header: 'Budget',
      accessorKey: 'budget',
      width: 120,
      align: 'right',
      sortable: true,
      cell: (value) => `$${value.toLocaleString()}`,
    },
    {
      id: 'progress',
      header: 'Progress',
      accessorKey: 'progress',
      width: 140,
      sortable: true,
      cell: (value) => (
        <div className="flex items-center gap-2">
          <div className="flex-1 bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full"
              style={{ width: `${value}%` }}
            />
          </div>
          <span className="text-xs font-medium w-8">{value}%</span>
        </div>
      ),
    },
    {
      id: 'startDate',
      header: 'Start Date',
      accessorKey: 'startDate',
      width: 120,
      sortable: true,
    },
    {
      id: 'manager',
      header: 'Manager',
      accessorKey: 'manager',
      width: 140,
      sortable: true,
      filterable: true,
    },
    {
      id: 'priority',
      header: 'Priority',
      accessorKey: 'priority',
      width: 100,
      align: 'center',
      sortable: true,
      cell: (value) => (
        <div className="flex justify-center">
          {Array.from({ length: 5 }, (_, i) => (
            <span
              key={i}
              className={`text-sm ${
                i < value ? 'text-yellow-400' : 'text-gray-300'
              }`}
            >
              ★
            </span>
          ))}
        </div>
      ),
    },
    {
      id: 'risk',
      header: 'Risk',
      accessorKey: 'risk',
      width: 100,
      sortable: true,
      filterable: true,
      cell: (value) => (
        <span className={`px-2 py-1 rounded text-xs font-medium ${
          value === 'High' ? 'bg-red-100 text-red-800' :
          value === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
          'bg-green-100 text-green-800'
        }`}>
          {value}
        </span>
      ),
    },
    {
      id: 'type',
      header: 'Type',
      accessorKey: 'type',
      width: 120,
      sortable: true,
      filterable: true,
    },
  ], []);

  // Handle row actions
  const handleRowAction = useCallback((action: string, row: ProjectData) => {
    console.log(`${action} action for project:`, row.id);
    // Implement actual actions here
  }, []);

  // Render row actions
  const renderActions = useCallback((row: ProjectData) => (
    <div className="flex items-center gap-1">
      <Button
        variant="ghost"
        size="icon-sm"
        onClick={() => handleRowAction('view', row)}
      >
        <Icon icon={Eye} size="sm" />
      </Button>
      <Button
        variant="ghost"
        size="icon-sm"
        onClick={() => handleRowAction('edit', row)}
      >
        <Icon icon={Edit} size="sm" />
      </Button>
      <Button
        variant="ghost"
        size="icon-sm"
        onClick={() => handleRowAction('delete', row)}
      >
        <Icon icon={Trash2} size="sm" />
      </Button>
    </div>
  ), [handleRowAction]);

  // Format memory usage
  const formatMemory = (bytes: number): string => {
    if (bytes === 0) return '0 MB';
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(1)} MB`;
  };

  // Format cache hit rate
  const formatPercentage = (value: number): string => {
    return `${Math.round(value)}%`;
  };

  return (
    <EnhancedDashboardLayout
      title="Performance Demo"
      description="Showcase of virtual scrolling, caching, and optimization features"
      variant={selectedVariant}
      breadcrumbs={[
        { label: 'Dashboard', href: '/' },
        { label: 'Performance Demo' }
      ]}
      actions={
        <div className="flex items-center gap-2">
          <Button
            variant={selectedVariant === 'default' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedVariant('default')}
          >
            Default Theme
          </Button>
          <Button
            variant={selectedVariant === 'tactical' ? 'tactical' : 'outline'}
            size="sm"
            onClick={() => setSelectedVariant('tactical')}
          >
            Tactical Theme
          </Button>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Performance Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Render Time"
            value={`${performanceMetrics.renderTime.toFixed(1)}ms`}
            description="Time to render data"
            icon={<Icon icon={Timer} size="lg" variant={selectedVariant === 'tactical' ? 'tactical' : 'primary'} />}
            trend={{ value: 95, isPositive: true }}
          />
          
          <StatCard
            title="Memory Usage"
            value={formatMemory(performanceMetrics.memoryUsage)}
            description="Current JS heap size"
            icon={<Icon icon={Memory} size="lg" variant={selectedVariant === 'tactical' ? 'tactical' : 'primary'} />}
            trend={{ value: 12, isPositive: false }}
          />
          
          <StatCard
            title="Cache Hit Rate"
            value={formatPercentage(cacheStats.hitRate || 0)}
            description={`${cacheStats.hits || 0} hits, ${cacheStats.misses || 0} misses`}
            icon={<Icon icon={Database} size="lg" variant={selectedVariant === 'tactical' ? 'tactical' : 'primary'} />}
            trend={{ value: 23, isPositive: true }}
          />
          
          <StatCard
            title="Virtualized Rows"
            value={`${performanceMetrics.virtualizedRows}/${performanceMetrics.totalRows.toLocaleString()}`}
            description="Rendered vs total rows"
            icon={<Icon icon={BarChart3} size="lg" variant={selectedVariant === 'tactical' ? 'tactical' : 'primary'} />}
            trend={{ value: 99.8, isPositive: true }}
          />
        </div>

        {/* Controls */}
        <Card variant={selectedVariant === 'tactical' ? 'tactical' : 'elevated'}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Icon icon={Settings} size="sm" />
              Performance Controls
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Dataset Size</label>
                <div className="flex gap-2">
                  <Input
                    type="number"
                    value={dataSize}
                    onChange={(e) => setDataSize(Number(e.target.value))}
                    min={1000}
                    max={1000000}
                    step={1000}
                    className="flex-1"
                    variant={selectedVariant === 'tactical' ? 'tactical' : 'default'}
                  />
                  <Button
                    onClick={() => loadData(dataSize)}
                    disabled={loading}
                    variant={selectedVariant === 'tactical' ? 'tactical' : 'default'}
                    leftIcon={loading ? <Icon icon={RefreshCw} size="sm" animation="spin" /> : <Icon icon={Download} size="sm" />}
                  >
                    Load
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Cache Actions</label>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={updateCacheStats}
                    leftIcon={<Icon icon={RefreshCw} size="sm" />}
                  >
                    Refresh
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => cacheManager.clear()}
                    leftIcon={<Icon icon={Trash2} size="sm" />}
                  >
                    Clear Cache
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Performance</label>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => generateData(100000)}
                    leftIcon={<Icon icon={Zap} size="sm" />}
                  >
                    Stress Test
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => bundleOptimizer.cleanup()}
                    leftIcon={<Icon icon={HardDrive} size="sm" />}
                  >
                    Cleanup
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* System Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card variant={selectedVariant === 'tactical' ? 'tactical' : 'elevated'}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Icon icon={Database} size="sm" />
                Cache Statistics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span>Memory Usage:</span>
                  <span className="font-mono">{formatMemory(cacheStats.memoryUsage || 0)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Memory Entries:</span>
                  <span className="font-mono">{cacheStats.memoryEntries || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span>Cache Hits:</span>
                  <span className="font-mono text-green-600">{cacheStats.hits || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span>Cache Misses:</span>
                  <span className="font-mono text-red-600">{cacheStats.misses || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span>Evictions:</span>
                  <span className="font-mono">{cacheStats.evictions || 0}</span>
                </div>
                <div className="pt-2 border-t">
                  <div className="flex justify-between font-medium">
                    <span>Hit Rate:</span>
                    <span className={`font-mono ${
                      (cacheStats.hitRate || 0) > 80 ? 'text-green-600' :
                      (cacheStats.hitRate || 0) > 60 ? 'text-yellow-600' : 'text-red-600'
                    }`}>
                      {formatPercentage(cacheStats.hitRate || 0)}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card variant={selectedVariant === 'tactical' ? 'tactical' : 'elevated'}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Icon icon={Activity} size="sm" />
                Bundle Metrics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span>Bundle Size:</span>
                  <span className="font-mono">{formatMemory(bundleMetrics.bundleSize || 0)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Chunk Count:</span>
                  <span className="font-mono">{bundleMetrics.chunkCount || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span>Load Time:</span>
                  <span className="font-mono">{(bundleMetrics.loadTime || 0).toFixed(1)}ms</span>
                </div>
                <div className="flex justify-between">
                  <span>Images Optimized:</span>
                  <span className="font-mono">{bundleMetrics.imagesOptimized || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span>Dynamic Imports:</span>
                  <span className="font-mono">{bundleMetrics.dynamicImports || 0}</span>
                </div>
                <div className="pt-2 border-t">
                  <div className="flex justify-between font-medium">
                    <span>Compression:</span>
                    <span className="font-mono text-blue-600">
                      {formatPercentage(bundleMetrics.compressionRatio || 0)}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Virtual Table */}
        <Card variant={selectedVariant === 'tactical' ? 'tactical' : 'elevated'}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Icon icon={BarChart3} size="sm" />
              High-Performance Virtual Table
              <span className="ml-auto text-sm font-normal text-muted-foreground">
                {data.length.toLocaleString()} rows
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <div className="p-8">
                <Loading
                  type="themed"
                  text="Generating large dataset..."
                  variant={selectedVariant === 'tactical' ? 'tactical' : 'default'}
                />
              </div>
            ) : (
              <VirtualTable
                data={data}
                columns={columns}
                height={600}
                rowHeight={52}
                overscan={5}
                searchable={true}
                filterable={true}
                sortable={true}
                selectable={true}
                variant={selectedVariant}
                onRowClick={(row) => console.log('Row clicked:', row)}
                onRowsSelect={(rows) => console.log('Rows selected:', rows.length)}
                renderActions={renderActions}
                enableVirtualization={true}
              />
            )}
          </CardContent>
        </Card>

        {/* Performance Tips */}
        <Card variant={selectedVariant === 'tactical' ? 'tactical' : 'default'}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Icon icon={TrendingUp} size="sm" />
              Performance Features
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="space-y-2">
                <h4 className="font-medium flex items-center gap-2">
                  <Icon icon={Gauge} size="sm" variant="success" />
                  Virtual Scrolling
                </h4>
                <p className="text-sm text-muted-foreground">
                  Only renders visible rows, handles 1M+ records smoothly with constant performance.
                </p>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-medium flex items-center gap-2">
                  <Icon icon={Database} size="sm" variant="info" />
                  Smart Caching
                </h4>
                <p className="text-sm text-muted-foreground">
                  Multi-layer caching with memory, IndexedDB, and service worker for instant data access.
                </p>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-medium flex items-center gap-2">
                  <Icon icon={Network} size="sm" variant="warning" />
                  Bundle Optimization
                </h4>
                <p className="text-sm text-muted-foreground">
                  Dynamic imports, tree shaking, and image optimization for minimal bundle sizes.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </EnhancedDashboardLayout>
  );
}