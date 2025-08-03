import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Suspense, lazy } from 'react';
import { AuthProvider } from './hooks/useAuth';
import { JargonProvider } from './contexts/JargonContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { SecurityMiddleware } from './components/security/SecurityMiddleware';
import Index from './pages/Index';
import Auth from './pages/Auth';
import Landing from './pages/Landing';
import './App.css';

// Lazy load heavy components to improve initial load time
const Projects = lazy(() => import('./pages/Projects'));
const Equipment = lazy(() => import('./pages/Equipment'));
const Fleet = lazy(() => import('./pages/Fleet'));
const Employees = lazy(() => import('./pages/Employees'));
const AIAssistant = lazy(() => import('./pages/AIAssistant'));
const OverWatch = lazy(() => import('./pages/OverWatch'));
const Estimates = lazy(() => import('./pages/Estimates'));
const Schedule = lazy(() => import('./pages/Schedule'));
const Tracking = lazy(() => import('./pages/Tracking'));
const Analytics = lazy(() => import('./pages/Analytics'));
const Settings = lazy(() => import('./pages/Settings'));
const Weather = lazy(() => import('./pages/Weather'));
const Materials = lazy(() => import('./pages/Materials'));
const Team = lazy(() => import('./pages/Team'));
const Safety = lazy(() => import('./pages/Safety'));
const Finance = lazy(() => import('./pages/Finance'));
const Documents = lazy(() => import('./pages/Documents'));
const CRM = lazy(() => import('./pages/CRM'));
const Mapping = lazy(() => import('./pages/Mapping'));
const Accounting = lazy(() => import('./pages/Accounting'));
const AIKnowledge = lazy(() => import('./pages/AIKnowledge'));
const PhotoReports = lazy(() => import('./pages/PhotoReports'));
const Notifications = lazy(() => import('./pages/Notifications'));
const Contracts = lazy(() => import('./pages/Contracts'));
const Mobile = lazy(() => import('./pages/Mobile'));
const Enterprise = lazy(() => import('./pages/Enterprise'));
const Security = lazy(() => import('./pages/Security'));
const VeteranResources = lazy(() => import('./pages/VeteranResources'));

// Loading fallback component
const LoadingFallback = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
  </div>
);

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
      'default-src \'self\'',
      'script-src \'self\' \'unsafe-inline\' \'unsafe-eval\'',
      'style-src \'self\' \'unsafe-inline\'',
      'img-src \'self\' data: https:',
      'connect-src \'self\' https:',
      'font-src \'self\'',
      'frame-ancestors \'none\'',
      'base-uri \'self\'',
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
              <Suspense fallback={<LoadingFallback />}>
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
                  <Route path="/contracts" element={
                    <ProtectedRoute>
                      <Contracts />
                    </ProtectedRoute>
                  } />
                  <Route path="/mobile" element={
                    <ProtectedRoute>
                      <Mobile />
                    </ProtectedRoute>
                  } />
                  <Route path="/enterprise" element={
                    <ProtectedRoute>
                      <Enterprise />
                    </ProtectedRoute>
                  } />
                  <Route path="/security" element={
                    <ProtectedRoute>
                      <Security />
                    </ProtectedRoute>
                  } />
                  <Route path="/settings" element={
                    <ProtectedRoute>
                      <Settings />
                    </ProtectedRoute>
                  } />
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </Suspense>
            </div>
          </Router>
        </SecurityMiddleware>
      </JargonProvider>
    </AuthProvider>
  );
}