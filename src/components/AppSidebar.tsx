import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar"
import { NavLink, useLocation } from "react-router-dom"
import {
  Home,
  BarChart3,
  Brain,
  Settings,
  Smartphone,
  Users,
  Calendar,
  FileText,
  Wrench,
  DollarSign,
  Shield,
  MapPin,
  Camera,
  Activity,
  BookOpen,

} from "lucide-react"

const mainItems = [
  { title: "Dashboard", url: "/", icon: Home },
  { title: "Ultimate Mission Control", url: "/ultimate-mission-control", icon: Target },
  { title: "Quantum Operations", url: "/quantum", icon: Zap },
  { title: "Mission Control", url: "/mission-control", icon: Satellite },
  { title: "OverWatch TOSS", url: "/overwatch", icon: Command },
  { title: "AI Operations", url: "/ai-operations", icon: Brain },
  { title: "Analytics", url: "/analytics", icon: BarChart3 },
  { title: "Settings", url: "/settings", icon: Settings },
]

const fieldItems = [
  { title: "Mobile Field", url: "/mobile", icon: Smartphone },
  { title: "GPS Tracking", url: "/tracking", icon: MapPin },
  { title: "Photo Reports", url: "/photos", icon: Camera },
  { title: "Measurements", url: "/measurements", icon: Activity },
  { title: "Parking Designer", url: "/parking-designer", icon: Layout },
  { title: "IoT Monitoring", url: "/iot-monitoring", icon: Monitor },
]

const managementItems = [
  { title: "Projects", url: "/projects", icon: FileText },
  { title: "Team", url: "/team", icon: Users },
  { title: "Equipment", url: "/equipment", icon: Wrench },
  { title: "Fleet", url: "/fleet", icon: Truck },
  { title: "Schedule", url: "/schedule", icon: Calendar },
  { title: "Finance", url: "/finance", icon: DollarSign },
  { title: "Safety", url: "/safety", icon: Shield },
]

const companyItems = [
  { title: "Veterans", url: "/veterans", icon: Flag },
  { title: "Resources", url: "/resources", icon: Building2 },
]

export function AppSidebar() {
  const { open } = useSidebar()
  const location = useLocation()
  const currentPath = location.pathname

  const isActive = (path: string) => currentPath === path
  const getNavCls = ({ isActive }: { isActive: boolean }) =>
    isActive ? "bg-primary text-primary-foreground font-medium" : "hover:bg-muted/50"

  // Check if any item in a group is active to keep the group expanded
  const isMainExpanded = mainItems.some((item) => isActive(item.url))
  const isFieldExpanded = fieldItems.some((item) => isActive(item.url))
  const isManagementExpanded = managementItems.some((item) => isActive(item.url))
  const isCompanyExpanded = companyItems.some((item) => isActive(item.url))

  return (
    <Sidebar
      className={open ? "w-60" : "w-14"}
      collapsible="icon"
    >
      <SidebarTrigger className="m-2 self-end" />

      <SidebarContent>
        {/* Main Navigation */}
        <SidebarGroup>
          <SidebarGroupLabel>Main</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink to={item.url} end className={getNavCls}>
                      <item.icon className="mr-2 h-4 w-4" />
                      {open && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Field Operations */}
        <SidebarGroup>
          <SidebarGroupLabel>Field Operations</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {fieldItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink to={item.url} className={getNavCls}>
                      <item.icon className="mr-2 h-4 w-4" />
                      {open && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Management */}
        <SidebarGroup>
          <SidebarGroupLabel>Management</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {managementItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink to={item.url} className={getNavCls}>
                      <item.icon className="mr-2 h-4 w-4" />
                      {open && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Company */}
        <SidebarGroup>
          <SidebarGroupLabel>Company</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {companyItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink to={item.url} className={getNavCls}>
                      <item.icon className="mr-2 h-4 w-4" />
                      {open && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}
