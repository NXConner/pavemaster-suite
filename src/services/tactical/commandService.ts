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
  private mockAlerts: TacticalAlert[] = [
    {
      id: '1',
      type: 'critical',
      message: 'Equipment failure detected on Truck Alpha',
      source: 'equipment',
      timestamp: new Date().toISOString(),
      acknowledged: false,
    },
    {
      id: '2',
      type: 'warning',
      message: 'Weather conditions not optimal for operations',
      source: 'system',
      timestamp: new Date().toISOString(),
      acknowledged: false,
    },
  ];

  private mockMissions: MissionStatus[] = [
    {
      id: '1',
      name: 'Parking Lot Sealcoating - Main Church',
      status: 'active',
      priority: 'high',
      assignedPersonnel: ['crew-1', 'crew-2'],
      location: { lat: 38.9072, lng: -77.0369 },
      progress: 65,
    },
    {
      id: '2',
      name: 'Line Striping - Community Center',
      status: 'planning',
      priority: 'medium',
      assignedPersonnel: ['crew-3'],
      location: { lat: 38.9072, lng: -77.0369 },
      progress: 25,
    },
  ];

  // Mock alert system
  async getActiveAlerts(): Promise<TacticalAlert[]> {
    return new Promise((resolve) => {
      setTimeout(() => { resolve(this.mockAlerts.filter(a => !a.acknowledged)); }, 100);
    });
  }

  async acknowledgeAlert(alertId: string): Promise<boolean> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const alert = this.mockAlerts.find(a => a.id === alertId);
        if (alert) {
          alert.acknowledged = true;
          resolve(true);
        } else {
          resolve(false);
        }
      }, 100);
    });
  }

  // Mock mission tracking
  async getMissionStatus(): Promise<MissionStatus[]> {
    return new Promise((resolve) => {
      setTimeout(() => { resolve(this.mockMissions); }, 100);
    });
  }

  async updateMissionProgress(missionId: string, progress: number): Promise<boolean> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const mission = this.mockMissions.find(m => m.id === missionId);
        if (mission) {
          mission.progress = progress;
          resolve(true);
        } else {
          resolve(false);
        }
      }, 100);
    });
  }

  // Mock personnel tracking
  async getPersonnelStatus(): Promise<any[]> {
    return new Promise((resolve) => {
      setTimeout(() => { resolve([]); }, 100);
    });
  }

  // Mock equipment monitoring
  async getEquipmentStatus(): Promise<any[]> {
    return new Promise((resolve) => {
      setTimeout(() => { resolve([]); }, 100);
    });
  }

  // Mock subscriptions (return dummy subscription objects)
  subscribeToAlerts(_callback: (alert: TacticalAlert) => void) {
    return {
      unsubscribe: () => { console.log('Unsubscribed from alerts'); },
    };
  }

  subscribeToMissionUpdates(_callback: (mission: MissionStatus) => void) {
    return {
      unsubscribe: () => { console.log('Unsubscribed from missions'); },
    };
  }
}

export const commandService = new CommandService();