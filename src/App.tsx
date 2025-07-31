import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AuthProvider } from '@/hooks/useAuth';
import { Loading } from '@/components/Loading';
import { ErrorBoundary } from '@/components/ErrorBoundary';

function App() {
  const [currentTab, setCurrentTab] = useState('dashboard');

  return (
    <ErrorBoundary>
      <AuthProvider>
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
          <div className="container mx-auto p-6">
            <div className="mb-8">
              <h1 className="text-4xl font-bold text-slate-900 dark:text-slate-100 mb-2">
                PaveMaster Suite
              </h1>
              <p className="text-slate-600 dark:text-slate-400 text-lg">
                Complete asphalt paving and sealing management system
              </p>
            </div>

            <Tabs value={currentTab} onValueChange={setCurrentTab} className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
                <TabsTrigger value="projects">Projects</TabsTrigger>
                <TabsTrigger value="equipment">Equipment</TabsTrigger>
                <TabsTrigger value="analytics">Analytics</TabsTrigger>
              </TabsList>

              <TabsContent value="dashboard" className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Active Projects</CardTitle>
                      <Badge>+20%</Badge>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">24</div>
                      <p className="text-xs text-muted-foreground">+2 from last month</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Revenue</CardTitle>
                      <Badge variant="secondary">+12%</Badge>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">$45,231</div>
                      <p className="text-xs text-muted-foreground">+$5,400 from last month</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Quick Actions</CardTitle>
                      <CardDescription>Common tasks and shortcuts</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <Button className="w-full justify-start">Create New Project</Button>
                      <Button variant="outline" className="w-full justify-start">Schedule Equipment</Button>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="projects">
                <Card>
                  <CardHeader>
                    <CardTitle>Project Management</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p>Project interface will be implemented here</p>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="equipment">
                <Card>
                  <CardHeader>
                    <CardTitle>Equipment Management</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p>Equipment interface will be implemented here</p>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="analytics">
                <Card>
                  <CardHeader>
                    <CardTitle>Analytics Dashboard</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p>Analytics will be implemented here</p>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;