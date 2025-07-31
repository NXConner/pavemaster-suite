import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Plus, 
  FileText, 
  Truck, 
  BarChart3,
  Users,
  Settings,
  ClipboardList,
  DollarSign,
  ArrowRight
} from 'lucide-react';
import { Link } from 'react-router-dom';

const iconMap = {
  Plus,
  FileText,
  Truck,
  BarChart3,
  Users,
  Settings,
  ClipboardList,
  DollarSign
};

const quickActions = [
  {
    id: '1',
    title: 'New Project',
    description: 'Create a new pavement project',
    icon: 'Plus',
    route: '/projects/create',
    permissions: ['projects:create'],
    category: 'create',
    color: 'blue'
  },
  {
    id: '2',
    title: 'Generate Report',
    description: 'Create performance analytics report',
    icon: 'FileText',
    route: '/reports/generate',
    permissions: ['reports:create'],
    category: 'report',
    color: 'green'
  },
  {
    id: '3',
    title: 'Equipment Status',
    description: 'Check equipment availability',
    icon: 'Truck',
    route: '/equipment',
    permissions: ['equipment:read'],
    category: 'manage',
    color: 'orange'
  },
  {
    id: '4',
    title: 'Analytics Dashboard',
    description: 'View detailed project analytics',
    icon: 'BarChart3',
    route: '/analytics',
    permissions: ['analytics:read'],
    category: 'analyze',
    color: 'purple'
  },
  {
    id: '5',
    title: 'Team Management',
    description: 'Manage team members and assignments',
    icon: 'Users',
    route: '/team',
    permissions: ['team:read'],
    category: 'manage',
    color: 'blue'
  },
  {
    id: '6',
    title: 'Financial Overview',
    description: 'Review budgets and expenses',
    icon: 'DollarSign',
    route: '/financial',
    permissions: ['financial:read'],
    category: 'analyze',
    color: 'green'
  }
];

export function DashboardQuickActions() {
  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'create': return 'bg-blue-50 text-blue-700';
      case 'report': return 'bg-green-50 text-green-700';
      case 'manage': return 'bg-orange-50 text-orange-700';
      case 'analyze': return 'bg-purple-50 text-purple-700';
      default: return 'bg-gray-50 text-gray-700';
    }
  };

  const getActionColor = (color: string) => {
    switch (color) {
      case 'blue': return 'hover:bg-blue-50 border-blue-200';
      case 'green': return 'hover:bg-green-50 border-green-200';
      case 'orange': return 'hover:bg-orange-50 border-orange-200';
      case 'purple': return 'hover:bg-purple-50 border-purple-200';
      default: return 'hover:bg-gray-50 border-gray-200';
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">Quick Actions</h2>
        <Button variant="outline" size="sm">
          <Settings className="h-4 w-4 mr-2" />
          Customize
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {quickActions.map((action) => {
          const Icon = iconMap[action.icon as keyof typeof iconMap] || Plus;
          
          return (
            <Link key={action.id} to={action.route}>
              <Card className={`transition-all duration-200 hover:shadow-md cursor-pointer ${getActionColor(action.color)}`}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <div className={`p-2 rounded-lg ${
                      action.color === 'blue' ? 'bg-blue-100 text-blue-600' :
                      action.color === 'green' ? 'bg-green-100 text-green-600' :
                      action.color === 'orange' ? 'bg-orange-100 text-orange-600' :
                      action.color === 'purple' ? 'bg-purple-100 text-purple-600' :
                      'bg-gray-100 text-gray-600'
                    }`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <Badge variant="outline" className={getCategoryColor(action.category)}>
                      {action.category}
                    </Badge>
                  </div>

                  <div className="space-y-2">
                    <h3 className="font-semibold text-gray-900">{action.title}</h3>
                    <p className="text-sm text-gray-600">{action.description}</p>
                  </div>

                  <div className="flex items-center justify-between mt-4">
                    <span className="text-xs text-gray-500">
                      {action.permissions.join(', ')}
                    </span>
                    <ArrowRight className="h-4 w-4 text-gray-400" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>

      {/* Recent Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Recent Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
              <div className="flex items-center space-x-3">
                <div className="p-1 bg-blue-100 text-blue-600 rounded">
                  <Plus className="h-3 w-3" />
                </div>
                <div>
                  <p className="text-sm font-medium">Created project "Mall Renovation"</p>
                  <p className="text-xs text-gray-500">2 hours ago</p>
                </div>
              </div>
              <Button variant="ghost" size="sm">
                <ArrowRight className="h-3 w-3" />
              </Button>
            </div>

            <div className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
              <div className="flex items-center space-x-3">
                <div className="p-1 bg-green-100 text-green-600 rounded">
                  <FileText className="h-3 w-3" />
                </div>
                <div>
                  <p className="text-sm font-medium">Generated monthly report</p>
                  <p className="text-xs text-gray-500">1 day ago</p>
                </div>
              </div>
              <Button variant="ghost" size="sm">
                <ArrowRight className="h-3 w-3" />
              </Button>
            </div>

            <div className="flex items-center justify-between py-2">
              <div className="flex items-center space-x-3">
                <div className="p-1 bg-orange-100 text-orange-600 rounded">
                  <Truck className="h-3 w-3" />
                </div>
                <div>
                  <p className="text-sm font-medium">Updated equipment status</p>
                  <p className="text-xs text-gray-500">2 days ago</p>
                </div>
              </div>
              <Button variant="ghost" size="sm">
                <ArrowRight className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}