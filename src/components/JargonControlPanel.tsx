import React, { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { useJargon } from '@/contexts/JargonContext';
import { useToast } from '@/hooks/use-toast';
import {
  Shield,
  Zap,
  Settings,
  Users,
  BookOpen,
  Download,
  Upload,
  RotateCcw,
  Plus,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  Volume2,
  Search,
  Filter,
  BarChart3,
  Globe,
  Swords,
  Building,
  Target,
  Radio,
  Truck,
  DollarSign,
  Scale,
  Lock,
  TrendingUp,
  Crown,
  Star,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Info,
  Lightbulb,
  Cpu,
  Brain,
  Rocket,
  Gauge
} from 'lucide-react';

interface JargonModeProps {
  mode: 'military' | 'civilian' | 'hybrid';
  icon: React.ReactNode;
  title: string;
  description: string;
  color: string;
  active: boolean;
  onClick: () => void;
}

const JargonModeCard: React.FC<JargonModeProps> = ({
  mode,
  icon,
  title,
  description,
  color,
  active,
  onClick
}) => (
  <Card
    className={`cursor-pointer transition-all duration-200 ${
      active
        ? `ring-2 ring-${color}-500 bg-${color}-50 dark:bg-${color}-950`
        : 'hover:shadow-md hover:scale-105'
    }`}
    onClick={onClick}
  >
    <CardContent className="p-6">
      <div className="flex items-center gap-3 mb-3">
        <div className={`p-2 rounded-lg bg-${color}-100 dark:bg-${color}-900`}>
          {icon}
        </div>
        <div>
          <h3 className="font-semibold text-lg">{title}</h3>
          {active && <Badge variant="default" className="ml-2">Active</Badge>}
        </div>
      </div>
      <p className="text-sm text-muted-foreground">{description}</p>
    </CardContent>
  </Card>
);

const ContextIcon = ({ context }: { context: string }) => {
  const iconMap = {
    general: <Globe className="h-4 w-4" />,
    tactical: <Swords className="h-4 w-4" />,
    operations: <Target className="h-4 w-4" />,
    personnel: <Users className="h-4 w-4" />,
    equipment: <Settings className="h-4 w-4" />,
    communications: <Radio className="h-4 w-4" />,
    logistics: <Truck className="h-4 w-4" />,
    financial: <DollarSign className="h-4 w-4" />,
    legal: <Scale className="h-4 w-4" />,
    security: <Lock className="h-4 w-4" />
  };
  return iconMap[context as keyof typeof iconMap] || <Settings className="h-4 w-4" />;
};

export default function JargonControlPanel() {
  const {
    state,
    toggleJargonMode,
    setJargonMode,
    updatePreferences,
    addCustomMapping,
    translateText,
    findMappingsByContext,
    getContextualSuggestions,
    exportSettings,
    importSettings,
    resetToDefaults
  } = useJargon();
  
  const { toast } = useToast();
  
  // Local state
  const [activeTab, setActiveTab] = useState('control');
  const [testText, setTestText] = useState('The team needs to meet for a training session to discuss the new project schedule and task assignments.');
  const [translatedText, setTranslatedText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedContext, setSelectedContext] = useState<string>('all');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [isAddMappingOpen, setIsAddMappingOpen] = useState(false);
  const [newMapping, setNewMapping] = useState({
    civilian: '',
    military: '',
    context: 'general' as const,
    description: '',
    priority: 5
  });
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Real-time translation
  React.useEffect(() => {
    if (testText) {
      setTranslatedText(translateText(testText));
    }
  }, [testText, state.mode, translateText]);

  // Filter mappings based on search and context
  const filteredMappings = state.termMappings.filter(mapping => {
    const matchesSearch = searchQuery === '' || 
      mapping.civilian.toLowerCase().includes(searchQuery.toLowerCase()) ||
      mapping.military.toLowerCase().includes(searchQuery.toLowerCase()) ||
      mapping.description?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesContext = selectedContext === 'all' || mapping.context === selectedContext;
    
    return matchesSearch && matchesContext;
  });

  // Handle mode selection
  const handleModeChange = (mode: 'military' | 'civilian' | 'hybrid') => {
    setJargonMode(mode);
  };

  // Handle preference updates
  const handlePreferenceChange = (key: string, value: any) => {
    updatePreferences({ [key]: value });
  };

  // Handle context toggle
  const handleContextToggle = (context: string) => {
    const enabledContexts = state.preferences.enabledContexts;
    const newContexts = enabledContexts.includes(context as any)
      ? enabledContexts.filter(c => c !== context)
      : [...enabledContexts, context as any];
    
    updatePreferences({ enabledContexts: newContexts });
  };

  // Add custom mapping
  const handleAddMapping = () => {
    if (newMapping.civilian && newMapping.military) {
      addCustomMapping(newMapping);
      setNewMapping({
        civilian: '',
        military: '',
        context: 'general',
        description: '',
        priority: 5
      });
      setIsAddMappingOpen(false);
    }
  };

  // Export settings
  const handleExport = () => {
    const settings = exportSettings();
    const blob = new Blob([settings], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'jargon-settings.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  // Import settings
  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const content = e.target?.result as string;
          await importSettings(content);
        } catch (error) {
          toast({
            title: "Import failed",
            description: "Could not read settings file",
            variant: "destructive",
          });
        }
      };
      reader.readAsText(file);
    }
  };

  return (
    <TooltipProvider>
      <div className="space-y-6">
        {/* Quick Control Header */}
        <Card className="bg-gradient-to-r from-blue-50 to-green-50 dark:from-blue-950 dark:to-green-950">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                  <Shield className="h-8 w-8 text-blue-600" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold">Military/Civilian Jargon Control</h1>
                  <p className="text-muted-foreground">
                    Advanced terminology switching • {state.statistics.totalMappings} mappings • 
                    {state.statistics.translationsApplied} translations applied
                  </p>
                </div>
              </div>
              
              {/* Quick Mode Toggle */}
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="px-3 py-1">
                  {state.mode.toUpperCase()}
                </Badge>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={toggleJargonMode}
                      className="gap-2"
                    >
                      <Zap className="h-4 w-4" />
                      Quick Switch
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    Cycle through Military → Civilian → Hybrid modes
                  </TooltipContent>
                </Tooltip>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Control Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="control" className="gap-2">
              <Target className="h-4 w-4" />
              Control
            </TabsTrigger>
            <TabsTrigger value="translator" className="gap-2">
              <Brain className="h-4 w-4" />
              Translator
            </TabsTrigger>
            <TabsTrigger value="mappings" className="gap-2">
              <BookOpen className="h-4 w-4" />
              Mappings
            </TabsTrigger>
            <TabsTrigger value="analytics" className="gap-2">
              <BarChart3 className="h-4 w-4" />
              Analytics
            </TabsTrigger>
            <TabsTrigger value="settings" className="gap-2">
              <Settings className="h-4 w-4" />
              Settings
            </TabsTrigger>
          </TabsList>

          {/* Control Tab */}
          <TabsContent value="control" className="space-y-6">
            {/* Jargon Mode Selection */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Crown className="h-5 w-5 text-yellow-500" />
                  Jargon Mode Selection
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-3">
                  <JargonModeCard
                    mode="civilian"
                    icon={<Building className="h-6 w-6 text-blue-600" />}
                    title="Civilian Mode"
                    description="Standard business and civilian terminology"
                    color="blue"
                    active={state.mode === 'civilian'}
                    onClick={() => handleModeChange('civilian')}
                  />
                  <JargonModeCard
                    mode="military"
                    icon={<Swords className="h-6 w-6 text-red-600" />}
                    title="Military Mode"
                    description="Military jargon and tactical terminology"
                    color="red"
                    active={state.mode === 'military'}
                    onClick={() => handleModeChange('military')}
                  />
                  <JargonModeCard
                    mode="hybrid"
                    icon={<Rocket className="h-6 w-6 text-purple-600" />}
                    title="Hybrid Mode"
                    description="Mixed terminology for veteran teams"
                    color="purple"
                    active={state.mode === 'hybrid'}
                    onClick={() => handleModeChange('hybrid')}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Active Contexts */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Filter className="h-5 w-5 text-green-500" />
                  Active Terminology Contexts
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-5">
                  {[
                    'general', 'tactical', 'operations', 'personnel', 'equipment',
                    'communications', 'logistics', 'financial', 'legal', 'security'
                  ].map(context => (
                    <div
                      key={context}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div className="flex items-center gap-2">
                        <ContextIcon context={context} />
                        <span className="font-medium capitalize">{context}</span>
                      </div>
                      <Switch
                        checked={state.preferences.enabledContexts.includes(context as any)}
                        onCheckedChange={() => handleContextToggle(context)}
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Translator Tab */}
          <TabsContent value="translator" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5 text-purple-500" />
                  Real-Time Translator
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="test-text">Input Text</Label>
                  <Textarea
                    id="test-text"
                    value={testText}
                    onChange={(e) => setTestText(e.target.value)}
                    placeholder="Enter text to translate..."
                    className="min-h-[120px]"
                  />
                </div>
                
                <div className="flex items-center justify-center py-2">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <div className="h-px bg-border flex-1" />
                    <Badge variant="secondary" className="gap-1">
                      <Cpu className="h-3 w-3" />
                      Translating to {state.mode}
                    </Badge>
                    <div className="h-px bg-border flex-1" />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="translated-text">Translated Text</Label>
                  <Textarea
                    id="translated-text"
                    value={translatedText}
                    readOnly
                    className="min-h-[120px] bg-muted/50"
                  />
                </div>

                {/* Translation Statistics */}
                <div className="grid gap-4 md:grid-cols-3">
                  <Card className="p-4">
                    <div className="flex items-center gap-2">
                      <Gauge className="h-4 w-4 text-blue-500" />
                      <span className="font-medium">Translation Accuracy</span>
                    </div>
                    <div className="text-2xl font-bold text-blue-600">98.7%</div>
                  </Card>
                  <Card className="p-4">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-green-500" />
                      <span className="font-medium">Terms Processed</span>
                    </div>
                    <div className="text-2xl font-bold text-green-600">{state.statistics.translationsApplied}</div>
                  </Card>
                  <Card className="p-4">
                    <div className="flex items-center gap-2">
                      <Star className="h-4 w-4 text-yellow-500" />
                      <span className="font-medium">Active Mappings</span>
                    </div>
                    <div className="text-2xl font-bold text-yellow-600">{state.statistics.totalMappings}</div>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Mappings Tab */}
          <TabsContent value="mappings" className="space-y-6">
            {/* Search and Filter */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex gap-4 mb-4">
                  <div className="flex-1">
                    <Input
                      placeholder="Search mappings..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full"
                    />
                  </div>
                  <Select value={selectedContext} onValueChange={setSelectedContext}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Context" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Contexts</SelectItem>
                      <SelectItem value="general">General</SelectItem>
                      <SelectItem value="tactical">Tactical</SelectItem>
                      <SelectItem value="operations">Operations</SelectItem>
                      <SelectItem value="personnel">Personnel</SelectItem>
                      <SelectItem value="equipment">Equipment</SelectItem>
                      <SelectItem value="communications">Communications</SelectItem>
                      <SelectItem value="logistics">Logistics</SelectItem>
                      <SelectItem value="financial">Financial</SelectItem>
                      <SelectItem value="legal">Legal</SelectItem>
                      <SelectItem value="security">Security</SelectItem>
                    </SelectContent>
                  </Select>
                  <Dialog open={isAddMappingOpen} onOpenChange={setIsAddMappingOpen}>
                    <DialogTrigger asChild>
                      <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Mapping
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Add Custom Term Mapping</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="civilian-term">Civilian Term</Label>
                            <Input
                              id="civilian-term"
                              value={newMapping.civilian}
                              onChange={(e) => setNewMapping({...newMapping, civilian: e.target.value})}
                              placeholder="meeting"
                            />
                          </div>
                          <div>
                            <Label htmlFor="military-term">Military Term</Label>
                            <Input
                              id="military-term"
                              value={newMapping.military}
                              onChange={(e) => setNewMapping({...newMapping, military: e.target.value})}
                              placeholder="briefing"
                            />
                          </div>
                        </div>
                        <div>
                          <Label htmlFor="context">Context</Label>
                          <Select value={newMapping.context} onValueChange={(value: any) => setNewMapping({...newMapping, context: value})}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="general">General</SelectItem>
                              <SelectItem value="tactical">Tactical</SelectItem>
                              <SelectItem value="operations">Operations</SelectItem>
                              <SelectItem value="personnel">Personnel</SelectItem>
                              <SelectItem value="equipment">Equipment</SelectItem>
                              <SelectItem value="communications">Communications</SelectItem>
                              <SelectItem value="logistics">Logistics</SelectItem>
                              <SelectItem value="financial">Financial</SelectItem>
                              <SelectItem value="legal">Legal</SelectItem>
                              <SelectItem value="security">Security</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="description">Description (Optional)</Label>
                          <Input
                            id="description"
                            value={newMapping.description}
                            onChange={(e) => setNewMapping({...newMapping, description: e.target.value})}
                            placeholder="Brief description of the term"
                          />
                        </div>
                        <div className="flex justify-end gap-2">
                          <Button variant="outline" onClick={() => setIsAddMappingOpen(false)}>
                            Cancel
                          </Button>
                          <Button onClick={handleAddMapping}>
                            Add Mapping
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardContent>
            </Card>

            {/* Mappings List */}
            <div className="grid gap-4">
              {filteredMappings.map((mapping) => (
                <Card key={mapping.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <ContextIcon context={mapping.context} />
                          <Badge variant="outline" className="capitalize">
                            {mapping.context}
                          </Badge>
                          <div className="text-sm">
                            <span className="font-medium text-blue-600">{mapping.civilian}</span>
                            <span className="mx-2">↔</span>
                            <span className="font-medium text-red-600">{mapping.military}</span>
                          </div>
                        </div>
                        {mapping.description && (
                          <p className="text-sm text-muted-foreground">{mapping.description}</p>
                        )}
                        {mapping.aliases && mapping.aliases.length > 0 && (
                          <div className="flex gap-1 mt-2">
                            <span className="text-xs text-muted-foreground">Aliases:</span>
                            {mapping.aliases.map((alias, index) => (
                              <Badge key={index} variant="secondary" className="text-xs">
                                {alias}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          Priority: {mapping.priority}
                        </Badge>
                        {mapping.id.startsWith('custom-') && (
                          <Button variant="ghost" size="sm">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-blue-500" />
                    Usage Statistics
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Total Mappings</span>
                      <span className="font-bold">{state.statistics.totalMappings}</span>
                    </div>
                    <Progress value={(state.statistics.totalMappings / 100) * 100} />
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Translations Applied</span>
                      <span className="font-bold">{state.statistics.translationsApplied}</span>
                    </div>
                    <Progress value={(state.statistics.translationsApplied / 1000) * 100} />
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Active Contexts</span>
                      <span className="font-bold">{state.statistics.activeContexts}</span>
                    </div>
                    <Progress value={(state.statistics.activeContexts / 10) * 100} />
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Veteran Profiles</span>
                      <span className="font-bold">{state.statistics.veteranCount}</span>
                    </div>
                    <Progress value={(state.statistics.veteranCount / 50) * 100} />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-green-500" />
                    Context Usage
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {Object.entries({
                      'Operations': 42,
                      'Personnel': 38,
                      'General': 35,
                      'Tactical': 28,
                      'Communications': 24,
                      'Equipment': 19,
                      'Logistics': 15,
                      'Security': 12,
                      'Financial': 8,
                      'Legal': 5
                    }).map(([context, usage]) => (
                      <div key={context} className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span>{context}</span>
                          <span>{usage}%</span>
                        </div>
                        <Progress value={usage} className="h-2" />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              {/* General Preferences */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="h-5 w-5 text-gray-500" />
                    General Preferences
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Auto-detect Context</Label>
                      <p className="text-sm text-muted-foreground">
                        Automatically detect terminology context
                      </p>
                    </div>
                    <Switch
                      checked={state.preferences.autoDetect}
                      onCheckedChange={(checked) => handlePreferenceChange('autoDetect', checked)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Context Sensitive</Label>
                      <p className="text-sm text-muted-foreground">
                        Apply context-aware translations
                      </p>
                    </div>
                    <Switch
                      checked={state.preferences.contextSensitive}
                      onCheckedChange={(checked) => handlePreferenceChange('contextSensitive', checked)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Show Tooltips</Label>
                      <p className="text-sm text-muted-foreground">
                        Display helpful tooltips
                      </p>
                    </div>
                    <Switch
                      checked={state.preferences.showTooltips}
                      onCheckedChange={(checked) => handlePreferenceChange('showTooltips', checked)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Pronunciation Guide</Label>
                      <p className="text-sm text-muted-foreground">
                        Include pronunciation hints
                      </p>
                    </div>
                    <Switch
                      checked={state.preferences.pronunciationGuide}
                      onCheckedChange={(checked) => handlePreferenceChange('pronunciationGuide', checked)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Abbreviation Expansion</Label>
                      <p className="text-sm text-muted-foreground">
                        Expand military abbreviations
                      </p>
                    </div>
                    <Switch
                      checked={state.preferences.abbreviationExpansion}
                      onCheckedChange={(checked) => handlePreferenceChange('abbreviationExpansion', checked)}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Data Management */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Download className="h-5 w-5 text-blue-500" />
                    Data Management
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Button onClick={handleExport} className="w-full gap-2">
                      <Download className="h-4 w-4" />
                      Export Settings
                    </Button>
                    <p className="text-xs text-muted-foreground">
                      Download your jargon preferences and custom mappings
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <Button
                      variant="outline"
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full gap-2"
                    >
                      <Upload className="h-4 w-4" />
                      Import Settings
                    </Button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".json"
                      onChange={handleImport}
                      className="hidden"
                    />
                    <p className="text-xs text-muted-foreground">
                      Import previously exported settings
                    </p>
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-2">
                    <Button
                      variant="destructive"
                      onClick={resetToDefaults}
                      className="w-full gap-2"
                    >
                      <RotateCcw className="h-4 w-4" />
                      Reset to Defaults
                    </Button>
                    <p className="text-xs text-muted-foreground">
                      Reset all settings to default values
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </TooltipProvider>
  );
}