import { useAuth } from '../hooks/useAuth';
import { Button } from '../components/ui/button';

export default function Index() {
  const { user, signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    window.location.href = '/auth';
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="flex justify-between items-center p-4 max-w-7xl mx-auto">
          <h1 className="text-2xl font-bold">PaveMaster Suite</h1>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-muted-foreground">
              Welcome, {user?.email}
            </span>
            <Button variant="outline" onClick={handleSignOut}>
              Sign Out
            </Button>
          </div>
        </div>
      </header>
      
      <div className="flex items-center justify-center min-h-[calc(100vh-80px)]">
        <div className="space-y-6 w-full max-w-4xl mx-auto p-6">
          <div className="text-center">
            <h2 className="text-4xl font-bold mb-4">Dashboard</h2>
            <p className="text-xl text-muted-foreground">
              Professional asphalt paving and sealing management system
            </p>
          </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 border rounded-lg">
            <h3 className="text-lg font-semibold mb-2">Projects</h3>
            <p className="text-sm text-muted-foreground mb-4">Manage your paving projects</p>
            <button className="w-full px-4 py-2 bg-primary text-primary-foreground rounded-md">
              View Projects
            </button>
          </div>
          
          <div className="p-6 border rounded-lg">
            <h3 className="text-lg font-semibold mb-2">Equipment</h3>
            <p className="text-sm text-muted-foreground mb-4">Track equipment and fleet</p>
            <button className="w-full px-4 py-2 bg-primary text-primary-foreground rounded-md">
              Manage Equipment
            </button>
          </div>
          
          <div className="p-6 border rounded-lg">
            <h3 className="text-lg font-semibold mb-2">Analytics</h3>
            <p className="text-sm text-muted-foreground mb-4">Business insights and reports</p>
            <button className="w-full px-4 py-2 bg-primary text-primary-foreground rounded-md">
              View Analytics
            </button>
          </div>
        </div>
        </div>
      </div>
    </div>
  );
}