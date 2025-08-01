import { useState, useEffect } from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Input } from '../ui/input';
import { 
  FileText, 
  Upload, 
  Download, 
  Share, 
  Search, 
  FolderOpen, 
  Eye,
  Edit,
  Trash2,
  Lock,
  Users,
  Calendar,
  FileIcon
} from 'lucide-react';
import { supabase } from '../../integrations/supabase/client';

interface Document {
  id: string;
  title: string;
  description: string;
  file_path: string;
  file_type: string;
  file_size: number;
  version: number;
  owner_id: string;
  status: string;
  created_at: string;
  updated_at: string;
}

interface DocumentVersion {
  id: string;
  document_id: string;
  version: number;
  file_path: string;
  file_size: number;
  changes_description: string;
  created_by: string;
  created_at: string;
}

export const DocumentManagement = () => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [versions, setVersions] = useState<DocumentVersion[]>([]);
  const [activeTab, setActiveTab] = useState('documents');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDocumentData();
  }, []);

  const loadDocumentData = async () => {
    try {
      const [documentsRes, versionsRes] = await Promise.all([
        supabase.from('documents').select('*'),
        supabase.from('document_versions').select('*')
      ]);

      if (documentsRes.data) setDocuments(documentsRes.data);
      if (versionsRes.data) setVersions(versionsRes.data);
    } catch (error) {
      console.error('Error loading document data:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredDocuments = documents.filter(doc =>
    doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doc.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (fileType: string) => {
    if (fileType.includes('image')) return '🖼️';
    if (fileType.includes('pdf')) return '📄';
    if (fileType.includes('word')) return '📝';
    if (fileType.includes('excel')) return '📊';
    return '📄';
  };

  const DocumentsTab = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <h3 className="text-lg font-semibold">Document Library</h3>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search documents..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-64"
            />
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <FolderOpen className="h-4 w-4 mr-2" />
            New Folder
          </Button>
          <Button>
            <Upload className="h-4 w-4 mr-2" />
            Upload Document
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredDocuments.map((doc) => (
          <Card key={doc.id} className="p-6 hover:shadow-md transition-shadow">
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{getFileIcon(doc.file_type)}</span>
                  <div>
                    <h4 className="font-semibold line-clamp-1">{doc.title}</h4>
                    <p className="text-sm text-muted-foreground">
                      v{doc.version} • {formatFileSize(doc.file_size)}
                    </p>
                  </div>
                </div>
                <Badge variant={doc.status === 'active' ? 'secondary' : 'outline'}>
                  {doc.status}
                </Badge>
              </div>

              {doc.description && (
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {doc.description}
                </p>
              )}

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Calendar className="h-3 w-3" />
                  {new Date(doc.updated_at).toLocaleDateString()}
                </div>
                <div className="flex gap-1">
                  <Button variant="ghost" size="sm">
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Download className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Share className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );

  const VersionHistoryTab = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Version History</h3>
        <Button variant="outline">Export History</Button>
      </div>

      <Card className="p-6">
        <div className="space-y-4">
          {versions.map((version) => (
            <div key={version.id} className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 bg-primary/10 rounded-full flex items-center justify-center">
                  <FileIcon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium">Version {version.version}</p>
                  <p className="text-sm text-muted-foreground">
                    {version.changes_description || 'No description provided'}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(version.created_at).toLocaleDateString()} • {formatFileSize(version.file_size)}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm">View</Button>
                <Button variant="outline" size="sm">Restore</Button>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );

  const PermissionsTab = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Access Control</h3>
        <Button>Manage Permissions</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6">
          <h4 className="font-semibold mb-4 flex items-center gap-2">
            <Lock className="h-5 w-5" />
            Document Permissions
          </h4>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm">Read Access</span>
              <Badge variant="secondary">All Users</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Write Access</span>
              <Badge variant="secondary">Project Managers</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Admin Access</span>
              <Badge variant="secondary">Administrators</Badge>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h4 className="font-semibold mb-4 flex items-center gap-2">
            <Users className="h-5 w-5" />
            Shared Documents
          </h4>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm">Public Documents</span>
              <span className="text-sm font-medium">{documents.length}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Private Documents</span>
              <span className="text-sm font-medium">0</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Shared with Teams</span>
              <span className="text-sm font-medium">0</span>
            </div>
          </div>
        </Card>
      </div>
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
          <h1 className="text-3xl font-bold tracking-tight">Document Management</h1>
          <p className="text-muted-foreground">
            Centralized document storage with version control and access management
          </p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="versions">Version History</TabsTrigger>
          <TabsTrigger value="permissions">Permissions</TabsTrigger>
        </TabsList>

        <TabsContent value="documents">
          <DocumentsTab />
        </TabsContent>

        <TabsContent value="versions">
          <VersionHistoryTab />
        </TabsContent>

        <TabsContent value="permissions">
          <PermissionsTab />
        </TabsContent>
      </Tabs>
    </div>
  );
};