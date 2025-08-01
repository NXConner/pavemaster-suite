import { AuthProvider } from './hooks/useAuth';
import { ProtectedRoute } from './components/ProtectedRoute';
import Index from './pages/Index';
import Auth from './pages/Auth';

export default function App() {
  const currentPath = window.location.pathname;

  return (
    <AuthProvider>
      <div className="min-h-screen bg-background">
        {currentPath === '/auth' ? (
          <Auth />
        ) : (
          <ProtectedRoute>
            <Index />
          </ProtectedRoute>
        )}
      </div>
    </AuthProvider>
  );
}