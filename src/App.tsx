import { Toaster } from '@/components/ui/toaster';
import { AuthProvider } from '@/hooks/useAuth';
import Index from '@/pages/Index';

export default function App() {
  return (
    <AuthProvider>
      <div className="min-h-screen bg-background">
        <Index />
        <Toaster />
      </div>
    </AuthProvider>
  );
}