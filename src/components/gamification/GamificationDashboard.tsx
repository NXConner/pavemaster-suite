import { useState, useEffect } from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Progress } from '../ui/progress';
import { 
  Trophy, 
  Star, 
  Award, 
  TrendingUp, 
  Users, 
  Gift,
  Medal,
  Crown
} from 'lucide-react';
import { supabase } from '../../integrations/supabase/client';

interface Achievement {
  id: string;
  user_id: string | null;
  title: string | null;
  description: string | null;
  achieved_at: string | null;
}

interface Badge {
  id: string;
  user_id: string | null;
  name: string | null;
  description: string | null;
  awarded_at: string | null;
}

interface LeaderboardEntry {
  user_id: string;
  points: number | null;
  last_updated: string | null;
}

interface Reward {
  id: string;
  user_id: string | null;
  description: string | null;
  reward_type: string | null;
  awarded_at: string | null;
}

export const GamificationDashboard = () => {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [badges, setBadges] = useState<Badge[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadGamificationData();
  }, []);

  const loadGamificationData = async () => {
    try {
      const [achievementsRes, badgesRes, leaderboardRes, rewardsRes] = await Promise.all([
        supabase.from('achievements').select('*'),
        supabase.from('badges').select('*'),
        supabase.from('leaderboard').select('*'),
        supabase.from('rewards').select('*')
      ]);

      if (achievementsRes.data) setAchievements(achievementsRes.data);
      if (badgesRes.data) setBadges(badgesRes.data);
      if (leaderboardRes.data) setLeaderboard(leaderboardRes.data);
      if (rewardsRes.data) setRewards(rewardsRes.data);
    } catch (error) {
      console.error('Error loading gamification data:', error);
    } finally {
      setLoading(false);
    }
  };

  const OverviewDashboard = () => {
    const totalPoints = leaderboard.reduce((sum, entry) => sum + (entry.points || 0), 0);
    const validEntries = leaderboard.filter(entry => entry.points !== null);
    const sortedLeaderboard = validEntries.sort((a, b) => (b.points || 0) - (a.points || 0));

    return (
      <div className="space-y-6">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Points</p>
                <p className="text-2xl font-bold">{totalPoints.toLocaleString()}</p>
              </div>
              <Trophy className="h-8 w-8 text-warning" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Players</p>
                <p className="text-2xl font-bold">{leaderboard.length}</p>
              </div>
              <Users className="h-8 w-8 text-primary" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Achievements</p>
                <p className="text-2xl font-bold">{achievements.length}</p>
              </div>
              <Award className="h-8 w-8 text-success" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Badges Earned</p>
                <p className="text-2xl font-bold">{badges.length}</p>
              </div>
              <Medal className="h-8 w-8 text-info" />
            </div>
          </Card>
        </div>

        {/* Top Performers */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Crown className="h-5 w-5 text-warning" />
              Top Performers
            </h3>
            <div className="space-y-4">
              {sortedLeaderboard.slice(0, 5).map((entry, index) => (
                <div key={entry.user_id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`h-8 w-8 rounded-full flex items-center justify-center text-sm font-bold ${
                      index === 0 ? 'bg-warning text-warning-foreground' :
                      index === 1 ? 'bg-muted text-muted-foreground' :
                      index === 2 ? 'bg-warning/30 text-warning-foreground' :
                      'bg-muted text-muted-foreground'
                    }`}>
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium">Employee {entry.user_id.slice(0, 8)}</p>
                      <p className="text-sm text-muted-foreground">{entry.points || 0} points</p>
                    </div>
                  </div>
                  {index < 3 && (
                    <Trophy className={`h-5 w-5 ${
                      index === 0 ? 'text-warning' :
                      index === 1 ? 'text-muted-foreground' :
                      'text-warning/50'
                    }`} />
                  )}
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Award className="h-5 w-5 text-success" />
              Recent Achievements
            </h3>
            <div className="space-y-4">
              {achievements.slice(0, 5).map((achievement) => (
                <div key={achievement.id} className="flex items-start gap-3">
                  <div className="h-10 w-10 bg-success/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <Star className="h-5 w-5 text-success" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{achievement.title || 'Achievement'}</p>
                    <p className="text-sm text-muted-foreground">{achievement.description || 'No description'}</p>
                    <p className="text-xs text-muted-foreground">
                      {achievement.achieved_at ? new Date(achievement.achieved_at).toLocaleDateString() : 'N/A'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Performance Trends */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            Performance Trends
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Project Completion Rate</span>
              <span className="text-sm text-muted-foreground">92%</span>
            </div>
            <Progress value={92} className="h-2" />
            
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Safety Score</span>
              <span className="text-sm text-muted-foreground">88%</span>
            </div>
            <Progress value={88} className="h-2" />
            
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Quality Rating</span>
              <span className="text-sm text-muted-foreground">95%</span>
            </div>
            <Progress value={95} className="h-2" />
          </div>
        </Card>
      </div>
    );
  };

  const AchievementsTab = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Achievement System</h3>
        <Button>Create Achievement</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {achievements.map((achievement) => (
          <Card key={achievement.id} className="p-6">
            <div className="text-center space-y-4">
              <div className="mx-auto h-16 w-16 bg-success/10 rounded-full flex items-center justify-center">
                <Trophy className="h-8 w-8 text-success" />
              </div>
              <div>
                <h4 className="font-semibold">{achievement.title || 'Achievement'}</h4>
                <p className="text-sm text-muted-foreground">{achievement.description || 'No description'}</p>
              </div>
              <Badge variant="secondary">
                {achievement.achieved_at ? new Date(achievement.achieved_at).toLocaleDateString() : 'N/A'}
              </Badge>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );

  const BadgesTab = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Badge Collection</h3>
        <Button>Award Badge</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {badges.map((badge) => (
          <Card key={badge.id} className="p-6">
            <div className="text-center space-y-4">
              <div className="mx-auto h-12 w-12 bg-info/10 rounded-full flex items-center justify-center">
                <Medal className="h-6 w-6 text-info" />
              </div>
              <div>
                <h4 className="font-medium">{badge.name || 'Badge'}</h4>
                <p className="text-xs text-muted-foreground">{badge.description || 'No description'}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );

  const RewardsTab = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Rewards Program</h3>
        <Button>Issue Reward</Button>
      </div>

      <Card className="p-6">
        <div className="space-y-4">
          {rewards.map((reward) => (
            <div key={reward.id} className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 bg-warning/10 rounded-full flex items-center justify-center">
                  <Gift className="h-5 w-5 text-warning" />
                </div>
                <div>
                  <p className="font-medium">{reward.description || 'Reward'}</p>
                  <p className="text-sm text-muted-foreground">
                    {reward.reward_type || 'N/A'} • {reward.awarded_at ? new Date(reward.awarded_at).toLocaleDateString() : 'N/A'}
                  </p>
                </div>
              </div>
              <Badge variant="outline">{reward.reward_type || 'N/A'}</Badge>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Gamification Center</h1>
          <p className="text-muted-foreground">
            Employee engagement and performance recognition system
          </p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="achievements">Achievements</TabsTrigger>
          <TabsTrigger value="badges">Badges</TabsTrigger>
          <TabsTrigger value="rewards">Rewards</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <OverviewDashboard />
        </TabsContent>

        <TabsContent value="achievements">
          <AchievementsTab />
        </TabsContent>

        <TabsContent value="badges">
          <BadgesTab />
        </TabsContent>

        <TabsContent value="rewards">
          <RewardsTab />
        </TabsContent>
      </Tabs>
    </div>
  );
};