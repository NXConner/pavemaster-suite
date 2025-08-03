import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { toast } from 'sonner';
import { Building, Save, Loader2 } from 'lucide-react';

type Company = {
  id: string;
  name: string;
  billing_info: any;
  business_type: string | null;
  contact_info: any;
  metadata: any;
  registration_number: string | null;
  settings: any;
  status: string | null;
  tax_id: string | null;
  created_at: string | null;
  updated_at: string | null;
};

export default function CompanySetup() {
  const { user } = useAuth();
  const [company, setCompany] = useState<Company | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [contactInfo, setContactInfo] = useState({
    phone: '',
    email: '',
    website: '',
    address: '',
    city: '',
    state: '',
    zip_code: ''
  });

  useEffect(() => {
    if (user?.id) {
      fetchCompany();
    }
  }, [user]);

  const fetchCompany = async () => {
    if (!user?.id) return;
    
    try {
      const { data, error } = await supabase
        .from('companies')
        .select('*')
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setCompany(data);
        // Extract contact info from the contact_info JSON field
        if (data.contact_info) {
          setContactInfo(data.contact_info as any);
        }
      }
    } catch (error: any) {
      toast.error('Error loading company: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!user?.id) return;

    setSaving(true);
    try {
      const companyData = {
        name: company?.name || '',
        contact_info: contactInfo,
        business_type: company?.business_type || null,
        registration_number: company?.registration_number || null,
        tax_id: company?.tax_id || null,
        status: 'active',
        updated_at: new Date().toISOString()
      };

      if (company?.id) {
        // Update existing company
        const { error } = await supabase
          .from('companies')
          .update(companyData)
          .eq('id', company.id);

        if (error) throw error;
      } else {
        // Create new company
        const { data, error } = await supabase
          .from('companies')
          .insert([companyData])
          .select()
          .single();

        if (error) throw error;
        setCompany(data);
      }

      toast.success('Company information saved successfully!');
    } catch (error: any) {
      toast.error('Error saving company: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Company Setup</h1>
          <p className="text-muted-foreground">
            Configure your company information and business details
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building className="h-5 w-5" />
              Business Information
            </CardTitle>
            <CardDescription>
              Basic company details and registration information
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="company_name">Company Name</Label>
              <Input
                id="company_name"
                value={company?.name || ''}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                  setCompany(prev => prev ? { ...prev, name: e.target.value } : { 
                    id: '', name: e.target.value, billing_info: null, business_type: null, 
                    contact_info: null, metadata: null, registration_number: null, 
                    settings: null, status: null, tax_id: null, created_at: null, updated_at: null 
                  })
                }
                placeholder="Enter your company name"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="business_type">Business Type</Label>
                <Input
                  id="business_type"
                  value={company?.business_type || ''}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                    setCompany(prev => prev ? { ...prev, business_type: e.target.value } : null)
                  }
                  placeholder="e.g., LLC, Corporation, Partnership"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="registration_number">Registration Number</Label>
                <Input
                  id="registration_number"
                  value={company?.registration_number || ''}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                    setCompany(prev => prev ? { ...prev, registration_number: e.target.value } : null)
                  }
                  placeholder="Business registration number"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="tax_id">Tax ID / EIN</Label>
              <Input
                id="tax_id"
                value={company?.tax_id || ''}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                  setCompany(prev => prev ? { ...prev, tax_id: e.target.value } : null)
                }
                placeholder="Federal Tax ID or EIN"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Contact Information</CardTitle>
            <CardDescription>
              Business contact details and address
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="address">Business Address</Label>
              <Input
                id="address"
                value={contactInfo.address}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                  setContactInfo(prev => ({ ...prev, address: e.target.value }))
                }
                placeholder="Street address"
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  value={contactInfo.city}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                    setContactInfo(prev => ({ ...prev, city: e.target.value }))
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="state">State</Label>
                <Input
                  id="state"
                  value={contactInfo.state}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                    setContactInfo(prev => ({ ...prev, state: e.target.value }))
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="zip_code">ZIP Code</Label>
                <Input
                  id="zip_code"
                  value={contactInfo.zip_code}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                    setContactInfo(prev => ({ ...prev, zip_code: e.target.value }))
                  }
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={contactInfo.phone}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                    setContactInfo(prev => ({ ...prev, phone: e.target.value }))
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={contactInfo.email}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                    setContactInfo(prev => ({ ...prev, email: e.target.value }))
                  }
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="website">Website</Label>
              <Input
                id="website"
                value={contactInfo.website}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                  setContactInfo(prev => ({ ...prev, website: e.target.value }))
                }
                placeholder="https://yourcompany.com"
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button onClick={handleSave} disabled={saving}>
            {saving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save Company Information
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}