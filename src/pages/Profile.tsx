import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { toast } from 'sonner';
import { Camera, Save, Loader2 } from 'lucide-react';

type UserProfile = {
  id: string;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  phone: string | null;
  avatar_url: string | null;
  username: string | null;
  role: string | null;
  emergency_contact_name: string | null;
  emergency_contact_phone: string | null;
  emergency_contact_relationship: string | null;
  created_at: string | null;
};

export default function Profile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (user?.id) {
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    if (!user?.id) { return; }

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

      if (error) { throw error; }

      if (data) {
        setProfile(data);
      } else {
        // Create profile if it doesn't exist
        const newProfile = {
          id: user.id,
          email: user.email,
          first_name: null,
          last_name: null,
          phone: null,
          avatar_url: null,
          username: null,
          role: null,
          emergency_contact_name: null,
          emergency_contact_phone: null,
          emergency_contact_relationship: null,
        };

        const { error: insertError } = await supabase
          .from('profiles')
          .insert([newProfile]);

        if (insertError) { throw insertError; }
        setProfile({ ...newProfile, created_at: new Date().toISOString() });
      }
    } catch (error: any) {
      toast.error('Error loading profile: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarUpload = async (file: File) => {
    if (!user?.id) { return; }

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${Math.random()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);

      if (uploadError) { throw uploadError; }

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      await updateProfile({ avatar_url: publicUrl });
      toast.success('Avatar updated successfully!');
    } catch (error: any) {
      toast.error('Error uploading avatar: ' + error.message);
    } finally {
      setUploading(false);
    }
  };

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!user?.id) { return; }

    const { error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', user.id);

    if (error) { throw error; }

    setProfile(prev => prev ? { ...prev, ...updates } : null);
  };

  const handleSave = async () => {
    if (!profile || !user?.id) { return; }

    setSaving(true);
    try {
      await updateProfile({
        first_name: profile.first_name,
        last_name: profile.last_name,
        phone: profile.phone,
        username: profile.username,
        emergency_contact_name: profile.emergency_contact_name,
        emergency_contact_phone: profile.emergency_contact_phone,
        emergency_contact_relationship: profile.emergency_contact_relationship,
      });
      toast.success('Profile updated successfully!');
    } catch (error: any) {
      toast.error('Error updating profile: ' + error.message);
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

  if (!profile) {
    return (
      <div className="flex items-center justify-center h-96">
        <p>Error loading profile</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Profile</h1>
          <p className="text-muted-foreground">
            Manage your personal information and preferences
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
            <CardDescription>
              Update your profile information and avatar
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Avatar Section */}
            <div className="flex items-center gap-4">
              <Avatar className="h-20 w-20">
                <AvatarImage src={profile.avatar_url || ''} />
                <AvatarFallback>
                  {profile.first_name?.[0] || profile.email?.[0] || 'U'}
                </AvatarFallback>
              </Avatar>
              <div>
                <Label htmlFor="avatar">Profile Picture</Label>
                <Input
                  id="avatar"
                  type="file"
                  accept="image/*"
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    const file = e.target.files?.[0];
                    if (file) { handleAvatarUpload(file); }
                  }}
                  disabled={uploading}
                  className="mt-2"
                />
                {uploading && <p className="text-sm text-muted-foreground mt-1">Uploading...</p>}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="first_name">First Name</Label>
                <Input
                  id="first_name"
                  value={profile.first_name || ''}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => { setProfile(prev => prev ? { ...prev, first_name: e.target.value } : null); }}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="last_name">Last Name</Label>
                <Input
                  id="last_name"
                  value={profile.last_name || ''}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => { setProfile(prev => prev ? { ...prev, last_name: e.target.value } : null); }}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={profile.email || user?.email || ''}
                  disabled
                  className="bg-muted"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={profile.phone || ''}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => { setProfile(prev => prev ? { ...prev, phone: e.target.value } : null); }}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  value={profile.username || ''}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => { setProfile(prev => prev ? { ...prev, username: e.target.value } : null); }}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <Input
                  id="role"
                  value={profile.role || ''}
                  disabled
                  className="bg-muted"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Emergency Contact</CardTitle>
            <CardDescription>
              Emergency contact information for workplace safety
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="emergency_name">Contact Name</Label>
              <Input
                id="emergency_name"
                value={profile.emergency_contact_name || ''}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => { setProfile(prev => prev ? { ...prev, emergency_contact_name: e.target.value } : null); }}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="emergency_phone">Contact Phone</Label>
                <Input
                  id="emergency_phone"
                  value={profile.emergency_contact_phone || ''}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => { setProfile(prev => prev ? { ...prev, emergency_contact_phone: e.target.value } : null); }}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="emergency_relationship">Relationship</Label>
                <Input
                  id="emergency_relationship"
                  value={profile.emergency_contact_relationship || ''}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => { setProfile(prev => prev ? { ...prev, emergency_contact_relationship: e.target.value } : null); }}
                  placeholder="e.g., Spouse, Parent, Sibling"
                />
              </div>
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
                Save Changes
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}