import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { ThemeProvider } from "@/hooks/useTheme";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { PageLoading } from "@/components/Loading";
import NotificationCenter from "@/components/NotificationCenter";
import { Suspense, useEffect } from "react";
import NotFound from "./pages/NotFound";

// PHASE 9: Import optimized lazy routes
import {
  IndexPage,
  AuthPage,
  SettingsPage,
  TeamManagementPage,
  EquipmentManagementPage,
  FinancialManagementPage,
  SafetyManagementPage,
  SchedulingSystemPage,
  ProjectsPage,
  ParkingLotDesignerPage,
  PhotoReportsPage,
  MeasurementsPage,
  TrackingPage,
  AnalyticsPage,
  AIHubPage,
  MobilePage,
  VeteranResourcesPage,
  FleetManagementPage,
  CompanyResourcesPage,
  OverWatchTOSS,
  TaskPriorityManager,
  AIOperationsCenter,
  AdvancedAnalytics,
  MissionControlCenter,
  EnterpriseIntegrations,
  MobileCompanion,
  QuantumOperationsCenter,
  UltimateEnhancedMissionControl,
  PerformanceMonitor,
  AdvancedDashboard,
  PredictiveAnalytics,
  IoTDashboard,
  GlobalExpansion,
  ApiDocumentation,
  LazyRoute,
  preloadCriticalRoutes,
  useSmartPreloading
} from "@/router/LazyRoutes";

// Component imports for features that need direct loading (kept minimal)
import CostCounter from "@/components/CostCounter";
import EmployeeTracker from "@/components/EmployeeTracker";

// PHASE 9: Enhanced QueryClient with optimized settings
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 3,
      staleTime: 5 * 60 * 1000, // 5 minutes
      refetchOnWindowFocus: false,
      // PHASE 9: Enhanced caching strategy
      gcTime: 10 * 60 * 1000, // 10 minutes (renamed from cacheTime)
      refetchOnReconnect: true,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    },
    mutations: {
      retry: 1,
      retryDelay: 1000,
    },
  },
});

// PHASE 9: Smart preloading component
const SmartPreloader = () => {
  const location = useLocation();
  const smartPreload = useSmartPreloading();

  useEffect(() => {
    smartPreload(location.pathname);
  }, [location.pathname, smartPreload]);

  useEffect(() => {
    // Preload critical routes on app startup
    preloadCriticalRoutes();
  }, []);

  return null;
};

// PHASE 9: Enhanced loading fallbacks for different route types
const getCriticalLoadingFallback = (title: string) => (
  <PageLoading title={title} />
);

const getStandardLoadingFallback = (title: string) => (
  <div className="flex items-center justify-center h-64">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
    <span className="ml-3 text-sm text-gray-600">{title}</span>
  </div>
);

const getAdvancedLoadingFallback = (title: string) => (
  <div className="flex flex-col items-center justify-center h-64 space-y-4">
    <div className="relative">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      <div className="animate-ping absolute top-0 left-0 h-12 w-12 rounded-full border border-blue-400 opacity-25"></div>
    </div>
    <div className="text-center">
      <p className="text-sm font-medium text-gray-700">{title}</p>
      <p className="text-xs text-gray-500 mt-1">Loading advanced features...</p>
    </div>
  </div>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <ThemeProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <SmartPreloader />
            <SidebarProvider>
              <div className="min-h-screen flex w-full">
                <Routes>
                  <Route 
                    path="/auth" 
                    element={
                      <LazyRoute 
                        component={AuthPage} 
                        fallback={getCriticalLoadingFallback("Loading authentication...")} 
                      />
                    } 
                  />
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
                          {/* Sidebar component removed - using main layout */}
                          <main className="flex-1 overflow-auto">
                            <ErrorBoundary>
                              <Routes>
                                {/* PHASE 9: Core routes with critical loading */}
                                <Route 
                                  path="/" 
                                  element={
                                    <LazyRoute 
                                      component={IndexPage} 
                                      fallback={getCriticalLoadingFallback("Loading dashboard...")} 
                                    />
                                  } 
                                />
                                <Route 
                                  path="/settings" 
                                  element={
                                    <LazyRoute 
                                      component={SettingsPage} 
                                      fallback={getCriticalLoadingFallback("Loading settings...")} 
                                    />
                                  } 
                                />

                                {/* PHASE 9: Management routes with standard loading */}
                                <Route 
                                  path="/team" 
                                  element={
                                    <LazyRoute 
                                      component={TeamManagementPage} 
                                      fallback={getStandardLoadingFallback("Loading team management...")} 
                                    />
                                  } 
                                />
                                <Route 
                                  path="/equipment" 
                                  element={
                                    <LazyRoute 
                                      component={EquipmentManagementPage} 
                                      fallback={getStandardLoadingFallback("Loading equipment management...")} 
                                    />
                                  } 
                                />
                                <Route 
                                  path="/finance" 
                                  element={
                                    <LazyRoute 
                                      component={FinancialManagementPage} 
                                      fallback={getStandardLoadingFallback("Loading financial management...")} 
                                    />
                                  } 
                                />
                                <Route 
                                  path="/safety" 
                                  element={
                                    <LazyRoute 
                                      component={SafetyManagementPage} 
                                      fallback={getStandardLoadingFallback("Loading safety management...")} 
                                    />
                                  } 
                                />
                                <Route 
                                  path="/schedule" 
                                  element={
                                    <LazyRoute 
                                      component={SchedulingSystemPage} 
                                      fallback={getStandardLoadingFallback("Loading scheduling system...")} 
                                    />
                                  } 
                                />

                                {/* PHASE 9: Project routes with standard loading */}
                                <Route 
                                  path="/projects" 
                                  element={
                                    <LazyRoute 
                                      component={ProjectsPage} 
                                      fallback={getStandardLoadingFallback("Loading projects...")} 
                                    />
                                  } 
                                />
                                <Route 
                                  path="/parking-designer" 
                                  element={
                                    <LazyRoute 
                                      component={ParkingLotDesignerPage} 
                                      fallback={getStandardLoadingFallback("Loading parking lot designer...")} 
                                    />
                                  } 
                                />
                                <Route 
                                  path="/photos" 
                                  element={
                                    <LazyRoute 
                                      component={PhotoReportsPage} 
                                      fallback={getStandardLoadingFallback("Loading photo reports...")} 
                                    />
                                  } 
                                />
                                <Route 
                                  path="/measurements" 
                                  element={
                                    <LazyRoute 
                                      component={MeasurementsPage} 
                                      fallback={getStandardLoadingFallback("Loading measurements...")} 
                                    />
                                  } 
                                />
                                <Route 
                                  path="/tracking" 
                                  element={
                                    <LazyRoute 
                                      component={TrackingPage} 
                                      fallback={getStandardLoadingFallback("Loading tracking...")} 
                                    />
                                  } 
                                />

                                {/* PHASE 9: Analytics and AI routes */}
                                <Route 
                                  path="/analytics" 
                                  element={
                                    <LazyRoute 
                                      component={AnalyticsPage} 
                                      fallback={getAdvancedLoadingFallback("Loading analytics...")} 
                                    />
                                  } 
                                />
                                <Route 
                                  path="/ai" 
                                  element={
                                    <LazyRoute 
                                      component={AIHubPage} 
                                      fallback={getAdvancedLoadingFallback("Loading AI hub...")} 
                                    />
                                  } 
                                />

                                {/* PHASE 9: Mobile routes */}
                                <Route 
                                  path="/mobile" 
                                  element={
                                    <LazyRoute 
                                      component={MobilePage} 
                                      fallback={getStandardLoadingFallback("Loading mobile features...")} 
                                    />
                                  } 
                                />

                                {/* PHASE 9: Advanced Feature Routes with enhanced loading */}
                                <Route path="/cost-counter" element={<CostCounter />} />
                                <Route path="/employee-tracker" element={<EmployeeTracker />} />
                                
                                <Route 
                                  path="/overwatch" 
                                  element={
                                    <LazyRoute 
                                      component={OverWatchTOSS} 
                                      fallback={getAdvancedLoadingFallback("Loading OverWatch system...")} 
                                    />
                                  } 
                                />
                                <Route 
                                  path="/task-priorities" 
                                  element={
                                    <LazyRoute 
                                      component={TaskPriorityManager} 
                                      fallback={getAdvancedLoadingFallback("Loading task priority manager...")} 
                                    />
                                  } 
                                />
                                <Route 
                                  path="/ai-operations" 
                                  element={
                                    <LazyRoute 
                                      component={AIOperationsCenter} 
                                      fallback={getAdvancedLoadingFallback("Loading AI operations center...")} 
                                    />
                                  } 
                                />
                                <Route 
                                  path="/mission-control" 
                                  element={
                                    <LazyRoute 
                                      component={MissionControlCenter} 
                                      fallback={getAdvancedLoadingFallback("Loading mission control center...")} 
                                    />
                                  } 
                                />
                                <Route 
                                  path="/integrations" 
                                  element={
                                    <LazyRoute 
                                      component={EnterpriseIntegrations} 
                                      fallback={getAdvancedLoadingFallback("Loading enterprise integrations...")} 
                                    />
                                  } 
                                />
                                <Route 
                                  path="/mobile-companion" 
                                  element={
                                    <LazyRoute 
                                      component={MobileCompanion} 
                                      fallback={getAdvancedLoadingFallback("Loading mobile companion...")} 
                                    />
                                  } 
                                />
                                <Route 
                                  path="/quantum" 
                                  element={
                                    <LazyRoute 
                                      component={QuantumOperationsCenter} 
                                      fallback={getAdvancedLoadingFallback("Loading quantum operations center...")} 
                                    />
                                  } 
                                />
                                <Route 
                                  path="/ultimate-mission-control" 
                                  element={
                                    <LazyRoute 
                                      component={UltimateEnhancedMissionControl} 
                                      fallback={getAdvancedLoadingFallback("Loading ultimate mission control...")} 
                                    />
                                  } 
                                />
                                
                                {/* PHASE 9: Advanced Analytics Features */}
                                <Route 
                                  path="/performance" 
                                  element={
                                    <LazyRoute 
                                      component={PerformanceMonitor} 
                                      fallback={getAdvancedLoadingFallback("Loading performance monitor...")} 
                                    />
                                  } 
                                />
                                <Route 
                                  path="/dashboard-advanced" 
                                  element={
                                    <LazyRoute 
                                      component={AdvancedDashboard} 
                                      fallback={getAdvancedLoadingFallback("Loading advanced dashboard...")} 
                                    />
                                  } 
                                />
                                <Route 
                                  path="/predictive-analytics" 
                                  element={
                                    <LazyRoute 
                                      component={PredictiveAnalytics} 
                                      fallback={getAdvancedLoadingFallback("Loading predictive analytics...")} 
                                    />
                                  } 
                                />
                                <Route 
                                  path="/iot-monitoring" 
                                  element={
                                    <LazyRoute 
                                      component={IoTDashboard} 
                                      fallback={getAdvancedLoadingFallback("Loading IoT monitoring...")} 
                                    />
                                  } 
                                />
                                <Route 
                                  path="/global-expansion" 
                                  element={
                                    <LazyRoute 
                                      component={GlobalExpansion} 
                                      fallback={getAdvancedLoadingFallback("Loading global expansion features...")} 
                                    />
                                  } 
                                />
                                
                                {/* PHASE 9: Company Features */}
                                <Route 
                                  path="/veterans" 
                                  element={
                                    <LazyRoute 
                                      component={VeteranResourcesPage} 
                                      fallback={getStandardLoadingFallback("Loading veteran resources...")} 
                                    />
                                  } 
                                />
                                <Route 
                                  path="/fleet" 
                                  element={
                                    <LazyRoute 
                                      component={FleetManagementPage} 
                                      fallback={getStandardLoadingFallback("Loading fleet management...")} 
                                    />
                                  } 
                                />
                                <Route 
                                  path="/resources" 
                                  element={
                                    <LazyRoute 
                                      component={CompanyResourcesPage} 
                                      fallback={getStandardLoadingFallback("Loading company resources...")} 
                                    />
                                  } 
                                />

                                {/* PHASE 9: API Documentation */}
                                <Route 
                                  path="/api-docs" 
                                  element={
                                    <LazyRoute 
                                      component={ApiDocumentation} 
                                      fallback={getStandardLoadingFallback("Loading API documentation...")} 
                                    />
                                  } 
                                />
                                
                                <Route path="*" element={<NotFound />} />
                              </Routes>
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