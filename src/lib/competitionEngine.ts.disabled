/**
 * Competition Engine
 * Manages friendly competitions, leaderboards, and team challenges
 */

import { supabase } from '@/integrations/supabase/client';
import { achievementsEngine } from './achievementsEngine';
import {
  Competition,
  CompetitionType,
  CompetitionCategory,
  CompetitionStatus,
  LeaderboardEntry,
  Team,
  TeamMember,
  TeamRole,
  CompetitionParticipant,
  WeeklyChallenge,
  LeaderboardFilter,
  TimeframeType,
  NotificationType
} from '@/types/achievements';

class CompetitionEngine {
  private competitions: Map<string, Competition> = new Map();
  private teams: Map<string, Team> = new Map();
  private leaderboards: Map<string, LeaderboardEntry[]> = new Map();
  private listeners: Set<(event: CompetitionEvent) => void> = new Set();

  constructor() {
    this.initializeCompetitions();
    this.startCompetitionTracking();
  }

  /**
   * Initialize default competitions and challenges
   */
  private initializeCompetitions(): void {
    // Create sample weekly challenges
    this.createWeeklyChallenge({
      title: 'Task Master Challenge',
      description: 'Complete the most tasks this week',
      targetMetric: 'tasks_completed',
      targetValue: 20,
      pointsReward: 500
    });

    this.createWeeklyChallenge({
      title: 'Safety First',
      description: 'Maintain 100% safety score all week',
      targetMetric: 'safety_score',
      targetValue: 100,
      pointsReward: 750
    });

    this.createWeeklyChallenge({
      title: 'Team Player',
      description: 'Collaborate on 5 different projects',
      targetMetric: 'collaborations',
      targetValue: 5,
      pointsReward: 400
    });
  }

  /**
   * Start tracking competitions and updating leaderboards
   */
  private startCompetitionTracking(): void {
    // Update leaderboards every 5 minutes
    setInterval(() => {
      this.updateAllLeaderboards();
    }, 300000);

    // Check for competition status changes every minute
    setInterval(() => {
      this.checkCompetitionStatus();
    }, 60000);

    // Setup real-time listeners
    this.setupRealtimeListeners();
  }

  /**
   * Setup real-time listeners for competition updates
   */
  private setupRealtimeListeners(): void {
    supabase
      .channel('competition-tracking')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'competitions' },
        (payload) => this.handleCompetitionChange(payload)
      )
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'teams' },
        (payload) => this.handleTeamChange(payload)
      )
      .subscribe();
  }

  /**
   * Create a new competition
   */
  async createCompetition(competitionData: Partial<Competition>): Promise<Competition> {
    try {
      const competition: Competition = {
        id: crypto.randomUUID(),
        title: competitionData.title || 'New Competition',
        description: competitionData.description || '',
        type: competitionData.type || CompetitionType.INDIVIDUAL,
        category: competitionData.category || CompetitionCategory.PRODUCTIVITY,
        startDate: competitionData.startDate || new Date(),
        endDate: competitionData.endDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        status: CompetitionStatus.DRAFT,
        participants: [],
        rules: competitionData.rules || [],
        prizes: competitionData.prizes || [],
        leaderboard: [],
        settings: {
          autoJoin: false,
          showLiveUpdates: true,
          allowTeamChat: true,
          notificationFrequency: 'real-time',
          ...competitionData.settings
        },
        createdBy: competitionData.createdBy || '',
        teamBased: competitionData.type === CompetitionType.TEAM
      };

      // Save to database
      const { data, error } = await supabase
        .from('competitions')
        .insert(competition)
        .select()
        .single();

      if (error) throw error;

      // Cache competition
      this.competitions.set(competition.id, competition);

      // Emit event
      this.emitEvent({
        type: 'competition_created',
        competitionId: competition.id,
        competition,
        timestamp: new Date()
      });

      return competition;
    } catch (error) {
      console.error('Error creating competition:', error);
      throw error;
    }
  }

  /**
   * Create weekly challenge
   */
  async createWeeklyChallenge(challengeData: {
    title: string;
    description: string;
    targetMetric: string;
    targetValue: number;
    pointsReward: number;
  }): Promise<WeeklyChallenge> {
    try {
      const startDate = new Date();
      startDate.setHours(0, 0, 0, 0);
      
      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + 7);

      const challenge: WeeklyChallenge = {
        id: crypto.randomUUID(),
        title: challengeData.title,
        description: challengeData.description,
        startDate,
        endDate,
        targetMetric: challengeData.targetMetric,
        targetValue: challengeData.targetValue,
        pointsReward: challengeData.pointsReward,
        participants: [],
        isActive: true
      };

      // Save to database
      const { data, error } = await supabase
        .from('weekly_challenges')
        .insert(challenge)
        .select()
        .single();

      if (error) throw error;

      return challenge;
    } catch (error) {
      console.error('Error creating weekly challenge:', error);
      throw error;
    }
  }

  /**
   * Join competition
   */
  async joinCompetition(competitionId: string, userId: string, teamId?: string): Promise<void> {
    try {
      const competition = await this.getCompetition(competitionId);
      if (!competition) throw new Error('Competition not found');

      // Check if already participating
      const existingParticipant = competition.participants.find(p => p.userId === userId);
      if (existingParticipant) {
        throw new Error('User already participating in this competition');
      }

      // Check competition capacity
      if (competition.settings.maxParticipants && 
          competition.participants.length >= competition.settings.maxParticipants) {
        throw new Error('Competition is full');
      }

      const participant: CompetitionParticipant = {
        userId,
        teamId,
        joinedAt: new Date(),
        currentScore: 0,
        currentRank: competition.participants.length + 1,
        isActive: true
      };

      // Add participant to competition
      competition.participants.push(participant);

      // Update database
      const { error } = await supabase
        .from('competitions')
        .update({ participants: competition.participants })
        .eq('id', competitionId);

      if (error) throw error;

      // Update leaderboard
      await this.updateLeaderboard(competitionId);

      // Send notification
      await this.sendNotification(userId, {
        type: NotificationType.COMPETITION_STARTED,
        title: 'Competition Joined!',
        message: `You've joined "${competition.title}"`,
        icon: '🏆'
      });

      // Emit event
      this.emitEvent({
        type: 'participant_joined',
        competitionId,
        userId,
        teamId,
        timestamp: new Date()
      });
    } catch (error) {
      console.error('Error joining competition:', error);
      throw error;
    }
  }

  /**
   * Create team
   */
  async createTeam(teamData: {
    name: string;
    description: string;
    color: string;
    captainId: string;
  }): Promise<Team> {
    try {
      const team: Team = {
        id: crypto.randomUUID(),
        name: teamData.name,
        description: teamData.description,
        color: teamData.color,
        members: [{
          userId: teamData.captainId,
          role: TeamRole.CAPTAIN,
          joinedAt: new Date(),
          contribution: 0,
          isActive: true
        }],
        captain: teamData.captainId,
        stats: {
          totalPoints: 0,
          averagePoints: 0,
          achievementsCount: 0,
          competitionsWon: 0,
          competitionsParticipated: 0,
          currentStreak: 0,
          longestStreak: 0
        },
        createdAt: new Date()
      };

      // Save to database
      const { data, error } = await supabase
        .from('teams')
        .insert(team)
        .select()
        .single();

      if (error) throw error;

      // Cache team
      this.teams.set(team.id, team);

      return team;
    } catch (error) {
      console.error('Error creating team:', error);
      throw error;
    }
  }

  /**
   * Join team
   */
  async joinTeam(teamId: string, userId: string): Promise<void> {
    try {
      const team = this.teams.get(teamId);
      if (!team) throw new Error('Team not found');

      // Check if already a member
      const existingMember = team.members.find(m => m.userId === userId);
      if (existingMember) {
        throw new Error('User already a team member');
      }

      const newMember: TeamMember = {
        userId,
        role: TeamRole.MEMBER,
        joinedAt: new Date(),
        contribution: 0,
        isActive: true
      };

      team.members.push(newMember);

      // Update database
      const { error } = await supabase
        .from('teams')
        .update({ members: team.members })
        .eq('id', teamId);

      if (error) throw error;

      // Send notification to team captain
      await this.sendNotification(team.captain, {
        type: NotificationType.TEAM_INVITATION,
        title: 'New Team Member',
        message: `A new member has joined ${team.name}`,
        icon: '👥'
      });
    } catch (error) {
      console.error('Error joining team:', error);
      throw error;
    }
  }

  /**
   * Update competition score for participant
   */
  async updateParticipantScore(
    competitionId: string, 
    userId: string, 
    scoreChange: number,
    reason?: string
  ): Promise<void> {
    try {
      const competition = this.competitions.get(competitionId);
      if (!competition || competition.status !== CompetitionStatus.ACTIVE) return;

      const participant = competition.participants.find(p => p.userId === userId);
      if (!participant) return;

      // Update score
      participant.currentScore += scoreChange;

      // Update database
      await supabase
        .from('competitions')
        .update({ participants: competition.participants })
        .eq('id', competitionId);

      // Update leaderboard
      await this.updateLeaderboard(competitionId);

      // Check for achievements
      await achievementsEngine.recordUserAction(userId, {
        type: 'competition_score_updated',
        data: { competitionId, scoreChange, reason }
      });

    } catch (error) {
      console.error('Error updating participant score:', error);
    }
  }

  /**
   * Update leaderboard for competition
   */
  async updateLeaderboard(competitionId: string): Promise<void> {
    try {
      const competition = this.competitions.get(competitionId);
      if (!competition) return;

      // Sort participants by score
      const sortedParticipants = [...competition.participants]
        .sort((a, b) => b.currentScore - a.currentScore);

      const leaderboard: LeaderboardEntry[] = sortedParticipants.map((participant, index) => {
        const previousRank = participant.currentRank;
        const newRank = index + 1;
        const change = previousRank - newRank;

        // Update participant rank
        participant.currentRank = newRank;

        return {
          userId: participant.userId,
          teamId: participant.teamId,
          score: participant.currentScore,
          rank: newRank,
          change,
          achievements: [], // Would be populated with achievements earned during competition
          lastUpdated: new Date()
        };
      });

      // Update competition leaderboard
      competition.leaderboard = leaderboard;
      this.leaderboards.set(competitionId, leaderboard);

      // Save to database
      await supabase
        .from('competitions')
        .update({ 
          participants: competition.participants,
          leaderboard 
        })
        .eq('id', competitionId);

      // Emit leaderboard update event
      this.emitEvent({
        type: 'leaderboard_updated',
        competitionId,
        leaderboard,
        timestamp: new Date()
      });

    } catch (error) {
      console.error('Error updating leaderboard:', error);
    }
  }

  /**
   * Get global leaderboard with filters
   */
  async getGlobalLeaderboard(filter: LeaderboardFilter): Promise<LeaderboardEntry[]> {
    try {
      let query = supabase
        .from('user_stats')
        .select(`
          user_id,
          total_points,
          level,
          weekly_points,
          monthly_points,
          achievements_unlocked,
          current_streak
        `);

      // Apply filters
      if (filter.department) {
        // Would join with user profiles to filter by department
      }

      if (filter.team) {
        // Would join with team members to filter by team
      }

      // Order by appropriate metric based on timeframe
      let orderColumn = 'total_points';
      switch (filter.timeframe) {
        case TimeframeType.WEEK:
          orderColumn = 'weekly_points';
          break;
        case TimeframeType.MONTH:
          orderColumn = 'monthly_points';
          break;
      }

      query = query.order(orderColumn, { ascending: false }).limit(filter.limit);

      const { data, error } = await query;
      if (error) throw error;

      // Transform to leaderboard entries
      const leaderboard: LeaderboardEntry[] = (data || []).map((user, index) => ({
        userId: user.user_id,
        score: user[orderColumn] || 0,
        rank: index + 1,
        change: 0, // Would calculate from previous rankings
        achievements: [],
        lastUpdated: new Date()
      }));

      return leaderboard;
    } catch (error) {
      console.error('Error getting global leaderboard:', error);
      return [];
    }
  }

  /**
   * Get active competitions for user
   */
  async getActiveCompetitions(userId: string): Promise<Competition[]> {
    try {
      const { data, error } = await supabase
        .from('competitions')
        .select('*')
        .eq('status', CompetitionStatus.ACTIVE)
        .contains('participants', [{ userId }]);

      if (error) throw error;

      return data || [];
    } catch (error) {
      console.error('Error getting active competitions:', error);
      return [];
    }
  }

  /**
   * Get competition by ID
   */
  async getCompetition(competitionId: string): Promise<Competition | null> {
    try {
      // Check cache first
      const cached = this.competitions.get(competitionId);
      if (cached) return cached;

      // Fetch from database
      const { data, error } = await supabase
        .from('competitions')
        .select('*')
        .eq('id', competitionId)
        .single();

      if (error) throw error;

      const competition = data as Competition;
      this.competitions.set(competitionId, competition);
      
      return competition;
    } catch (error) {
      console.error('Error getting competition:', error);
      return null;
    }
  }

  /**
   * Start competition
   */
  async startCompetition(competitionId: string): Promise<void> {
    try {
      const competition = await this.getCompetition(competitionId);
      if (!competition) throw new Error('Competition not found');

      competition.status = CompetitionStatus.ACTIVE;
      competition.startDate = new Date();

      // Update database
      await supabase
        .from('competitions')
        .update({ 
          status: competition.status,
          start_date: competition.startDate
        })
        .eq('id', competitionId);

      // Notify all participants
      for (const participant of competition.participants) {
        await this.sendNotification(participant.userId, {
          type: NotificationType.COMPETITION_STARTED,
          title: 'Competition Started!',
          message: `"${competition.title}" has begun!`,
          icon: '🚀'
        });
      }

      // Emit event
      this.emitEvent({
        type: 'competition_started',
        competitionId,
        competition,
        timestamp: new Date()
      });
    } catch (error) {
      console.error('Error starting competition:', error);
      throw error;
    }
  }

  /**
   * End competition and calculate winners
   */
  async endCompetition(competitionId: string): Promise<void> {
    try {
      const competition = await this.getCompetition(competitionId);
      if (!competition) throw new Error('Competition not found');

      competition.status = CompetitionStatus.COMPLETED;
      competition.endDate = new Date();

      // Update final leaderboard
      await this.updateLeaderboard(competitionId);

      // Award prizes to winners
      await this.awardPrizes(competition);

      // Update database
      await supabase
        .from('competitions')
        .update({ 
          status: competition.status,
          end_date: competition.endDate
        })
        .eq('id', competitionId);

      // Notify participants of results
      for (const participant of competition.participants) {
        const rank = participant.currentRank;
        const prize = competition.prizes.find(p => p.rank === rank);

        await this.sendNotification(participant.userId, {
          type: NotificationType.COMPETITION_ENDED,
          title: 'Competition Complete!',
          message: prize 
            ? `You finished #${rank} and won: ${prize.title}!`
            : `You finished #${rank}. Great effort!`,
          icon: rank <= 3 ? '🏆' : '👏'
        });
      }

      // Emit event
      this.emitEvent({
        type: 'competition_ended',
        competitionId,
        competition,
        timestamp: new Date()
      });
    } catch (error) {
      console.error('Error ending competition:', error);
      throw error;
    }
  }

  /**
   * Award prizes to competition winners
   */
  private async awardPrizes(competition: Competition): Promise<void> {
    try {
      for (const prize of competition.prizes) {
        const winner = competition.participants.find(p => p.currentRank === prize.rank);
        if (!winner) continue;

        // Award points
        if (prize.points > 0) {
          await achievementsEngine.recordUserAction(winner.userId, {
            type: 'competition_prize_won',
            data: { 
              competitionId: competition.id,
              rank: prize.rank,
              points: prize.points,
              prize: prize.title
            }
          });
        }

        // Award badge if specified
        if (prize.badge) {
          // Implementation would depend on badge system
        }
      }
    } catch (error) {
      console.error('Error awarding prizes:', error);
    }
  }

  /**
   * Check competition status and update as needed
   */
  private async checkCompetitionStatus(): Promise<void> {
    try {
      const { data: competitions, error } = await supabase
        .from('competitions')
        .select('*')
        .in('status', [CompetitionStatus.UPCOMING, CompetitionStatus.ACTIVE]);

      if (error) throw error;

      const now = new Date();

      for (const comp of competitions || []) {
        const competition = comp as Competition;
        
        // Check if upcoming competition should start
        if (competition.status === CompetitionStatus.UPCOMING && 
            new Date(competition.startDate) <= now) {
          await this.startCompetition(competition.id);
        }
        
        // Check if active competition should end
        if (competition.status === CompetitionStatus.ACTIVE && 
            new Date(competition.endDate) <= now) {
          await this.endCompetition(competition.id);
        }
      }
    } catch (error) {
      console.error('Error checking competition status:', error);
    }
  }

  /**
   * Update all leaderboards
   */
  private async updateAllLeaderboards(): Promise<void> {
    try {
      const activeCompetitions = Array.from(this.competitions.values())
        .filter(comp => comp.status === CompetitionStatus.ACTIVE);

      for (const competition of activeCompetitions) {
        await this.updateLeaderboard(competition.id);
      }
    } catch (error) {
      console.error('Error updating all leaderboards:', error);
    }
  }

  /**
   * Send notification
   */
  private async sendNotification(userId: string, notification: any): Promise<void> {
    try {
      const fullNotification = {
        id: crypto.randomUUID(),
        user_id: userId,
        is_read: false,
        created_at: new Date(),
        ...notification
      };

      await supabase.from('notifications').insert(fullNotification);
    } catch (error) {
      console.error('Error sending notification:', error);
    }
  }

  /**
   * Handle competition changes from realtime
   */
  private handleCompetitionChange(payload: any): void {
    const competition = payload.new as Competition;
    if (competition) {
      this.competitions.set(competition.id, competition);
    }
  }

  /**
   * Handle team changes from realtime
   */
  private handleTeamChange(payload: any): void {
    const team = payload.new as Team;
    if (team) {
      this.teams.set(team.id, team);
    }
  }

  /**
   * Add event listener
   */
  addEventListener(listener: (event: CompetitionEvent) => void): void {
    this.listeners.add(listener);
  }

  /**
   * Remove event listener
   */
  removeEventListener(listener: (event: CompetitionEvent) => void): void {
    this.listeners.delete(listener);
  }

  /**
   * Emit event to all listeners
   */
  private emitEvent(event: CompetitionEvent): void {
    this.listeners.forEach(listener => {
      try {
        listener(event);
      } catch (error) {
        console.error('Error in competition event listener:', error);
      }
    });
  }
}

// Competition event types
interface CompetitionEvent {
  type: 'competition_created' | 'competition_started' | 'competition_ended' | 
        'participant_joined' | 'leaderboard_updated' | 'team_created';
  competitionId?: string;
  competition?: Competition;
  userId?: string;
  teamId?: string;
  leaderboard?: LeaderboardEntry[];
  timestamp: Date;
}

// Export singleton instance
export const competitionEngine = new CompetitionEngine();
export default competitionEngine;