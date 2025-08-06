import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Badge } from '../ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { FileText, Plus, Search, Download, Edit, Clock, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import { validateInput, rateLimiter, logSecurityEvent, sanitizeString, sanitizeHtml } from '../../lib/security';
import { z } from 'zod';

// Enhanced validation schema
const contractFormSchema = z.object({
  title: z.string().min(1, 'Title required').max(100).transform(sanitizeString),
  client: z.string().min(1, 'Client name required').max(100).transform(sanitizeString),
  type: z.enum(['paving', 'sealcoating', 'line_striping', 'maintenance']),
  amount: z.number().min(0, 'Amount must be positive').max(999999999, 'Amount too large'),
  expiry_date: z.string().min(1, 'Expiry date required'),
  terms: z.string().max(5000, 'Terms too long').transform(sanitizeHtml),
});

interface Contract {
  id: string;
  title: string;
  client: string;
  type: 'paving' | 'sealcoating' | 'line_striping' | 'maintenance';
  status: 'draft' | 'pending' | 'signed' | 'completed' | 'expired';
  amount: number;
  created_date: string;
  expiry_date: string;
  signed_date?: string | undefined;
  template: string;
  terms: string;
}

const CONTRACT_TEMPLATES = {
  paving: {
    title: 'Asphalt Paving Contract',
    terms: `SCOPE OF WORK:
1. Surface preparation including cleaning and repair
2. Application of tack coat as required
3. Installation of hot mix asphalt at specified thickness
4. Compaction using appropriate equipment
5. Final inspection and cleanup

MATERIALS:
- Hot mix asphalt meeting DOT specifications
- Tack coat material as required
- All materials to be new and first quality

TIMELINE:
Work to commence on [START_DATE] and complete by [END_DATE]
Weather permitting delays will extend completion date accordingly

PAYMENT TERMS:
50% deposit required to begin work
Balance due upon completion and acceptance
Payment terms: Net 30 days`,
  },
  sealcoating: {
    title: 'Sealcoating Service Contract',
    terms: `SCOPE OF WORK:
1. Power washing and cleaning of asphalt surface
2. Crack filling with hot rubberized sealant
3. Application of premium coal tar emulsion sealcoat
4. Installation of traffic control during application
5. Final cleanup and site restoration

APPLICATION PROCESS:
- Two coats of sealcoat applied with squeegee method
- Minimum 24-hour cure time between coats
- Traffic restrictions for 48 hours post-application

WARRANTY:
One year warranty on materials and workmanship
Excludes damage from freeze/thaw cycles

PAYMENT TERMS:
Payment due upon completion
Accepted methods: Check, cash, credit card`,
  },
};

export default function ContractManager() {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [showNewContract, setShowNewContract] = useState(false);
  const [newContract, setNewContract] = useState({
    title: '',
    client: '',
    type: 'paving' as Contract['type'],
    amount: 0,
    expiry_date: '',
    template: 'paving',
    terms: CONTRACT_TEMPLATES.paving.terms,
  });

  useEffect(() => {
    // Simulate loading contracts
    const sampleContracts: Contract[] = [
      {
        id: '1',
        title: 'Church Parking Lot Resurfacing',
        client: 'First Baptist Church',
        type: 'paving',
        status: 'signed',
        amount: 25000,
        created_date: '2024-01-15',
        expiry_date: '2024-03-15',
        signed_date: '2024-01-20' as string,
        template: 'paving',
        terms: CONTRACT_TEMPLATES.paving.terms,
      },
      {
        id: '2',
        title: 'Shopping Center Sealcoating',
        client: 'Metro Shopping Plaza',
        type: 'sealcoating',
        status: 'pending',
        amount: 8500,
        created_date: '2024-01-20',
        expiry_date: '2024-02-20',
        template: 'sealcoating',
        terms: CONTRACT_TEMPLATES.sealcoating.terms,
      },
    ];
    setContracts(sampleContracts);
  }, []);

  const filteredContracts = contracts.filter(contract => {
    const matchesSearch = contract.title.toLowerCase().includes(searchTerm.toLowerCase())
                         || contract.client.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || contract.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const handleCreateContract = () => {
    // Enhanced validation with security
    const validation = validateInput(contractFormSchema, newContract, 'contract_creation');
    if (!validation.success) {
      const firstError = Object.values(validation.errors || {})[0];
      toast.error(firstError || 'Please check your input');
      logSecurityEvent({
        type: 'input_validation',
        severity: 'medium',
        action: 'contract_validation_failed',
        metadata: { errors: validation.errors },
      });
      return;
    }

    // Rate limiting check
    if (!rateLimiter.isAllowed('contract_creation', 5, 300000)) {
      toast.error('Too many contract creation attempts. Please wait and try again.');
      logSecurityEvent({
        type: 'rate_limit',
        severity: 'high',
        action: 'contract_creation_rate_limited',
      });
      return;
    }

    const contract: Contract = {
      id: Date.now().toString(),
      ...validation.data!,
      status: 'draft',
      created_date: new Date().toISOString().split('T')[0] as string,
      signed_date: undefined,
      template: newContract.template,
    };

    setContracts(prev => [contract, ...prev]);
    setNewContract({
      title: '',
      client: '',
      type: 'paving',
      amount: 0,
      expiry_date: '',
      template: 'paving',
      terms: CONTRACT_TEMPLATES.paving.terms,
    });
    setShowNewContract(false);
    toast.success('Contract created successfully');

    // Log successful creation
    logSecurityEvent({
      type: 'data_access',
      severity: 'low',
      action: 'contract_created',
      metadata: { contractId: contract.id },
    });
  };

  const updateContractStatus = (id: string, status: Contract['status']) => {
    // Rate limiting for status updates
    if (!rateLimiter.isAllowed(`contract_status_${id}`, 3, 60000)) {
      toast.error('Too many status updates. Please wait.');
      return;
    }

    setContracts(prev => prev.map(contract =>
      contract.id === id
        ? {
          ...contract,
          status,
          signed_date: status === 'signed' ? new Date().toISOString().split('T')[0] : contract.signed_date || undefined,
        }
        : contract,
    ));
    toast.success(`Contract status updated to ${status}`);

    // Log status change
    logSecurityEvent({
      type: 'data_access',
      severity: status === 'signed' ? 'medium' : 'low',
      action: 'contract_status_updated',
      metadata: { contractId: id, newStatus: status },
    });
  };

  const getStatusIcon = (status: Contract['status']) => {
    switch (status) {
      case 'signed': return <CheckCircle2 className="w-4 h-4 text-success" />;
      case 'pending': return <Clock className="w-4 h-4 text-warning" />;
      default: return <FileText className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const getStatusVariant = (status: Contract['status']) => {
    switch (status) {
      case 'signed': return 'default';
      case 'pending': return 'secondary';
      case 'expired': return 'destructive';
      default: return 'outline';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-background via-surface to-background border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-primary">
            <FileText className="w-6 h-6" />
            Contract Management (Secure)
          </CardTitle>
          <CardDescription>
            Manage contracts, templates, and digital signatures with enhanced security
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Controls */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Search contracts by title or client..."
                  value={searchTerm}
                  onChange={(e) => { setSearchTerm(sanitizeString(e.target.value)); }}
                  className="pl-10"
                  maxLength={100}
                />
              </div>
            </div>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="signed">Signed</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="expired">Expired</SelectItem>
              </SelectContent>
            </Select>
            <Button
              onClick={() => { setShowNewContract(!showNewContract); }}
              className="gap-2"
            >
              <Plus className="w-4 h-4" />
              New Contract
            </Button>
          </div>

          {/* New Contract Form */}
          {showNewContract && (
            <Card className="mb-6 border-primary/20">
              <CardHeader>
                <CardTitle className="text-lg">Create New Contract</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Contract Title *</label>
                    <Input
                      value={newContract.title}
                      onChange={(e) => { setNewContract(prev => ({ ...prev, title: e.target.value })); }}
                      placeholder="Enter contract title"
                      maxLength={100}
                      required
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Client Name *</label>
                    <Input
                      value={newContract.client}
                      onChange={(e) => { setNewContract(prev => ({ ...prev, client: e.target.value })); }}
                      placeholder="Enter client name"
                      maxLength={100}
                      required
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Contract Type</label>
                    <Select
                      value={newContract.type}
                      onValueChange={(value) => {
                        const contractType = value as Contract['type'];
                        const template = contractType === 'sealcoating' ? CONTRACT_TEMPLATES.sealcoating : CONTRACT_TEMPLATES.paving;
                        setNewContract(prev => ({
                          ...prev,
                          type: contractType,
                          template: contractType,
                          terms: template.terms,
                        }));
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="paving">Asphalt Paving</SelectItem>
                        <SelectItem value="sealcoating">Sealcoating</SelectItem>
                        <SelectItem value="line_striping">Line Striping</SelectItem>
                        <SelectItem value="maintenance">Maintenance</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Contract Amount</label>
                    <Input
                      type="number"
                      value={newContract.amount}
                      onChange={(e) => { setNewContract(prev => ({ ...prev, amount: Number(e.target.value) })); }}
                      placeholder="0.00"
                      min="0"
                      max="999999999"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Expiry Date *</label>
                    <Input
                      type="date"
                      value={newContract.expiry_date}
                      onChange={(e) => { setNewContract(prev => ({ ...prev, expiry_date: e.target.value })); }}
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium">Contract Terms</label>
                  <Textarea
                    value={newContract.terms}
                    onChange={(e) => { setNewContract(prev => ({ ...prev, terms: e.target.value })); }}
                    rows={8}
                    className="font-mono text-sm"
                    maxLength={5000}
                  />
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleCreateContract}>Create Contract</Button>
                  <Button variant="outline" onClick={() => { setShowNewContract(false); }}>Cancel</Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Contracts List */}
          <div className="space-y-4">
            {filteredContracts.map((contract) => (
              <Card key={contract.id} className="border/50 hover:border-primary/50 transition-colors">
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        {getStatusIcon(contract.status)}
                        <h3 className="font-semibold">{contract.title}</h3>
                        <Badge variant={getStatusVariant(contract.status)}>
                          {contract.status}
                        </Badge>
                      </div>
                      <p className="text-muted-foreground mb-2">Client: {contract.client}</p>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>Amount: ${contract.amount.toLocaleString()}</span>
                        <span>Created: {new Date(contract.created_date).toLocaleDateString()}</span>
                        <span>Expires: {new Date(contract.expiry_date).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        <Download className="w-4 h-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Edit className="w-4 h-4" />
                      </Button>
                      {contract.status === 'draft' && (
                        <Button
                          size="sm"
                          onClick={() => { updateContractStatus(contract.id, 'pending'); }}
                        >
                          Send for Signature
                        </Button>
                      )}
                      {contract.status === 'pending' && (
                        <Button
                          size="sm"
                          onClick={() => { updateContractStatus(contract.id, 'signed'); }}
                        >
                          Mark as Signed
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}