import { supabase } from '../../integrations/supabase/client';

export interface TacticalAlert {
  id: string;
  type: 'critical' | 'warning' | 'info';
  message: string;
  source: 'equipment' | 'personnel' | 'mission' | 'system';
  timestamp: string;
  acknowledged: boolean;
}

export interface MissionStatus {
  id: string;
  name: string;
  status: 'planning' | 'active' | 'completed' | 'on-hold';
  priority: 'low' | 'medium' | 'high' | 'critical';
  assignedPersonnel: string[];
  location: { lat: number; lng: number };
  progress: number;
}

export class CommandService {
  // Real-time alert system
  async getActiveAlerts(): Promise<TacticalAlert[]> {
    try {
      const { data, error } = await supabase
        .from('tactical_alerts')
        .select('*')
        .eq('acknowledged', false)
        .order('timestamp', { ascending: false });
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Failed to fetch alerts:', error);
      return [];
    }
  }

  async acknowledgeAlert(alertId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('tactical_alerts')
        .update({ acknowledged: true })
        .eq('id', alertId);
      
      return !error;
    } catch (error) {
      console.error('Failed to acknowledge alert:', error);
      return false;
    }
  }

  // Mission tracking
  async getMissionStatus(): Promise<MissionStatus[]> {
    try {
      const { data, error } = await supabase
        .from('missions')
        .select('*')
        .order('priority', { ascending: false });
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Failed to fetch mission status:', error);
      return [];
    }
  }

  async updateMissionProgress(missionId: string, progress: number): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('missions')
        .update({ progress, updated_at: new Date().toISOString() })
        .eq('id', missionId);
      
      return !error;
    } catch (error) {
      console.error('Failed to update mission progress:', error);
      return false;
    }
  }

  // Personnel tracking
  async getPersonnelStatus(): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('personnel_status')
        .select('*')
        .order('last_update', { ascending: false });
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Failed to fetch personnel status:', error);
      return [];
    }
  }

  // Equipment monitoring
  async getEquipmentStatus(): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('equipment_status')
        .select('*')
        .order('last_maintenance', { ascending: true });
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Failed to fetch equipment status:', error);
      return [];
    }
  }

  // Real-time subscriptions
  subscribeToAlerts(callback: (alert: TacticalAlert) => void) {
    return supabase
      .channel('tactical_alerts')
      .on('postgres_changes', 
        { event: 'INSERT', schema: 'public', table: 'tactical_alerts' },
        (payload) => callback(payload.new as TacticalAlert)
      )
      .subscribe();
  }

  subscribeToMissionUpdates(callback: (mission: MissionStatus) => void) {
    return supabase
      .channel('mission_updates')
      .on('postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'missions' },
        (payload) => callback(payload.new as MissionStatus)
      )
      .subscribe();
  }
}

export const commandService = new CommandService();