import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './hooks/useAuth';
import { JargonProvider } from './contexts/JargonContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { SecurityMiddleware } from './components/security/SecurityMiddleware';
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
import VeteranResources from './pages/VeteranResources';
import './App.css';

export default function App() {
  // Set enhanced security headers via meta tags
  if (typeof document !== 'undefined') {
    const setMetaTag = (name: string, content: string) => {
      let meta = document.querySelector(`meta[name="${name}"]`) as HTMLMetaElement;
      if (!meta) {
        meta = document.createElement('meta');
        meta.name = name;
        document.head.appendChild(meta);
      }
      meta.content = content;
    };

    const setHttpEquivTag = (httpEquiv: string, content: string) => {
      let meta = document.querySelector(`meta[http-equiv="${httpEquiv}"]`) as HTMLMetaElement;
      if (!meta) {
        meta = document.createElement('meta');
        meta.httpEquiv = httpEquiv;
        document.head.appendChild(meta);
      }
      meta.content = content;
    };

    // Enhanced Content Security Policy
    const cspPolicy = [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: https:",
      "connect-src 'self' https:",
      "font-src 'self'",
      "frame-ancestors 'none'",
      "base-uri 'self'"
    ].join('; ');

    // Set security headers
    setHttpEquivTag('Content-Security-Policy', cspPolicy);
    setMetaTag('X-Content-Type-Options', 'nosniff');
    setMetaTag('X-Frame-Options', 'DENY');
    setMetaTag('X-XSS-Protection', '1; mode=block');
    setMetaTag('Referrer-Policy', 'strict-origin-when-cross-origin');
    setMetaTag('Permissions-Policy', 'camera=(), microphone=(), geolocation=(self)');
  }

  return (
    <AuthProvider>
      <JargonProvider>
        <SecurityMiddleware>
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
            <Route path="/veteran-resources" element={
              <ProtectedRoute>
                <VeteranResources />
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
      </SecurityMiddleware>
    </JargonProvider>
  </AuthProvider>
  );
}