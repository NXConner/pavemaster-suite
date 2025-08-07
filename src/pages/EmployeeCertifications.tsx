import React, { useState, useEffect } from 'react';
import { supabase } from '../integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Badge } from '../components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { toast } from 'sonner';
import { Calendar, FileText, Plus, Search, AlertTriangle, CheckCircle, Clock } from 'lucide-react';

type EmployeeCertification = {
  id: string;
  employee_id: string | null;
  name: string | null;
  issuing_authority: string | null;
  certificate_number: string | null;
  issue_date: string | null;
  expiry_date: string | null;
  status: string | null;
};

export default function EmployeeCertifications() {
  const [certifications, setCertifications] = useState<EmployeeCertification[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [newCertification, setNewCertification] = useState({
    name: '',
    issuing_authority: '',
    certificate_number: '',
    issue_date: '',
    expiry_date: '',
    status: 'active',
  });

  useEffect(() => {
    fetchCertifications();
  }, []);

  const fetchCertifications = async () => {
    try {
      const { data, error } = await supabase
        .from('employee_certifications')
        .select('*')
        .order('expiry_date', { ascending: true });

      if (error) { throw error; }
      setCertifications(data || []);
    } catch (error: any) {
      toast.error('Error fetching certifications: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const addCertification = async () => {
    try {
      const { error } = await supabase
        .from('employee_certifications')
        .insert([{
          ...newCertification,
          employee_id: (await supabase.auth.getUser()).data.user?.id,
        }]);

      if (error) { throw error; }

      toast.success('Certification added successfully');
      setAddDialogOpen(false);
      setNewCertification({
        name: '',
        issuing_authority: '',
        certificate_number: '',
        issue_date: '',
        expiry_date: '',
        status: 'active',
      });
      fetchCertifications();
    } catch (error: any) {
      toast.error('Error adding certification: ' + error.message);
    }
  };

  const getStatusIcon = (status: string | null, expiryDate: string | null) => {
    if (!expiryDate) { return <Clock className="h-4 w-4 text-gray-500" />; }

    const expiry = new Date(expiryDate);
    const now = new Date();
    const thirtyDaysFromNow = new Date(now.getTime() + (30 * 24 * 60 * 60 * 1000));

    if (status === 'expired' || expiry < now) {
      return <AlertTriangle className="h-4 w-4 text-red-500" />;
    } else if (expiry < thirtyDaysFromNow) {
      return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
    }
      return <CheckCircle className="h-4 w-4 text-green-500" />;
  };

  const getStatusBadge = (status: string | null, expiryDate: string | null): { variant: 'default' | 'secondary' | 'destructive' | 'outline', label: string } => {
    if (!expiryDate) { return { variant: 'outline', label: 'No Expiry' }; }

    const expiry = new Date(expiryDate);
    const now = new Date();
    const thirtyDaysFromNow = new Date(now.getTime() + (30 * 24 * 60 * 60 * 1000));

    if (status === 'expired' || expiry < now) {
      return { variant: 'destructive', label: 'Expired' };
    } else if (expiry < thirtyDaysFromNow) {
      return { variant: 'outline', label: 'Expiring Soon' };
    }
      return { variant: 'default', label: 'Active' };
  };

  const getDaysUntilExpiry = (expiryDate: string | null) => {
    if (!expiryDate) { return null; }

    const expiry = new Date(expiryDate);
    const now = new Date();
    const diffTime = expiry.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return diffDays;
  };

  const filteredCertifications = certifications.filter(cert => {
    const matchesSearch = cert.name?.toLowerCase().includes(searchTerm.toLowerCase())
                         || cert.issuing_authority?.toLowerCase().includes(searchTerm.toLowerCase())
                         || cert.certificate_number?.toLowerCase().includes(searchTerm.toLowerCase());

    if (statusFilter === 'all') { return matchesSearch; }

    const { label } = getStatusBadge(cert.status, cert.expiry_date);
    return matchesSearch && label.toLowerCase().includes(statusFilter);
  });

  const stats = {
    total: certifications.length,
    active: certifications.filter(c => {
      const { label } = getStatusBadge(c.status, c.expiry_date);
      return label === 'Active';
    }).length,
    expiring: certifications.filter(c => {
      const { label } = getStatusBadge(c.status, c.expiry_date);
      return label === 'Expiring Soon';
    }).length,
    expired: certifications.filter(c => {
      const { label } = getStatusBadge(c.status, c.expiry_date);
      return label === 'Expired';
    }).length,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Employee Certifications</h1>
            <p className="text-muted-foreground">
              Manage professional certifications and track expiration dates
            </p>
          </div>
          <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Certification
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Add New Certification</DialogTitle>
                <DialogDescription>
                  Add a new professional certification or license
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Certification Name</Label>
                  <Input
                    id="name"
                    value={newCertification.name}
                    onChange={(e) => { setNewCertification(prev => ({ ...prev, name: e.target.value })); }}
                    placeholder="e.g., Commercial Driver's License"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="authority">Issuing Authority</Label>
                  <Input
                    id="authority"
                    value={newCertification.issuing_authority}
                    onChange={(e) => { setNewCertification(prev => ({ ...prev, issuing_authority: e.target.value })); }}
                    placeholder="e.g., Virginia DMV"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="number">Certificate Number</Label>
                  <Input
                    id="number"
                    value={newCertification.certificate_number}
                    onChange={(e) => { setNewCertification(prev => ({ ...prev, certificate_number: e.target.value })); }}
                    placeholder="Certificate or license number"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="issue_date">Issue Date</Label>
                    <Input
                      id="issue_date"
                      type="date"
                      value={newCertification.issue_date}
                      onChange={(e) => { setNewCertification(prev => ({ ...prev, issue_date: e.target.value })); }}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="expiry_date">Expiry Date</Label>
                    <Input
                      id="expiry_date"
                      type="date"
                      value={newCertification.expiry_date}
                      onChange={(e) => { setNewCertification(prev => ({ ...prev, expiry_date: e.target.value })); }}
                    />
                  </div>
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => { setAddDialogOpen(false); }}>
                  Cancel
                </Button>
                <Button onClick={addCertification}>
                  Add Certification
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold">{stats.total}</p>
                  <p className="text-xs text-muted-foreground">Total Certifications</p>
                </div>
                <FileText className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-green-600">{stats.active}</p>
                  <p className="text-xs text-muted-foreground">Active</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-yellow-600">{stats.expiring}</p>
                  <p className="text-xs text-muted-foreground">Expiring Soon</p>
                </div>
                <Clock className="h-8 w-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-red-600">{stats.expired}</p>
                  <p className="text-xs text-muted-foreground">Expired</p>
                </div>
                <AlertTriangle className="h-8 w-8 text-red-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search certifications..."
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); }}
              className="pl-10"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="expiring">Expiring Soon</SelectItem>
              <SelectItem value="expired">Expired</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Certifications List */}
        <div className="grid gap-4">
          {filteredCertifications.map((cert) => {
            const statusBadge = getStatusBadge(cert.status, cert.expiry_date);
            const daysUntilExpiry = getDaysUntilExpiry(cert.expiry_date);

            return (
              <Card key={cert.id}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        {getStatusIcon(cert.status, cert.expiry_date)}
                        <h3 className="font-semibold">{cert.name}</h3>
                        <Badge variant={statusBadge.variant}>
                          {statusBadge.label}
                        </Badge>
                      </div>
                      <div className="space-y-1 text-sm text-muted-foreground">
                        <p><strong>Issuing Authority:</strong> {cert.issuing_authority}</p>
                        <p><strong>Certificate Number:</strong> {cert.certificate_number}</p>
                        <div className="flex items-center gap-4">
                          {cert.issue_date && (
                            <span><strong>Issued:</strong> {new Date(cert.issue_date).toLocaleDateString()}</span>
                          )}
                          {cert.expiry_date && (
                            <span><strong>Expires:</strong> {new Date(cert.expiry_date).toLocaleDateString()}</span>
                          )}
                        </div>
                        {daysUntilExpiry !== null && (
                          <p className={`font-medium ${
                            daysUntilExpiry < 0 ? 'text-red-600'
                            : daysUntilExpiry < 30 ? 'text-yellow-600' : 'text-green-600'
                          }`}>
                            {daysUntilExpiry < 0
                              ? `Expired ${Math.abs(daysUntilExpiry)} days ago`
                              : daysUntilExpiry === 0
                                ? 'Expires today'
                                : `Expires in ${daysUntilExpiry} days`
                            }
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm">
                        <Calendar className="mr-2 h-4 w-4" />
                        Renew
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {filteredCertifications.length === 0 && (
          <Card>
            <CardContent className="p-12 text-center">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No certifications found</h3>
              <p className="text-muted-foreground">
                {searchTerm || statusFilter !== 'all'
                  ? 'Try adjusting your search or filter criteria'
                  : 'Add your first certification to get started'
                }
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}