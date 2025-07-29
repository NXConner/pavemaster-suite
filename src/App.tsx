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
import Tracking from "./pages/Tracking";
import Photos from "./pages/Photos";
import Measurements from "./pages/Measurements";
import Projects from "./pages/Projects";
import Team from "./pages/Team";
import Equipment from "./pages/Equipment";
import Schedule from "./pages/Schedule";
import Finance from "./pages/Finance";
import Safety from "./pages/Safety";

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
                              <Route path="/analytics" element={<Analytics />} />
                              <Route path="/mobile" element={<Mobile />} />
                              <Route path="/api-docs" element={<ApiDocumentation />} />
                              {/* Main application routes */}
                              <Route path="/tracking" element={<Tracking />} />
                              <Route path="/photos" element={<Photos />} />
                              <Route path="/measurements" element={<Measurements />} />
                              <Route path="/projects" element={<Projects />} />
                              <Route path="/team" element={<Team />} />
                              <Route path="/equipment" element={<Equipment />} />
                              <Route path="/schedule" element={<Schedule />} />
                              <Route path="/finance" element={<Finance />} />
                              <Route path="/safety" element={<Safety />} />
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