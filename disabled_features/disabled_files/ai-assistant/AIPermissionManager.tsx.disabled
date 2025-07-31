import React, { useState, useEffect } from 'react';
import { Shield, Settings, AlertTriangle, CheckCircle, XCircle, Clock, Eye, Edit, Trash2, Plus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Slider } from '@/components/ui/slider';
import { useAIAssistant } from '@/features/ai-services/hooks/useAIAssistant';
import { AIPermission, AIActionLog } from '@/features/ai-services/schemas/ai-assistant-schema';

const PERMISSION_CATEGORIES = {
  'Project Management': [
    { key: 'create_projects', label: 'Create Projects', description: 'Allow AI to create new projects based on analysis' },
    { key: 'edit_projects', label: 'Edit Projects', description: 'Allow AI to update project details and status' },
    { key: 'delete_projects', label: 'Delete Projects', description: 'Allow AI to delete projects (high risk)' },
    { key: 'search_projects', label: 'Search Projects', description: 'Allow AI to search and retrieve project data' }
  ],
  'Estimation & Financial': [
    { key: 'create_estimates', label: 'Create Estimates', description: 'Allow AI to generate cost estimates' },
    { key: 'edit_estimates', label: 'Edit Estimates', description: 'Allow AI to modify existing estimates' },
    { key: 'delete_estimates', label: 'Delete Estimates', description: 'Allow AI to remove estimates' },
    { key: 'create_invoices', label: 'Create Invoices', description: 'Allow AI to generate invoices' },
    { key: 'edit_financial_data', label: 'Edit Financial Data', description: 'Allow AI to modify financial records (high risk)' },
    { key: 'delete_financial_records', label: 'Delete Financial Records', description: 'Allow AI to delete financial data (critical risk)' }
  ],
  'Team & Resources': [
    { key: 'create_team_members', label: 'Create Team Members', description: 'Allow AI to add team members' },
    { key: 'edit_team_members', label: 'Edit Team Members', description: 'Allow AI to modify team member details' },
    { key: 'delete_team_members', label: 'Delete Team Members', description: 'Allow AI to remove team members' },
    { key: 'create_equipment', label: 'Create Equipment', description: 'Allow AI to add equipment records' },
    { key: 'edit_equipment', label: 'Edit Equipment', description: 'Allow AI to update equipment details' },
    { key: 'delete_equipment', label: 'Delete Equipment', description: 'Allow AI to remove equipment records' }
  ],
  'Scheduling & Operations': [
    { key: 'create_schedules', label: 'Create Schedules', description: 'Allow AI to create work schedules' },
    { key: 'edit_schedules', label: 'Edit Schedules', description: 'Allow AI to modify schedules' },
    { key: 'delete_schedules', label: 'Delete Schedules', description: 'Allow AI to remove schedules' },
    { key: 'edit_safety_protocols', label: 'Edit Safety Protocols', description: 'Allow AI to update safety procedures' },
    { key: 'create_compliance_reports', label: 'Create Compliance Reports', description: 'Allow AI to generate compliance reports' }
  ],
  'Knowledge & Analytics': [
    { key: 'upload_documents', label: 'Upload Documents', description: 'Allow AI to add documents to knowledge base' },
    { key: 'edit_knowledge_base', label: 'Edit Knowledge Base', description: 'Allow AI to modify knowledge base content' },
    { key: 'delete_documents', label: 'Delete Documents', description: 'Allow AI to remove documents' },
    { key: 'generate_reports', label: 'Generate Reports', description: 'Allow AI to create analytical reports' },
    { key: 'access_analytics', label: 'Access Analytics', description: 'Allow AI to access and analyze data' },
    { key: 'export_data', label: 'Export Data', description: 'Allow AI to export system data' }
  ]
};

const RISK_LEVELS = {
  low: { color: 'bg-green-100 text-green-800', icon: CheckCircle },
  medium: { color: 'bg-yellow-100 text-yellow-800', icon: AlertTriangle },
  high: { color: 'bg-red-100 text-red-800', icon: XCircle },
  critical: { color: 'bg-red-600 text-white', icon: XCircle }
};

const getRiskLevel = (permissionKey: string): keyof typeof RISK_LEVELS => {
  if (permissionKey.includes('delete') && (permissionKey.includes('financial') || permissionKey.includes('team'))) {
    return 'critical';
  }
  if (permissionKey.includes('delete') || permissionKey.includes('financial')) {
    return 'high';
  }
  if (permissionKey.includes('edit') && permissionKey.includes('safety')) {
    return 'medium';
  }
  if (permissionKey.includes('create') || permissionKey.includes('edit')) {
    return 'medium';
  }
  return 'low';
};

export default function AIPermissionManager() {
  const { 
    permissions, 
    settings, 
    actionLogs, 
    updateAIPermissions, 
    isLoading, 
    error 
  } = useAIAssistant();

  const [localPermissions, setLocalPermissions] = useState<AIPermission | null>(null);
  const [hasChanges, setHasChanges] = useState(false);
  const [restrictedAreaInput, setRestrictedAreaInput] = useState('');
  const [approvalRequiredInput, setApprovalRequiredInput] = useState('');

  useEffect(() => {
    if (permissions) {
      setLocalPermissions({ ...permissions });
      setHasChanges(false);
    }
  }, [permissions]);

  const handlePermissionToggle = (permissionKey: string, enabled: boolean) => {
    if (!localPermissions) return;

    setLocalPermissions(prev => ({
      ...prev!,
      permissions: {
        ...prev!.permissions,
        [permissionKey]: enabled
      }
    }));
    setHasChanges(true);
  };

  const handleAIEnabledToggle = (enabled: boolean) => {
    if (!localPermissions) return;

    setLocalPermissions(prev => ({
      ...prev!,
      ai_enabled: enabled
    }));
    setHasChanges(true);
  };

  const handleOperationsLimitChange = (value: number[]) => {
    if (!localPermissions) return;

    setLocalPermissions(prev => ({
      ...prev!,
      max_operations_per_hour: value[0]
    }));
    setHasChanges(true);
  };

  const addRestrictedArea = () => {
    if (!localPermissions || !restrictedAreaInput.trim()) return;

    setLocalPermissions(prev => ({
      ...prev!,
      restricted_areas: [...prev!.restricted_areas, restrictedAreaInput.trim()]
    }));
    setRestrictedAreaInput('');
    setHasChanges(true);
  };

  const removeRestrictedArea = (area: string) => {
    if (!localPermissions) return;

    setLocalPermissions(prev => ({
      ...prev!,
      restricted_areas: prev!.restricted_areas.filter(a => a !== area)
    }));
    setHasChanges(true);
  };

  const addApprovalRequirement = () => {
    if (!localPermissions || !approvalRequiredInput.trim()) return;

    setLocalPermissions(prev => ({
      ...prev!,
      require_approval_for: [...prev!.require_approval_for, approvalRequiredInput.trim()]
    }));
    setApprovalRequiredInput('');
    setHasChanges(true);
  };

  const removeApprovalRequirement = (requirement: string) => {
    if (!localPermissions) return;

    setLocalPermissions(prev => ({
      ...prev!,
      require_approval_for: prev!.require_approval_for.filter(r => r !== requirement)
    }));
    setHasChanges(true);
  };

  const savePermissions = async () => {
    if (!localPermissions || !hasChanges) return;

    try {
      await updateAIPermissions(localPermissions);
      setHasChanges(false);
    } catch (err) {
      console.error('Failed to save permissions:', err);
    }
  };

  const resetToDefaults = () => {
    if (!permissions) return;
    setLocalPermissions({ ...permissions });
    setHasChanges(false);
  };

  const getEnabledPermissionsCount = () => {
    if (!localPermissions) return 0;
    return Object.values(localPermissions.permissions).filter(Boolean).length;
  };

  const getTotalPermissionsCount = () => {
    if (!localPermissions) return 0;
    return Object.keys(localPermissions.permissions).length;
  };

  const getRecentActions = () => {
    return actionLogs.slice(0, 10);
  };

  if (!localPermissions) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading AI permissions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Shield className="w-6 h-6 text-primary" />
            AI Permission Manager
          </h2>
          <p className="text-muted-foreground">
            Control what the AI assistant can and cannot do across your entire project
          </p>
        </div>

        <div className="flex items-center gap-2">
          {hasChanges && (
            <Badge variant="outline" className="bg-orange-50 text-orange-700">
              Unsaved Changes
            </Badge>
          )}
          <Button onClick={savePermissions} disabled={!hasChanges || isLoading}>
            {isLoading ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      <Tabs defaultValue="permissions" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="permissions">Permissions</TabsTrigger>
          <TabsTrigger value="restrictions">Restrictions</TabsTrigger>
          <TabsTrigger value="monitoring">Monitoring</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        {/* Main AI Control */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>AI Assistant Status</span>
              <div className="flex items-center gap-2">
                <span className={`w-3 h-3 rounded-full ${localPermissions.ai_enabled ? 'bg-green-500' : 'bg-red-500'}`}></span>
                <span className="text-sm">{localPermissions.ai_enabled ? 'Enabled' : 'Disabled'}</span>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="ai-enabled" className="text-base font-medium">
                  Enable AI Assistant
                </Label>
                <p className="text-sm text-muted-foreground mt-1">
                  Master switch to enable or disable all AI functionality
                </p>
              </div>
              <Switch
                id="ai-enabled"
                checked={localPermissions.ai_enabled}
                onCheckedChange={handleAIEnabledToggle}
              />
            </div>

            {localPermissions.ai_enabled && (
              <div className="mt-4 pt-4 border-t">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-green-600">
                      {getEnabledPermissionsCount()}
                    </div>
                    <div className="text-sm text-muted-foreground">Enabled Permissions</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-blue-600">
                      {localPermissions.max_operations_per_hour}
                    </div>
                    <div className="text-sm text-muted-foreground">Operations/Hour Limit</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-orange-600">
                      {localPermissions.require_approval_for.length}
                    </div>
                    <div className="text-sm text-muted-foreground">Require Approval</div>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <TabsContent value="permissions" className="space-y-6">
          {/* Permission Categories */}
          {Object.entries(PERMISSION_CATEGORIES).map(([category, permissions]) => (
            <Card key={category}>
              <CardHeader>
                <CardTitle className="text-lg">{category}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {permissions.map((permission) => {
                    const riskLevel = getRiskLevel(permission.key);
                    const RiskIcon = RISK_LEVELS[riskLevel].icon;
                    
                    return (
                      <div key={permission.key} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <Label htmlFor={permission.key} className="font-medium cursor-pointer">
                              {permission.label}
                            </Label>
                            <Badge 
                              variant="outline" 
                              className={`text-xs ${RISK_LEVELS[riskLevel].color}`}
                            >
                              <RiskIcon className="w-3 h-3 mr-1" />
                              {riskLevel}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">
                            {permission.description}
                          </p>
                        </div>
                        <Switch
                          id={permission.key}
                          checked={localPermissions.permissions[permission.key as keyof typeof localPermissions.permissions] || false}
                          onCheckedChange={(checked) => handlePermissionToggle(permission.key, checked)}
                          disabled={!localPermissions.ai_enabled}
                        />
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="restrictions" className="space-y-6">
          {/* Operations Limit */}
          <Card>
            <CardHeader>
              <CardTitle>Operations Limit</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Label>Maximum Operations per Hour: {localPermissions.max_operations_per_hour}</Label>
                <Slider
                  value={[localPermissions.max_operations_per_hour]}
                  onValueChange={handleOperationsLimitChange}
                  max={500}
                  min={10}
                  step={10}
                  className="w-full"
                />
                <p className="text-sm text-muted-foreground">
                  Limit the number of operations the AI can perform per hour to prevent overuse
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Restricted Areas */}
          <Card>
            <CardHeader>
              <CardTitle>Restricted Areas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    value={restrictedAreaInput}
                    onChange={(e) => setRestrictedAreaInput(e.target.value)}
                    placeholder="Enter area to restrict (e.g., financial_reports)"
                  />
                  <Button onClick={addRestrictedArea}>
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                
                <div className="flex flex-wrap gap-2">
                  {localPermissions.restricted_areas.map((area) => (
                    <Badge key={area} variant="destructive" className="flex items-center gap-1">
                      {area}
                      <button onClick={() => removeRestrictedArea(area)}>
                        <XCircle className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
                
                {localPermissions.restricted_areas.length === 0 && (
                  <p className="text-sm text-muted-foreground">No restricted areas configured</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Approval Required */}
          <Card>
            <CardHeader>
              <CardTitle>Require Approval For</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    value={approvalRequiredInput}
                    onChange={(e) => setApprovalRequiredInput(e.target.value)}
                    placeholder="Enter action requiring approval (e.g., delete_projects)"
                  />
                  <Button onClick={addApprovalRequirement}>
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                
                <div className="flex flex-wrap gap-2">
                  {localPermissions.require_approval_for.map((requirement) => (
                    <Badge key={requirement} variant="secondary" className="flex items-center gap-1">
                      {requirement}
                      <button onClick={() => removeApprovalRequirement(requirement)}>
                        <XCircle className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="monitoring" className="space-y-6">
          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Recent AI Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Action</TableHead>
                    <TableHead>Resource</TableHead>
                    <TableHead>Success</TableHead>
                    <TableHead>Confidence</TableHead>
                    <TableHead>Timestamp</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {getRecentActions().map((log) => (
                    <TableRow key={log.id}>
                      <TableCell>
                        <Badge variant="outline">
                          {log.action_type}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className="font-medium">{log.resource_type}</span>
                        {log.resource_id && (
                          <div className="text-xs text-muted-foreground">
                            ID: {log.resource_id.substring(0, 8)}...
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        {log.success ? (
                          <CheckCircle className="w-4 h-4 text-green-600" />
                        ) : (
                          <XCircle className="w-4 h-4 text-red-600" />
                        )}
                      </TableCell>
                      <TableCell>
                        {log.ai_confidence && (
                          <Badge variant="secondary">
                            {log.ai_confidence}%
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {log.timestamp.toLocaleString()}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              
              {getRecentActions().length === 0 && (
                <div className="text-center py-8">
                  <Clock className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-medium mb-2">No Recent Activity</h3>
                  <p className="text-muted-foreground">AI actions will appear here once the assistant starts working</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Statistics */}
          <Card>
            <CardHeader>
              <CardTitle>Usage Statistics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {actionLogs.filter(log => log.success).length}
                  </div>
                  <div className="text-sm text-muted-foreground">Successful Actions</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">
                    {actionLogs.filter(log => !log.success).length}
                  </div>
                  <div className="text-sm text-muted-foreground">Failed Actions</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {actionLogs.filter(log => log.action_type === 'create').length}
                  </div>
                  <div className="text-sm text-muted-foreground">Items Created</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">
                    {actionLogs.filter(log => log.action_type === 'update').length}
                  </div>
                  <div className="text-sm text-muted-foreground">Items Updated</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <Button variant="outline" onClick={() => {
                  setLocalPermissions(prev => ({
                    ...prev!,
                    permissions: Object.keys(prev!.permissions).reduce((acc, key) => ({
                      ...acc,
                      [key]: true
                    }), {} as any)
                  }));
                  setHasChanges(true);
                }}>
                  Enable All Permissions
                </Button>
                
                <Button variant="outline" onClick={() => {
                  setLocalPermissions(prev => ({
                    ...prev!,
                    permissions: Object.keys(prev!.permissions).reduce((acc, key) => ({
                      ...acc,
                      [key]: false
                    }), {} as any)
                  }));
                  setHasChanges(true);
                }}>
                  Disable All Permissions
                </Button>
                
                <Button variant="outline" onClick={() => {
                  // Enable only safe permissions
                  const safePermissions = ['search_projects', 'access_analytics', 'generate_reports', 'create_estimates'];
                  setLocalPermissions(prev => ({
                    ...prev!,
                    permissions: Object.keys(prev!.permissions).reduce((acc, key) => ({
                      ...acc,
                      [key]: safePermissions.includes(key)
                    }), {} as any)
                  }));
                  setHasChanges(true);
                }}>
                  Safe Mode Only
                </Button>
                
                <Button variant="outline" onClick={resetToDefaults}>
                  Reset to Defaults
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Export/Import */}
          <Card>
            <CardHeader>
              <CardTitle>Backup & Restore</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Button variant="outline" onClick={() => {
                  const dataStr = JSON.stringify(localPermissions, null, 2);
                  const dataBlob = new Blob([dataStr], { type: 'application/json' });
                  const url = URL.createObjectURL(dataBlob);
                  const link = document.createElement('a');
                  link.href = url;
                  link.download = 'ai-permissions-backup.json';
                  link.click();
                }}>
                  Export Permissions
                </Button>
                
                <input
                  type="file"
                  accept=".json"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onload = (event) => {
                        try {
                          const importedPermissions = JSON.parse(event.target?.result as string);
                          setLocalPermissions(importedPermissions);
                          setHasChanges(true);
                        } catch (err) {
                          console.error('Failed to import permissions:', err);
                        }
                      };
                      reader.readAsText(file);
                    }
                  }}
                  className="hidden"
                  id="import-permissions"
                />
                <Button variant="outline" onClick={() => {
                  document.getElementById('import-permissions')?.click();
                }}>
                  Import Permissions
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}