/**
 * Achievements Engine
 * Core system for managing achievements, progress tracking, and unlocking
 */

import { supabase } from '@/integrations/supabase/client';
import { 
  Achievement, 
  UserAchievement, 
  UserStats, 
  AchievementProgress,
  AchievementCategory,
  AchievementType,
  AchievementRarity,
  RequirementType,
  TimeframeType,
  Notification,
  NotificationType 
} from '@/types/achievements';

class AchievementsEngine {
  private achievements: Map<string, Achievement> = new Map();
  private userAchievements: Map<string, UserAchievement[]> = new Map();
  private userStats: Map<string, UserStats> = new Map();
  private listeners: Set<(event: AchievementEvent) => void> = new Set();

  constructor() {
    this.initializeAchievements();
    this.startProgressTracking();
  }

  /**
   * Initialize predefined achievements
   */
  private initializeAchievements(): void {
    const predefinedAchievements: Achievement[] = [
      // Productivity Achievements
      {
        id: 'first-task-completed',
        title: 'Getting Started',
        description: 'Complete your first task',
        category: AchievementCategory.PRODUCTIVITY,
        type: AchievementType.MILESTONE,
        icon: '🎯',
        color: '#10B981',
        rarity: AchievementRarity.COMMON,
        points: 50,
        requirements: [{
          type: RequirementType.TASKS_COMPLETED,
          metric: 'tasks_completed',
          operator: 'gte',
          value: 1,
          timeframe: TimeframeType.ALL_TIME
        }]
      },
      {
        id: 'task-master',
        title: 'Task Master',
        description: 'Complete 100 tasks',
        category: AchievementCategory.PRODUCTIVITY,
        type: AchievementType.PROGRESS,
        icon: '🏆',
        color: '#F59E0B',
        rarity: AchievementRarity.RARE,
        points: 500,
        requirements: [{
          type: RequirementType.TASKS_COMPLETED,
          metric: 'tasks_completed',
          operator: 'gte',
          value: 100,
          timeframe: TimeframeType.ALL_TIME
        }]
      },
      {
        id: 'speed-demon',
        title: 'Speed Demon',
        description: 'Complete 10 tasks in one day',
        category: AchievementCategory.EFFICIENCY,
        type: AchievementType.TIMED,
        icon: '⚡',
        color: '#8B5CF6',
        rarity: AchievementRarity.UNCOMMON,
        points: 200,
        requirements: [{
          type: RequirementType.TASKS_COMPLETED,
          metric: 'tasks_completed',
          operator: 'gte',
          value: 10,
          timeframe: TimeframeType.DAY
        }]
      },

      // Safety Achievements
      {
        id: 'safety-first',
        title: 'Safety First',
        description: 'Maintain 100% safety score for a week',
        category: AchievementCategory.SAFETY,
        type: AchievementType.STREAK,
        icon: '🛡️',
        color: '#EF4444',
        rarity: AchievementRarity.RARE,
        points: 400,
        requirements: [{
          type: RequirementType.SAFETY_SCORE,
          metric: 'safety_score',
          operator: 'eq',
          value: 100,
          timeframe: TimeframeType.WEEK
        }]
      },
      {
        id: 'safety-champion',
        title: 'Safety Champion',
        description: 'Report 5 safety improvements',
        category: AchievementCategory.SAFETY,
        type: AchievementType.PROGRESS,
        icon: '🏅',
        color: '#DC2626',
        rarity: AchievementRarity.EPIC,
        points: 750,
        requirements: [{
          type: RequirementType.INNOVATIONS_SUBMITTED,
          metric: 'safety_improvements',
          operator: 'gte',
          value: 5,
          timeframe: TimeframeType.ALL_TIME
        }]
      },

      // Teamwork Achievements
      {
        id: 'team-player',
        title: 'Team Player',
        description: 'Collaborate on 10 projects',
        category: AchievementCategory.TEAMWORK,
        type: AchievementType.SOCIAL,
        icon: '🤝',
        color: '#3B82F6',
        rarity: AchievementRarity.UNCOMMON,
        points: 300,
        requirements: [{
          type: RequirementType.TEAM_COLLABORATIONS,
          metric: 'collaborations',
          operator: 'gte',
          value: 10,
          timeframe: TimeframeType.ALL_TIME
        }]
      },
      {
        id: 'mentor',
        title: 'Mentor',
        description: 'Help train 3 new team members',
        category: AchievementCategory.LEADERSHIP,
        type: AchievementType.SOCIAL,
        icon: '👨‍🏫',
        color: '#6366F1',
        rarity: AchievementRarity.EPIC,
        points: 600,
        requirements: [{
          type: RequirementType.TRAINING_COMPLETED,
          metric: 'mentoring_sessions',
          operator: 'gte',
          value: 3,
          timeframe: TimeframeType.ALL_TIME
        }]
      },

      // Innovation Achievements
      {
        id: 'innovator',
        title: 'Innovator',
        description: 'Submit 3 process improvements',
        category: AchievementCategory.INNOVATION,
        type: AchievementType.PROGRESS,
        icon: '💡',
        color: '#F59E0B',
        rarity: AchievementRarity.RARE,
        points: 500,
        requirements: [{
          type: RequirementType.INNOVATIONS_SUBMITTED,
          metric: 'innovations',
          operator: 'gte',
          value: 3,
          timeframe: TimeframeType.ALL_TIME
        }]
      },

      // Streak Achievements
      {
        id: 'consistent-performer',
        title: 'Consistent Performer',
        description: 'Work 30 consecutive days',
        category: AchievementCategory.PRODUCTIVITY,
        type: AchievementType.STREAK,
        icon: '📅',
        color: '#059669',
        rarity: AchievementRarity.EPIC,
        points: 800,
        requirements: [{
          type: RequirementType.CONSECUTIVE_DAYS,
          metric: 'work_streak',
          operator: 'gte',
          value: 30,
          timeframe: TimeframeType.ALL_TIME
        }]
      },

      // Milestone Achievements
      {
        id: 'century-club',
        title: 'Century Club',
        description: 'Earn 10,000 points',
        category: AchievementCategory.MILESTONE,
        type: AchievementType.PROGRESS,
        icon: '💯',
        color: '#7C3AED',
        rarity: AchievementRarity.LEGENDARY,
        points: 1000,
        requirements: [{
          type: RequirementType.POINTS_EARNED,
          metric: 'total_points',
          operator: 'gte',
          value: 10000,
          timeframe: TimeframeType.ALL_TIME
        }]
      },

      // Special/Secret Achievements
      {
        id: 'early-bird',
        title: 'Early Bird',
        description: 'Start work before 7 AM for 7 days',
        category: AchievementCategory.SPECIAL,
        type: AchievementType.STREAK,
        icon: '🌅',
        color: '#F97316',
        rarity: AchievementRarity.RARE,
        points: 350,
        isSecret: true,
        requirements: [{
          type: RequirementType.CONSECUTIVE_DAYS,
          metric: 'early_start_streak',
          operator: 'gte',
          value: 7,
          timeframe: TimeframeType.ALL_TIME
        }]
      }
    ];

    predefinedAchievements.forEach(achievement => {
      this.achievements.set(achievement.id, achievement);
    });
  }

  /**
   * Start tracking user progress
   */
  private startProgressTracking(): void {
    // Set up real-time listeners for user actions
    this.setupRealtimeListeners();
    
    // Periodic progress evaluation
    setInterval(() => {
      this.evaluateAllUsersProgress();
    }, 60000); // Check every minute
  }

  /**
   * Setup real-time listeners for Supabase changes
   */
  private setupRealtimeListeners(): void {
    // Listen for task completions
    supabase
      .channel('achievements-tracking')
      .on('postgres_changes', 
        { event: 'INSERT', schema: 'public', table: 'tasks' },
        (payload) => this.handleTaskCompletion(payload.new)
      )
      .on('postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'user_stats' },
        (payload) => this.handleStatsUpdate(payload.new)
      )
      .subscribe();
  }

  /**
   * Record user action for achievement tracking
   */
  async recordUserAction(userId: string, action: UserAction): Promise<void> {
    try {
      // Update user stats
      await this.updateUserStats(userId, action);
      
      // Check for achievement unlocks
      await this.checkAchievementProgress(userId, action);
      
      // Emit event for listeners
      this.emitEvent({
        type: 'action_recorded',
        userId,
        action,
        timestamp: new Date()
      });
    } catch (error) {
      console.error('Error recording user action:', error);
    }
  }

  /**
   * Check and update achievement progress for a user
   */
  async checkAchievementProgress(userId: string, action?: UserAction): Promise<void> {
    try {
      const userStats = await this.getUserStats(userId);
      const userAchievements = await this.getUserAchievements(userId);
      const unlockedIds = new Set(userAchievements.map(ua => ua.achievementId));

      for (const [achievementId, achievement] of this.achievements) {
        // Skip if already unlocked
        if (unlockedIds.has(achievementId)) continue;

        // Check prerequisites
        if (achievement.prerequisiteIds) {
          const prerequisitesMet = achievement.prerequisiteIds.every(id => unlockedIds.has(id));
          if (!prerequisitesMet) continue;
        }

        // Evaluate requirements
        const progress = await this.evaluateRequirements(userId, achievement, userStats);
        
        if (progress.isCompleted) {
          await this.unlockAchievement(userId, achievementId);
        } else {
          // Update progress tracking
          await this.updateAchievementProgress(userId, achievementId, progress);
        }
      }
    } catch (error) {
      console.error('Error checking achievement progress:', error);
    }
  }

  /**
   * Evaluate achievement requirements against user stats
   */
  private async evaluateRequirements(
    userId: string, 
    achievement: Achievement, 
    userStats: UserStats
  ): Promise<AchievementProgress> {
    let totalProgress = 0;
    let totalRequirements = achievement.requirements.length;

    for (const requirement of achievement.requirements) {
      const value = await this.getMetricValue(userId, requirement, userStats);
      const targetValue = Array.isArray(requirement.value) ? requirement.value[1] : requirement.value;
      
      let requirementMet = false;
      
      switch (requirement.operator) {
        case 'eq':
          requirementMet = value === requirement.value;
          break;
        case 'gt':
          requirementMet = value > (requirement.value as number);
          break;
        case 'gte':
          requirementMet = value >= (requirement.value as number);
          break;
        case 'lt':
          requirementMet = value < (requirement.value as number);
          break;
        case 'lte':
          requirementMet = value <= (requirement.value as number);
          break;
        case 'between':
          if (Array.isArray(requirement.value)) {
            requirementMet = value >= requirement.value[0] && value <= requirement.value[1];
          }
          break;
      }

      if (requirementMet) {
        totalProgress++;
      }
    }

    const percentage = (totalProgress / totalRequirements) * 100;
    
    return {
      achievementId: achievement.id,
      currentValue: totalProgress,
      targetValue: totalRequirements,
      percentage,
      isCompleted: percentage === 100
    };
  }

  /**
   * Get metric value for requirement evaluation
   */
  private async getMetricValue(
    userId: string, 
    requirement: { type: RequirementType; metric: string; timeframe?: TimeframeType }, 
    userStats: UserStats
  ): Promise<number> {
    const { type, metric, timeframe } = requirement;
    
    // For real-time metrics, query the database with timeframe
    if (timeframe && timeframe !== TimeframeType.ALL_TIME) {
      return await this.getTimeframedMetric(userId, type, timeframe);
    }

    // Use cached user stats for all-time metrics
    switch (type) {
      case RequirementType.TASKS_COMPLETED:
        return userStats.achievementsUnlocked; // Placeholder - would map to actual tasks
      case RequirementType.POINTS_EARNED:
        return userStats.totalPoints;
      case RequirementType.CONSECUTIVE_DAYS:
        return userStats.currentStreak;
      case RequirementType.COMPETITIONS_WON:
        return userStats.competitionsWon;
      default:
        return 0;
    }
  }

  /**
   * Get timeframed metric from database
   */
  private async getTimeframedMetric(
    userId: string, 
    type: RequirementType, 
    timeframe: TimeframeType
  ): Promise<number> {
    const timeframeQueries = {
      [TimeframeType.DAY]: "AND created_at >= NOW() - INTERVAL '1 day'",
      [TimeframeType.WEEK]: "AND created_at >= NOW() - INTERVAL '1 week'",
      [TimeframeType.MONTH]: "AND created_at >= NOW() - INTERVAL '1 month'",
      [TimeframeType.QUARTER]: "AND created_at >= NOW() - INTERVAL '3 months'",
      [TimeframeType.YEAR]: "AND created_at >= NOW() - INTERVAL '1 year'"
    };

    const timeQuery = timeframeQueries[timeframe];
    if (!timeQuery) return 0;

    try {
      let query = '';
      
      switch (type) {
        case RequirementType.TASKS_COMPLETED:
          query = `SELECT COUNT(*) as count FROM tasks WHERE user_id = '${userId}' ${timeQuery}`;
          break;
        case RequirementType.PROJECTS_FINISHED:
          query = `SELECT COUNT(*) as count FROM projects WHERE assigned_to = '${userId}' AND status = 'completed' ${timeQuery}`;
          break;
        default:
          return 0;
      }

      const { data, error } = await supabase.rpc('execute_sql', { sql: query });
      if (error) throw error;
      
      return data?.[0]?.count || 0;
    } catch (error) {
      console.error('Error getting timeframed metric:', error);
      return 0;
    }
  }

  /**
   * Unlock achievement for user
   */
  async unlockAchievement(userId: string, achievementId: string): Promise<void> {
    try {
      const achievement = this.achievements.get(achievementId);
      if (!achievement) return;

      // Create user achievement record
      const userAchievement: UserAchievement = {
        id: crypto.randomUUID(),
        userId,
        achievementId,
        unlockedAt: new Date(),
        progress: 100,
        isCompleted: true,
        notificationSent: false
      };

      // Save to database
      const { error } = await supabase
        .from('user_achievements')
        .insert(userAchievement);

      if (error) throw error;

      // Update user stats
      await this.updateUserPoints(userId, achievement.points);

      // Send notification
      await this.sendAchievementNotification(userId, achievement);

      // Update local cache
      const userAchievements = this.userAchievements.get(userId) || [];
      userAchievements.push(userAchievement);
      this.userAchievements.set(userId, userAchievements);

      // Emit event
      this.emitEvent({
        type: 'achievement_unlocked',
        userId,
        achievement,
        timestamp: new Date()
      });

      console.log(`🏆 Achievement unlocked: ${achievement.title} for user ${userId}`);
    } catch (error) {
      console.error('Error unlocking achievement:', error);
    }
  }

  /**
   * Update user points and level
   */
  private async updateUserPoints(userId: string, points: number): Promise<void> {
    try {
      const { data, error } = await supabase.rpc('update_user_points', {
        user_id: userId,
        points_to_add: points
      });

      if (error) throw error;

      // Check for level up
      const userStats = await this.getUserStats(userId);
      const newLevel = this.calculateLevel(userStats.totalPoints + points);
      
      if (newLevel > userStats.level) {
        await this.handleLevelUp(userId, newLevel);
      }
    } catch (error) {
      console.error('Error updating user points:', error);
    }
  }

  /**
   * Calculate user level based on points
   */
  private calculateLevel(points: number): number {
    const levelThresholds = [0, 100, 300, 600, 1000, 1500, 2100, 2800, 3600, 4500, 5500];
    
    for (let i = levelThresholds.length - 1; i >= 0; i--) {
      if (points >= levelThresholds[i]) {
        return i + 1;
      }
    }
    
    return 1;
  }

  /**
   * Handle level up event
   */
  private async handleLevelUp(userId: string, newLevel: number): Promise<void> {
    try {
      // Update user level in database
      await supabase
        .from('user_stats')
        .update({ level: newLevel })
        .eq('user_id', userId);

      // Send level up notification
      await this.sendNotification(userId, {
        type: NotificationType.LEVEL_UP,
        title: 'Level Up!',
        message: `Congratulations! You've reached level ${newLevel}!`,
        icon: '🎉',
        color: '#10B981'
      });

      // Emit event
      this.emitEvent({
        type: 'level_up',
        userId,
        level: newLevel,
        timestamp: new Date()
      });
    } catch (error) {
      console.error('Error handling level up:', error);
    }
  }

  /**
   * Send achievement notification
   */
  private async sendAchievementNotification(userId: string, achievement: Achievement): Promise<void> {
    await this.sendNotification(userId, {
      type: NotificationType.ACHIEVEMENT_UNLOCKED,
      title: 'Achievement Unlocked!',
      message: `You've earned "${achievement.title}"!`,
      icon: achievement.icon,
      color: achievement.color,
      data: { achievementId: achievement.id }
    });
  }

  /**
   * Send notification to user
   */
  private async sendNotification(userId: string, notification: Partial<Notification>): Promise<void> {
    try {
      const fullNotification: Notification = {
        id: crypto.randomUUID(),
        userId,
        isRead: false,
        createdAt: new Date(),
        ...notification
      } as Notification;

      const { error } = await supabase
        .from('notifications')
        .insert(fullNotification);

      if (error) throw error;
    } catch (error) {
      console.error('Error sending notification:', error);
    }
  }

  /**
   * Get user achievements
   */
  async getUserAchievements(userId: string): Promise<UserAchievement[]> {
    try {
      const { data, error } = await supabase
        .from('user_achievements')
        .select('*')
        .eq('user_id', userId);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error getting user achievements:', error);
      return [];
    }
  }

  /**
   * Get user stats
   */
  async getUserStats(userId: string): Promise<UserStats> {
    try {
      const { data, error } = await supabase
        .from('user_stats')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      
      if (!data) {
        // Create initial stats
        const initialStats: UserStats = {
          userId,
          totalPoints: 0,
          level: 1,
          experiencePoints: 0,
          nextLevelXP: 100,
          achievementsUnlocked: 0,
          competitionsWon: 0,
          competitionsParticipated: 0,
          currentStreak: 0,
          longestStreak: 0,
          rank: 0,
          badges: [],
          weeklyPoints: 0,
          monthlyPoints: 0
        };

        await supabase.from('user_stats').insert(initialStats);
        return initialStats;
      }

      return data as UserStats;
    } catch (error) {
      console.error('Error getting user stats:', error);
      throw error;
    }
  }

  /**
   * Get achievement progress for user
   */
  async getAchievementProgress(userId: string): Promise<AchievementProgress[]> {
    try {
      const userStats = await this.getUserStats(userId);
      const userAchievements = await this.getUserAchievements(userId);
      const unlockedIds = new Set(userAchievements.map(ua => ua.achievementId));
      
      const progressList: AchievementProgress[] = [];

      for (const [achievementId, achievement] of this.achievements) {
        if (unlockedIds.has(achievementId)) {
          progressList.push({
            achievementId,
            currentValue: 100,
            targetValue: 100,
            percentage: 100,
            isCompleted: true
          });
        } else {
          const progress = await this.evaluateRequirements(userId, achievement, userStats);
          progressList.push(progress);
        }
      }

      return progressList;
    } catch (error) {
      console.error('Error getting achievement progress:', error);
      return [];
    }
  }

  /**
   * Get all achievements
   */
  getAllAchievements(): Achievement[] {
    return Array.from(this.achievements.values());
  }

  /**
   * Get achievements by category
   */
  getAchievementsByCategory(category: AchievementCategory): Achievement[] {
    return Array.from(this.achievements.values())
      .filter(achievement => achievement.category === category);
  }

  /**
   * Add event listener
   */
  addEventListener(listener: (event: AchievementEvent) => void): void {
    this.listeners.add(listener);
  }

  /**
   * Remove event listener
   */
  removeEventListener(listener: (event: AchievementEvent) => void): void {
    this.listeners.delete(listener);
  }

  /**
   * Emit event to all listeners
   */
  private emitEvent(event: AchievementEvent): void {
    this.listeners.forEach(listener => {
      try {
        listener(event);
      } catch (error) {
        console.error('Error in achievement event listener:', error);
      }
    });
  }

  // Helper methods for common actions
  private async handleTaskCompletion(task: any): Promise<void> {
    if (task.user_id) {
      await this.recordUserAction(task.user_id, {
        type: 'task_completed',
        data: task
      });
    }
  }

  private async handleStatsUpdate(stats: any): Promise<void> {
    if (stats.user_id) {
      await this.checkAchievementProgress(stats.user_id);
    }
  }

  private async updateUserStats(userId: string, action: UserAction): Promise<void> {
    // Implementation depends on action type
    // This would update relevant stats in the database
  }

  private async updateAchievementProgress(
    userId: string, 
    achievementId: string, 
    progress: AchievementProgress
  ): Promise<void> {
    // Store progress tracking data
    try {
      await supabase
        .from('achievement_progress')
        .upsert({
          user_id: userId,
          achievement_id: achievementId,
          progress: progress.percentage,
          updated_at: new Date()
        });
    } catch (error) {
      console.error('Error updating achievement progress:', error);
    }
  }

  private async evaluateAllUsersProgress(): Promise<void> {
    // Periodic evaluation of all users' progress
    // This would be optimized for batch processing
  }
}

// Types for the engine
interface UserAction {
  type: string;
  data?: any;
  timestamp?: Date;
}

interface AchievementEvent {
  type: 'achievement_unlocked' | 'level_up' | 'action_recorded';
  userId: string;
  achievement?: Achievement;
  level?: number;
  action?: UserAction;
  timestamp: Date;
}

// Export singleton instance
export const achievementsEngine = new AchievementsEngine();
export default achievementsEngine;