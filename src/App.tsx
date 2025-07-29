import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router-dom";

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
      <div className="min-h-screen flex w-full bg-background text-foreground">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold">PaveMaster Suite</h1>
            <p className="text-lg text-muted-foreground">
              Comprehensive pavement management system for asphalt operations
            </p>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>✅ Project template updated to latest Lovable version</p>
              <p>✅ Core infrastructure configured</p>
              <p>✅ Environment variables fixed</p>
              <p>⚙️ UI components ready for development</p>
            </div>
          </div>
        </div>
      </div>
    </BrowserRouter>
  </QueryClientProvider>
);

export default App;