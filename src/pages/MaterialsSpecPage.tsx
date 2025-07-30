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
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import {
  Package,
  Upload,
  Download,
  FileText,
  Image,
  FilePlus,
  Search,
  Filter,
  Edit,
  Trash2,
  Eye,
  Star,
  AlertTriangle,
  CheckCircle,
  Calendar,
  Building2,
  Truck,
  Scale,
  Thermometer,
  Droplets,
  Zap,
  Shield,
  Clock,
  DollarSign,
  Phone,
  Mail,
  ExternalLink
} from 'lucide-react';

interface MaterialSpec {
  id: string;
  name: string;
  category: string;
  subcategory: string;
  manufacturer: string;
  model: string;
  description: string;
  specifications: Record<string, string>;
  applications: string[];
  certifications: string[];
  safetyInfo: {
    hazardClass?: string;
    safetyDataSheet?: string;
    personalProtectiveEquipment: string[];
    storageRequirements: string;
  };
  pricing: {
    unitPrice: number;
    unit: string;
    currency: string;
    minimumOrder?: number;
    bulkPricing?: Array<{
      quantity: number;
      price: number;
    }>;
  };
  availability: {
    inStock: boolean;
    leadTime: string;
    suppliers: Array<{
      name: string;
      contact: string;
      location: string;
      rating: number;
    }>;
  };
  documents: Array<{
    id: string;
    name: string;
    type: 'spec_sheet' | 'safety_data' | 'certification' | 'installation_guide' | 'warranty' | 'test_results';
    url: string;
    uploadDate: Date;
    fileSize: number;
    fileType: string;
  }>;
  lastUpdated: Date;
  status: 'active' | 'discontinued' | 'under_review';
  rating: number;
  reviews: number;
}

interface UploadProgress {
  fileName: string;
  progress: number;
  status: 'uploading' | 'completed' | 'error';
}

export default function MaterialsSpecPage() {
  const { toast } = useToast();
  
  const [materials, setMaterials] = useState<MaterialSpec[]>([]);
  const [filteredMaterials, setFilteredMaterials] = useState<MaterialSpec[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedManufacturer, setSelectedManufacturer] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddingMaterial, setIsAddingMaterial] = useState(false);
  const [selectedMaterial, setSelectedMaterial] = useState<MaterialSpec | null>(null);
  const [uploadProgress, setUploadProgress] = useState<UploadProgress[]>([]);
  const [dragOver, setDragOver] = useState(false);

  const categories = [
    'Asphalt & Sealcoating',
    'Concrete',
    'Aggregates',
    'Additives & Chemicals',
    'Tools & Equipment',
    'Safety Equipment',
    'Marking Materials'
  ];

  const manufacturers = [
    'BASF',
    'Dow Chemical',
    'Shell',
    'ExxonMobil',
    'Cargill',
    'SealMaster',
    'GemSeal',
    'Crafco',
    'Other'
  ];

  useEffect(() => {
    loadMaterials();
  }, []);

  useEffect(() => {
    filterMaterials();
  }, [materials, selectedCategory, selectedManufacturer, searchTerm]);

  const loadMaterials = async () => {
    // Mock data - replace with actual API call
    const mockMaterials: MaterialSpec[] = [
      {
        id: 'mat-001',
        name: 'Premium Coal Tar Sealer',
        category: 'Asphalt & Sealcoating',
        subcategory: 'Coal Tar Sealers',
        manufacturer: 'SealMaster',
        model: 'Premium CT-200',
        description: 'High-performance coal tar sealer designed for commercial and residential applications. Provides excellent protection against weather, chemicals, and wear.',
        specifications: {
          'Solids Content': '50-55%',
          'Viscosity': '2500-3500 cP',
          'pH': '11.5-12.5',
          'Freeze Point': '32°F (0°C)',
          'Coverage': '60-80 sq ft/gallon',
          'Dry Time': '4-8 hours',
          'Traffic Ready': '24-48 hours'
        },
        applications: [
          'Parking lots',
          'Driveways',
          'Tennis courts',
          'Airport runways',
          'Industrial surfaces'
        ],
        certifications: [
          'ASTM D490',
          'ASTM D2939',
          'Federal Specification SS-S-200',
          'VOC Compliant'
        ],
        safetyInfo: {
          hazardClass: 'Hazard Class 3',
          safetyDataSheet: '/docs/sealmaster-ct200-sds.pdf',
          personalProtectiveEquipment: [
            'Safety glasses',
            'Chemical-resistant gloves',
            'Long sleeves',
            'Respirator when spraying'
          ],
          storageRequirements: 'Store in cool, dry place. Keep from freezing. Temperature range: 40-90°F'
        },
        pricing: {
          unitPrice: 24.50,
          unit: 'gallon',
          currency: 'USD',
          minimumOrder: 5,
          bulkPricing: [
            { quantity: 50, price: 22.50 },
            { quantity: 100, price: 21.00 },
            { quantity: 500, price: 19.50 }
          ]
        },
        availability: {
          inStock: true,
          leadTime: '1-2 business days',
          suppliers: [
            {
              name: 'Virginia Sealcoating Supply',
              contact: '(804) 555-0123',
              location: 'Richmond, VA',
              rating: 4.5
            },
            {
              name: 'Mid-Atlantic Materials',
              contact: '(757) 555-0456',
              location: 'Norfolk, VA',
              rating: 4.2
            }
          ]
        },
        documents: [
          {
            id: 'doc-001',
            name: 'Product Specification Sheet',
            type: 'spec_sheet',
            url: '/docs/sealmaster-ct200-spec.pdf',
            uploadDate: new Date('2024-01-15'),
            fileSize: 2150000,
            fileType: 'application/pdf'
          },
          {
            id: 'doc-002',
            name: 'Safety Data Sheet',
            type: 'safety_data',
            url: '/docs/sealmaster-ct200-sds.pdf',
            uploadDate: new Date('2024-01-15'),
            fileSize: 1800000,
            fileType: 'application/pdf'
          },
          {
            id: 'doc-003',
            name: 'Application Guide',
            type: 'installation_guide',
            url: '/docs/sealmaster-ct200-guide.pdf',
            uploadDate: new Date('2024-01-10'),
            fileSize: 3200000,
            fileType: 'application/pdf'
          }
        ],
        lastUpdated: new Date('2024-01-15'),
        status: 'active',
        rating: 4.6,
        reviews: 127
      },
      {
        id: 'mat-002',
        name: 'Acrylic Crack Filler',
        category: 'Asphalt & Sealcoating',
        subcategory: 'Crack Fillers',
        manufacturer: 'Crafco',
        model: 'Roadsaver RS-1',
        description: 'Premium acrylic crack filler for asphalt pavement maintenance. Self-leveling formula with excellent adhesion.',
        specifications: {
          'Solids Content': '65-70%',
          'Elongation': '400%',
          'Tensile Strength': '250 psi',
          'Temperature Range': '-20°F to 160°F',
          'Coverage': '150-200 linear feet/gallon',
          'Cure Time': '30-60 minutes'
        },
        applications: [
          'Crack sealing',
          'Joint sealing',
          'Pavement maintenance',
          'Preventive maintenance'
        ],
        certifications: [
          'ASTM D6690',
          'AASHTO M324',
          'Federal Specification SS-S-1401'
        ],
        safetyInfo: {
          personalProtectiveEquipment: [
            'Safety glasses',
            'Work gloves',
            'Long pants'
          ],
          storageRequirements: 'Store in temperatures between 40-80°F. Do not freeze.'
        },
        pricing: {
          unitPrice: 32.00,
          unit: 'gallon',
          currency: 'USD',
          minimumOrder: 1
        },
        availability: {
          inStock: true,
          leadTime: '3-5 business days',
          suppliers: [
            {
              name: 'Pavement Supply Co.',
              contact: '(804) 555-0789',
              location: 'Richmond, VA',
              rating: 4.3
            }
          ]
        },
        documents: [
          {
            id: 'doc-004',
            name: 'Technical Data Sheet',
            type: 'spec_sheet',
            url: '/docs/crafco-rs1-spec.pdf',
            uploadDate: new Date('2024-01-12'),
            fileSize: 1950000,
            fileType: 'application/pdf'
          }
        ],
        lastUpdated: new Date('2024-01-12'),
        status: 'active',
        rating: 4.3,
        reviews: 89
      }
    ];

    setMaterials(mockMaterials);
  };

  const filterMaterials = () => {
    let filtered = materials;

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(m => m.category === selectedCategory);
    }

    if (selectedManufacturer !== 'all') {
      filtered = filtered.filter(m => m.manufacturer === selectedManufacturer);
    }

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(m => 
        m.name.toLowerCase().includes(term) ||
        m.description.toLowerCase().includes(term) ||
        m.manufacturer.toLowerCase().includes(term) ||
        m.model.toLowerCase().includes(term)
      );
    }

    setFilteredMaterials(filtered);
  };

  const handleFileUpload = useCallback(async (files: FileList, materialId?: string) => {
    const uploadPromises = Array.from(files).map(async (file) => {
      const progressId = `${file.name}-${Date.now()}`;
      
      setUploadProgress(prev => [...prev, {
        fileName: file.name,
        progress: 0,
        status: 'uploading'
      }]);

      try {
        // Simulate file upload progress
        for (let progress = 0; progress <= 100; progress += 10) {
          await new Promise(resolve => setTimeout(resolve, 200));
          setUploadProgress(prev => prev.map(p => 
            p.fileName === file.name ? { ...p, progress } : p
          ));
        }

        // Simulate successful upload
        const newDocument = {
          id: `doc-${Date.now()}`,
          name: file.name,
          type: 'spec_sheet' as const,
          url: URL.createObjectURL(file),
          uploadDate: new Date(),
          fileSize: file.size,
          fileType: file.type
        };

        if (materialId) {
          setMaterials(prev => prev.map(m => 
            m.id === materialId 
              ? { ...m, documents: [...m.documents, newDocument] }
              : m
          ));
        }

        setUploadProgress(prev => prev.map(p => 
          p.fileName === file.name ? { ...p, status: 'completed' } : p
        ));

        toast({
          title: "Upload Successful",
          description: `${file.name} has been uploaded successfully.`,
        });

      } catch (error) {
        setUploadProgress(prev => prev.map(p => 
          p.fileName === file.name ? { ...p, status: 'error' } : p
        ));

        toast({
          title: "Upload Failed",
          description: `Failed to upload ${file.name}. Please try again.`,
          variant: "destructive"
        });
      }
    });

    await Promise.all(uploadPromises);
    
    // Clear upload progress after a delay
    setTimeout(() => {
      setUploadProgress([]);
    }, 3000);
  }, [toast]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent, materialId?: string) => {
    e.preventDefault();
    setDragOver(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileUpload(files, materialId);
    }
  }, [handleFileUpload]);

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getDocumentTypeIcon = (type: string) => {
    switch (type) {
      case 'spec_sheet': return <FileText className="h-4 w-4" />;
      case 'safety_data': return <Shield className="h-4 w-4" />;
      case 'certification': return <CheckCircle className="h-4 w-4" />;
      case 'installation_guide': return <Package className="h-4 w-4" />;
      case 'warranty': return <Star className="h-4 w-4" />;
      case 'test_results': return <Scale className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  const getDocumentTypeName = (type: string) => {
    switch (type) {
      case 'spec_sheet': return 'Specification Sheet';
      case 'safety_data': return 'Safety Data Sheet';
      case 'certification': return 'Certification';
      case 'installation_guide': return 'Installation Guide';
      case 'warranty': return 'Warranty Information';
      case 'test_results': return 'Test Results';
      default: return 'Document';
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${
          i < Math.floor(rating) 
            ? 'fill-current text-yellow-400' 
            : i < rating 
            ? 'fill-current text-yellow-200' 
            : 'text-gray-300'
        }`}
      />
    ));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Package className="h-8 w-8" />
            Materials Specifications
          </h1>
          <p className="text-muted-foreground">
            Comprehensive material database with specifications and documentation
          </p>
        </div>
        <Button onClick={() => setIsAddingMaterial(true)}>
          <FilePlus className="h-4 w-4 mr-2" />
          Add Material
        </Button>
      </div>

      {/* Upload Progress */}
      {uploadProgress.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">File Upload Progress</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {uploadProgress.map((upload, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>{upload.fileName}</span>
                  <span className="flex items-center gap-2">
                    {upload.status === 'completed' && <CheckCircle className="h-4 w-4 text-green-500" />}
                    {upload.status === 'error' && <AlertTriangle className="h-4 w-4 text-red-500" />}
                    {upload.progress}%
                  </span>
                </div>
                <Progress value={upload.progress} className="h-2" />
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="search">Search Materials</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Search by name, manufacturer, model..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="category">Category</Label>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger id="category">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map(category => (
                    <SelectItem key={category} value={category}>{category}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="manufacturer">Manufacturer</Label>
              <Select value={selectedManufacturer} onValueChange={setSelectedManufacturer}>
                <SelectTrigger id="manufacturer">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Manufacturers</SelectItem>
                  {manufacturers.map(manufacturer => (
                    <SelectItem key={manufacturer} value={manufacturer}>{manufacturer}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Materials Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredMaterials.map((material) => (
          <Card key={material.id} className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setSelectedMaterial(material)}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg">{material.name}</CardTitle>
                  <p className="text-sm text-muted-foreground">{material.manufacturer} - {material.model}</p>
                </div>
                <Badge variant={material.status === 'active' ? 'default' : 'secondary'}>
                  {material.status}
                </Badge>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1">
                  {renderStars(material.rating)}
                </div>
                <span className="text-sm text-muted-foreground">
                  {material.rating} ({material.reviews} reviews)
                </span>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <Badge variant="outline">{material.category}</Badge>
                  {material.subcategory && (
                    <Badge variant="outline" className="ml-2">{material.subcategory}</Badge>
                  )}
                </div>
                
                <p className="text-sm text-muted-foreground line-clamp-3">
                  {material.description}
                </p>

                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">
                    ${material.pricing.unitPrice.toFixed(2)}/{material.pricing.unit}
                  </span>
                  <span className={`flex items-center gap-1 ${material.availability.inStock ? 'text-green-600' : 'text-red-600'}`}>
                    <div className={`w-2 h-2 rounded-full ${material.availability.inStock ? 'bg-green-500' : 'bg-red-500'}`} />
                    {material.availability.inStock ? 'In Stock' : 'Out of Stock'}
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>{material.documents.length} documents</span>
                  <span>Updated {material.lastUpdated.toLocaleDateString()}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Material Detail Dialog */}
      {selectedMaterial && (
        <Dialog open={!!selectedMaterial} onOpenChange={() => setSelectedMaterial(null)}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Package className="h-6 w-6" />
                {selectedMaterial.name}
              </DialogTitle>
            </DialogHeader>

            <Tabs defaultValue="specifications" className="w-full">
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="specifications">Specifications</TabsTrigger>
                <TabsTrigger value="documents">Documents</TabsTrigger>
                <TabsTrigger value="safety">Safety</TabsTrigger>
                <TabsTrigger value="pricing">Pricing</TabsTrigger>
                <TabsTrigger value="suppliers">Suppliers</TabsTrigger>
              </TabsList>

              <TabsContent value="specifications" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h3 className="font-semibold mb-2">Product Information</h3>
                    <div className="space-y-2 text-sm">
                      <div><strong>Manufacturer:</strong> {selectedMaterial.manufacturer}</div>
                      <div><strong>Model:</strong> {selectedMaterial.model}</div>
                      <div><strong>Category:</strong> {selectedMaterial.category}</div>
                      {selectedMaterial.subcategory && (
                        <div><strong>Subcategory:</strong> {selectedMaterial.subcategory}</div>
                      )}
                      <div><strong>Status:</strong> 
                        <Badge variant={selectedMaterial.status === 'active' ? 'default' : 'secondary'} className="ml-2">
                          {selectedMaterial.status}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-2">Rating & Reviews</h3>
                    <div className="flex items-center gap-2 mb-2">
                      {renderStars(selectedMaterial.rating)}
                      <span className="font-medium">{selectedMaterial.rating}</span>
                      <span className="text-muted-foreground">({selectedMaterial.reviews} reviews)</span>
                    </div>
                  </div>
                </div>

                <Separator />

                <div>
                  <h3 className="font-semibold mb-2">Description</h3>
                  <p className="text-sm text-muted-foreground">{selectedMaterial.description}</p>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Technical Specifications</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Object.entries(selectedMaterial.specifications).map(([key, value]) => (
                      <div key={key} className="flex justify-between p-3 bg-muted rounded">
                        <span className="font-medium">{key}:</span>
                        <span>{value}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Applications</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedMaterial.applications.map((app, index) => (
                      <Badge key={index} variant="outline">{app}</Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Certifications</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedMaterial.certifications.map((cert, index) => (
                      <Badge key={index} variant="secondary">{cert}</Badge>
                    ))}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="documents" className="space-y-4">
                {/* Document Upload Area */}
                <div
                  className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                    dragOver ? 'border-primary bg-primary/5' : 'border-muted-foreground/25'
                  }`}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => handleDrop(e, selectedMaterial.id)}
                >
                  <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-muted-foreground mb-2">
                    Drag and drop files here, or click to browse
                  </p>
                  <input
                    type="file"
                    multiple
                    accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.png"
                    onChange={(e) => e.target.files && handleFileUpload(e.target.files, selectedMaterial.id)}
                    className="hidden"
                    id="document-upload"
                  />
                  <Button variant="outline" asChild>
                    <label htmlFor="document-upload" className="cursor-pointer">
                      Browse Files
                    </label>
                  </Button>
                </div>

                {/* Document List */}
                <div className="space-y-3">
                  <h3 className="font-semibold">Uploaded Documents</h3>
                  {selectedMaterial.documents.map((doc) => (
                    <div key={doc.id} className="flex items-center justify-between p-3 border rounded">
                      <div className="flex items-center gap-3">
                        {getDocumentTypeIcon(doc.type)}
                        <div>
                          <p className="font-medium">{doc.name}</p>
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <span>{getDocumentTypeName(doc.type)}</span>
                            <span>{formatFileSize(doc.fileSize)}</span>
                            <span>{doc.uploadDate.toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm" asChild>
                          <a href={doc.url} target="_blank" rel="noopener noreferrer">
                            <Eye className="h-4 w-4" />
                          </a>
                        </Button>
                        <Button variant="ghost" size="sm" asChild>
                          <a href={doc.url} download={doc.name}>
                            <Download className="h-4 w-4" />
                          </a>
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="safety" className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2 flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    Safety Information
                  </h3>
                  
                  {selectedMaterial.safetyInfo.hazardClass && (
                    <div className="mb-4">
                      <h4 className="font-medium mb-1">Hazard Classification</h4>
                      <Badge variant="destructive">{selectedMaterial.safetyInfo.hazardClass}</Badge>
                    </div>
                  )}

                  <div className="mb-4">
                    <h4 className="font-medium mb-2">Personal Protective Equipment</h4>
                    <ul className="list-disc list-inside space-y-1 text-sm">
                      {selectedMaterial.safetyInfo.personalProtectiveEquipment.map((ppe, index) => (
                        <li key={index}>{ppe}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="mb-4">
                    <h4 className="font-medium mb-2">Storage Requirements</h4>
                    <p className="text-sm text-muted-foreground">
                      {selectedMaterial.safetyInfo.storageRequirements}
                    </p>
                  </div>

                  {selectedMaterial.safetyInfo.safetyDataSheet && (
                    <div>
                      <h4 className="font-medium mb-2">Safety Data Sheet</h4>
                      <Button variant="outline" asChild>
                        <a href={selectedMaterial.safetyInfo.safetyDataSheet} target="_blank" rel="noopener noreferrer">
                          <Download className="h-4 w-4 mr-2" />
                          Download SDS
                        </a>
                      </Button>
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="pricing" className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2 flex items-center gap-2">
                    <DollarSign className="h-5 w-5" />
                    Pricing Information
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 border rounded">
                      <h4 className="font-medium mb-2">Standard Pricing</h4>
                      <div className="text-2xl font-bold">
                        ${selectedMaterial.pricing.unitPrice.toFixed(2)}
                        <span className="text-sm font-normal text-muted-foreground">
                          /{selectedMaterial.pricing.unit}
                        </span>
                      </div>
                      {selectedMaterial.pricing.minimumOrder && (
                        <p className="text-sm text-muted-foreground mt-1">
                          Minimum order: {selectedMaterial.pricing.minimumOrder} {selectedMaterial.pricing.unit}s
                        </p>
                      )}
                    </div>

                    {selectedMaterial.pricing.bulkPricing && (
                      <div className="p-4 border rounded">
                        <h4 className="font-medium mb-2">Bulk Pricing</h4>
                        <div className="space-y-2">
                          {selectedMaterial.pricing.bulkPricing.map((bulk, index) => (
                            <div key={index} className="flex justify-between text-sm">
                              <span>{bulk.quantity}+ {selectedMaterial.pricing.unit}s:</span>
                              <span className="font-medium">${bulk.price.toFixed(2)}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="suppliers" className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2 flex items-center gap-2">
                    <Truck className="h-5 w-5" />
                    Availability & Suppliers
                  </h3>
                  
                  <div className="mb-4 p-4 border rounded">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">Stock Status:</span>
                      <Badge variant={selectedMaterial.availability.inStock ? 'default' : 'destructive'}>
                        {selectedMaterial.availability.inStock ? 'In Stock' : 'Out of Stock'}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      Lead time: {selectedMaterial.availability.leadTime}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">Suppliers</h4>
                    <div className="space-y-3">
                      {selectedMaterial.availability.suppliers.map((supplier, index) => (
                        <div key={index} className="p-3 border rounded">
                          <div className="flex items-center justify-between mb-2">
                            <h5 className="font-medium">{supplier.name}</h5>
                            <div className="flex items-center gap-1">
                              {renderStars(supplier.rating)}
                              <span className="text-sm text-muted-foreground">
                                {supplier.rating}
                              </span>
                            </div>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-muted-foreground">
                            <div className="flex items-center gap-2">
                              <Phone className="h-4 w-4" />
                              {supplier.contact}
                            </div>
                            <div className="flex items-center gap-2">
                              <Building2 className="h-4 w-4" />
                              {supplier.location}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}