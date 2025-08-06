import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { ScrollArea } from '../ui/scroll-area';
import {
  Store,
  Package,
  Code,
  Puzzle,
  Download,
  Star,
  Users,
  Search,
  Filter,
  Settings,
  Wrench,
  Terminal,
  FileText,
  Zap,
  Shield,
  CheckCircle,
  AlertTriangle,
  Clock,
  Activity,
  BarChart3,
  Layers,
  Globe,
  Upload,
  Play,
  Building2,
  Briefcase,
} from 'lucide-react';

// Platform Ecosystem Interfaces
interface Extension {
  id: string;
  name: string;
  version: string;
  author: {
    name: string;
    company?: string;
    verified: boolean;
  };
  category: 'productivity' | 'integration' | 'analytics' | 'ui' | 'workflow' | 'reporting' | 'ai' | 'security';
  description: string;
  longDescription: string;
  features: string[];
  screenshots: string[];
  icon: string;
  pricing: {
    type: 'free' | 'freemium' | 'paid' | 'subscription';
    price?: number;
    currency?: string;
    trial?: number;
  };
  stats: {
    downloads: number;
    rating: number;
    reviews: number;
    lastUpdated: Date;
    compatibility: string[];
  };
  permissions: string[];
  status: 'published' | 'pending' | 'rejected' | 'deprecated';
  tags: string[];
  changelog: {
    version: string;
    date: Date;
    changes: string[];
  }[];
  metadata: {
    size: number;
    language: string;
    dependencies: string[];
    minVersion: string;
  };
}

interface MarketplaceStats {
  totalExtensions: number;
  totalDownloads: number;
  totalDevelopers: number;
  averageRating: number;
  categoryCounts: Record<string, number>;
  popularExtensions: Extension[];
  recentExtensions: Extension[];
  trendingExtensions: Extension[];
}

interface DeveloperAccount {
  id: string;
  name: string;
  email: string;
  company?: string;
  verified: boolean;
  tier: 'individual' | 'business' | 'enterprise';
  stats: {
    extensionsPublished: number;
    totalDownloads: number;
    averageRating: number;
    revenue: number;
  };
  profile: {
    bio: string;
    website?: string;
    github?: string;
    twitter?: string;
    location?: string;
  };
  apiKeys: APIKey[];
  createdAt: Date;
  lastLogin: Date;
}

interface APIKey {
  id: string;
  name: string;
  key: string;
  permissions: string[];
  usageLimit: number;
  usageCount: number;
  createdAt: Date;
  expiresAt?: Date;
  lastUsed?: Date;
  status: 'active' | 'revoked' | 'expired';
}

interface ExtensionInstallation {
  id: string;
  extensionId: string;
  userId: string;
  installedAt: Date;
  version: string;
  status: 'active' | 'disabled' | 'error';
  settings: Record<string, any>;
  usage: {
    lastUsed: Date;
    usageCount: number;
    errors: number;
  };
}

interface SDK {
  name: string;
  version: string;
  language: string;
  description: string;
  documentation: string;
  examples: CodeExample[];
  changelog: {
    version: string;
    date: Date;
    changes: string[];
  }[];
}

interface CodeExample {
  id: string;
  name: string;
  description: string;
  code: string;
  language: string;
  category: string;
  tags: string[];
}

interface ExtensionSubmission {
  id: string;
  developerId: string;
  extension: Partial<Extension>;
  status: 'draft' | 'submitted' | 'reviewing' | 'approved' | 'rejected';
  reviewer?: string;
  feedback?: string;
  submittedAt: Date;
  reviewedAt?: Date;
}

// Platform Ecosystem Engine
class PlatformEcosystemEngine {
  private extensions: Map<string, Extension> = new Map();
  private developers: Map<string, DeveloperAccount> = new Map();
  private installations: Map<string, ExtensionInstallation> = new Map();
  private submissions: Map<string, ExtensionSubmission> = new Map();
  private sdks: SDK[] = [];

  constructor() {
    this.initializeEcosystem();
  }

  private initializeEcosystem() {
    this.createSampleExtensions();
    this.createSampleDevelopers();
    this.initializeSDKs();
  }

  private createSampleExtensions() {
    const extensions: Extension[] = [
      {
        id: 'advanced_reporting',
        name: 'Advanced Reporting Suite',
        version: '2.1.0',
        author: {
          name: 'DataViz Pro',
          company: 'DataViz Solutions Inc.',
          verified: true,
        },
        category: 'reporting',
        description: 'Comprehensive reporting and analytics tools with advanced visualizations',
        longDescription: 'Transform your project data into actionable insights with our Advanced Reporting Suite. Features include custom dashboards, automated reports, interactive charts, and executive summaries.',
        features: [
          'Custom dashboard builder',
          'Automated report generation',
          'Interactive data visualizations',
          'Export to PDF, Excel, PowerPoint',
          'Scheduled report delivery',
          'Mobile-responsive reports',
        ],
        screenshots: [
          '/screenshots/reporting_1.png',
          '/screenshots/reporting_2.png',
          '/screenshots/reporting_3.png',
        ],
        icon: '/icons/reporting.svg',
        pricing: {
          type: 'subscription',
          price: 29.99,
          currency: 'USD',
          trial: 14,
        },
        stats: {
          downloads: 15420,
          rating: 4.7,
          reviews: 892,
          lastUpdated: new Date(Date.now() - 86400000 * 7),
          compatibility: ['v1.0+', 'Enterprise', 'Professional'],
        },
        permissions: [
          'Read project data',
          'Generate reports',
          'Send notifications',
          'Access analytics',
        ],
        status: 'published',
        tags: ['reporting', 'analytics', 'dashboard', 'visualization'],
        changelog: [
          {
            version: '2.1.0',
            date: new Date(Date.now() - 86400000 * 7),
            changes: [
              'Added mobile-responsive design',
              'Improved chart performance',
              'New template gallery',
              'Bug fixes and optimizations',
            ],
          },
          {
            version: '2.0.0',
            date: new Date(Date.now() - 86400000 * 30),
            changes: [
              'Major UI redesign',
              'Interactive dashboard builder',
              'Real-time data updates',
              'Enhanced export options',
            ],
          },
        ],
        metadata: {
          size: 15.6,
          language: 'TypeScript',
          dependencies: ['chart.js', 'react', 'tailwindcss'],
          minVersion: '1.0.0',
        },
      },
      {
        id: 'project_ai_assistant',
        name: 'Project AI Assistant',
        version: '1.3.2',
        author: {
          name: 'AI Solutions',
          verified: true,
        },
        category: 'ai',
        description: 'AI-powered assistant for project management and task automation',
        longDescription: 'Leverage the power of artificial intelligence to streamline your project workflow. The AI Assistant provides intelligent suggestions, automates repetitive tasks, and helps optimize resource allocation.',
        features: [
          'Intelligent task suggestions',
          'Automated project scheduling',
          'Resource optimization',
          'Risk assessment and mitigation',
          'Natural language processing',
          'Predictive analytics',
        ],
        screenshots: [
          '/screenshots/ai_1.png',
          '/screenshots/ai_2.png',
        ],
        icon: '/icons/ai.svg',
        pricing: {
          type: 'freemium',
          price: 19.99,
          currency: 'USD',
          trial: 7,
        },
        stats: {
          downloads: 8950,
          rating: 4.5,
          reviews: 456,
          lastUpdated: new Date(Date.now() - 86400000 * 3),
          compatibility: ['v1.2+', 'Professional', 'Enterprise'],
        },
        permissions: [
          'Read project data',
          'Modify tasks',
          'Send notifications',
          'Access calendar',
          'Machine learning processing',
        ],
        status: 'published',
        tags: ['ai', 'automation', 'assistant', 'ml'],
        changelog: [
          {
            version: '1.3.2',
            date: new Date(Date.now() - 86400000 * 3),
            changes: [
              'Improved AI model accuracy',
              'Faster response times',
              'New voice commands feature',
              'Bug fixes',
            ],
          },
        ],
        metadata: {
          size: 24.3,
          language: 'Python',
          dependencies: ['tensorflow', 'nltk', 'scikit-learn'],
          minVersion: '1.2.0',
        },
      },
      {
        id: 'mobile_companion',
        name: 'Mobile Companion',
        version: '3.0.1',
        author: {
          name: 'MobileDev Team',
          company: 'Mobile Solutions Ltd.',
          verified: true,
        },
        category: 'productivity',
        description: 'Enhanced mobile experience with offline capabilities',
        longDescription: 'Stay productive on the go with our Mobile Companion. Features offline sync, push notifications, and a streamlined mobile interface designed for construction professionals.',
        features: [
          'Offline data synchronization',
          'Push notifications',
          'GPS integration',
          'Photo and video capture',
          'Voice notes',
          'Barcode scanning',
        ],
        screenshots: [
          '/screenshots/mobile_1.png',
          '/screenshots/mobile_2.png',
          '/screenshots/mobile_3.png',
        ],
        icon: '/icons/mobile.svg',
        pricing: {
          type: 'free',
        },
        stats: {
          downloads: 32456,
          rating: 4.8,
          reviews: 1205,
          lastUpdated: new Date(Date.now() - 86400000 * 2),
          compatibility: ['v1.0+', 'All Tiers'],
        },
        permissions: [
          'Camera access',
          'Location services',
          'Push notifications',
          'Local storage',
          'Network access',
        ],
        status: 'published',
        tags: ['mobile', 'offline', 'sync', 'gps'],
        changelog: [
          {
            version: '3.0.1',
            date: new Date(Date.now() - 86400000 * 2),
            changes: [
              'Fixed sync issues',
              'Improved GPS accuracy',
              'Performance optimizations',
            ],
          },
        ],
        metadata: {
          size: 18.9,
          language: 'React Native',
          dependencies: ['react-native', 'expo', 'realm'],
          minVersion: '1.0.0',
        },
      },
    ];

    extensions.forEach(extension => {
      this.extensions.set(extension.id, extension);
    });
  }

  private createSampleDevelopers() {
    const developers: DeveloperAccount[] = [
      {
        id: 'dev_1',
        name: 'John Smith',
        email: 'john@dataviz.com',
        company: 'DataViz Solutions Inc.',
        verified: true,
        tier: 'business',
        stats: {
          extensionsPublished: 3,
          totalDownloads: 25000,
          averageRating: 4.6,
          revenue: 15420.50,
        },
        profile: {
          bio: 'Experienced developer specializing in data visualization and analytics solutions.',
          website: 'https://dataviz.com',
          github: 'johnsmith-dev',
          location: 'San Francisco, CA',
        },
        apiKeys: [
          {
            id: 'key_1',
            name: 'Production API',
            key: 'pk_live_abcd1234...',
            permissions: ['read', 'write', 'analytics'],
            usageLimit: 10000,
            usageCount: 2456,
            createdAt: new Date(Date.now() - 86400000 * 30),
            status: 'active',
          },
        ],
        createdAt: new Date(Date.now() - 86400000 * 180),
        lastLogin: new Date(Date.now() - 86400000 * 1),
      },
      {
        id: 'dev_2',
        name: 'Sarah Johnson',
        email: 'sarah@aisolutions.io',
        verified: true,
        tier: 'individual',
        stats: {
          extensionsPublished: 2,
          totalDownloads: 12000,
          averageRating: 4.4,
          revenue: 8960.25,
        },
        profile: {
          bio: 'AI/ML engineer passionate about automation and intelligent systems.',
          website: 'https://aisolutions.io',
          github: 'sarah-ml',
          twitter: '@sarah_ai',
          location: 'Austin, TX',
        },
        apiKeys: [
          {
            id: 'key_2',
            name: 'Development API',
            key: 'pk_test_xyz789...',
            permissions: ['read', 'write'],
            usageLimit: 5000,
            usageCount: 1234,
            createdAt: new Date(Date.now() - 86400000 * 15),
            status: 'active',
          },
        ],
        createdAt: new Date(Date.now() - 86400000 * 120),
        lastLogin: new Date(Date.now() - 86400000 * 2),
      },
    ];

    developers.forEach(developer => {
      this.developers.set(developer.id, developer);
    });
  }

  private initializeSDKs() {
    this.sdks = [
      {
        name: 'PaveMaster JavaScript SDK',
        version: '2.1.0',
        language: 'JavaScript',
        description: 'Official JavaScript SDK for building PaveMaster extensions',
        documentation: 'https://docs.pavemaster.com/sdk/javascript',
        examples: [
          {
            id: 'basic_extension',
            name: 'Basic Extension Template',
            description: 'A simple extension that adds a custom toolbar button',
            code: `
import { PaveMaster } from '@pavemaster/sdk';

export default class MyExtension {
  constructor() {
    this.api = new PaveMaster.API();
  }

  initialize() {
    this.api.toolbar.addButton({
      label: 'My Tool',
      icon: 'tool',
      onClick: this.handleClick.bind(this)
    });
  }

  handleClick() {
    this.api.notifications.show({
      message: 'Hello from my extension!',
      type: 'info'
    });
  }
}
            `,
            language: 'javascript',
            category: 'basic',
            tags: ['toolbar', 'button', 'notification'],
          },
          {
            id: 'data_processor',
            name: 'Data Processing Extension',
            description: 'Extension that processes project data and generates reports',
            code: `
import { PaveMaster } from '@pavemaster/sdk';

export default class DataProcessor {
  async processProjectData(projectId) {
    const project = await this.api.projects.get(projectId);
    const tasks = await this.api.tasks.getByProject(projectId);
    
    const report = {
      projectName: project.name,
      totalTasks: tasks.length,
      completedTasks: tasks.filter(t => t.status === 'completed').length,
      progressPercentage: this.calculateProgress(tasks)
    };
    
    return report;
  }
  
  calculateProgress(tasks) {
    const completed = tasks.filter(t => t.status === 'completed').length;
    return Math.round((completed / tasks.length) * 100);
  }
}
            `,
            language: 'javascript',
            category: 'data',
            tags: ['data', 'processing', 'reports'],
          },
        ],
        changelog: [
          {
            version: '2.1.0',
            date: new Date(Date.now() - 86400000 * 7),
            changes: [
              'Added new Analytics API',
              'Improved error handling',
              'TypeScript definitions updated',
              'Performance optimizations',
            ],
          },
        ],
      },
      {
        name: 'PaveMaster Python SDK',
        version: '1.5.2',
        language: 'Python',
        description: 'Python SDK for advanced data processing and AI extensions',
        documentation: 'https://docs.pavemaster.com/sdk/python',
        examples: [
          {
            id: 'ml_analyzer',
            name: 'Machine Learning Analyzer',
            description: 'Use ML to analyze project patterns and predict outcomes',
            code: `
import pavemaster_sdk as pm
import pandas as pd
from sklearn.ensemble import RandomForestRegressor

class MLAnalyzer:
    def __init__(self):
        self.api = pm.API()
        self.model = RandomForestRegressor()
    
    def train_model(self, project_data):
        df = pd.DataFrame(project_data)
        X = df[['budget', 'team_size', 'complexity']]
        y = df['completion_time']
        
        self.model.fit(X, y)
        return {'accuracy': self.model.score(X, y)}
    
    def predict_completion(self, project_features):
        prediction = self.model.predict([project_features])
        return {'estimated_days': prediction[0]}
            `,
            language: 'python',
            category: 'ml',
            tags: ['machine-learning', 'prediction', 'analytics'],
          },
        ],
        changelog: [
          {
            version: '1.5.2',
            date: new Date(Date.now() - 86400000 * 14),
            changes: [
              'Added ML utilities',
              'Improved data connectors',
              'Bug fixes',
            ],
          },
        ],
      },
    ];
  }

  async searchExtensions(query: string, filters?: {
    category?: string;
    pricing?: string;
    rating?: number;
    tags?: string[];
  }): Promise<Extension[]> {
    let results = Array.from(this.extensions.values());

    // Text search
    if (query) {
      const lowerQuery = query.toLowerCase();
      results = results.filter(ext => 
        ext.name.toLowerCase().includes(lowerQuery) ||
        ext.description.toLowerCase().includes(lowerQuery) ||
        ext.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
      );
    }

    // Apply filters
    if (filters) {
      if (filters.category) {
        results = results.filter(ext => ext.category === filters.category);
      }
      if (filters.pricing) {
        results = results.filter(ext => ext.pricing.type === filters.pricing);
      }
      if (filters.rating) {
        results = results.filter(ext => ext.stats.rating >= filters.rating);
      }
      if (filters.tags && filters.tags.length > 0) {
        results = results.filter(ext => 
          filters.tags!.some(tag => ext.tags.includes(tag))
        );
      }
    }

    // Sort by relevance (downloads * rating)
    results.sort((a, b) => {
      const scoreA = a.stats.downloads * a.stats.rating;
      const scoreB = b.stats.downloads * b.stats.rating;
      return scoreB - scoreA;
    });

    return results;
  }

  async installExtension(extensionId: string, userId: string): Promise<ExtensionInstallation> {
    const extension = this.extensions.get(extensionId);
    if (!extension) {
      throw new Error('Extension not found');
    }

    const installation: ExtensionInstallation = {
      id: `install_${Date.now()}`,
      extensionId,
      userId,
      installedAt: new Date(),
      version: extension.version,
      status: 'active',
      settings: {},
      usage: {
        lastUsed: new Date(),
        usageCount: 0,
        errors: 0,
      },
    };

    this.installations.set(installation.id, installation);
    
    // Update download count
    extension.stats.downloads++;
    
    return installation;
  }

  async submitExtension(developerId: string, extensionData: Partial<Extension>): Promise<ExtensionSubmission> {
    const submission: ExtensionSubmission = {
      id: `submission_${Date.now()}`,
      developerId,
      extension: extensionData,
      status: 'submitted',
      submittedAt: new Date(),
    };

    this.submissions.set(submission.id, submission);
    return submission;
  }

  async generateAPIKey(developerId: string, keyName: string, permissions: string[]): Promise<APIKey> {
    const developer = this.developers.get(developerId);
    if (!developer) {
      throw new Error('Developer not found');
    }

    const apiKey: APIKey = {
      id: `key_${Date.now()}`,
      name: keyName,
      key: `pk_${Date.now().toString(36)}_${Math.random().toString(36).substr(2, 9)}`,
      permissions,
      usageLimit: developer.tier === 'individual' ? 5000 : developer.tier === 'business' ? 25000 : 100000,
      usageCount: 0,
      createdAt: new Date(),
      status: 'active',
    };

    developer.apiKeys.push(apiKey);
    return apiKey;
  }

  getMarketplaceStats(): MarketplaceStats {
    const extensions = Array.from(this.extensions.values());
    const published = extensions.filter(ext => ext.status === 'published');

    const categoryCounts = published.reduce((acc, ext) => {
      acc[ext.category] = (acc[ext.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalExtensions: published.length,
      totalDownloads: published.reduce((sum, ext) => sum + ext.stats.downloads, 0),
      totalDevelopers: this.developers.size,
      averageRating: published.reduce((sum, ext) => sum + ext.stats.rating, 0) / published.length,
      categoryCounts,
      popularExtensions: published
        .sort((a, b) => b.stats.downloads - a.stats.downloads)
        .slice(0, 5),
      recentExtensions: published
        .sort((a, b) => b.stats.lastUpdated.getTime() - a.stats.lastUpdated.getTime())
        .slice(0, 5),
      trendingExtensions: published
        .sort((a, b) => (b.stats.downloads * b.stats.rating) - (a.stats.downloads * a.stats.rating))
        .slice(0, 5),
    };
  }

  getDeveloperAnalytics(developerId: string): any {
    const developer = this.developers.get(developerId);
    if (!developer) return null;

    const developerExtensions = Array.from(this.extensions.values())
      .filter(ext => ext.author.name === developer.name);

    const installations = Array.from(this.installations.values())
      .filter(inst => developerExtensions.some(ext => ext.id === inst.extensionId));

    return {
      totalExtensions: developerExtensions.length,
      totalDownloads: developerExtensions.reduce((sum, ext) => sum + ext.stats.downloads, 0),
      totalRevenue: developer.stats.revenue,
      averageRating: developerExtensions.reduce((sum, ext) => sum + ext.stats.rating, 0) / developerExtensions.length,
      activeInstallations: installations.filter(inst => inst.status === 'active').length,
      apiUsage: developer.apiKeys.reduce((sum, key) => sum + key.usageCount, 0),
      extensionsByCategory: this.groupBy(developerExtensions, 'category'),
      monthlyDownloads: this.generateMonthlyData(developerExtensions),
    };
  }

  private groupBy(array: any[], key: string): Record<string, number> {
    return array.reduce((groups, item) => {
      const value = item[key];
      groups[value] = (groups[value] || 0) + 1;
      return groups;
    }, {});
  }

  private generateMonthlyData(extensions: Extension[]): number[] {
    // Simulate monthly download data for the last 12 months
    return Array.from({ length: 12 }, (_, i) => {
      const baseDownloads = extensions.reduce((sum, ext) => sum + ext.stats.downloads, 0);
      return Math.floor(baseDownloads * (0.1 + Math.random() * 0.3) / 12);
    });
  }
}

export const PlatformEcosystem: React.FC = () => {
  const [engine] = useState(() => new PlatformEcosystemEngine());
  const [activeTab, setActiveTab] = useState('marketplace');
  const [extensions, setExtensions] = useState<Extension[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedExtension, setSelectedExtension] = useState<Extension | null>(null);
  const [marketplaceStats, setMarketplaceStats] = useState<MarketplaceStats | null>(null);
  const [isInstalling, setIsInstalling] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedPricing, setSelectedPricing] = useState<string>('all');

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    searchExtensions();
  }, [searchQuery, selectedCategory, selectedPricing]);

  const loadData = () => {
    setMarketplaceStats(engine.getMarketplaceStats());
  };

  const searchExtensions = async () => {
    const filters: any = {};
    if (selectedCategory !== 'all') filters.category = selectedCategory;
    if (selectedPricing !== 'all') filters.pricing = selectedPricing;

    const results = await engine.searchExtensions(searchQuery, filters);
    setExtensions(results);
  };

  const handleInstallExtension = async (extensionId: string) => {
    setIsInstalling(true);
    try {
      await engine.installExtension(extensionId, 'current_user');
      loadData();
      // Show success notification
    } catch (error) {
      console.error('Failed to install extension:', error);
    } finally {
      setIsInstalling(false);
    }
  };

  const formatPrice = (extension: Extension) => {
    if (extension.pricing.type === 'free') return 'Free';
    if (extension.pricing.type === 'freemium') return 'Freemium';
    if (extension.pricing.price) {
      return `$${extension.pricing.price}${extension.pricing.type === 'subscription' ? '/mo' : ''}`;
    }
    return 'Paid';
  };

  const getPricingColor = (type: string) => {
    switch (type) {
      case 'free': return 'default';
      case 'freemium': return 'secondary';
      case 'paid': return 'outline';
      case 'subscription': return 'destructive';
      default: return 'outline';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'productivity': return Zap;
      case 'integration': return Puzzle;
      case 'analytics': return BarChart3;
      case 'ui': return Layers;
      case 'workflow': return Activity;
      case 'reporting': return FileText;
      case 'ai': return Brain;
      case 'security': return Shield;
      default: return Package;
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Store className="h-6 w-6 text-green-600" />
              <CardTitle>Platform Ecosystem</CardTitle>
              <Badge variant="secondary">Phase 5</Badge>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant="default">
                <Package className="h-3 w-3 mr-1" />
                {marketplaceStats?.totalExtensions || 0} Extensions
              </Badge>
              <Badge variant="outline">
                <Users className="h-3 w-3 mr-1" />
                {marketplaceStats?.totalDevelopers || 0} Developers
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="marketplace">
                <Store className="h-4 w-4 mr-2" />
                Marketplace
              </TabsTrigger>
              <TabsTrigger value="installed">
                <Package className="h-4 w-4 mr-2" />
                Installed
              </TabsTrigger>
              <TabsTrigger value="develop">
                <Code className="h-4 w-4 mr-2" />
                Develop
              </TabsTrigger>
              <TabsTrigger value="analytics">
                <BarChart3 className="h-4 w-4 mr-2" />
                Analytics
              </TabsTrigger>
              <TabsTrigger value="sdk">
                <Terminal className="h-4 w-4 mr-2" />
                SDK & Docs
              </TabsTrigger>
            </TabsList>

            <TabsContent value="marketplace" className="space-y-6">
              {/* Search and Filters */}
              <Card>
                <CardContent className="p-4">
                  <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          placeholder="Search extensions..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="pl-10"
                        />
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <select
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className="px-3 py-2 border rounded-md text-sm"
                      >
                        <option value="all">All Categories</option>
                        <option value="productivity">Productivity</option>
                        <option value="integration">Integration</option>
                        <option value="analytics">Analytics</option>
                        <option value="ui">UI/UX</option>
                        <option value="workflow">Workflow</option>
                        <option value="reporting">Reporting</option>
                        <option value="ai">AI/ML</option>
                        <option value="security">Security</option>
                      </select>
                      <select
                        value={selectedPricing}
                        onChange={(e) => setSelectedPricing(e.target.value)}
                        className="px-3 py-2 border rounded-md text-sm"
                      >
                        <option value="all">All Pricing</option>
                        <option value="free">Free</option>
                        <option value="freemium">Freemium</option>
                        <option value="paid">Paid</option>
                        <option value="subscription">Subscription</option>
                      </select>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Extensions</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-96">
                      {extensions.length > 0 ? (
                        <div className="space-y-3">
                          {extensions.map((extension) => {
                            const Icon = getCategoryIcon(extension.category);
                            return (
                              <div
                                key={extension.id}
                                className="p-4 border rounded-lg cursor-pointer hover:bg-card dark:hover:bg-gray-800"
                                onClick={() => setSelectedExtension(extension)}
                              >
                                <div className="flex items-start justify-between mb-2">
                                  <div className="flex items-center space-x-3">
                                    <div className="w-10 h-10 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
                                      <Icon className="h-5 w-5" />
                                    </div>
                                    <div>
                                      <h4 className="font-medium text-sm">{extension.name}</h4>
                                      <p className="text-xs text-gray-600">by {extension.author.name}</p>
                                    </div>
                                  </div>
                                  <div className="flex items-center space-x-1">
                                    {extension.author.verified && (
                                      <CheckCircle className="h-4 w-4 text-blue-600" />
                                    )}
                                    <Badge variant={getPricingColor(extension.pricing.type) as any} className="text-xs">
                                      {formatPrice(extension)}
                                    </Badge>
                                  </div>
                                </div>
                                <p className="text-xs text-gray-600 mb-2">{extension.description}</p>
                                <div className="flex items-center justify-between text-xs">
                                  <div className="flex items-center space-x-3">
                                    <div className="flex items-center space-x-1">
                                      <Star className="h-3 w-3 text-yellow-500" />
                                      <span>{extension.stats.rating}</span>
                                    </div>
                                    <div className="flex items-center space-x-1">
                                      <Download className="h-3 w-3" />
                                      <span>{extension.stats.downloads.toLocaleString()}</span>
                                    </div>
                                  </div>
                                  <Badge variant="outline" className="text-xs capitalize">
                                    {extension.category}
                                  </Badge>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="text-center py-8 text-gray-500">
                          No extensions found matching your criteria
                        </div>
                      )}
                    </ScrollArea>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Extension Details</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {selectedExtension ? (
                      <div className="space-y-4">
                        <div className="flex items-start space-x-3">
                          <div className="w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
                            {React.createElement(getCategoryIcon(selectedExtension.category), { className: "h-6 w-6" })}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-1">
                              <h3 className="font-semibold">{selectedExtension.name}</h3>
                              {selectedExtension.author.verified && (
                                <CheckCircle className="h-4 w-4 text-blue-600" />
                              )}
                            </div>
                            <p className="text-sm text-gray-600">by {selectedExtension.author.name}</p>
                            <div className="flex items-center space-x-2 mt-2">
                              <Badge variant={getPricingColor(selectedExtension.pricing.type) as any}>
                                {formatPrice(selectedExtension)}
                              </Badge>
                              <Badge variant="outline">v{selectedExtension.version}</Badge>
                            </div>
                          </div>
                        </div>

                        <p className="text-sm">{selectedExtension.longDescription}</p>

                        <div>
                          <Label className="text-sm font-medium">Features</Label>
                          <ul className="mt-2 space-y-1">
                            {selectedExtension.features.map((feature, index) => (
                              <li key={index} className="text-sm flex items-center space-x-2">
                                <CheckCircle className="h-3 w-3 text-green-600" />
                                <span>{feature}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        <div>
                          <Label className="text-sm font-medium">Statistics</Label>
                          <div className="grid grid-cols-2 gap-2 mt-2 text-sm">
                            <div className="flex justify-between">
                              <span>Rating:</span>
                              <div className="flex items-center space-x-1">
                                <Star className="h-3 w-3 text-yellow-500" />
                                <span>{selectedExtension.stats.rating}</span>
                              </div>
                            </div>
                            <div className="flex justify-between">
                              <span>Downloads:</span>
                              <span>{selectedExtension.stats.downloads.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Reviews:</span>
                              <span>{selectedExtension.stats.reviews.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Size:</span>
                              <span>{selectedExtension.metadata.size}MB</span>
                            </div>
                          </div>
                        </div>

                        <div>
                          <Label className="text-sm font-medium">Permissions</Label>
                          <div className="flex flex-wrap gap-1 mt-2">
                            {selectedExtension.permissions.map((permission, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {permission}
                              </Badge>
                            ))}
                          </div>
                        </div>

                        <Button
                          onClick={() => handleInstallExtension(selectedExtension.id)}
                          disabled={isInstalling}
                          className="w-full"
                        >
                          {isInstalling ? (
                            <>
                              <Activity className="h-4 w-4 mr-2 animate-spin" />
                              Installing...
                            </>
                          ) : (
                            <>
                              <Download className="h-4 w-4 mr-2" />
                              Install Extension
                            </>
                          )}
                        </Button>
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        Select an extension to view details
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="installed" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Installed Extensions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8 text-gray-500">
                    <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No extensions installed yet</p>
                    <p className="text-sm">Browse the marketplace to install extensions</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="develop" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Developer Portal</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <Button className="h-20 flex-col">
                        <Upload className="h-6 w-6 mb-2" />
                        <span className="text-sm">Submit Extension</span>
                      </Button>
                      <Button variant="outline" className="h-20 flex-col">
                        <Terminal className="h-6 w-6 mb-2" />
                        <span className="text-sm">API Keys</span>
                      </Button>
                      <Button variant="outline" className="h-20 flex-col">
                        <FileText className="h-6 w-6 mb-2" />
                        <span className="text-sm">Documentation</span>
                      </Button>
                      <Button variant="outline" className="h-20 flex-col">
                        <Users className="h-6 w-6 mb-2" />
                        <span className="text-sm">Community</span>
                      </Button>
                    </div>

                    <div className="space-y-4 mt-6">
                      <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                        <h4 className="font-medium text-sm mb-2">Getting Started</h4>
                        <p className="text-xs text-gray-600">
                          Ready to build extensions for PaveMaster? Check out our SDK and documentation to get started.
                        </p>
                      </div>
                      
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Quick Stats</Label>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div className="flex justify-between">
                            <span>Total Revenue:</span>
                            <span>$0</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Extensions:</span>
                            <span>0</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Downloads:</span>
                            <span>0</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Rating:</span>
                            <span>-</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Extension Guidelines</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="space-y-3">
                        <div className="flex items-start space-x-2">
                          <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                          <div>
                            <p className="text-sm font-medium">Quality Standards</p>
                            <p className="text-xs text-gray-600">Follow our coding standards and best practices</p>
                          </div>
                        </div>
                        
                        <div className="flex items-start space-x-2">
                          <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                          <div>
                            <p className="text-sm font-medium">Security Review</p>
                            <p className="text-xs text-gray-600">All extensions undergo security screening</p>
                          </div>
                        </div>
                        
                        <div className="flex items-start space-x-2">
                          <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                          <div>
                            <p className="text-sm font-medium">User Privacy</p>
                            <p className="text-xs text-gray-600">Respect user data and privacy requirements</p>
                          </div>
                        </div>
                        
                        <div className="flex items-start space-x-2">
                          <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                          <div>
                            <p className="text-sm font-medium">Documentation</p>
                            <p className="text-xs text-gray-600">Provide clear documentation and examples</p>
                          </div>
                        </div>
                      </div>

                      <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                        <h4 className="font-medium text-sm mb-1">Review Process</h4>
                        <p className="text-xs text-gray-600">
                          Extensions typically take 3-5 business days to review. You'll receive feedback if changes are needed.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="analytics" className="space-y-6">
              {marketplaceStats ? (
                <>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Card>
                      <CardContent className="p-4 text-center">
                        <Package className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                        <p className="text-2xl font-bold">{marketplaceStats.totalExtensions}</p>
                        <p className="text-sm text-gray-600">Total Extensions</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4 text-center">
                        <Download className="h-8 w-8 text-green-600 mx-auto mb-2" />
                        <p className="text-2xl font-bold">{marketplaceStats.totalDownloads.toLocaleString()}</p>
                        <p className="text-sm text-gray-600">Total Downloads</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4 text-center">
                        <Users className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                        <p className="text-2xl font-bold">{marketplaceStats.totalDevelopers}</p>
                        <p className="text-sm text-gray-600">Developers</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4 text-center">
                        <Star className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
                        <p className="text-2xl font-bold">{marketplaceStats.averageRating.toFixed(1)}</p>
                        <p className="text-sm text-gray-600">Avg Rating</p>
                      </CardContent>
                    </Card>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Popular Extensions</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {marketplaceStats.popularExtensions.map((extension, index) => (
                            <div key={extension.id} className="flex items-center space-x-3">
                              <div className="w-8 h-8 bg-gray-100 dark:bg-gray-800 rounded flex items-center justify-center text-sm font-medium">
                                {index + 1}
                              </div>
                              <div className="flex-1">
                                <p className="text-sm font-medium">{extension.name}</p>
                                <p className="text-xs text-gray-600">{extension.stats.downloads.toLocaleString()} downloads</p>
                              </div>
                              <div className="flex items-center space-x-1">
                                <Star className="h-3 w-3 text-yellow-500" />
                                <span className="text-xs">{extension.stats.rating}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Category Distribution</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {Object.entries(marketplaceStats.categoryCounts).map(([category, count]) => (
                            <div key={category} className="space-y-1">
                              <div className="flex justify-between text-sm">
                                <span className="capitalize">{category}</span>
                                <span>{count}</span>
                              </div>
                              <Progress 
                                value={(count / marketplaceStats.totalExtensions) * 100} 
                                className="h-2" 
                              />
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </>
              ) : (
                <Card>
                  <CardContent className="p-8 text-center">
                    <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">Loading marketplace analytics...</p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="sdk" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Available SDKs</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {engine['sdks'].map((sdk, index) => (
                        <div key={index} className="p-4 border rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-medium">{sdk.name}</h4>
                            <Badge variant="outline">v{sdk.version}</Badge>
                          </div>
                          <p className="text-sm text-gray-600 mb-3">{sdk.description}</p>
                          <div className="flex items-center space-x-2">
                            <Badge variant="secondary" className="text-xs">{sdk.language}</Badge>
                            <Button size="sm" variant="outline">
                              <Download className="h-3 w-3 mr-1" />
                              Download
                            </Button>
                            <Button size="sm" variant="outline">
                              <FileText className="h-3 w-3 mr-1" />
                              Docs
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Code Examples</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {engine['sdks'][0]?.examples.map((example) => (
                        <div key={example.id} className="border rounded-lg">
                          <div className="p-3 border-b">
                            <div className="flex items-center justify-between">
                              <h4 className="font-medium text-sm">{example.name}</h4>
                              <Badge variant="outline" className="text-xs">{example.language}</Badge>
                            </div>
                            <p className="text-xs text-gray-600 mt-1">{example.description}</p>
                          </div>
                          <div className="p-3 bg-card dark:bg-gray-800">
                            <pre className="text-xs overflow-x-auto">
                              <code>{example.code.trim()}</code>
                            </pre>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export { PlatformEcosystemEngine };
export type { Extension, MarketplaceStats, DeveloperAccount, ExtensionInstallation };