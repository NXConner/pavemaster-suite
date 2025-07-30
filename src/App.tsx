import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/AppSidebar"
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { ThemeProvider } from "@/hooks/useTheme";
import { JargonProvider } from "@/contexts/JargonContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { PageLoading } from "@/components/Loading";
import NotificationCenter from "@/components/NotificationCenter";
import { Suspense, lazy } from "react";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";

// Component imports for features that need direct loading
import CostCounter from "@/components/CostCounter";
import EmployeeTracker from "@/components/EmployeeTracker";

// Advanced components with lazy loading for performance
const OverWatchTOSS = lazy(() => import("@/components/OverWatchTOSS"));
const TaskPriorityManager = lazy(() => import("@/components/TaskPriorityManager"));
const AIOperationsCenter = lazy(() => import("@/components/AIOperationsCenter"));
const AdvancedAnalytics = lazy(() => import("@/components/AdvancedAnalytics"));
const MissionControlCenter = lazy(() => import("@/components/MissionControlCenter"));
const EnterpriseIntegrations = lazy(() => import("@/components/EnterpriseIntegrations"));
const MobileCompanion = lazy(() => import("@/components/MobileCompanion"));
const QuantumOperationsCenter = lazy(() => import("@/components/QuantumOperationsCenter"));
const UltimateEnhancedMissionControl = lazy(() => import("@/components/UltimateEnhancedMissionControl"));
const MaximizedCompanionApp = lazy(() => import("@/components/MaximizedCompanionApp"));

// Lazy load non-critical pages for better performance
const Settings = lazy(() => import("./pages/Settings"));
const AIHub = lazy(() => import("./pages/AIHub"));
const Analytics = lazy(() => import("./pages/Analytics"));
const Mobile = lazy(() => import("./pages/Mobile"));
const ApiDocumentation = lazy(() => import("@/components/ApiDocumentation"));
const Tracking = lazy(() => import("./pages/Tracking"));
const Measurements = lazy(() => import("./pages/Measurements"));
const ParkingLotDesigner = lazy(() => import("./pages/ParkingLotDesigner"));
const Projects = lazy(() => import("./pages/Projects"));
const PhotoReports = lazy(() => import("./pages/PhotoReports"));
const TeamManagement = lazy(() => import("./pages/TeamManagement"));
const EquipmentManagement = lazy(() => import("./pages/EquipmentManagement"));
const SchedulingSystem = lazy(() => import("./pages/SchedulingSystem"));
const FinancialManagement = lazy(() => import("./pages/FinancialManagement"));
const SafetyManagement = lazy(() => import("./pages/SafetyManagement"));
const PerformanceMonitor = lazy(() => import("./components/PerformanceMonitor"));
const AdvancedDashboard = lazy(() => import("./components/AdvancedDashboard"));
const PredictiveAnalytics = lazy(() => import("./components/PredictiveAnalytics"));
const IoTDashboard = lazy(() => import("./components/IoTDashboard"));
const GlobalExpansion = lazy(() => import("./components/GlobalExpansion"));
const VeteranResources = lazy(() => import("./pages/VeteranResources"));
const EnhancedVeteranResources = lazy(() => import("./pages/EnhancedVeteranResources"));
const JargonControlPanel = lazy(() => import("./components/JargonControlPanel"));
const FleetManagement = lazy(() => import("./pages/FleetManagement"));
const CompanyResources = lazy(() => import("./pages/CompanyResources"));

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
        <JargonProvider>
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
                                  
                                  {/* Advanced Feature Routes */}
                                  <Route path="/cost-counter" element={<CostCounter />} />
                                  <Route path="/employee-tracker" element={<EmployeeTracker />} />
                                  <Route path="/overwatch" element={<OverWatchTOSS />} />
                                  <Route path="/task-priorities" element={<TaskPriorityManager />} />
                                  <Route path="/ai-operations" element={<AIOperationsCenter />} />
                                  <Route path="/mission-control" element={<MissionControlCenter />} />
                                  <Route path="/integrations" element={<EnterpriseIntegrations />} />
                                  <Route path="/mobile-companion" element={<MobileCompanion />} />
                                  <Route path="/quantum" element={<QuantumOperationsCenter />} />
                                  <Route path="/ultimate-mission-control" element={<UltimateEnhancedMissionControl />} />
                                  <Route path="/maximized-companion" element={<MaximizedCompanionApp />} />
                                  
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
                                  <Route path="/predictive-analytics" element={<PredictiveAnalytics />} />
                                  <Route path="/iot-monitoring" element={<IoTDashboard />} />
                                  <Route path="/global-expansion" element={<GlobalExpansion />} />
                                  
                                  {/* Company Features */}
                                  <Route path="/veterans" element={<VeteranResources />} />
                                  <Route path="/veterans-enhanced" element={<EnhancedVeteranResources />} />
                                  <Route path="/jargon-control" element={<JargonControlPanel />} />
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
        </JargonProvider>
      </ThemeProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;