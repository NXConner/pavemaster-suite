/**
 * Team Challenge Hub Component
 * Comprehensive team challenges with collaborative goals, progress tracking, and rewards
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Users,
  Target,
  Clock,
  Trophy,
  Star,
  Plus,
  Settings,
  MessageSquare,
  Zap,
  Crown,
  Shield,
  Rocket,
  Heart,
  Brain,
  Hammer,
  TrendingUp,
  Calendar,
  Award,
  ChevronRight,
  CheckCircle
} from 'lucide-react';
import {
  Team,
  Competition,
  CompetitionType,
  CompetitionCategory,
  CompetitionStatus,
  WeeklyChallenge,
  TeamMember,
  TeamRole,
  AchievementCategory
} from '@/types/achievements';
import { competitionEngine } from '@/lib/competitionEngine';

interface TeamChallengeHubProps {
  userId: string;
  teamId?: string;
  className?: string;
}

interface TeamChallenge {
  id: string;
  title: string;
  description: string;
  category: AchievementCategory;
  type: 'collaborative' | 'competitive' | 'milestone' | 'streak';
  difficulty: 'easy' | 'medium' | 'hard' | 'legendary';
  startDate: Date;
  endDate: Date;
  status: 'upcoming' | 'active' | 'completed' | 'failed';
  participatingTeams: string[];
  maxTeams?: number;
  requirements: {
    individual: { metric: string; target: number }[];
    team: { metric: string; target: number }[];
  };
  rewards: {
    points: number;
    badges: string[];
    bonuses: string[];
  };
  progress: {
    teamId: string;
    individual: Record<string, number>;
    teamTotal: number;
    completion: number;
  }[];
  leaderboard: {
    teamId: string;
    score: number;
    rank: number;
  }[];
}

// Mock data - would come from actual services
const mockTeam: Team = {
  id: 'team-alpha',
  name: 'Alpha Construction Crew',
  description: 'Elite construction team focused on safety and efficiency',
  color: '#3B82F6',
  logo: '🏗️',
  members: [
    { userId: 'user1', role: TeamRole.CAPTAIN, joinedAt: new Date(), contribution: 1250, isActive: true },
    { userId: 'user2', role: TeamRole.MEMBER, joinedAt: new Date(), contribution: 980, isActive: true },
    { userId: 'user3', role: TeamRole.MEMBER, joinedAt: new Date(), contribution: 1100, isActive: true },
    { userId: 'user4', role: TeamRole.MEMBER, joinedAt: new Date(), contribution: 850, isActive: true }
  ],
  captain: 'user1',
  stats: {
    totalPoints: 4180,
    averagePoints: 1045,
    achievementsCount: 24,
    competitionsWon: 3,
    competitionsParticipated: 8,
    currentStreak: 12,
    longestStreak: 25
  },
  createdAt: new Date()
};

const mockChallenges: TeamChallenge[] = [
  {
    id: 'challenge-1',
    title: 'Safety Excellence Week',
    description: 'Maintain 100% safety compliance while completing daily tasks',
    category: AchievementCategory.SAFETY,
    type: 'collaborative',
    difficulty: 'medium',
    startDate: new Date(),
    endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    status: 'active',
    participatingTeams: ['team-alpha', 'team-beta', 'team-gamma'],
    maxTeams: 5,
    requirements: {
      individual: [
        { metric: 'safety_score', target: 100 },
        { metric: 'tasks_completed', target: 10 }
      ],
      team: [
        { metric: 'total_safety_incidents', target: 0 },
        { metric: 'total_tasks_completed', target: 40 }
      ]
    },
    rewards: {
      points: 1500,
      badges: ['safety-champion-team'],
      bonuses: ['Premium safety gear', 'Team lunch']
    },
    progress: [
      {
        teamId: 'team-alpha',
        individual: { user1: 100, user2: 98, user3: 100, user4: 95 },
        teamTotal: 393,
        completion: 85
      }
    ],
    leaderboard: [
      { teamId: 'team-alpha', score: 393, rank: 1 },
      { teamId: 'team-beta', score: 375, rank: 2 },
      { teamId: 'team-gamma', score: 340, rank: 3 }
    ]
  },
  {
    id: 'challenge-2',
    title: 'Innovation Sprint',
    description: 'Submit process improvements and innovative solutions',
    category: AchievementCategory.INNOVATION,
    type: 'competitive',
    difficulty: 'hard',
    startDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
    endDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
    status: 'upcoming',
    participatingTeams: ['team-alpha'],
    requirements: {
      individual: [
        { metric: 'innovations_submitted', target: 2 }
      ],
      team: [
        { metric: 'total_innovations', target: 8 },
        { metric: 'approved_innovations', target: 4 }
      ]
    },
    rewards: {
      points: 2500,
      badges: ['innovation-masters'],
      bonuses: ['R&D budget allocation', 'Patent support']
    },
    progress: [],
    leaderboard: []
  },
  {
    id: 'challenge-3',
    title: 'Productivity Powerhouse',
    description: 'Complete the most tasks while maintaining quality standards',
    category: AchievementCategory.PRODUCTIVITY,
    type: 'milestone',
    difficulty: 'easy',
    startDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    endDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000),
    status: 'active',
    participatingTeams: ['team-alpha', 'team-beta'],
    requirements: {
      individual: [
        { metric: 'tasks_completed', target: 15 },
        { metric: 'quality_score', target: 85 }
      ],
      team: [
        { metric: 'total_tasks_completed', target: 60 }
      ]
    },
    rewards: {
      points: 1000,
      badges: ['productivity-champions'],
      bonuses: ['Flexible work hours', 'Team building event']
    },
    progress: [
      {
        teamId: 'team-alpha',
        individual: { user1: 12, user2: 14, user3: 11, user4: 13 },
        teamTotal: 50,
        completion: 83
      }
    ],
    leaderboard: [
      { teamId: 'team-alpha', score: 50, rank: 1 },
      { teamId: 'team-beta', score: 42, rank: 2 }
    ]
  }
];

const difficultyConfig = {
  easy: { color: 'text-green-600', bg: 'bg-green-100', icon: Star },
  medium: { color: 'text-yellow-600', bg: 'bg-yellow-100', icon: Target },
  hard: { color: 'text-red-600', bg: 'bg-red-100', icon: Shield },
  legendary: { color: 'text-purple-600', bg: 'bg-purple-100', icon: Crown }
};

const categoryIcons = {
  [AchievementCategory.SAFETY]: Shield,
  [AchievementCategory.PRODUCTIVITY]: Rocket,
  [AchievementCategory.INNOVATION]: Brain,
  [AchievementCategory.TEAMWORK]: Users,
  [AchievementCategory.EFFICIENCY]: Zap,
  [AchievementCategory.QUALITY]: Star
};

export const TeamChallengeHub: React.FC<TeamChallengeHubProps> = ({
  userId,
  teamId,
  className
}) => {
  const [activeTab, setActiveTab] = useState<'active' | 'upcoming' | 'completed'>('active');
  const [selectedChallenge, setSelectedChallenge] = useState<TeamChallenge | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [team, setTeam] = useState<Team | null>(mockTeam);
  const [challenges, setChallenges] = useState<TeamChallenge[]>(mockChallenges);

  const activeChallenges = challenges.filter(c => c.status === 'active');
  const upcomingChallenges = challenges.filter(c => c.status === 'upcoming');
  const completedChallenges = challenges.filter(c => c.status === 'completed');

  const ChallengeCard: React.FC<{ challenge: TeamChallenge; index: number }> = ({ challenge, index }) => {
    const difficulty = difficultyConfig[challenge.difficulty];
    const CategoryIcon = categoryIcons[challenge.category];
    const DifficultyIcon = difficulty.icon;
    
    const teamProgress = challenge.progress.find(p => p.teamId === team?.id);
    const teamRank = challenge.leaderboard.find(l => l.teamId === team?.id);
    
    const daysLeft = Math.ceil((challenge.endDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.1 }}
        className="group"
      >
        <Card className="cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-[1.02]"
              onClick={() => setSelectedChallenge(challenge)}>
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-3">
                <div className={cn(
                  'p-2 rounded-lg',
                  difficulty.bg
                )}>
                  <CategoryIcon className={cn('w-5 h-5', difficulty.color)} />
                </div>
                <div>
                  <CardTitle className="text-lg">{challenge.title}</CardTitle>
                  <div className="flex items-center space-x-2 mt-1">
                    <Badge variant="outline" className="text-xs">
                      <DifficultyIcon className="w-3 h-3 mr-1" />
                      {challenge.difficulty}
                    </Badge>
                    <Badge variant="secondary" className="text-xs">
                      {challenge.type}
                    </Badge>
                    {challenge.status === 'active' && (
                      <Badge className="text-xs bg-green-100 text-green-700">
                        <Clock className="w-3 h-3 mr-1" />
                        {daysLeft}d left
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground line-clamp-2">
              {challenge.description}
            </p>

            {/* Progress */}
            {teamProgress && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">Team Progress</span>
                  <span className="text-muted-foreground">{teamProgress.completion}%</span>
                </div>
                <Progress value={teamProgress.completion} className="h-2" />
              </div>
            )}

            {/* Rank */}
            {teamRank && (
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Trophy className="w-4 h-4 text-yellow-500" />
                  <span className="text-sm font-medium">Rank #{teamRank.rank}</span>
                </div>
                <span className="text-sm text-muted-foreground">
                  {teamRank.score} points
                </span>
              </div>
            )}

            {/* Rewards Preview */}
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center space-x-1 text-muted-foreground">
                <Star className="w-3 h-3" />
                <span>{challenge.rewards.points} pts</span>
              </div>
              <div className="flex items-center space-x-1 text-muted-foreground">
                <Users className="w-3 h-3" />
                <span>{challenge.participatingTeams.length} teams</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  };

  const ChallengeDetailDialog = () => {
    if (!selectedChallenge) return null;

    const teamProgress = selectedChallenge.progress.find(p => p.teamId === team?.id);
    const teamRank = selectedChallenge.leaderboard.find(l => l.teamId === team?.id);

    return (
      <Dialog open={!!selectedChallenge} onOpenChange={() => setSelectedChallenge(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-3">
              {React.createElement(categoryIcons[selectedChallenge.category], {
                className: 'w-6 h-6'
              })}
              <span>{selectedChallenge.title}</span>
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            {/* Challenge Overview */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card className="p-3">
                <div className="text-center">
                  <Clock className="w-6 h-6 mx-auto mb-1 text-blue-500" />
                  <div className="text-sm font-medium">Duration</div>
                  <div className="text-xs text-muted-foreground">
                    {Math.ceil((selectedChallenge.endDate.getTime() - selectedChallenge.startDate.getTime()) / (1000 * 60 * 60 * 24))} days
                  </div>
                </div>
              </Card>
              
              <Card className="p-3">
                <div className="text-center">
                  <Users className="w-6 h-6 mx-auto mb-1 text-green-500" />
                  <div className="text-sm font-medium">Teams</div>
                  <div className="text-xs text-muted-foreground">
                    {selectedChallenge.participatingTeams.length} competing
                  </div>
                </div>
              </Card>

              <Card className="p-3">
                <div className="text-center">
                  <Trophy className="w-6 h-6 mx-auto mb-1 text-yellow-500" />
                  <div className="text-sm font-medium">Reward</div>
                  <div className="text-xs text-muted-foreground">
                    {selectedChallenge.rewards.points} points
                  </div>
                </div>
              </Card>

              <Card className="p-3">
                <div className="text-center">
                  <Target className="w-6 h-6 mx-auto mb-1 text-red-500" />
                  <div className="text-sm font-medium">Difficulty</div>
                  <div className="text-xs text-muted-foreground capitalize">
                    {selectedChallenge.difficulty}
                  </div>
                </div>
              </Card>
            </div>

            {/* Description */}
            <div>
              <h3 className="font-semibold mb-2">Challenge Description</h3>
              <p className="text-muted-foreground">{selectedChallenge.description}</p>
            </div>

            {/* Requirements */}
            <div>
              <h3 className="font-semibold mb-3">Requirements</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <Card className="p-4">
                  <h4 className="font-medium mb-3 flex items-center">
                    <Users className="w-4 h-4 mr-2" />
                    Individual Goals
                  </h4>
                  <div className="space-y-2">
                    {selectedChallenge.requirements.individual.map((req, index) => (
                      <div key={index} className="flex items-center justify-between text-sm">
                        <span className="capitalize">{req.metric.replace('_', ' ')}</span>
                        <Badge variant="outline">{req.target}</Badge>
                      </div>
                    ))}
                  </div>
                </Card>

                <Card className="p-4">
                  <h4 className="font-medium mb-3 flex items-center">
                    <Target className="w-4 h-4 mr-2" />
                    Team Goals
                  </h4>
                  <div className="space-y-2">
                    {selectedChallenge.requirements.team.map((req, index) => (
                      <div key={index} className="flex items-center justify-between text-sm">
                        <span className="capitalize">{req.metric.replace('_', ' ')}</span>
                        <Badge variant="outline">{req.target}</Badge>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>
            </div>

            {/* Team Progress */}
            {teamProgress && (
              <div>
                <h3 className="font-semibold mb-3">Your Team's Progress</h3>
                <Card className="p-4">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">Overall Progress</span>
                      <span className="text-2xl font-bold">{teamProgress.completion}%</span>
                    </div>
                    <Progress value={teamProgress.completion} className="h-3" />
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                      {Object.entries(teamProgress.individual).map(([memberId, progress]) => (
                        <div key={memberId} className="text-center">
                          <Avatar className="w-8 h-8 mx-auto mb-2">
                            <AvatarFallback className="text-xs">
                              {memberId.slice(-1)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="text-xs font-medium">Member {memberId.slice(-1)}</div>
                          <div className="text-xs text-muted-foreground">{progress} pts</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </Card>
              </div>
            )}

            {/* Leaderboard */}
            {selectedChallenge.leaderboard.length > 0 && (
              <div>
                <h3 className="font-semibold mb-3">Leaderboard</h3>
                <div className="space-y-2">
                  {selectedChallenge.leaderboard.map((entry, index) => (
                    <div
                      key={entry.teamId}
                      className={cn(
                        'flex items-center justify-between p-3 rounded-lg border',
                        entry.teamId === team?.id ? 'bg-blue-50 border-blue-200' : 'bg-gray-50'
                      )}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-6 h-6 flex items-center justify-center">
                          {entry.rank === 1 && <Crown className="w-5 h-5 text-yellow-500" />}
                          {entry.rank === 2 && <Award className="w-5 h-5 text-gray-400" />}
                          {entry.rank === 3 && <Award className="w-5 h-5 text-amber-600" />}
                          {entry.rank > 3 && <span className="text-sm font-bold">#{entry.rank}</span>}
                        </div>
                        <span className="font-medium">
                          {entry.teamId === team?.id ? team.name : `Team ${entry.teamId.slice(-1)}`}
                        </span>
                        {entry.teamId === team?.id && (
                          <Badge variant="secondary" className="text-xs">Your Team</Badge>
                        )}
                      </div>
                      <span className="font-bold">{entry.score}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Rewards */}
            <div>
              <h3 className="font-semibold mb-3">Rewards</h3>
              <div className="grid md:grid-cols-3 gap-4">
                <Card className="p-4 text-center">
                  <Star className="w-8 h-8 mx-auto mb-2 text-yellow-500" />
                  <div className="font-medium">Points</div>
                  <div className="text-2xl font-bold">{selectedChallenge.rewards.points}</div>
                </Card>
                
                <Card className="p-4">
                  <div className="font-medium mb-2 flex items-center">
                    <Trophy className="w-4 h-4 mr-2" />
                    Badges
                  </div>
                  <div className="space-y-1">
                    {selectedChallenge.rewards.badges.map(badge => (
                      <Badge key={badge} variant="outline" className="text-xs">
                        {badge.replace('-', ' ')}
                      </Badge>
                    ))}
                  </div>
                </Card>

                <Card className="p-4">
                  <div className="font-medium mb-2 flex items-center">
                    <Heart className="w-4 h-4 mr-2" />
                    Bonuses
                  </div>
                  <div className="space-y-1">
                    {selectedChallenge.rewards.bonuses.map(bonus => (
                      <div key={bonus} className="text-xs text-muted-foreground">
                        • {bonus}
                      </div>
                    ))}
                  </div>
                </Card>
              </div>
            </div>

            {/* Actions */}
            <div className="flex space-x-4">
              {selectedChallenge.status === 'upcoming' && (
                <Button className="flex-1">
                  <Users className="w-4 h-4 mr-2" />
                  Join Challenge
                </Button>
              )}
              {selectedChallenge.status === 'active' && (
                <>
                  <Button variant="outline" className="flex-1">
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Team Chat
                  </Button>
                  <Button className="flex-1">
                    <TrendingUp className="w-4 h-4 mr-2" />
                    View Progress
                  </Button>
                </>
              )}
              {selectedChallenge.status === 'completed' && (
                <Button variant="outline" className="flex-1">
                  <Award className="w-4 h-4 mr-2" />
                  View Results
                </Button>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  };

  if (!team) {
    return (
      <Card className={cn('p-8 text-center', className)}>
        <Users className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
        <h3 className="text-lg font-semibold mb-2">No Team Found</h3>
        <p className="text-muted-foreground mb-4">
          Join or create a team to participate in challenges
        </p>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Create Team
        </Button>
      </Card>
    );
  }

  return (
    <div className={cn('space-y-6', className)}>
      {/* Team Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center text-2xl">
                {team.logo}
              </div>
              <div>
                <CardTitle className="flex items-center space-x-2">
                  <span>{team.name}</span>
                  <Badge variant="outline" className="text-xs">
                    {team.members.length} members
                  </Badge>
                </CardTitle>
                <p className="text-muted-foreground">{team.description}</p>
              </div>
            </div>
            <Button variant="outline" size="sm">
              <Settings className="w-4 h-4 mr-2" />
              Manage
            </Button>
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{team.stats.totalPoints}</div>
              <div className="text-sm text-muted-foreground">Total Points</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{team.stats.competitionsWon}</div>
              <div className="text-sm text-muted-foreground">Wins</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">{team.stats.currentStreak}</div>
              <div className="text-sm text-muted-foreground">Streak</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{team.stats.achievementsCount}</div>
              <div className="text-sm text-muted-foreground">Achievements</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Challenge Tabs */}
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)}>
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="active" className="flex items-center space-x-2">
              <Zap className="w-4 h-4" />
              <span>Active ({activeChallenges.length})</span>
            </TabsTrigger>
            <TabsTrigger value="upcoming" className="flex items-center space-x-2">
              <Calendar className="w-4 h-4" />
              <span>Upcoming ({upcomingChallenges.length})</span>
            </TabsTrigger>
            <TabsTrigger value="completed" className="flex items-center space-x-2">
              <CheckCircle className="w-4 h-4" />
              <span>Completed ({completedChallenges.length})</span>
            </TabsTrigger>
          </TabsList>

          <Button onClick={() => setShowCreateDialog(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Create Challenge
          </Button>
        </div>

        <TabsContent value="active" className="space-y-4">
          {activeChallenges.length === 0 ? (
            <Card className="p-8 text-center">
              <Target className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">No Active Challenges</h3>
              <p className="text-muted-foreground">Join a challenge to start competing!</p>
            </Card>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {activeChallenges.map((challenge, index) => (
                <ChallengeCard key={challenge.id} challenge={challenge} index={index} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="upcoming" className="space-y-4">
          {upcomingChallenges.length === 0 ? (
            <Card className="p-8 text-center">
              <Calendar className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">No Upcoming Challenges</h3>
              <p className="text-muted-foreground">Check back later for new challenges!</p>
            </Card>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {upcomingChallenges.map((challenge, index) => (
                <ChallengeCard key={challenge.id} challenge={challenge} index={index} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="completed" className="space-y-4">
          {completedChallenges.length === 0 ? (
            <Card className="p-8 text-center">
              <CheckCircle className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">No Completed Challenges</h3>
              <p className="text-muted-foreground">Complete challenges to see your achievements!</p>
            </Card>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {completedChallenges.map((challenge, index) => (
                <ChallengeCard key={challenge.id} challenge={challenge} index={index} />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Challenge Detail Dialog */}
      <ChallengeDetailDialog />
    </div>
  );
};

export default TeamChallengeHub;