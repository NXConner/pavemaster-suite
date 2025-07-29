import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface RealtimeUpdate {
  id: string;
  table: string;
  eventType: 'INSERT' | 'UPDATE' | 'DELETE';
  new: any;
  old: any;
  timestamp: Date;
}

export function useRealtimeUpdates() {
  const { user } = useAuth();
  const [updates, setUpdates] = useState<RealtimeUpdate[]>([]);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!user) { return; }

    // Create a channel for real-time updates
    const channel = supabase
      .channel('database-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'projects',
        },
        (payload) => {
          console.log('Projects change received:', payload);
          const update: RealtimeUpdate = {
            id: crypto.randomUUID(),
            table: 'projects',
            eventType: payload.eventType as 'INSERT' | 'UPDATE' | 'DELETE',
            new: payload.new,
            old: payload.old,
            timestamp: new Date(),
          };
          setUpdates(prev => [update, ...prev.slice(0, 49)]); // Keep last 50 updates
        },
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'gps_locations',
        },
        (payload) => {
          console.log('GPS location change received:', payload);
          const update: RealtimeUpdate = {
            id: crypto.randomUUID(),
            table: 'gps_locations',
            eventType: payload.eventType as 'INSERT' | 'UPDATE' | 'DELETE',
            new: payload.new,
            old: payload.old,
            timestamp: new Date(),
          };
          setUpdates(prev => [update, ...prev.slice(0, 49)]);
        },
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'devices',
        },
        (payload) => {
          console.log('Device change received:', payload);
          const update: RealtimeUpdate = {
            id: crypto.randomUUID(),
            table: 'devices',
            eventType: payload.eventType as 'INSERT' | 'UPDATE' | 'DELETE',
            new: payload.new,
            old: payload.old,
            timestamp: new Date(),
          };
          setUpdates(prev => [update, ...prev.slice(0, 49)]);
        },
      )
      .subscribe((status) => {
        console.log('Realtime subscription status:', status);
        setIsConnected(status === 'SUBSCRIBED');
      });

    return () => {
      console.log('Unsubscribing from realtime updates');
      supabase.removeChannel(channel);
      setIsConnected(false);
    };
  }, [user]);

  const clearUpdates = () => { setUpdates([]); };

  return {
    updates,
    isConnected,
    clearUpdates,
  };
}