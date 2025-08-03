import { cn } from '../../lib/utils';
import { DashboardCard } from './dashboard-card';
import {
  FolderOpen,
  Wrench,
  Users,
  DollarSign,
  Clock,
  CheckCircle,
  AlertTriangle,
  Truck,
} from 'lucide-react';

interface StatsGridProps {
  className?: string;
}

// Mock data - this would come from your backend
const stats = [
  {
    title: 'Active Projects',
    value: '24',
    description: 'Currently in progress',
    trend: { value: 12, isPositive: true, label: 'from last month' },
    icon: <FolderOpen className="h-4 w-4" />,
    action: { label: 'View All', href: '/projects' },
  },
  {
    title: 'Equipment Available',
    value: '18/22',
    description: 'Ready for deployment',
    trend: { value: 5, isPositive: false, label: 'in maintenance' },
    icon: <Wrench className="h-4 w-4" />,
    action: { label: 'Manage Equipment', href: '/equipment' },
  },
  {
    title: 'Active Crew Members',
    value: '42',
    description: 'On duty today',
    trend: undefined,
    icon: <Users className="h-4 w-4" />,
    action: { label: 'View Crews', href: '/employees' },
  },
  {
    title: 'Monthly Revenue',
    value: '$285,240',
    description: 'Current month earnings',
    trend: { value: 15, isPositive: true, label: 'vs last month' },
    icon: <DollarSign className="h-4 w-4" />,
    action: { label: 'View Reports', href: '/analytics' },
  },
  {
    title: 'Pending Estimates',
    value: '8',
    description: 'Awaiting client approval',
    trend: undefined,
    icon: <Clock className="h-4 w-4" />,
    action: { label: 'Review Estimates', href: '/estimates' },
  },
  {
    title: 'Completed This Week',
    value: '12',
    description: 'Projects finished',
    trend: { value: 20, isPositive: true, label: 'completion rate' },
    icon: <CheckCircle className="h-4 w-4" />,
    action: { label: 'View Completed', href: '/projects?status=completed' },
  },
  {
    title: 'Fleet Status',
    value: '16/18',
    description: 'Vehicles operational',
    trend: { value: 2, isPositive: false, label: 'in service' },
    icon: <Truck className="h-4 w-4" />,
    action: { label: 'Fleet Dashboard', href: '/fleet' },
  },
  {
    title: 'Safety Incidents',
    value: '0',
    description: 'This month',
    trend: { value: 100, isPositive: true, label: 'safety record' },
    icon: <AlertTriangle className="h-4 w-4" />,
    action: { label: 'Safety Reports', href: '/safety' },
  },
];

export function StatsGrid({ className }: StatsGridProps) {
  return (
    <div className={cn(
      'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4',
      className,
    )}>
      {stats.map((stat, index) => (
        <DashboardCard
          key={index}
          title={stat.title}
          value={stat.value}
          description={stat.description}
          trend={stat.trend}
          icon={stat.icon}
          action={stat.action}
        />
      ))}
    </div>
  );
}