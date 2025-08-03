import { DashboardLayout } from '../components/layout/dashboard-layout';
import { IntelligenceEngine } from '../components/intelligence/IntelligenceEngine';

export default function Intelligence() {
  return (
    <DashboardLayout>
      <div className="container mx-auto p-6">
        <div className="space-y-6">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight">AI Intelligence Engine</h1>
            <p className="text-muted-foreground">
              Advanced AI insights, predictions, and recommendations for strategic decision making
            </p>
          </div>
          <IntelligenceEngine />
        </div>
      </div>
    </DashboardLayout>
  );
}