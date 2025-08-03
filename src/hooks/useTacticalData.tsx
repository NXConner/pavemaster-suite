import { useState, useEffect } from 'react';
import { commandService, type TacticalAlert, type MissionStatus } from '../services/tactical/commandService';
import { apiService } from '../services/api/apiService';

export function useTacticalData() {
  const [alerts, setAlerts] = useState<TacticalAlert[]>([]);
  const [missions, setMissions] = useState<MissionStatus[]>([]);
  const [metrics, setMetrics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadInitialData();
    setupRealTimeSubscriptions();
  }, []);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      
      const [alertsData, missionsData, metricsResponse] = await Promise.all([
        commandService.getActiveAlerts(),
        commandService.getMissionStatus(),
        apiService.getDashboardMetrics()
      ]);

      setAlerts(alertsData);
      setMissions(missionsData);
      
      if (metricsResponse.status === 'success') {
        setMetrics(metricsResponse.data);
      }
      
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load tactical data');
    } finally {
      setLoading(false);
    }
  };

  const setupRealTimeSubscriptions = () => {
    // Subscribe to real-time alerts
    const alertSubscription = commandService.subscribeToAlerts((newAlert) => {
      setAlerts(prev => [newAlert, ...prev]);
    });

    // Subscribe to mission updates
    const missionSubscription = commandService.subscribeToMissionUpdates((updatedMission) => {
      setMissions(prev => prev.map(mission => 
        mission.id === updatedMission.id ? updatedMission : mission
      ));
    });

    return () => {
      alertSubscription.unsubscribe();
      missionSubscription.unsubscribe();
    };
  };

  const acknowledgeAlert = async (alertId: string) => {
    const success = await commandService.acknowledgeAlert(alertId);
    if (success) {
      setAlerts(prev => prev.filter(alert => alert.id !== alertId));
    }
    return success;
  };

  const updateMissionProgress = async (missionId: string, progress: number) => {
    const success = await commandService.updateMissionProgress(missionId, progress);
    if (success) {
      setMissions(prev => prev.map(mission =>
        mission.id === missionId ? { ...mission, progress } : mission
      ));
    }
    return success;
  };

  const refreshData = () => {
    loadInitialData();
  };

  return {
    alerts,
    missions,
    metrics,
    loading,
    error,
    acknowledgeAlert,
    updateMissionProgress,
    refreshData
  };
}