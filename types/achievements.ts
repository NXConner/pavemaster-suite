/**
 * Achievements and Competition System Types
 * Comprehensive typing for gamification features
 */

export interface Achievement {
  id: string;
  title: string;
  description: string;
  category: AchievementCategory;
  type: AchievementType;
  icon: string;
  color: string;
  rarity: AchievementRarity;
  points: number;
  requirements: AchievementRequirement[];
  unlockedAt?: Date;
  progress?: number;
  maxProgress?: number;
  isSecret?: boolean;
  prerequisiteIds?: string[];
}

export interface AchievementRequirement {
  type: RequirementType;
  metric: string;
  operator: 'eq' | 'gt' | 'gte' | 'lt' | 'lte' | 'between';
  value: number | string | number[];
  timeframe?: TimeframeType;
}

export interface UserAchievement {
  id: string;
  userId: string;
  achievementId: string;
  unlockedAt: Date;
  progress: number;
  isCompleted: boolean;
  notificationSent: boolean;
}

export interface Competition {
  id: string;
  title: string;
  description: string;
  type: CompetitionType;
  category: CompetitionCategory;
  startDate: Date;
  endDate: Date;
  status: CompetitionStatus;
  participants: CompetitionParticipant[];
  rules: CompetitionRule[];
  prizes: CompetitionPrize[];
  leaderboard: LeaderboardEntry[];
  settings: CompetitionSettings;
  createdBy: string;
  teamBased: boolean;
}

export interface CompetitionParticipant {
  userId: string;
  teamId?: string;
  joinedAt: Date;
  currentScore: number;
  currentRank: number;
  isActive: boolean;
}

export interface LeaderboardEntry {
  userId: string;
  teamId?: string;
  score: number;
  rank: number;
  change: number; // Position change from last update
  achievements: string[]; // Achievement IDs earned during competition
  lastUpdated: Date;
}

export interface Team {
  id: string;
  name: string;
  description: string;
  color: string;
  logo?: string;
  members: TeamMember[];
  captain: string; // User ID
  stats: TeamStats;
  createdAt: Date;
}

export interface TeamMember {
  userId: string;
  role: TeamRole;
  joinedAt: Date;
  contribution: number;
  isActive: boolean;
}

export interface TeamStats {
  totalPoints: number;
  averagePoints: number;
  achievementsCount: number;
  competitionsWon: number;
  competitionsParticipated: number;
  currentStreak: number;
  longestStreak: number;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  category: BadgeCategory;
  rarity: AchievementRarity;
  requirements: string[];
  isLimited?: boolean;
  availableUntil?: Date;
}

export interface UserStats {
  userId: string;
  totalPoints: number;
  level: number;
  experiencePoints: number;
  nextLevelXP: number;
  achievementsUnlocked: number;
  competitionsWon: number;
  competitionsParticipated: number;
  currentStreak: number;
  longestStreak: number;
  rank: number;
  badges: string[];
  weeklyPoints: number;
  monthlyPoints: number;
}

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  icon?: string;
  color?: string;
  data?: Record<string, any>;
  isRead: boolean;
  createdAt: Date;
  expiresAt?: Date;
}

export interface GameSettings {
  pointsPerTask: number;
  pointsPerProject: number;
  bonusMultipliers: {
    teamwork: number;
    innovation: number;
    safety: number;
    efficiency: number;
  };
  levelRequirements: number[];
  competitionCooldown: number; // Days between competitions
  achievementCooldown: number; // Hours between notifications
}

// Enums
export enum AchievementCategory {
  PRODUCTIVITY = 'productivity',
  SAFETY = 'safety',
  TEAMWORK = 'teamwork',
  INNOVATION = 'innovation',
  QUALITY = 'quality',
  EFFICIENCY = 'efficiency',
  LEADERSHIP = 'leadership',
  LEARNING = 'learning',
  MILESTONE = 'milestone',
  SPECIAL = 'special'
}

export enum AchievementType {
  PROGRESS = 'progress', // Gradual completion
  MILESTONE = 'milestone', // One-time achievement
  STREAK = 'streak', // Consecutive actions
  COLLECTION = 'collection', // Collect items/complete sets
  SOCIAL = 'social', // Team/collaboration based
  TIMED = 'timed' // Time-based challenges
}

export enum AchievementRarity {
  COMMON = 'common',
  UNCOMMON = 'uncommon',
  RARE = 'rare',
  EPIC = 'epic',
  LEGENDARY = 'legendary'
}

export enum RequirementType {
  TASKS_COMPLETED = 'tasks_completed',
  PROJECTS_FINISHED = 'projects_finished',
  HOURS_WORKED = 'hours_worked',
  SAFETY_SCORE = 'safety_score',
  TEAM_COLLABORATIONS = 'team_collaborations',
  INNOVATIONS_SUBMITTED = 'innovations_submitted',
  TRAINING_COMPLETED = 'training_completed',
  CONSECUTIVE_DAYS = 'consecutive_days',
  POINTS_EARNED = 'points_earned',
  COMPETITIONS_WON = 'competitions_won'
}

export enum TimeframeType {
  DAY = 'day',
  WEEK = 'week',
  MONTH = 'month',
  QUARTER = 'quarter',
  YEAR = 'year',
  ALL_TIME = 'all_time'
}

export enum CompetitionType {
  INDIVIDUAL = 'individual',
  TEAM = 'team',
  DEPARTMENT = 'department',
  COMPANY_WIDE = 'company_wide'
}

export enum CompetitionCategory {
  PRODUCTIVITY = 'productivity',
  SAFETY = 'safety',
  INNOVATION = 'innovation',
  TEAMWORK = 'teamwork',
  EFFICIENCY = 'efficiency',
  QUALITY = 'quality'
}

export enum CompetitionStatus {
  DRAFT = 'draft',
  UPCOMING = 'upcoming',
  ACTIVE = 'active',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled'
}

export enum TeamRole {
  CAPTAIN = 'captain',
  MEMBER = 'member',
  SUBSTITUTE = 'substitute'
}

export enum BadgeCategory {
  ACHIEVEMENT = 'achievement',
  COMPETITION = 'competition',
  MILESTONE = 'milestone',
  SPECIAL_EVENT = 'special_event',
  LEADERSHIP = 'leadership'
}

export enum NotificationType {
  ACHIEVEMENT_UNLOCKED = 'achievement_unlocked',
  COMPETITION_STARTED = 'competition_started',
  COMPETITION_ENDED = 'competition_ended',
  LEVEL_UP = 'level_up',
  BADGE_EARNED = 'badge_earned',
  TEAM_INVITATION = 'team_invitation',
  LEADERBOARD_UPDATE = 'leaderboard_update',
  CHALLENGE_COMPLETED = 'challenge_completed'
}

// Additional interfaces for specific features
export interface CompetitionRule {
  id: string;
  description: string;
  pointsAwarded: number;
  condition: string;
}

export interface CompetitionPrize {
  rank: number;
  title: string;
  description: string;
  points: number;
  badge?: string;
  rewards?: string[];
}

export interface CompetitionSettings {
  maxParticipants?: number;
  autoJoin: boolean;
  showLiveUpdates: boolean;
  allowTeamChat: boolean;
  notificationFrequency: 'real-time' | 'hourly' | 'daily';
}

export interface WeeklyChallenge {
  id: string;
  title: string;
  description: string;
  startDate: Date;
  endDate: Date;
  targetMetric: string;
  targetValue: number;
  pointsReward: number;
  participants: string[];
  isActive: boolean;
}

export interface AchievementProgress {
  achievementId: string;
  currentValue: number;
  targetValue: number;
  percentage: number;
  isCompleted: boolean;
  estimatedCompletion?: Date;
}

export interface LeaderboardFilter {
  timeframe: TimeframeType;
  category?: AchievementCategory;
  department?: string;
  team?: string;
  limit: number;
}