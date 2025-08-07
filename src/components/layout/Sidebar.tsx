import React from 'react';
import { Button } from '../ui/button';
import {
  Home,
  Settings,
  Users,
  BarChart3,
  FileText,
  Map,
  Wrench,
  Shield,
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const menuItems = [
    { icon: Home, label: 'Dashboard', href: '/dashboard' },
    { icon: FileText, label: 'Projects', href: '/projects' },
    { icon: Map, label: 'Field Operations', href: '/field' },
    { icon: BarChart3, label: 'Analytics', href: '/analytics' },
    { icon: Wrench, label: 'Equipment', href: '/equipment' },
    { icon: Users, label: 'Team', href: '/team' },
    { icon: Shield, label: 'Safety', href: '/safety' },
    { icon: Settings, label: 'Settings', href: '/settings' },
  ];

  return (
    <aside className="fixed left-0 top-16 z-40 w-64 h-[calc(100vh-4rem)] bg-card border-r border">
      <div className="flex flex-col h-full">
        <div className="flex-1 overflow-y-auto p-4">
          <nav className="space-y-2">
            {menuItems.map((item) => (
              <Button
                key={item.label}
                variant="ghost"
                className="w-full justify-start"
                asChild
              >
                <a href={item.href}>
                  <item.icon className="mr-3 h-4 w-4" />
                  {item.label}
                </a>
              </Button>
            ))}
          </nav>
        </div>

        <div className="p-4 border-t border">
          <Button variant="outline" className="w-full" size="sm">
            Help & Support
          </Button>
        </div>
      </div>
    </aside>
  );
};