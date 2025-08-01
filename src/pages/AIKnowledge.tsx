import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { AppSidebar } from '../components/layout/app-sidebar';
import { 
  Brain, 
  Search, 
  BookOpen, 
  FileText,
  Video,
  MessageSquare,
  Lightbulb,
  Star,
  Clock,
  Zap,
  Target,
  TrendingUp,
  Database,
  Settings,
  Download,
  Upload,
  Filter,
  Send
} from 'lucide-react';

export default function AIKnowledge() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const knowledgeStats = {
    totalArticles: 1247,
    categories: 24,
    recentAdded: 8,
    totalViews: 15420
  };

  const categories = [
    { id: 'asphalt', name: 'Asphalt & Paving', count: 156, color: 'bg-blue-500' },
    { id: 'sealcoating', name: 'Sealcoating', count: 89, color: 'bg-green-500' },
    { id: 'safety', name: 'Safety Protocols', count: 67, color: 'bg-red-500' },
    { id: 'equipment', name: 'Equipment & Tools', count: 134, color: 'bg-purple-500' },
    { id: 'regulations', name: 'Regulations & Compliance', count: 45, color: 'bg-orange-500' },
    { id: 'best-practices', name: 'Best Practices', count: 78, color: 'bg-teal-500' }
  ];

  const recentKnowledge = [
    {
      id: 1,
      title: 'Cold Weather Sealcoating Guidelines',
      type: 'article',
      category: 'sealcoating',
      author: 'AI Assistant',
      views: 234,
      rating: 4.8,
      lastUpdated: '2 hours ago',
      tags: ['cold weather', 'temperature', 'application']
    },
    {
      id: 2,
      title: 'Church Parking Lot Layout Optimization',
      type: 'video',
      category: 'best-practices',
      author: 'Expert System',
      views: 567,
      rating: 4.9,
      lastUpdated: '1 day ago',
      tags: ['parking', 'layout', 'church', 'optimization']
    },
    {
      id: 3,
      title: 'Virginia Contractor Compliance Checklist',
      type: 'document',
      category: 'regulations',
      author: 'Compliance AI',
      views: 345,
      rating: 4.7,
      lastUpdated: '3 days ago',
      tags: ['Virginia', 'compliance', 'contractor', 'legal']
    }
  ];

  const aiInsights = [
    {
      title: 'Trending Topics',
      items: [
        'Winter preparation techniques',
        'Eco-friendly sealcoating options',
        'Parking space optimization',
        'Equipment maintenance schedules'
      ]
    },
    {
      title: 'Recommended Learning',
      items: [
        'Advanced crack sealing methods',
        'Customer communication best practices',
        'Weather-based scheduling',
        'Cost estimation accuracy'
      ]
    }
  ];

  return (
    <div className="flex h-screen">
      <AppSidebar />
      <div className="flex-1 p-6 overflow-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">AI Knowledge Manager</h1>
          <p className="text-muted-foreground">
            Intelligent knowledge base with AI-powered insights and learning recommendations
          </p>
        </div>

        {/* Knowledge Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Knowledge Articles</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-2xl font-bold">{knowledgeStats.totalArticles}</div>
                <BookOpen className="h-5 w-5 text-blue-600" />
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                Across {knowledgeStats.categories} categories
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Recent Additions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-2xl font-bold text-green-600">{knowledgeStats.recentAdded}</div>
                <Clock className="h-5 w-5 text-green-600" />
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                This week
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Views</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-2xl font-bold text-purple-600">{knowledgeStats.totalViews.toLocaleString()}</div>
                <TrendingUp className="h-5 w-5 text-purple-600" />
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                All time
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">AI Suggestions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-2xl font-bold text-orange-600">12</div>
                <Lightbulb className="h-5 w-5 text-orange-600" />
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                Pending review
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="knowledge" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="knowledge">Knowledge Base</TabsTrigger>
            <TabsTrigger value="ai-insights">AI Insights</TabsTrigger>
            <TabsTrigger value="learning">Learning Path</TabsTrigger>
            <TabsTrigger value="chat">AI Chat</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="knowledge" className="space-y-6">
            {/* Search and Filters */}
            <Card>
              <CardContent className="p-4">
                <div className="flex gap-4 items-center">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search knowledge base..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Button variant="outline" size="sm">
                    <Filter className="h-4 w-4 mr-2" />
                    Filters
                  </Button>
                  <Button variant="outline" size="sm">
                    <Upload className="h-4 w-4 mr-2" />
                    Upload
                  </Button>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* Categories */}
              <div className="space-y-4">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">Categories</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div
                      className={`flex items-center justify-between p-2 rounded cursor-pointer ${
                        selectedCategory === 'all' ? 'bg-primary/10' : 'hover:bg-muted'
                      }`}
                      onClick={() => setSelectedCategory('all')}
                    >
                      <span className="text-sm font-medium">All Categories</span>
                      <Badge variant="outline">{knowledgeStats.totalArticles}</Badge>
                    </div>
                    {categories.map((category) => (
                      <div
                        key={category.id}
                        className={`flex items-center justify-between p-2 rounded cursor-pointer ${
                          selectedCategory === category.id ? 'bg-primary/10' : 'hover:bg-muted'
                        }`}
                        onClick={() => setSelectedCategory(category.id)}
                      >
                        <div className="flex items-center gap-2">
                          <div className={`w-3 h-3 rounded-full ${category.color}`}></div>
                          <span className="text-sm font-medium">{category.name}</span>
                        </div>
                        <Badge variant="outline">{category.count}</Badge>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">Quick Actions</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <Button variant="outline" size="sm" className="w-full justify-start">
                      <Brain className="h-4 w-4 mr-2" />
                      Ask AI Assistant
                    </Button>
                    <Button variant="outline" size="sm" className="w-full justify-start">
                      <Target className="h-4 w-4 mr-2" />
                      Create Learning Path
                    </Button>
                    <Button variant="outline" size="sm" className="w-full justify-start">
                      <Database className="h-4 w-4 mr-2" />
                      Knowledge Import
                    </Button>
                  </CardContent>
                </Card>
              </div>

              {/* Knowledge Articles */}
              <div className="lg:col-span-3 space-y-4">
                {recentKnowledge.map((item) => (
                  <Card key={item.id} className="hover:bg-muted/50 cursor-pointer">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="flex items-center justify-center w-10 h-10 bg-primary/10 rounded-lg">
                            {item.type === 'article' && <FileText className="h-5 w-5" />}
                            {item.type === 'video' && <Video className="h-5 w-5" />}
                            {item.type === 'document' && <BookOpen className="h-5 w-5" />}
                          </div>
                          <div>
                            <h3 className="font-semibold mb-1">{item.title}</h3>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <span>By {item.author}</span>
                              <span>•</span>
                              <span>{item.lastUpdated}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-1">
                            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                            <span className="text-sm font-medium">{item.rating}</span>
                          </div>
                          <Badge variant="outline">{item.views} views</Badge>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex flex-wrap gap-1">
                          {item.tags.map((tag) => (
                            <Badge key={tag} variant="secondary" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm">
                            <BookOpen className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="sm">
                            <Download className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="ai-insights" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {aiInsights.map((insight, index) => (
                <Card key={index}>
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <Lightbulb className="h-5 w-5" />
                      {insight.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {insight.items.map((item, i) => (
                      <div key={i} className="flex items-center justify-between p-2 rounded hover:bg-muted/50">
                        <span className="text-sm">{item}</span>
                        <Button variant="outline" size="sm">
                          <Zap className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              ))}
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">AI-Generated Content Suggestions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  'Winter Sealcoating Best Practices for Virginia Climate',
                  'Church Parking Lot Striping Regulations and Guidelines',
                  'Equipment Maintenance Checklist for Asphalt Crews',
                  'Customer Communication Templates for Project Updates'
                ].map((suggestion, i) => (
                  <div key={i} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Brain className="h-5 w-5 text-blue-500" />
                      <span className="font-medium">{suggestion}</span>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">Review</Button>
                      <Button size="sm">Generate</Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="learning" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Personalized Learning Paths</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { title: 'Virginia Contractor Certification', progress: 75, modules: 8 },
                  { title: 'Advanced Sealcoating Techniques', progress: 45, modules: 12 },
                  { title: 'Business Management for Contractors', progress: 20, modules: 15 },
                  { title: 'Safety Compliance Training', progress: 90, modules: 6 }
                ].map((path, i) => (
                  <div key={i} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold">{path.title}</h3>
                      <Badge variant="outline">{path.modules} modules</Badge>
                    </div>
                    <div className="flex items-center gap-3 mb-3">
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-500 h-2 rounded-full transition-all"
                          style={{ width: `${path.progress}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium">{path.progress}%</span>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">Continue</Button>
                      <Button variant="outline" size="sm">
                        <Settings className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="chat" className="space-y-6">
            <Card className="h-[600px] flex flex-col">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  AI Knowledge Assistant
                </CardTitle>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col">
                <div className="flex-1 bg-muted/20 rounded-lg p-4 mb-4 overflow-auto">
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                        <Brain className="h-4 w-4 text-white" />
                      </div>
                      <div className="bg-white p-3 rounded-lg flex-1">
                        <p className="text-sm">
                          Hello! I'm your AI Knowledge Assistant. I can help you with questions about asphalt paving, 
                          sealcoating, safety regulations, and business best practices. What would you like to know?
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Input placeholder="Ask me anything about paving and sealcoating..." className="flex-1" />
                  <Button>
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Quick Questions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {[
                    'What temperature is best for sealcoating?',
                    'How do I calculate asphalt tonnage?',
                    'What are Virginia contractor requirements?',
                    'Best practices for church parking lots?'
                  ].map((question, i) => (
                    <Button key={i} variant="outline" className="text-left justify-start h-auto p-3">
                      {question}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Most Viewed</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {[
                    'Sealcoating Application Guide',
                    'Safety Protocol Checklist',
                    'Equipment Maintenance Log',
                    'Weather Guidelines'
                  ].map((item, i) => (
                    <div key={i} className="flex justify-between text-sm">
                      <span>{item}</span>
                      <span className="text-muted-foreground">{234 - i * 20}</span>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Top Categories</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {categories.slice(0, 4).map((category, i) => (
                    <div key={i} className="flex justify-between text-sm">
                      <span>{category.name}</span>
                      <span className="text-muted-foreground">{category.count}</span>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">User Engagement</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Daily Active Users</span>
                    <span className="text-muted-foreground">24</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Avg. Session Time</span>
                    <span className="text-muted-foreground">8m 34s</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Knowledge Retention</span>
                    <span className="text-muted-foreground">87%</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>User Satisfaction</span>
                    <span className="text-muted-foreground">4.6/5</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}