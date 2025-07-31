import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from '@/hooks/use-toast';
import {
  Camera,
  Upload,
  Download,
  Filter,
  Search,
  MapPin,
  Calendar,
  Tag,
  Eye,
  Trash2,
  Edit,
  Plus,
  Grid3X3,
  List,
  FileImage,
  Share,
  Star
} from 'lucide-react';

interface PhotoReport {
  id: string;
  projectId: string;
  projectName: string;
  fileName: string;
  filePath: string;
  category: 'before' | 'during' | 'after' | 'issue' | 'completion' | 'inspection';
  description: string;
  gpsCoordinates?: { lat: number; lng: number };
  takenBy: string;
  takenAt: string;
  weather?: string;
  temperature?: number;
  annotations?: Array<{
    x: number;
    y: number;
    note: string;
  }>;
  tags: string[];
  starred: boolean;
  fileSize: number;
  dimensions?: { width: number; height: number };
}

export default function PhotoReportsPage() {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [photos, setPhotos] = useState<PhotoReport[]>([]);
  const [filteredPhotos, setFilteredPhotos] = useState<PhotoReport[]>([]);
  const [selectedPhoto, setSelectedPhoto] = useState<PhotoReport | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [projectFilter, setProjectFilter] = useState<string>('all');
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [isViewerOpen, setIsViewerOpen] = useState(false);

  const [uploadData, setUploadData] = useState({
    projectId: '',
    category: 'during' as PhotoReport['category'],
    description: '',
    tags: [] as string[],
    newTag: ''
  });

  useEffect(() => {
    loadPhotos();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [photos, searchTerm, categoryFilter, projectFilter]);

  const loadPhotos = async () => {
    // Mock data - in real implementation, fetch from Supabase
    const mockPhotos: PhotoReport[] = [
      {
        id: '1',
        projectId: 'proj-1',
        projectName: 'First Baptist Church Parking Lot',
        fileName: 'before_asphalt_removal.jpg',
        filePath: '/photos/before_asphalt_removal.jpg',
        category: 'before',
        description: 'Initial state of parking lot before asphalt removal',
        gpsCoordinates: { lat: 37.5407, lng: -77.4360 },
        takenBy: 'John Smith',
        takenAt: new Date(Date.now() - 86400000).toISOString(),
        weather: 'Sunny',
        temperature: 72,
        tags: ['parking lot', 'asphalt', 'condition assessment'],
        starred: true,
        fileSize: 2048000,
        dimensions: { width: 1920, height: 1080 }
      },
      {
        id: '2',
        projectId: 'proj-1',
        projectName: 'First Baptist Church Parking Lot',
        fileName: 'during_preparation.jpg',
        filePath: '/photos/during_preparation.jpg',
        category: 'during',
        description: 'Site preparation and cleaning in progress',
        gpsCoordinates: { lat: 37.5408, lng: -77.4361 },
        takenBy: 'Mike Johnson',
        takenAt: new Date(Date.now() - 43200000).toISOString(),
        weather: 'Partly Cloudy',
        temperature: 68,
        tags: ['preparation', 'cleaning', 'progress'],
        starred: false,
        fileSize: 1843200,
        dimensions: { width: 1920, height: 1080 }
      },
      {
        id: '3',
        projectId: 'proj-2',
        projectName: 'Grace Methodist Sealcoating',
        fileName: 'crack_repair_needed.jpg',
        filePath: '/photos/crack_repair_needed.jpg',
        category: 'issue',
        description: 'Significant cracking requiring additional repair',
        gpsCoordinates: { lat: 37.5420, lng: -77.4380 },
        takenBy: 'Sarah Davis',
        takenAt: new Date(Date.now() - 21600000).toISOString(),
        weather: 'Overcast',
        temperature: 65,
        tags: ['crack repair', 'issue', 'additional work'],
        starred: true,
        fileSize: 2156800,
        dimensions: { width: 1920, height: 1080 }
      }
    ];
    setPhotos(mockPhotos);
  };

  const applyFilters = () => {
    let filtered = photos;

    if (searchTerm) {
      filtered = filtered.filter(photo =>
        photo.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        photo.projectName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        photo.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    if (categoryFilter !== 'all') {
      filtered = filtered.filter(photo => photo.category === categoryFilter);
    }

    if (projectFilter !== 'all') {
      filtered = filtered.filter(photo => photo.projectId === projectFilter);
    }

    setFilteredPhotos(filtered);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      Array.from(files).forEach(file => {
        uploadPhoto(file);
      });
    }
  };

  const uploadPhoto = async (file: File) => {
    if (!uploadData.projectId) {
      toast({
        title: "Project Required",
        description: "Please select a project before uploading photos",
        variant: "destructive",
      });
      return;
    }

    // Get GPS coordinates if available
    const coordinates = await getCurrentLocation();

    const newPhoto: PhotoReport = {
      id: Date.now().toString(),
      projectId: uploadData.projectId,
      projectName: getProjectName(uploadData.projectId),
      fileName: file.name,
      filePath: `/photos/${file.name}`,
      category: uploadData.category,
      description: uploadData.description || `${uploadData.category} photo`,
      gpsCoordinates: coordinates,
      takenBy: 'Current User', // In real app, get from auth context
      takenAt: new Date().toISOString(),
      weather: 'Unknown', // Could integrate with weather API
      tags: uploadData.tags,
      starred: false,
      fileSize: file.size,
      dimensions: await getImageDimensions(file)
    };

    setPhotos(prev => [newPhoto, ...prev]);
    setIsUploadDialogOpen(false);
    
    // Reset upload form
    setUploadData({
      projectId: '',
      category: 'during',
      description: '',
      tags: [],
      newTag: ''
    });

    toast({
      title: "Photo Uploaded",
      description: `${file.name} has been uploaded successfully`,
    });
  };

  const getCurrentLocation = (): Promise<{lat: number, lng: number} | undefined> => {
    return new Promise((resolve) => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            resolve({
              lat: position.coords.latitude,
              lng: position.coords.longitude
            });
          },
          () => resolve(undefined)
        );
      } else {
        resolve(undefined);
      }
    });
  };

  const getImageDimensions = (file: File): Promise<{width: number, height: number}> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        resolve({ width: img.width, height: img.height });
      };
      img.src = URL.createObjectURL(file);
    });
  };

  const getProjectName = (projectId: string): string => {
    const projects = {
      'proj-1': 'First Baptist Church Parking Lot',
      'proj-2': 'Grace Methodist Sealcoating'
    };
    return projects[projectId as keyof typeof projects] || 'Unknown Project';
  };

  const toggleStar = (photoId: string) => {
    setPhotos(prev =>
      prev.map(photo =>
        photo.id === photoId ? { ...photo, starred: !photo.starred } : photo
      )
    );
  };

  const deletePhoto = (photoId: string) => {
    setPhotos(prev => prev.filter(photo => photo.id !== photoId));
    toast({
      title: "Photo Deleted",
      description: "Photo has been removed from the system",
    });
  };

  const addTag = () => {
    if (uploadData.newTag.trim() && !uploadData.tags.includes(uploadData.newTag.trim())) {
      setUploadData(prev => ({
        ...prev,
        tags: [...prev.tags, prev.newTag.trim()],
        newTag: ''
      }));
    }
  };

  const removeTag = (tag: string) => {
    setUploadData(prev => ({
      ...prev,
      tags: prev.tags.filter(t => t !== tag)
    }));
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'before': return 'bg-blue-500';
      case 'during': return 'bg-yellow-500';
      case 'after': return 'bg-green-500';
      case 'issue': return 'bg-red-500';
      case 'completion': return 'bg-purple-500';
      case 'inspection': return 'bg-orange-500';
      default: return 'bg-gray-500';
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Camera className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-3xl font-bold text-foreground">Photo Reports</h1>
              <p className="text-muted-foreground">
                Document project progress with GPS-tagged photos and annotations
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}>
              {viewMode === 'grid' ? <List className="h-4 w-4" /> : <Grid3X3 className="h-4 w-4" />}
            </Button>
            <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Upload Photos
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Upload Photos</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Project</label>
                    <Select value={uploadData.projectId} onValueChange={(value) => 
                      setUploadData(prev => ({ ...prev, projectId: value }))
                    }>
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select project" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="proj-1">First Baptist Church Parking Lot</SelectItem>
                        <SelectItem value="proj-2">Grace Methodist Sealcoating</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium">Category</label>
                    <Select value={uploadData.category} onValueChange={(value: any) => 
                      setUploadData(prev => ({ ...prev, category: value }))
                    }>
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="before">Before</SelectItem>
                        <SelectItem value="during">During</SelectItem>
                        <SelectItem value="after">After</SelectItem>
                        <SelectItem value="issue">Issue</SelectItem>
                        <SelectItem value="completion">Completion</SelectItem>
                        <SelectItem value="inspection">Inspection</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm font-medium">Description</label>
                    <Input
                      value={uploadData.description}
                      onChange={(e) => setUploadData(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Photo description..."
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium">Tags</label>
                    <div className="flex gap-2 mt-1">
                      <Input
                        value={uploadData.newTag}
                        onChange={(e) => setUploadData(prev => ({ ...prev, newTag: e.target.value }))}
                        placeholder="Add tag..."
                        onKeyPress={(e) => e.key === 'Enter' && addTag()}
                      />
                      <Button type="button" onClick={addTag} size="sm">
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {uploadData.tags.map((tag) => (
                        <Badge key={tag} variant="secondary" className="cursor-pointer" onClick={() => removeTag(tag)}>
                          {tag} ×
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                    <Button
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full"
                      disabled={!uploadData.projectId}
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Select Photos
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-4 flex-wrap">
              <div className="flex-1 min-w-[200px]">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search photos..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="before">Before</SelectItem>
                  <SelectItem value="during">During</SelectItem>
                  <SelectItem value="after">After</SelectItem>
                  <SelectItem value="issue">Issue</SelectItem>
                  <SelectItem value="completion">Completion</SelectItem>
                  <SelectItem value="inspection">Inspection</SelectItem>
                </SelectContent>
              </Select>
              <Select value={projectFilter} onValueChange={setProjectFilter}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Project" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Projects</SelectItem>
                  <SelectItem value="proj-1">First Baptist Church</SelectItem>
                  <SelectItem value="proj-2">Grace Methodist</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Photos Grid/List */}
        {viewMode === 'grid' ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredPhotos.map((photo) => (
              <Card key={photo.id} className="cursor-pointer hover:shadow-lg transition-shadow">
                <CardContent className="p-4">
                  <div className="aspect-video bg-muted rounded-md mb-3 flex items-center justify-center relative overflow-hidden">
                    <FileImage className="h-12 w-12 text-muted-foreground" />
                    <div className="absolute top-2 right-2 flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0 bg-black/50 hover:bg-black/70"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleStar(photo.id);
                        }}
                      >
                        <Star className={`h-3 w-3 ${photo.starred ? 'text-yellow-400 fill-current' : 'text-white'}`} />
                      </Button>
                    </div>
                    <div className="absolute bottom-2 left-2">
                      <div className={`w-2 h-2 rounded-full ${getCategoryColor(photo.category)}`}></div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Badge variant="outline" className="capitalize">
                        {photo.category}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {formatFileSize(photo.fileSize)}
                      </span>
                    </div>
                    
                    <h3 className="font-medium text-sm line-clamp-2">{photo.description}</h3>
                    
                    <div className="text-xs text-muted-foreground space-y-1">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        <span>{new Date(photo.takenAt).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        <span>{photo.gpsCoordinates ? 'GPS Tagged' : 'No GPS'}</span>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-1">
                      {photo.tags.slice(0, 2).map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                      {photo.tags.length > 2 && (
                        <Badge variant="secondary" className="text-xs">
                          +{photo.tags.length - 2}
                        </Badge>
                      )}
                    </div>

                    <div className="flex gap-1 pt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => {
                          setSelectedPhoto(photo);
                          setIsViewerOpen(true);
                        }}
                      >
                        <Eye className="h-3 w-3 mr-1" />
                        View
                      </Button>
                      <Button variant="outline" size="sm">
                        <Share className="h-3 w-3" />
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => deletePhoto(photo.id)}>
                        <Trash2 className="h-3 w-3" />
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
                {filteredPhotos.map((photo, index) => (
                  <div key={photo.id} className={`p-4 flex items-center gap-4 ${index !== filteredPhotos.length - 1 ? 'border-b' : ''}`}>
                    <div className="w-16 h-16 bg-muted rounded-md flex items-center justify-center">
                      <FileImage className="h-8 w-8 text-muted-foreground" />
                    </div>
                    
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium">{photo.description}</h3>
                        {photo.starred && <Star className="h-4 w-4 text-yellow-400 fill-current" />}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {photo.projectName} • {photo.takenBy} • {new Date(photo.takenAt).toLocaleDateString()}
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="capitalize">
                          {photo.category}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {formatFileSize(photo.fileSize)}
                        </span>
                        {photo.gpsCoordinates && (
                          <Badge variant="secondary" className="text-xs">
                            <MapPin className="h-3 w-3 mr-1" />
                            GPS
                          </Badge>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex gap-1">
                      <Button variant="outline" size="sm" onClick={() => {
                        setSelectedPhoto(photo);
                        setIsViewerOpen(true);
                      }}>
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Share className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => deletePhoto(photo.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {filteredPhotos.length === 0 && (
          <Card>
            <CardContent className="text-center py-12">
              <Camera className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Photos Found</h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm || categoryFilter !== 'all' || projectFilter !== 'all'
                  ? 'No photos match your current filters'
                  : 'Upload your first project photos to get started'
                }
              </p>
              {(!searchTerm && categoryFilter === 'all' && projectFilter === 'all') && (
                <Button onClick={() => setIsUploadDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Upload Photos
                </Button>
              )}
            </CardContent>
          </Card>
        )}

        {/* Photo Viewer Dialog */}
        <Dialog open={isViewerOpen} onOpenChange={setIsViewerOpen}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>{selectedPhoto?.description}</DialogTitle>
            </DialogHeader>
            {selectedPhoto && (
              <div className="space-y-4">
                <div className="aspect-video bg-muted rounded-md flex items-center justify-center">
                  <FileImage className="h-24 w-24 text-muted-foreground" />
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="text-muted-foreground">Project</div>
                    <div className="font-medium">{selectedPhoto.projectName}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Category</div>
                    <Badge variant="outline" className="capitalize">
                      {selectedPhoto.category}
                    </Badge>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Taken By</div>
                    <div className="font-medium">{selectedPhoto.takenBy}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Date</div>
                    <div className="font-medium">{new Date(selectedPhoto.takenAt).toLocaleString()}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">File Size</div>
                    <div className="font-medium">{formatFileSize(selectedPhoto.fileSize)}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Dimensions</div>
                    <div className="font-medium">
                      {selectedPhoto.dimensions?.width} × {selectedPhoto.dimensions?.height}
                    </div>
                  </div>
                  {selectedPhoto.gpsCoordinates && (
                    <div className="col-span-2">
                      <div className="text-muted-foreground">GPS Coordinates</div>
                      <div className="font-medium">
                        {selectedPhoto.gpsCoordinates.lat.toFixed(6)}, {selectedPhoto.gpsCoordinates.lng.toFixed(6)}
                      </div>
                    </div>
                  )}
                  {selectedPhoto.weather && (
                    <div>
                      <div className="text-muted-foreground">Weather</div>
                      <div className="font-medium">{selectedPhoto.weather}</div>
                    </div>
                  )}
                  {selectedPhoto.temperature && (
                    <div>
                      <div className="text-muted-foreground">Temperature</div>
                      <div className="font-medium">{selectedPhoto.temperature}°F</div>
                    </div>
                  )}
                </div>

                {selectedPhoto.tags.length > 0 && (
                  <div>
                    <div className="text-muted-foreground text-sm mb-2">Tags</div>
                    <div className="flex flex-wrap gap-1">
                      {selectedPhoto.tags.map((tag) => (
                        <Badge key={tag} variant="secondary">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}