import { useState, useCallback } from 'react';
import { Clock, Users, Database, Wifi, WifiOff, Activity } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { useRealtimeUpdates } from '@/hooks/useRealtimeUpdates';
import { useUserPresence } from '@/hooks/useUserPresence';
import { StatusIndicator } from '@/components/enhanced/StatusIndicator';
import { LoadingSpinner } from '@/components/enhanced/LoadingSpinner';

export function RealtimeDashboard() {
  const { updates, isConnected, clearUpdates } = useRealtimeUpdates();
  const { onlineUsers, isTracking, updateStatus, totalOnlineUsers } = useUserPresence();
  const [selectedTable, setSelectedTable] = useState<string>('all');

  const filteredUpdates = selectedTable === 'all' 
    ? updates 
    : updates.filter(update => update.table === selectedTable);

  const getUpdateIcon = (eventType: string) => {
    switch (eventType) {
      case 'INSERT': return <Activity className="h-4 w-4 text-success" />;
      case 'UPDATE': return <Activity className="h-4 w-4 text-warning" />;
      case 'DELETE': return <Activity className="h-4 w-4 text-destructive" />;
      default: return <Activity className="h-4 w-4" />;
    }
  };

  const getEventColor = (eventType: string) => {
    switch (eventType) {
      case 'INSERT': return 'text-success';
      case 'UPDATE': return 'text-warning';
      case 'DELETE': return 'text-destructive';
      default: return 'text-muted-foreground';
    }
  };

  const formatTimestamp = (timestamp: Date) => {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    if (seconds < 60) return `${seconds}s ago`;
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return timestamp.toLocaleDateString();
  };

  const tableStats = updates.reduce((acc, update) => {
    acc[update.table] = (acc[update.table] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="hover-glow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Realtime Connection</CardTitle>
            {isConnected ? <Wifi className="h-4 w-4 text-success" /> : <WifiOff className="h-4 w-4 text-destructive" />}
          </CardHeader>
          <CardContent>
            <StatusIndicator 
              status={isConnected ? 'online' : 'offline'} 
              label={isConnected ? 'Connected' : 'Disconnected'}
            />
          </CardContent>
        </Card>

        <Card className="hover-glow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Online Users</CardTitle>
            <Users className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalOnlineUsers}</div>
            <p className="text-xs text-muted-foreground">
              {isTracking ? 'Tracking active' : 'Not tracking'}
            </p>
          </CardContent>
        </Card>

        <Card className="hover-glow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Live Updates</CardTitle>
            <Database className="h-4 w-4 text-info" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{updates.length}</div>
            <p className="text-xs text-muted-foreground">
              Last 50 database changes
            </p>
          </CardContent>
        </Card>

        <Card className="hover-glow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Activity</CardTitle>
            <Clock className="h-4 w-4 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {updates.length > 0 ? formatTimestamp(updates[0].timestamp) : 'No activity'}
            </div>
            <p className="text-xs text-muted-foreground">
              Latest update
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Database Updates */}
        <Card className="hover-glow">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-5 w-5" />
                  Database Updates
                </CardTitle>
                <CardDescription>
                  Real-time database changes across all tables
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={clearUpdates}>
                  Clear
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {/* Table Filter */}
            <div className="flex flex-wrap gap-2 mb-4">
              <Badge 
                variant={selectedTable === 'all' ? 'default' : 'secondary'}
                className="cursor-pointer hover-scale"
                onClick={() => { setSelectedTable('all'); }}
              >
                All ({updates.length})
              </Badge>
              {Object.entries(tableStats).map(([table, count]) => (
                <Badge 
                  key={table}
                  variant={selectedTable === table ? 'default' : 'secondary'}
                  className="cursor-pointer hover-scale"
                  onClick={() => { setSelectedTable(table); }}
                >
                  {table} ({count})
                </Badge>
              ))}
            </div>

            <ScrollArea className="h-80">
              {!isConnected ? (
                <div className="flex items-center justify-center h-32">
                  <LoadingSpinner label="Connecting to realtime..." />
                </div>
              ) : filteredUpdates.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Database className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>No database updates yet</p>
                  <p className="text-xs mt-1">Updates will appear here in real-time</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredUpdates.map((update) => (
                    <div 
                      key={update.id}
                      className="p-3 rounded-lg border hover:bg-muted/50 transition-colors animate-slide-up"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          {getUpdateIcon(update.eventType)}
                          <span className="font-medium text-sm">{update.table}</span>
                          <Badge variant="outline" className={getEventColor(update.eventType)}>
                            {update.eventType}
                          </Badge>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {formatTimestamp(update.timestamp)}
                        </span>
                      </div>
                      {update.new && (
                        <div className="text-xs text-muted-foreground">
                          ID: {update.new.id || 'N/A'}
                          {update.new.name && ` • ${update.new.name}`}
                          {update.new.status && ` • Status: ${update.new.status}`}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>

        {/* User Presence */}
        <Card className="hover-glow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              User Presence
            </CardTitle>
            <CardDescription>
              Currently active users in the system
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-80">
              {!isTracking ? (
                <div className="flex items-center justify-center h-32">
                  <LoadingSpinner label="Initializing presence..." />
                </div>
              ) : onlineUsers.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>No users online</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {onlineUsers.map((user) => (
                    <div 
                      key={user.user_id}
                      className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <StatusIndicator 
                          status={user.status === 'online' ? 'online' : 'away'} 
                          size="sm"
                        />
                        <div>
                          <div className="font-medium text-sm">{user.email}</div>
                          <div className="text-xs text-muted-foreground">
                            {user.current_page || 'Unknown page'}
                            {user.device_type && ` • ${user.device_type}`}
                          </div>
                        </div>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {formatTimestamp(new Date(user.last_seen))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}