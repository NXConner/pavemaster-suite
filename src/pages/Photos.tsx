import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Camera, Upload, Search, Calendar, MapPin, Filter } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

interface PhotoReport {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  location: string;
  coordinates?: { lat: number; lng: number };
  timestamp: string;
  category: string;
  project?: string;
  tags: string[];
  uploader: string;
}

export default function Photos() {
  const { user } = useAuth();
  const [photos, setPhotos] = useState<PhotoReport[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [loading, setLoading] = useState(true);

  // Mock data for now
  useEffect(() => {
    // Simulate loading photos
    setTimeout(() => {
      setPhotos([
        {
          id: '1',
          title: 'Before Work - Parking Lot A',
          description: 'Initial condition assessment of church parking lot before sealcoating',
          imageUrl: 'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=800',
          location: 'First Baptist Church',
          coordinates: { lat: 37.7749, lng: -122.4194 },
          timestamp: new Date().toISOString(),
          category: 'before',
          project: 'Church Parking Lot Restoration',
          tags: ['sealcoating', 'assessment', 'before'],
          uploader: user?.email || 'Unknown'
        },
        {
          id: '2',
          title: 'Progress Update - Day 2',
          description: 'Crack sealing completed, ready for sealcoat application',
          imageUrl: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800',
          location: 'First Baptist Church',
          timestamp: new Date(Date.now() - 86400000).toISOString(),
          category: 'progress',
          project: 'Church Parking Lot Restoration',
          tags: ['crack-sealing', 'progress'],
          uploader: user?.email || 'Unknown'
        }
      ]);
      setLoading(false);
    }, 1000);
  }, [user]);

  const categories = [
    { value: 'all', label: 'All Photos' },
    { value: 'before', label: 'Before' },
    { value: 'progress', label: 'Progress' },
    { value: 'after', label: 'Completed' },
    { value: 'issues', label: 'Issues' },
    { value: 'equipment', label: 'Equipment' }
  ];

  const filteredPhotos = photos.filter(photo => {
    const matchesSearch = photo.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         photo.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         photo.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = selectedCategory === 'all' || photo.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'before': return 'bg-blue-500';
      case 'progress': return 'bg-yellow-500';
      case 'after': return 'bg-green-500';
      case 'issues': return 'bg-red-500';
      case 'equipment': return 'bg-purple-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-3">
        <Camera className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold text-foreground">Photo Reports</h1>
          <p className="text-muted-foreground">Document project progress with timestamped photos</p>
        </div>
      </div>

      {/* Action Bar */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-4 flex-1">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search photos..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 border border-input bg-background rounded-md text-sm"
            >
              {categories.map(category => (
                <option key={category.value} value={category.value}>
                  {category.label}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Upload className="h-4 w-4 mr-2" />
            Upload Photos
          </Button>
          <Button>
            <Camera className="h-4 w-4 mr-2" />
            Take Photo
          </Button>
        </div>
      </div>

      {/* Photos Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredPhotos.map((photo) => (
          <Card key={photo.id} className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer">
            <div className="aspect-square relative">
              <img
                src={photo.imageUrl}
                alt={photo.title}
                className="w-full h-full object-cover"
              />
              <Badge className={`absolute top-2 right-2 ${getCategoryColor(photo.category)}`}>
                {photo.category}
              </Badge>
            </div>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg line-clamp-2">{photo.title}</CardTitle>
              <CardDescription className="line-clamp-2">{photo.description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <MapPin className="h-3 w-3" />
                <span className="truncate">{photo.location}</span>
              </div>
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <Calendar className="h-3 w-3" />
                <span>{new Date(photo.timestamp).toLocaleDateString()}</span>
              </div>
              {photo.project && (
                <div className="text-sm text-muted-foreground">
                  Project: {photo.project}
                </div>
              )}
              <div className="flex flex-wrap gap-1 mt-2">
                {photo.tags.slice(0, 3).map((tag, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {tag}
                  </Badge>
                ))}
                {photo.tags.length > 3 && (
                  <Badge variant="secondary" className="text-xs">
                    +{photo.tags.length - 3}
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredPhotos.length === 0 && !loading && (
        <Card>
          <CardContent className="py-12 text-center">
            <Camera className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Photos Found</h3>
            <p className="text-muted-foreground mb-4">
              {searchQuery || selectedCategory !== 'all' 
                ? 'Try adjusting your search or filters.' 
                : 'Start documenting your projects with photos.'}
            </p>
            <Button>
              <Camera className="h-4 w-4 mr-2" />
              Take First Photo
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}