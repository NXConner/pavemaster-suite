import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { User, Mail, Phone, MapPin } from 'lucide-react';

export function AccountSettings() {
  const accountInfo = [
    {
      label: 'Name',
      value: 'John Doe',
      icon: User
    },
    {
      label: 'Email',
      value: 'john.doe@pavemaster.com',
      icon: Mail
    },
    {
      label: 'Phone',
      value: '+1 (555) 123-4567',
      icon: Phone
    },
    {
      label: 'Location',
      value: 'San Francisco, CA',
      icon: MapPin
    }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5" />
          Account Information
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {accountInfo.map((info, index) => {
          const Icon = info.icon;
          return (
            <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-3">
                <Icon className="h-4 w-4 text-muted-foreground" />
                <div>
                  <div className="text-sm font-medium">{info.label}</div>
                  <div className="text-sm text-muted-foreground">{info.value}</div>
                </div>
              </div>
              <Button variant="outline" size="sm">
                Edit
              </Button>
            </div>
          );
        })}
        
        <div className="pt-4 border-t">
          <Button variant="destructive" size="sm">
            Delete Account
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}