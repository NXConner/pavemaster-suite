import { apiClient } from '@/shared/lib/api';
import type {
  DashboardFilter,
  GetDashboardDataResponse,
  DashboardMetric,
  DashboardChart,
  QuickAction
} from '../types';

class DashboardService {
  async getDashboardData(filters: DashboardFilter): Promise<GetDashboardDataResponse> {
    try {
      // In development, return mock data
      if (import.meta.env.DEV) {
        return this.getMockDashboardData();
      }

      const response = await apiClient.post<GetDashboardDataResponse>('/api/dashboard/data', {
        filters
      });

      return response.data;
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      throw new Error('Failed to fetch dashboard data');
    }
  }

  async exportData(filters: DashboardFilter, format: 'csv' | 'pdf' | 'excel'): Promise<void> {
    try {
      const response = await apiClient.post('/api/dashboard/export', {
        filters,
        format
      }, {
        headers: {
          'Accept': format === 'pdf' ? 'application/pdf' : 'application/octet-stream'
        }
      });

      // Create download link
      const blob = new Blob([response.data]);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `dashboard-export.${format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Failed to export dashboard data:', error);
      throw new Error('Failed to export dashboard data');
    }
  }

  private getMockDashboardData(): GetDashboardDataResponse {
    const metrics: DashboardMetric[] = [
      {
        id: '1',
        title: 'Active Projects',
        value: 12,
        unit: 'projects',
        change: 8.5,
        changeType: 'increase',
        icon: 'ClipboardList',
        color: 'blue',
        trend: [
          { date: '2024-01-01', value: 8 },
          { date: '2024-01-02', value: 10 },
          { date: '2024-01-03', value: 11 },
          { date: '2024-01-04', value: 12 }
        ]
      },
      {
        id: '2',
        title: 'Equipment Utilization',
        value: 87.5,
        unit: '%',
        change: 2.3,
        changeType: 'increase',
        icon: 'Truck',
        color: 'green',
        trend: [
          { date: '2024-01-01', value: 82 },
          { date: '2024-01-02', value: 85 },
          { date: '2024-01-03', value: 86 },
          { date: '2024-01-04', value: 87.5 }
        ]
      },
      {
        id: '3',
        title: 'Budget Efficiency',
        value: 94.2,
        unit: '%',
        change: -1.2,
        changeType: 'decrease',
        icon: 'DollarSign',
        color: 'orange',
        trend: [
          { date: '2024-01-01', value: 96 },
          { date: '2024-01-02', value: 95.5 },
          { date: '2024-01-03', value: 95 },
          { date: '2024-01-04', value: 94.2 }
        ]
      },
      {
        id: '4',
        title: 'Safety Incidents',
        value: 0,
        unit: 'incidents',
        change: 0,
        changeType: 'neutral',
        icon: 'Shield',
        color: 'green',
        trend: [
          { date: '2024-01-01', value: 0 },
          { date: '2024-01-02', value: 0 },
          { date: '2024-01-03', value: 0 },
          { date: '2024-01-04', value: 0 }
        ]
      },
      {
        id: '5',
        title: 'Team Productivity',
        value: 112,
        unit: 'points',
        change: 15.8,
        changeType: 'increase',
        icon: 'Users',
        color: 'purple',
        trend: [
          { date: '2024-01-01', value: 95 },
          { date: '2024-01-02', value: 103 },
          { date: '2024-01-03', value: 108 },
          { date: '2024-01-04', value: 112 }
        ]
      },
      {
        id: '6',
        title: 'Quality Score',
        value: 98.7,
        unit: '%',
        change: 3.2,
        changeType: 'increase',
        icon: 'Award',
        color: 'blue',
        trend: [
          { date: '2024-01-01', value: 95.5 },
          { date: '2024-01-02', value: 97.1 },
          { date: '2024-01-03', value: 98.2 },
          { date: '2024-01-04', value: 98.7 }
        ]
      }
    ];

    const charts: DashboardChart[] = [
      {
        id: '1',
        title: 'Project Progress Over Time',
        type: 'line',
        data: [
          { x: 'Jan', y: 65 },
          { x: 'Feb', y: 78 },
          { x: 'Mar', y: 82 },
          { x: 'Apr', y: 88 },
          { x: 'May', y: 94 },
          { x: 'Jun', y: 97 }
        ],
        config: {
          xAxis: { title: 'Month', type: 'category' },
          yAxis: { title: 'Completion %', type: 'value', format: '{value}%' },
          colors: ['#3b82f6'],
          legend: true,
          grid: true,
          responsive: true
        }
      },
      {
        id: '2',
        title: 'Equipment Usage by Type',
        type: 'bar',
        data: [
          { x: 'Excavators', y: 24 },
          { x: 'Dump Trucks', y: 18 },
          { x: 'Pavers', y: 12 },
          { x: 'Rollers', y: 16 },
          { x: 'Milling Machines', y: 8 }
        ],
        config: {
          xAxis: { title: 'Equipment Type', type: 'category' },
          yAxis: { title: 'Hours Used', type: 'value' },
          colors: ['#10b981'],
          legend: false,
          grid: true,
          responsive: true
        }
      },
      {
        id: '3',
        title: 'Budget Distribution',
        type: 'pie',
        data: [
          { x: 'Materials', y: 45, label: 'Materials (45%)' },
          { x: 'Labor', y: 30, label: 'Labor (30%)' },
          { x: 'Equipment', y: 15, label: 'Equipment (15%)' },
          { x: 'Overhead', y: 10, label: 'Overhead (10%)' }
        ],
        config: {
          xAxis: { title: '', type: 'category' },
          yAxis: { title: '', type: 'value' },
          colors: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444'],
          legend: true,
          grid: false,
          responsive: true
        }
      }
    ];

    const quickActions: QuickAction[] = [
      {
        id: '1',
        title: 'New Project',
        description: 'Create a new project',
        icon: 'Plus',
        route: '/projects/create',
        permissions: ['projects:create'],
        category: 'create'
      },
      {
        id: '2',
        title: 'Generate Report',
        description: 'Generate performance report',
        icon: 'FileText',
        route: '/reports/generate',
        permissions: ['reports:create'],
        category: 'report'
      },
      {
        id: '3',
        title: 'Manage Equipment',
        description: 'View and manage equipment',
        icon: 'Truck',
        route: '/equipment',
        permissions: ['equipment:read'],
        category: 'manage'
      },
      {
        id: '4',
        title: 'Analytics',
        description: 'View detailed analytics',
        icon: 'BarChart3',
        route: '/analytics',
        permissions: ['analytics:read'],
        category: 'analyze'
      }
    ];

    return {
      metrics,
      charts,
      quickActions,
      widgets: []
    };
  }
}

export const dashboardService = new DashboardService();