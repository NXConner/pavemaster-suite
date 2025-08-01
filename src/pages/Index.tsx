import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import Dashboard from '@/components/Dashboard';

export default function Index() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="space-y-6 w-full max-w-4xl mx-auto p-6">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-4">PaveMaster Suite</h1>
            <p className="text-xl text-muted-foreground">
              Professional asphalt paving and sealing management system
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Projects</CardTitle>
                <CardDescription>Manage your paving projects</CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full">View Projects</Button>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Equipment</CardTitle>
                <CardDescription>Track equipment and fleet</CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full">Manage Equipment</Button>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Analytics</CardTitle>
                <CardDescription>Business insights and reports</CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full">View Analytics</Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return <Dashboard />;
}