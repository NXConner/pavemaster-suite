import { useState, useEffect } from 'react';
import { Plus, Search, Phone, Mail, Building, Users, Calendar, DollarSign } from 'lucide-react';

interface Contact {
  id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  type: string;
  status: string;
  last_contact: string;
  total_projects: number;
  total_value: number;
  created_at: string;
}

export default function CRM() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');

  useEffect(() => {
    fetchContacts();
  }, []);

  const fetchContacts = async () => {
    try {
      // Mock data for demonstration
      const mockContacts: Contact[] = [
        {
          id: '1',
          name: 'Grace Baptist Church',
          email: 'facilities@gracebaptist.org',
          phone: '(555) 123-4567',
          company: 'Grace Baptist Church',
          type: 'church',
          status: 'active',
          last_contact: '2024-01-15',
          total_projects: 3,
          total_value: 45000,
          created_at: '2023-06-15'
        },
        {
          id: '2',
          name: 'First Presbyterian',
          email: 'admin@firstpres.org',
          phone: '(555) 234-5678',
          company: 'First Presbyterian Church',
          type: 'church',
          status: 'prospect',
          last_contact: '2024-01-10',
          total_projects: 0,
          total_value: 0,
          created_at: '2024-01-05'
        },
        {
          id: '3',
          name: 'St. Mary Catholic',
          email: 'maintenance@stmary.org',
          phone: '(555) 345-6789',
          company: 'St. Mary Catholic Church',
          type: 'church',
          status: 'active',
          last_contact: '2024-01-12',
          total_projects: 2,
          total_value: 28000,
          created_at: '2023-09-20'
        }
      ];
      
      setContacts(mockContacts);
    } catch (error) {
      console.error('Error fetching contacts:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'prospect':
        return 'bg-blue-100 text-blue-800';
      case 'inactive':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'church':
        return 'bg-purple-100 text-purple-800';
      case 'commercial':
        return 'bg-orange-100 text-orange-800';
      case 'residential':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
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

  const filteredContacts = contacts.filter(contact => {
    const matchesSearch = contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         contact.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         contact.company.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === 'all' || contact.type === typeFilter;
    return matchesSearch && matchesType;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading contacts...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">CRM</h1>
          <p className="text-muted-foreground">Manage customer relationships and contacts</p>
        </div>
        <button className="bg-primary text-primary-foreground px-4 py-2 rounded-md flex items-center gap-2 hover:bg-primary/90">
          <Plus className="h-4 w-4" />
          Add Contact
        </button>
      </div>

      {/* Search and Filter */}
      <div className="flex gap-4 items-center">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <input
            type="text"
            placeholder="Search contacts..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-3 py-2 border border-input rounded-md bg-background"
          />
        </div>
        <div className="flex gap-2">
          {['all', 'church', 'commercial', 'residential'].map((type) => (
            <button
              key={type}
              className={`px-3 py-1 rounded-md text-sm ${
                typeFilter === type 
                  ? 'bg-primary text-primary-foreground' 
                  : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
              }`}
              onClick={() => setTypeFilter(type)}
            >
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="border rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium">Total Contacts</h3>
            <Users className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="text-2xl font-bold">{contacts.length}</div>
        </div>
        
        <div className="border rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium">Active Clients</h3>
            <Building className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="text-2xl font-bold">
            {contacts.filter(c => c.status === 'active').length}
          </div>
        </div>
        
        <div className="border rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium">Total Value</h3>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="text-2xl font-bold">
            {formatCurrency(contacts.reduce((sum, c) => sum + c.total_value, 0))}
          </div>
        </div>
        
        <div className="border rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium">Prospects</h3>
            <Users className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="text-2xl font-bold">
            {contacts.filter(c => c.status === 'prospect').length}
          </div>
        </div>
      </div>

      {/* Contacts Grid */}
      {filteredContacts.length === 0 ? (
        <div className="border rounded-lg p-16 text-center">
          <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No contacts found</h3>
          <p className="text-muted-foreground mb-4">
            {searchTerm || typeFilter !== 'all' 
              ? 'No contacts match your current filters.'
              : 'Get started by adding your first contact.'
            }
          </p>
          <button className="bg-primary text-primary-foreground px-4 py-2 rounded-md flex items-center gap-2 mx-auto hover:bg-primary/90">
            <Plus className="h-4 w-4" />
            Add Contact
          </button>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredContacts.map((contact) => (
            <div key={contact.id} className="border rounded-lg p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold">{contact.name}</h3>
                  <p className="text-sm text-muted-foreground">{contact.company}</p>
                </div>
                <div className="flex flex-col gap-1">
                  <span className={`inline-block px-2 py-1 rounded-full text-xs ${getStatusColor(contact.status)}`}>
                    {contact.status}
                  </span>
                  <span className={`inline-block px-2 py-1 rounded-full text-xs border ${getTypeColor(contact.type)}`}>
                    {contact.type}
                  </span>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span className="truncate">{contact.email}</span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span>{contact.phone}</span>
                  </div>
                </div>
                
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Projects:</span>
                  <span className="font-medium">{contact.total_projects}</span>
                </div>
                
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Total Value:</span>
                  <span className="font-medium">{formatCurrency(contact.total_value)}</span>
                </div>
                
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span>Last contact: {formatDate(contact.last_contact)}</span>
                </div>
                
                <div className="flex gap-2 pt-2">
                  <button className="flex-1 px-3 py-2 border border-input rounded-md text-sm hover:bg-accent">
                    View Details
                  </button>
                  <button className="flex-1 px-3 py-2 bg-primary text-primary-foreground rounded-md text-sm hover:bg-primary/90">
                    Contact
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