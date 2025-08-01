import { DashboardLayout } from '../components/layout/dashboard-layout';
import { StatsGrid } from '../components/ui/stats-grid';
import { DashboardCard } from '../components/ui/dashboard-card';
import { Calendar, MapPin, FileText, Users } from 'lucide-react';

export default function Index() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Welcome Section */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome to your PaveMaster Suite control center
          </p>
        </div>

        {/* Stats Grid */}
        <StatsGrid />

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <DashboardCard
            title="Today's Schedule"
            description="View today's planned activities"
            icon={<Calendar className="h-4 w-4" />}
            action={{ label: 'Open Schedule', href: '/schedule' }}
          >
            <div className="space-y-2">
              <div className="text-sm">
                <span className="font-medium">3</span> projects scheduled
              </div>
              <div className="text-sm text-muted-foreground">
                Next: Site inspection at 10:00 AM
              </div>
            </div>
          </DashboardCard>

          <DashboardCard
            title="GPS Tracking"
            description="Monitor fleet and crew locations"
            icon={<MapPin className="h-4 w-4" />}
            action={{ label: 'View Map', href: '/tracking' }}
          >
            <div className="space-y-2">
              <div className="text-sm">
                <span className="font-medium">16</span> vehicles tracked
              </div>
              <div className="text-sm text-muted-foreground">
                All crews on location
              </div>
            </div>
          </DashboardCard>

          <DashboardCard
            title="Recent Estimates"
            description="Latest project estimates"
            icon={<FileText className="h-4 w-4" />}
            action={{ label: 'View All', href: '/estimates' }}
          >
            <div className="space-y-2">
              <div className="text-sm">
                <span className="font-medium">5</span> pending approval
              </div>
              <div className="text-sm text-muted-foreground">
                Total value: $125,000
              </div>
            </div>
          </DashboardCard>

          <DashboardCard
            title="Team Performance"
            description="Crew productivity metrics"
            icon={<Users className="h-4 w-4" />}
            action={{ label: 'View Details', href: '/employees' }}
          >
            <div className="space-y-2">
              <div className="text-sm">
                <span className="font-medium">98%</span> efficiency rate
              </div>
              <div className="text-sm text-muted-foreground">
                Above target this month
              </div>
            </div>
          </DashboardCard>
        </div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <DashboardCard title="Recent Projects" className="lg:col-span-1">
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 rounded bg-muted/50">
                <div>
                  <p className="font-medium">Main St. Resurfacing</p>
                  <p className="text-sm text-muted-foreground">Started today</p>
                </div>
                <span className="px-2 py-1 rounded-full text-xs bg-primary text-primary-foreground">
                  Active
                </span>
              </div>
              <div className="flex justify-between items-center p-3 rounded bg-muted/50">
                <div>
                  <p className="font-medium">Church Parking Lot</p>
                  <p className="text-sm text-muted-foreground">Completed yesterday</p>
                </div>
                <span className="px-2 py-1 rounded-full text-xs bg-success text-success-foreground">
                  Complete
                </span>
              </div>
            </div>
          </DashboardCard>

          <DashboardCard title="Weather Alert" className="lg:col-span-1">
            <div className="space-y-3">
              <div className="p-3 rounded bg-warning/10 border border-warning/20">
                <p className="font-medium text-warning-foreground">Rain Expected</p>
                <p className="text-sm text-muted-foreground">
                  30% chance of rain tomorrow. Consider rescheduling outdoor work.
                </p>
              </div>
              <div className="text-sm">
                <p><span className="font-medium">Temperature:</span> 72°F</p>
                <p><span className="font-medium">Humidity:</span> 65%</p>
              </div>
            </div>
          </DashboardCard>
        </div>
      </div>
    </DashboardLayout>
  );
}