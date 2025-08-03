import { DashboardLayout } from '../components/layout/dashboard-layout';
import { BlockchainIntegration } from '../components/blockchain/BlockchainIntegration';

export default function Blockchain() {
  return (
    <DashboardLayout>
      <div className="container mx-auto p-6">
        <div className="space-y-6">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight">Blockchain Integration</h1>
            <p className="text-muted-foreground">
              Secure transactions, smart contracts, and immutable record keeping
            </p>
          </div>
          <BlockchainIntegration />
        </div>
      </div>
    </DashboardLayout>
  );
}