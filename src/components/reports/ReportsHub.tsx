import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { 
  BarChart3, 
  FileText, 
  TrendingUp, 
  Download, 
  Calendar,
  Filter,
  PieChart,
  LineChart,
  Users,
  DollarSign,
  Clock,
  CheckCircle
} from 'lucide-react';

interface Report {
  id: string;
  name: string;
  type: 'financial' | 'operational' | 'safety' | 'compliance' | 'custom';
  status: 'ready' | 'generating' | 'scheduled';
  lastGenerated?: Date;
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly' | 'manual';
  recipients: string[];
  description: string;
}

interface ReportMetric {
  name: string;
  value: string;
  trend: number;
  icon: any;
  color: string;
}

export default function ReportsHub() {
  const [reports, setReports] = useState<Report[]>([]);
  const [metrics, setMetrics] = useState<ReportMetric[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate fetching reports data
    const mockReports: Report[] = [
      {
        id: '1',
        name: 'Monthly Financial Summary',
        type: 'financial',
        status: 'ready',
        lastGenerated: new Date(Date.now() - 86400000), // Yesterday
        frequency: 'monthly',
        recipients: ['admin@company.com', 'finance@company.com'],
        description: 'Comprehensive financial overview including revenue, costs, and profitability'
      },
      {
        id: '2',
        name: 'Project Performance Report',
        type: 'operational',
        status: 'ready',
        lastGenerated: new Date(Date.now() - 172800000), // 2 days ago
        frequency: 'weekly',
        recipients: ['manager@company.com'],
        description: 'Weekly project status, milestones, and resource utilization'
      },
      {
        id: '3',
        name: 'Safety Incident Analysis',
        type: 'safety',
        status: 'generating',
        frequency: 'monthly',
        recipients: ['safety@company.com', 'hr@company.com'],
        description: 'Monthly safety performance and incident trend analysis'
      },
      {
        id: '4',
        name: 'Equipment Utilization Report',
        type: 'operational',
        status: 'scheduled',
        lastGenerated: new Date(Date.now() - 604800000), // 1 week ago
        frequency: 'weekly',
        recipients: ['operations@company.com'],
        description: 'Equipment usage statistics and maintenance scheduling'
      },
      {
        id: '5',
        name: 'Compliance Audit Report',
        type: 'compliance',
        status: 'ready',
        lastGenerated: new Date(Date.now() - 2592000000), // 1 month ago
        frequency: 'quarterly',
        recipients: ['legal@company.com', 'admin@company.com'],
        description: 'Quarterly compliance status and regulatory requirements'
      },
      {
        id: '6',
        name: 'Customer Satisfaction Survey',
        type: 'custom',
        status: 'ready',
        lastGenerated: new Date(Date.now() - 1209600000), // 2 weeks ago
        frequency: 'monthly',
        recipients: ['sales@company.com', 'manager@company.com'],
        description: 'Customer feedback analysis and satisfaction metrics'
      }
    ];

    const mockMetrics: ReportMetric[] = [
      {
        name: 'Reports Generated',
        value: '247',
        trend: 12,
        icon: FileText,
        color: 'text-blue-600'
      },
      {
        name: 'Automated Reports',
        value: '89%',
        trend: 5,
        icon: CheckCircle,
        color: 'text-green-600'
      },
      {
        name: 'Avg Generation Time',
        value: '2.3 min',
        trend: -15,
        icon: Clock,
        color: 'text-orange-600'
      },
      {
        name: 'Recipients Reached',
        value: '156',
        trend: 8,
        icon: Users,
        color: 'text-purple-600'
      }
    ];

    setReports(mockReports);
    setMetrics(mockMetrics);
    setLoading(false);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ready': return 'text-green-600 bg-green-50';
      case 'generating': return 'text-blue-600 bg-blue-50';
      case 'scheduled': return 'text-yellow-600 bg-yellow-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'financial': return 'text-green-600 bg-green-50';
      case 'operational': return 'text-blue-600 bg-blue-50';
      case 'safety': return 'text-red-600 bg-red-50';
      case 'compliance': return 'text-purple-600 bg-purple-50';
      case 'custom': return 'text-orange-600 bg-orange-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getFrequencyIcon = (frequency: string) => {
    switch (frequency) {
      case 'daily': return <Calendar className="h-3 w-3" />;
      case 'weekly': return <Calendar className="h-3 w-3" />;
      case 'monthly': return <Calendar className="h-3 w-3" />;
      case 'quarterly': return <Calendar className="h-3 w-3" />;
      case 'yearly': return <Calendar className="h-3 w-3" />;
      case 'manual': return <FileText className="h-3 w-3" />;
      default: return <Calendar className="h-3 w-3" />;
    }
  };

  const handleGenerateReport = (reportId: string) => {
    setReports(reports.map(report => 
      report.id === reportId 
        ? { ...report, status: 'generating' as const }
        : report
    ));

    // Simulate report generation
    setTimeout(() => {
      setReports(reports.map(report => 
        report.id === reportId 
          ? { ...report, status: 'ready' as const, lastGenerated: new Date() }
          : report
      ));
    }, 3000);
  };

  if (loading) {
    return <div className="flex items-center justify-center h-96">Loading reports...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Reports & Analytics</h1>
          <p className="text-muted-foreground">
            Generate and manage business reports and analytics
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2">
            <Filter className="h-4 w-4" />
            Filter
          </Button>
          <Button className="gap-2">
            <FileText className="h-4 w-4" />
            New Report
          </Button>
        </div>
      </div>

      {/* Metrics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((metric, index) => {
          const IconComponent = metric.icon;
          return (
            <Card key={index}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">{metric.name}</p>
                    <div className="flex items-center gap-2">
                      <p className="text-2xl font-bold">{metric.value}</p>
                      <div className={`flex items-center text-sm ${
                        metric.trend > 0 ? 'text-green-600' : 
                        metric.trend < 0 ? 'text-red-600' : 'text-gray-600'
                      }`}>
                        <TrendingUp className="h-3 w-3 mr-1" />
                        {Math.abs(metric.trend)}%
                      </div>
                    </div>
                  </div>
                  <IconComponent className={`h-8 w-8 ${metric.color}`} />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Reports Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {reports.map((report) => (
          <Card key={report.id}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge className={getTypeColor(report.type)}>
                    {report.type}
                  </Badge>
                  <Badge className={getStatusColor(report.status)}>
                    {report.status}
                  </Badge>
                </div>
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  {getFrequencyIcon(report.frequency)}
                  <span className="capitalize">{report.frequency}</span>
                </div>
              </div>
              <CardTitle className="text-lg">{report.name}</CardTitle>
              <CardDescription>{report.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {report.lastGenerated && (
                  <div className="text-sm text-muted-foreground">
                    Last generated: {report.lastGenerated.toLocaleString()}
                  </div>
                )}
                
                <div className="text-sm">
                  <p className="font-medium mb-1">Recipients:</p>
                  <div className="flex flex-wrap gap-1">
                    {report.recipients.slice(0, 2).map((recipient, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {recipient.split('@')[0]}
                      </Badge>
                    ))}
                    {report.recipients.length > 2 && (
                      <Badge variant="outline" className="text-xs">
                        +{report.recipients.length - 2} more
                      </Badge>
                    )}
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="flex-1"
                    onClick={() => handleGenerateReport(report.id)}
                    disabled={report.status === 'generating'}
                  >
                    {report.status === 'generating' ? (
                      <>
                        <Clock className="h-3 w-3 mr-1 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <BarChart3 className="h-3 w-3 mr-1" />
                        Generate
                      </>
                    )}
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="flex-1"
                    disabled={report.status !== 'ready'}
                  >
                    <Download className="h-3 w-3 mr-1" />
                    Download
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="h-5 w-5" />
              Report Types Distribution
            </CardTitle>
            <CardDescription>
              Breakdown of report categories
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {['financial', 'operational', 'safety', 'compliance', 'custom'].map((type) => {
                const count = reports.filter(r => r.type === type).length;
                const percentage = Math.round((count / reports.length) * 100);
                return (
                  <div key={type} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${getTypeColor(type).split(' ')[0]}`} />
                      <span className="capitalize">{type}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">{count}</span>
                      <span className="text-sm font-medium">{percentage}%</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <LineChart className="h-5 w-5" />
              Generation Frequency
            </CardTitle>
            <CardDescription>
              Report automation and scheduling
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {['daily', 'weekly', 'monthly', 'quarterly', 'yearly', 'manual'].map((frequency) => {
                const count = reports.filter(r => r.frequency === frequency).length;
                const percentage = count > 0 ? Math.round((count / reports.length) * 100) : 0;
                return (
                  <div key={frequency} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {getFrequencyIcon(frequency)}
                      <span className="capitalize">{frequency}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">{count}</span>
                      <span className="text-sm font-medium">{percentage}%</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}