import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { supabase } from '../integrations/supabase/client';
import { Link, Shield, FileText, Hash, Clock, CheckCircle, AlertCircle } from 'lucide-react';

interface SmartContract {
  id: string;
  name: string;
  address: string;
  network: string;
  status: string | null;
  version: string | null;
  created_at: string | null;
}

interface BlockchainTransaction {
  id: string;
  hash: string;
  type: 'contract_creation' | 'project_record' | 'payment' | 'audit_log';
  description: string;
  status: 'confirmed' | 'pending' | 'failed';
  timestamp: string;
  gas_used?: number;
  confirmation_count: number;
}

export default function BlockchainHub() {
  const [contracts, setContracts] = useState<SmartContract[]>([]);
  const [transactions, setTransactions] = useState<BlockchainTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [deploying, setDeploying] = useState(false);

  useEffect(() => {
    fetchSmartContracts();
    fetchTransactions();
  }, []);

  const fetchSmartContracts = async () => {
    try {
      const { data, error } = await supabase
        .from('smart_contracts')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Add mock data if empty
      const mockContracts = data?.length ? data : [
        {
          id: '1',
          name: 'Project Registry',
          address: '0x742d35Cc6634C0532925a3b8d2b1c8F9cA2d7f0e',
          network: 'Ethereum',
          status: 'active',
          version: '1.2.0',
          created_at: new Date().toISOString()
        },
        {
          id: '2',
          name: 'Payment Escrow',
          address: '0x8f6B4A2d5c9C4e8c2b1f6d7a4c2e5f8b3a6c9d2e',
          network: 'Polygon',
          status: 'active',
          version: '1.1.0',
          created_at: new Date().toISOString()
        }
      ];
      
      setContracts(mockContracts);
    } catch (error) {
      console.error('Error fetching smart contracts:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTransactions = () => {
    const mockTransactions: BlockchainTransaction[] = [
      {
        id: '1',
        hash: '0xa1b2c3d4e5f6789012345678901234567890abcdef1234567890abcdef123456',
        type: 'project_record',
        description: 'Church Parking Lot Project - Phase 1 Completion',
        status: 'confirmed',
        timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
        gas_used: 21000,
        confirmation_count: 15
      },
      {
        id: '2',
        hash: '0xb2c3d4e5f6789012345678901234567890abcdef1234567890abcdef123456a1',
        type: 'payment',
        description: 'Payment Release - $12,500 USD',
        status: 'confirmed',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
        gas_used: 45000,
        confirmation_count: 8
      },
      {
        id: '3',
        hash: '0xc3d4e5f6789012345678901234567890abcdef1234567890abcdef123456a1b2',
        type: 'audit_log',
        description: 'Quality Control Inspection - Pass',
        status: 'pending',
        timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
        confirmation_count: 2
      }
    ];
    
    setTransactions(mockTransactions);
  };

  const deployNewContract = async () => {
    setDeploying(true);
    // Simulate contract deployment
    setTimeout(() => {
      fetchSmartContracts();
      setDeploying(false);
    }, 3000);
  };

  const getStatusColor = (status: string | null) => {
    switch (status) {
      case 'active': return 'bg-green-500';
      case 'deployed': return 'bg-blue-500';
      case 'pending': return 'bg-yellow-500';
      case 'paused': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  const getTransactionStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-500';
      case 'pending': return 'bg-yellow-500';
      case 'failed': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'contract_creation': return <FileText className="h-4 w-4" />;
      case 'project_record': return <CheckCircle className="h-4 w-4" />;
      case 'payment': return <Shield className="h-4 w-4" />;
      case 'audit_log': return <AlertCircle className="h-4 w-4" />;
      default: return <Hash className="h-4 w-4" />;
    }
  };

  const truncateHash = (hash: string) => {
    return `${hash.slice(0, 10)}...${hash.slice(-8)}`;
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading Blockchain Hub...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center">
            <Link className="mr-3 h-8 w-8 text-orange-500" />
            Blockchain Hub
          </h1>
          <p className="text-muted-foreground">Secure record keeping and smart contract management</p>
        </div>
        <Button onClick={deployNewContract} disabled={deploying}>
          {deploying ? (
            <>
              <Clock className="mr-2 h-4 w-4 animate-spin" />
              Deploying...
            </>
          ) : (
            <>
              <FileText className="mr-2 h-4 w-4" />
              Deploy Contract
            </>
          )}
        </Button>
      </div>

      {/* Blockchain Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Contracts</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{contracts.filter(c => c.status === 'active').length}</div>
            <p className="text-xs text-muted-foreground">Smart contracts deployed</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Transactions</CardTitle>
            <Hash className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{transactions.length}</div>
            <p className="text-xs text-muted-foreground">Recent blockchain transactions</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Networks</CardTitle>
            <Link className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2</div>
            <p className="text-xs text-muted-foreground">Ethereum & Polygon</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Gas Efficiency</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">94%</div>
            <p className="text-xs text-muted-foreground">Optimization score</p>
          </CardContent>
        </Card>
      </div>

      {/* Smart Contracts */}
      <Card>
        <CardHeader>
          <CardTitle>Smart Contracts</CardTitle>
          <CardDescription>Deployed smart contracts and their status</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {contracts.map((contract) => (
              <div key={contract.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="space-y-1">
                  <h4 className="font-semibold">{contract.name}</h4>
                  <p className="text-sm text-muted-foreground">
                    {truncateHash(contract.address)} • {contract.network}
                  </p>
                  <div className="flex items-center space-x-2">
                    <Badge className={getStatusColor(contract.status)}>
                      {(contract.status || 'unknown').toUpperCase()}
                    </Badge>
                    <Badge variant="outline">v{contract.version}</Badge>
                  </div>
                </div>
                <div className="text-right text-sm text-muted-foreground">
                  <p>{contract.created_at ? new Date(contract.created_at).toLocaleDateString() : 'Unknown'}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Transactions */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
          <CardDescription>Latest blockchain transactions and operations</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {transactions.map((transaction) => (
              <div key={transaction.id} className="flex items-start space-x-4 p-4 border rounded-lg">
                <div className="flex-shrink-0 p-2 rounded-full bg-muted">
                  {getTransactionIcon(transaction.type)}
                </div>
                <div className="flex-1 space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold">{transaction.description}</h4>
                    <Badge className={getTransactionStatusColor(transaction.status)}>
                      {transaction.status.toUpperCase()}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Hash: {truncateHash(transaction.hash)}
                  </p>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>
                      {transaction.gas_used && `Gas: ${transaction.gas_used.toLocaleString()}`} • 
                      Confirmations: {transaction.confirmation_count}
                    </span>
                    <span>{new Date(transaction.timestamp).toLocaleString()}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Blockchain Benefits */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Transparency Benefits</CardTitle>
            <CardDescription>How blockchain enhances trust and transparency</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="text-sm">Immutable project records</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="text-sm">Transparent payment history</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="text-sm">Verifiable quality inspections</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="text-sm">Auditable supply chain</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Security Features</CardTitle>
            <CardDescription>Advanced security through blockchain technology</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Shield className="h-4 w-4 text-blue-500" />
                <span className="text-sm">Cryptographic security</span>
              </div>
              <div className="flex items-center space-x-2">
                <Shield className="h-4 w-4 text-blue-500" />
                <span className="text-sm">Decentralized verification</span>
              </div>
              <div className="flex items-center space-x-2">
                <Shield className="h-4 w-4 text-blue-500" />
                <span className="text-sm">Smart contract automation</span>
              </div>
              <div className="flex items-center space-x-2">
                <Shield className="h-4 w-4 text-blue-500" />
                <span className="text-sm">Tamper-proof audit trails</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}