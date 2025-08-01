import { useState, useRef, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { 
  Camera, 
  Upload, 
  Image as ImageIcon, 
  MapPin, 
  Calendar, 
  Tag,
  ArrowLeftRight,
  Download,
  Eye,
  Plus,
  Edit,
  Trash2,
  Search
} from 'lucide-react';
import { toast } from 'sonner';

interface PhotoReport {
  id: string;
  title: string;
  description: string;
  projectId?: string;
  location: string;
  date: string;
  tags: string[];
  photos: PhotoData[];
  annotations: Annotation[];
  beforeAfter?: {
    before: string[];
    after: string[];
  };
}

interface PhotoData {
  id: string;
  url: string;
  filename: string;
  size: number;
  uploadDate: string;
  annotations: Annotation[];
}

interface Annotation {
  id: string;
  photoId: string;
  x: number;
  y: number;
  width: number;
  height: number;
  text: string;
  type: 'note' | 'measurement' | 'issue' | 'improvement';
  color: string;
}

export default function PhotoReports() {
  const [reports, setReports] = useState<PhotoReport[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTag, setSelectedTag] = useState('');
  const [activeTab, setActiveTab] = useState('reports');
  
  // Form state for new reports
  const [newReport, setNewReport] = useState({
    title: '',
    description: '',
    location: '',
    tags: [] as string[],
    photos: [] as File[]
  });
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  // Photo upload handlers
  const handleFileSelect = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      const newFiles = Array.from(files);
      setNewReport(prev => ({
        ...prev,
        photos: [...prev.photos, ...newFiles.filter(file => file instanceof File)]
      }));
      toast.success(`Added ${newFiles.length} photo(s)`);
    }
  }, []);

  const handleCameraCapture = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files[0]) {
      setNewReport(prev => ({
        ...prev,
        photos: [...prev.photos, files[0]]
      }));
      toast.success('Photo captured!');
    }
  }, []);

  const removePhoto = (index: number) => {
    setNewReport(prev => ({
      ...prev,
      photos: prev.photos.filter((_, i) => i !== index)
    }));
  };

  // Tag management
  const addTag = (tag: string) => {
    if (tag && !newReport.tags.includes(tag)) {
      setNewReport(prev => ({
        ...prev,
        tags: [...prev.tags, tag]
      }));
    }
  };

  const removeTag = (tag: string) => {
    setNewReport(prev => ({
      ...prev,
      tags: prev.tags.filter(t => t !== tag)
    }));
  };

  // Report creation
  const createReport = async () => {
    if (!newReport.title || newReport.photos.length === 0) {
      toast.error('Please provide a title and at least one photo');
      return;
    }

    try {
      // In a real app, you would upload photos to storage here
      const photoData: PhotoData[] = newReport.photos.map((file, index) => ({
        id: `photo-${Date.now()}-${index}`,
        url: URL.createObjectURL(file),
        filename: file.name,
        size: file.size,
        uploadDate: new Date().toISOString(),
        annotations: []
      }));

      const report: PhotoReport = {
        id: `report-${Date.now()}`,
        title: newReport.title,
        description: newReport.description,
        location: newReport.location,
        date: new Date().toISOString(),
        tags: newReport.tags,
        photos: photoData,
        annotations: []
      };

      setReports(prev => [report, ...prev]);
      
      // Reset form
      setNewReport({
        title: '',
        description: '',
        location: '',
        tags: [],
        photos: []
      });
      
      setIsCreating(false);
      toast.success('Photo report created successfully!');
    } catch (error) {
      console.error('Error creating report:', error);
      toast.error('Failed to create report');
    }
  };

  // Filter reports
  const filteredReports = reports.filter(report => {
    const matchesSearch = report.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         report.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         report.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTag = !selectedTag || report.tags.includes(selectedTag);
    return matchesSearch && matchesTag;
  });

  // Get all unique tags
  const allTags = Array.from(new Set(reports.flatMap(r => r.tags)));

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Photo Reports & Documentation</h1>
          <p className="text-muted-foreground">
            Visual project documentation with annotations and before/after comparisons
          </p>
        </div>
        <Button onClick={() => setIsCreating(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          New Report
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="reports">All Reports</TabsTrigger>
          <TabsTrigger value="recent">Recent</TabsTrigger>
          <TabsTrigger value="beforeafter">Before/After</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="reports" className="space-y-6">
          {/* Search and Filters */}
          <div className="flex gap-4 items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search reports..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <select
              value={selectedTag}
              onChange={(e) => setSelectedTag(e.target.value)}
              className="px-3 py-2 border rounded-md bg-background"
            >
              <option value="">All Tags</option>
              {allTags.map(tag => (
                <option key={tag} value={tag}>{tag}</option>
              ))}
            </select>
          </div>

          {/* Reports Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredReports.map((report) => (
              <Card key={report.id} className="cursor-pointer hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg">{report.title}</CardTitle>
                    <Badge variant="outline">
                      {report.photos.length} photos
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  {/* Photo Preview */}
                  {report.photos[0] && (
                    <div className="aspect-video bg-muted rounded-lg mb-4 overflow-hidden">
                      <img 
                        src={report.photos[0].url} 
                        alt={report.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  
                  <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                    {report.description}
                  </p>
                  
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <MapPin className="h-3 w-3" />
                      {report.location}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      {new Date(report.date).toLocaleDateString()}
                    </div>
                  </div>
                  
                  {/* Tags */}
                  <div className="flex flex-wrap gap-1 mt-3">
                    {report.tags.map(tag => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                  
                  <div className="flex gap-2 mt-4">
                    <Button size="sm" variant="outline" className="flex-1">
                      <Eye className="h-3 w-3 mr-1" />
                      View
                    </Button>
                    <Button size="sm" variant="outline">
                      <Edit className="h-3 w-3" />
                    </Button>
                    <Button size="sm" variant="outline">
                      <Download className="h-3 w-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredReports.length === 0 && (
            <div className="text-center py-12">
              <ImageIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No reports found</h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm || selectedTag ? 'Try adjusting your filters' : 'Start by creating your first photo report'}
              </p>
              <Button onClick={() => setIsCreating(true)}>
                Create Report
              </Button>
            </div>
          )}
        </TabsContent>

        <TabsContent value="recent" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {reports.slice(0, 5).map((report) => (
                  <div key={report.id} className="flex items-center gap-4 p-3 border rounded-lg">
                    <div className="w-16 h-16 rounded-lg overflow-hidden bg-muted">
                      {report.photos[0] && (
                        <img 
                          src={report.photos[0].url} 
                          alt={report.title}
                          className="w-full h-full object-cover"
                        />
                      )}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium">{report.title}</h4>
                      <p className="text-sm text-muted-foreground">{report.location}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(report.date).toLocaleDateString()}
                      </p>
                    </div>
                    <Badge variant="outline">{report.photos.length} photos</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="beforeafter" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Before/After Comparisons</CardTitle>
              <p className="text-sm text-muted-foreground">
                Track project progress with visual comparisons
              </p>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <ArrowLeftRight className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No comparisons yet</h3>
                <p className="text-muted-foreground">
                  Create reports with 'before' and 'after' tags to see comparisons here
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Total Reports</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{reports.length}</div>
                <p className="text-sm text-muted-foreground">Created this month</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Total Photos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {reports.reduce((sum, r) => sum + r.photos.length, 0)}
                </div>
                <p className="text-sm text-muted-foreground">Across all reports</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Most Used Tags</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {allTags.slice(0, 5).map(tag => (
                    <div key={tag} className="flex justify-between">
                      <span>{tag}</span>
                      <span className="text-muted-foreground">
                        {reports.filter(r => r.tags.includes(tag)).length}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Create Report Modal */}
      {isCreating && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto m-4">
            <CardHeader>
              <CardTitle>Create Photo Report</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Title *</label>
                  <Input
                    value={newReport.title}
                    onChange={(e) => setNewReport(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Report title..."
                  />
                </div>
                
                <div>
                  <label className="text-sm font-medium">Description</label>
                  <Textarea
                    value={newReport.description}
                    onChange={(e) => setNewReport(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Describe what this report covers..."
                    rows={3}
                  />
                </div>
                
                <div>
                  <label className="text-sm font-medium">Location</label>
                  <Input
                    value={newReport.location}
                    onChange={(e) => setNewReport(prev => ({ ...prev, location: e.target.value }))}
                    placeholder="Project location..."
                  />
                </div>
                
                {/* Photo Upload */}
                <div>
                  <label className="text-sm font-medium">Photos *</label>
                  <div className="flex gap-2 mt-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => fileInputRef.current?.click()}
                      className="gap-2"
                    >
                      <Upload className="h-4 w-4" />
                      Upload Files
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => cameraInputRef.current?.click()}
                      className="gap-2"
                    >
                      <Camera className="h-4 w-4" />
                      Take Photo
                    </Button>
                  </div>
                  
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                  <input
                    ref={cameraInputRef}
                    type="file"
                    accept="image/*"
                    capture="environment"
                    onChange={handleCameraCapture}
                    className="hidden"
                  />
                  
                  {/* Photo Preview */}
                  {newReport.photos.length > 0 && (
                    <div className="grid grid-cols-3 gap-2 mt-4">
                      {newReport.photos.map((file, index) => (
                        <div key={index} className="relative aspect-square bg-muted rounded-lg overflow-hidden">
                          <img
                            src={URL.createObjectURL(file)}
                            alt={`Preview ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                          <Button
                            size="sm"
                            variant="destructive"
                            className="absolute top-1 right-1 h-6 w-6 p-0"
                            onClick={() => removePhoto(index)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                
                {/* Tags */}
                <div>
                  <label className="text-sm font-medium">Tags</label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {newReport.tags.map(tag => (
                      <Badge key={tag} variant="secondary" className="gap-1">
                        {tag}
                        <button onClick={() => removeTag(tag)}>×</button>
                      </Badge>
                    ))}
                  </div>
                  <div className="flex gap-2 mt-2">
                    {['before', 'after', 'progress', 'issue', 'completed'].map(tag => (
                      <Button
                        key={tag}
                        size="sm"
                        variant="outline"
                        onClick={() => addTag(tag)}
                        disabled={newReport.tags.includes(tag)}
                      >
                        <Tag className="h-3 w-3 mr-1" />
                        {tag}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="flex gap-3 pt-4">
                <Button onClick={createReport} className="flex-1">
                  Create Report
                </Button>
                <Button variant="outline" onClick={() => setIsCreating(false)}>
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}