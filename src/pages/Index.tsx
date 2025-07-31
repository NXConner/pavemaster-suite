import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function Index() {
  return (
    <div className="space-y-6">
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
  );
}