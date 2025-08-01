import { NavLink } from "react-router-dom";
import {
  Users, 
  Truck, 
  Building, 
  Calculator,
  Calendar,
  MapPin,
  BarChart,
  Settings,
  Home,
  Bot,
  Shield,
  Cloud,
  FileText,
  Map,
  DollarSign,
  UserCheck,
  Wrench,
  Image as ImageIcon
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";

const navigationItems = [
  { title: "Dashboard", url: "/", icon: Home },
  { title: "Projects", url: "/projects", icon: Building },
  { title: "Team", url: "/team", icon: Users },
  { title: "Employees", url: "/employees", icon: UserCheck },
  { title: "Equipment", url: "/equipment", icon: Truck },
  { title: "Fleet", url: "/fleet", icon: MapPin },
  { title: "Materials", url: "/materials", icon: Wrench },
  { title: "Safety", url: "/safety", icon: Shield },
  { title: "Finance", url: "/finance", icon: DollarSign },
];

const toolsItems = [
  { title: "Estimates", url: "/estimates", icon: Calculator },
  { title: "Schedule", url: "/schedule", icon: Calendar },
  { title: "Tracking", url: "/tracking", icon: MapPin },
  { title: "Mapping", url: "/mapping", icon: Map },
  { title: "Weather", url: "/weather", icon: Cloud },
  { title: "Documents", url: "/documents", icon: FileText },
  { title: "Photo Reports", url: "/photo-reports", icon: ImageIcon },
  { title: "Notifications", url: "/notifications", icon: Bot },
  { title: "CRM", url: "/crm", icon: Users },
  { title: "Accounting", url: "/accounting", icon: DollarSign },
  { title: "Analytics", url: "/analytics", icon: BarChart },
];

const advancedItems = [
  { title: "AI Assistant", url: "/ai-assistant", icon: Bot },
  { title: "AI Knowledge", url: "/knowledge", icon: Bot },
  { title: "OverWatch", url: "/overwatch", icon: Shield },
];

export function AppSidebar() {

  return (
    <Card className="w-60 h-screen rounded-none border-r border-l-0 border-t-0 border-b-0">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          PaveMaster
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Main Navigation */}
        <div>
          <h3 className="text-sm font-semibold mb-2">Main</h3>
          <div className="space-y-1">
            {navigationItems.map((item) => (
              <NavLink
                key={item.title}
                to={item.url}
                className={({ isActive }) =>
                  `flex items-center gap-2 px-3 py-2 text-sm rounded-md transition-colors ${
                    isActive
                      ? 'bg-primary text-primary-foreground'
                      : 'hover:bg-muted'
                  }`
                }
              >
                <item.icon className="h-4 w-4" />
                {item.title}
              </NavLink>
            ))}
          </div>
        </div>

        {/* Tools */}
        <div>
          <h3 className="text-sm font-semibold mb-2">Tools</h3>
          <div className="space-y-1">
            {toolsItems.map((item) => (
              <NavLink
                key={item.title}
                to={item.url}
                className={({ isActive }) =>
                  `flex items-center gap-2 px-3 py-2 text-sm rounded-md transition-colors ${
                    isActive
                      ? 'bg-primary text-primary-foreground'
                      : 'hover:bg-muted'
                  }`
                }
              >
                <item.icon className="h-4 w-4" />
                {item.title}
              </NavLink>
            ))}
          </div>
        </div>

        {/* Advanced */}
        <div>
          <h3 className="text-sm font-semibold mb-2">Advanced</h3>
          <div className="space-y-1">
            {advancedItems.map((item) => (
              <NavLink
                key={item.title}
                to={item.url}
                className={({ isActive }) =>
                  `flex items-center gap-2 px-3 py-2 text-sm rounded-md transition-colors ${
                    isActive
                      ? 'bg-primary text-primary-foreground'
                      : 'hover:bg-muted'
                  }`
                }
              >
                <item.icon className="h-4 w-4" />
                {item.title}
              </NavLink>
            ))}
          </div>
        </div>

        {/* Settings */}
        <div className="pt-4 border-t">
          <NavLink
            to="/settings"
            className={({ isActive }) =>
              `flex items-center gap-2 px-3 py-2 text-sm rounded-md transition-colors ${
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'hover:bg-muted'
              }`
            }
          >
            <Settings className="h-4 w-4" />
            Settings
          </NavLink>
        </div>
      </CardContent>
    </Card>
  );
}