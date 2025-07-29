import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export interface UserPresence {
  user_id: string;
  email: string;
  status: 'online' | 'away' | 'busy' | 'offline';
  last_seen: string;
  current_page?: string;
  device_type?: 'desktop' | 'mobile' | 'tablet';
}

export function useUserPresence(roomId: string = 'main-workspace') {
  const { user } = useAuth();
  const [presenceState, setPresenceState] = useState<Record<string, UserPresence[]>>({});
  const [onlineUsers, setOnlineUsers] = useState<UserPresence[]>([]);
  const [isTracking, setIsTracking] = useState(false);

  useEffect(() => {
    if (!user) { return; }

    const channel = supabase.channel(roomId);

    // Listen to presence events
    channel
      .on('presence', { event: 'sync' }, () => {
        const newState = channel.presenceState<UserPresence>();
        console.log('Presence sync:', newState);
        setPresenceState(newState);

        // Flatten presence state to get list of online users
        const users = Object.values(newState).flat();
        setOnlineUsers(users);
      })
      .on('presence', { event: 'join' }, ({ key, newPresences }) => {
        console.log('User joined:', key, newPresences);
      })
      .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
        console.log('User left:', key, leftPresences);
      })
      .subscribe(async (status) => {
        console.log('Presence channel status:', status);

        if (status === 'SUBSCRIBED') {
          // Start tracking user presence
          const userPresence: UserPresence = {
            user_id: user.id,
            email: user.email || '',
            status: 'online',
            last_seen: new Date().toISOString(),
            current_page: window.location.pathname,
            device_type: detectDeviceType(),
          };

          const presenceTrackStatus = await channel.track(userPresence);
          console.log('Presence tracking status:', presenceTrackStatus);
          setIsTracking(presenceTrackStatus === 'ok');
        }
      });

    // Update presence when page visibility changes
    const handleVisibilityChange = async () => {
      if (!document.hidden && isTracking) {
        await channel.track({
          user_id: user.id,
          email: user.email || '',
          status: 'online',
          last_seen: new Date().toISOString(),
          current_page: window.location.pathname,
          device_type: detectDeviceType(),
        });
      }
    };

    // Update presence when user navigates
    const handlePageChange = async () => {
      if (isTracking) {
        await channel.track({
          user_id: user.id,
          email: user.email || '',
          status: 'online',
          last_seen: new Date().toISOString(),
          current_page: window.location.pathname,
          device_type: detectDeviceType(),
        });
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('popstate', handlePageChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('popstate', handlePageChange);
      supabase.removeChannel(channel);
      setIsTracking(false);
    };
  }, [user, roomId, isTracking]);

  const updateStatus = async (status: UserPresence['status']) => {
    if (!user || !isTracking) { return; }

    const channel = supabase.channel(roomId);
    await channel.track({
      user_id: user.id,
      email: user.email || '',
      status,
      last_seen: new Date().toISOString(),
      current_page: window.location.pathname,
      device_type: detectDeviceType(),
    });
  };

  return {
    presenceState,
    onlineUsers,
    isTracking,
    updateStatus,
    totalOnlineUsers: onlineUsers.length,
  };
}

function detectDeviceType(): 'desktop' | 'mobile' | 'tablet' {
  const userAgent = navigator.userAgent;

  if (/tablet|ipad/i.test(userAgent)) {
    return 'tablet';
  }

  if (/mobile|iphone|android/i.test(userAgent)) {
    return 'mobile';
  }

  return 'desktop';
}