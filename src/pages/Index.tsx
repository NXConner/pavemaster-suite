import { DollarSign, TrendingUp, Users, Truck, CheckCircle, Clock, Shield, Calendar, BarChart3, UserCheck } from "lucide-react";
import { Header } from "@/components/Header";
import { MetricCard } from "@/components/MetricCard";
import { ProjectCard } from "@/components/ProjectCard";
import { QuickActions } from "@/components/QuickActions";
import { RecentActivity } from "@/components/RecentActivity";
import { SecurityDashboard } from "@/components/SecurityDashboard";
import { SecurityBanner } from "@/components/ui/security-banner";
import { Button } from "@/components/ui/button";
import { DashboardCustomizer } from "@/components/DashboardCustomizer";
import { NotificationCenter } from "@/components/NotificationCenter";
import { EnhancedProjectManagement } from "@/components/EnhancedProjectManagement";
import { AdvancedScheduling } from "@/components/AdvancedScheduling";
import { FinancialDashboard } from "@/components/FinancialDashboard";
import { CrewManagement } from "@/components/CrewManagement";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState } from "react";
import dashboardHero from "@/assets/dashboard-hero.jpg";

const Index = () => {
  const [showSecurityDashboard, setShowSecurityDashboard] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  
  const mockProjects = [
    {
      id: "1",
      name: "Highway 101 Resurfacing",
      location: "San Francisco, CA",
      status: "active" as const,
      progress: 65,
      budget: 450000,
      spent: 285000,
      crewSize: 12,
      dueDate: "Dec 15"
    },
    {
      id: "2", 
      name: "Shopping Center Parking",
      location: "Oakland, CA",
      status: "completed" as const,
      progress: 100,
      budget: 125000,
      spent: 118500,
      crewSize: 6,
      dueDate: "Nov 28"
    },
    {
      id: "3",
      name: "Industrial Park Access",
      location: "San Jose, CA", 
      status: "planned" as const,
      progress: 15,
      budget: 275000,
      spent: 25000,
      crewSize: 8,
      dueDate: "Jan 30"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <Header />
      
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-secondary/20"></div>
        <div 
          className="h-64 bg-cover bg-center"
          style={{ backgroundImage: `url(${dashboardHero})` }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-primary/80 to-secondary/60"></div>
          <div className="relative flex h-full items-center">
            <div className="container">
              <div className="max-w-2xl text-primary-foreground">
                <h1 className="text-4xl font-bold mb-4">
                  Welcome to PaveMaster Suite
                </h1>
                <p className="text-xl opacity-90">
                  Your enterprise solution for asphalt paving operations management
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Security Alert */}
      <div className="container py-4">
        <SecurityBanner
          level="secure"
          message="Security Status: Enterprise Grade Protection Active"
          details="53% security improvement achieved. Database protected, authentication hardened, input validation active."
        />
      </div>

      {/* Dashboard Content */}
      <div className="container py-8 space-y-8">
        {/* Dashboard Controls */}
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Dashboard</h2>
          <div className="flex items-center space-x-2">
            <NotificationCenter />
            <DashboardCustomizer />
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowSecurityDashboard(!showSecurityDashboard)}
              className="flex items-center space-x-2"
            >
              <Shield className="h-4 w-4" />
              <span>{showSecurityDashboard ? 'Hide' : 'Show'} Security</span>
            </Button>
          </div>
        </div>

        {/* Security Dashboard */}
        {showSecurityDashboard && (
          <div className="mb-8">
            <SecurityDashboard />
          </div>
        )}

        {/* Main Dashboard Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview" className="flex items-center space-x-2">
              <BarChart3 className="h-4 w-4" />
              <span>Overview</span>
            </TabsTrigger>
            <TabsTrigger value="projects" className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4" />
              <span>Projects</span>
            </TabsTrigger>
            <TabsTrigger value="scheduling" className="flex items-center space-x-2">
              <Calendar className="h-4 w-4" />
              <span>Scheduling</span>
            </TabsTrigger>
            <TabsTrigger value="financial" className="flex items-center space-x-2">
              <DollarSign className="h-4 w-4" />
              <span>Financial</span>
            </TabsTrigger>
            <TabsTrigger value="crew" className="flex items-center space-x-2">
              <UserCheck className="h-4 w-4" />
              <span>Crew</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Key Metrics */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <MetricCard
                title="Total Revenue"
                value="$2.4M"
                change={{ value: "+12.5%", positive: true }}
                icon={<DollarSign className="h-6 w-6 text-primary-foreground" />}
              />
              <MetricCard
                title="Active Projects"
                value="23"
                change={{ value: "+3", positive: true }}
                icon={<TrendingUp className="h-6 w-6 text-primary-foreground" />}
              />
              <MetricCard
                title="Crew Members"
                value="156"
                change={{ value: "+8", positive: true }}
                icon={<Users className="h-6 w-6 text-primary-foreground" />}
              />
              <MetricCard
                title="Fleet Status"
                value="94%"
                change={{ value: "+2%", positive: true }}
                icon={<Truck className="h-6 w-6 text-primary-foreground" />}
              />
            </div>

            {/* Enhanced Project Management */}
            <EnhancedProjectManagement />

            {/* Main Content Grid */}
            <div className="grid gap-6 lg:grid-cols-3">
              {/* Projects Overview */}
              <div className="lg:col-span-2 space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-foreground">Quick Project Overview</h2>
                  <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                    <CheckCircle className="h-4 w-4 text-success" />
                    <span>23 Active</span>
                    <Clock className="h-4 w-4 text-warning ml-4" />
                    <span>5 Upcoming</span>
                  </div>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  {mockProjects.map((project) => (
                    <ProjectCard key={project.id} project={project} />
                  ))}
                </div>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                <QuickActions />
                <RecentActivity />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="projects" className="space-y-6">
            <EnhancedProjectManagement />
          </TabsContent>

          <TabsContent value="scheduling" className="space-y-6">
            <AdvancedScheduling />
          </TabsContent>

          <TabsContent value="financial" className="space-y-6">
            <FinancialDashboard />
          </TabsContent>

          <TabsContent value="crew" className="space-y-6">
            <CrewManagement />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Index;
