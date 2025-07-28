# Admin User Setup Instructions

## Overview
This document provides step-by-step instructions for setting up the admin user (n8ter8@gmail.com) in the Pavement Performance Suite.

## Prerequisites
- Access to Supabase Dashboard
- Supabase project created and configured
- Database migrations applied

## Step 1: Create User in Supabase Auth

### Via Supabase Dashboard
1. Log into your Supabase Dashboard
2. Navigate to **Authentication** > **Users**
3. Click **"Add User"**
4. Fill in the following details:
   - **Email**: `n8ter8@gmail.com`
   - **Password**: Generate a secure password (you can use a password generator)
   - **Email Confirm**: Check this box to auto-confirm the email
5. Click **"Create User"**

### Via Supabase CLI (Alternative)
```bash
# Install Supabase CLI if not already installed
npm install -g supabase

# Login to Supabase
supabase login

# Create user via CLI
supabase auth admin create-user --email n8ter8@gmail.com --password "your-secure-password"
```

## Step 2: Insert User Record in Database

### Via Supabase Dashboard SQL Editor
1. Navigate to **SQL Editor** in your Supabase Dashboard
2. Create a new query and run the following SQL:

```sql
-- Insert the admin user record
INSERT INTO public.users (
  id,
  email,
  full_name,
  role,
  is_active,
  preferences
) VALUES (
  (SELECT id FROM auth.users WHERE email = 'n8ter8@gmail.com'),
  'n8ter8@gmail.com',
  'Nathan Terrell',
  'super_admin',
  true,
  '{
    "theme": "asphalt",
    "notifications": {
      "email": true,
      "push": true,
      "sms": false
    }
  }'
);
```

### Via Supabase CLI (Alternative)
```bash
# Run the SQL via CLI
supabase db reset --linked
```

## Step 3: Create Organization and Add User

### Via Supabase Dashboard SQL Editor
Run the following SQL to create an organization and add the admin user:

```sql
-- Create default organization
INSERT INTO public.organizations (
  id,
  name,
  description,
  logo_url,
  website,
  address,
  contact_info,
  settings
) VALUES (
  gen_random_uuid(),
  'Pavement Performance Suite',
  'Default organization for the Pavement Performance Suite',
  'https://example.com/logo.png',
  'https://pavement-performance-suite.com',
  '{
    "street": "123 Main Street",
    "city": "Anytown",
    "state": "CA",
    "zipCode": "12345",
    "country": "USA"
  }',
  '{
    "phone": "+1-555-123-4567",
    "email": "admin@pavement-performance-suite.com",
    "website": "https://pavement-performance-suite.com"
  }',
  '{
    "timezone": "America/Los_Angeles",
    "currency": "USD",
    "language": "en"
  }'
);

-- Add admin user to organization
INSERT INTO public.organization_members (
  organization_id,
  user_id,
  role,
  permissions
) VALUES (
  (SELECT id FROM public.organizations WHERE name = 'Pavement Performance Suite'),
  (SELECT id FROM auth.users WHERE email = 'n8ter8@gmail.com'),
  'super_admin',
  '["all"]'
);
```

## Step 4: Verify Setup

### Check User Creation
```sql
-- Verify user exists
SELECT 
  u.id,
  u.email,
  u.full_name,
  u.role,
  u.is_active,
  om.organization_id,
  o.name as organization_name
FROM public.users u
LEFT JOIN public.organization_members om ON u.id = om.user_id
LEFT JOIN public.organizations o ON om.organization_id = o.id
WHERE u.email = 'n8ter8@gmail.com';
```

### Check Permissions
```sql
-- Verify user has super_admin role
SELECT 
  u.email,
  u.role,
  om.permissions
FROM public.users u
JOIN public.organization_members om ON u.id = om.user_id
WHERE u.email = 'n8ter8@gmail.com';
```

## Step 5: Test Login

1. Open your application
2. Navigate to the login page
3. Enter the following credentials:
   - **Email**: `n8ter8@gmail.com`
   - **Password**: (the password you set in Step 1)
4. Click **"Login"**
5. Verify you can access the dashboard with full admin privileges

## Step 6: Configure Additional Settings

### Set User Preferences
```sql
-- Update user preferences for better experience
UPDATE public.users 
SET preferences = '{
  "theme": "asphalt",
  "notifications": {
    "email": true,
    "push": true,
    "sms": false
  },
  "dashboard": {
    "layout": "default",
    "widgets": ["projects", "equipment", "weather", "safety"]
  },
  "accessibility": {
    "highContrast": false,
    "reducedMotion": false,
    "fontSize": "normal",
    "lineSpacing": "normal"
  }
}'
WHERE email = 'n8ter8@gmail.com';
```

### Create Default Teams (Optional)
```sql
-- Create default teams
INSERT INTO public.teams (
  id,
  organization_id,
  name,
  description,
  leader_id
) VALUES 
(
  gen_random_uuid(),
  (SELECT id FROM public.organizations WHERE name = 'Pavement Performance Suite'),
  'Management Team',
  'Senior management and project oversight',
  (SELECT id FROM auth.users WHERE email = 'n8ter8@gmail.com')
),
(
  gen_random_uuid(),
  (SELECT id FROM public.organizations WHERE name = 'Pavement Performance Suite'),
  'Field Operations',
  'Field crews and equipment operators',
  (SELECT id FROM auth.users WHERE email = 'n8ter8@gmail.com')
),
(
  gen_random_uuid(),
  (SELECT id FROM public.organizations WHERE name = 'Pavement Performance Suite'),
  'Safety & Quality',
  'Safety officers and quality control specialists',
  (SELECT id FROM auth.users WHERE email = 'n8ter8@gmail.com')
);

-- Add admin user to all teams
INSERT INTO public.team_members (team_id, user_id, role)
SELECT 
  t.id,
  (SELECT id FROM auth.users WHERE email = 'n8ter8@gmail.com'),
  'admin'
FROM public.teams t
WHERE t.organization_id = (SELECT id FROM public.organizations WHERE name = 'Pavement Performance Suite');
```

## Troubleshooting

### Common Issues

#### 1. User Not Found in Database
```sql
-- Check if user exists in auth.users
SELECT * FROM auth.users WHERE email = 'n8ter8@gmail.com';

-- If not found, create via API or dashboard
```

#### 2. Permission Denied Errors
```sql
-- Check RLS policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename IN ('users', 'organizations', 'projects');
```

#### 3. Organization Not Found
```sql
-- Check if organization exists
SELECT * FROM public.organizations;

-- If empty, run the organization creation SQL again
```

### Reset Admin User (If Needed)
```sql
-- Delete existing user data
DELETE FROM public.organization_members WHERE user_id = (SELECT id FROM auth.users WHERE email = 'n8ter8@gmail.com');
DELETE FROM public.users WHERE email = 'n8ter8@gmail.com';

-- Then follow Steps 1-3 again
```

## Security Considerations

### Password Requirements
- Minimum 8 characters
- Include uppercase, lowercase, numbers, and special characters
- Avoid common passwords
- Consider using a password manager

### Access Control
- The admin user has full system access
- Consider implementing additional security measures
- Regularly review and audit admin activities
- Use environment variables for sensitive data

### Backup
- Regularly backup the database
- Test restore procedures
- Keep admin credentials secure

## Next Steps

After setting up the admin user:

1. **Configure Environment Variables**
   - Set up all required environment variables
   - Configure API keys and secrets

2. **Run Data Seeding**
   ```bash
   npm run seed
   # or
   yarn seed
   ```

3. **Test All Features**
   - Verify all modules work correctly
   - Test user management
   - Test project creation and management
   - Test equipment and material management

4. **Set Up Additional Users**
   - Create regular user accounts
   - Assign appropriate roles and permissions
   - Test team collaboration features

5. **Configure Notifications**
   - Set up email notifications
   - Configure push notifications
   - Test alert systems

## Support

If you encounter issues during setup:

1. Check the Supabase logs in the dashboard
2. Verify all migrations have been applied
3. Ensure RLS policies are correctly configured
4. Contact the development team for assistance

## Version Information

- **Application Version**: 1.0.0
- **Database Schema**: 20241201000000_initial_schema
- **Last Updated**: December 2024 