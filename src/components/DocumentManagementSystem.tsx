import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import {
  FileText,
  Upload,
  Download,
  Eye,
  Edit,
  Trash2,
  Search,
  Filter,
  Tag,
  Calendar,
  User,
  FolderOpen,
  Plus,
  Share,
  Archive,
  Star,
  AlertTriangle,
  CheckCircle,
  Clock,
  Building2,
  Truck,
  Package,
  Settings,
  BookOpen,
  Image,
  Video,
  FileCode,
  FileImage,
  FileSpreadsheet,
  FileVideo,
  FileAudio
} from 'lucide-react';

export interface Document {
  id: string;
  name: string;
  description?: string;
  type: 'manual' | 'guide' | 'specification' | 'warranty' | 'certification' | 'training' | 'maintenance' | 'safety' | 'other';
  category: 'equipment' | 'vehicle' | 'material' | 'general';
  fileType: string;
  fileSize: number;
  url: string;
  thumbnailUrl?: string;
  uploadedBy: string;
  uploadDate: Date;
  lastModified: Date;
  lastAccessed?: Date;
  tags: string[];
  version: string;
  isPublic: boolean;
  parentEntityId?: string; // ID of equipment, vehicle, or material
  parentEntityType?: 'equipment' | 'vehicle' | 'material';
  parentEntityName?: string;
  expirationDate?: Date;
  status: 'active' | 'archived' | 'expired' | 'under_review';
  downloadCount: number;
  favoriteCount: number;
  accessLevel: 'public' | 'internal' | 'restricted' | 'confidential';
}

interface DocumentFolder {
  id: string;
  name: string;
  description?: string;
  parentId?: string;
  path: string;
  documentCount: number;
  color?: string;
  icon?: string;
}

interface UploadProgress {
  fileName: string;
  progress: number;
  status: 'uploading' | 'processing' | 'completed' | 'error';
  error?: string;
}

interface DocumentManagementProps {
  parentEntityId?: string;
  parentEntityType?: 'equipment' | 'vehicle' | 'material';
  parentEntityName?: string;
  showFilters?: boolean;
  allowUpload?: boolean;
  compact?: boolean;
}

export default function DocumentManagementSystem({
  parentEntityId,
  parentEntityType,
  parentEntityName,
  showFilters = true,
  allowUpload = true,
  compact = false
}: DocumentManagementProps) {
  const { toast } = useToast();
  
  const [documents, setDocuments] = useState<Document[]>([]);
  const [filteredDocuments, setFilteredDocuments] = useState<Document[]>([]);
  const [folders, setFolders] = useState<DocumentFolder[]>([]);
  const [selectedFolder, setSelectedFolder] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState<'name' | 'date' | 'size' | 'type'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [uploadProgress, setUploadProgress] = useState<UploadProgress[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const [isAddingDocument, setIsAddingDocument] = useState(false);
  const [favorites, setFavorites] = useState<string[]>([]);

  const documentTypes = [
    { value: 'manual', label: 'Manual', icon: <BookOpen className="h-4 w-4" /> },
    { value: 'guide', label: 'Guide', icon: <FileText className="h-4 w-4" /> },
    { value: 'specification', label: 'Specification', icon: <Settings className="h-4 w-4" /> },
    { value: 'warranty', label: 'Warranty', icon: <Shield className="h-4 w-4" /> },
    { value: 'certification', label: 'Certification', icon: <CheckCircle className="h-4 w-4" /> },
    { value: 'training', label: 'Training', icon: <User className="h-4 w-4" /> },
    { value: 'maintenance', label: 'Maintenance', icon: <Settings className="h-4 w-4" /> },
    { value: 'safety', label: 'Safety', icon: <AlertTriangle className="h-4 w-4" /> },
    { value: 'other', label: 'Other', icon: <FileText className="h-4 w-4" /> }
  ];

  useEffect(() => {
    loadDocuments();
    loadFolders();
  }, [parentEntityId, parentEntityType]);

  useEffect(() => {
    filterDocuments();
  }, [documents, searchTerm, selectedType, selectedCategory, selectedFolder, sortBy, sortOrder]);

  const loadDocuments = async () => {
    // Mock data - replace with actual API call
    const mockDocuments: Document[] = [
      {
        id: 'doc-001',
        name: 'CAT 320 Excavator Manual',
        description: 'Complete operator and maintenance manual for CAT 320 excavator',
        type: 'manual',
        category: 'equipment',
        fileType: 'application/pdf',
        fileSize: 15680000,
        url: '/docs/cat-320-manual.pdf',
        uploadedBy: 'John Smith',
        uploadDate: new Date('2024-01-15'),
        lastModified: new Date('2024-01-15'),
        tags: ['excavator', 'caterpillar', 'manual', 'maintenance'],
        version: '2.1',
        isPublic: false,
        parentEntityId: parentEntityId === 'eq-001' ? 'eq-001' : undefined,
        parentEntityType: parentEntityType === 'equipment' ? 'equipment' : undefined,
        parentEntityName: parentEntityName || 'CAT 320 Excavator',
        status: 'active',
        downloadCount: 45,
        favoriteCount: 12,
        accessLevel: 'internal'
      },
      {
        id: 'doc-002',
        name: 'Safety Procedures Guide',
        description: 'Comprehensive safety procedures for construction equipment operation',
        type: 'safety',
        category: 'general',
        fileType: 'application/pdf',
        fileSize: 5240000,
        url: '/docs/safety-procedures.pdf',
        uploadedBy: 'Sarah Johnson',
        uploadDate: new Date('2024-01-10'),
        lastModified: new Date('2024-01-12'),
        lastAccessed: new Date('2024-01-20'),
        tags: ['safety', 'procedures', 'construction', 'osha'],
        version: '3.0',
        isPublic: true,
        status: 'active',
        downloadCount: 89,
        favoriteCount: 28,
        accessLevel: 'public'
      },
      {
        id: 'doc-003',
        name: 'Ford F-150 Service Manual',
        description: 'Service and repair manual for Ford F-150 fleet vehicles',
        type: 'manual',
        category: 'vehicle',
        fileType: 'application/pdf',
        fileSize: 12450000,
        url: '/docs/ford-f150-service.pdf',
        uploadedBy: 'Mike Wilson',
        uploadDate: new Date('2024-01-08'),
        lastModified: new Date('2024-01-08'),
        tags: ['ford', 'f-150', 'service', 'repair', 'maintenance'],
        version: '1.0',
        isPublic: false,
        parentEntityId: parentEntityId === 'veh-001' ? 'veh-001' : undefined,
        parentEntityType: parentEntityType === 'vehicle' ? 'vehicle' : undefined,
        parentEntityName: parentEntityName || 'Ford F-150',
        expirationDate: new Date('2025-01-08'),
        status: 'active',
        downloadCount: 23,
        favoriteCount: 8,
        accessLevel: 'internal'
      },
      {
        id: 'doc-004',
        name: 'Asphalt Material Specifications',
        description: 'Technical specifications for asphalt materials and testing procedures',
        type: 'specification',
        category: 'material',
        fileType: 'application/pdf',
        fileSize: 8750000,
        url: '/docs/asphalt-specs.pdf',
        uploadedBy: 'Emily Davis',
        uploadDate: new Date('2024-01-05'),
        lastModified: new Date('2024-01-05'),
        tags: ['asphalt', 'specifications', 'testing', 'materials'],
        version: '2.3',
        isPublic: false,
        parentEntityId: parentEntityId === 'mat-001' ? 'mat-001' : undefined,
        parentEntityType: parentEntityType === 'material' ? 'material' : undefined,
        parentEntityName: parentEntityName || 'Premium Asphalt Mix',
        status: 'active',
        downloadCount: 67,
        favoriteCount: 15,
        accessLevel: 'internal'
      }
    ];

    // Filter by parent entity if specified
    const filteredDocs = parentEntityId 
      ? mockDocuments.filter(doc => doc.parentEntityId === parentEntityId)
      : mockDocuments;

    setDocuments(filteredDocs);
  };

  const loadFolders = async () => {
    const mockFolders: DocumentFolder[] = [
      {
        id: 'equipment',
        name: 'Equipment',
        description: 'Equipment manuals and documentation',
        path: '/equipment',
        documentCount: 25,
        color: '#3b82f6',
        icon: 'settings'
      },
      {
        id: 'vehicles',
        name: 'Vehicles',
        description: 'Vehicle manuals and service documents',
        path: '/vehicles',
        documentCount: 18,
        color: '#10b981',
        icon: 'truck'
      },
      {
        id: 'materials',
        name: 'Materials',
        description: 'Material specifications and guides',
        path: '/materials',
        documentCount: 32,
        color: '#f59e0b',
        icon: 'package'
      },
      {
        id: 'safety',
        name: 'Safety',
        description: 'Safety procedures and training materials',
        path: '/safety',
        documentCount: 15,
        color: '#ef4444',
        icon: 'shield'
      }
    ];

    setFolders(mockFolders);
  };

  const filterDocuments = () => {
    let filtered = [...documents];

    // Search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(doc =>
        doc.name.toLowerCase().includes(term) ||
        doc.description?.toLowerCase().includes(term) ||
        doc.tags.some(tag => tag.toLowerCase().includes(term))
      );
    }

    // Type filter
    if (selectedType !== 'all') {
      filtered = filtered.filter(doc => doc.type === selectedType);
    }

    // Category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(doc => doc.category === selectedCategory);
    }

    // Folder filter
    if (selectedFolder !== 'all') {
      filtered = filtered.filter(doc => doc.category === selectedFolder);
    }

    // Sort
    filtered.sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'date':
          comparison = a.uploadDate.getTime() - b.uploadDate.getTime();
          break;
        case 'size':
          comparison = a.fileSize - b.fileSize;
          break;
        case 'type':
          comparison = a.type.localeCompare(b.type);
          break;
      }

      return sortOrder === 'desc' ? -comparison : comparison;
    });

    setFilteredDocuments(filtered);
  };

  const handleFileUpload = useCallback(async (files: FileList) => {
    const uploadPromises = Array.from(files).map(async (file) => {
      setUploadProgress(prev => [...prev, {
        fileName: file.name,
        progress: 0,
        status: 'uploading'
      }]);

      try {
        // Simulate upload progress
        for (let progress = 0; progress <= 90; progress += 10) {
          await new Promise(resolve => setTimeout(resolve, 200));
          setUploadProgress(prev => prev.map(p => 
            p.fileName === file.name ? { ...p, progress } : p
          ));
        }

        // Processing phase
        setUploadProgress(prev => prev.map(p => 
          p.fileName === file.name ? { ...p, status: 'processing', progress: 95 } : p
        ));

        await new Promise(resolve => setTimeout(resolve, 1000));

        // Create new document
        const newDocument: Document = {
          id: `doc-${Date.now()}`,
          name: file.name.replace(/\.[^/.]+$/, ""),
          type: 'other',
          category: parentEntityType || 'general',
          fileType: file.type,
          fileSize: file.size,
          url: URL.createObjectURL(file),
          uploadedBy: 'Current User',
          uploadDate: new Date(),
          lastModified: new Date(),
          tags: [],
          version: '1.0',
          isPublic: false,
          parentEntityId,
          parentEntityType,
          parentEntityName,
          status: 'active',
          downloadCount: 0,
          favoriteCount: 0,
          accessLevel: 'internal'
        };

        setDocuments(prev => [newDocument, ...prev]);

        setUploadProgress(prev => prev.map(p => 
          p.fileName === file.name ? { ...p, status: 'completed', progress: 100 } : p
        ));

        toast({
          title: "Upload Successful",
          description: `${file.name} has been uploaded successfully.`,
        });

      } catch (error) {
        setUploadProgress(prev => prev.map(p => 
          p.fileName === file.name ? { ...p, status: 'error', error: 'Upload failed' } : p
        ));

        toast({
          title: "Upload Failed",
          description: `Failed to upload ${file.name}. Please try again.`,
          variant: "destructive"
        });
      }
    });

    await Promise.all(uploadPromises);
    
    setTimeout(() => {
      setUploadProgress([]);
    }, 3000);
  }, [parentEntityId, parentEntityType, parentEntityName, toast]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileUpload(files);
    }
  }, [handleFileUpload]);

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith('image/')) return <FileImage className="h-4 w-4" />;
    if (fileType.startsWith('video/')) return <FileVideo className="h-4 w-4" />;
    if (fileType.startsWith('audio/')) return <FileAudio className="h-4 w-4" />;
    if (fileType.includes('spreadsheet') || fileType.includes('excel')) return <FileSpreadsheet className="h-4 w-4" />;
    if (fileType.includes('code')) return <FileCode className="h-4 w-4" />;
    return <FileText className="h-4 w-4" />;
  };

  const getTypeIcon = (type: string) => {
    const typeConfig = documentTypes.find(t => t.value === type);
    return typeConfig?.icon || <FileText className="h-4 w-4" />;
  };

  const toggleFavorite = (documentId: string) => {
    setFavorites(prev => 
      prev.includes(documentId)
        ? prev.filter(id => id !== documentId)
        : [...prev, documentId]
    );
  };

  const downloadDocument = (doc: Document) => {
    // Simulate download
    const link = document.createElement('a');
    link.href = doc.url;
    link.download = doc.name;
    link.click();

    // Update download count
    setDocuments(prev => prev.map(d => 
      d.id === doc.id ? { ...d, downloadCount: d.downloadCount + 1, lastAccessed: new Date() } : d
    ));

    toast({
      title: "Download Started",
      description: `Downloading ${doc.name}`,
    });
  };

  if (compact) {
    return (
      <div className="space-y-4">
        {allowUpload && (
          <div
            className={`border-2 border-dashed rounded-lg p-4 text-center transition-colors ${
              dragOver ? 'border-primary bg-primary/5' : 'border-muted-foreground/25'
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <Upload className="h-6 w-6 mx-auto mb-2 text-muted-foreground" />
            <p className="text-sm text-muted-foreground mb-2">Drop files here or click to browse</p>
            <input
              type="file"
              multiple
              onChange={(e) => e.target.files && handleFileUpload(e.target.files)}
              className="hidden"
              id="compact-upload"
            />
            <Button variant="outline" size="sm" asChild>
              <label htmlFor="compact-upload" className="cursor-pointer">
                <Plus className="h-4 w-4 mr-2" />
                Add Documents
              </label>
            </Button>
          </div>
        )}

        <div className="space-y-2">
          {filteredDocuments.slice(0, 5).map((doc) => (
            <div key={doc.id} className="flex items-center justify-between p-3 border rounded hover:bg-muted/50">
              <div className="flex items-center gap-3">
                {getFileIcon(doc.fileType)}
                <div>
                  <p className="font-medium text-sm">{doc.name}</p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Badge variant="outline" className="text-xs">
                      {documentTypes.find(t => t.value === doc.type)?.label}
                    </Badge>
                    <span>{formatFileSize(doc.fileSize)}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="sm" onClick={() => downloadDocument(doc)}>
                  <Download className="h-3 w-3" />
                </Button>
                <Button variant="ghost" size="sm" onClick={() => setSelectedDocument(doc)}>
                  <Eye className="h-3 w-3" />
                </Button>
              </div>
            </div>
          ))}
          
          {filteredDocuments.length > 5 && (
            <Button variant="outline" size="sm" className="w-full">
              View All {filteredDocuments.length} Documents
            </Button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <FolderOpen className="h-6 w-6" />
            Document Management
            {parentEntityName && (
              <span className="text-muted-foreground">- {parentEntityName}</span>
            )}
          </h2>
          <p className="text-muted-foreground">
            Manage manuals, guides, and documentation
          </p>
        </div>
        {allowUpload && (
          <Button onClick={() => setIsAddingDocument(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Document
          </Button>
        )}
      </div>

      {/* Upload Progress */}
      {uploadProgress.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Upload Progress</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {uploadProgress.map((upload, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>{upload.fileName}</span>
                  <span className="flex items-center gap-2">
                    {upload.status === 'completed' && <CheckCircle className="h-4 w-4 text-green-500" />}
                    {upload.status === 'error' && <AlertTriangle className="h-4 w-4 text-red-500" />}
                    {upload.status === 'processing' && <Clock className="h-4 w-4 text-blue-500" />}
                    {upload.progress}%
                  </span>
                </div>
                <Progress value={upload.progress} className="h-2" />
                {upload.error && (
                  <p className="text-xs text-red-500">{upload.error}</p>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Filters and Search */}
      {showFilters && (
        <Card>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
              <div>
                <Label htmlFor="search">Search Documents</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="search"
                    placeholder="Search documents..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="type">Document Type</Label>
                <Select value={selectedType} onValueChange={setSelectedType}>
                  <SelectTrigger id="type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    {documentTypes.map(type => (
                      <SelectItem key={type.value} value={type.value}>
                        <div className="flex items-center gap-2">
                          {type.icon}
                          {type.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="category">Category</Label>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger id="category">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value="equipment">Equipment</SelectItem>
                    <SelectItem value="vehicle">Vehicle</SelectItem>
                    <SelectItem value="material">Material</SelectItem>
                    <SelectItem value="general">General</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="sort">Sort By</Label>
                <Select value={`${sortBy}-${sortOrder}`} onValueChange={(value) => {
                  const [field, order] = value.split('-');
                  setSortBy(field as any);
                  setSortOrder(order as any);
                }}>
                  <SelectTrigger id="sort">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="date-desc">Newest First</SelectItem>
                    <SelectItem value="date-asc">Oldest First</SelectItem>
                    <SelectItem value="name-asc">Name A-Z</SelectItem>
                    <SelectItem value="name-desc">Name Z-A</SelectItem>
                    <SelectItem value="size-desc">Largest First</SelectItem>
                    <SelectItem value="size-asc">Smallest First</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                >
                  Grid
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                >
                  List
                </Button>
              </div>
              <div className="text-sm text-muted-foreground">
                {filteredDocuments.length} document(s) found
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Document Grid/List */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredDocuments.map((doc) => (
            <Card key={doc.id} className="hover:shadow-lg transition-shadow cursor-pointer group">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    {getFileIcon(doc.fileType)}
                    <Badge variant="outline" className="text-xs">
                      {documentTypes.find(t => t.value === doc.type)?.label}
                    </Badge>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleFavorite(doc.id)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Star className={`h-4 w-4 ${favorites.includes(doc.id) ? 'fill-current text-yellow-500' : ''}`} />
                  </Button>
                </div>
                <div>
                  <h3 className="font-semibold text-sm line-clamp-2">{doc.name}</h3>
                  {doc.description && (
                    <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                      {doc.description}
                    </p>
                  )}
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>{formatFileSize(doc.fileSize)}</span>
                    <span>{doc.uploadDate.toLocaleDateString()}</span>
                  </div>
                  
                  {doc.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {doc.tags.slice(0, 3).map((tag, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                      {doc.tags.length > 3 && (
                        <span className="text-xs text-muted-foreground">+{doc.tags.length - 3}</span>
                      )}
                    </div>
                  )}

                  <div className="flex items-center gap-1 pt-2">
                    <Button variant="ghost" size="sm" onClick={() => setSelectedDocument(doc)}>
                      <Eye className="h-3 w-3 mr-1" />
                      View
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => downloadDocument(doc)}>
                      <Download className="h-3 w-3 mr-1" />
                      Download
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="space-y-0">
              {filteredDocuments.map((doc, index) => (
                <div key={doc.id} className={`flex items-center justify-between p-4 hover:bg-muted/50 ${index > 0 ? 'border-t' : ''}`}>
                  <div className="flex items-center gap-4 flex-1">
                    {getFileIcon(doc.fileType)}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold truncate">{doc.name}</h3>
                        <Badge variant="outline" className="text-xs">
                          {documentTypes.find(t => t.value === doc.type)?.label}
                        </Badge>
                        {favorites.includes(doc.id) && (
                          <Star className="h-3 w-3 fill-current text-yellow-500" />
                        )}
                      </div>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span>{formatFileSize(doc.fileSize)}</span>
                        <span>Uploaded by {doc.uploadedBy}</span>
                        <span>{doc.uploadDate.toLocaleDateString()}</span>
                        <span>{doc.downloadCount} downloads</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm" onClick={() => toggleFavorite(doc.id)}>
                      <Star className={`h-4 w-4 ${favorites.includes(doc.id) ? 'fill-current text-yellow-500' : ''}`} />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => setSelectedDocument(doc)}>
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => downloadDocument(doc)}>
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Document Detail Dialog */}
      {selectedDocument && (
        <Dialog open={!!selectedDocument} onOpenChange={() => setSelectedDocument(null)}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                {getFileIcon(selectedDocument.fileType)}
                {selectedDocument.name}
              </DialogTitle>
            </DialogHeader>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2 space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">Description</h3>
                  <p className="text-muted-foreground">
                    {selectedDocument.description || 'No description available.'}
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Tags</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedDocument.tags.map((tag, index) => (
                      <Badge key={index} variant="secondary">{tag}</Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Actions</h3>
                  <div className="flex gap-2">
                    <Button onClick={() => downloadDocument(selectedDocument)}>
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                    <Button variant="outline">
                      <Share className="h-4 w-4 mr-2" />
                      Share
                    </Button>
                    <Button variant="outline" onClick={() => toggleFavorite(selectedDocument.id)}>
                      <Star className={`h-4 w-4 mr-2 ${favorites.includes(selectedDocument.id) ? 'fill-current' : ''}`} />
                      {favorites.includes(selectedDocument.id) ? 'Remove from Favorites' : 'Add to Favorites'}
                    </Button>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">Document Details</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Type:</span>
                      <Badge variant="outline">
                        {documentTypes.find(t => t.value === selectedDocument.type)?.label}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Category:</span>
                      <span>{selectedDocument.category}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Size:</span>
                      <span>{formatFileSize(selectedDocument.fileSize)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Version:</span>
                      <span>{selectedDocument.version}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Status:</span>
                      <Badge variant={selectedDocument.status === 'active' ? 'default' : 'secondary'}>
                        {selectedDocument.status}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Access Level:</span>
                      <Badge variant="outline">{selectedDocument.accessLevel}</Badge>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Upload Information</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Uploaded by:</span>
                      <span>{selectedDocument.uploadedBy}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Upload date:</span>
                      <span>{selectedDocument.uploadDate.toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Last modified:</span>
                      <span>{selectedDocument.lastModified.toLocaleDateString()}</span>
                    </div>
                    {selectedDocument.lastAccessed && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Last accessed:</span>
                        <span>{selectedDocument.lastAccessed.toLocaleDateString()}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Statistics</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Downloads:</span>
                      <span>{selectedDocument.downloadCount}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Favorites:</span>
                      <span>{selectedDocument.favoriteCount}</span>
                    </div>
                  </div>
                </div>

                {selectedDocument.expirationDate && (
                  <div>
                    <h3 className="font-semibold mb-2">Expiration</h3>
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="h-4 w-4" />
                      <span>{selectedDocument.expirationDate.toLocaleDateString()}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Upload Dialog */}
      {allowUpload && (
        <Dialog open={isAddingDocument} onOpenChange={setIsAddingDocument}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Upload Documents</DialogTitle>
            </DialogHeader>
            
            <div
              className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                dragOver ? 'border-primary bg-primary/5' : 'border-muted-foreground/25'
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
              <p className="text-muted-foreground mb-2">
                Drag and drop files here, or click to browse
              </p>
              <input
                type="file"
                multiple
                onChange={(e) => e.target.files && handleFileUpload(e.target.files)}
                className="hidden"
                id="dialog-upload"
              />
              <Button variant="outline" asChild>
                <label htmlFor="dialog-upload" className="cursor-pointer">
                  Browse Files
                </label>
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}