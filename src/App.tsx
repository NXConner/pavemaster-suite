import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/AppSidebar"
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { ThemeProvider } from "@/hooks/useTheme";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Settings from "./pages/Settings";
import AIHub from "./pages/AIHub";
import Analytics from "./pages/Analytics";
import Mobile from "./pages/Mobile";
import NotFound from "./pages/NotFound";
import ApiDocumentation from "@/components/ApiDocumentation";
import CostCounter from "@/components/CostCounter";
import EmployeeTracker from "@/components/EmployeeTracker";
import OverWatchTOSS from "@/components/OverWatchTOSS";
import TaskPriorityManager from "@/components/TaskPriorityManager";
import AIOperationsCenter from "@/components/AIOperationsCenter";
import AdvancedAnalytics from "@/components/AdvancedAnalytics";
import MissionControlCenter from "@/components/MissionControlCenter";
import EnterpriseIntegrations from "@/components/EnterpriseIntegrations";
import MobileCompanion from "@/components/MobileCompanion";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <ThemeProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <SidebarProvider>
              <div className="min-h-screen flex w-full">
                <Routes>
                  <Route path="/auth" element={<Auth />} />
                  <Route path="/*" element={
                    <ProtectedRoute>
                      <>
                        <header className="h-12 flex items-center border-b bg-background px-4 w-full">
                          <SidebarTrigger className="mr-2" />
                          <h2 className="font-semibold">PaveMaster Suite</h2>
                        </header>
                        <div className="flex flex-1 w-full">
                          <AppSidebar />
                          <main className="flex-1 overflow-auto">
                            <Routes>
                              <Route path="/" element={<Index />} />
                              <Route path="/settings" element={<Settings />} />
                              <Route path="/ai" element={<AIHub />} />
                              <Route path="/analytics" element={<AdvancedAnalytics />} />
                              <Route path="/mobile" element={<MobileCompanion />} />
                              <Route path="/api-docs" element={<ApiDocumentation />} />
                              <Route path="/cost-counter" element={<CostCounter />} />
                              <Route path="/employee-tracker" element={<EmployeeTracker />} />
                              <Route path="/overwatch" element={<OverWatchTOSS />} />
                              <Route path="/task-priorities" element={<TaskPriorityManager />} />
                              <Route path="/ai-operations" element={<AIOperationsCenter />} />
                              <Route path="/advanced-analytics" element={<AdvancedAnalytics />} />
                              <Route path="/mission-control" element={<MissionControlCenter />} />
                              <Route path="/integrations" element={<EnterpriseIntegrations />} />
                              <Route path="/mobile" element={<MobileCompanion />} />
                              {/* Placeholder routes for sidebar items */}
                              <Route path="/tracking" element={<EmployeeTracker />} />
                              <Route path="/photos" element={<div className="p-6"><h1>Photo Reports (Coming Soon)</h1></div>} />
                              <Route path="/measurements" element={<div className="p-6"><h1>Measurements (Coming Soon)</h1></div>} />
                              <Route path="/projects" element={<TaskPriorityManager />} />
                              <Route path="/team" element={<div className="p-6"><h1>Team Management (Coming Soon)</h1></div>} />
                              <Route path="/equipment" element={<div className="p-6"><h1>Equipment (Coming Soon)</h1></div>} />
                              <Route path="/schedule" element={<div className="p-6"><h1>Schedule (Coming Soon)</h1></div>} />
                              <Route path="/finance" element={<CostCounter />} />
                              <Route path="/safety" element={<div className="p-6"><h1>Safety (Coming Soon)</h1></div>} />
                              <Route path="*" element={<NotFound />} />
                            </Routes>
                          </main>
                        </div>
                      </>
                    </ProtectedRoute>
                  } />
                </Routes>
              </div>
            </SidebarProvider>
          </BrowserRouter>
        </TooltipProvider>
      </ThemeProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;