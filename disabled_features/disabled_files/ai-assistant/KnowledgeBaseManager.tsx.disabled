import React, { useState, useCallback } from 'react';
import { Upload, FileText, Search, Filter, Download, Trash2, Eye, Edit, Plus, Book, AlertTriangle, CheckCircle, Clock, Tag } from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { useAIAssistant } from '@/features/ai-services/hooks/useAIAssistant';
import { AsphaltKnowledge } from '@/features/ai-services/schemas/ai-assistant-schema';

const DOCUMENT_TYPES = [
  { value: 'federal_regulation', label: 'Federal Regulation', icon: '🏛️' },
  { value: 'state_regulation', label: 'State Regulation', icon: '🏛️' },
  { value: 'industry_standard', label: 'Industry Standard', icon: '📏' },
  { value: 'company_policy', label: 'Company Policy', icon: '🏢' },
  { value: 'best_practices', label: 'Best Practices', icon: '⭐' },
  { value: 'technical_specification', label: 'Technical Spec', icon: '🔧' },
  { value: 'safety_guideline', label: 'Safety Guideline', icon: '🦺' },
  { value: 'estimation_guide', label: 'Estimation Guide', icon: '💰' },
  { value: 'accounting_procedure', label: 'Accounting Procedure', icon: '📊' },
  { value: 'equipment_manual', label: 'Equipment Manual', icon: '🚜' },
  { value: 'training_material', label: 'Training Material', icon: '📚' },
  { value: 'repair_procedure', label: 'Repair Procedure', icon: '🔨' },
  { value: 'material_specification', label: 'Material Spec', icon: '🧱' },
  { value: 'quality_standard', label: 'Quality Standard', icon: '✅' },
  { value: 'environmental_guideline', label: 'Environmental Guide', icon: '🌱' }
];

const ASPHALT_CATEGORIES = [
  'driveway_repair', 'parking_lot_maintenance', 'pothole_repair', 'crack_sealing',
  'sealcoating', 'line_striping', 'surface_preparation', 'material_selection',
  'equipment_operation', 'quality_control', 'environmental_compliance',
  'safety_procedures', 'cost_estimation', 'project_planning'
];

const REPAIR_TYPES = [
  'minor_crack_repair', 'major_crack_repair', 'pothole_patching', 'full_depth_repair',
  'surface_overlay', 'mill_and_fill', 'preventive_maintenance', 'drainage_repair',
  'edge_repair', 'joint_sealing'
];

const APPLICABLE_SURFACES = [
  'asphalt_concrete', 'portland_cement_concrete', 'composite_pavement',
  'gravel', 'crushed_stone', 'recycled_asphalt'
];

interface UploadProgress {
  file: File;
  progress: number;
  status: 'uploading' | 'processing' | 'complete' | 'error';
  error?: string;
}

export default function KnowledgeBaseManager() {
  const [activeTab, setActiveTab] = useState('browse');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDocumentType, setSelectedDocumentType] = useState<string>('all');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [uploadProgress, setUploadProgress] = useState<UploadProgress[]>([]);
  const [newDocumentDialog, setNewDocumentDialog] = useState(false);
  const [viewDocumentDialog, setViewDocumentDialog] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<AsphaltKnowledge | null>(null);
  const [newDocument, setNewDocument] = useState({
    title: '',
    document_type: 'best_practices',
    content: '',
    asphalt_categories: [] as string[],
    repair_types: [] as string[],
    applicable_surfaces: [] as string[],
    tags: [] as string[],
    source: '',
    version: '',
    effective_date: '',
    access_level: 'internal'
  });

  const { 
    knowledgeDocuments,
    searchAsphaltKnowledge,
    uploadDocument,
    updateDocument,
    deleteDocument,
    hasPermission,
    isLoading,
    error 
  } = useAIAssistant();

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (!hasPermission('upload_documents')) {
      alert('You do not have permission to upload documents');
      return;
    }

    const newUploads: UploadProgress[] = acceptedFiles.map(file => ({
      file,
      progress: 0,
      status: 'uploading'
    }));

    setUploadProgress(prev => [...prev, ...newUploads]);

    for (const file of acceptedFiles) {
      try {
        // Simulate upload progress
        for (let i = 0; i <= 100; i += 10) {
          await new Promise(resolve => setTimeout(resolve, 100));
          setUploadProgress(prev => prev.map(upload => 
            upload.file === file ? { ...upload, progress: i } : upload
          ));
        }

        setUploadProgress(prev => prev.map(upload => 
          upload.file === file ? { ...upload, status: 'processing' } : upload
        ));

        // Upload the document
        await uploadDocument(file);

        setUploadProgress(prev => prev.map(upload => 
          upload.file === file ? { ...upload, status: 'complete', progress: 100 } : upload
        ));

      } catch (error) {
        setUploadProgress(prev => prev.map(upload => 
          upload.file === file ? { 
            ...upload, 
            status: 'error', 
            error: error instanceof Error ? error.message : 'Upload failed'
          } : upload
        ));
      }
    }
  }, [hasPermission, uploadDocument]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'text/plain': ['.txt'],
      'text/markdown': ['.md']
    },
    maxFiles: 10,
    maxSize: 50 * 1024 * 1024 // 50MB
  });

  const filteredDocuments = knowledgeDocuments.filter(doc => {
    if (searchTerm && !doc.title.toLowerCase().includes(searchTerm.toLowerCase()) && 
        !doc.content.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }
    if (selectedDocumentType !== 'all' && doc.document_type !== selectedDocumentType) {
      return false;
    }
    if (selectedCategories.length > 0 && 
        !selectedCategories.some(cat => doc.asphalt_categories.includes(cat))) {
      return false;
    }
    return true;
  });

  const handleCreateDocument = async () => {
    if (!hasPermission('edit_knowledge_base')) {
      alert('You do not have permission to create documents');
      return;
    }

    try {
      const documentData = {
        ...newDocument,
        tags: newDocument.tags.filter(tag => tag.trim() !== ''),
        effective_date: newDocument.effective_date ? new Date(newDocument.effective_date) : undefined
      };

      // Here you would call your document creation API
      console.log('Creating document:', documentData);
      
      setNewDocumentDialog(false);
      setNewDocument({
        title: '',
        document_type: 'best_practices',
        content: '',
        asphalt_categories: [],
        repair_types: [],
        applicable_surfaces: [],
        tags: [],
        source: '',
        version: '',
        effective_date: '',
        access_level: 'internal'
      });
    } catch (error) {
      console.error('Error creating document:', error);
    }
  };

  const handleDeleteDocument = async (docId: string) => {
    if (!hasPermission('delete_documents')) {
      alert('You do not have permission to delete documents');
      return;
    }

    if (confirm('Are you sure you want to delete this document?')) {
      try {
        await deleteDocument(docId);
      } catch (error) {
        console.error('Error deleting document:', error);
      }
    }
  };

  const getDocumentTypeIcon = (type: string) => {
    const docType = DOCUMENT_TYPES.find(dt => dt.value === type);
    return docType?.icon || '📄';
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Book className="w-5 h-5" />
            AI Knowledge Base Manager
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Manage documents and knowledge for the AI assistant. Upload regulations, procedures, and expertise.
          </p>
        </CardHeader>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="browse">Browse Documents</TabsTrigger>
          <TabsTrigger value="upload">Upload</TabsTrigger>
          <TabsTrigger value="create">Create</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="browse" className="space-y-4">
          {/* Search and Filters */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                    <Input
                      placeholder="Search documents..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <Select value={selectedDocumentType} onValueChange={setSelectedDocumentType}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Document Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    {DOCUMENT_TYPES.map(type => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.icon} {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button variant="outline" className="flex items-center gap-2">
                  <Filter className="w-4 h-4" />
                  Filters
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Documents Table */}
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium">
                    Documents ({filteredDocuments.length})
                  </h3>
                  <Dialog open={newDocumentDialog} onOpenChange={setNewDocumentDialog}>
                    <DialogTrigger asChild>
                      <Button className="flex items-center gap-2">
                        <Plus className="w-4 h-4" />
                        Add Document
                      </Button>
                    </DialogTrigger>
                  </Dialog>
                </div>

                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Document</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Categories</TableHead>
                      <TableHead>Updated</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredDocuments.map((doc) => (
                      <TableRow key={doc.id}>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="font-medium">{doc.title}</div>
                            <div className="text-sm text-muted-foreground">
                              {doc.source && `Source: ${doc.source}`}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="flex items-center gap-1 w-fit">
                            <span>{getDocumentTypeIcon(doc.document_type)}</span>
                            {DOCUMENT_TYPES.find(t => t.value === doc.document_type)?.label}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {doc.asphalt_categories.slice(0, 2).map(cat => (
                              <Badge key={cat} variant="secondary" className="text-xs">
                                {cat.replace('_', ' ')}
                              </Badge>
                            ))}
                            {doc.asphalt_categories.length > 2 && (
                              <Badge variant="secondary" className="text-xs">
                                +{doc.asphalt_categories.length - 2}
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {doc.last_updated?.toLocaleDateString() || doc.uploaded_at.toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <Badge variant={doc.is_active ? "default" : "secondary"}>
                            {doc.is_active ? 'Active' : 'Inactive'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setSelectedDocument(doc);
                                setViewDocumentDialog(true);
                              }}
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            {hasPermission('edit_knowledge_base') && (
                              <Button variant="ghost" size="sm">
                                <Edit className="w-4 h-4" />
                              </Button>
                            )}
                            {hasPermission('delete_documents') && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteDocument(doc.id!)}
                              >
                                <Trash2 className="w-4 h-4 text-destructive" />
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                {filteredDocuments.length === 0 && (
                  <div className="text-center py-8">
                    <FileText className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground">No documents found</p>
                    <p className="text-sm text-muted-foreground">
                      Try adjusting your search or upload some documents
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="upload" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Upload Documents</CardTitle>
              <p className="text-sm text-muted-foreground">
                Upload PDFs, Word documents, or text files to expand the AI's knowledge base
              </p>
            </CardHeader>
            <CardContent>
              <div
                {...getRootProps()}
                className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                  isDragActive ? 'border-primary bg-primary/10' : 'border-muted-foreground/25'
                }`}
              >
                <input {...getInputProps()} />
                <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                {isDragActive ? (
                  <p className="text-primary font-medium">Drop the files here...</p>
                ) : (
                  <div className="space-y-2">
                    <p className="font-medium">Drag & drop files here, or click to select</p>
                    <p className="text-sm text-muted-foreground">
                      PDF, DOC, DOCX, TXT, MD files up to 50MB each
                    </p>
                  </div>
                )}
              </div>

              {uploadProgress.length > 0 && (
                <div className="mt-6 space-y-3">
                  <h4 className="font-medium">Upload Progress</h4>
                  {uploadProgress.map((upload, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {upload.status === 'complete' && <CheckCircle className="w-4 h-4 text-green-500" />}
                          {upload.status === 'error' && <AlertTriangle className="w-4 h-4 text-red-500" />}
                          {upload.status === 'uploading' && <Clock className="w-4 h-4 text-blue-500" />}
                          {upload.status === 'processing' && <Clock className="w-4 h-4 text-orange-500" />}
                          <span className="text-sm font-medium">{upload.file.name}</span>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {formatFileSize(upload.file.size)}
                        </div>
                      </div>
                      <Progress value={upload.progress} className="w-full" />
                      {upload.error && (
                        <p className="text-sm text-destructive">{upload.error}</p>
                      )}
                      {upload.status === 'processing' && (
                        <p className="text-sm text-muted-foreground">
                          Processing document and generating embeddings...
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="create" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Create New Document</CardTitle>
              <p className="text-sm text-muted-foreground">
                Manually create a knowledge document with structured metadata
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="title">Document Title</Label>
                    <Input
                      id="title"
                      value={newDocument.title}
                      onChange={(e) => setNewDocument(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="e.g., Crack Sealing Best Practices"
                    />
                  </div>

                  <div>
                    <Label htmlFor="document_type">Document Type</Label>
                    <Select
                      value={newDocument.document_type}
                      onValueChange={(value) => setNewDocument(prev => ({ ...prev, document_type: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {DOCUMENT_TYPES.map(type => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.icon} {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="source">Source</Label>
                    <Input
                      id="source"
                      value={newDocument.source}
                      onChange={(e) => setNewDocument(prev => ({ ...prev, source: e.target.value }))}
                      placeholder="e.g., ASTM D3515-01, Company Manual"
                    />
                  </div>

                  <div>
                    <Label htmlFor="version">Version</Label>
                    <Input
                      id="version"
                      value={newDocument.version}
                      onChange={(e) => setNewDocument(prev => ({ ...prev, version: e.target.value }))}
                      placeholder="e.g., 2.1, Rev A"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label>Asphalt Categories</Label>
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      {ASPHALT_CATEGORIES.map(category => (
                        <div key={category} className="flex items-center space-x-2">
                          <Checkbox
                            id={category}
                            checked={newDocument.asphalt_categories.includes(category)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setNewDocument(prev => ({
                                  ...prev,
                                  asphalt_categories: [...prev.asphalt_categories, category]
                                }));
                              } else {
                                setNewDocument(prev => ({
                                  ...prev,
                                  asphalt_categories: prev.asphalt_categories.filter(c => c !== category)
                                }));
                              }
                            }}
                          />
                          <label htmlFor={category} className="text-sm">
                            {category.replace('_', ' ')}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <Label htmlFor="content">Content</Label>
                <Textarea
                  id="content"
                  value={newDocument.content}
                  onChange={(e) => setNewDocument(prev => ({ ...prev, content: e.target.value }))}
                  placeholder="Enter the document content here..."
                  className="min-h-[200px]"
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => setNewDocument({
                    title: '',
                    document_type: 'best_practices',
                    content: '',
                    asphalt_categories: [],
                    repair_types: [],
                    applicable_surfaces: [],
                    tags: [],
                    source: '',
                    version: '',
                    effective_date: '',
                    access_level: 'internal'
                  })}
                >
                  Clear
                </Button>
                <Button onClick={handleCreateDocument}>
                  Create Document
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {knowledgeDocuments.length}
                  </div>
                  <div className="text-sm text-muted-foreground">Total Documents</div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {knowledgeDocuments.filter(doc => doc.is_active).length}
                  </div>
                  <div className="text-sm text-muted-foreground">Active Documents</div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">
                    {DOCUMENT_TYPES.length}
                  </div>
                  <div className="text-sm text-muted-foreground">Document Types</div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Document Distribution by Type</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {DOCUMENT_TYPES.map(type => {
                  const count = knowledgeDocuments.filter(doc => doc.document_type === type.value).length;
                  const percentage = knowledgeDocuments.length > 0 ? (count / knowledgeDocuments.length) * 100 : 0;
                  
                  return (
                    <div key={type.value} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span>{type.icon}</span>
                          <span className="text-sm font-medium">{type.label}</span>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {count} documents ({percentage.toFixed(1)}%)
                        </div>
                      </div>
                      <Progress value={percentage} className="w-full" />
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* View Document Dialog */}
      <Dialog open={viewDocumentDialog} onOpenChange={setViewDocumentDialog}>
        <DialogContent className="max-w-4xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <span>{selectedDocument && getDocumentTypeIcon(selectedDocument.document_type)}</span>
              {selectedDocument?.title}
            </DialogTitle>
          </DialogHeader>
          {selectedDocument && (
            <ScrollArea className="h-[60vh]">
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <strong>Type:</strong> {DOCUMENT_TYPES.find(t => t.value === selectedDocument.document_type)?.label}
                  </div>
                  <div>
                    <strong>Source:</strong> {selectedDocument.source || 'N/A'}
                  </div>
                  <div>
                    <strong>Version:</strong> {selectedDocument.version || 'N/A'}
                  </div>
                  <div>
                    <strong>Uploaded:</strong> {selectedDocument.uploaded_at.toLocaleDateString()}
                  </div>
                </div>

                {selectedDocument.asphalt_categories.length > 0 && (
                  <div>
                    <strong className="text-sm">Categories:</strong>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {selectedDocument.asphalt_categories.map(cat => (
                        <Badge key={cat} variant="secondary" className="text-xs">
                          {cat.replace('_', ' ')}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <strong className="text-sm">Content:</strong>
                  <div className="mt-2 p-4 bg-muted rounded border whitespace-pre-wrap text-sm">
                    {selectedDocument.content}
                  </div>
                </div>
              </div>
            </ScrollArea>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}