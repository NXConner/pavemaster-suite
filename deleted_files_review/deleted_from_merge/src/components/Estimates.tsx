import { useState, useEffect } from 'react';
import { Plus, Search, DollarSign, Calendar, FileText, Edit, Trash2 } from 'lucide-react';

interface Estimate {
  id: string;
  customer: string;
  amount: number;
  status: string;
  created_at: string;
  valid_until: string;
  line_items: any[];
  notes: string;
  created_by: string;
}

export default function Estimates() {
  const [estimates, setEstimates] = useState<Estimate[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    fetchEstimates();
  }, []);

  const fetchEstimates = async () => {
    try {
      // Mock data for demonstration
      const mockEstimates: Estimate[] = [
        {
          id: '1',
          customer: 'Grace Baptist Church',
          amount: 15000,
          status: 'approved',
          created_at: '2024-01-15T00:00:00Z',
          valid_until: '2024-02-15T00:00:00Z',
          line_items: [
            { description: 'Asphalt overlay', quantity: 1, rate: 12000 },
            { description: 'Line striping', quantity: 1, rate: 3000 }
          ],
          notes: 'Parking lot resurfacing and line striping',
          created_by: 'user1'
        },
        {
          id: '2',
          customer: 'First Presbyterian',
          amount: 8500,
          status: 'pending',
          created_at: '2024-01-10T00:00:00Z',
          valid_until: '2024-02-10T00:00:00Z',
          line_items: [
            { description: 'Sealcoating', quantity: 1, rate: 5500 },
            { description: 'Crack sealing', quantity: 1, rate: 3000 }
          ],
          notes: 'Annual maintenance package',
          created_by: 'user1'
        }
      ];
      
      setEstimates(mockEstimates);
    } catch (error) {
      console.error('Error fetching estimates:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'draft':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-blue-100 text-blue-800';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const filteredEstimates = estimates.filter(estimate => {
    const matchesSearch = estimate.customer?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         estimate.notes?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || estimate.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading estimates...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Estimates</h1>
          <p className="text-muted-foreground">Manage project estimates and quotes</p>
        </div>
        <button className="bg-primary text-primary-foreground px-4 py-2 rounded-md flex items-center gap-2 hover:bg-primary/90">
          <Plus className="h-4 w-4" />
          Create Estimate
        </button>
      </div>

      {/* Search and Filter */}
      <div className="flex gap-4 items-center">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <input
            type="text"
            placeholder="Search estimates..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-3 py-2 border border-input rounded-md bg-background"
          />
        </div>
        <div className="flex gap-2">
          {['all', 'draft', 'pending', 'approved', 'rejected'].map((status) => (
            <button
              key={status}
              className={`px-3 py-1 rounded-md text-sm ${
                statusFilter === status 
                  ? 'bg-primary text-primary-foreground' 
                  : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
              }`}
              onClick={() => setStatusFilter(status)}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Estimates Grid */}
      {filteredEstimates.length === 0 ? (
        <div className="border rounded-lg p-16 text-center">
          <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No estimates found</h3>
          <p className="text-muted-foreground mb-4">
            {searchTerm || statusFilter !== 'all' 
              ? 'No estimates match your current filters.'
              : 'Get started by creating your first estimate.'
            }
          </p>
          <button className="bg-primary text-primary-foreground px-4 py-2 rounded-md flex items-center gap-2 mx-auto hover:bg-primary/90">
            <Plus className="h-4 w-4" />
            Create Estimate
          </button>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredEstimates.map((estimate) => (
            <div key={estimate.id} className="border rounded-lg p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold">{estimate.customer}</h3>
                  <span className={`inline-block px-2 py-1 rounded-full text-xs ${getStatusColor(estimate.status)}`}>
                    {estimate.status}
                  </span>
                </div>
                <div className="flex gap-1">
                  <button className="p-1 hover:bg-gray-100 rounded">
                    <Edit className="h-4 w-4" />
                  </button>
                  <button className="p-1 hover:bg-gray-100 rounded">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                  <span className="font-semibold text-lg">
                    {formatCurrency(estimate.amount || 0)}
                  </span>
                </div>
                
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span>Created: {formatDate(estimate.created_at)}</span>
                </div>
                
                {estimate.valid_until && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>Valid until: {formatDate(estimate.valid_until)}</span>
                  </div>
                )}
                
                {estimate.line_items && estimate.line_items.length > 0 && (
                  <div className="text-sm text-muted-foreground">
                    {estimate.line_items.length} line item(s)
                  </div>
                )}
                
                {estimate.notes && (
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {estimate.notes}
                  </p>
                )}
                
                <div className="flex gap-2 pt-2">
                  <button className="flex-1 px-3 py-2 border border-input rounded-md text-sm hover:bg-accent">
                    View Details
                  </button>
                  <button className="flex-1 px-3 py-2 bg-primary text-primary-foreground rounded-md text-sm hover:bg-primary/90">
                    Send Quote
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}