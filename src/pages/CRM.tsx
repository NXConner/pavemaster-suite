import { useState } from 'react';
import { DashboardLayout } from '../components/layout/dashboard-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Badge } from '../components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import {
  Users,
  UserPlus,
  Phone,
  Mail,
  Calendar,
  DollarSign,
  TrendingUp,
  Activity,
  Star,
  Clock,
  Building,
  Tag,
  MessageSquare,
  FileText,
  Search,
} from 'lucide-react';

interface Lead {
  id: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  address: string;
  status: 'new' | 'contacted' | 'qualified' | 'proposal_sent' | 'negotiation' | 'won' | 'lost';
  source: string;
  estimatedValue: number;
  projectType: string;
  priority: 'low' | 'medium' | 'high';
  assignedTo: string;
  createdAt: string;
  lastContact: string;
  nextFollowUp: string;
  notes: string;
  tags: string[];
}

interface Customer {
  id: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  address: string;
  type: 'residential' | 'commercial' | 'municipal';
  status: 'active' | 'inactive' | 'vip';
  totalProjects: number;
  totalRevenue: number;
  lastProject: string;
  satisfaction: number;
  referrals: number;
  paymentTerms: string;
  notes: string;
}

interface Interaction {
  id: string;
  contactId: string;
  type: 'call' | 'email' | 'meeting' | 'proposal' | 'follow_up';
  description: string;
  date: string;
  duration?: number;
  outcome: string;
  nextAction?: string;
  createdBy: string;
}

export default function CRM() {
  const [activeTab, setActiveTab] = useState('leads');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedPriority, setSelectedPriority] = useState('all');

  const leads: Lead[] = [
    {
      id: '1',
      name: 'John Smith',
      company: 'Grace Community Church',
      email: 'john.smith@gracechurch.org',
      phone: '(804) 555-0123',
      address: '123 Church St, Richmond, VA 23220',
      status: 'proposal_sent',
      source: 'Website Inquiry',
      estimatedValue: 25000,
      projectType: 'Parking Lot Sealcoating',
      priority: 'high',
      assignedTo: 'Mike Johnson',
      createdAt: '2024-01-10',
      lastContact: '2024-01-15',
      nextFollowUp: '2024-01-22',
      notes: 'Large parking lot, approximately 50,000 sq ft. Interested in line striping as well.',
      tags: ['church', 'sealcoating', 'large-project'],
    },
    {
      id: '2',
      name: 'Sarah Williams',
      company: 'Richmond Shopping Center',
      email: 'sarah.w@rsc.com',
      phone: '(804) 555-0456',
      address: '456 Commerce Blvd, Richmond, VA 23230',
      status: 'negotiation',
      source: 'Referral',
      estimatedValue: 45000,
      projectType: 'Asphalt Resurfacing',
      priority: 'high',
      assignedTo: 'Admin User',
      createdAt: '2024-01-05',
      lastContact: '2024-01-16',
      nextFollowUp: '2024-01-20',
      notes: 'Multi-phase project. Phase 1: main lot, Phase 2: side areas.',
      tags: ['commercial', 'resurfacing', 'multi-phase'],
    },
    {
      id: '3',
      name: 'David Chen',
      company: 'Westfield Elementary',
      email: 'd.chen@westfield.edu',
      phone: '(804) 555-0789',
      address: '789 School Lane, Richmond, VA 23240',
      status: 'qualified',
      source: 'Cold Call',
      estimatedValue: 18000,
      projectType: 'Crack Repair & Seal',
      priority: 'medium',
      assignedTo: 'Lisa Martinez',
      createdAt: '2024-01-12',
      lastContact: '2024-01-14',
      nextFollowUp: '2024-01-24',
      notes: 'Budget approved, waiting for board meeting approval.',
      tags: ['school', 'municipal', 'crack-repair'],
    },
    {
      id: '4',
      name: 'Lisa Rodriguez',
      company: 'Metro Office Complex',
      email: 'lisa.r@metrooffice.com',
      phone: '(804) 555-0321',
      address: '321 Business Park Dr, Richmond, VA 23250',
      status: 'contacted',
      source: 'Google Ads',
      estimatedValue: 12000,
      projectType: 'Line Striping',
      priority: 'low',
      assignedTo: 'Mike Johnson',
      createdAt: '2024-01-14',
      lastContact: '2024-01-15',
      nextFollowUp: '2024-01-25',
      notes: 'Interested in annual maintenance contract.',
      tags: ['office', 'line-striping', 'maintenance'],
    },
  ];

  const customers: Customer[] = [
    {
      id: '1',
      name: 'Grace Community Church',
      company: 'Grace Community Church',
      email: 'contact@gracechurch.org',
      phone: '(804) 555-0123',
      address: '123 Church St, Richmond, VA 23220',
      type: 'commercial',
      status: 'vip',
      totalProjects: 8,
      totalRevenue: 125000,
      lastProject: '2023-11-15',
      satisfaction: 4.8,
      referrals: 3,
      paymentTerms: 'Net 30',
      notes: 'Long-term client, excellent payment history.',
    },
    {
      id: '2',
      name: 'Richmond Shopping Center',
      company: 'Richmond Shopping Center LLC',
      email: 'management@rsc.com',
      phone: '(804) 555-0456',
      address: '456 Commerce Blvd, Richmond, VA 23230',
      type: 'commercial',
      status: 'active',
      totalProjects: 12,
      totalRevenue: 285000,
      lastProject: '2024-01-05',
      satisfaction: 4.5,
      referrals: 2,
      paymentTerms: 'Net 45',
      notes: 'Large commercial client, multiple properties.',
    },
    {
      id: '3',
      name: 'City of Richmond',
      company: 'Richmond Public Works',
      email: 'contracts@richmond.gov',
      phone: '(804) 555-0100',
      address: '900 E Broad St, Richmond, VA 23219',
      type: 'municipal',
      status: 'active',
      totalProjects: 25,
      totalRevenue: 750000,
      lastProject: '2023-12-20',
      satisfaction: 4.2,
      referrals: 0,
      paymentTerms: 'Net 60',
      notes: 'Municipal contract, strict compliance requirements.',
    },
  ];

  const interactions: Interaction[] = [
    {
      id: '1',
      contactId: '1',
      type: 'call',
      description: 'Initial consultation call',
      date: '2024-01-15',
      duration: 45,
      outcome: 'Positive response, requested formal proposal',
      nextAction: 'Send detailed proposal by Friday',
      createdBy: 'Mike Johnson',
    },
    {
      id: '2',
      contactId: '2',
      type: 'meeting',
      description: 'Site visit and measurement',
      date: '2024-01-16',
      duration: 120,
      outcome: 'Identified additional work needed',
      nextAction: 'Revise proposal with additional scope',
      createdBy: 'Admin User',
    },
    {
      id: '3',
      contactId: '3',
      type: 'email',
      description: 'Follow-up on proposal status',
      date: '2024-01-14',
      outcome: 'Waiting for board approval',
      nextAction: 'Follow up after board meeting on 1/24',
      createdBy: 'Lisa Martinez',
    },
  ];

  const filteredLeads = leads.filter(lead => {
    const matchesSearch = lead.name.toLowerCase().includes(searchTerm.toLowerCase())
                         || lead.company.toLowerCase().includes(searchTerm.toLowerCase())
                         || lead.projectType.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatus === 'all' || lead.status === selectedStatus;
    const matchesPriority = selectedPriority === 'all' || lead.priority === selectedPriority;

    return matchesSearch && matchesStatus && matchesPriority;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new': return 'bg-blue-100 text-blue-800';
      case 'contacted': return 'bg-yellow-100 text-yellow-800';
      case 'qualified': return 'bg-purple-100 text-purple-800';
      case 'proposal_sent': return 'bg-orange-100 text-orange-800';
      case 'negotiation': return 'bg-pink-100 text-pink-800';
      case 'won': return 'bg-green-100 text-green-800';
      case 'lost': return 'bg-red-100 text-red-800';
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      case 'vip': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getInteractionIcon = (type: string) => {
    switch (type) {
      case 'call': return <Phone className="h-4 w-4" />;
      case 'email': return <Mail className="h-4 w-4" />;
      case 'meeting': return <Users className="h-4 w-4" />;
      case 'proposal': return <FileText className="h-4 w-4" />;
      case 'follow_up': return <Clock className="h-4 w-4" />;
      default: return <MessageSquare className="h-4 w-4" />;
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Customer Relationship Management</h1>
            <p className="text-muted-foreground">
              Manage leads, customers, and business relationships
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="gap-2">
              <FileText className="h-4 w-4" />
              Export Data
            </Button>
            <Button className="gap-2">
              <UserPlus className="h-4 w-4" />
              Add Lead
            </Button>
          </div>
        </div>

        {/* CRM Overview */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Leads</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{leads.length}</div>
              <p className="text-xs text-muted-foreground">
                {leads.filter(l => l.status !== 'won' && l.status !== 'lost').length} in pipeline
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pipeline Value</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ${leads.reduce((sum, lead) => sum + lead.estimatedValue, 0).toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">Estimated total value</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Customers</CardTitle>
              <Building className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {customers.filter(c => c.status === 'active' || c.status === 'vip').length}
              </div>
              <p className="text-xs text-muted-foreground">
                {customers.filter(c => c.status === 'vip').length} VIP customers
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">68%</div>
              <p className="text-xs text-muted-foreground">Lead to customer</p>
            </CardContent>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList>
            <TabsTrigger value="leads">Leads</TabsTrigger>
            <TabsTrigger value="customers">Customers</TabsTrigger>
            <TabsTrigger value="interactions">Interactions</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
          </TabsList>

          <TabsContent value="leads" className="space-y-6">
            {/* Lead Filters */}
            <Card>
              <CardContent className="pt-6">
                <div className="grid gap-4 md:grid-cols-4">
                  <div className="space-y-2">
                    <Label htmlFor="search">Search Leads</Label>
                    <div className="relative">
                      <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="search"
                        placeholder="Search by name, company, or project..."
                        value={searchTerm}
                        onChange={(e) => { setSearchTerm(e.target.value); }}
                        className="pl-8"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="status">Status</Label>
                    <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Statuses</SelectItem>
                        <SelectItem value="new">New</SelectItem>
                        <SelectItem value="contacted">Contacted</SelectItem>
                        <SelectItem value="qualified">Qualified</SelectItem>
                        <SelectItem value="proposal_sent">Proposal Sent</SelectItem>
                        <SelectItem value="negotiation">Negotiation</SelectItem>
                        <SelectItem value="won">Won</SelectItem>
                        <SelectItem value="lost">Lost</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="priority">Priority</Label>
                    <Select value={selectedPriority} onValueChange={setSelectedPriority}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Priorities</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="low">Low</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-end">
                    <Button className="w-full">Reset Filters</Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Leads List */}
            <div className="space-y-4">
              {filteredLeads.map((lead) => (
                <Card key={lead.id}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="space-y-3 flex-1">
                        <div className="flex items-center gap-3">
                          <h3 className="font-semibold text-lg">{lead.name}</h3>
                          <Badge className={getStatusColor(lead.status)}>
                            {lead.status.replace('_', ' ').toUpperCase()}
                          </Badge>
                          <Badge className={getPriorityColor(lead.priority)}>
                            {lead.priority.toUpperCase()} PRIORITY
                          </Badge>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div className="flex items-center gap-2">
                            <Building className="h-4 w-4 text-muted-foreground" />
                            <span>{lead.company}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Mail className="h-4 w-4 text-muted-foreground" />
                            <span>{lead.email}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Phone className="h-4 w-4 text-muted-foreground" />
                            <span>{lead.phone}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <DollarSign className="h-4 w-4 text-muted-foreground" />
                            <span>${lead.estimatedValue.toLocaleString()}</span>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm text-muted-foreground">
                          <div><strong>Project:</strong> {lead.projectType}</div>
                          <div><strong>Source:</strong> {lead.source}</div>
                          <div><strong>Assigned to:</strong> {lead.assignedTo}</div>
                          <div><strong>Last Contact:</strong> {lead.lastContact}</div>
                          <div><strong>Next Follow-up:</strong> {lead.nextFollowUp}</div>
                          <div><strong>Created:</strong> {lead.createdAt}</div>
                        </div>

                        <div className="space-y-2">
                          <div><strong>Notes:</strong> {lead.notes}</div>
                          <div className="flex gap-1 flex-wrap">
                            {lead.tags.map((tag, index) => (
                              <Badge key={index} variant="secondary" className="text-xs gap-1">
                                <Tag className="h-2 w-2" />
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-2 ml-4">
                        <Button variant="outline" size="sm" className="gap-1">
                          <Phone className="h-3 w-3" />
                          Call
                        </Button>
                        <Button variant="outline" size="sm" className="gap-1">
                          <Mail className="h-3 w-3" />
                          Email
                        </Button>
                        <Button variant="outline" size="sm" className="gap-1">
                          <Calendar className="h-3 w-3" />
                          Schedule
                        </Button>
                        <Button size="sm">
                          Edit
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="customers" className="space-y-6">
            <div className="space-y-4">
              {customers.map((customer) => (
                <Card key={customer.id}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="space-y-3 flex-1">
                        <div className="flex items-center gap-3">
                          <h3 className="font-semibold text-lg">{customer.name}</h3>
                          <Badge className={getStatusColor(customer.status)}>
                            {customer.status.toUpperCase()}
                          </Badge>
                          <Badge variant="outline" className="capitalize">
                            {customer.type}
                          </Badge>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div className="flex items-center gap-2">
                            <Mail className="h-4 w-4 text-muted-foreground" />
                            <span>{customer.email}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Phone className="h-4 w-4 text-muted-foreground" />
                            <span>{customer.phone}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <DollarSign className="h-4 w-4 text-muted-foreground" />
                            <span>${customer.totalRevenue.toLocaleString()}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Building className="h-4 w-4 text-muted-foreground" />
                            <span>{customer.totalProjects} projects</span>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-muted-foreground">
                          <div><strong>Last Project:</strong> {customer.lastProject}</div>
                          <div><strong>Satisfaction:</strong>
                            <div className="flex items-center gap-1 inline-block ml-1">
                              {Array.from({ length: 5 }).map((_, i) => (
                                <Star key={i} className={`h-3 w-3 ${i < customer.satisfaction ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} />
                              ))}
                              <span className="ml-1">({customer.satisfaction})</span>
                            </div>
                          </div>
                          <div><strong>Referrals:</strong> {customer.referrals}</div>
                          <div><strong>Payment Terms:</strong> {customer.paymentTerms}</div>
                        </div>

                        <div><strong>Notes:</strong> {customer.notes}</div>
                      </div>

                      <div className="flex gap-2 ml-4">
                        <Button variant="outline" size="sm" className="gap-1">
                          <Phone className="h-3 w-3" />
                          Contact
                        </Button>
                        <Button variant="outline" size="sm" className="gap-1">
                          <FileText className="h-3 w-3" />
                          Projects
                        </Button>
                        <Button size="sm">
                          Edit
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="interactions" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Recent Interactions</CardTitle>
                <CardDescription>Communication history and follow-up actions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {interactions.map((interaction) => (
                    <div key={interaction.id} className="border-l-4 border-primary/20 pl-4 space-y-2">
                      <div className="flex items-center gap-2">
                        {getInteractionIcon(interaction.type)}
                        <span className="font-medium capitalize">{interaction.type.replace('_', ' ')}</span>
                        <Badge variant="outline" className="text-xs">
                          {interaction.date}
                        </Badge>
                        {interaction.duration && (
                          <Badge variant="secondary" className="text-xs">
                            {interaction.duration} min
                          </Badge>
                        )}
                      </div>
                      <div>
                        <p className="font-medium">{interaction.description}</p>
                        <p className="text-sm text-muted-foreground">{interaction.outcome}</p>
                        {interaction.nextAction && (
                          <p className="text-sm text-primary">Next: {interaction.nextAction}</p>
                        )}
                        <p className="text-xs text-muted-foreground mt-1">By: {interaction.createdBy}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reports" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5" />
                    Lead Sources
                  </CardTitle>
                  <CardDescription>Where leads are coming from</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span>Website Inquiries</span>
                      <span className="font-semibold">35%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Referrals</span>
                      <span className="font-semibold">28%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Google Ads</span>
                      <span className="font-semibold">22%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Cold Calls</span>
                      <span className="font-semibold">15%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Sales Performance
                  </CardTitle>
                  <CardDescription>Monthly sales metrics</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span>Leads Generated</span>
                      <span className="font-semibold">24</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Proposals Sent</span>
                      <span className="font-semibold">18</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Deals Closed</span>
                      <span className="font-semibold">12</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Win Rate</span>
                      <span className="font-semibold text-green-600">67%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}