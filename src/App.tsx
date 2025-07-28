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
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { PageLoading } from "@/components/Loading";
import NotificationCenter from "@/components/NotificationCenter";
import { Suspense } from "react";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Settings from "./pages/Settings";
import AIHub from "./pages/AIHub";
import Analytics from "./pages/Analytics";
import Mobile from "./pages/Mobile";
import NotFound from "./pages/NotFound";
import ApiDocumentation from "@/components/ApiDocumentation";
import Tracking from "./pages/Tracking";
import Measurements from "./pages/Measurements";
import ParkingLotDesigner from "./pages/ParkingLotDesigner";
import Projects from "./pages/Projects";
import PhotoReports from "./pages/PhotoReports";
import TeamManagement from "./pages/TeamManagement";
import EquipmentManagement from "./pages/EquipmentManagement";
import SchedulingSystem from "./pages/SchedulingSystem";
import FinancialManagement from "./pages/FinancialManagement";
import SafetyManagement from "./pages/SafetyManagement";
import PerformanceMonitor from "./components/PerformanceMonitor";
import AdvancedDashboard from "./components/AdvancedDashboard";
import VeteranResources from "./pages/VeteranResources";
import FleetManagement from "./pages/FleetManagement";
import CompanyResources from "./pages/CompanyResources";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 3,
      staleTime: 5 * 60 * 1000, // 5 minutes
      refetchOnWindowFocus: false,
    },
  },
});

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
                        <header className="h-12 flex items-center justify-between border-b bg-background px-4 w-full">
                          <div className="flex items-center">
                            <SidebarTrigger className="mr-2" />
                            <h2 className="font-semibold">PaveMaster Suite</h2>
                          </div>
                          <div className="flex items-center space-x-2">
                            <NotificationCenter />
                          </div>
                        </header>
                        <div className="flex flex-1 w-full">
                          <AppSidebar />
                          <main className="flex-1 overflow-auto">
                            <ErrorBoundary>
                              <Suspense fallback={<PageLoading title="Loading page..." />}>
                                <Routes>
                                  <Route path="/" element={<Index />} />
                                  <Route path="/settings" element={<Settings />} />
                                  <Route path="/ai" element={<AIHub />} />
                                  <Route path="/analytics" element={<Analytics />} />
                                  <Route path="/mobile" element={<Mobile />} />
                                  <Route path="/api-docs" element={<ApiDocumentation />} />
                                  {/* Feature pages */}
                                  <Route path="/tracking" element={<Tracking />} />
                                  <Route path="/measurements" element={<Measurements />} />
                                  <Route path="/parking-designer" element={<ParkingLotDesigner />} />
                                  <Route path="/projects" element={<Projects />} />
                                  {/* Management pages */}
                                  <Route path="/photos" element={<PhotoReports />} />
                                  <Route path="/team" element={<TeamManagement />} />
                                  <Route path="/equipment" element={<EquipmentManagement />} />
                                  <Route path="/schedule" element={<SchedulingSystem />} />
                                  <Route path="/finance" element={<FinancialManagement />} />
                                  <Route path="/safety" element={<SafetyManagement />} />
                                                              {/* Advanced Features */}
                            <Route path="/performance" element={<PerformanceMonitor />} />
                            <Route path="/dashboard-advanced" element={<AdvancedDashboard />} />
                            {/* Company Features */}
                            <Route path="/veterans" element={<VeteranResources />} />
                            <Route path="/fleet" element={<FleetManagement />} />
                            <Route path="/resources" element={<CompanyResources />} />
                            <Route path="*" element={<NotFound />} />
                                </Routes>
                              </Suspense>
                            </ErrorBoundary>
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