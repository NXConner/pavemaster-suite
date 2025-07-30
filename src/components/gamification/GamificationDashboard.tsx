/**
 * Comprehensive Gamification Dashboard
 * Integrates all gamification elements with notifications, analytics, and global features
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Trophy,
  Star,
  Target,
  Users,
  TrendingUp,
  Bell,
  Globe,
  Zap,
  Award,
  Crown,
  Shield,
  Rocket,
  Brain,
  Heart,
  Calendar,
  BarChart3,
  Settings,
  ChevronRight,
  Plus,
  Medal,
  Flame,
  Clock
} from 'lucide-react';

import AchievementBadge from './AchievementBadge';
import AdvancedLeaderboard from './AdvancedLeaderboard';
import TeamChallengeHub from './TeamChallengeHub';
import { achievementsEngine } from '@/lib/achievementsEngine';
import { competitionEngine } from '@/lib/competitionEngine';
import {
  Achievement,
  UserStats,
  AchievementProgress,
  LeaderboardEntry,
  TimeframeType,
  AchievementCategory,
  NotificationType
} from '@/types/achievements';

interface GamificationDashboardProps {
  userId: string;
  teamId?: string;
  isManager?: boolean;
  className?: string;
}

interface NotificationItem {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  icon: string;
  timestamp: Date;
  isRead: boolean;
  data?: Record<string, any>;
}

interface GlobalStats {
  totalUsers: number;
  totalTeams: number;
  activeCompetitions: number;
  globalAchievements: number;
  topCountries: { name: string; users: number; score: number }[];
  regionalLeaderboard: LeaderboardEntry[];
}

// Mock data - would come from actual services
const mockUserStats: UserStats = {
  userId: 'user1',
  totalPoints: 8450,
  level: 15,
  experiencePoints: 1250,
  nextLevelXP: 1500,
  achievementsUnlocked: 24,
  competitionsWon: 3,
  competitionsParticipated: 8,
  currentStreak: 12,
  longestStreak: 25,
  rank: 3,
  badges: ['safety-champion', 'task-master', 'innovator'],
  weeklyPoints: 850,
  monthlyPoints: 3200
};

const mockNotifications: NotificationItem[] = [
  {
    id: '1',
    type: NotificationType.ACHIEVEMENT_UNLOCKED,
    title: 'Achievement Unlocked!',
    message: 'You earned "Safety Champion" badge!',
    icon: '🏆',
    timestamp: new Date(Date.now() - 30 * 60 * 1000),
    isRead: false
  },
  {
    id: '2',
    type: NotificationType.LEVEL_UP,
    title: 'Level Up!',
    message: 'Congratulations! You reached Level 15!',
    icon: '🎉',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
    isRead: false
  },
  {
    id: '3',
    type: NotificationType.COMPETITION_STARTED,
    title: 'Competition Started',
    message: 'Safety Excellence Week has begun!',
    icon: '🚀',
    timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
    isRead: true
  }
];

const mockGlobalStats: GlobalStats = {
  totalUsers: 125000,
  totalTeams: 8500,
  activeCompetitions: 42,
  globalAchievements: 2850000,
  topCountries: [
    { name: 'United States', users: 45000, score: 12500000 },
    { name: 'Canada', users: 28000, score: 8200000 },
    { name: 'United Kingdom', users: 22000, score: 6800000 },
    { name: 'Australia', users: 18000, score: 5900000 },
    { name: 'Germany', users: 12000, score: 4200000 }
  ],
  regionalLeaderboard: [
    { userId: 'global1', score: 125000, rank: 1, change: 0, achievements: [], lastUpdated: new Date() },
    { userId: 'global2', score: 118000, rank: 2, change: 1, achievements: [], lastUpdated: new Date() },
    { userId: 'global3', score: 112000, rank: 3, change: -1, achievements: [], lastUpdated: new Date() }
  ]
};

export const GamificationDashboard: React.FC<GamificationDashboardProps> = ({
  userId,
  teamId,
  isManager = false,
  className
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'achievements' | 'competitions' | 'teams' | 'global'>('overview');
  const [userStats, setUserStats] = useState<UserStats>(mockUserStats);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [achievementProgress, setAchievementProgress] = useState<AchievementProgress[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>(mockNotifications);
  const [globalStats, setGlobalStats] = useState<GlobalStats>(mockGlobalStats);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUserData();
  }, [userId]);

  const loadUserData = async () => {
    setLoading(true);
    try {
      // Load user stats
      const stats = await achievementsEngine.getUserStats(userId);
      setUserStats(stats);

      // Load achievements
      const allAchievements = achievementsEngine.getAllAchievements();
      setAchievements(allAchievements);

      // Load progress
      const progress = await achievementsEngine.getAchievementProgress(userId);
      setAchievementProgress(progress);

    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const unreadNotifications = notifications.filter(n => !n.isRead).length;
  const levelProgress = (userStats.experiencePoints / userStats.nextLevelXP) * 100;

  const StatCard: React.FC<{
    title: string;
    value: string | number;
    subtitle?: string;
    icon: React.ElementType;
    color: string;
    trend?: number;
  }> = ({ title, value, subtitle, icon: Icon, color, trend }) => (
    <Card className="relative overflow-hidden">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <div className="flex items-center space-x-2">
              <h3 className="text-2xl font-bold">{value}</h3>
              {trend !== undefined && (
                <Badge
                  variant={trend > 0 ? 'default' : trend < 0 ? 'destructive' : 'secondary'}
                  className="text-xs"
                >
                  {trend > 0 ? '+' : ''}{trend}%
                </Badge>
              )}
            </div>
            {subtitle && (
              <p className="text-xs text-muted-foreground">{subtitle}</p>
            )}
          </div>
          <div className={cn('p-3 rounded-full', color)}>
            <Icon className="w-6 h-6 text-white" />
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const NotificationPanel = () => (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-lg">Recent Activity</CardTitle>
        <Badge variant="secondary">{unreadNotifications} new</Badge>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-80">
          <div className="space-y-4">
            {notifications.map((notification) => (
              <motion.div
                key={notification.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className={cn(
                  'flex items-start space-x-3 p-3 rounded-lg border transition-colors',
                  notification.isRead ? 'bg-gray-50' : 'bg-blue-50 border-blue-200'
                )}
              >
                <div className="text-lg">{notification.icon}</div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">{notification.title}</p>
                  <p className="text-xs text-muted-foreground">{notification.message}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {notification.timestamp.toLocaleTimeString()}
                  </p>
                </div>
                {!notification.isRead && (
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                )}
              </motion.div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );

  const RecentAchievements = () => {
    const recentAchievements = achievements
      .filter(a => achievementProgress.find(p => p.achievementId === a.id)?.isCompleted)
      .slice(0, 6);

    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Trophy className="w-5 h-5" />
            <span>Recent Achievements</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
            {recentAchievements.map((achievement) => (
              <AchievementBadge
                key={achievement.id}
                achievement={achievement}
                isUnlocked={true}
                size="md"
                animated={true}
              />
            ))}
          </div>
          {recentAchievements.length === 0 && (
            <div className="text-center py-8">
              <Award className="w-12 h-12 mx-auto mb-2 text-muted-foreground" />
              <p className="text-muted-foreground">No achievements yet</p>
              <p className="text-sm text-muted-foreground">Complete tasks to earn your first badge!</p>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  const GlobalInsights = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Globe className="w-5 h-5" />
          <span>Global Insights</span>
          <Badge variant="outline" className="text-xs">Phase 5</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{globalStats.totalUsers.toLocaleString()}</div>
            <div className="text-xs text-muted-foreground">Global Users</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{globalStats.totalTeams.toLocaleString()}</div>
            <div className="text-xs text-muted-foreground">Active Teams</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">{globalStats.activeCompetitions}</div>
            <div className="text-xs text-muted-foreground">Competitions</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-600">{globalStats.globalAchievements.toLocaleString()}</div>
            <div className="text-xs text-muted-foreground">Achievements</div>
          </div>
        </div>

        <div>
          <h4 className="font-medium mb-3">Top Performing Regions</h4>
          <div className="space-y-2">
            {globalStats.topCountries.map((country, index) => (
              <div key={country.name} className="flex items-center justify-between p-2 rounded border">
                <div className="flex items-center space-x-3">
                  <div className="w-6 h-6 flex items-center justify-center">
                    {index === 0 && <Crown className="w-4 h-4 text-yellow-500" />}
                    {index === 1 && <Medal className="w-4 h-4 text-gray-400" />}
                    {index === 2 && <Award className="w-4 h-4 text-amber-600" />}
                    {index > 2 && <span className="text-sm font-bold">#{index + 1}</span>}
                  </div>
                  <span className="font-medium">{country.name}</span>
                  <Badge variant="outline" className="text-xs">
                    {country.users.toLocaleString()} users
                  </Badge>
                </div>
                <span className="text-sm font-bold">{country.score.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading gamification data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Gamification Hub</h1>
          <p className="text-muted-foreground">Track achievements, compete with teams, and reach your potential</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            <Bell className="w-4 h-4 mr-2" />
            Notifications
            {unreadNotifications > 0 && (
              <Badge variant="destructive" className="ml-2 text-xs">
                {unreadNotifications}
              </Badge>
            )}
          </Button>
          <Button variant="outline" size="sm">
            <Settings className="w-4 h-4 mr-2" />
            Settings
          </Button>
        </div>
      </div>

      {/* User Level Progress */}
      <Card className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Avatar className="w-16 h-16 border-4 border-white/20">
                  <AvatarFallback className="bg-white/10 text-white text-lg font-bold">
                    {userStats.level}
                  </AvatarFallback>
                </Avatar>
                <div className="absolute -bottom-1 -right-1 bg-yellow-500 rounded-full p-1">
                  <Crown className="w-4 h-4" />
                </div>
              </div>
              <div>
                <h2 className="text-2xl font-bold">Level {userStats.level}</h2>
                <p className="text-white/80">{userStats.totalPoints.toLocaleString()} total points</p>
                <div className="flex items-center space-x-2 mt-2">
                  <Progress value={levelProgress} className="w-32 h-2" />
                  <span className="text-sm text-white/80">
                    {userStats.experiencePoints} / {userStats.nextLevelXP} XP
                  </span>
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="flex items-center space-x-2 mb-2">
                <Flame className="w-5 h-5 text-orange-300" />
                <span className="text-lg font-bold">{userStats.currentStreak}</span>
                <span className="text-white/80">day streak</span>
              </div>
              <div className="text-sm text-white/80">
                Global Rank #{userStats.rank}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="achievements">Achievements</TabsTrigger>
          <TabsTrigger value="competitions">Competitions</TabsTrigger>
          <TabsTrigger value="teams">Teams</TabsTrigger>
          <TabsTrigger value="global">
            <Globe className="w-4 h-4 mr-2" />
            Global
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <StatCard
              title="This Week"
              value={userStats.weeklyPoints}
              subtitle="points earned"
              icon={TrendingUp}
              color="bg-green-500"
              trend={12}
            />
            <StatCard
              title="Achievements"
              value={userStats.achievementsUnlocked}
              subtitle="badges earned"
              icon={Trophy}
              color="bg-yellow-500"
              trend={8}
            />
            <StatCard
              title="Competitions"
              value={`${userStats.competitionsWon}/${userStats.competitionsParticipated}`}
              subtitle="win rate"
              icon={Target}
              color="bg-blue-500"
            />
            <StatCard
              title="Team Rank"
              value={`#${userStats.rank}`}
              subtitle="this month"
              icon={Users}
              color="bg-purple-500"
              trend={-1}
            />
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <NotificationPanel />
            <RecentAchievements />
          </div>

          <GlobalInsights />
        </TabsContent>

        <TabsContent value="achievements" className="space-y-6">
          <div className="grid gap-6">
            {Object.values(AchievementCategory).map(category => {
              const categoryAchievements = achievements.filter(a => a.category === category);
              const unlockedCount = categoryAchievements.filter(a => 
                achievementProgress.find(p => p.achievementId === a.id)?.isCompleted
              ).length;

              return (
                <Card key={category}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="capitalize flex items-center space-x-2">
                        <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                          {category === AchievementCategory.SAFETY && <Shield className="w-4 h-4" />}
                          {category === AchievementCategory.PRODUCTIVITY && <Rocket className="w-4 h-4" />}
                          {category === AchievementCategory.INNOVATION && <Brain className="w-4 h-4" />}
                          {category === AchievementCategory.TEAMWORK && <Users className="w-4 h-4" />}
                          {category === AchievementCategory.EFFICIENCY && <Zap className="w-4 h-4" />}
                          {category === AchievementCategory.QUALITY && <Star className="w-4 h-4" />}
                        </div>
                        <span>{category.replace('_', ' ')}</span>
                      </CardTitle>
                      <Badge variant="outline">
                        {unlockedCount} / {categoryAchievements.length}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-4 md:grid-cols-8 gap-4">
                      {categoryAchievements.map(achievement => {
                        const progress = achievementProgress.find(p => p.achievementId === achievement.id);
                        return (
                          <AchievementBadge
                            key={achievement.id}
                            achievement={achievement}
                            progress={progress}
                            isUnlocked={progress?.isCompleted || false}
                            size="lg"
                            animated={true}
                          />
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="competitions" className="space-y-6">
          <AdvancedLeaderboard
            title="Competition Leaderboard"
            showGlobal={true}
            showTeams={true}
            showFilters={true}
            showSearch={true}
            animated={true}
          />
        </TabsContent>

        <TabsContent value="teams" className="space-y-6">
          <TeamChallengeHub
            userId={userId}
            teamId={teamId}
          />
        </TabsContent>

        <TabsContent value="global" className="space-y-6">
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Globe className="w-5 h-5" />
                  <span>Phase 5: Global Scale & Enterprise Excellence</span>
                  <Badge className="bg-gradient-to-r from-blue-500 to-purple-600">
                    New Feature
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="text-center py-8">
                  <Globe className="w-16 h-16 mx-auto mb-4 text-blue-500" />
                  <h3 className="text-xl font-bold mb-2">Welcome to Global Competition</h3>
                  <p className="text-muted-foreground max-w-2xl mx-auto">
                    Compete with construction teams worldwide, compare performance across regions, 
                    and participate in international safety and productivity challenges.
                  </p>
                </div>

                <div className="grid md:grid-cols-3 gap-6">
                  <Card className="border-2 border-blue-200">
                    <CardContent className="p-6 text-center">
                      <Trophy className="w-12 h-12 mx-auto mb-4 text-yellow-500" />
                      <h4 className="font-semibold mb-2">Global Leaderboards</h4>
                      <p className="text-sm text-muted-foreground">
                        Compare your performance with teams from around the world
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="border-2 border-green-200">
                    <CardContent className="p-6 text-center">
                      <Users className="w-12 h-12 mx-auto mb-4 text-green-500" />
                      <h4 className="font-semibold mb-2">International Teams</h4>
                      <p className="text-sm text-muted-foreground">
                        Join cross-border teams and learn from global best practices
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="border-2 border-purple-200">
                    <CardContent className="p-6 text-center">
                      <Brain className="w-12 h-12 mx-auto mb-4 text-purple-500" />
                      <h4 className="font-semibold mb-2">AI Insights</h4>
                      <p className="text-sm text-muted-foreground">
                        Get AI-powered recommendations based on global data patterns
                      </p>
                    </CardContent>
                  </Card>
                </div>

                <GlobalInsights />
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default GamificationDashboard;