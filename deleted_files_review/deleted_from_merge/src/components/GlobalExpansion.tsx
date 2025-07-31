import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area } from 'recharts';
import {
  Globe,
  MapPin,
  Languages,
  Scale,
  DollarSign,
  TrendingUp,
  Users,
  Building,
  Award,
  FileText,
  Settings,
  CheckCircle,
  AlertTriangle,
  Clock,
  Target,
  BarChart3,
  Flag,
  Shield,
  Briefcase,
  Truck,
  Factory,
  Landmark,
  BookOpen,
  Calendar,
  Phone,
  Mail,
  ExternalLink
} from 'lucide-react';

// International expansion interfaces
interface MarketRegion {
  id: string;
  name: string;
  code: string;
  flag: string;
  currency: string;
  language: string;
  status: 'researching' | 'planning' | 'entering' | 'active' | 'optimizing';
  marketSize: number;
  growthRate: number;
  competitionLevel: 'low' | 'medium' | 'high';
  regulatoryComplexity: 'simple' | 'moderate' | 'complex';
  entryBarriers: string[];
  opportunities: string[];
  localPartners: LocalPartner[];
  compliance: ComplianceRequirement[];
  timeline: MarketEntryTimeline;
}

interface LocalPartner {
  id: string;
  name: string;
  type: 'distributor' | 'contractor' | 'consultant' | 'technology' | 'regulatory';
  status: 'prospective' | 'negotiating' | 'active' | 'terminated';
  capabilities: string[];
  coverage: string[];
  contact: {
    name: string;
    email: string;
    phone: string;
    address: string;
  };
  agreement: {
    type: string;
    startDate: string;
    endDate: string;
    terms: string[];
  };
}

interface ComplianceRequirement {
  id: string;
  category: 'environmental' | 'safety' | 'quality' | 'data' | 'tax' | 'employment';
  requirement: string;
  authority: string;
  status: 'pending' | 'in_progress' | 'compliant' | 'non_compliant';
  deadline: string;
  documents: string[];
  cost: number;
  complexity: 'low' | 'medium' | 'high';
}

interface MarketEntryTimeline {
  phases: {
    name: string;
    startDate: string;
    endDate: string;
    status: 'upcoming' | 'in_progress' | 'completed' | 'delayed';
    milestones: {
      name: string;
      dueDate: string;
      completed: boolean;
      responsible: string;
    }[];
  }[];
}

interface InternationalStandard {
  id: string;
  name: string;
  organization: string;
  category: 'quality' | 'environmental' | 'safety' | 'management' | 'technical';
  applicableRegions: string[];
  status: 'not_started' | 'in_progress' | 'certified' | 'expired';
  certificationDate?: string;
  expiryDate?: string;
  cost: number;
  benefits: string[];
  requirements: string[];
}

interface GlobalOperations {
  regions: MarketRegion[];
  standards: InternationalStandard[];
  metrics: {
    totalMarkets: number;
    activeMarkets: number;
    plannedMarkets: number;
    certifications: number;
    globalRevenue: number;
    internationalGrowth: number;
  };
}

export default function GlobalExpansion() {
  // State management
  const [operations, setOperations] = useState<GlobalOperations | null>(null);
  const [selectedRegion, setSelectedRegion] = useState<string>('all');
  const [activeTab, setActiveTab] = useState('overview');
  const [viewMode, setViewMode] = useState<'regions' | 'standards' | 'compliance'>('regions');

  // Load data
  useEffect(() => {
    loadGlobalOperationsData();
  }, []);

  const loadGlobalOperationsData = () => {
    // Mock data for comprehensive global expansion
    setOperations({
      regions: [
        {
          id: 'ca',
          name: 'Canada',
          code: 'CA',
          flag: '🇨🇦',
          currency: 'CAD',
          language: 'English/French',
          status: 'active',
          marketSize: 45000000,
          growthRate: 3.2,
          competitionLevel: 'medium',
          regulatoryComplexity: 'moderate',
          entryBarriers: ['Provincial licensing', 'Bilingual requirements', 'Environmental regulations'],
          opportunities: ['Infrastructure investment', 'Green technology adoption', 'Government contracts'],
          localPartners: [
            {
              id: 'partner-ca-1',
              name: 'Northern Construction Partners',
              type: 'contractor',
              status: 'active',
              capabilities: ['Highway construction', 'Municipal contracts', 'Equipment rental'],
              coverage: ['Ontario', 'Quebec', 'British Columbia'],
              contact: {
                name: 'Jean-Pierre Dubois',
                email: 'jp.dubois@northerncp.ca',
                phone: '+1-416-555-0123',
                address: '123 Maple Street, Toronto, ON M5V 3A8'
              },
              agreement: {
                type: 'Distribution Agreement',
                startDate: '2024-01-15',
                endDate: '2027-01-15',
                terms: ['Exclusive territory rights', 'Minimum purchase requirements', 'Technical support']
              }
            }
          ],
          compliance: [
            {
              id: 'comp-ca-1',
              category: 'environmental',
              requirement: 'Environmental Assessment Compliance',
              authority: 'Environment and Climate Change Canada',
              status: 'compliant',
              deadline: '2024-12-31',
              documents: ['Environmental Impact Assessment', 'Emission Reports'],
              cost: 15000,
              complexity: 'medium'
            }
          ],
          timeline: {
            phases: [
              {
                name: 'Market Research',
                startDate: '2023-06-01',
                endDate: '2023-09-30',
                status: 'completed',
                milestones: [
                  { name: 'Market Analysis Complete', dueDate: '2023-07-15', completed: true, responsible: 'Market Research Team' },
                  { name: 'Competitor Analysis', dueDate: '2023-08-15', completed: true, responsible: 'Business Intelligence' }
                ]
              },
              {
                name: 'Regulatory Approval',
                startDate: '2023-10-01',
                endDate: '2024-01-31',
                status: 'completed',
                milestones: [
                  { name: 'Provincial Licensing', dueDate: '2023-12-01', completed: true, responsible: 'Legal Team' },
                  { name: 'Environmental Permits', dueDate: '2024-01-15', completed: true, responsible: 'Compliance Officer' }
                ]
              }
            ]
          }
        },
        {
          id: 'uk',
          name: 'United Kingdom',
          code: 'GB',
          flag: '🇬🇧',
          currency: 'GBP',
          language: 'English',
          status: 'planning',
          marketSize: 67000000,
          growthRate: 1.8,
          competitionLevel: 'high',
          regulatoryComplexity: 'complex',
          entryBarriers: ['Brexit regulations', 'UK-specific standards', 'Established competition'],
          opportunities: ['Infrastructure upgrade', 'Smart city initiatives', 'Sustainability focus'],
          localPartners: [
            {
              id: 'partner-uk-1',
              name: 'British Infrastructure Solutions',
              type: 'consultant',
              status: 'negotiating',
              capabilities: ['Regulatory consulting', 'Market entry strategy', 'Government relations'],
              coverage: ['England', 'Scotland', 'Wales'],
              contact: {
                name: 'Sir William Thompson',
                email: 'w.thompson@bis-uk.co.uk',
                phone: '+44-20-7123-4567',
                address: '45 King\'s Road, London SW3 4ND'
              },
              agreement: {
                type: 'Consulting Agreement',
                startDate: '2024-03-01',
                endDate: '2025-03-01',
                terms: ['Market entry guidance', 'Regulatory navigation', 'Partner identification']
              }
            }
          ],
          compliance: [
            {
              id: 'comp-uk-1',
              category: 'data',
              requirement: 'UK GDPR Compliance',
              authority: 'Information Commissioner\'s Office',
              status: 'in_progress',
              deadline: '2024-06-01',
              documents: ['Data Protection Impact Assessment', 'Privacy Policy'],
              cost: 25000,
              complexity: 'high'
            }
          ],
          timeline: {
            phases: [
              {
                name: 'Market Entry Planning',
                startDate: '2024-02-01',
                endDate: '2024-05-31',
                status: 'in_progress',
                milestones: [
                  { name: 'Regulatory Assessment', dueDate: '2024-03-15', completed: false, responsible: 'Legal Team' },
                  { name: 'Partner Selection', dueDate: '2024-04-30', completed: false, responsible: 'Business Development' }
                ]
              }
            ]
          }
        },
        {
          id: 'au',
          name: 'Australia',
          code: 'AU',
          flag: '🇦🇺',
          currency: 'AUD',
          language: 'English',
          status: 'researching',
          marketSize: 26000000,
          growthRate: 2.3,
          competitionLevel: 'medium',
          regulatoryComplexity: 'moderate',
          entryBarriers: ['Distance/logistics', 'Local standards', 'Worker regulations'],
          opportunities: ['Mining industry', 'Urban development', 'Remote project capability'],
          localPartners: [],
          compliance: [],
          timeline: {
            phases: [
              {
                name: 'Initial Research',
                startDate: '2024-03-01',
                endDate: '2024-06-30',
                status: 'upcoming',
                milestones: [
                  { name: 'Market Feasibility Study', dueDate: '2024-04-15', completed: false, responsible: 'Strategy Team' },
                  { name: 'Regulatory Research', dueDate: '2024-05-30', completed: false, responsible: 'Compliance Team' }
                ]
              }
            ]
          }
        }
      ],
      standards: [
        {
          id: 'iso-9001',
          name: 'ISO 9001:2015 Quality Management',
          organization: 'International Organization for Standardization',
          category: 'quality',
          applicableRegions: ['Global'],
          status: 'certified',
          certificationDate: '2023-06-15',
          expiryDate: '2026-06-15',
          cost: 45000,
          benefits: ['Global recognition', 'Process improvement', 'Customer confidence'],
          requirements: ['Quality management system', 'Regular audits', 'Continuous improvement']
        },
        {
          id: 'iso-14001',
          name: 'ISO 14001:2015 Environmental Management',
          organization: 'International Organization for Standardization',
          category: 'environmental',
          applicableRegions: ['Global'],
          status: 'in_progress',
          cost: 35000,
          benefits: ['Environmental compliance', 'Risk reduction', 'Market access'],
          requirements: ['Environmental policy', 'Impact assessment', 'Management system']
        },
        {
          id: 'iso-45001',
          name: 'ISO 45001:2018 Occupational Health & Safety',
          organization: 'International Organization for Standardization',
          category: 'safety',
          applicableRegions: ['Global'],
          status: 'not_started',
          cost: 40000,
          benefits: ['Worker safety', 'Legal compliance', 'Insurance benefits'],
          requirements: ['Safety management system', 'Risk assessment', 'Training programs']
        }
      ],
      metrics: {
        totalMarkets: 3,
        activeMarkets: 1,
        plannedMarkets: 2,
        certifications: 1,
        globalRevenue: 2450000,
        internationalGrowth: 18.5
      }
    });
  };

  // Helper functions
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': case 'certified': case 'compliant': case 'completed': return 'text-green-600';
      case 'planning': case 'in_progress': case 'negotiating': return 'text-blue-600';
      case 'researching': case 'upcoming': case 'not_started': return 'text-gray-600';
      case 'delayed': case 'non_compliant': case 'expired': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusBadge = (status: string) => {
    const colors = {
      active: 'bg-green-500',
      planning: 'bg-blue-500',
      researching: 'bg-gray-500',
      entering: 'bg-yellow-500',
      optimizing: 'bg-purple-500',
      certified: 'bg-green-500',
      in_progress: 'bg-blue-500',
      not_started: 'bg-gray-500',
      expired: 'bg-red-500',
      compliant: 'bg-green-500',
      non_compliant: 'bg-red-500',
      pending: 'bg-yellow-500'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-500';
  };

  const getComplexityColor = (complexity: string) => {
    switch (complexity) {
      case 'simple': case 'low': return 'text-green-600';
      case 'moderate': case 'medium': return 'text-yellow-600';
      case 'complex': case 'high': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  if (!operations) {
    return <div>Loading global expansion data...</div>;
  }

  // Chart data
  const marketSizeData = operations.regions.map(region => ({
    name: region.name,
    size: region.marketSize / 1000000,
    growth: region.growthRate,
    status: region.status
  }));

  const complianceStatusData = [
    { name: 'Compliant', value: 8, color: '#22c55e' },
    { name: 'In Progress', value: 5, color: '#3b82f6' },
    { name: 'Pending', value: 3, color: '#eab308' },
    { name: 'Non-Compliant', value: 1, color: '#ef4444' }
  ];

  const standardsProgressData = operations.standards.map(standard => ({
    name: standard.name.split(':')[0],
    progress: standard.status === 'certified' ? 100 : 
             standard.status === 'in_progress' ? 65 : 
             standard.status === 'not_started' ? 0 : 50,
    category: standard.category
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Globe className="h-8 w-8 text-blue-600" />
            Global Market Expansion
          </h1>
          <p className="text-muted-foreground mt-1">
            International operations, compliance, and market entry management
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={viewMode} onValueChange={(value: any) => setViewMode(value)}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="regions">Regions</SelectItem>
              <SelectItem value="standards">Standards</SelectItem>
              <SelectItem value="compliance">Compliance</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">
            <Settings className="h-4 w-4 mr-2" />
            Configure
          </Button>
        </div>
      </div>

      {/* Global Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Markets</CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{operations.metrics.totalMarkets}</div>
            <div className="text-xs text-muted-foreground">
              {operations.metrics.activeMarkets} active
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Certifications</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{operations.metrics.certifications}</div>
            <div className="text-xs text-muted-foreground">
              of {operations.standards.length} standards
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Global Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${(operations.metrics.globalRevenue / 1000000).toFixed(1)}M</div>
            <div className="text-xs text-muted-foreground">
              <TrendingUp className="inline h-3 w-3 mr-1" />
              +{operations.metrics.internationalGrowth}% YoY
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Local Partners</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {operations.regions.reduce((acc, region) => acc + region.localPartners.length, 0)}
            </div>
            <div className="text-xs text-muted-foreground">
              Across all regions
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Compliance Rate</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">94%</div>
            <div className="text-xs text-muted-foreground">
              Regulatory compliance
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Market Growth</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">2.4%</div>
            <div className="text-xs text-muted-foreground">
              Average market growth
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="regions">Market Regions</TabsTrigger>
          <TabsTrigger value="standards">International Standards</TabsTrigger>
          <TabsTrigger value="compliance">Compliance</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Charts */}
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Market Size & Growth</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={marketSizeData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="size" fill="#3b82f6" name="Market Size (M)" />
                    <Bar dataKey="growth" fill="#10b981" name="Growth Rate %" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Compliance Status Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={complianceStatusData}
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      dataKey="value"
                      label={({ name, value }) => `${name}: ${value}`}
                    >
                      {complianceStatusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activities */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Global Activities</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-3 border rounded-lg">
                  <Flag className="h-5 w-5 text-green-600" />
                  <div className="flex-1">
                    <p className="font-medium">Canada Market Entry Completed</p>
                    <p className="text-sm text-muted-foreground">Successfully launched operations in Ontario and Quebec</p>
                  </div>
                  <Badge className="bg-green-500">Completed</Badge>
                </div>
                <div className="flex items-center gap-3 p-3 border rounded-lg">
                  <Award className="h-5 w-5 text-blue-600" />
                  <div className="flex-1">
                    <p className="font-medium">ISO 9001 Certification Renewed</p>
                    <p className="text-sm text-muted-foreground">Quality management certification valid until 2026</p>
                  </div>
                  <Badge className="bg-blue-500">Active</Badge>
                </div>
                <div className="flex items-center gap-3 p-3 border rounded-lg">
                  <Users className="h-5 w-5 text-yellow-600" />
                  <div className="flex-1">
                    <p className="font-medium">UK Partner Negotiations</p>
                    <p className="text-sm text-muted-foreground">Finalizing agreement with British Infrastructure Solutions</p>
                  </div>
                  <Badge className="bg-yellow-500">In Progress</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="regions" className="space-y-6">
          <div className="space-y-4">
            {operations.regions.map((region) => (
              <Card key={region.id} className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{region.flag}</span>
                    <div>
                      <h3 className="text-xl font-semibold">{region.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {region.language} • {region.currency} • {(region.marketSize / 1000000).toFixed(1)}M population
                      </p>
                    </div>
                  </div>
                  <Badge className={getStatusBadge(region.status)}>{region.status}</Badge>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div>
                    <div className="text-sm text-muted-foreground">Growth Rate</div>
                    <div className="font-medium text-green-600">{region.growthRate}%</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Competition</div>
                    <div className={`font-medium ${getComplexityColor(region.competitionLevel)}`}>
                      {region.competitionLevel}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Regulatory</div>
                    <div className={`font-medium ${getComplexityColor(region.regulatoryComplexity)}`}>
                      {region.regulatoryComplexity}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Partners</div>
                    <div className="font-medium">{region.localPartners.length}</div>
                  </div>
                </div>

                <Tabs defaultValue="overview" className="w-full">
                  <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="partners">Partners</TabsTrigger>
                    <TabsTrigger value="compliance">Compliance</TabsTrigger>
                    <TabsTrigger value="timeline">Timeline</TabsTrigger>
                  </TabsList>

                  <TabsContent value="overview" className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-medium mb-2">Entry Barriers</h4>
                        <ul className="space-y-1">
                          {region.entryBarriers.map((barrier, index) => (
                            <li key={index} className="flex items-center gap-2 text-sm">
                              <AlertTriangle className="h-4 w-4 text-orange-500" />
                              {barrier}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-medium mb-2">Opportunities</h4>
                        <ul className="space-y-1">
                          {region.opportunities.map((opportunity, index) => (
                            <li key={index} className="flex items-center gap-2 text-sm">
                              <Target className="h-4 w-4 text-green-500" />
                              {opportunity}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="partners" className="space-y-4">
                    {region.localPartners.length > 0 ? (
                      region.localPartners.map((partner) => (
                        <div key={partner.id} className="border rounded-lg p-4">
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <h5 className="font-medium">{partner.name}</h5>
                              <p className="text-sm text-muted-foreground capitalize">{partner.type}</p>
                            </div>
                            <Badge className={getStatusBadge(partner.status)}>{partner.status}</Badge>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                            <div>
                              <p className="font-medium">Capabilities:</p>
                              <ul className="list-disc list-inside mt-1">
                                {partner.capabilities.map((cap, index) => (
                                  <li key={index}>{cap}</li>
                                ))}
                              </ul>
                            </div>
                            <div>
                              <p className="font-medium">Contact:</p>
                              <p>{partner.contact.name}</p>
                              <p className="flex items-center gap-1">
                                <Mail className="h-3 w-3" />
                                {partner.contact.email}
                              </p>
                              <p className="flex items-center gap-1">
                                <Phone className="h-3 w-3" />
                                {partner.contact.phone}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center text-muted-foreground py-8">
                        No local partners identified yet
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="compliance" className="space-y-4">
                    {region.compliance.length > 0 ? (
                      region.compliance.map((req) => (
                        <div key={req.id} className="border rounded-lg p-4">
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <h5 className="font-medium">{req.requirement}</h5>
                              <p className="text-sm text-muted-foreground">{req.authority}</p>
                            </div>
                            <Badge className={getStatusBadge(req.status)}>{req.status}</Badge>
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div>
                              <p className="font-medium">Category</p>
                              <p className="capitalize">{req.category}</p>
                            </div>
                            <div>
                              <p className="font-medium">Deadline</p>
                              <p>{new Date(req.deadline).toLocaleDateString()}</p>
                            </div>
                            <div>
                              <p className="font-medium">Cost</p>
                              <p>${req.cost.toLocaleString()}</p>
                            </div>
                            <div>
                              <p className="font-medium">Complexity</p>
                              <p className={getComplexityColor(req.complexity)}>{req.complexity}</p>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center text-muted-foreground py-8">
                        No compliance requirements tracked yet
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="timeline" className="space-y-4">
                    {region.timeline.phases.map((phase, index) => (
                      <div key={index} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <h5 className="font-medium">{phase.name}</h5>
                          <Badge className={getStatusBadge(phase.status)}>{phase.status}</Badge>
                        </div>
                        <div className="text-sm text-muted-foreground mb-3">
                          {new Date(phase.startDate).toLocaleDateString()} - {new Date(phase.endDate).toLocaleDateString()}
                        </div>
                        <div className="space-y-2">
                          {phase.milestones.map((milestone, mIndex) => (
                            <div key={mIndex} className="flex items-center gap-2">
                              {milestone.completed ? (
                                <CheckCircle className="h-4 w-4 text-green-500" />
                              ) : (
                                <Clock className="h-4 w-4 text-gray-400" />
                              )}
                              <span className="text-sm">{milestone.name}</span>
                              <span className="text-xs text-muted-foreground">
                                ({new Date(milestone.dueDate).toLocaleDateString()})
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </TabsContent>
                </Tabs>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="standards" className="space-y-6">
          {/* Standards Progress Chart */}
          <Card>
            <CardHeader>
              <CardTitle>International Standards Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={standardsProgressData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="progress" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Standards List */}
          <div className="space-y-4">
            {operations.standards.map((standard) => (
              <Card key={standard.id} className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold">{standard.name}</h3>
                    <p className="text-sm text-muted-foreground">{standard.organization}</p>
                  </div>
                  <Badge className={getStatusBadge(standard.status)}>{standard.status}</Badge>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div>
                    <div className="text-sm text-muted-foreground">Category</div>
                    <div className="font-medium capitalize">{standard.category}</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Cost</div>
                    <div className="font-medium">${standard.cost.toLocaleString()}</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Regions</div>
                    <div className="font-medium">{standard.applicableRegions.join(', ')}</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Validity</div>
                    {standard.expiryDate ? (
                      <div className="font-medium">
                        Until {new Date(standard.expiryDate).toLocaleDateString()}
                      </div>
                    ) : (
                      <div className="font-medium text-gray-500">Not applicable</div>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium mb-2">Benefits</h4>
                    <ul className="space-y-1">
                      {standard.benefits.map((benefit, index) => (
                        <li key={index} className="flex items-center gap-2 text-sm">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          {benefit}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Requirements</h4>
                    <ul className="space-y-1">
                      {standard.requirements.map((requirement, index) => (
                        <li key={index} className="flex items-center gap-2 text-sm">
                          <FileText className="h-4 w-4 text-blue-500" />
                          {requirement}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="flex gap-2 mt-4">
                  <Button size="sm" variant="outline">
                    <BookOpen className="h-3 w-3 mr-1" />
                    View Details
                  </Button>
                  <Button size="sm" variant="outline">
                    <Calendar className="h-3 w-3 mr-1" />
                    Schedule Audit
                  </Button>
                  <Button size="sm" variant="outline">
                    <ExternalLink className="h-3 w-3 mr-1" />
                    Organization Website
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="compliance" className="space-y-6">
          <div className="space-y-4">
            {operations.regions.map((region) => 
              region.compliance.map((req) => (
                <Card key={req.id} className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{region.flag}</span>
                      <div>
                        <h3 className="text-lg font-semibold">{req.requirement}</h3>
                        <p className="text-sm text-muted-foreground">{region.name} • {req.authority}</p>
                      </div>
                    </div>
                    <Badge className={getStatusBadge(req.status)}>{req.status}</Badge>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div>
                      <div className="text-sm text-muted-foreground">Category</div>
                      <div className="font-medium capitalize">{req.category}</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Deadline</div>
                      <div className="font-medium">{new Date(req.deadline).toLocaleDateString()}</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Cost</div>
                      <div className="font-medium">${req.cost.toLocaleString()}</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Complexity</div>
                      <div className={`font-medium ${getComplexityColor(req.complexity)}`}>
                        {req.complexity}
                      </div>
                    </div>
                  </div>

                  <div className="mb-4">
                    <h4 className="font-medium mb-2">Required Documents</h4>
                    <div className="flex flex-wrap gap-2">
                      {req.documents.map((doc, index) => (
                        <Badge key={index} variant="outline">{doc}</Badge>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button size="sm" variant="outline">
                      <FileText className="h-3 w-3 mr-1" />
                      View Documents
                    </Button>
                    <Button size="sm" variant="outline">
                      <Calendar className="h-3 w-3 mr-1" />
                      Schedule Review
                    </Button>
                    {req.status !== 'compliant' && (
                      <Button size="sm">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Mark Compliant
                      </Button>
                    )}
                  </div>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Market Entry Success Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="text-4xl font-bold text-green-600 mb-2">75%</div>
                  <p className="text-sm text-muted-foreground">
                    Success rate for market entry initiatives
                  </p>
                  <Progress value={75} className="mt-4" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Certification ROI</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="text-4xl font-bold text-blue-600 mb-2">340%</div>
                  <p className="text-sm text-muted-foreground">
                    Return on investment from international certifications
                  </p>
                  <div className="text-sm text-green-600 mt-2">
                    <TrendingUp className="inline h-3 w-3 mr-1" />
                    +45% from last year
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Regional Revenue Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={[
                        { name: 'North America', value: 65, color: '#3b82f6' },
                        { name: 'Europe', value: 25, color: '#10b981' },
                        { name: 'Asia-Pacific', value: 10, color: '#f59e0b' }
                      ]}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      dataKey="value"
                      label={({ name, value }) => `${name}: ${value}%`}
                    >
                      {[
                        { name: 'North America', value: 65, color: '#3b82f6' },
                        { name: 'Europe', value: 25, color: '#10b981' },
                        { name: 'Asia-Pacific', value: 10, color: '#f59e0b' }
                      ].map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Compliance Cost Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <AreaChart data={[
                    { month: 'Jan', cost: 15000, savings: 5000 },
                    { month: 'Feb', cost: 18000, savings: 7000 },
                    { month: 'Mar', cost: 22000, savings: 9000 },
                    { month: 'Apr', cost: 16000, savings: 11000 },
                    { month: 'May', cost: 20000, savings: 13000 },
                    { month: 'Jun', cost: 19000, savings: 15000 }
                  ]}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Area type="monotone" dataKey="cost" stackId="1" stroke="#ef4444" fill="#ef4444" fillOpacity={0.6} />
                    <Area type="monotone" dataKey="savings" stackId="1" stroke="#10b981" fill="#10b981" fillOpacity={0.6} />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}