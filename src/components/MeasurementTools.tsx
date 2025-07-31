import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle } from 'lucide-react';

export function MeasurementTools() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertCircle className="h-5 w-5" />
          MeasurementTools
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-center py-8">
          <AlertCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">MeasurementTools Component</h3>
          <p className="text-muted-foreground mb-4">
            This is a placeholder component that will be implemented in the feature-based architecture.
          </p>
          <Button variant="outline">
            Configure MeasurementTools
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
