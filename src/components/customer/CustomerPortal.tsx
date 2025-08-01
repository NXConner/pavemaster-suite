import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Users, MessageCircle, Calendar, DollarSign, Star, Clock } from 'lucide-react';
import { toast } from 'sonner';

interface Project {
  id: string;
  title: string;
  status: 'planning' | 'in_progress' | 'completed' | 'on_hold';
  progress: number;
  estimated_completion: string;
  description: string;
  amount: number;
  images: string[];
}

interface EstimateRequest {
  id: string;
  type: 'paving' | 'sealcoating' | 'line_striping';
  description: string;
  property_address: string;
  contact_info: string;
  estimated_area: number;
  preferred_date: string;
  status: 'pending' | 'quoted' | 'accepted' | 'declined';
  submitted_date: string;
  quoted_amount?: number | undefined;
}

export default function CustomerPortal() {
  const [activeProjects, setActiveProjects] = useState<Project[]>([]);
  const [estimateRequests, setEstimateRequests] = useState<EstimateRequest[]>([]);
  const [newEstimate, setNewEstimate] = useState({
    type: 'paving' as EstimateRequest['type'],
    description: '',
    property_address: '',
    contact_info: '',
    estimated_area: 0,
    preferred_date: ''
  });
  const [feedback, setFeedback] = useState({
    project_id: '',
    rating: 5,
    comment: ''
  });

  useEffect(() => {
    // Simulate loading customer data
    const sampleProjects: Project[] = [
      {
        id: '1',
        title: 'Parking Lot Resurfacing',
        status: 'in_progress',
        progress: 75,
        estimated_completion: '2024-02-15',
        description: 'Complete resurfacing of church parking lot including crack repair and sealcoating',
        amount: 25000,
        images: ['/api/placeholder/400/300']
      },
      {
        id: '2',
        title: 'Driveway Repair',
        status: 'completed',
        progress: 100,
        estimated_completion: '2024-01-20',
        description: 'Residential driveway crack filling and sealcoating',
        amount: 1200,
        images: ['/api/placeholder/400/300', '/api/placeholder/400/300']
      }
    ];

    const sampleEstimates: EstimateRequest[] = [
      {
        id: '1',
        type: 'sealcoating',
        description: 'Shopping center parking lot sealcoating',
        property_address: '123 Commerce Dr, City, State',
        contact_info: 'john@email.com | (555) 123-4567',
        estimated_area: 5000,
        preferred_date: '2024-03-01',
        status: 'quoted',
        submitted_date: '2024-01-15',
        quoted_amount: 8500 as number
      }
    ];

    setActiveProjects(sampleProjects);
    setEstimateRequests(sampleEstimates);
  }, []);

  const handleEstimateRequest = () => {
    if (!newEstimate.description || !newEstimate.property_address || !newEstimate.contact_info) {
      toast.error('Please fill in all required fields');
      return;
    }

    const request: EstimateRequest = {
      id: Date.now().toString(),
      ...newEstimate,
      status: 'pending',
      submitted_date: new Date().toISOString().split('T')[0] as string,
      quoted_amount: undefined,
    };

    setEstimateRequests(prev => [request, ...prev]);
    setNewEstimate({
      type: 'paving',
      description: '',
      property_address: '',
      contact_info: '',
      estimated_area: 0,
      preferred_date: ''
    });
    toast.success('Estimate request submitted successfully');
  };

  const submitFeedback = () => {
    if (!feedback.project_id || !feedback.comment) {
      toast.error('Please select a project and provide feedback');
      return;
    }

    toast.success('Thank you for your feedback!');
    setFeedback({ project_id: '', rating: 5, comment: '' });
  };

  const getStatusColor = (status: Project['status']) => {
    switch (status) {
      case 'completed': return 'bg-success';
      case 'in_progress': return 'bg-primary';
      case 'on_hold': return 'bg-warning';
      default: return 'bg-muted';
    }
  };

  const getEstimateStatusVariant = (status: EstimateRequest['status']) => {
    switch (status) {
      case 'quoted': return 'secondary';
      case 'accepted': return 'default';
      case 'declined': return 'destructive';
      default: return 'outline';
    }
  };

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <Card className="bg-gradient-to-r from-primary/10 via-background to-primary/10 border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-primary">
            <Users className="w-6 h-6" />
            Customer Portal
          </CardTitle>
          <CardDescription>
            Track your projects, request estimates, and manage your account
          </CardDescription>
        </CardHeader>
      </Card>

      <Tabs defaultValue="projects" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="projects">My Projects</TabsTrigger>
          <TabsTrigger value="estimates">Request Estimate</TabsTrigger>
          <TabsTrigger value="history">Estimate History</TabsTrigger>
          <TabsTrigger value="feedback">Feedback</TabsTrigger>
        </TabsList>

        {/* Active Projects Tab */}
        <TabsContent value="projects" className="space-y-4">
          <div className="grid gap-4">
            {activeProjects.map((project) => (
              <Card key={project.id} className="border-border/50">
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="font-semibold text-lg">{project.title}</h3>
                      <p className="text-muted-foreground">{project.description}</p>
                    </div>
                    <Badge variant="outline" className={getStatusColor(project.status)}>
                      {project.status.replace('_', ' ')}
                    </Badge>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Progress</span>
                        <span>{project.progress}%</span>
                      </div>
                      <Progress value={project.progress} className="h-2" />
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <DollarSign className="w-4 h-4 text-muted-foreground" />
                        <span>Amount: ${project.amount.toLocaleString()}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-muted-foreground" />
                        <span>Due: {new Date(project.estimated_completion).toLocaleDateString()}</span>
                      </div>
                    </div>

                    {project.images.length > 0 && (
                      <div>
                        <h4 className="text-sm font-medium mb-2">Project Photos</h4>
                        <div className="flex gap-2">
                          {project.images.map((_, index) => (
                            <div key={index} className="w-16 h-16 bg-muted rounded-lg border" />
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Request Estimate Tab */}
        <TabsContent value="estimates" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Request New Estimate</CardTitle>
              <CardDescription>
                Get a free quote for your paving, sealcoating, or line striping project
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium">Service Type</label>
                <select 
                  className="w-full mt-1 p-2 border rounded-md"
                  value={newEstimate.type}
                  onChange={(e) => setNewEstimate(prev => ({ ...prev, type: e.target.value as EstimateRequest['type'] }))}
                >
                  <option value="paving">Asphalt Paving</option>
                  <option value="sealcoating">Sealcoating</option>
                  <option value="line_striping">Line Striping</option>
                </select>
              </div>

              <div>
                <label className="text-sm font-medium">Property Address</label>
                <Input
                  value={newEstimate.property_address}
                  onChange={(e) => setNewEstimate(prev => ({ ...prev, property_address: e.target.value }))}
                  placeholder="Enter the property address"
                />
              </div>

              <div>
                <label className="text-sm font-medium">Contact Information</label>
                <Input
                  value={newEstimate.contact_info}
                  onChange={(e) => setNewEstimate(prev => ({ ...prev, contact_info: e.target.value }))}
                  placeholder="Email and phone number"
                />
              </div>

              <div>
                <label className="text-sm font-medium">Estimated Area (sq ft)</label>
                <Input
                  type="number"
                  value={newEstimate.estimated_area}
                  onChange={(e) => setNewEstimate(prev => ({ ...prev, estimated_area: Number(e.target.value) }))}
                  placeholder="Approximate square footage"
                />
              </div>

              <div>
                <label className="text-sm font-medium">Preferred Start Date</label>
                <Input
                  type="date"
                  value={newEstimate.preferred_date}
                  onChange={(e) => setNewEstimate(prev => ({ ...prev, preferred_date: e.target.value }))}
                />
              </div>

              <div>
                <label className="text-sm font-medium">Project Description</label>
                <Textarea
                  value={newEstimate.description}
                  onChange={(e) => setNewEstimate(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe your project in detail..."
                  rows={4}
                />
              </div>

              <Button onClick={handleEstimateRequest} className="w-full">
                Submit Estimate Request
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Estimate History Tab */}
        <TabsContent value="history" className="space-y-4">
          <div className="space-y-4">
            {estimateRequests.map((request) => (
              <Card key={request.id} className="border-border/50">
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="font-semibold">{request.type.replace('_', ' ').toUpperCase()}</h3>
                      <p className="text-muted-foreground">{request.description}</p>
                      <p className="text-sm text-muted-foreground mt-1">{request.property_address}</p>
                    </div>
                    <Badge variant={getEstimateStatusVariant(request.status)}>
                      {request.status}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      <span>Submitted: {new Date(request.submitted_date).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-muted-foreground" />
                      <span>Preferred: {new Date(request.preferred_date).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span>Area: {request.estimated_area} sq ft</span>
                    </div>
                    {request.quoted_amount && (
                      <div className="flex items-center gap-2">
                        <DollarSign className="w-4 h-4 text-muted-foreground" />
                        <span>Quote: ${request.quoted_amount.toLocaleString()}</span>
                      </div>
                    )}
                  </div>

                  {request.status === 'quoted' && (
                    <div className="flex gap-2 mt-4">
                      <Button size="sm">Accept Quote</Button>
                      <Button variant="outline" size="sm">Request Changes</Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Feedback Tab */}
        <TabsContent value="feedback" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageCircle className="w-5 h-5" />
                Share Your Feedback
              </CardTitle>
              <CardDescription>
                Help us improve our services by sharing your experience
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium">Select Project</label>
                <select 
                  className="w-full mt-1 p-2 border rounded-md"
                  value={feedback.project_id}
                  onChange={(e) => setFeedback(prev => ({ ...prev, project_id: e.target.value }))}
                >
                  <option value="">Choose a project...</option>
                  {activeProjects.map(project => (
                    <option key={project.id} value={project.id}>{project.title}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-sm font-medium">Rating</label>
                <div className="flex items-center gap-1 mt-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Button
                      key={star}
                      variant="ghost"
                      size="sm"
                      onClick={() => setFeedback(prev => ({ ...prev, rating: star }))}
                      className="p-1"
                    >
                      <Star 
                        className={`w-6 h-6 ${star <= feedback.rating ? 'fill-warning text-warning' : 'text-muted-foreground'}`} 
                      />
                    </Button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium">Comments</label>
                <Textarea
                  value={feedback.comment}
                  onChange={(e) => setFeedback(prev => ({ ...prev, comment: e.target.value }))}
                  placeholder="Share your experience with our team..."
                  rows={4}
                />
              </div>

              <Button onClick={submitFeedback} className="w-full">
                Submit Feedback
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}