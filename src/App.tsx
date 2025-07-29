import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "./components/ui/toaster";
import AuthPage from "./components/AuthPage";
import Layout from "./components/Layout";
import Dashboard from "./components/Dashboard";
import Projects from "./components/Projects";
import Equipment from "./components/Equipment";
import TeamManagement from "./components/TeamManagement";
import IoTHub from "./components/IoTHub";
import Analytics from "./components/Analytics";
import WeatherMonitor from "./components/WeatherMonitor";
import IntelligenceEngine from "./components/IntelligenceEngine";
import SecurityMonitor from "./components/SecurityMonitor";
import BlockchainHub from "./components/BlockchainHub";
import Estimates from "./components/Estimates";
import CRM from "./components/CRM";
import FinancialDashboard from "./components/FinancialDashboard";
import MobileHub from "./components/mobile/MobileHub";
import IntegrationHub from "./components/integration/IntegrationHub";
import SafetyHub from "./components/safety/SafetyHub";
import ReportsHub from "./components/reports/ReportsHub";
import EnterpriseHub from "./components/enterprise/EnterpriseHub";
import AdvancedAI from "./components/ai/AdvancedAI";
import GISHub from "./components/mapping/GISHub";
import ProtectedRoute from "./components/ProtectedRoute";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: (failureCount, error) => {
        if (error?.status === 404) return false;
        return failureCount < 3;
      },
    },
    mutations: {
      retry: false,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Routes>
          <Route path="/auth" element={<AuthPage />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="projects" element={<Projects />} />
            <Route path="equipment" element={<Equipment />} />
            <Route path="team" element={<TeamManagement />} />
            <Route path="iot" element={<IoTHub />} />
            <Route path="analytics" element={<Analytics />} />
            <Route path="weather" element={<WeatherMonitor />} />
            <Route path="intelligence" element={<IntelligenceEngine />} />
            <Route path="security" element={<SecurityMonitor />} />
            <Route path="blockchain" element={<BlockchainHub />} />
            <Route path="estimates" element={<Estimates />} />
            <Route path="crm" element={<CRM />} />
            <Route path="financial" element={<FinancialDashboard />} />
            <Route path="mobile" element={<MobileHub />} />
            <Route path="integrations" element={<IntegrationHub />} />
            <Route path="safety" element={<SafetyHub />} />
            <Route path="reports" element={<ReportsHub />} />
            <Route path="enterprise" element={<EnterpriseHub />} />
            <Route path="ai" element={<AdvancedAI />} />
            <Route path="gis" element={<GISHub />} />
            <Route path="settings" element={<div>Settings Page - Coming Soon</div>} />
          </Route>
        </Routes>
        <Toaster />
      </div>
    </QueryClientProvider>
  );
}

export default App;