import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { ScrollArea } from '../ui/scroll-area';
import { 
  FileText, 
  Calendar, 
  Download, 
  Filter,
  TrendingUp,
  DollarSign,
  Clock,
  BarChart3,
  PieChart,
  Activity,
  Target,
  CheckCircle
} from 'lucide-react';

interface ReportTemplate {
  id: string;
  name: string;
  description: string;
  category: 'financial' | 'operational' | 'compliance' | 'analytics';
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly';
  lastGenerated: Date;
  status: 'active' | 'draft' | 'archived';
}

interface GeneratedReport {
  id: string;
  templateId: string;
  name: string;
  generatedAt: Date;
  format: 'pdf' | 'excel' | 'csv';
  size: string;
  downloadCount: number;
}

const MOCK_TEMPLATES: ReportTemplate[] = [
  {
    id: '1',
    name: 'Monthly Financial Summary',
    description: 'Complete financial overview with revenue, expenses, and profitability analysis',
    category: 'financial',
    frequency: 'monthly',
    lastGenerated: new Date(Date.now() - 86400000 * 5),
    status: 'active'
  },
  {
    id: '2',
    name: 'Project Performance Dashboard',
    description: 'Operational metrics, completion rates, and resource utilization',
    category: 'operational',
    frequency: 'weekly',
    lastGenerated: new Date(Date.now() - 86400000 * 2),
    status: 'active'
  },
  {
    id: '3',
    name: 'Safety Compliance Report',
    description: 'Safety incidents, training records, and compliance status',
    category: 'compliance',
    frequency: 'monthly',
    lastGenerated: new Date(Date.now() - 86400000 * 15),
    status: 'active'
  },
  {
    id: '4',
    name: 'Customer Analytics',
    description: 'Customer acquisition, retention, and satisfaction metrics',
    category: 'analytics',
    frequency: 'quarterly',
    lastGenerated: new Date(Date.now() - 86400000 * 30),
    status: 'active'
  }
];

const MOCK_REPORTS: GeneratedReport[] = [
  {
    id: '1',
    templateId: '1',
    name: 'Financial Summary - November 2024',
    generatedAt: new Date(Date.now() - 86400000 * 2),
    format: 'pdf',
    size: '2.4 MB',
    downloadCount: 12
  },
  {
    id: '2',
    templateId: '2',
    name: 'Project Performance - Week 47',
    generatedAt: new Date(Date.now() - 86400000 * 1),
    format: 'excel',
    size: '1.8 MB',
    downloadCount: 8
  },
  {
    id: '3',
    templateId: '3',
    name: 'Safety Compliance - October 2024',
    generatedAt: new Date(Date.now() - 86400000 * 15),
    format: 'pdf',
    size: '3.1 MB',
    downloadCount: 5
  }
];

export function AdvancedReportingSystem() {
  const [templates] = useState<ReportTemplate[]>(MOCK_TEMPLATES);
  const [reports] = useState<GeneratedReport[]>(MOCK_REPORTS);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isGenerating, setIsGenerating] = useState<string | null>(null);

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'financial': return <DollarSign className="h-4 w-4 text-green-500" />;
      case 'operational': return <Activity className="h-4 w-4 text-blue-500" />;
      case 'compliance': return <CheckCircle className="h-4 w-4 text-purple-500" />;
      case 'analytics': return <BarChart3 className="h-4 w-4 text-orange-500" />;
      default: return <FileText className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getFormatIcon = (format: string) => {
    switch (format) {
      case 'pdf': return <FileText className="h-4 w-4 text-red-500" />;
      case 'excel': return <BarChart3 className="h-4 w-4 text-green-500" />;
      case 'csv': return <FileText className="h-4 w-4 text-blue-500" />;
      default: return <FileText className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'default';
      case 'draft': return 'secondary';
      case 'archived': return 'outline';
      default: return 'outline';
    }
  };

  const handleGenerateReport = async (templateId: string) => {
    setIsGenerating(templateId);
    // Simulate report generation
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsGenerating(null);
  };

  const filteredTemplates = selectedCategory === 'all' 
    ? templates 
    : templates.filter(t => t.category === selectedCategory);

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="border-border/50 bg-surface/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            Advanced Reporting System
            <Badge variant="outline" className="ml-2">
              {templates.filter(t => t.status === 'active').length} Active Templates
            </Badge>
          </CardTitle>
        </CardHeader>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-border/50 bg-surface/80 backdrop-blur-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-500/10">
                <FileText className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <div className="text-sm font-medium">Total Reports</div>
                <div className="text-2xl font-bold">{reports.length}</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-border/50 bg-surface/80 backdrop-blur-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-500/10">
                <TrendingUp className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <div className="text-sm font-medium">This Month</div>
                <div className="text-2xl font-bold">24</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-border/50 bg-surface/80 backdrop-blur-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-orange-500/10">
                <Download className="h-5 w-5 text-orange-500" />
              </div>
              <div>
                <div className="text-sm font-medium">Downloads</div>
                <div className="text-2xl font-bold">
                  {reports.reduce((sum, r) => sum + r.downloadCount, 0)}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-border/50 bg-surface/80 backdrop-blur-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-500/10">
                <Target className="h-5 w-5 text-purple-500" />
              </div>
              <div>
                <div className="text-sm font-medium">Automation</div>
                <div className="text-2xl font-bold">87%</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 overflow-x-auto">
        {['all', 'financial', 'operational', 'compliance', 'analytics'].map((category) => (
          <Button
            key={category}
            variant={selectedCategory === category ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedCategory(category)}
            className="whitespace-nowrap"
          >
            <Filter className="h-3 w-3 mr-1" />
            {category.charAt(0).toUpperCase() + category.slice(1)}
          </Button>
        ))}
      </div>

      {/* Report Templates */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-border/50 bg-surface/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="h-5 w-5 text-primary" />
              Report Templates
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-96">
              <div className="space-y-3">
                {filteredTemplates.map((template) => (
                  <div
                    key={template.id}
                    className="p-4 rounded-lg border border-border/50 bg-surface/30"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        {getCategoryIcon(template.category)}
                        <span className="font-medium text-sm">{template.name}</span>
                      </div>
                      <Badge variant={getStatusColor(template.status)} className="text-xs">
                        {template.status}
                      </Badge>
                    </div>
                    
                    <p className="text-xs text-muted-foreground mb-3">
                      {template.description}
                    </p>
                    
                    <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        <span>Frequency: {template.frequency}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        <span>Last: {template.lastGenerated.toLocaleDateString()}</span>
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => handleGenerateReport(template.id)}
                        disabled={isGenerating === template.id}
                        className="flex-1"
                      >
                        {isGenerating === template.id ? 'Generating...' : 'Generate Now'}
                      </Button>
                      <Button size="sm" variant="outline">
                        Configure
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Generated Reports */}
        <Card className="border-border/50 bg-surface/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Download className="h-5 w-5 text-primary" />
              Generated Reports
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-96">
              <div className="space-y-3">
                {reports.map((report) => {
                  
                  return (
                    <div
                      key={report.id}
                      className="p-4 rounded-lg border border-border/50 bg-surface/30"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          {getFormatIcon(report.format)}
                          <span className="font-medium text-sm">{report.name}</span>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {report.format.toUpperCase()}
                        </Badge>
                      </div>
                      
                      <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
                        <span>Generated: {report.generatedAt.toLocaleString()}</span>
                        <span>Size: {report.size}</span>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Download className="h-3 w-3" />
                          <span>{report.downloadCount} downloads</span>
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline">
                            Preview
                          </Button>
                          <Button size="sm">
                            Download
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      {/* Report Analytics */}
      <Card className="border-border/50 bg-surface/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-primary" />
            Report Usage Analytics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-4">
              <h4 className="font-medium">Most Generated</h4>
              <div className="space-y-2">
                {templates.slice(0, 3).map((template, index) => (
                  <div key={template.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono w-4">#{index + 1}</span>
                      <span className="text-sm">{template.name}</span>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {Math.floor(Math.random() * 50) + 10}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="space-y-4">
              <h4 className="font-medium">Download Trends</h4>
              <div className="h-32 flex items-end justify-between gap-1">
                {Array.from({ length: 7 }).map((_, index) => {
                  const height = Math.random() * 80 + 20;
                  return (
                    <div key={index} className="flex-1 bg-muted rounded-t-sm relative">
                      <div 
                        className="bg-primary rounded-t-sm transition-all duration-300"
                        style={{ height: `${height}%` }}
                      />
                    </div>
                  );
                })}
              </div>
              <div className="text-xs text-muted-foreground text-center">
                Last 7 days
              </div>
            </div>
            
            <div className="space-y-4">
              <h4 className="font-medium">Format Distribution</h4>
              <div className="space-y-2">
                {[
                  { format: 'PDF', percentage: 65, color: 'bg-red-500' },
                  { format: 'Excel', percentage: 25, color: 'bg-green-500' },
                  { format: 'CSV', percentage: 10, color: 'bg-blue-500' }
                ].map((item) => (
                  <div key={item.format} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span>{item.format}</span>
                      <span>{item.percentage}%</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${item.color} transition-all duration-300`}
                        style={{ width: `${item.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}