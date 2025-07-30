import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import {
  Building2,
  FileText,
  Scale,
  Shield,
  AlertTriangle,
  CheckCircle,
  ExternalLink,
  Download,
  Search,
  Filter,
  BookOpen,
  Globe,
  MapPin,
  Phone,
  Mail,
  Calendar,
  Clock,
  Star,
  Info,
  Bookmark,
  Eye,
  Printer
} from 'lucide-react';

interface Regulation {
  id: string;
  title: string;
  agency: string;
  category: string;
  effectiveDate: string;
  lastUpdated: string;
  summary: string;
  keyPoints: string[];
  compliance: 'mandatory' | 'recommended' | 'voluntary';
  penalties: string;
  relatedDocuments: Array<{
    title: string;
    url: string;
    type: 'pdf' | 'web' | 'form';
  }>;
  contactInfo?: {
    department: string;
    phone: string;
    email: string;
    website: string;
  };
}

interface BestPractice {
  id: string;
  title: string;
  category: string;
  industry: string;
  description: string;
  implementation: string[];
  benefits: string[];
  difficulty: 'easy' | 'moderate' | 'challenging';
  cost: 'low' | 'medium' | 'high';
  timeline: string;
  examples: string[];
  resources: Array<{
    title: string;
    url: string;
    type: 'guide' | 'template' | 'checklist' | 'training';
  }>;
}

interface Agency {
  id: string;
  name: string;
  acronym: string;
  description: string;
  website: string;
  phone: string;
  email: string;
  address: string;
  jurisdiction: 'state' | 'federal' | 'local';
  primaryFocus: string[];
  importantPrograms: Array<{
    name: string;
    description: string;
    website?: string;
  }>;
}

interface IndustryResource {
  id: string;
  title: string;
  category: string;
  type: 'publication' | 'training' | 'certification' | 'tool' | 'database';
  provider: string;
  description: string;
  url: string;
  cost: 'free' | 'paid' | 'membership';
  lastUpdated: string;
  relevantFor: string[];
}

export default function VirginiaIndustryStandards() {
  const { toast } = useToast();
  
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedIndustry, setSelectedIndustry] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [regulations, setRegulations] = useState<Regulation[]>([]);
  const [bestPractices, setBestPractices] = useState<BestPractice[]>([]);
  const [agencies, setAgencies] = useState<Agency[]>([]);
  const [resources, setResources] = useState<IndustryResource[]>([]);
  const [bookmarkedItems, setBookmarkedItems] = useState<string[]>([]);

  useEffect(() => {
    loadVirginiaData();
  }, []);

  const loadVirginiaData = async () => {
    // Load regulations
    const regulationsData: Regulation[] = [
      {
        id: 'vdot-standards',
        title: 'Virginia Department of Transportation Standards',
        agency: 'VDOT',
        category: 'Transportation',
        effectiveDate: '2024-01-01',
        lastUpdated: '2024-01-15',
        summary: 'Comprehensive standards for roadway construction, maintenance, and materials in Virginia.',
        keyPoints: [
          'Asphalt mix requirements and specifications',
          'Concrete strength and durability standards',
          'Traffic control device specifications',
          'Environmental compliance during construction',
          'Quality assurance and testing protocols'
        ],
        compliance: 'mandatory',
        penalties: 'Project rejection, contractor suspension, monetary penalties up to $50,000',
        relatedDocuments: [
          { title: 'Road and Bridge Standards', url: '/docs/vdot-standards.pdf', type: 'pdf' },
          { title: 'Materials Manual', url: '/docs/vdot-materials.pdf', type: 'pdf' },
          { title: 'Online Specifications', url: 'https://www.virginiadot.org/business/bu-con-manuals.asp', type: 'web' }
        ],
        contactInfo: {
          department: 'VDOT Construction Division',
          phone: '(804) 786-2701',
          email: 'construction@vdot.virginia.gov',
          website: 'https://www.virginiadot.org'
        }
      },
      {
        id: 'vdeq-regulations',
        title: 'Virginia Department of Environmental Quality Regulations',
        agency: 'VDEQ',
        category: 'Environmental',
        effectiveDate: '2023-07-01',
        lastUpdated: '2024-01-10',
        summary: 'Environmental protection regulations for construction and industrial activities.',
        keyPoints: [
          'Stormwater management requirements',
          'Air quality monitoring and compliance',
          'Waste management and disposal protocols',
          'Erosion and sediment control measures',
          'Groundwater protection standards'
        ],
        compliance: 'mandatory',
        penalties: 'Civil penalties up to $32,500 per violation per day',
        relatedDocuments: [
          { title: 'Virginia Stormwater Management Handbook', url: '/docs/vdeq-stormwater.pdf', type: 'pdf' },
          { title: 'Air Pollution Control Regulations', url: '/docs/vdeq-air.pdf', type: 'pdf' }
        ],
        contactInfo: {
          department: 'VDEQ Compliance Division',
          phone: '(804) 698-4000',
          email: 'deqinfo@deq.virginia.gov',
          website: 'https://www.deq.virginia.gov'
        }
      },
      {
        id: 'vosh-safety',
        title: 'Virginia Occupational Safety and Health Standards',
        agency: 'VOSH',
        category: 'Safety',
        effectiveDate: '2023-10-01',
        lastUpdated: '2023-12-15',
        summary: 'Workplace safety and health standards for Virginia employers.',
        keyPoints: [
          'Personal protective equipment requirements',
          'Hazard communication standards',
          'Construction safety regulations',
          'Recordkeeping and reporting requirements',
          'Training and certification mandates'
        ],
        compliance: 'mandatory',
        penalties: 'Fines up to $145,027 per willful violation',
        relatedDocuments: [
          { title: 'Construction Safety Standards', url: '/docs/vosh-construction.pdf', type: 'pdf' },
          { title: 'General Industry Standards', url: '/docs/vosh-general.pdf', type: 'pdf' }
        ],
        contactInfo: {
          department: 'VOSH Compliance Division',
          phone: '(804) 371-2327',
          email: 'voshinquiries@doli.virginia.gov',
          website: 'https://www.doli.virginia.gov/vosh'
        }
      }
    ];

    // Load best practices
    const bestPracticesData: BestPractice[] = [
      {
        id: 'sustainable-asphalt',
        title: 'Sustainable Asphalt Practices',
        category: 'Environmental',
        industry: 'Paving & Sealcoating',
        description: 'Implementing environmentally responsible asphalt production and application techniques.',
        implementation: [
          'Use recycled asphalt pavement (RAP) content of 15-25%',
          'Implement warm-mix asphalt technology',
          'Optimize transportation routes to reduce emissions',
          'Use bio-based rejuvenators and additives',
          'Establish material recycling programs'
        ],
        benefits: [
          'Reduced environmental impact',
          'Lower material costs',
          'Extended pavement life',
          'Improved worker safety',
          'Enhanced public image'
        ],
        difficulty: 'moderate',
        cost: 'medium',
        timeline: '6-12 months implementation',
        examples: [
          'VDOT\'s 25% RAP requirement on interstate projects',
          'City of Richmond\'s warm-mix asphalt program',
          'Private contractor sustainability initiatives'
        ],
        resources: [
          { title: 'NAPA Sustainability Guidelines', url: '/resources/napa-sustainability.pdf', type: 'guide' },
          { title: 'RAP Implementation Checklist', url: '/resources/rap-checklist.pdf', type: 'checklist' }
        ]
      },
      {
        id: 'quality-control',
        title: 'Advanced Quality Control Systems',
        category: 'Quality Management',
        industry: 'All Construction',
        description: 'Implementing comprehensive quality control and assurance programs.',
        implementation: [
          'Establish quality management systems (ISO 9001)',
          'Implement statistical process control',
          'Use digital documentation and tracking',
          'Regular third-party audits and inspections',
          'Continuous improvement processes'
        ],
        benefits: [
          'Reduced rework and defects',
          'Improved customer satisfaction',
          'Enhanced reputation and competitiveness',
          'Lower long-term costs',
          'Regulatory compliance assurance'
        ],
        difficulty: 'challenging',
        cost: 'high',
        timeline: '12-18 months implementation',
        examples: [
          'Virginia Beach quality management program',
          'VDOT prequalification requirements',
          'AGC Virginia quality initiatives'
        ],
        resources: [
          { title: 'ISO 9001 Implementation Guide', url: '/resources/iso9001-guide.pdf', type: 'guide' },
          { title: 'QC/QA Training Program', url: '/resources/qc-training.pdf', type: 'training' }
        ]
      }
    ];

    // Load agencies
    const agenciesData: Agency[] = [
      {
        id: 'vdot',
        name: 'Virginia Department of Transportation',
        acronym: 'VDOT',
        description: 'State agency responsible for transportation infrastructure planning, construction, and maintenance.',
        website: 'https://www.virginiadot.org',
        phone: '(804) 786-2701',
        email: 'info@vdot.virginia.gov',
        address: '1401 E Broad St, Richmond, VA 23219',
        jurisdiction: 'state',
        primaryFocus: ['Highway Construction', 'Bridge Engineering', 'Traffic Management', 'Public Transportation'],
        importantPrograms: [
          {
            name: 'Prequalification Program',
            description: 'Contractor prequalification for state projects',
            website: 'https://www.virginiadot.org/business/bu-con-prequalification.asp'
          },
          {
            name: 'Smart Scale',
            description: 'Project prioritization and funding program',
            website: 'https://www.smartscale.org'
          }
        ]
      },
      {
        id: 'vdeq',
        name: 'Virginia Department of Environmental Quality',
        acronym: 'VDEQ',
        description: 'State agency protecting Virginia\'s environment and public health.',
        website: 'https://www.deq.virginia.gov',
        phone: '(804) 698-4000',
        email: 'deqinfo@deq.virginia.gov',
        address: '1111 E Main St, Richmond, VA 23219',
        jurisdiction: 'state',
        primaryFocus: ['Water Quality', 'Air Quality', 'Waste Management', 'Environmental Compliance'],
        importantPrograms: [
          {
            name: 'Virginia Stormwater Management Program',
            description: 'Regulation of stormwater discharges',
            website: 'https://www.deq.virginia.gov/water/stormwater'
          },
          {
            name: 'Environmental Impact Review',
            description: 'Review of projects for environmental impacts'
          }
        ]
      }
    ];

    // Load resources
    const resourcesData: IndustryResource[] = [
      {
        id: 'va-business-portal',
        title: 'Virginia Business One Stop',
        category: 'Business Registration',
        type: 'tool',
        provider: 'Commonwealth of Virginia',
        description: 'Online portal for business registration, licensing, and compliance.',
        url: 'https://www.virginia.gov/services/business/',
        cost: 'free',
        lastUpdated: '2024-01-01',
        relevantFor: ['All Industries', 'New Businesses', 'Licensing']
      },
      {
        id: 'agc-virginia',
        title: 'Associated General Contractors of Virginia',
        category: 'Industry Association',
        type: 'training',
        provider: 'AGC Virginia',
        description: 'Professional association providing training, advocacy, and networking.',
        url: 'https://www.agcva.org',
        cost: 'membership',
        lastUpdated: '2024-01-10',
        relevantFor: ['Construction', 'Contractors', 'Professional Development']
      }
    ];

    setRegulations(regulationsData);
    setBestPractices(bestPracticesData);
    setAgencies(agenciesData);
    setResources(resourcesData);
  };

  const filteredRegulations = regulations.filter(reg => {
    const matchesSearch = searchTerm === '' || 
      reg.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reg.summary.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || reg.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const filteredBestPractices = bestPractices.filter(practice => {
    const matchesSearch = searchTerm === '' || 
      practice.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      practice.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || practice.category === selectedCategory;
    const matchesIndustry = selectedIndustry === 'all' || practice.industry === selectedIndustry;
    return matchesSearch && matchesCategory && matchesIndustry;
  });

  const toggleBookmark = (id: string) => {
    setBookmarkedItems(prev => 
      prev.includes(id) 
        ? prev.filter(item => item !== id)
        : [...prev, id]
    );
  };

  const exportBookmarks = () => {
    const bookmarkedData = {
      regulations: regulations.filter(r => bookmarkedItems.includes(r.id)),
      bestPractices: bestPractices.filter(p => bookmarkedItems.includes(p.id)),
      exportDate: new Date().toISOString()
    };

    const dataStr = JSON.stringify(bookmarkedData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `va-industry-bookmarks-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);

    toast({
      title: "Bookmarks Exported",
      description: "Your bookmarked items have been downloaded.",
    });
  };

  const getComplianceBadgeColor = (compliance: string) => {
    switch (compliance) {
      case 'mandatory': return 'bg-red-500';
      case 'recommended': return 'bg-yellow-500';
      case 'voluntary': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getDifficultyBadgeColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-500';
      case 'moderate': return 'bg-yellow-500';
      case 'challenging': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <MapPin className="h-8 w-8" />
            Virginia Industry Standards & Best Practices
          </h1>
          <p className="text-muted-foreground">
            Comprehensive guide to Virginia regulations, standards, and industry best practices
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={exportBookmarks} disabled={bookmarkedItems.length === 0}>
            <Download className="h-4 w-4 mr-2" />
            Export Bookmarks ({bookmarkedItems.length})
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search regulations, practices, etc."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Category</label>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="Transportation">Transportation</SelectItem>
                  <SelectItem value="Environmental">Environmental</SelectItem>
                  <SelectItem value="Safety">Safety</SelectItem>
                  <SelectItem value="Quality Management">Quality Management</SelectItem>
                  <SelectItem value="Business Registration">Business Registration</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Industry</label>
              <Select value={selectedIndustry} onValueChange={setSelectedIndustry}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Industries</SelectItem>
                  <SelectItem value="Paving & Sealcoating">Paving & Sealcoating</SelectItem>
                  <SelectItem value="All Construction">All Construction</SelectItem>
                  <SelectItem value="Transportation">Transportation</SelectItem>
                  <SelectItem value="Environmental Services">Environmental Services</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="regulations" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="regulations">Regulations</TabsTrigger>
          <TabsTrigger value="best-practices">Best Practices</TabsTrigger>
          <TabsTrigger value="agencies">Agencies</TabsTrigger>
          <TabsTrigger value="resources">Resources</TabsTrigger>
        </TabsList>

        <TabsContent value="regulations" className="space-y-4">
          <div className="grid gap-4">
            {filteredRegulations.map((regulation) => (
              <Card key={regulation.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="flex items-center gap-2">
                        <Scale className="h-5 w-5" />
                        {regulation.title}
                      </CardTitle>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant="outline">{regulation.agency}</Badge>
                        <Badge variant="outline">{regulation.category}</Badge>
                        <Badge className={getComplianceBadgeColor(regulation.compliance)}>
                          {regulation.compliance}
                        </Badge>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleBookmark(regulation.id)}
                    >
                      <Bookmark className={`h-4 w-4 ${bookmarkedItems.includes(regulation.id) ? 'fill-current' : ''}`} />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">{regulation.summary}</p>
                  
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold mb-2">Key Points:</h4>
                      <ul className="list-disc list-inside space-y-1 text-sm">
                        {regulation.keyPoints.map((point, index) => (
                          <li key={index}>{point}</li>
                        ))}
                      </ul>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-semibold mb-2">Effective Date:</h4>
                        <p className="text-sm">{new Date(regulation.effectiveDate).toLocaleDateString()}</p>
                      </div>
                      <div>
                        <h4 className="font-semibold mb-2">Last Updated:</h4>
                        <p className="text-sm">{new Date(regulation.lastUpdated).toLocaleDateString()}</p>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold mb-2">Penalties:</h4>
                      <p className="text-sm text-red-600">{regulation.penalties}</p>
                    </div>

                    <div>
                      <h4 className="font-semibold mb-2">Related Documents:</h4>
                      <div className="flex flex-wrap gap-2">
                        {regulation.relatedDocuments.map((doc, index) => (
                          <Button key={index} variant="outline" size="sm" asChild>
                            <a href={doc.url} target="_blank" rel="noopener noreferrer">
                              <FileText className="h-4 w-4 mr-2" />
                              {doc.title}
                              <ExternalLink className="h-3 w-3 ml-2" />
                            </a>
                          </Button>
                        ))}
                      </div>
                    </div>

                    {regulation.contactInfo && (
                      <div className="bg-muted p-4 rounded">
                        <h4 className="font-semibold mb-2">Contact Information:</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                          <div className="flex items-center gap-2">
                            <Building2 className="h-4 w-4" />
                            {regulation.contactInfo.department}
                          </div>
                          <div className="flex items-center gap-2">
                            <Phone className="h-4 w-4" />
                            {regulation.contactInfo.phone}
                          </div>
                          <div className="flex items-center gap-2">
                            <Mail className="h-4 w-4" />
                            {regulation.contactInfo.email}
                          </div>
                          <div className="flex items-center gap-2">
                            <Globe className="h-4 w-4" />
                            <a href={regulation.contactInfo.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                              Website
                            </a>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="best-practices" className="space-y-4">
          <div className="grid gap-4">
            {filteredBestPractices.map((practice) => (
              <Card key={practice.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="flex items-center gap-2">
                        <CheckCircle className="h-5 w-5" />
                        {practice.title}
                      </CardTitle>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant="outline">{practice.category}</Badge>
                        <Badge variant="outline">{practice.industry}</Badge>
                        <Badge className={getDifficultyBadgeColor(practice.difficulty)}>
                          {practice.difficulty}
                        </Badge>
                        <Badge variant="secondary">{practice.cost} cost</Badge>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleBookmark(practice.id)}
                    >
                      <Bookmark className={`h-4 w-4 ${bookmarkedItems.includes(practice.id) ? 'fill-current' : ''}`} />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">{practice.description}</p>
                  
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold mb-2">Implementation Steps:</h4>
                      <ol className="list-decimal list-inside space-y-1 text-sm">
                        {practice.implementation.map((step, index) => (
                          <li key={index}>{step}</li>
                        ))}
                      </ol>
                    </div>

                    <div>
                      <h4 className="font-semibold mb-2">Benefits:</h4>
                      <ul className="list-disc list-inside space-y-1 text-sm">
                        {practice.benefits.map((benefit, index) => (
                          <li key={index} className="text-green-700">{benefit}</li>
                        ))}
                      </ul>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-semibold mb-2">Timeline:</h4>
                        <p className="text-sm flex items-center gap-2">
                          <Clock className="h-4 w-4" />
                          {practice.timeline}
                        </p>
                      </div>
                      <div>
                        <h4 className="font-semibold mb-2">Difficulty:</h4>
                        <div className="flex items-center gap-2">
                          {[...Array(3)].map((_, i) => (
                            <Star
                              key={i}
                              className={`h-4 w-4 ${
                                i < (practice.difficulty === 'easy' ? 1 : practice.difficulty === 'moderate' ? 2 : 3)
                                  ? 'fill-current text-yellow-400'
                                  : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold mb-2">Examples:</h4>
                      <ul className="list-disc list-inside space-y-1 text-sm">
                        {practice.examples.map((example, index) => (
                          <li key={index}>{example}</li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <h4 className="font-semibold mb-2">Resources:</h4>
                      <div className="flex flex-wrap gap-2">
                        {practice.resources.map((resource, index) => (
                          <Button key={index} variant="outline" size="sm" asChild>
                            <a href={resource.url} target="_blank" rel="noopener noreferrer">
                              <BookOpen className="h-4 w-4 mr-2" />
                              {resource.title}
                              <ExternalLink className="h-3 w-3 ml-2" />
                            </a>
                          </Button>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="agencies" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {agencies.map((agency) => (
              <Card key={agency.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building2 className="h-5 w-5" />
                    {agency.name} ({agency.acronym})
                  </CardTitle>
                  <Badge variant="outline">{agency.jurisdiction}</Badge>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">{agency.description}</p>
                  
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold mb-2">Primary Focus Areas:</h4>
                      <div className="flex flex-wrap gap-2">
                        {agency.primaryFocus.map((focus, index) => (
                          <Badge key={index} variant="secondary">{focus}</Badge>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold mb-2">Contact Information:</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4" />
                          {agency.phone}
                        </div>
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4" />
                          {agency.email}
                        </div>
                        <div className="flex items-center gap-2">
                          <Globe className="h-4 w-4" />
                          <a href={agency.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                            {agency.website}
                          </a>
                        </div>
                        <div className="flex items-start gap-2">
                          <MapPin className="h-4 w-4 mt-0.5" />
                          {agency.address}
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold mb-2">Important Programs:</h4>
                      <div className="space-y-2">
                        {agency.importantPrograms.map((program, index) => (
                          <div key={index} className="border rounded p-3">
                            <h5 className="font-medium">{program.name}</h5>
                            <p className="text-sm text-muted-foreground">{program.description}</p>
                            {program.website && (
                              <a href={program.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline text-sm">
                                Learn more →
                              </a>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="resources" className="space-y-4">
          <div className="grid gap-4">
            {resources.map((resource) => (
              <Card key={resource.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="flex items-center gap-2">
                        <BookOpen className="h-5 w-5" />
                        {resource.title}
                      </CardTitle>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant="outline">{resource.category}</Badge>
                        <Badge variant="outline">{resource.type}</Badge>
                        <Badge variant={resource.cost === 'free' ? 'default' : 'secondary'}>
                          {resource.cost}
                        </Badge>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" asChild>
                      <a href={resource.url} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Access
                      </a>
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">{resource.description}</p>
                  
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <Building2 className="h-4 w-4" />
                      <span className="font-medium">Provider:</span> {resource.provider}
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="h-4 w-4" />
                      <span className="font-medium">Last Updated:</span> {new Date(resource.lastUpdated).toLocaleDateString()}
                    </div>
                    <div>
                      <span className="font-medium text-sm">Relevant For:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {resource.relevantFor.map((item, index) => (
                          <Badge key={index} variant="outline" className="text-xs">{item}</Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}