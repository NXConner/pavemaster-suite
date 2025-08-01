import { DashboardLayout } from '../components/layout/dashboard-layout';
import CustomerPortal from '../components/customer/CustomerPortal';

export default function CustomerPortalPage() {
  return (
    <DashboardLayout>
      <CustomerPortal />
    </DashboardLayout>
  );
}