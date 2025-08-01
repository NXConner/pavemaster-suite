import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './hooks/useAuth';
import { JargonProvider } from './contexts/JargonContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import Index from './pages/Index';
import Auth from './pages/Auth';
import Projects from './pages/Projects';
import Equipment from './pages/Equipment';
import Fleet from './pages/Fleet';
import Employees from './pages/Employees';
import Landing from './pages/Landing';
import AIAssistant from './pages/AIAssistant';
import OverWatch from './pages/OverWatch';
import Estimates from './pages/Estimates';
import Schedule from './pages/Schedule';
import Tracking from './pages/Tracking';
import Analytics from './pages/Analytics';
import Settings from './pages/Settings';
import Weather from './pages/Weather';
import Materials from './pages/Materials';
import Team from './pages/Team';
import Safety from './pages/Safety';
import Finance from './pages/Finance';
import Documents from './pages/Documents';
import CRM from './pages/CRM';
import Mapping from './pages/Mapping';
import Accounting from './pages/Accounting';
import AIKnowledge from './pages/AIKnowledge';
import PhotoReports from './pages/PhotoReports';
import Notifications from './pages/Notifications';

export default function App() {
  return (
    <AuthProvider>
      <JargonProvider>
        <Router>
          <div className="min-h-screen bg-background">
            <Routes>
            <Route path="/auth" element={<Auth />} />
            <Route path="/landing" element={<Landing />} />
            <Route path="/" element={
              <ProtectedRoute>
                <Index />
              </ProtectedRoute>
            } />
            <Route path="/projects" element={
              <ProtectedRoute>
                <Projects />
              </ProtectedRoute>
            } />
            <Route path="/equipment" element={
              <ProtectedRoute>
                <Equipment />
              </ProtectedRoute>
            } />
            <Route path="/fleet" element={
              <ProtectedRoute>
                <Fleet />
              </ProtectedRoute>
            } />
            <Route path="/employees" element={
              <ProtectedRoute>
                <Employees />
              </ProtectedRoute>
            } />
            <Route path="/ai-assistant" element={
              <ProtectedRoute>
                <AIAssistant />
              </ProtectedRoute>
            } />
            <Route path="/overwatch" element={
              <ProtectedRoute>
                <OverWatch />
              </ProtectedRoute>
            } />
            <Route path="/estimates" element={
              <ProtectedRoute>
                <Estimates />
              </ProtectedRoute>
            } />
            <Route path="/schedule" element={
              <ProtectedRoute>
                <Schedule />
              </ProtectedRoute>
            } />
            <Route path="/tracking" element={
              <ProtectedRoute>
                <Tracking />
              </ProtectedRoute>
            } />
            <Route path="/analytics" element={
              <ProtectedRoute>
                <Analytics />
              </ProtectedRoute>
            } />
            <Route path="/weather" element={
              <ProtectedRoute>
                <Weather />
              </ProtectedRoute>
            } />
            <Route path="/materials" element={
              <ProtectedRoute>
                <Materials />
              </ProtectedRoute>
            } />
            <Route path="/team" element={
              <ProtectedRoute>
                <Team />
              </ProtectedRoute>
            } />
            <Route path="/safety" element={
              <ProtectedRoute>
                <Safety />
              </ProtectedRoute>
            } />
            <Route path="/finance" element={
              <ProtectedRoute>
                <Finance />
              </ProtectedRoute>
            } />
            <Route path="/documents" element={
              <ProtectedRoute>
                <Documents />
              </ProtectedRoute>
            } />
            <Route path="/crm" element={
              <ProtectedRoute>
                <CRM />
              </ProtectedRoute>
            } />
            <Route path="/mapping" element={
              <ProtectedRoute>
                <Mapping />
              </ProtectedRoute>
            } />
            <Route path="/accounting" element={
              <ProtectedRoute>
                <Accounting />
              </ProtectedRoute>
            } />
            <Route path="/knowledge" element={
              <ProtectedRoute>
                <AIKnowledge />
              </ProtectedRoute>
            } />
            <Route path="/photo-reports" element={
              <ProtectedRoute>
                <PhotoReports />
              </ProtectedRoute>
            } />
            <Route path="/notifications" element={
              <ProtectedRoute>
                <Notifications />
              </ProtectedRoute>
            } />
            <Route path="/settings" element={
              <ProtectedRoute>
                <Settings />
              </ProtectedRoute>
            } />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </Router>
    </JargonProvider>
  </AuthProvider>
  );
}