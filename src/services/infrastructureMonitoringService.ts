// PHASE 14: Infrastructure Monitoring and Auto-Scaling Service
// Comprehensive infrastructure monitoring, alerting, and auto-scaling capabilities

export interface InfrastructureNode {
  id: string;
  name: string;
  type: 'server' | 'container' | 'vm' | 'kubernetes_pod';
  status: 'healthy' | 'warning' | 'critical' | 'offline';
  region: string;
  zone: string;
  metrics: NodeMetrics;
  config: NodeConfig;
  lastSeen: string;
}

export interface NodeMetrics {
  cpu: { usage: number; cores: number; load: number[] };
  memory: { usage: number; total: number; available: number };
  disk: { usage: number; total: number; iops: number };
  network: { in: number; out: number; latency: number; errors: number };
  processes: number;
  uptime: number;
}

export interface NodeConfig {
  autoScaling: boolean;
  minInstances: number;
  maxInstances: number;
  targetCpuUtilization: number;
  targetMemoryUtilization: number;
  scaleUpCooldown: number;
  scaleDownCooldown: number;
}

export interface ScalingEvent {
  id: string;
  nodeId: string;
  action: 'scale_up' | 'scale_down';
  trigger: string;
  oldCapacity: number;
  newCapacity: number;
  timestamp: string;
  reason: string;
}

// PHASE 14: Infrastructure Monitoring Service Class
export class InfrastructureMonitoringService {
  private nodes: Map<string, InfrastructureNode> = new Map();
  private scalingEvents: ScalingEvent[] = [];
  private isInitialized: boolean = false;

  constructor() {
    this.initializeService();
  }

  // PHASE 14: Service Initialization
  private async initializeService(): Promise<void> {
    try {
      console.log('🏗️ Initializing Infrastructure Monitoring Service...');
      
      await this.setupDefaultNodes();
      await this.startMonitoring();
      
      this.isInitialized = true;
      console.log('✅ Infrastructure Monitoring Service initialized');
    } catch (error) {
      console.error('❌ Failed to initialize infrastructure monitoring service:', error);
      throw error;
    }
  }

  // PHASE 14: Setup Default Infrastructure Nodes
  private async setupDefaultNodes(): Promise<void> {
    const defaultNodes: InfrastructureNode[] = [
      {
        id: 'web-server-01',
        name: 'Web Server 01',
        type: 'server',
        status: 'healthy',
        region: 'us-west-2',
        zone: 'us-west-2a',
        metrics: {
          cpu: { usage: 45, cores: 4, load: [0.5, 0.6, 0.4] },
          memory: { usage: 8589934592, total: 17179869184, available: 8589934592 },
          disk: { usage: 21474836480, total: 107374182400, iops: 150 },
          network: { in: 1048576, out: 2097152, latency: 25, errors: 0 },
          processes: 127,
          uptime: 86400
        },
        config: {
          autoScaling: true,
          minInstances: 2,
          maxInstances: 10,
          targetCpuUtilization: 70,
          targetMemoryUtilization: 80,
          scaleUpCooldown: 300,
          scaleDownCooldown: 600
        },
        lastSeen: new Date().toISOString()
      },
      {
        id: 'db-server-01',
        name: 'Database Server 01',
        type: 'server',
        status: 'healthy',
        region: 'us-west-2',
        zone: 'us-west-2b',
        metrics: {
          cpu: { usage: 35, cores: 8, load: [0.3, 0.4, 0.35] },
          memory: { usage: 25769803776, total: 34359738368, available: 8589934592 },
          disk: { usage: 53687091200, total: 107374182400, iops: 300 },
          network: { in: 5242880, out: 3145728, latency: 15, errors: 0 },
          processes: 89,
          uptime: 172800
        },
        config: {
          autoScaling: false,
          minInstances: 1,
          maxInstances: 3,
          targetCpuUtilization: 80,
          targetMemoryUtilization: 85,
          scaleUpCooldown: 600,
          scaleDownCooldown: 1200
        },
        lastSeen: new Date().toISOString()
      }
    ];

    defaultNodes.forEach(node => {
      this.nodes.set(node.id, node);
    });

    console.log(`🏗️ Setup ${defaultNodes.length} infrastructure nodes`);
  }

  // PHASE 14: Start Monitoring
  private async startMonitoring(): Promise<void> {
    setInterval(async () => {
      await this.collectMetrics();
      await this.evaluateScaling();
    }, 30000); // Every 30 seconds

    console.log('📊 Started infrastructure monitoring');
  }

  // PHASE 14: Collect Metrics
  private async collectMetrics(): Promise<void> {
    for (const node of this.nodes.values()) {
      // Simulate metric updates
      node.metrics.cpu.usage = Math.max(10, Math.min(95, node.metrics.cpu.usage + (Math.random() - 0.5) * 10));
      node.metrics.memory.usage = Math.max(
        node.metrics.memory.total * 0.2,
        Math.min(
          node.metrics.memory.total * 0.9,
          node.metrics.memory.usage + (Math.random() - 0.5) * 1073741824
        )
      );
      node.lastSeen = new Date().toISOString();

      // Update status based on metrics
      if (node.metrics.cpu.usage > 90 || (node.metrics.memory.usage / node.metrics.memory.total) > 0.9) {
        node.status = 'critical';
      } else if (node.metrics.cpu.usage > 75 || (node.metrics.memory.usage / node.metrics.memory.total) > 0.8) {
        node.status = 'warning';
      } else {
        node.status = 'healthy';
      }
    }
  }

  // PHASE 14: Evaluate Auto-Scaling
  private async evaluateScaling(): Promise<void> {
    for (const node of this.nodes.values()) {
      if (!node.config.autoScaling) continue;

      const cpuUsage = node.metrics.cpu.usage;
      const memoryUsage = (node.metrics.memory.usage / node.metrics.memory.total) * 100;

      if (cpuUsage > node.config.targetCpuUtilization || memoryUsage > node.config.targetMemoryUtilization) {
        await this.triggerScaling(node.id, 'scale_up', 'High resource utilization');
      } else if (cpuUsage < node.config.targetCpuUtilization * 0.5 && memoryUsage < node.config.targetMemoryUtilization * 0.5) {
        await this.triggerScaling(node.id, 'scale_down', 'Low resource utilization');
      }
    }
  }

  // PHASE 14: Trigger Scaling
  private async triggerScaling(nodeId: string, action: 'scale_up' | 'scale_down', reason: string): Promise<void> {
    const node = this.nodes.get(nodeId);
    if (!node) return;

    const scalingEvent: ScalingEvent = {
      id: `scaling_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      nodeId,
      action,
      trigger: 'auto_scaling',
      oldCapacity: 1, // Simplified
      newCapacity: action === 'scale_up' ? 2 : 1,
      timestamp: new Date().toISOString(),
      reason
    };

    this.scalingEvents.push(scalingEvent);
    console.log(`⚖️ Scaling ${action} triggered for ${node.name}: ${reason}`);
  }

  // PHASE 14: Public API Methods
  async getInfrastructureOverview(): Promise<{
    totalNodes: number;
    healthyNodes: number;
    warningNodes: number;
    criticalNodes: number;
    avgCpuUsage: number;
    avgMemoryUsage: number;
  }> {
    const nodes = Array.from(this.nodes.values());
    const totalNodes = nodes.length;
    const healthyNodes = nodes.filter(n => n.status === 'healthy').length;
    const warningNodes = nodes.filter(n => n.status === 'warning').length;
    const criticalNodes = nodes.filter(n => n.status === 'critical').length;
    const avgCpuUsage = nodes.reduce((sum, n) => sum + n.metrics.cpu.usage, 0) / totalNodes;
    const avgMemoryUsage = nodes.reduce((sum, n) => sum + (n.metrics.memory.usage / n.metrics.memory.total) * 100, 0) / totalNodes;

    return {
      totalNodes,
      healthyNodes,
      warningNodes,
      criticalNodes,
      avgCpuUsage: Math.round(avgCpuUsage),
      avgMemoryUsage: Math.round(avgMemoryUsage)
    };
  }

  async getNodeMetrics(nodeId: string): Promise<InfrastructureNode | null> {
    return this.nodes.get(nodeId) || null;
  }

  async getScalingEvents(limit: number = 10): Promise<ScalingEvent[]> {
    return this.scalingEvents
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, limit);
  }

  async updateNodeConfig(nodeId: string, config: Partial<NodeConfig>): Promise<void> {
    const node = this.nodes.get(nodeId);
    if (!node) throw new Error(`Node ${nodeId} not found`);

    Object.assign(node.config, config);
    console.log(`⚙️ Updated configuration for ${node.name}`);
  }

  // PHASE 14: Cleanup
  async cleanup(): Promise<void> {
    console.log('🧹 Cleaning up Infrastructure Monitoring Service...');
    this.nodes.clear();
    this.scalingEvents.length = 0;
    console.log('✅ Infrastructure Monitoring Service cleanup completed');
  }
}

// PHASE 14: Export singleton instance
export const infrastructureMonitoringService = new InfrastructureMonitoringService();
export default infrastructureMonitoringService;