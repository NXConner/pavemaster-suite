import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Suspense, lazy } from "react";
import Index from "./pages/Index";

// Simple loading component
const PageLoading = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="text-lg">Loading...</div>
  </div>
);

// Lazy load pages that exist
const Settings = lazy(() => import("./pages/Settings").catch(() => ({ default: () => <div>Settings page not found</div> })));
const Analytics = lazy(() => import("./pages/Analytics").catch(() => ({ default: () => <div>Analytics page not found</div> })));
const Mobile = lazy(() => import("./pages/Mobile").catch(() => ({ default: () => <div>Mobile page not found</div> })));

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
    <BrowserRouter>
      <div className="min-h-screen bg-background text-foreground">
        <main className="container mx-auto px-4 py-8">
          <Suspense fallback={<PageLoading />}>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/analytics" element={<Analytics />} />
              <Route path="/mobile" element={<Mobile />} />
              <Route path="*" element={<div className="text-center py-8">Page not found</div>} />
            </Routes>
          </Suspense>
        </main>
      </div>
    </BrowserRouter>
  </QueryClientProvider>
);

export default App;