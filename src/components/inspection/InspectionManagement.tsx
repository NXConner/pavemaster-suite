import { useState, useEffect } from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { 
  ClipboardCheck, 
  CheckCircle, 
  Clock,
  FileText,
  Star
} from 'lucide-react';
import { supabase } from '../../integrations/supabase/client';

interface InspectionChecklist {
  id: string;
  name: string;
  template: any;
  created_by: string | null;
  created_at: string | null;
}

interface InspectionResult {
  id: string;
  checklist_id: string | null;
  job_id: string | null;
  user_id: string | null;
  answers: any;
  completed_at: string | null;
}

export const InspectionManagement = () => {
  const [checklists, setChecklists] = useState<InspectionChecklist[]>([]);
  const [results, setResults] = useState<InspectionResult[]>([]);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadInspectionData();
  }, []);

  const loadInspectionData = async () => {
    try {
      const [checklistsResponse, resultsResponse] = await Promise.all([
        supabase.from('inspection_checklists').select('*'),
        supabase.from('inspection_results').select('*')
      ]);

      if (checklistsResponse.data) setChecklists(checklistsResponse.data);
      if (resultsResponse.data) setResults(resultsResponse.data);
    } catch (error) {
      console.error('Error loading inspection data:', error);
    } finally {
      setLoading(false);
    }
  };

  const InspectionDashboard = () => {
    const totalInspections = results.length;
    const completedToday = results.filter(r => 
      r.completed_at && new Date(r.completed_at).toDateString() === new Date().toDateString()
    ).length;
    const pendingInspections = checklists.length - results.length;

    return (
      <div className="space-y-6">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Inspections</p>
                <p className="text-2xl font-bold">{totalInspections}</p>
              </div>
              <ClipboardCheck className="h-8 w-8 text-primary" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Completed Today</p>
                <p className="text-2xl font-bold text-success">{completedToday}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-success" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Pending Inspections</p>
                <p className="text-2xl font-bold text-warning">{pendingInspections}</p>
              </div>
              <Clock className="h-8 w-8 text-warning" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Pass Rate</p>
                <p className="text-2xl font-bold text-success">95%</p>
              </div>
              <Star className="h-8 w-8 text-success" />
            </div>
          </Card>
        </div>

        {/* Recent Inspections */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Recent Inspections</h3>
          <div className="space-y-4">
            {results.slice(0, 5).map((result) => (
              <div key={result.id} className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 bg-primary/10 rounded-full flex items-center justify-center">
                    <ClipboardCheck className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">Quality Control Inspection</p>
                    <p className="text-sm text-muted-foreground">
                      Completed {result.completed_at ? new Date(result.completed_at).toLocaleDateString() : 'N/A'}
                    </p>
                  </div>
                </div>
                <Badge variant="secondary">Passed</Badge>
              </div>
            ))}
          </div>
        </Card>
      </div>
    );
  };

  const ChecklistManagement = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Inspection Checklists</h3>
        <Button>Create New Checklist</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {checklists.map((checklist) => (
          <Card key={checklist.id} className="p-6">
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-semibold">{checklist.name}</h4>
                  <p className="text-sm text-muted-foreground">
                    Created {checklist.created_at ? new Date(checklist.created_at).toLocaleDateString() : 'N/A'}
                  </p>
                </div>
                <FileText className="h-5 w-5 text-muted-foreground" />
              </div>
              
              <div className="flex gap-2">
                <Button variant="outline" size="sm">Edit</Button>
                <Button variant="outline" size="sm">Use</Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );

  const InspectionResults = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Inspection Results</h3>
        <Button>Export Results</Button>
      </div>

      <Card className="p-6">
        <div className="space-y-4">
          {results.map((result) => (
            <div key={result.id} className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 bg-success/10 rounded-full flex items-center justify-center">
                  <CheckCircle className="h-5 w-5 text-success" />
                </div>
                <div>
                  <p className="font-medium">Inspection #{result.id.slice(0, 8)}</p>
                  <p className="text-sm text-muted-foreground">
                    {result.completed_at ? new Date(result.completed_at).toLocaleDateString() : 'N/A'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="secondary">Passed</Badge>
                <Button variant="outline" size="sm">View Details</Button>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Inspection Management</h1>
          <p className="text-muted-foreground">
            Quality control and compliance inspection system
          </p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="checklists">Checklists</TabsTrigger>
          <TabsTrigger value="results">Results</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-6">
          <InspectionDashboard />
        </TabsContent>

        <TabsContent value="checklists" className="space-y-6">
          <ChecklistManagement />
        </TabsContent>

        <TabsContent value="results" className="space-y-6">
          <InspectionResults />
        </TabsContent>
      </Tabs>
    </div>
  );
};