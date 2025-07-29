/**
 * Advanced Leaderboard Component
 * Multi-dimensional leaderboards with filters, real-time updates, and interactive features
 */

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { 
  Trophy, 
  Medal, 
  Award, 
  TrendingUp, 
  TrendingDown, 
  Minus,
  Users,
  Calendar,
  Filter,
  Search,
  Zap,
  Crown,
  Star
} from 'lucide-react';
import { 
  LeaderboardEntry, 
  LeaderboardFilter, 
  TimeframeType, 
  AchievementCategory,
  CompetitionType 
} from '@/types/achievements';
import { competitionEngine } from '@/lib/competitionEngine';

interface AdvancedLeaderboardProps {
  title?: string;
  competitionId?: string;
  showGlobal?: boolean;
  showTeams?: boolean;
  defaultTimeframe?: TimeframeType;
  defaultCategory?: AchievementCategory;
  maxEntries?: number;
  showFilters?: boolean;
  showSearch?: boolean;
  showStats?: boolean;
  animated?: boolean;
  className?: string;
}

interface LeaderboardUser {
  id: string;
  name: string;
  avatar: string;
  department: string;
  team?: string;
  level: number;
  streak: number;
  badges: string[];
}

// Mock user data - would come from actual user service
const mockUsers: Record<string, LeaderboardUser> = {
  'user1': { id: 'user1', name: 'Alex Johnson', avatar: '/avatars/alex.jpg', department: 'Construction', team: 'Alpha Team', level: 15, streak: 12, badges: ['safety-champion', 'task-master'] },
  'user2': { id: 'user2', name: 'Sarah Chen', avatar: '/avatars/sarah.jpg', department: 'Project Management', team: 'Beta Team', level: 18, streak: 8, badges: ['innovator', 'team-player'] },
  'user3': { id: 'user3', name: 'Mike Rodriguez', avatar: '/avatars/mike.jpg', department: 'Engineering', team: 'Alpha Team', level: 12, streak: 25, badges: ['consistent-performer'] },
  'user4': { id: 'user4', name: 'Emily Davis', avatar: '/avatars/emily.jpg', department: 'Safety', team: 'Gamma Team', level: 22, streak: 5, badges: ['safety-first', 'mentor'] },
  'user5': { id: 'user5', name: 'David Wilson', avatar: '/avatars/david.jpg', department: 'Operations', team: 'Beta Team', level: 9, streak: 3, badges: ['early-bird'] }
};

const timeframeOptions = [
  { value: TimeframeType.DAY, label: 'Today' },
  { value: TimeframeType.WEEK, label: 'This Week' },
  { value: TimeframeType.MONTH, label: 'This Month' },
  { value: TimeframeType.QUARTER, label: 'This Quarter' },
  { value: TimeframeType.YEAR, label: 'This Year' },
  { value: TimeframeType.ALL_TIME, label: 'All Time' }
];

const categoryOptions = [
  { value: 'all', label: 'All Categories' },
  { value: AchievementCategory.PRODUCTIVITY, label: 'Productivity' },
  { value: AchievementCategory.SAFETY, label: 'Safety' },
  { value: AchievementCategory.TEAMWORK, label: 'Teamwork' },
  { value: AchievementCategory.INNOVATION, label: 'Innovation' },
  { value: AchievementCategory.EFFICIENCY, label: 'Efficiency' },
  { value: AchievementCategory.QUALITY, label: 'Quality' }
];

export const AdvancedLeaderboard: React.FC<AdvancedLeaderboardProps> = ({
  title = 'Leaderboard',
  competitionId,
  showGlobal = true,
  showTeams = true,
  defaultTimeframe = TimeframeType.WEEK,
  defaultCategory,
  maxEntries = 50,
  showFilters = true,
  showSearch = true,
  showStats = true,
  animated = true,
  className
}) => {
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardEntry[]>([]);
  const [teamLeaderboard, setTeamLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTimeframe, setSelectedTimeframe] = useState<TimeframeType>(defaultTimeframe);
  const [selectedCategory, setSelectedCategory] = useState<string>(defaultCategory || 'all');
  const [selectedDepartment, setSelectedDepartment] = useState<string>('all');
  const [activeTab, setActiveTab] = useState<'individual' | 'teams'>('individual');
  const [expandedEntry, setExpandedEntry] = useState<string | null>(null);

  // Load leaderboard data
  useEffect(() => {
    loadLeaderboardData();
  }, [selectedTimeframe, selectedCategory, selectedDepartment, competitionId]);

  const loadLeaderboardData = async () => {
    setLoading(true);
    try {
      const filter: LeaderboardFilter = {
        timeframe: selectedTimeframe,
        category: selectedCategory !== 'all' ? selectedCategory as AchievementCategory : undefined,
        department: selectedDepartment !== 'all' ? selectedDepartment : undefined,
        limit: maxEntries
      };

      let data: LeaderboardEntry[];
      
      if (competitionId) {
        const competition = await competitionEngine.getCompetition(competitionId);
        data = competition?.leaderboard || [];
      } else {
        data = await competitionEngine.getGlobalLeaderboard(filter);
      }

      setLeaderboardData(data);

      // Generate team leaderboard
      if (showTeams) {
        const teamScores = new Map<string, { score: number; members: number }>();
        data.forEach(entry => {
          if (entry.teamId) {
            const current = teamScores.get(entry.teamId) || { score: 0, members: 0 };
            teamScores.set(entry.teamId, {
              score: current.score + entry.score,
              members: current.members + 1
            });
          }
        });

        const teamData = Array.from(teamScores.entries()).map(([teamId, stats], index) => ({
          userId: teamId,
          teamId,
          score: stats.score,
          rank: index + 1,
          change: 0,
          achievements: [],
          lastUpdated: new Date()
        }));

        setTeamLeaderboard(teamData.sort((a, b) => b.score - a.score));
      }
    } catch (error) {
      console.error('Error loading leaderboard:', error);
    } finally {
      setLoading(false);
    }
  };

  // Filter and search logic
  const filteredData = useMemo(() => {
    let filtered = leaderboardData;

    if (searchTerm) {
      filtered = filtered.filter(entry => {
        const user = mockUsers[entry.userId];
        return user?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
               user?.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
               user?.team?.toLowerCase().includes(searchTerm.toLowerCase());
      });
    }

    return filtered;
  }, [leaderboardData, searchTerm]);

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="w-6 h-6 text-yellow-500" />;
      case 2:
        return <Medal className="w-6 h-6 text-gray-400" />;
      case 3:
        return <Award className="w-6 h-6 text-amber-600" />;
      default:
        return <span className="w-6 h-6 flex items-center justify-center text-sm font-bold text-muted-foreground">#{rank}</span>;
    }
  };

  const getChangeIcon = (change: number) => {
    if (change > 0) return <TrendingUp className="w-4 h-4 text-green-500" />;
    if (change < 0) return <TrendingDown className="w-4 h-4 text-red-500" />;
    return <Minus className="w-4 h-4 text-gray-400" />;
  };

  const getRankStyle = (rank: number) => {
    switch (rank) {
      case 1:
        return 'bg-gradient-to-r from-yellow-50 to-yellow-100 border-yellow-200';
      case 2:
        return 'bg-gradient-to-r from-gray-50 to-gray-100 border-gray-200';
      case 3:
        return 'bg-gradient-to-r from-amber-50 to-amber-100 border-amber-200';
      default:
        return 'bg-white border-gray-100';
    }
  };

  const LeaderboardEntry: React.FC<{ entry: LeaderboardEntry; index: number }> = ({ entry, index }) => {
    const user = mockUsers[entry.userId];
    const isExpanded = expandedEntry === entry.userId;
    
    if (!user) return null;

    return (
      <motion.div
        layout
        initial={animated ? { opacity: 0, y: 20 } : false}
        animate={{ opacity: 1, y: 0 }}
        exit={animated ? { opacity: 0, y: -20 } : false}
        transition={{ delay: index * 0.05, duration: 0.3 }}
        className={cn(
          'border rounded-lg p-4 transition-all duration-200 hover:shadow-md cursor-pointer',
          getRankStyle(entry.rank)
        )}
        onClick={() => setExpandedEntry(isExpanded ? null : entry.userId)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {/* Rank */}
            <div className="flex-shrink-0">
              {getRankIcon(entry.rank)}
            </div>

            {/* User Info */}
            <div className="flex items-center space-x-3">
              <Avatar className="w-10 h-10">
                <AvatarImage src={user.avatar} alt={user.name} />
                <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
              </Avatar>
              
              <div>
                <div className="flex items-center space-x-2">
                  <h3 className="font-semibold">{user.name}</h3>
                  <Badge variant="secondary" className="text-xs">
                    Lv. {user.level}
                  </Badge>
                  {user.streak > 7 && (
                    <Badge variant="outline" className="text-xs">
                      <Zap className="w-3 h-3 mr-1" />
                      {user.streak}
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">
                  {user.department} {user.team && `• ${user.team}`}
                </p>
              </div>
            </div>
          </div>

          {/* Score and Change */}
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <div className="font-bold text-lg">{entry.score.toLocaleString()}</div>
              <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                {getChangeIcon(entry.change)}
                <span>{Math.abs(entry.change)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Expanded Details */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="mt-4 pt-4 border-t space-y-3"
            >
              {/* Badges */}
              <div>
                <h4 className="text-sm font-medium mb-2">Recent Badges</h4>
                <div className="flex flex-wrap gap-2">
                  {user.badges.map(badge => (
                    <Badge key={badge} variant="outline" className="text-xs">
                      <Star className="w-3 h-3 mr-1" />
                      {badge.replace('-', ' ')}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Progress */}
              <div>
                <h4 className="text-sm font-medium mb-2">Level Progress</h4>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Level {user.level}</span>
                    <span>Level {user.level + 1}</span>
                  </div>
                  <Progress value={75} className="h-2" />
                  <p className="text-xs text-muted-foreground">
                    1,250 / 1,500 XP to next level
                  </p>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="flex space-x-2">
                <Button size="sm" variant="outline">
                  View Profile
                </Button>
                <Button size="sm" variant="outline">
                  Send Message
                </Button>
                <Button size="sm" variant="outline">
                  Team Up
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    );
  };

  return (
    <Card className={cn('w-full', className)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <Trophy className="w-5 h-5" />
            <span>{title}</span>
          </CardTitle>
          
          {showStats && (
            <div className="flex items-center space-x-4 text-sm text-muted-foreground">
              <span className="flex items-center space-x-1">
                <Users className="w-4 h-4" />
                <span>{filteredData.length} participants</span>
              </span>
              <span className="flex items-center space-x-1">
                <Calendar className="w-4 h-4" />
                <span>{timeframeOptions.find(t => t.value === selectedTimeframe)?.label}</span>
              </span>
            </div>
          )}
        </div>

        {/* Filters */}
        {showFilters && (
          <div className="flex flex-wrap gap-4 mt-4">
            <Select value={selectedTimeframe} onValueChange={(value) => setSelectedTimeframe(value as TimeframeType)}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {timeframeOptions.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {categoryOptions.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Department" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Departments</SelectItem>
                <SelectItem value="construction">Construction</SelectItem>
                <SelectItem value="engineering">Engineering</SelectItem>
                <SelectItem value="safety">Safety</SelectItem>
                <SelectItem value="operations">Operations</SelectItem>
                <SelectItem value="management">Management</SelectItem>
              </SelectContent>
            </Select>

            {showSearch && (
              <div className="relative flex-1 min-w-64">
                <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            )}
          </div>
        )}
      </CardHeader>

      <CardContent>
        {showTeams && showGlobal ? (
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'individual' | 'teams')}>
            <TabsList className="mb-6">
              <TabsTrigger value="individual">Individual</TabsTrigger>
              <TabsTrigger value="teams">Teams</TabsTrigger>
            </TabsList>

            <TabsContent value="individual">
              <div className="space-y-3">
                <AnimatePresence mode="popLayout">
                  {loading ? (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                      <p className="text-muted-foreground mt-2">Loading leaderboard...</p>
                    </div>
                  ) : filteredData.length === 0 ? (
                    <div className="text-center py-8">
                      <Trophy className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
                      <p className="text-muted-foreground">No participants found</p>
                    </div>
                  ) : (
                    filteredData.map((entry, index) => (
                      <LeaderboardEntry key={entry.userId} entry={entry} index={index} />
                    ))
                  )}
                </AnimatePresence>
              </div>
            </TabsContent>

            <TabsContent value="teams">
              <div className="space-y-3">
                <AnimatePresence mode="popLayout">
                  {teamLeaderboard.map((entry, index) => (
                    <motion.div
                      key={entry.teamId}
                      layout
                      initial={animated ? { opacity: 0, y: 20 } : false}
                      animate={{ opacity: 1, y: 0 }}
                      exit={animated ? { opacity: 0, y: -20 } : false}
                      transition={{ delay: index * 0.05, duration: 0.3 }}
                      className={cn(
                        'border rounded-lg p-4 transition-all duration-200 hover:shadow-md',
                        getRankStyle(entry.rank)
                      )}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="flex-shrink-0">
                            {getRankIcon(entry.rank)}
                          </div>
                          <div>
                            <h3 className="font-semibold">{entry.teamId}</h3>
                            <p className="text-sm text-muted-foreground">
                              Team Score
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-lg">{entry.score.toLocaleString()}</div>
                          <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                            {getChangeIcon(entry.change)}
                            <span>{Math.abs(entry.change)}</span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </TabsContent>
          </Tabs>
        ) : (
          <div className="space-y-3">
            <AnimatePresence mode="popLayout">
              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                  <p className="text-muted-foreground mt-2">Loading leaderboard...</p>
                </div>
              ) : filteredData.length === 0 ? (
                <div className="text-center py-8">
                  <Trophy className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
                  <p className="text-muted-foreground">No participants found</p>
                </div>
              ) : (
                filteredData.map((entry, index) => (
                  <LeaderboardEntry key={entry.userId} entry={entry} index={index} />
                ))
              )}
            </AnimatePresence>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AdvancedLeaderboard;