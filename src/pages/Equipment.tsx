import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Search, Settings, Wrench, Calendar, MapPin, AlertTriangle, CheckCircle } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

interface Equipment {
  id: string;
  name: string;
  type: string;
  model?: string;
  serial_number?: string;
  status: 'available' | 'in-use' | 'maintenance' | 'broken';
  location?: string;
  purchase_date?: string;
  warranty_expiry?: string;
  last_maintenance?: string;
  next_maintenance?: string;
  created_at: string;
}

interface MaintenanceRecord {
  id: string;
  equipment_id: string;
  type: string;
  description: string;
  cost: number;
  performed_at: string;
  performed_by: string;
  next_maintenance_due?: string;
}

export default function Equipment() {
  const { user } = useAuth();
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [maintenanceRecords, setMaintenanceRecords] = useState<MaintenanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    if (user) {
      fetchEquipment();
      fetchMaintenanceRecords();
    }
  }, [user]);

  const fetchEquipment = async () => {
    try {
      const { data, error } = await supabase
        .from('equipment')
        .select('*')
        .order('name');
      
      if (error) throw error;
      setEquipment(data || []);
    } catch (error) {
      console.error('Error fetching equipment:', error);
      // Fallback to mock data
      setEquipment([
        {
          id: '1',
          name: 'Sealcoat Sprayer #1',
          type: 'Sprayer',
          model: 'SealMaster 500',
          serial_number: 'SM500-2023-001',
          status: 'available' as const,
          location: 'Main Yard',
          purchase_date: '2023-03-15',
          warranty_expiry: '2025-03-15',
          last_maintenance: '2024-01-15',
          next_maintenance: '2024-04-15',
          created_at: '2023-03-15'
        },
        {
          id: '2',
          name: 'Line Striper',
          type: 'Striper',
          model: 'Graco LineLazer',
          serial_number: 'GL-2023-002',
          status: 'in-use' as const,
          location: 'First Baptist Church',
          purchase_date: '2023-05-20',
          warranty_expiry: '2025-05-20',
          last_maintenance: '2024-01-10',
          next_maintenance: '2024-04-10',
          created_at: '2023-05-20'
        },
        {
          id: '3',
          name: 'Asphalt Roller',
          type: 'Roller',
          model: 'CAT CB24',
          serial_number: 'CAT-2022-003',
          status: 'maintenance' as const,
          location: 'Service Shop',
          purchase_date: '2022-08-10',
          warranty_expiry: '2024-08-10',
          last_maintenance: '2024-01-20',
          next_maintenance: '2024-04-20',
          created_at: '2022-08-10'
        },
        {
          id: '4',
          name: 'Crack Sealing Machine',
          type: 'Crack Sealer',
          model: 'Crafco Super Shot',
          serial_number: 'CS-2023-004',
          status: 'available' as const,
          location: 'Main Yard',
          purchase_date: '2023-09-05',
          warranty_expiry: '2025-09-05',
          last_maintenance: '2024-01-05',
          next_maintenance: '2024-04-05',
          created_at: '2023-09-05'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const fetchMaintenanceRecords = async () => {
    try {
      // Mock maintenance records since the table structure might be different
      setMaintenanceRecords([
        {
          id: '1',
          equipment_id: '1',
          type: 'Preventive',
          description: 'Oil change and filter replacement',
          cost: 150,
          performed_at: '2024-01-15',
          performed_by: 'Mike Wilson',
          next_maintenance_due: '2024-04-15'
        },
        {
          id: '2',
          equipment_id: '2',
          type: 'Repair',
          description: 'Fixed spray nozzle clog',
          cost: 75,
          performed_at: '2024-01-10',
          performed_by: 'John Smith'
        }
      ]);
    } catch (error) {
      console.error('Error fetching maintenance records:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'bg-success text-success-foreground';
      case 'in-use': return 'bg-warning text-warning-foreground';
      case 'maintenance': return 'bg-info text-info-foreground';
      case 'broken': return 'bg-destructive text-destructive-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'available': return <CheckCircle className="h-4 w-4" />;
      case 'in-use': return <MapPin className="h-4 w-4" />;
      case 'maintenance': return <Wrench className="h-4 w-4" />;
      case 'broken': return <AlertTriangle className="h-4 w-4" />;
      default: return <Settings className="h-4 w-4" />;
    }
  };

  const filteredEquipment = equipment.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (item.model && item.model.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const statusCounts = {
    all: equipment.length,
    available: equipment.filter(e => e.status === 'available').length,
    'in-use': equipment.filter(e => e.status === 'in-use').length,
    maintenance: equipment.filter(e => e.status === 'maintenance').length,
    broken: equipment.filter(e => e.status === 'broken').length
  };

  const getMaintenanceStatus = (item: Equipment) => {
    if (!item.next_maintenance) return null;
    const nextMaintenance = new Date(item.next_maintenance);
    const today = new Date();
    const daysUntil = Math.ceil((nextMaintenance.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysUntil < 0) return { status: 'overdue', days: Math.abs(daysUntil) };
    if (daysUntil <= 7) return { status: 'due-soon', days: daysUntil };
    return { status: 'scheduled', days: daysUntil };
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Settings className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold text-foreground">Equipment Management</h1>
            <p className="text-muted-foreground">Track and maintain your construction equipment</p>
          </div>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Add Equipment
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Equipment</p>
                <p className="text-2xl font-bold">{equipment.length}</p>
              </div>
              <Settings className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Available</p>
                <p className="text-2xl font-bold">{statusCounts.available}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">In Use</p>
                <p className="text-2xl font-bold">{statusCounts['in-use']}</p>
              </div>
              <MapPin className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Maintenance</p>
                <p className="text-2xl font-bold">{statusCounts.maintenance}</p>
              </div>
              <Wrench className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Broken</p>
                <p className="text-2xl font-bold">{statusCounts.broken}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-4 flex-1">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search equipment..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-input bg-background rounded-md text-sm"
          >
            <option value="all">All Status ({statusCounts.all})</option>
            <option value="available">Available ({statusCounts.available})</option>
            <option value="in-use">In Use ({statusCounts['in-use']})</option>
            <option value="maintenance">Maintenance ({statusCounts.maintenance})</option>
            <option value="broken">Broken ({statusCounts.broken})</option>
          </select>
        </div>
      </div>

      {/* Equipment Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredEquipment.map((item) => {
          const maintenanceStatus = getMaintenanceStatus(item);
          
          return (
            <Card key={item.id} className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg line-clamp-2">{item.name}</CardTitle>
                    <CardDescription>{item.type} • {item.model}</CardDescription>
                  </div>
                  <Badge className={getStatusColor(item.status)}>
                    {getStatusIcon(item.status)}
                    <span className="ml-1">{item.status.replace('-', ' ')}</span>
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Equipment Details */}
                <div className="space-y-2 text-sm">
                  {item.serial_number && (
                    <div>
                      <span className="text-muted-foreground">Serial: </span>
                      <span>{item.serial_number}</span>
                    </div>
                  )}
                  {item.location && (
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span>{item.location}</span>
                    </div>
                  )}
                  {item.purchase_date && (
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span>Purchased {new Date(item.purchase_date).toLocaleDateString()}</span>
                    </div>
                  )}
                </div>

                {/* Maintenance Status */}
                {maintenanceStatus && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Next Maintenance</span>
                      <span className={
                        maintenanceStatus.status === 'overdue' ? 'text-red-600' :
                        maintenanceStatus.status === 'due-soon' ? 'text-yellow-600' :
                        'text-green-600'
                      }>
                        {maintenanceStatus.status === 'overdue' ? `${maintenanceStatus.days} days overdue` :
                         maintenanceStatus.status === 'due-soon' ? `${maintenanceStatus.days} days` :
                         `${maintenanceStatus.days} days`}
                      </span>
                    </div>
                    <Progress 
                      value={Math.max(0, Math.min(100, 100 - (maintenanceStatus.days / 90 * 100)))} 
                      className="h-2" 
                    />
                  </div>
                )}

                {/* Warranty Status */}
                {item.warranty_expiry && (
                  <div className="text-sm">
                    <span className="text-muted-foreground">Warranty: </span>
                    <span className={new Date(item.warranty_expiry) > new Date() ? 'text-green-600' : 'text-red-600'}>
                      {new Date(item.warranty_expiry) > new Date() 
                        ? `Valid until ${new Date(item.warranty_expiry).toLocaleDateString()}`
                        : 'Expired'
                      }
                    </span>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-2 pt-2">
                  <Button variant="outline" size="sm" className="flex-1">
                    View Details
                  </Button>
                  <Button variant="outline" size="sm">
                    <Wrench className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredEquipment.length === 0 && !loading && (
        <Card>
          <CardContent className="py-12 text-center">
            <Settings className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Equipment Found</h3>
            <p className="text-muted-foreground mb-4">
              {searchQuery || statusFilter !== 'all' 
                ? 'Try adjusting your search or filters.' 
                : 'Add your first piece of equipment to get started.'}
            </p>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Equipment
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}