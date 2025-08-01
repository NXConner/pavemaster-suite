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
  Cloud
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";

const navigationItems = [
  { title: "Dashboard", url: "/", icon: Home },
  { title: "Projects", url: "/projects", icon: Building },
  { title: "Employees", url: "/employees", icon: Users },
  { title: "Equipment", url: "/equipment", icon: Truck },
  { title: "Fleet", url: "/fleet", icon: MapPin },
];

const toolsItems = [
  { title: "Estimates", url: "/estimates", icon: Calculator },
  { title: "Schedule", url: "/schedule", icon: Calendar },
  { title: "Tracking", url: "/tracking", icon: MapPin },
  { title: "Weather", url: "/weather", icon: Cloud },
  { title: "Analytics", url: "/analytics", icon: BarChart },
];

const advancedItems = [
  { title: "AI Assistant", url: "/ai-assistant", icon: Bot },
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