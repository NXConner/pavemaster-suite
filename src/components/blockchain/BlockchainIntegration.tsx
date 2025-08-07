import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { ScrollArea } from '../ui/scroll-area';
import {
  Shield,
  Lock,
  Key,
  FileCheck,
  Users,
  Clock,
  AlertTriangle,
  CheckCircle,
  Link,
  Hash,
} from 'lucide-react';

interface BlockchainTransaction {
  id: string;
  type: 'contract' | 'payment' | 'verification' | 'audit';
  hash: string;
  from: string;
  to: string;
  amount?: number;
  status: 'pending' | 'confirmed' | 'failed';
  timestamp: Date;
  confirmations: number;
}

interface SmartContract {
  id: string;
  name: string;
  type: 'project' | 'payment' | 'compliance' | 'quality';
  status: 'active' | 'completed' | 'pending' | 'failed';
  parties: string[];
  value: number;
  completionPercentage: number;
}

const MOCK_TRANSACTIONS: BlockchainTransaction[] = [
  {
    id: '1',
    type: 'contract',
    hash: '0x7a8f...9e2d',
    from: 'PaveMaster',
    to: '1st Baptist Church',
    amount: 15000,
    status: 'confirmed',
    timestamp: new Date(Date.now() - 3600000),
    confirmations: 12,
  },
  {
    id: '2',
    type: 'payment',
    hash: '0x3b4c...1f8a',
    from: 'Grace Methodist',
    to: 'PaveMaster',
    amount: 8500,
    status: 'pending',
    timestamp: new Date(Date.now() - 1800000),
    confirmations: 3,
  },
];

const MOCK_CONTRACTS: SmartContract[] = [
  {
    id: '1',
    name: 'Church Parking Lot Project',
    type: 'project',
    status: 'active',
    parties: ['PaveMaster', '1st Baptist Church'],
    value: 25000,
    completionPercentage: 75,
  },
  {
    id: '2',
    name: 'Material Supply Agreement',
    type: 'payment',
    status: 'completed',
    parties: ['PaveMaster', 'SealMaster Inc'],
    value: 12000,
    completionPercentage: 100,
  },
];

export function BlockchainIntegration() {
  const [transactions] = useState<BlockchainTransaction[]>(MOCK_TRANSACTIONS);
  const [contracts] = useState<SmartContract[]>(MOCK_CONTRACTS);
  const [selectedTab, setSelectedTab] = useState<'transactions' | 'contracts' | 'security'>('transactions');

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed':
      case 'completed':
      case 'active':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'failed':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      default:
        return <AlertTriangle className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'contract':
      case 'project':
        return <FileCheck className="h-4 w-4 text-blue-500" />;
      case 'payment':
        return <Users className="h-4 w-4 text-green-500" />;
      case 'verification':
      case 'compliance':
        return <Shield className="h-4 w-4 text-purple-500" />;
      case 'audit':
      case 'quality':
        return <Lock className="h-4 w-4 text-orange-500" />;
      default:
        return <Hash className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
      case 'completed':
      case 'active':
        return 'default';
      case 'pending':
        return 'secondary';
      case 'failed':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="border/50 bg-surface/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            Blockchain Integration
            <Badge variant="outline" className="ml-2">
              {transactions.filter(t => t.status === 'confirmed').length} Confirmed
            </Badge>
          </CardTitle>
        </CardHeader>
      </Card>

      {/* Tab Navigation */}
      <div className="flex gap-2">
        {[
          { id: 'transactions', label: 'Transactions', icon: Hash },
          { id: 'contracts', label: 'Smart Contracts', icon: FileCheck },
          { id: 'security', label: 'Security', icon: Lock },
        ].map((tab) => (
          <Button
            key={tab.id}
            variant={selectedTab === tab.id ? 'default' : 'outline'}
            onClick={() => { setSelectedTab(tab.id as any); }}
            className="flex items-center gap-2"
          >
            <tab.icon className="h-4 w-4" />
            {tab.label}
          </Button>
        ))}
      </div>

      {/* Content */}
      {selectedTab === 'transactions' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Transactions */}
          <Card className="border/50 bg-surface/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Hash className="h-5 w-5 text-primary" />
                Recent Transactions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-96">
                <div className="space-y-3">
                  {transactions.map((transaction) => (
                    <div
                      key={transaction.id}
                      className="p-3 rounded-lg border border/50 bg-surface/30"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          {getTypeIcon(transaction.type)}
                          <span className="font-medium text-sm capitalize">{transaction.type}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          {getStatusIcon(transaction.status)}
                          <Badge variant={getStatusColor(transaction.status)} className="text-xs">
                            {transaction.status}
                          </Badge>
                        </div>
                      </div>

                      <div className="space-y-1 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <Hash className="h-3 w-3" />
                          <span className="font-mono">{transaction.hash}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>From: {transaction.from}</span>
                          <span>To: {transaction.to}</span>
                        </div>
                        {transaction.amount && (
                          <div className="flex justify-between">
                            <span>Amount: ${transaction.amount.toLocaleString()}</span>
                            <span>Confirmations: {transaction.confirmations}</span>
                          </div>
                        )}
                        <div className="text-xs">
                          {transaction.timestamp.toLocaleString()}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Transaction Analytics */}
          <Card className="border/50 bg-surface/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Link className="h-5 w-5 text-primary" />
                Network Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <span className="text-sm text-muted-foreground">Network Health</span>
                    <div className="text-2xl font-bold text-green-500">98.7%</div>
                  </div>
                  <div className="space-y-2">
                    <span className="text-sm text-muted-foreground">Block Height</span>
                    <div className="text-2xl font-bold">18,456,789</div>
                  </div>
                  <div className="space-y-2">
                    <span className="text-sm text-muted-foreground">Gas Price</span>
                    <div className="text-2xl font-bold">21 gwei</div>
                  </div>
                  <div className="space-y-2">
                    <span className="text-sm text-muted-foreground">Pending Txs</span>
                    <div className="text-2xl font-bold">3</div>
                  </div>
                </div>

                <div className="pt-4 border-t border/50">
                  <h4 className="font-medium mb-2">Security Features</h4>
                  <div className="space-y-2">
                    {[
                      { name: 'Multi-signature', status: 'active' },
                      { name: 'Encryption', status: 'active' },
                      { name: 'Audit Trail', status: 'active' },
                      { name: 'Identity Verification', status: 'active' },
                    ].map((feature) => (
                      <div key={feature.name} className="flex items-center justify-between">
                        <span className="text-sm">{feature.name}</span>
                        <div className="flex items-center gap-1">
                          <CheckCircle className="h-3 w-3 text-green-500" />
                          <span className="text-xs text-green-500">ACTIVE</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {selectedTab === 'contracts' && (
        <div className="space-y-4">
          {contracts.map((contract) => (
            <Card key={contract.id} className="border/50 bg-surface/80 backdrop-blur-sm">
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      {getTypeIcon(contract.type)}
                      <h3 className="font-medium">{contract.name}</h3>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Parties: {contract.parties.join(', ')}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={getStatusColor(contract.status)}>
                      {contract.status}
                    </Badge>
                    <span className="text-sm font-medium">
                      ${contract.value.toLocaleString()}
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Completion</span>
                    <span>{contract.completionPercentage}%</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div
                      className="h-2 rounded-full bg-primary transition-all duration-300"
                      style={{ width: `${contract.completionPercentage}%` }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {selectedTab === 'security' && (
        <Card className="border/50 bg-surface/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Key className="h-5 w-5 text-primary" />
              Security Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h4 className="font-medium">Cryptographic Security</h4>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Encryption Standard</span>
                    <Badge variant="outline">AES-256</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Hash Algorithm</span>
                    <Badge variant="outline">SHA-256</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Digital Signatures</span>
                    <Badge variant="outline">ECDSA</Badge>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-medium">Access Control</h4>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Multi-Factor Auth</span>
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Role-Based Access</span>
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Audit Logging</span>
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}