import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from '@/hooks/use-toast';
import {
  FileText,
  Download,
  Upload,
  FolderOpen,
  Book,
  Shield,
  AlertTriangle,
  Users,
  Settings,
  Globe,
  Calendar,
  Clock,
  Tag,
  Search,
  Filter,
  Plus,
  Edit,
  Trash2,
  Eye,
  ExternalLink,
  Building,
  Gavel,
  CreditCard,
  Phone,
  Mail,
  MapPin,
  Bookmark,
  Star,
  CheckCircle,
  Info,
  Archive,
  Printer
} from 'lucide-react';

// Types
interface CompanyDocument {
  id: string;
  title: string;
  description: string;
  category: 'contract' | 'handbook' | 'policy' | 'standard' | 'guide' | 'form' | 'regulation' | 'training';
  type: 'pdf' | 'doc' | 'xlsx' | 'image' | 'video' | 'other';
  fileName: string;
  fileSize: number;
  uploadDate: string;
  lastModified: string;
  version: string;
  uploadedBy: string;
  tags: string[];
  department?: string;
  accessLevel: 'public' | 'employees' | 'managers' | 'admin';
  downloadCount: number;
  expirationDate?: string;
  approved: boolean;
  approvedBy?: string;
  requiresSignature?: boolean;
  isTemplate: boolean;
}

interface ResourceLink {
  id: string;
  title: string;
  description: string;
  url: string;
  category: 'virginia' | 'federal' | 'industry' | 'training' | 'safety' | 'legal' | 'finance';
  type: 'government' | 'association' | 'vendor' | 'training' | 'certification' | 'regulation';
  lastVerified: string;
  importance: 'critical' | 'high' | 'medium' | 'low';
  tags: string[];
}

interface StandardsPractice {
  id: string;
  title: string;
  description: string;
  category: 'paving' | 'safety' | 'quality' | 'environmental' | 'equipment' | 'material';
  standard: string;
  requirement: string;
  procedure: string;
  documents: string[];
  compliance: boolean;
  lastReview: string;
  nextReview: string;
  responsible: string;
}

export default function CompanyResources() {
  const { toast } = useToast();
  
  // State management
  const [documents, setDocuments] = useState<CompanyDocument[]>([]);
  const [links, setLinks] = useState<ResourceLink[]>([]);
  const [standards, setStandards] = useState<StandardsPractice[]>([]);
  const [selectedDocument, setSelectedDocument] = useState<CompanyDocument | null>(null);
  const [activeTab, setActiveTab] = useState('documents');
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [isLinkDialogOpen, setIsLinkDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [accessFilter, setAccessFilter] = useState('all');

  // Load initial data
  useEffect(() => {
    loadResourceData();
  }, []);

  const loadResourceData = () => {
    // Mock data - in production, this would come from API
    setDocuments([
      {
        id: '1',
        title: 'Employee Handbook 2024',
        description: 'Complete employee handbook covering company policies, procedures, and benefits',
        category: 'handbook',
        type: 'pdf',
        fileName: 'employee-handbook-2024.pdf',
        fileSize: 2560000,
        uploadDate: '2024-01-01',
        lastModified: '2024-01-15',
        version: '2024.1',
        uploadedBy: 'HR Department',
        tags: ['handbook', 'policies', 'benefits', 'HR'],
        department: 'Human Resources',
        accessLevel: 'employees',
        downloadCount: 45,
        approved: true,
        approvedBy: 'Mary Johnson',
        requiresSignature: true,
        isTemplate: false
      },
      {
        id: '2',
        title: 'Safety Protocols & Procedures',
        description: 'Comprehensive safety guidelines for all field operations',
        category: 'policy',
        type: 'pdf',
        fileName: 'safety-protocols-2024.pdf',
        fileSize: 1890000,
        uploadDate: '2024-01-10',
        lastModified: '2024-01-20',
        version: '2024.2',
        uploadedBy: 'Safety Department',
        tags: ['safety', 'protocols', 'OSHA', 'procedures'],
        department: 'Safety',
        accessLevel: 'employees',
        downloadCount: 78,
        approved: true,
        approvedBy: 'Safety Manager',
        requiresSignature: true,
        isTemplate: false
      },
      {
        id: '3',
        title: 'Equipment Operation Manual',
        description: 'Operating procedures and maintenance schedules for all equipment',
        category: 'guide',
        type: 'pdf',
        fileName: 'equipment-manual-2024.pdf',
        fileSize: 4200000,
        uploadDate: '2024-01-05',
        lastModified: '2024-01-25',
        version: '2024.1',
        uploadedBy: 'Operations Department',
        tags: ['equipment', 'operations', 'maintenance', 'procedures'],
        department: 'Operations',
        accessLevel: 'employees',
        downloadCount: 67,
        approved: true,
        approvedBy: 'Operations Manager',
        requiresSignature: false,
        isTemplate: false
      },
      {
        id: '4',
        title: 'Virginia Paving Standards Compliance',
        description: 'Virginia Department of Transportation paving specifications and requirements',
        category: 'standard',
        type: 'pdf',
        fileName: 'va-paving-standards.pdf',
        fileSize: 3100000,
        uploadDate: '2024-01-12',
        lastModified: '2024-01-12',
        version: '2024.1',
        uploadedBy: 'Quality Control',
        tags: ['virginia', 'VDOT', 'standards', 'compliance'],
        department: 'Quality Control',
        accessLevel: 'managers',
        downloadCount: 23,
        approved: true,
        approvedBy: 'QC Manager',
        requiresSignature: false,
        isTemplate: false
      },
      {
        id: '5',
        title: 'Employee Contract Template',
        description: 'Standard employment contract template for new hires',
        category: 'contract',
        type: 'doc',
        fileName: 'employee-contract-template.docx',
        fileSize: 125000,
        uploadDate: '2024-01-01',
        lastModified: '2024-01-01',
        version: '2024.1',
        uploadedBy: 'HR Department',
        tags: ['contract', 'template', 'employment', 'HR'],
        department: 'Human Resources',
        accessLevel: 'managers',
        downloadCount: 12,
        approved: true,
        approvedBy: 'HR Director',
        requiresSignature: false,
        isTemplate: true
      },
      {
        id: '6',
        title: 'Time Reporting Form',
        description: 'Weekly time reporting form for hourly employees',
        category: 'form',
        type: 'pdf',
        fileName: 'time-reporting-form.pdf',
        fileSize: 89000,
        uploadDate: '2024-01-01',
        lastModified: '2024-01-01',
        version: '2024.1',
        uploadedBy: 'Payroll Department',
        tags: ['timekeeping', 'payroll', 'form'],
        department: 'Payroll',
        accessLevel: 'employees',
        downloadCount: 156,
        approved: true,
        approvedBy: 'Payroll Manager',
        requiresSignature: false,
        isTemplate: true
      }
    ]);

    setLinks([
      {
        id: '1',
        title: 'Virginia Department of Transportation',
        description: 'Official VDOT website for contractor resources and specifications',
        url: 'https://www.virginiadot.org/business/bu-contractors.asp',
        category: 'virginia',
        type: 'government',
        lastVerified: '2024-01-15',
        importance: 'critical',
        tags: ['VDOT', 'virginia', 'contractor', 'specifications']
      },
      {
        id: '2',
        title: 'Virginia eVA Procurement Portal',
        description: 'State procurement opportunities and vendor registration',
        url: 'https://eva.virginia.gov',
        category: 'virginia',
        type: 'government',
        lastVerified: '2024-01-10',
        importance: 'high',
        tags: ['procurement', 'virginia', 'vendor', 'opportunities']
      },
      {
        id: '3',
        title: 'Virginia Department of Professional Regulation',
        description: 'Contractor licensing and professional regulation information',
        url: 'https://www.dpor.virginia.gov',
        category: 'virginia',
        type: 'government',
        lastVerified: '2024-01-12',
        importance: 'critical',
        tags: ['licensing', 'regulation', 'professional', 'virginia']
      },
      {
        id: '4',
        title: 'OSHA Construction Standards',
        description: 'Federal safety standards for construction industry',
        url: 'https://www.osha.gov/construction',
        category: 'federal',
        type: 'regulation',
        lastVerified: '2024-01-14',
        importance: 'critical',
        tags: ['OSHA', 'safety', 'federal', 'construction']
      },
      {
        id: '5',
        title: 'National Asphalt Pavement Association',
        description: 'Industry association resources and best practices',
        url: 'https://www.asphaltpavement.org',
        category: 'industry',
        type: 'association',
        lastVerified: '2024-01-08',
        importance: 'high',
        tags: ['NAPA', 'asphalt', 'industry', 'best-practices']
      },
      {
        id: '6',
        title: 'Virginia Asphalt Association',
        description: 'State asphalt industry association and resources',
        url: 'https://www.virginia-asphalt.org',
        category: 'virginia',
        type: 'association',
        lastVerified: '2024-01-11',
        importance: 'high',
        tags: ['virginia', 'asphalt', 'association', 'industry']
      }
    ]);

    setStandards([
      {
        id: '1',
        title: 'VDOT Section 300 - Asphalt Concrete',
        description: 'Virginia Department of Transportation specifications for asphalt concrete pavement',
        category: 'paving',
        standard: 'VDOT Road and Bridge Specifications Section 300',
        requirement: 'All asphalt concrete work must meet VDOT Section 300 specifications',
        procedure: 'Follow VDOT-approved mix designs, testing protocols, and quality control procedures',
        documents: ['VDOT-Section-300.pdf', 'Quality-Control-Checklist.pdf'],
        compliance: true,
        lastReview: '2024-01-15',
        nextReview: '2024-07-15',
        responsible: 'Quality Control Manager'
      },
      {
        id: '2',
        title: 'OSHA Fall Protection Standards',
        description: 'Federal requirements for fall protection in construction',
        category: 'safety',
        standard: '29 CFR 1926 Subpart M - Fall Protection',
        requirement: 'Fall protection required for work at heights above 6 feet',
        procedure: 'Use appropriate fall protection equipment and conduct safety training',
        documents: ['OSHA-Fall-Protection.pdf', 'Fall-Protection-Training.pdf'],
        compliance: true,
        lastReview: '2024-01-10',
        nextReview: '2024-04-10',
        responsible: 'Safety Manager'
      },
      {
        id: '3',
        title: 'Virginia Erosion and Sediment Control',
        description: 'State requirements for erosion and sediment control on construction sites',
        category: 'environmental',
        standard: 'Virginia Erosion and Sediment Control Handbook',
        requirement: 'Implement erosion control measures on all projects',
        procedure: 'Install and maintain appropriate erosion control devices',
        documents: ['VA-Erosion-Control.pdf', 'ESC-Inspection-Form.pdf'],
        compliance: true,
        lastReview: '2024-01-12',
        nextReview: '2024-06-12',
        responsible: 'Environmental Compliance Officer'
      }
    ]);
  };

  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         doc.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         doc.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = categoryFilter === 'all' || doc.category === categoryFilter;
    const matchesAccess = accessFilter === 'all' || doc.accessLevel === accessFilter;
    return matchesSearch && matchesCategory && matchesAccess;
  });

  const filteredLinks = links.filter(link => {
    const matchesSearch = link.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         link.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || link.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'pdf': return <FileText className="h-5 w-5 text-red-500" />;
      case 'doc': return <FileText className="h-5 w-5 text-blue-500" />;
      case 'xlsx': return <FileText className="h-5 w-5 text-green-500" />;
      case 'image': return <FileText className="h-5 w-5 text-purple-500" />;
      case 'video': return <FileText className="h-5 w-5 text-orange-500" />;
      default: return <FileText className="h-5 w-5 text-gray-500" />;
    }
  };

  const getImportanceColor = (importance: string) => {
    switch (importance) {
      case 'critical': return 'text-red-600 bg-red-100';
      case 'high': return 'text-orange-600 bg-orange-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const DocumentCard = ({ document }: { document: CompanyDocument }) => (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-md bg-blue-100">
              {getFileIcon(document.type)}
            </div>
            <div className="flex-1">
              <CardTitle className="text-lg">{document.title}</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">{document.description}</p>
              <div className="flex items-center gap-2 mt-2">
                <Badge variant="outline">{document.category}</Badge>
                <Badge variant="secondary">{document.accessLevel}</Badge>
                {document.isTemplate && <Badge variant="outline">Template</Badge>}
                {document.requiresSignature && <Badge variant="outline">Signature Required</Badge>}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {document.approved ? (
              <CheckCircle className="h-4 w-4 text-green-500" />
            ) : (
              <AlertTriangle className="h-4 w-4 text-yellow-500" />
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="font-medium">Version:</span> {document.version}
          </div>
          <div>
            <span className="font-medium">Size:</span> {(document.fileSize / 1024 / 1024).toFixed(1)} MB
          </div>
          <div>
            <span className="font-medium">Modified:</span> {new Date(document.lastModified).toLocaleDateString()}
          </div>
          <div>
            <span className="font-medium">Downloads:</span> {document.downloadCount}
          </div>
        </div>
        
        {document.department && (
          <div className="text-sm">
            <span className="font-medium">Department:</span> {document.department}
          </div>
        )}
        
        {document.expirationDate && (
          <div className="text-sm">
            <span className="font-medium">Expires:</span> 
            <span className={
              new Date(document.expirationDate) < new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
                ? 'text-red-600 font-medium ml-1' 
                : 'text-green-600 ml-1'
            }>
              {new Date(document.expirationDate).toLocaleDateString()}
            </span>
          </div>
        )}
        
        {document.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {document.tags.map((tag, index) => (
              <Badge key={index} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        )}
        
        <div className="flex gap-2 pt-2">
          <Button
            size="sm"
            onClick={() => setSelectedDocument(document)}
          >
            <Eye className="h-3 w-3 mr-1" />
            View
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => toast({ title: "Downloaded", description: `${document.title} downloaded successfully` })}
          >
            <Download className="h-3 w-3 mr-1" />
            Download
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => toast({ title: "Printed", description: `${document.title} sent to printer` })}
          >
            <Printer className="h-3 w-3 mr-1" />
            Print
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  const LinkCard = ({ link }: { link: ResourceLink }) => (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg flex items-center gap-2">
              <Globe className="h-4 w-4" />
              {link.title}
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">{link.description}</p>
            <div className="flex items-center gap-2 mt-2">
              <Badge variant="outline">{link.category}</Badge>
              <Badge variant="secondary">{link.type}</Badge>
              <Badge className={getImportanceColor(link.importance)}>
                {link.importance}
              </Badge>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="text-sm">
          <span className="font-medium">Last Verified:</span> {new Date(link.lastVerified).toLocaleDateString()}
        </div>
        
        {link.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {link.tags.map((tag, index) => (
              <Badge key={index} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        )}
        
        <Button
          className="w-full"
          onClick={() => window.open(link.url, '_blank')}
        >
          Visit Resource
          <ExternalLink className="h-3 w-3 ml-2" />
        </Button>
      </CardContent>
    </Card>
  );

  const StandardCard = ({ standard }: { standard: StandardsPractice }) => (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg flex items-center gap-2">
              <Shield className="h-4 w-4" />
              {standard.title}
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">{standard.description}</p>
            <div className="flex items-center gap-2 mt-2">
              <Badge variant="outline">{standard.category}</Badge>
              <Badge variant={standard.compliance ? 'default' : 'destructive'}>
                {standard.compliance ? 'Compliant' : 'Non-Compliant'}
              </Badge>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="space-y-2 text-sm">
          <div>
            <span className="font-medium">Standard:</span>
            <p className="text-muted-foreground mt-1">{standard.standard}</p>
          </div>
          <div>
            <span className="font-medium">Requirement:</span>
            <p className="text-muted-foreground mt-1">{standard.requirement}</p>
          </div>
          <div>
            <span className="font-medium">Procedure:</span>
            <p className="text-muted-foreground mt-1">{standard.procedure}</p>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="font-medium">Last Review:</span> {new Date(standard.lastReview).toLocaleDateString()}
          </div>
          <div>
            <span className="font-medium">Next Review:</span> {new Date(standard.nextReview).toLocaleDateString()}
          </div>
          <div className="col-span-2">
            <span className="font-medium">Responsible:</span> {standard.responsible}
          </div>
        </div>
        
        {standard.documents.length > 0 && (
          <div>
            <span className="font-medium text-sm">Related Documents:</span>
            <div className="flex flex-wrap gap-1 mt-1">
              {standard.documents.map((doc, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {doc}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Building className="h-8 w-8 text-blue-600" />
            Company Resources
          </h1>
          <p className="text-muted-foreground mt-1">
            Document management, employee resources, and compliance standards
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => setIsLinkDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Link
          </Button>
          <Button onClick={() => setIsUploadDialogOpen(true)}>
            <Upload className="h-4 w-4 mr-2" />
            Upload Document
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Documents</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{documents.length}</div>
            <div className="text-xs text-muted-foreground">
              +3 this month
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Resource Links</CardTitle>
            <Globe className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{links.length}</div>
            <div className="text-xs text-muted-foreground">
              Verified this month
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Standards</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{standards.length}</div>
            <div className="text-xs text-muted-foreground">
              Compliance tracking
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Downloads</CardTitle>
            <Download className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {documents.reduce((sum, doc) => sum + doc.downloadCount, 0)}
            </div>
            <div className="text-xs text-muted-foreground">
              Total this month
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="links">Resource Links</TabsTrigger>
          <TabsTrigger value="standards">Standards</TabsTrigger>
          <TabsTrigger value="virginia">Virginia Resources</TabsTrigger>
        </TabsList>

        <TabsContent value="documents" className="space-y-6">
          {/* Search and Filter */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex gap-4 mb-4">
                <div className="flex-1">
                  <Input
                    placeholder="Search documents..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value="contract">Contracts</SelectItem>
                    <SelectItem value="handbook">Handbooks</SelectItem>
                    <SelectItem value="policy">Policies</SelectItem>
                    <SelectItem value="standard">Standards</SelectItem>
                    <SelectItem value="guide">Guides</SelectItem>
                    <SelectItem value="form">Forms</SelectItem>
                    <SelectItem value="regulation">Regulations</SelectItem>
                    <SelectItem value="training">Training</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={accessFilter} onValueChange={setAccessFilter}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Access Level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Access</SelectItem>
                    <SelectItem value="public">Public</SelectItem>
                    <SelectItem value="employees">Employees</SelectItem>
                    <SelectItem value="managers">Managers</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Documents Grid */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredDocuments.map((document) => (
              <DocumentCard key={document.id} document={document} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="links" className="space-y-6">
          {/* Search */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex gap-4">
                <div className="flex-1">
                  <Input
                    placeholder="Search resource links..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value="virginia">Virginia</SelectItem>
                    <SelectItem value="federal">Federal</SelectItem>
                    <SelectItem value="industry">Industry</SelectItem>
                    <SelectItem value="training">Training</SelectItem>
                    <SelectItem value="safety">Safety</SelectItem>
                    <SelectItem value="legal">Legal</SelectItem>
                    <SelectItem value="finance">Finance</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Links Grid */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredLinks.map((link) => (
              <LinkCard key={link.id} link={link} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="standards" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            {standards.map((standard) => (
              <StandardCard key={standard.id} standard={standard} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="virginia" className="space-y-6">
          {/* Virginia-specific Resources */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Virginia State Resources
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Official state resources for contractors and businesses in Virginia
              </p>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-3">
                  <h4 className="font-semibold">Regulatory Agencies</h4>
                  <div className="space-y-2">
                    <Button
                      variant="outline"
                      className="w-full justify-start"
                      onClick={() => window.open('https://www.virginiadot.org', '_blank')}
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Virginia Department of Transportation (VDOT)
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full justify-start"
                      onClick={() => window.open('https://www.dpor.virginia.gov', '_blank')}
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Dept. of Professional & Occupational Regulation
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full justify-start"
                      onClick={() => window.open('https://www.deq.virginia.gov', '_blank')}
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Department of Environmental Quality
                    </Button>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <h4 className="font-semibold">Business Resources</h4>
                  <div className="space-y-2">
                    <Button
                      variant="outline"
                      className="w-full justify-start"
                      onClick={() => window.open('https://eva.virginia.gov', '_blank')}
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      eVA - Virginia Procurement Portal
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full justify-start"
                      onClick={() => window.open('https://www.scc.virginia.gov', '_blank')}
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      State Corporation Commission
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full justify-start"
                      onClick={() => window.open('https://www.tax.virginia.gov', '_blank')}
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Virginia Department of Taxation
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Virginia Paving Standards */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Virginia Paving Standards & Best Practices
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <Card className="p-4">
                    <h5 className="font-medium mb-2">VDOT Road & Bridge Specifications</h5>
                    <p className="text-sm text-muted-foreground mb-3">
                      Official specifications for all road construction projects
                    </p>
                    <Button size="sm" variant="outline">
                      <Download className="h-3 w-3 mr-1" />
                      Download Specs
                    </Button>
                  </Card>
                  
                  <Card className="p-4">
                    <h5 className="font-medium mb-2">Materials & Testing Manual</h5>
                    <p className="text-sm text-muted-foreground mb-3">
                      Testing procedures and material requirements
                    </p>
                    <Button size="sm" variant="outline">
                      <Download className="h-3 w-3 mr-1" />
                      Download Manual
                    </Button>
                  </Card>
                  
                  <Card className="p-4">
                    <h5 className="font-medium mb-2">Quality Assurance Guidelines</h5>
                    <p className="text-sm text-muted-foreground mb-3">
                      QA/QC procedures for contractor compliance
                    </p>
                    <Button size="sm" variant="outline">
                      <Download className="h-3 w-3 mr-1" />
                      Download Guidelines
                    </Button>
                  </Card>
                  
                  <Card className="p-4">
                    <h5 className="font-medium mb-2">Environmental Compliance</h5>
                    <p className="text-sm text-muted-foreground mb-3">
                      Environmental protection requirements
                    </p>
                    <Button size="sm" variant="outline">
                      <Download className="h-3 w-3 mr-1" />
                      Download Requirements
                    </Button>
                  </Card>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Phone className="h-5 w-5" />
                Important Contacts
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-3">
                  <h5 className="font-medium">VDOT Contractor Services</h5>
                  <div className="space-y-1 text-sm">
                    <div className="flex items-center gap-2">
                      <Phone className="h-3 w-3" />
                      <span>(804) 786-2731</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail className="h-3 w-3" />
                      <span>contractor.services@vdot.virginia.gov</span>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <h5 className="font-medium">DPOR Contractor Licensing</h5>
                  <div className="space-y-1 text-sm">
                    <div className="flex items-center gap-2">
                      <Phone className="h-3 w-3" />
                      <span>(804) 367-8500</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail className="h-3 w-3" />
                      <span>contractor@dpor.virginia.gov</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Document Details Dialog */}
      {selectedDocument && (
        <Dialog open={!!selectedDocument} onOpenChange={() => setSelectedDocument(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{selectedDocument.title}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <p className="text-muted-foreground">{selectedDocument.description}</p>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">Version:</span> {selectedDocument.version}
                </div>
                <div>
                  <span className="font-medium">File Size:</span> {(selectedDocument.fileSize / 1024 / 1024).toFixed(1)} MB
                </div>
                <div>
                  <span className="font-medium">Uploaded:</span> {new Date(selectedDocument.uploadDate).toLocaleDateString()}
                </div>
                <div>
                  <span className="font-medium">Modified:</span> {new Date(selectedDocument.lastModified).toLocaleDateString()}
                </div>
                <div>
                  <span className="font-medium">Uploaded By:</span> {selectedDocument.uploadedBy}
                </div>
                <div>
                  <span className="font-medium">Downloads:</span> {selectedDocument.downloadCount}
                </div>
              </div>
              
              {selectedDocument.approvedBy && (
                <div className="p-3 bg-green-50 rounded-md">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm text-green-800">
                      Approved by {selectedDocument.approvedBy}
                    </span>
                  </div>
                </div>
              )}
              
              <div className="flex gap-2">
                <Button
                  onClick={() => toast({ title: "Downloaded", description: `${selectedDocument.title} downloaded successfully` })}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
                <Button
                  variant="outline"
                  onClick={() => toast({ title: "Printed", description: `${selectedDocument.title} sent to printer` })}
                >
                  <Printer className="h-4 w-4 mr-2" />
                  Print
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Upload Document Dialog */}
      <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Upload Document</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="title">Document Title</Label>
                <Input id="title" placeholder="Enter document title" />
              </div>
              <div>
                <Label htmlFor="category">Category</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="contract">Contract</SelectItem>
                    <SelectItem value="handbook">Handbook</SelectItem>
                    <SelectItem value="policy">Policy</SelectItem>
                    <SelectItem value="standard">Standard</SelectItem>
                    <SelectItem value="guide">Guide</SelectItem>
                    <SelectItem value="form">Form</SelectItem>
                    <SelectItem value="regulation">Regulation</SelectItem>
                    <SelectItem value="training">Training</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" placeholder="Enter document description" />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="department">Department</Label>
                <Input id="department" placeholder="Enter department" />
              </div>
              <div>
                <Label htmlFor="accessLevel">Access Level</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select access level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="public">Public</SelectItem>
                    <SelectItem value="employees">Employees</SelectItem>
                    <SelectItem value="managers">Managers</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div>
              <Label htmlFor="tags">Tags (comma-separated)</Label>
              <Input id="tags" placeholder="Enter tags separated by commas" />
            </div>
            
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <Upload className="h-8 w-8 mx-auto text-gray-400 mb-2" />
              <p className="text-sm text-muted-foreground">
                Click to upload or drag and drop files here
              </p>
            </div>
            
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsUploadDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={() => {
                toast({ title: "Success", description: "Document uploaded successfully" });
                setIsUploadDialogOpen(false);
              }}>
                Upload Document
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Link Dialog */}
      <Dialog open={isLinkDialogOpen} onOpenChange={setIsLinkDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add Resource Link</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="linkTitle">Link Title</Label>
              <Input id="linkTitle" placeholder="Enter link title" />
            </div>
            
            <div>
              <Label htmlFor="linkUrl">URL</Label>
              <Input id="linkUrl" placeholder="https://" />
            </div>
            
            <div>
              <Label htmlFor="linkDescription">Description</Label>
              <Textarea id="linkDescription" placeholder="Enter link description" />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="linkCategory">Category</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="virginia">Virginia</SelectItem>
                    <SelectItem value="federal">Federal</SelectItem>
                    <SelectItem value="industry">Industry</SelectItem>
                    <SelectItem value="training">Training</SelectItem>
                    <SelectItem value="safety">Safety</SelectItem>
                    <SelectItem value="legal">Legal</SelectItem>
                    <SelectItem value="finance">Finance</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="linkImportance">Importance</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select importance" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="critical">Critical</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsLinkDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={() => {
                toast({ title: "Success", description: "Resource link added successfully" });
                setIsLinkDialogOpen(false);
              }}>
                Add Link
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}