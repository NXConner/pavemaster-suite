import { useState } from 'react';
import { DashboardLayout } from '../components/layout/dashboard-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Badge } from '../components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Progress } from '../components/ui/progress';
import {
  FileText,
  Upload,
  Download,
  Search,
  Filter,
  Folder,
  Share,
  Lock,
  Eye,
  Edit,
  Calendar,
  Tag,
} from 'lucide-react';

interface Document {
  id: string;
  name: string;
  type: string;
  size: string;
  category: string;
  uploadedBy: string;
  uploadedAt: string;
  lastModified: string;
  status: 'active' | 'archived' | 'pending_review';
  tags: string[];
  isShared: boolean;
  permissions: 'read' | 'write' | 'admin';
  version: number;
}

interface DocumentCategory {
  id: string;
  name: string;
  description: string;
  documentCount: number;
  color: string;
}

export default function Documents() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedType, setSelectedType] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');

  const documents: Document[] = [
    {
      id: '1',
      name: 'VA Contractor License - Class C PAV',
      type: 'PDF',
      size: '2.4 MB',
      category: 'Legal & Compliance',
      uploadedBy: 'Admin User',
      uploadedAt: '2024-01-10',
      lastModified: '2024-01-10',
      status: 'active',
      tags: ['license', 'virginia', 'contractor'],
      isShared: false,
      permissions: 'admin',
      version: 1,
    },
    {
      id: '2',
      name: 'Safety Manual 2024',
      type: 'PDF',
      size: '8.7 MB',
      category: 'Safety & Training',
      uploadedBy: 'David Chen',
      uploadedAt: '2024-01-05',
      lastModified: '2024-01-15',
      status: 'active',
      tags: ['safety', 'manual', 'training'],
      isShared: true,
      permissions: 'read',
      version: 2,
    },
    {
      id: '3',
      name: 'Church Project Contract',
      type: 'DOCX',
      size: '1.2 MB',
      category: 'Contracts',
      uploadedBy: 'Admin User',
      uploadedAt: '2024-01-12',
      lastModified: '2024-01-12',
      status: 'pending_review',
      tags: ['contract', 'church', 'project'],
      isShared: false,
      permissions: 'write',
      version: 1,
    },
    {
      id: '4',
      name: 'Employee Handbook',
      type: 'PDF',
      size: '5.3 MB',
      category: 'HR & Policies',
      uploadedBy: 'Lisa Martinez',
      uploadedAt: '2023-12-20',
      lastModified: '2024-01-08',
      status: 'active',
      tags: ['hr', 'handbook', 'policies'],
      isShared: true,
      permissions: 'read',
      version: 3,
    },
    {
      id: '5',
      name: 'Equipment Maintenance Log',
      type: 'XLSX',
      size: '0.8 MB',
      category: 'Operations',
      uploadedBy: 'Mike Johnson',
      uploadedAt: '2024-01-14',
      lastModified: '2024-01-16',
      status: 'active',
      tags: ['equipment', 'maintenance', 'log'],
      isShared: true,
      permissions: 'write',
      version: 1,
    },
    {
      id: '6',
      name: 'Insurance Certificate',
      type: 'PDF',
      size: '1.5 MB',
      category: 'Insurance',
      uploadedBy: 'Admin User',
      uploadedAt: '2023-11-15',
      lastModified: '2023-11-15',
      status: 'active',
      tags: ['insurance', 'certificate', 'liability'],
      isShared: false,
      permissions: 'admin',
      version: 1,
    },
  ];

  const categories: DocumentCategory[] = [
    {
      id: '1',
      name: 'Legal & Compliance',
      description: 'Licenses, permits, and regulatory documents',
      documentCount: 12,
      color: 'bg-red-100 text-red-800',
    },
    {
      id: '2',
      name: 'Safety & Training',
      description: 'Safety manuals, training materials, and certifications',
      documentCount: 8,
      color: 'bg-yellow-100 text-yellow-800',
    },
    {
      id: '3',
      name: 'Contracts',
      description: 'Client contracts, vendor agreements, and proposals',
      documentCount: 15,
      color: 'bg-blue-100 text-blue-800',
    },
    {
      id: '4',
      name: 'HR & Policies',
      description: 'Employee documents, policies, and procedures',
      documentCount: 6,
      color: 'bg-green-100 text-green-800',
    },
    {
      id: '5',
      name: 'Operations',
      description: 'Operational procedures, checklists, and logs',
      documentCount: 10,
      color: 'bg-purple-100 text-purple-800',
    },
    {
      id: '6',
      name: 'Insurance',
      description: 'Insurance policies, certificates, and claims',
      documentCount: 4,
      color: 'bg-orange-100 text-orange-800',
    },
  ];

  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.name.toLowerCase().includes(searchTerm.toLowerCase())
                         || doc.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = selectedCategory === 'all' || doc.category === selectedCategory;
    const matchesType = selectedType === 'all' || doc.type === selectedType;

    return matchesSearch && matchesCategory && matchesType;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'archived': return 'bg-gray-100 text-gray-800';
      case 'pending_review': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPermissionIcon = (permission: string) => {
    switch (permission) {
      case 'admin': return <Lock className="h-3 w-3" />;
      case 'write': return <Edit className="h-3 w-3" />;
      case 'read': return <Eye className="h-3 w-3" />;
      default: return <Eye className="h-3 w-3" />;
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Document Management</h1>
            <p className="text-muted-foreground">
              Organize, share, and manage company documents and resources
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="gap-2">
              <Download className="h-4 w-4" />
              Export
            </Button>
            <Button className="gap-2">
              <Upload className="h-4 w-4" />
              Upload Document
            </Button>
          </div>
        </div>

        {/* Storage Overview */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Documents</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{documents.length}</div>
              <p className="text-xs text-muted-foreground">+3 this week</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Storage Used</CardTitle>
              <Folder className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">127 MB</div>
              <Progress value={25} className="mt-2" />
              <p className="text-xs text-muted-foreground">25% of 500 MB</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Shared Documents</CardTitle>
              <Share className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {documents.filter(d => d.isShared).length}
              </div>
              <p className="text-xs text-muted-foreground">Accessible to team</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {documents.filter(d => d.status === 'pending_review').length}
              </div>
              <p className="text-xs text-muted-foreground">Require attention</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="documents" className="space-y-6">
          <TabsList>
            <TabsTrigger value="documents">All Documents</TabsTrigger>
            <TabsTrigger value="categories">Categories</TabsTrigger>
            <TabsTrigger value="templates">Templates</TabsTrigger>
            <TabsTrigger value="archive">Archive</TabsTrigger>
          </TabsList>

          <TabsContent value="documents" className="space-y-6">
            {/* Search and Filters */}
            <Card>
              <CardContent className="pt-6">
                <div className="grid gap-4 md:grid-cols-4">
                  <div className="space-y-2">
                    <Label htmlFor="search">Search Documents</Label>
                    <div className="relative">
                      <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="search"
                        placeholder="Search by name or tags..."
                        value={searchTerm}
                        onChange={(e) => { setSearchTerm(e.target.value); }}
                        className="pl-8"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Categories</SelectItem>
                        {categories.map((cat) => (
                          <SelectItem key={cat.id} value={cat.name}>
                            {cat.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="type">File Type</Label>
                    <Select value={selectedType} onValueChange={setSelectedType}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Types</SelectItem>
                        <SelectItem value="PDF">PDF</SelectItem>
                        <SelectItem value="DOCX">Word Document</SelectItem>
                        <SelectItem value="XLSX">Excel Spreadsheet</SelectItem>
                        <SelectItem value="JPG">Image</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-end gap-2">
                    <Button variant="outline" size="sm" className="gap-2">
                      <Filter className="h-4 w-4" />
                      Filter
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => { setViewMode(viewMode === 'list' ? 'grid' : 'list'); }}>
                      {viewMode === 'list' ? 'Grid' : 'List'}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Documents List */}
            <div className="space-y-4">
              {filteredDocuments.map((doc) => (
                <Card key={doc.id}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="p-2 bg-primary/10 rounded-lg">
                          <FileText className="h-6 w-6 text-primary" />
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center gap-3">
                            <h3 className="font-semibold">{doc.name}</h3>
                            <Badge className={getStatusColor(doc.status)}>
                              {doc.status.replace('_', ' ').toUpperCase()}
                            </Badge>
                            <Badge variant="outline" className="gap-1">
                              {getPermissionIcon(doc.permissions)}
                              {doc.permissions}
                            </Badge>
                            {doc.isShared && (
                              <Badge variant="outline" className="gap-1">
                                <Share className="h-3 w-3" />
                                Shared
                              </Badge>
                            )}
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-muted-foreground">
                            <div><strong>Type:</strong> {doc.type}</div>
                            <div><strong>Size:</strong> {doc.size}</div>
                            <div><strong>Category:</strong> {doc.category}</div>
                            <div><strong>Version:</strong> v{doc.version}</div>
                            <div><strong>Uploaded by:</strong> {doc.uploadedBy}</div>
                            <div><strong>Date:</strong> {doc.uploadedAt}</div>
                            <div><strong>Modified:</strong> {doc.lastModified}</div>
                          </div>
                          <div className="flex gap-1 flex-wrap mt-2">
                            {doc.tags.map((tag, index) => (
                              <Badge key={index} variant="secondary" className="text-xs gap-1">
                                <Tag className="h-2 w-2" />
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" className="gap-1">
                          <Eye className="h-3 w-3" />
                          View
                        </Button>
                        <Button variant="outline" size="sm" className="gap-1">
                          <Download className="h-3 w-3" />
                          Download
                        </Button>
                        <Button variant="outline" size="sm" className="gap-1">
                          <Edit className="h-3 w-3" />
                          Edit
                        </Button>
                        <Button variant="outline" size="sm" className="gap-1">
                          <Share className="h-3 w-3" />
                          Share
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="categories" className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {categories.map((category) => (
                <Card key={category.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{category.name}</CardTitle>
                      <Badge className={category.color}>
                        {category.documentCount} docs
                      </Badge>
                    </div>
                    <CardDescription>{category.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" className="flex-1">
                        View Documents
                      </Button>
                      <Button variant="outline" size="sm" className="gap-1">
                        <Folder className="h-3 w-3" />
                        Manage
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="templates" className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {[
                { name: 'Project Contract Template', type: 'Contract', uses: 12 },
                { name: 'Safety Inspection Form', type: 'Form', uses: 8 },
                { name: 'Equipment Maintenance Log', type: 'Log', uses: 15 },
                { name: 'Employee Onboarding Checklist', type: 'Checklist', uses: 6 },
                { name: 'Client Proposal Template', type: 'Proposal', uses: 9 },
                { name: 'Incident Report Form', type: 'Form', uses: 3 },
              ].map((template, index) => (
                <Card key={index}>
                  <CardHeader>
                    <CardTitle className="text-lg">{template.name}</CardTitle>
                    <CardDescription>Type: {template.type} • Used {template.uses} times</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" className="flex-1">
                        Use Template
                      </Button>
                      <Button variant="outline" size="sm">
                        Edit
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="archive" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Archived Documents</CardTitle>
                <CardDescription>Documents that have been archived or are no longer active</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Folder className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No archived documents found</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Documents moved to archive will appear here
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}