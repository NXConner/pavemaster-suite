import React, { useState, useEffect, useRef } from 'react';
import DOMPurify from 'dompurify';
import { 
  Upload, Download, FileText, Edit3, Save, Check, X, Plus, Trash2, 
  Eye, Settings, AlertTriangle, Shield, Calendar, User, Building,
  Calculator, DollarSign, Clock, MapPin, Phone, Mail, FileCheck,
  Printer, Send, Copy, Lock, Unlock, RefreshCw, Search, Filter
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import VirginiaContractSystem, { ContractTemplate, Contract, ContractParty } from '../../services/contract/VirginiaContractSystem';

interface TemplateField {
  id: string;
  fieldId: string;
  label: string;
  type: 'text' | 'number' | 'date' | 'select' | 'textarea' | 'checkbox' | 'currency';
  required: boolean;
  placeholder?: string;
  options?: string[];
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
  };
  defaultValue?: any;
  helpText?: string;
}

interface ContractFormData {
  templateId: string;
  parties: ContractParty[];
  fieldValues: Record<string, any>;
  status: 'draft' | 'pending_review' | 'pending_signature' | 'signed';
  metadata: {
    createdBy: string;
    clientName: string;
    projectName: string;
    estimatedValue: number;
  };
}

const CustomTemplateManager: React.FC = () => {
  const [contractSystem] = useState(() => new VirginiaContractSystem());
  const [templates, setTemplates] = useState<ContractTemplate[]>([]);
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<ContractTemplate | null>(null);
  const [selectedContract, setSelectedContract] = useState<Contract | null>(null);
  const [activeTab, setActiveTab] = useState('templates');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [showTemplateEditor, setShowTemplateEditor] = useState(false);
  const [showContractForm, setShowContractForm] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [formData, setFormData] = useState<ContractFormData | null>(null);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [notifications, setNotifications] = useState<Array<{ id: string; type: 'success' | 'error' | 'warning'; message: string }>>([]);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [templateContent, setTemplateContent] = useState('');
  const [templateFields, setTemplateFields] = useState<TemplateField[]>([]);
  const [newTemplate, setNewTemplate] = useState<Partial<ContractTemplate>>({
    name: '',
    type: 'custom',
    virginiaCompliant: false,
    content: '',
    requiredFields: [],
    calculatedFields: [],
    legalClauses: []
  });

  // Initialize data
  useEffect(() => {
    loadTemplates();
    loadContracts();
    setupEventListeners();
  }, []);

  const setupEventListeners = () => {
    contractSystem.on('templateUploaded', () => {
      addNotification('success', 'Template uploaded successfully');
      loadTemplates();
    });

    contractSystem.on('contractCreated', () => {
      addNotification('success', 'Contract created successfully');
      loadContracts();
    });

    contractSystem.on('contractUpdated', () => {
      addNotification('success', 'Contract updated successfully');
      loadContracts();
    });
  };

  const loadTemplates = () => {
    const allTemplates = contractSystem.getTemplates();
    setTemplates(allTemplates);
  };

  const loadContracts = () => {
    const allContracts = contractSystem.getContracts();
    setContracts(allContracts);
  };

  const addNotification = (type: 'success' | 'error' | 'warning', message: string) => {
    const id = Date.now().toString();
    setNotifications(prev => [...prev, { id, type, message }]);
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 5000);
  };

  // Template upload handling
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadProgress(0);

    try {
      const content = await readFileContent(file);
      
      // Simulate upload progress
      for (let i = 0; i <= 100; i += 10) {
        setUploadProgress(i);
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      // Parse template content and extract fields
      const extractedFields = extractTemplateFields(content);
      
      setTemplateContent(content);
      setTemplateFields(extractedFields);
      setNewTemplate(prev => ({
        ...prev,
        content,
        requiredFields: extractedFields.map(field => ({
          fieldId: field.fieldId,
          label: field.label,
          type: field.type,
          required: field.required,
          validation: field.validation,
          placeholder: field.placeholder,
          helpText: field.helpText
        }))
      }));

      setShowTemplateEditor(true);
      
    } catch (error) {
      addNotification('error', 'Failed to upload template: ' + error.message);
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const readFileContent = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string);
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsText(file);
    });
  };

  const extractTemplateFields = (content: string): TemplateField[] => {
    const fields: TemplateField[] = [];
    const fieldRegex = /\{\{(\w+(?:\.\w+)*)\}\}/g;
    const matches = content.match(fieldRegex);

    if (matches) {
      const uniqueFields = Array.from(new Set(matches));
      uniqueFields.forEach((match, index) => {
        const fieldId = match.replace(/[{}]/g, '');
        const fieldName = fieldId.split('.').pop() || fieldId;
        
        fields.push({
          id: `field_${index}`,
          fieldId,
          label: fieldName.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
          type: inferFieldType(fieldName),
          required: true,
          placeholder: `Enter ${fieldName.replace(/_/g, ' ')}`
        });
      });
    }

    return fields;
  };

  const inferFieldType = (fieldName: string): TemplateField['type'] => {
    const name = fieldName.toLowerCase();
    if (name.includes('email')) return 'text';
    if (name.includes('phone')) return 'text';
    if (name.includes('date')) return 'date';
    if (name.includes('cost') || name.includes('price') || name.includes('amount')) return 'currency';
    if (name.includes('area') || name.includes('quantity') || name.includes('thickness')) return 'number';
    if (name.includes('description') || name.includes('notes')) return 'textarea';
    if (name.includes('type') || name.includes('category')) return 'select';
    return 'text';
  };

  const saveCustomTemplate = async () => {
    try {
      if (!newTemplate.name || !newTemplate.content) {
        throw new Error('Template name and content are required');
      }

      const templateData = {
        ...newTemplate,
        version: '1.0',
        isActive: true,
        calculatedFields: [],
        legalClauses: contractSystem.getTemplate('va_asphalt_paving')?.legalClauses || []
      } as Omit<ContractTemplate, 'id' | 'created' | 'lastModified'>;

      await contractSystem.uploadCustomTemplate(templateData);
      
      setShowTemplateEditor(false);
      setNewTemplate({
        name: '',
        type: 'custom',
        virginiaCompliant: false,
        content: '',
        requiredFields: [],
        calculatedFields: [],
        legalClauses: []
      });
      setTemplateContent('');
      setTemplateFields([]);
      
    } catch (error) {
      addNotification('error', 'Failed to save template: ' + error.message);
    }
  };

  // Contract creation
  const startContractCreation = (template: ContractTemplate) => {
    setSelectedTemplate(template);
    setFormData({
      templateId: template.id,
      parties: [],
      fieldValues: {},
      status: 'draft',
      metadata: {
        createdBy: 'current_user',
        clientName: '',
        projectName: '',
        estimatedValue: 0
      }
    });
    setShowContractForm(true);
  };

  const updateFormField = (fieldId: string, value: any) => {
    if (!formData) return;
    
    setFormData(prev => ({
      ...prev!,
      fieldValues: {
        ...prev!.fieldValues,
        [fieldId]: value
      }
    }));
  };

  const validateContract = (): boolean => {
    if (!selectedTemplate || !formData) return false;

    const errors: string[] = [];

    // Check required fields
    selectedTemplate.requiredFields.forEach(field => {
      if (field.required && !formData.fieldValues[field.fieldId]) {
        errors.push(`${field.label} is required`);
      }
    });

    // Validate field formats
    Object.entries(formData.fieldValues).forEach(([fieldId, value]) => {
      const field = selectedTemplate.requiredFields.find(f => f.fieldId === fieldId);
      if (field && field.validation) {
        if (field.validation.pattern && value) {
          const regex = new RegExp(field.validation.pattern);
          if (!regex.test(value.toString())) {
            errors.push(`${field.label} format is invalid`);
          }
        }
        if (field.validation.min !== undefined && value < field.validation.min) {
          errors.push(`${field.label} must be at least ${field.validation.min}`);
        }
        if (field.validation.max !== undefined && value > field.validation.max) {
          errors.push(`${field.label} must be no more than ${field.validation.max}`);
        }
      }
    });

    setValidationErrors(errors);
    return errors.length === 0;
  };

  const saveContract = async () => {
    if (!validateContract() || !formData) return;

    try {
      const contractId = await contractSystem.createContract(formData.templateId, {
        fieldValues: formData.fieldValues,
        parties: formData.parties
      });

      setSelectedContract(contractSystem.getContract(contractId) || null);
      setShowContractForm(false);
      
    } catch (error) {
      addNotification('error', 'Failed to save contract: ' + error.message);
    }
  };

  const generatePreview = async () => {
    if (!selectedContract) return;

    try {
      const previewContent = await contractSystem.generateContractDocument(selectedContract.id);
      setShowPreview(true);
      // You could set preview content to state here for display
    } catch (error) {
      addNotification('error', 'Failed to generate preview: ' + error.message);
    }
  };

  const exportContract = async (format: 'pdf' | 'docx' | 'html') => {
    if (!selectedContract) return;

    try {
      const blob = await contractSystem.exportContract(selectedContract.id, format);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `contract_${selectedContract.id}.${format}`;
      a.click();
      URL.revokeObjectURL(url);
      
      addNotification('success', `Contract exported as ${format.toUpperCase()}`);
    } catch (error) {
      addNotification('error', 'Failed to export contract: ' + error.message);
    }
  };

  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         template.type.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterType === 'all' || template.type === filterType;
    return matchesSearch && matchesFilter;
  });

  const filteredContracts = contracts.filter(contract => {
    const template = templates.find(t => t.id === contract.templateId);
    const matchesSearch = template?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         contract.status.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  return (
    <div className="w-full h-full flex flex-col bg-background">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b">
        <div className="flex items-center space-x-4">
          <h1 className="text-2xl font-bold flex items-center">
            <FileText className="mr-3 w-8 h-8" />
            Contract Management System
          </h1>
          <Badge variant="secondary" className="flex items-center">
            <Shield className="mr-1 w-3 h-3" />
            Virginia Compliant
          </Badge>
        </div>

        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
          >
            <Upload className="w-4 h-4 mr-2" />
            Upload Template
          </Button>
          <Button
            onClick={() => setShowTemplateEditor(true)}
            disabled={isUploading}
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Template
          </Button>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept=".html,.htm,.txt,.md"
          onChange={handleFileUpload}
          className="hidden"
        />
      </div>

      {/* Upload Progress */}
      {isUploading && (
        <div className="p-4 border-b">
          <div className="flex items-center space-x-4">
            <RefreshCw className="w-4 h-4 animate-spin" />
            <div className="flex-1">
              <div className="flex justify-between text-sm mb-1">
                <span>Uploading template...</span>
                <span>{uploadProgress}%</span>
              </div>
              <Progress value={uploadProgress} className="w-full" />
            </div>
          </div>
        </div>
      )}

      {/* Notifications */}
      {notifications.length > 0 && (
        <div className="p-4 space-y-2">
          {notifications.map(notification => (
            <Alert key={notification.id} className={notification.type === 'error' ? 'border-red-500' : 'border-green-500'}>
              <AlertDescription>{notification.message}</AlertDescription>
            </Alert>
          ))}
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 p-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="templates">Templates ({templates.length})</TabsTrigger>
            <TabsTrigger value="contracts">Contracts ({contracts.length})</TabsTrigger>
          </TabsList>

          {/* Search and Filter */}
          <div className="flex items-center space-x-4 my-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search templates or contracts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-48">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="asphalt_paving">Asphalt Paving</SelectItem>
                <SelectItem value="sealcoating">Sealcoating</SelectItem>
                <SelectItem value="parking_lot">Parking Lot</SelectItem>
                <SelectItem value="custom">Custom</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Templates Tab */}
          <TabsContent value="templates" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredTemplates.map(template => (
                <Card key={template.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span className="text-lg">{template.name}</span>
                      <Badge variant={template.virginiaCompliant ? 'default' : 'secondary'}>
                        {template.virginiaCompliant ? 'VA Compliant' : 'Custom'}
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                        <Building className="w-4 h-4" />
                        <span>{template.type.replace('_', ' ').toUpperCase()}</span>
                      </div>
                      
                      <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                        <FileCheck className="w-4 h-4" />
                        <span>{template.requiredFields.length} required fields</span>
                      </div>

                      <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                        <Calendar className="w-4 h-4" />
                        <span>v{template.version} - {template.lastModified.toLocaleDateString()}</span>
                      </div>

                      <div className="flex space-x-2 pt-3">
                        <Button
                          size="sm"
                          onClick={() => startContractCreation(template)}
                          className="flex-1"
                        >
                          <Plus className="w-4 h-4 mr-1" />
                          Create Contract
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedTemplate(template);
                            setShowPreview(true);
                          }}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Contracts Tab */}
          <TabsContent value="contracts" className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
              {filteredContracts.map(contract => {
                const template = templates.find(t => t.id === contract.templateId);
                return (
                  <Card key={contract.id} className="hover:shadow-lg transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="space-y-2">
                          <h3 className="text-lg font-semibold">{template?.name || 'Unknown Template'}</h3>
                          <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                            <div className="flex items-center space-x-1">
                              <User className="w-4 h-4" />
                              <span>{contract.fieldValues['client.businessName'] || 'No client'}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Calendar className="w-4 h-4" />
                              <span>{contract.created.toLocaleDateString()}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <DollarSign className="w-4 h-4" />
                              <span>${contract.fieldValues['payment.totalAmount']?.toLocaleString() || '0'}</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center space-x-2">
                          <Badge variant={
                            contract.status === 'signed' ? 'default' :
                            contract.status === 'pending_signature' ? 'secondary' :
                            'outline'
                          }>
                            {contract.status.replace('_', ' ').toUpperCase()}
                          </Badge>

                          <div className="flex space-x-1">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setSelectedContract(contract);
                                generatePreview();
                              }}
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => exportContract('pdf')}
                            >
                              <Download className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setSelectedContract(contract);
                                setSelectedTemplate(template || null);
                                setFormData({
                                  templateId: contract.templateId,
                                  parties: contract.parties,
                                  fieldValues: contract.fieldValues,
                                  status: contract.status,
                                  metadata: {
                                    createdBy: 'current_user',
                                    clientName: contract.fieldValues['client.businessName'] || '',
                                    projectName: contract.fieldValues['project.name'] || '',
                                    estimatedValue: contract.fieldValues['payment.totalAmount'] || 0
                                  }
                                });
                                setShowContractForm(true);
                              }}
                            >
                              <Edit3 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Template Editor Dialog */}
      <Dialog open={showTemplateEditor} onOpenChange={setShowTemplateEditor}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Template Editor</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* Template Metadata */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="template-name">Template Name</Label>
                <Input
                  id="template-name"
                  value={newTemplate.name}
                  onChange={(e) => setNewTemplate(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter template name"
                />
              </div>
              <div>
                <Label htmlFor="template-type">Template Type</Label>
                <Select
                  value={newTemplate.type}
                  onValueChange={(value) => setNewTemplate(prev => ({ ...prev, type: value as any }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="asphalt_paving">Asphalt Paving</SelectItem>
                    <SelectItem value="sealcoating">Sealcoating</SelectItem>
                    <SelectItem value="parking_lot">Parking Lot</SelectItem>
                    <SelectItem value="custom">Custom</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Virginia Compliance */}
            <div className="flex items-center space-x-2">
              <Switch
                id="virginia-compliant"
                checked={newTemplate.virginiaCompliant}
                onCheckedChange={(checked) => setNewTemplate(prev => ({ ...prev, virginiaCompliant: checked }))}
              />
              <Label htmlFor="virginia-compliant">Virginia Compliant</Label>
            </div>

            {/* Template Content */}
            <div>
              <Label htmlFor="template-content">Template Content (HTML/Text)</Label>
              <Textarea
                id="template-content"
                value={templateContent}
                onChange={(e) => setTemplateContent(e.target.value)}
                placeholder="Enter template content with {{field_name}} placeholders"
                className="h-64 font-mono text-sm"
              />
            </div>

            {/* Extracted Fields */}
            {templateFields.length > 0 && (
              <div>
                <Label>Extracted Fields ({templateFields.length})</Label>
                <ScrollArea className="h-48 border rounded p-2">
                  <div className="space-y-2">
                    {templateFields.map(field => (
                      <div key={field.id} className="flex items-center justify-between p-2 border rounded">
                        <div>
                          <span className="font-medium">{field.label}</span>
                          <span className="text-sm text-muted-foreground ml-2">({field.type})</span>
                        </div>
                        <Badge variant={field.required ? 'default' : 'secondary'}>
                          {field.required ? 'Required' : 'Optional'}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowTemplateEditor(false)}>
              Cancel
            </Button>
            <Button onClick={saveCustomTemplate}>
              <Save className="w-4 h-4 mr-2" />
              Save Template
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Contract Form Dialog */}
      <Dialog open={showContractForm} onOpenChange={setShowContractForm}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedContract ? 'Edit Contract' : 'Create New Contract'}
              {selectedTemplate && (
                <Badge variant="outline" className="ml-2">
                  {selectedTemplate.name}
                </Badge>
              )}
            </DialogTitle>
          </DialogHeader>

          {selectedTemplate && formData && (
            <div className="space-y-6">
              {/* Validation Errors */}
              {validationErrors.length > 0 && (
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    <div className="space-y-1">
                      {validationErrors.map((error, index) => (
                        <div key={index}>• {error}</div>
                      ))}
                    </div>
                  </AlertDescription>
                </Alert>
              )}

              {/* Form Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {selectedTemplate.requiredFields.map(field => (
                  <div key={field.fieldId}>
                    <Label htmlFor={field.fieldId} className="flex items-center">
                      {field.label}
                      {field.required && <span className="text-red-500 ml-1">*</span>}
                    </Label>
                    
                    {field.type === 'textarea' ? (
                      <Textarea
                        id={field.fieldId}
                        value={formData.fieldValues[field.fieldId] || ''}
                        onChange={(e) => updateFormField(field.fieldId, e.target.value)}
                        placeholder={field.placeholder}
                      />
                    ) : field.type === 'select' ? (
                      <Select
                        value={formData.fieldValues[field.fieldId] || ''}
                        onValueChange={(value) => updateFormField(field.fieldId, value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder={field.placeholder} />
                        </SelectTrigger>
                        <SelectContent>
                          {field.validation?.options?.map(option => (
                            <SelectItem key={option} value={option}>
                              {option}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : field.type === 'checkbox' ? (
                      <div className="flex items-center space-x-2">
                        <Switch
                          id={field.fieldId}
                          checked={formData.fieldValues[field.fieldId] || false}
                          onCheckedChange={(checked) => updateFormField(field.fieldId, checked)}
                        />
                        <Label htmlFor={field.fieldId}>{field.placeholder}</Label>
                      </div>
                    ) : (
                      <Input
                        id={field.fieldId}
                        type={field.type === 'currency' ? 'number' : field.type}
                        value={formData.fieldValues[field.fieldId] || ''}
                        onChange={(e) => updateFormField(field.fieldId, 
                          field.type === 'number' || field.type === 'currency' 
                            ? parseFloat(e.target.value) || 0 
                            : e.target.value
                        )}
                        placeholder={field.placeholder}
                        step={field.type === 'currency' ? '0.01' : undefined}
                      />
                    )}
                    
                    {field.helpText && (
                      <p className="text-xs text-muted-foreground mt-1">{field.helpText}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowContractForm(false)}>
              Cancel
            </Button>
            <Button onClick={saveContract} disabled={validationErrors.length > 0}>
              <Save className="w-4 h-4 mr-2" />
              {selectedContract ? 'Update Contract' : 'Create Contract'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Preview Dialog */}
      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="max-w-5xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>Contract Preview</DialogTitle>
          </DialogHeader>
          
          <ScrollArea className="h-96 border rounded p-4">
            <div className="prose max-w-none">
              {selectedContract ? (
                <div>Contract preview would be generated here...</div>
              ) : selectedTemplate ? (
                <div 
                  dangerouslySetInnerHTML={{ 
                    __html: DOMPurify.sanitize(
                      selectedTemplate.content.replace(/\{\{(\w+(?:\.\w+)*)\}\}/g, 
                        '<span class="bg-yellow-200 px-1 rounded">[[$1]]</span>'
                      ),
                      {
                        ALLOWED_TAGS: ['span', 'div', 'p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'br', 'strong', 'em', 'ul', 'ol', 'li'],
                        ALLOWED_ATTR: ['class'],
                        FORBID_SCRIPTS: true,
                        FORBID_TAGS: ['script', 'object', 'embed', 'link', 'style', 'meta']
                      }
                    )
                  }} 
                />
              ) : null}
            </div>
          </ScrollArea>

          <DialogFooter>
            {selectedContract && (
              <div className="flex space-x-2">
                <Button variant="outline" onClick={() => exportContract('html')}>
                  <Download className="w-4 h-4 mr-2" />
                  HTML
                </Button>
                <Button variant="outline" onClick={() => exportContract('pdf')}>
                  <Download className="w-4 h-4 mr-2" />
                  PDF
                </Button>
                <Button variant="outline" onClick={() => exportContract('docx')}>
                  <Download className="w-4 h-4 mr-2" />
                  DOCX
                </Button>
              </div>
            )}
            <Button onClick={() => setShowPreview(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CustomTemplateManager;