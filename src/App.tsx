import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
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
import { Suspense, lazy } from "react";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";

// Lazy load pages for better performance
const Settings = lazy(() => import("./pages/Settings"));

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