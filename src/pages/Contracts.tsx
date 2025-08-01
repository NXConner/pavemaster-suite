import { DashboardLayout } from '../components/layout/dashboard-layout';
import ContractManager from '../components/contracts/ContractManager';

export default function Contracts() {
  return (
    <DashboardLayout>
      <ContractManager />
    </DashboardLayout>
  );
}