import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router-dom";
import TempIndex from "./components/TempIndex";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 3,
      staleTime: 5 * 60 * 1000, // 5 minutes
      refetchOnWindowFocus: false,
    },
  },
});

const App = () => {
  console.log("PaveMaster Suite: Template updated successfully!");

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <TempIndex />
      </BrowserRouter>
    </QueryClientProvider>
  );
};

export default App;