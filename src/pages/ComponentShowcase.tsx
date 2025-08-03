import React, { useState } from 'react';
import { EnhancedDashboardLayout } from '../components/layout/enhanced-dashboard-layout';
import { Card, CardHeader, CardTitle, CardContent, StatCard, FeatureCard } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Logo, TacticalLogo, GradientLogo } from '../components/ui/logo';
import { Icon, LoadingIcon, SuccessIcon, ErrorIcon } from '../components/ui/icon';
import { Loading, TacticalLoading, LoadingCard } from '../components/ui/loading';
import { DataTable, ColumnDef } from '../components/ui/data-table';
import { FormProvider, FormField, MultiStepForm, FormActions } from '../components/ui/form';
import { FileUpload, SortableList, KanbanBoard } from '../components/ui/drag-drop';
import {
  Palette,
  Zap,
  Star,
  Truck,
  Users,
  Calculator,
  Download,
  Upload,
  Sparkles,
  Rocket,
  Shield
} from 'lucide-react';

// Sample data for demonstrations
const sampleProjects = [
  { id: '1', name: 'Church Parking Lot A', status: 'Active', progress: 75, budget: 50000, manager: 'John Doe' },
  { id: '2', name: 'Commercial Plaza', status: 'Planning', progress: 25, budget: 120000, manager: 'Jane Smith' },
  { id: '3', name: 'Residential Driveway', status: 'Completed', progress: 100, budget: 8000, manager: 'Mike Johnson' },
  { id: '4', name: 'School Entrance', status: 'Active', progress: 60, budget: 35000, manager: 'Sarah Wilson' },
];

const projectColumns: ColumnDef<typeof sampleProjects[0]>[] = [
  { id: 'name', header: 'Project Name', accessorKey: 'name' },
  { 
    id: 'status', 
    header: 'Status', 
    accessorKey: 'status',
    cell: (value) => (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
        value === 'Active' ? 'bg-green-100 text-green-800' :
        value === 'Planning' ? 'bg-yellow-100 text-yellow-800' :
        'bg-blue-100 text-blue-800'
      }`}>
        {value}
      </span>
    )
  },
  { 
    id: 'progress', 
    header: 'Progress', 
    accessorKey: 'progress',
    cell: (value) => `${value}%`
  },
  { 
    id: 'budget', 
    header: 'Budget', 
    accessorKey: 'budget',
    cell: (value) => `$${value.toLocaleString()}`
  },
  { id: 'manager', header: 'Manager', accessorKey: 'manager' },
];

export default function ComponentShowcase() {
  const [selectedVariant, setSelectedVariant] = useState<'default' | 'tactical'>('default');
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [sortableItems, setSortableItems] = useState([
    { id: '1', content: <div className="p-2">Project Phase 1: Planning</div> },
    { id: '2', content: <div className="p-2">Project Phase 2: Preparation</div> },
    { id: '3', content: <div className="p-2">Project Phase 3: Execution</div> },
    { id: '4', content: <div className="p-2">Project Phase 4: Completion</div> },
  ]);

  const [kanbanColumns, setKanbanColumns] = useState([
    {
      id: 'todo',
      title: 'To Do',
      items: [
        { id: '1', content: <div className="p-2"><strong>Site Survey</strong><br />Initial site assessment</div> },
        { id: '2', content: <div className="p-2"><strong>Material Order</strong><br />Order asphalt and equipment</div> },
      ]
    },
    {
      id: 'inprogress',
      title: 'In Progress',
      items: [
        { id: '3', content: <div className="p-2"><strong>Surface Prep</strong><br />Cleaning and priming</div> },
      ]
    },
    {
      id: 'done',
      title: 'Completed',
      items: [
        { id: '4', content: <div className="p-2"><strong>Initial Planning</strong><br />Project scope defined</div> },
      ]
    }
  ]);

  const formSteps = [
    { 
      id: 'basic', 
      title: 'Basic Information', 
      description: 'Enter project details',
      fields: ['projectName', 'clientName', 'location'] 
    },
    { 
      id: 'scope', 
      title: 'Project Scope', 
      description: 'Define work requirements',
      fields: ['workType', 'area', 'materials'] 
    },
    { 
      id: 'timeline', 
      title: 'Timeline & Budget', 
      description: 'Set schedule and budget',
      fields: ['startDate', 'budget', 'notes'] 
    }
  ];

  const validationRules = {
    projectName: { required: true, minLength: 3 },
    clientName: { required: true },
    location: { required: true },
    workType: { required: true },
    area: { required: true, number: true, min: 1 },
    budget: { required: true, number: true, min: 100 },
    startDate: { required: true },
  };

  const handleKanbanMove = (itemId: string, fromColumn: string, toColumn: string) => {
    setKanbanColumns(prevColumns => {
      const newColumns = [...prevColumns];
      
      // Find and remove item from source column
      const sourceCol = newColumns.find(col => col.id === fromColumn);
      const targetCol = newColumns.find(col => col.id === toColumn);
      
      if (sourceCol && targetCol) {
        const item = sourceCol.items.find(item => item.id === itemId);
        if (item) {
          sourceCol.items = sourceCol.items.filter(i => i.id !== itemId);
          targetCol.items.push(item);
        }
      }
      
      return newColumns;
    });
  };

  return (
    <EnhancedDashboardLayout
      title="Component Showcase"
      description="Explore all enhanced UI components and features"
      variant={selectedVariant}
      breadcrumbs={[
        { label: 'Dashboard', href: '/' },
        { label: 'Components' }
      ]}
      actions={
        <div className="flex gap-2">
          <Button
            variant={selectedVariant === 'default' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedVariant('default')}
          >
            Default Theme
          </Button>
          <Button
            variant={selectedVariant === 'tactical' ? 'tactical' : 'outline'}
            size="sm"
            onClick={() => setSelectedVariant('tactical')}
          >
            Tactical Theme
          </Button>
        </div>
      }
    >
      <div className="space-y-8">
        {/* Logo Variants */}
        <Card variant={selectedVariant === 'tactical' ? 'tactical' : 'default'}>
          <CardHeader>
            <CardTitle>Logo Variants</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center space-y-4">
                <h4 className="font-medium">Default Logo</h4>
                <Logo size="lg" animated />
              </div>
              <div className="text-center space-y-4">
                <h4 className="font-medium">Tactical Logo</h4>
                <TacticalLogo size="lg" />
              </div>
              <div className="text-center space-y-4">
                <h4 className="font-medium">Gradient Logo</h4>
                <GradientLogo size="lg" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Button Variants */}
        <Card variant={selectedVariant === 'tactical' ? 'tactical' : 'default'}>
          <CardHeader>
            <CardTitle>Enhanced Buttons</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-3">
                <h4 className="font-medium">Standard Variants</h4>
                <div className="flex flex-wrap gap-2">
                  <Button variant="default">Default</Button>
                  <Button variant="secondary">Secondary</Button>
                  <Button variant="outline">Outline</Button>
                  <Button variant="ghost">Ghost</Button>
                </div>
              </div>
              <div className="space-y-3">
                <h4 className="font-medium">Enhanced Variants</h4>
                <div className="flex flex-wrap gap-2">
                  <Button variant="gradient">Gradient</Button>
                  <Button variant="success">Success</Button>
                  <Button variant="warning">Warning</Button>
                  <Button variant="tactical">Tactical</Button>
                </div>
              </div>
              <div className="space-y-3">
                <h4 className="font-medium">With Icons & Loading</h4>
                <div className="space-y-2">
                  <Button leftIcon={<Download />}>Download</Button>
                  <Button rightIcon={<Upload />}>Upload</Button>
                  <Button loading>Loading...</Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Input Variants */}
        <Card variant={selectedVariant === 'tactical' ? 'tactical' : 'default'}>
          <CardHeader>
            <CardTitle>Enhanced Inputs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <Input 
                  placeholder="Standard input" 
                  variant={selectedVariant === 'tactical' ? 'tactical' : 'default'}
                />
                <Input 
                  placeholder="With left icon" 
                  leftIcon={<Users />}
                  variant={selectedVariant === 'tactical' ? 'tactical' : 'default'}
                />
                <Input 
                  placeholder="With right icon" 
                  rightIcon={<Calculator />}
                  variant={selectedVariant === 'tactical' ? 'tactical' : 'default'}
                />
              </div>
              <div className="space-y-4">
                <Input 
                  type="password" 
                  placeholder="Password with toggle"
                  variant={selectedVariant === 'tactical' ? 'tactical' : 'default'}
                />
                <Input 
                  placeholder="Success state" 
                  success={true}
                  variant={selectedVariant === 'tactical' ? 'tactical' : 'default'}
                />
                <Input 
                  placeholder="Error state" 
                  error="This field is required"
                  variant={selectedVariant === 'tactical' ? 'tactical' : 'default'}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Icon System */}
        <Card variant={selectedVariant === 'tactical' ? 'tactical' : 'default'}>
          <CardHeader>
            <CardTitle>Icon System with Animations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="text-center space-y-2">
                <LoadingIcon size="xl" />
                <p className="text-sm">Loading</p>
              </div>
              <div className="text-center space-y-2">
                <SuccessIcon size="xl" />
                <p className="text-sm">Success</p>
              </div>
              <div className="text-center space-y-2">
                <ErrorIcon size="xl" />
                <p className="text-sm">Error</p>
              </div>
              <div className="text-center space-y-2">
                <Icon icon={Sparkles} size="xl" animation="glow" variant="primary" />
                <p className="text-sm">Glow</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Loading States */}
        <Card variant={selectedVariant === 'tactical' ? 'tactical' : 'default'}>
          <CardHeader>
            <CardTitle>Loading Components</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center space-y-4">
                <h4 className="font-medium">Spinner</h4>
                <Loading type="spinner" variant={selectedVariant} />
              </div>
              <div className="text-center space-y-4">
                <h4 className="font-medium">Dots</h4>
                <Loading type="dots" variant={selectedVariant} />
              </div>
              <div className="text-center space-y-4">
                <h4 className="font-medium">Themed</h4>
                <Loading type="themed" variant={selectedVariant} />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stat Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <StatCard
            title="Active Projects"
            value="24"
            description="3 new this month"
            icon={<Icon icon={Truck} variant="primary" />}
            trend={{ value: 12, isPositive: true }}
            variant={selectedVariant === 'tactical' ? 'tactical' : 'default'}
          />
          <StatCard
            title="Team Members"
            value="18"
            description="2 on vacation"
            icon={<Icon icon={Users} variant="success" />}
            trend={{ value: 5, isPositive: false }}
            variant={selectedVariant === 'tactical' ? 'tactical' : 'default'}
          />
          <StatCard
            title="Revenue"
            value="$125K"
            description="This quarter"
            icon={<Icon icon={Star} variant="warning" />}
            trend={{ value: 23, isPositive: true }}
            variant={selectedVariant === 'tactical' ? 'tactical' : 'default'}
          />
          <StatCard
            title="Efficiency"
            value="94%"
            description="Above target"
            icon={<Icon icon={Zap} variant="info" />}
            trend={{ value: 7, isPositive: true }}
            variant={selectedVariant === 'tactical' ? 'tactical' : 'default'}
          />
        </div>

        {/* Data Table */}
        <Card variant={selectedVariant === 'tactical' ? 'tactical' : 'default'}>
          <CardHeader>
            <CardTitle>Advanced Data Table</CardTitle>
          </CardHeader>
          <CardContent>
            <DataTable
              data={sampleProjects}
              columns={projectColumns}
              searchable
              filterable
              pagination
              selectable
              variant={selectedVariant}
              actions={{
                view: (row) => console.log('View', row),
                edit: (row) => console.log('Edit', row),
                delete: (row) => console.log('Delete', row),
              }}
            />
          </CardContent>
        </Card>

        {/* File Upload */}
        <Card variant={selectedVariant === 'tactical' ? 'tactical' : 'default'}>
          <CardHeader>
            <CardTitle>Drag & Drop File Upload</CardTitle>
          </CardHeader>
          <CardContent>
            <FileUpload
              onFileSelect={setSelectedFiles}
              accept="image/*,.pdf,.doc,.docx"
              maxSize={5}
              maxFiles={3}
              variant={selectedVariant}
            />
          </CardContent>
        </Card>

        {/* Sortable List */}
        <Card variant={selectedVariant === 'tactical' ? 'tactical' : 'default'}>
          <CardHeader>
            <CardTitle>Sortable Project Phases</CardTitle>
          </CardHeader>
          <CardContent>
            <SortableList
              items={sortableItems}
              onReorder={setSortableItems}
              variant={selectedVariant}
            />
          </CardContent>
        </Card>

        {/* Kanban Board */}
        <Card variant={selectedVariant === 'tactical' ? 'tactical' : 'default'}>
          <CardHeader>
            <CardTitle>Kanban Project Board</CardTitle>
          </CardHeader>
          <CardContent>
            <KanbanBoard
              columns={kanbanColumns}
              onMove={handleKanbanMove}
              variant={selectedVariant}
            />
          </CardContent>
        </Card>

        {/* Form System */}
        <Card variant={selectedVariant === 'tactical' ? 'tactical' : 'default'}>
          <CardHeader>
            <CardTitle>Multi-Step Form System</CardTitle>
          </CardHeader>
          <CardContent>
            <FormProvider
              initialValues={{}}
              validationRules={validationRules}
              onSubmit={async (values) => {
                console.log('Form submitted:', values);
                await new Promise(resolve => setTimeout(resolve, 2000));
              }}
              variant={selectedVariant}
            >
              <MultiStepForm
                steps={formSteps}
                variant={selectedVariant}
                onComplete={() => console.log('Form completed')}
              >
                <div className="space-y-4">
                  <FormField name="projectName" label="Project Name" required />
                  <FormField name="clientName" label="Client Name" required />
                  <FormField name="location" label="Location" required />
                  <FormField name="workType" label="Work Type" type="select" options={[
                    { label: 'Sealcoating', value: 'sealcoating' },
                    { label: 'Crack Repair', value: 'crack-repair' },
                    { label: 'Line Striping', value: 'line-striping' },
                    { label: 'Full Overlay', value: 'overlay' }
                  ]} />
                  <FormField name="area" label="Area (sq ft)" type="number" />
                  <FormField name="materials" label="Materials" type="textarea" />
                  <FormField name="startDate" label="Start Date" type="date" />
                  <FormField name="budget" label="Budget ($)" type="number" />
                  <FormField name="notes" label="Additional Notes" type="textarea" />
                </div>
              </MultiStepForm>
            </FormProvider>
          </CardContent>
        </Card>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <FeatureCard
            icon={<Icon icon={Rocket} variant="primary" />}
            title="Performance"
            description="Lightning-fast components with optimized animations and interactions."
            action={<Button size="sm">Learn More</Button>}
            variant={selectedVariant === 'tactical' ? 'tactical' : 'default'}
          />
          <FeatureCard
            icon={<Icon icon={Shield} variant="success" />}
            title="Accessibility"
            description="WCAG compliant components with full keyboard navigation and screen reader support."
            action={<Button size="sm" variant="outline">Explore</Button>}
            variant={selectedVariant === 'tactical' ? 'tactical' : 'default'}
          />
          <FeatureCard
            icon={<Icon icon={Palette} variant="warning" />}
            title="Theming"
            description="Flexible theming system with multiple variants and customization options."
            action={<Button size="sm" variant="secondary">Customize</Button>}
            variant={selectedVariant === 'tactical' ? 'tactical' : 'default'}
          />
        </div>
      </div>
    </EnhancedDashboardLayout>
  );
}