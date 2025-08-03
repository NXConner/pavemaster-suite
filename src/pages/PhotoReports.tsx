import { useState, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Badge } from '../components/ui/badge';
import { Progress } from '../components/ui/progress';
import {
  Camera,
  MapPin,
  Upload,
  Filter,
  Search,
  Download,
  Eye,
  Grid,
  List,
  Clock,
  FileImage,
  Zap,
  Share,
  CheckCircle,
  AlertCircle,
  Info,
} from 'lucide-react';

interface PhotoReport {
  id: string;
  title: string;
  description: string;
  file_path: string;
  file_size: number;
  status: 'draft' | 'submitted' | 'approved' | 'rejected';
  created_at: string;
  metadata: {
    gps: { latitude: number; longitude: number; accuracy: number; };
    project_id?: string;
    tags: string[];
    priority: 'low' | 'medium' | 'high' | 'critical';
    category: 'progress' | 'quality' | 'safety' | 'damage' | 'completion' | 'inspection';
  };
}

const mockReports: PhotoReport[] = [
  {
    id: 'PR001',
    title: 'Church Parking Lot - Base Layer Progress',
    description: 'Documentation of base layer preparation and grading completion',
    file_path: '/photos/church-base-layer-001.jpg',
    file_size: 2048576,
    status: 'approved',
    created_at: '2024-01-15T09:30:00Z',
    metadata: {
      gps: { latitude: 37.7749, longitude: -122.4194, accuracy: 5.2 },
      project_id: 'proj-001',
      tags: ['base-layer', 'grading', 'progress'],
      priority: 'medium',
      category: 'progress',
    },
  },
  {
    id: 'PR002',
    title: 'Quality Control - Asphalt Temperature Check',
    description: 'Temperature verification during asphalt placement',
    file_path: '/photos/temp-check-002.jpg',
    file_size: 1875432,
    status: 'submitted',
    created_at: '2024-01-15T14:15:00Z',
    metadata: {
      gps: { latitude: 37.7751, longitude: -122.4196, accuracy: 3.8 },
      project_id: 'proj-001',
      tags: ['quality-control', 'temperature', 'asphalt'],
      priority: 'high',
      category: 'quality',
    },
  },
];

export default function PhotoReports() {
  const [activeTab, setActiveTab] = useState('gallery');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) { return; }

    setIsUploading(true);
    setUploadProgress(0);

    for (let i = 0; i <= 100; i += 10) {
      await new Promise(resolve => setTimeout(resolve, 100));
      setUploadProgress(i);
    }

    setIsUploading(false);
    setUploadProgress(0);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'destructive';
      case 'high': return 'destructive';
      case 'medium': return 'secondary';
      case 'low': return 'outline';
      default: return 'outline';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'progress': return <Clock className="h-4 w-4" />;
      case 'quality': return <CheckCircle className="h-4 w-4" />;
      case 'safety': return <AlertCircle className="h-4 w-4" />;
      default: return <Info className="h-4 w-4" />;
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) { return '0 Bytes'; }
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Photo Reports</h1>
          <p className="text-muted-foreground">GPS-tagged project documentation and quality control</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => fileInputRef.current?.click()}>
            <Camera className="h-4 w-4 mr-2" />
            Capture
          </Button>
          <Button onClick={() => fileInputRef.current?.click()}>
            <Upload className="h-4 w-4 mr-2" />
            Upload
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*"
            onChange={handleFileUpload}
            className="hidden"
          />
        </div>
      </div>

      {isUploading && (
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Uploading photos...</span>
                <span className="text-sm text-muted-foreground">{uploadProgress}%</span>
              </div>
              <Progress value={uploadProgress} className="h-2" />
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="gallery">Photo Gallery</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="zapier">Zapier Integration</TabsTrigger>
        </TabsList>

        <TabsContent value="gallery" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Filters & Search
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search photos..."
                      value={searchTerm}
                      onChange={(e) => { setSearchTerm(e.target.value); }}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant={viewMode === 'grid' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => { setViewMode('grid'); }}
                  >
                    <Grid className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={viewMode === 'list' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => { setViewMode('list'); }}
                  >
                    <List className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {mockReports.map((report) => (
              <Card key={report.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      {getCategoryIcon(report.metadata.category)}
                      <Badge variant={getPriorityColor(report.metadata.priority)}>
                        {report.metadata.priority}
                      </Badge>
                    </div>
                    <Badge variant="outline">{report.status}</Badge>
                  </div>
                  <CardTitle className="text-base">{report.title}</CardTitle>
                  <CardDescription className="text-sm">{report.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="aspect-video bg-muted rounded-md flex items-center justify-center">
                    <FileImage className="h-8 w-8 text-muted-foreground" />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <MapPin className="h-3 w-3" />
                      <span>
                        {report.metadata.gps.latitude.toFixed(4)}, {report.metadata.gps.longitude.toFixed(4)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      <span>{new Date(report.created_at).toLocaleString()}</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1">
                    {report.metadata.tags.slice(0, 3).map((tag, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>

                  <div className="flex justify-between items-center">
                    <div className="text-xs text-muted-foreground">
                      {formatFileSize(report.file_size)}
                    </div>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Share className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Total Photos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{mockReports.length}</div>
                <p className="text-sm text-muted-foreground">Across all projects</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Storage Used</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatFileSize(mockReports.reduce((acc, report) => acc + report.file_size, 0))}
                </div>
                <p className="text-sm text-muted-foreground">Total file size</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">2</div>
                <p className="text-sm text-muted-foreground">Photos today</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="zapier" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                Photo Reports Zapier Integration
              </CardTitle>
              <CardDescription>
                Automatically trigger workflows when photos are uploaded or approved
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="webhook-url">Zapier Webhook URL</Label>
                <Input
                  id="webhook-url"
                  placeholder="https://hooks.zapier.com/hooks/catch/..."
                  className="mt-1"
                />
              </div>

              <Button className="w-full">
                <Zap className="h-4 w-4 mr-2" />
                Configure Zapier Integration
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}