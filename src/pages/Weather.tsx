import { DashboardLayout } from '../components/layout/dashboard-layout';
import { PaveWiseWeatherApp } from '../components/weather/PaveWiseWeatherApp';

export default function Weather() {
  return (
    <DashboardLayout>
      <PaveWiseWeatherApp />
    </DashboardLayout>
  );
}