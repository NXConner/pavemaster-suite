import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { ScrollArea } from '../ui/scroll-area';
import {
  Brain,
  Database,
  History,
  User,
  MessageSquare,
  TrendingUp,
  Clock,
  Target,
  Lightbulb,
  BookOpen,
  Trash2,
  Download,
  Upload,
  Search,
} from 'lucide-react';

// Memory Interfaces
interface ConversationMemory {
  id: string;
  userId: string;
  sessionId: string;
  timestamp: Date;
  topic: string;
  context: Record<string, any>;
  entities: EntityMemory[];
  preferences: UserPreferences;
  insights: ConversationInsight[];
}

interface EntityMemory {
  type: string;
  value: string;
  frequency: number;
  lastMentioned: Date;
  context: string[];
  importance: number;
}

interface UserPreferences {
  preferredResponseStyle: 'concise' | 'detailed' | 'technical';
  commonTopics: string[];
  workingHours: {
    start: string;
    end: string;
    timezone: string;
  };
  projectTypes: string[];
  communicationStyle: 'formal' | 'casual' | 'professional';
}

interface ConversationInsight {
  id: string;
  type: 'pattern' | 'preference' | 'need' | 'goal';
  description: string;
  confidence: number;
  evidence: string[];
  timestamp: Date;
}

interface LearningPattern {
  pattern: string;
  frequency: number;
  context: string[];
  predictiveValue: number;
  lastSeen: Date;
}

interface MemoryIndex {
  entities: Map<string, EntityMemory>;
  topics: Map<string, number>;
  patterns: Map<string, LearningPattern>;
  sessionHistory: ConversationMemory[];
}

// Memory Engine
class ConversationMemoryEngine {
  private memories: Map<string, ConversationMemory> = new Map();
  private index: MemoryIndex = {
    entities: new Map(),
    topics: new Map(),
    patterns: new Map(),
    sessionHistory: [],
  };
  private maxMemories: number = 1000;
  private retentionDays: number = 90;

  constructor() {
    this.loadFromStorage();
  }

  // Core Memory Operations
  addMemory(memory: ConversationMemory): void {
    this.memories.set(memory.id, memory);
    this.updateIndex(memory);
    this.cleanupOldMemories();
    this.saveToStorage();
  }

  getMemory(id: string): ConversationMemory | undefined {
    return this.memories.get(id);
  }

  getMemoriesByUser(userId: string): ConversationMemory[] {
    return Array.from(this.memories.values()).filter(m => m.userId === userId);
  }

  getMemoriesByTopic(topic: string): ConversationMemory[] {
    return Array.from(this.memories.values()).filter(m => 
      m.topic.toLowerCase().includes(topic.toLowerCase())
    );
  }

  // Entity Management
  updateEntity(entity: EntityMemory): void {
    const key = `${entity.type}:${entity.value}`;
    const existing = this.index.entities.get(key);
    
    if (existing) {
      existing.frequency += 1;
      existing.lastMentioned = new Date();
      existing.context = [...new Set([...existing.context, ...entity.context])];
      existing.importance = this.calculateImportance(existing);
    } else {
      this.index.entities.set(key, {
        ...entity,
        frequency: 1,
        importance: this.calculateImportance(entity),
      });
    }
  }

  getEntitiesByType(type: string): EntityMemory[] {
    return Array.from(this.index.entities.values()).filter(e => e.type === type);
  }

  getFrequentEntities(limit: number = 10): EntityMemory[] {
    return Array.from(this.index.entities.values())
      .sort((a, b) => b.frequency - a.frequency)
      .slice(0, limit);
  }

  // Pattern Recognition
  detectPatterns(newMemory: ConversationMemory): LearningPattern[] {
    const patterns: LearningPattern[] = [];
    const timePatterns = this.detectTimePatterns(newMemory);
    const topicPatterns = this.detectTopicPatterns(newMemory);
    const entityPatterns = this.detectEntityPatterns(newMemory);

    return [...timePatterns, ...topicPatterns, ...entityPatterns];
  }

  private detectTimePatterns(memory: ConversationMemory): LearningPattern[] {
    const hour = memory.timestamp.getHours();
    const dayOfWeek = memory.timestamp.getDay();
    const timeContext = `${dayOfWeek}-${hour}`;
    
    const existingPattern = this.index.patterns.get(`time:${timeContext}`);
    if (existingPattern) {
      existingPattern.frequency += 1;
      existingPattern.lastSeen = new Date();
      return [existingPattern];
    } else {
      const newPattern: LearningPattern = {
        pattern: `time:${timeContext}`,
        frequency: 1,
        context: [memory.topic],
        predictiveValue: 0.1,
        lastSeen: new Date(),
      };
      this.index.patterns.set(newPattern.pattern, newPattern);
      return [newPattern];
    }
  }

  private detectTopicPatterns(memory: ConversationMemory): LearningPattern[] {
    const patterns: LearningPattern[] = [];
    const words = memory.topic.toLowerCase().split(' ');
    
    for (let i = 0; i < words.length - 1; i++) {
      const sequence = `${words[i]} ${words[i + 1]}`;
      const patternKey = `topic:${sequence}`;
      
      const existingPattern = this.index.patterns.get(patternKey);
      if (existingPattern) {
        existingPattern.frequency += 1;
        existingPattern.lastSeen = new Date();
        patterns.push(existingPattern);
      } else {
        const newPattern: LearningPattern = {
          pattern: patternKey,
          frequency: 1,
          context: [memory.topic],
          predictiveValue: 0.2,
          lastSeen: new Date(),
        };
        this.index.patterns.set(patternKey, newPattern);
        patterns.push(newPattern);
      }
    }
    
    return patterns;
  }

  private detectEntityPatterns(memory: ConversationMemory): LearningPattern[] {
    const patterns: LearningPattern[] = [];
    
    for (const entity of memory.entities) {
      const patternKey = `entity:${entity.type}:${entity.value}`;
      const existingPattern = this.index.patterns.get(patternKey);
      
      if (existingPattern) {
        existingPattern.frequency += 1;
        existingPattern.lastSeen = new Date();
        patterns.push(existingPattern);
      } else {
        const newPattern: LearningPattern = {
          pattern: patternKey,
          frequency: 1,
          context: entity.context,
          predictiveValue: 0.3,
          lastSeen: new Date(),
        };
        this.index.patterns.set(patternKey, newPattern);
        patterns.push(newPattern);
      }
    }
    
    return patterns;
  }

  // Context Retrieval
  getRelevantContext(query: string, limit: number = 5): ConversationMemory[] {
    const queryTerms = query.toLowerCase().split(' ');
    const scoredMemories = Array.from(this.memories.values()).map(memory => ({
      memory,
      score: this.calculateRelevanceScore(memory, queryTerms),
    }));

    return scoredMemories
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map(sm => sm.memory);
  }

  private calculateRelevanceScore(memory: ConversationMemory, queryTerms: string[]): number {
    let score = 0;
    
    // Topic relevance
    const topicLower = memory.topic.toLowerCase();
    queryTerms.forEach(term => {
      if (topicLower.includes(term)) score += 2;
    });
    
    // Entity relevance
    memory.entities.forEach(entity => {
      queryTerms.forEach(term => {
        if (entity.value.toLowerCase().includes(term)) score += entity.importance;
      });
    });
    
    // Recency bonus
    const daysSince = (Date.now() - memory.timestamp.getTime()) / (1000 * 60 * 60 * 24);
    score += Math.max(0, 1 - daysSince / 30);
    
    return score;
  }

  // Learning and Insights
  generateInsights(userId: string): ConversationInsight[] {
    const userMemories = this.getMemoriesByUser(userId);
    const insights: ConversationInsight[] = [];
    
    // Analyze user preferences
    const preferenceInsights = this.analyzePreferences(userMemories);
    insights.push(...preferenceInsights);
    
    // Analyze conversation patterns
    const patternInsights = this.analyzeConversationPatterns(userMemories);
    insights.push(...patternInsights);
    
    // Analyze topic trends
    const topicInsights = this.analyzeTopicTrends(userMemories);
    insights.push(...topicInsights);
    
    return insights;
  }

  private analyzePreferences(memories: ConversationMemory[]): ConversationInsight[] {
    const insights: ConversationInsight[] = [];
    
    if (memories.length === 0) return insights;
    
    // Response style preference
    const styles = memories.map(m => m.preferences.preferredResponseStyle);
    const mostCommonStyle = this.getMostCommon(styles);
    
    if (mostCommonStyle) {
      insights.push({
        id: `pref_style_${Date.now()}`,
        type: 'preference',
        description: `User prefers ${mostCommonStyle} responses`,
        confidence: 0.8,
        evidence: [`Mentioned in ${styles.filter(s => s === mostCommonStyle).length} conversations`],
        timestamp: new Date(),
      });
    }
    
    // Common topics
    const topics = memories.map(m => m.topic);
    const commonTopics = this.getTopItems(topics, 3);
    
    if (commonTopics.length > 0) {
      insights.push({
        id: `pref_topics_${Date.now()}`,
        type: 'preference',
        description: `Frequently discusses: ${commonTopics.join(', ')}`,
        confidence: 0.7,
        evidence: commonTopics.map(topic => `Discussed ${topics.filter(t => t === topic).length} times`),
        timestamp: new Date(),
      });
    }
    
    return insights;
  }

  private analyzeConversationPatterns(memories: ConversationMemory[]): ConversationInsight[] {
    const insights: ConversationInsight[] = [];
    
    // Time patterns
    const hours = memories.map(m => m.timestamp.getHours());
    const commonHour = this.getMostCommon(hours);
    
    if (commonHour !== null && hours.filter(h => h === commonHour).length > 2) {
      insights.push({
        id: `pattern_time_${Date.now()}`,
        type: 'pattern',
        description: `Most active around ${commonHour}:00`,
        confidence: 0.6,
        evidence: [`${hours.filter(h => h === commonHour).length} conversations at this time`],
        timestamp: new Date(),
      });
    }
    
    // Session length patterns
    const avgEntities = memories.reduce((sum, m) => sum + m.entities.length, 0) / memories.length;
    if (avgEntities > 5) {
      insights.push({
        id: `pattern_detail_${Date.now()}`,
        type: 'pattern',
        description: 'Tends to provide detailed information in conversations',
        confidence: 0.7,
        evidence: [`Average ${avgEntities.toFixed(1)} entities per conversation`],
        timestamp: new Date(),
      });
    }
    
    return insights;
  }

  private analyzeTopicTrends(memories: ConversationMemory[]): ConversationInsight[] {
    const insights: ConversationInsight[] = [];
    
    // Recent vs older topics
    const recentMemories = memories.filter(m => 
      (Date.now() - m.timestamp.getTime()) < (7 * 24 * 60 * 60 * 1000)
    );
    
    if (recentMemories.length > 0) {
      const recentTopics = recentMemories.map(m => m.topic);
      const trendingTopic = this.getMostCommon(recentTopics);
      
      if (trendingTopic) {
        insights.push({
          id: `trend_topic_${Date.now()}`,
          type: 'need',
          description: `Currently focused on: ${trendingTopic}`,
          confidence: 0.8,
          evidence: [`${recentTopics.filter(t => t === trendingTopic).length} recent mentions`],
          timestamp: new Date(),
        });
      }
    }
    
    return insights;
  }

  // Utility functions
  private calculateImportance(entity: EntityMemory): number {
    let importance = entity.frequency * 0.3;
    importance += entity.context.length * 0.2;
    
    // Recency bonus
    const daysSince = (Date.now() - entity.lastMentioned.getTime()) / (1000 * 60 * 60 * 24);
    importance += Math.max(0, 1 - daysSince / 30) * 0.5;
    
    return Math.min(importance, 1.0);
  }

  private getMostCommon<T>(items: T[]): T | null {
    if (items.length === 0) return null;
    
    const counts = items.reduce((acc, item) => {
      acc.set(item, (acc.get(item) || 0) + 1);
      return acc;
    }, new Map<T, number>());
    
    let maxCount = 0;
    let mostCommon: T | null = null;
    
    counts.forEach((count, item) => {
      if (count > maxCount) {
        maxCount = count;
        mostCommon = item;
      }
    });
    
    return mostCommon;
  }

  private getTopItems<T>(items: T[], limit: number): T[] {
    const counts = items.reduce((acc, item) => {
      acc.set(item, (acc.get(item) || 0) + 1);
      return acc;
    }, new Map<T, number>());
    
    return Array.from(counts.entries())
      .sort(([, a], [, b]) => b - a)
      .slice(0, limit)
      .map(([item]) => item);
  }

  private updateIndex(memory: ConversationMemory): void {
    // Update entities
    memory.entities.forEach(entity => this.updateEntity(entity));
    
    // Update topics
    const topicCount = this.index.topics.get(memory.topic) || 0;
    this.index.topics.set(memory.topic, topicCount + 1);
    
    // Update session history
    this.index.sessionHistory.push(memory);
    if (this.index.sessionHistory.length > 100) {
      this.index.sessionHistory.shift();
    }
    
    // Detect and update patterns
    const patterns = this.detectPatterns(memory);
    patterns.forEach(pattern => {
      this.index.patterns.set(pattern.pattern, pattern);
    });
  }

  private cleanupOldMemories(): void {
    const cutoffDate = new Date(Date.now() - this.retentionDays * 24 * 60 * 60 * 1000);
    
    // Remove old memories
    for (const [id, memory] of this.memories) {
      if (memory.timestamp < cutoffDate) {
        this.memories.delete(id);
      }
    }
    
    // Limit total memories
    if (this.memories.size > this.maxMemories) {
      const sorted = Array.from(this.memories.entries())
        .sort(([, a], [, b]) => b.timestamp.getTime() - a.timestamp.getTime());
      
      const toKeep = sorted.slice(0, this.maxMemories);
      this.memories.clear();
      toKeep.forEach(([id, memory]) => this.memories.set(id, memory));
    }
  }

  private saveToStorage(): void {
    try {
      const data = {
        memories: Array.from(this.memories.entries()),
        index: {
          entities: Array.from(this.index.entities.entries()),
          topics: Array.from(this.index.topics.entries()),
          patterns: Array.from(this.index.patterns.entries()),
          sessionHistory: this.index.sessionHistory,
        },
      };
      localStorage.setItem('conversationMemory', JSON.stringify(data));
    } catch (error) {
      console.error('Failed to save memory to storage:', error);
    }
  }

  private loadFromStorage(): void {
    try {
      const saved = localStorage.getItem('conversationMemory');
      if (saved) {
        const data = JSON.parse(saved);
        
        // Restore memories
        this.memories = new Map(data.memories.map(([id, memory]: [string, any]) => [
          id,
          {
            ...memory,
            timestamp: new Date(memory.timestamp),
            entities: memory.entities.map((e: any) => ({
              ...e,
              lastMentioned: new Date(e.lastMentioned),
            })),
          },
        ]));
        
        // Restore index
        this.index = {
          entities: new Map(data.index.entities.map(([key, entity]: [string, any]) => [
            key,
            {
              ...entity,
              lastMentioned: new Date(entity.lastMentioned),
            },
          ])),
          topics: new Map(data.index.topics),
          patterns: new Map(data.index.patterns.map(([key, pattern]: [string, any]) => [
            key,
            {
              ...pattern,
              lastSeen: new Date(pattern.lastSeen),
            },
          ])),
          sessionHistory: data.index.sessionHistory.map((memory: any) => ({
            ...memory,
            timestamp: new Date(memory.timestamp),
            entities: memory.entities.map((e: any) => ({
              ...e,
              lastMentioned: new Date(e.lastMentioned),
            })),
          })),
        };
      }
    } catch (error) {
      console.error('Failed to load memory from storage:', error);
    }
  }

  // Export/Import
  exportMemories(): string {
    const data = {
      memories: Array.from(this.memories.entries()),
      index: {
        entities: Array.from(this.index.entities.entries()),
        topics: Array.from(this.index.topics.entries()),
        patterns: Array.from(this.index.patterns.entries()),
        sessionHistory: this.index.sessionHistory,
      },
      exportDate: new Date().toISOString(),
    };
    return JSON.stringify(data, null, 2);
  }

  importMemories(data: string): void {
    try {
      const parsed = JSON.parse(data);
      this.memories.clear();
      this.index = {
        entities: new Map(),
        topics: new Map(),
        patterns: new Map(),
        sessionHistory: [],
      };
      
      // Restore data
      parsed.memories.forEach(([id, memory]: [string, any]) => {
        this.memories.set(id, {
          ...memory,
          timestamp: new Date(memory.timestamp),
          entities: memory.entities.map((e: any) => ({
            ...e,
            lastMentioned: new Date(e.lastMentioned),
          })),
        });
      });
      
      // Rebuild index
      this.memories.forEach(memory => this.updateIndex(memory));
      this.saveToStorage();
    } catch (error) {
      console.error('Failed to import memories:', error);
      throw new Error('Invalid memory data format');
    }
  }

  clearMemories(userId?: string): void {
    if (userId) {
      // Clear memories for specific user
      for (const [id, memory] of this.memories) {
        if (memory.userId === userId) {
          this.memories.delete(id);
        }
      }
    } else {
      // Clear all memories
      this.memories.clear();
      this.index = {
        entities: new Map(),
        topics: new Map(),
        patterns: new Map(),
        sessionHistory: [],
      };
    }
    this.saveToStorage();
  }

  getStats(): {
    totalMemories: number;
    totalEntities: number;
    totalTopics: number;
    totalPatterns: number;
    oldestMemory?: Date;
    newestMemory?: Date;
  } {
    const memories = Array.from(this.memories.values());
    return {
      totalMemories: memories.length,
      totalEntities: this.index.entities.size,
      totalTopics: this.index.topics.size,
      totalPatterns: this.index.patterns.size,
      oldestMemory: memories.length > 0 ? new Date(Math.min(...memories.map(m => m.timestamp.getTime()))) : undefined,
      newestMemory: memories.length > 0 ? new Date(Math.max(...memories.map(m => m.timestamp.getTime()))) : undefined,
    };
  }
}

export const ConversationMemory: React.FC<{
  memoryEngine: ConversationMemoryEngine;
  userId: string;
}> = ({ memoryEngine, userId }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMemory, setSelectedMemory] = useState<ConversationMemory | null>(null);
  const [insights, setInsights] = useState<ConversationInsight[]>([]);
  const [stats, setStats] = useState(memoryEngine.getStats());
  const [searchResults, setSearchResults] = useState<ConversationMemory[]>([]);

  useEffect(() => {
    setInsights(memoryEngine.generateInsights(userId));
    setStats(memoryEngine.getStats());
  }, [memoryEngine, userId]);

  const handleSearch = useCallback(() => {
    if (searchQuery.trim()) {
      const results = memoryEngine.getRelevantContext(searchQuery, 10);
      setSearchResults(results);
    } else {
      setSearchResults([]);
    }
  }, [searchQuery, memoryEngine]);

  const handleExport = () => {
    const data = memoryEngine.exportMemories();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `conversation-memory-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = e.target?.result as string;
          memoryEngine.importMemories(data);
          setStats(memoryEngine.getStats());
          setInsights(memoryEngine.generateInsights(userId));
        } catch (error) {
          alert('Failed to import memory data. Please check the file format.');
        }
      };
      reader.readAsText(file);
    }
  };

  const handleClearMemories = () => {
    if (confirm('Are you sure you want to clear all memories? This action cannot be undone.')) {
      memoryEngine.clearMemories(userId);
      setStats(memoryEngine.getStats());
      setInsights([]);
      setSearchResults([]);
      setSelectedMemory(null);
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Brain className="h-6 w-6 text-purple-600" />
              <CardTitle>Conversation Memory System</CardTitle>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant="outline">
                <Database className="h-3 w-3 mr-1" />
                {stats.totalMemories} memories
              </Badge>
              <Button variant="outline" size="sm" onClick={handleExport}>
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
              <label htmlFor="import-memory" className="cursor-pointer">
                <Button variant="outline" size="sm" asChild>
                  <span>
                    <Upload className="h-4 w-4 mr-2" />
                    Import
                  </span>
                </Button>
                <input
                  id="import-memory"
                  type="file"
                  accept=".json"
                  onChange={handleImport}
                  className="hidden"
                />
              </label>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="search" className="w-full">
            <TabsList>
              <TabsTrigger value="search">
                <Search className="h-4 w-4 mr-2" />
                Search
              </TabsTrigger>
              <TabsTrigger value="insights">
                <Lightbulb className="h-4 w-4 mr-2" />
                Insights
              </TabsTrigger>
              <TabsTrigger value="entities">
                <Target className="h-4 w-4 mr-2" />
                Entities
              </TabsTrigger>
              <TabsTrigger value="patterns">
                <TrendingUp className="h-4 w-4 mr-2" />
                Patterns
              </TabsTrigger>
              <TabsTrigger value="stats">
                <Database className="h-4 w-4 mr-2" />
                Statistics
              </TabsTrigger>
            </TabsList>

            <TabsContent value="search" className="space-y-4">
              <div className="flex space-x-2">
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search conversation memory..."
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                />
                <Button onClick={handleSearch}>
                  <Search className="h-4 w-4" />
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Search Results</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-96">
                      {searchResults.length > 0 ? (
                        searchResults.map((memory) => (
                          <div
                            key={memory.id}
                            className="p-3 border rounded-lg mb-2 cursor-pointer hover:bg-card dark:hover:bg-gray-800"
                            onClick={() => setSelectedMemory(memory)}
                          >
                            <div className="flex items-center justify-between mb-1">
                              <Badge variant="outline">{memory.topic}</Badge>
                              <span className="text-xs text-gray-500">
                                {memory.timestamp.toLocaleDateString()}
                              </span>
                            </div>
                            <p className="text-sm text-gray-600">
                              {memory.entities.length} entities • Session: {memory.sessionId.slice(-8)}
                            </p>
                          </div>
                        ))
                      ) : searchQuery ? (
                        <p className="text-gray-500 text-center py-8">No results found</p>
                      ) : (
                        <p className="text-gray-500 text-center py-8">Enter a search query</p>
                      )}
                    </ScrollArea>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Memory Details</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {selectedMemory ? (
                      <div className="space-y-4">
                        <div>
                          <Label className="text-sm font-medium">Topic</Label>
                          <p className="text-sm">{selectedMemory.topic}</p>
                        </div>
                        <div>
                          <Label className="text-sm font-medium">Session</Label>
                          <p className="text-sm">{selectedMemory.sessionId}</p>
                        </div>
                        <div>
                          <Label className="text-sm font-medium">Timestamp</Label>
                          <p className="text-sm">{selectedMemory.timestamp.toLocaleString()}</p>
                        </div>
                        <div>
                          <Label className="text-sm font-medium">Entities</Label>
                          <div className="mt-1 space-y-1">
                            {selectedMemory.entities.map((entity, index) => (
                              <Badge key={index} variant="outline" className="mr-1">
                                {entity.type}: {entity.value}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        <div>
                          <Label className="text-sm font-medium">Context</Label>
                          <div className="mt-1 p-2 bg-card dark:bg-gray-800 rounded text-xs">
                            <pre>{JSON.stringify(selectedMemory.context, null, 2)}</pre>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <p className="text-gray-500 text-center py-8">Select a memory to view details</p>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="insights" className="space-y-4">
              <div className="grid gap-4">
                {insights.map((insight) => (
                  <Card key={insight.id}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <Badge variant={
                              insight.type === 'pattern' ? 'default' :
                              insight.type === 'preference' ? 'secondary' :
                              insight.type === 'need' ? 'destructive' : 'outline'
                            }>
                              {insight.type}
                            </Badge>
                            <span className="text-sm text-gray-500">
                              {Math.round(insight.confidence * 100)}% confidence
                            </span>
                          </div>
                          <p className="text-sm font-medium">{insight.description}</p>
                          <div className="mt-2 space-y-1">
                            {insight.evidence.map((evidence, index) => (
                              <p key={index} className="text-xs text-gray-600">• {evidence}</p>
                            ))}
                          </div>
                        </div>
                        <div className="text-xs text-gray-500">
                          {insight.timestamp.toLocaleDateString()}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                {insights.length === 0 && (
                  <Card>
                    <CardContent className="p-8 text-center">
                      <Lightbulb className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500">No insights available yet. Have more conversations to generate insights!</p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </TabsContent>

            <TabsContent value="entities" className="space-y-4">
              <div className="grid gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Frequent Entities</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {memoryEngine.getFrequentEntities(10).map((entity, index) => (
                        <div key={index} className="flex items-center justify-between p-2 bg-card dark:bg-gray-800 rounded">
                          <div className="flex items-center space-x-2">
                            <Badge variant="outline">{entity.type}</Badge>
                            <span className="text-sm">{entity.value}</span>
                          </div>
                          <div className="flex items-center space-x-2 text-xs text-gray-500">
                            <span>{entity.frequency}x</span>
                            <span>•</span>
                            <span>{Math.round(entity.importance * 100)}% important</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="patterns" className="space-y-4">
              <div className="grid gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Learning Patterns</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {Array.from(memoryEngine['index'].patterns.values())
                        .sort((a, b) => b.frequency - a.frequency)
                        .slice(0, 20)
                        .map((pattern, index) => (
                          <div key={index} className="flex items-center justify-between p-2 bg-card dark:bg-gray-800 rounded">
                            <div>
                              <span className="text-sm font-medium">{pattern.pattern}</span>
                              <p className="text-xs text-gray-600">
                                Predictive value: {Math.round(pattern.predictiveValue * 100)}%
                              </p>
                            </div>
                            <div className="text-xs text-gray-500">
                              {pattern.frequency}x used
                            </div>
                          </div>
                        ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="stats" className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="p-4 text-center">
                    <MessageSquare className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                    <p className="text-2xl font-bold">{stats.totalMemories}</p>
                    <p className="text-sm text-gray-600">Total Memories</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <Target className="h-8 w-8 text-green-600 mx-auto mb-2" />
                    <p className="text-2xl font-bold">{stats.totalEntities}</p>
                    <p className="text-sm text-gray-600">Entities</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <BookOpen className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                    <p className="text-2xl font-bold">{stats.totalTopics}</p>
                    <p className="text-sm text-gray-600">Topics</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <TrendingUp className="h-8 w-8 text-orange-600 mx-auto mb-2" />
                    <p className="text-2xl font-bold">{stats.totalPatterns}</p>
                    <p className="text-sm text-gray-600">Patterns</p>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Memory Timeline</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {stats.oldestMemory && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Oldest Memory:</span>
                        <span className="text-sm text-gray-600">
                          {stats.oldestMemory.toLocaleDateString()}
                        </span>
                      </div>
                    )}
                    {stats.newestMemory && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Newest Memory:</span>
                        <span className="text-sm text-gray-600">
                          {stats.newestMemory.toLocaleDateString()}
                        </span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              <div className="flex justify-center">
                <Button variant="destructive" onClick={handleClearMemories}>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Clear All Memories
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export { ConversationMemoryEngine };
export type { ConversationMemory as ConversationMemoryType, EntityMemory, ConversationInsight };