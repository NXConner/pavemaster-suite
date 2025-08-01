# PaveMaster Suite - Troubleshooting Guide

## Quick Reference

### Emergency Contacts
- **Technical Support**: support@pavemaster-suite.com
- **Critical Issues**: emergency@pavemaster-suite.com
- **Security Issues**: security@pavemaster-suite.com

### System Status
- **Status Page**: https://status.pavemaster-suite.com
- **Incident Updates**: https://status.pavemaster-suite.com/incidents
- **Maintenance Windows**: Announced 48 hours in advance

## Common Issues & Solutions

### 🚀 Startup & Deployment Issues

#### Application Won't Start

**Symptoms:**
- Blank screen or loading indefinitely
- Console errors during startup
- Build failures

**Solutions:**

1. **Check Environment Variables**
   ```bash
   # Verify required environment variables
   cat .env.example
   # Compare with your .env file
   ```

2. **Clear Build Cache**
   ```bash
   rm -rf node_modules/.vite
   rm -rf dist
   npm run build
   ```

3. **Verify Dependencies**
   ```bash
   npm install
   npm audit fix
   ```

4. **Check Node Version**
   ```bash
   node --version  # Should be >= 18.0.0
   npm --version   # Should be >= 8.0.0
   ```

#### Database Connection Issues

**Symptoms:**
- "Database connection failed" errors
- Unable to authenticate users
- Missing data or tables

**Solutions:**

1. **Verify Supabase Configuration**
   ```env
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_anon_key
   ```

2. **Run Database Migrations**
   ```bash
   npm run db:migrate
   ```

3. **Check RLS Policies**
   ```sql
   -- Check if RLS is enabled
   SELECT schemaname, tablename, rowsecurity 
   FROM pg_tables 
   WHERE schemaname = 'public';
   ```

4. **Seed Database (if needed)**
   ```bash
   npm run db:seed
   ```

### 🔐 Authentication Issues

#### Login/Registration Failures

**Symptoms:**
- "Invalid credentials" for correct passwords
- Unable to register new users
- Session expires immediately

**Solutions:**

1. **Check JWT Configuration**
   ```env
   # Verify JWT settings in Supabase dashboard
   # Authentication > Settings > JWT Settings
   ```

2. **Clear Browser Storage**
   ```javascript
   // In browser console
   localStorage.clear();
   sessionStorage.clear();
   ```

3. **Verify Email Confirmation**
   - Check spam folder for confirmation emails
   - Resend confirmation if needed

4. **Reset Password**
   ```bash
   # Use Supabase dashboard to reset user password
   # Or implement password reset flow
   ```

#### Role-Based Access Control Issues

**Symptoms:**
- Users can access unauthorized features
- "Access denied" for valid users
- Incorrect role assignments

**Solutions:**

1. **Check User Roles in Database**
   ```sql
   SELECT u.email, p.role, p.permissions 
   FROM auth.users u
   JOIN public.profiles p ON u.id = p.user_id;
   ```

2. **Verify RLS Policies**
   ```sql
   -- Check policies for specific table
   SELECT * FROM pg_policies WHERE tablename = 'your_table';
   ```

3. **Update User Role**
   ```sql
   UPDATE public.profiles 
   SET role = 'admin' 
   WHERE user_id = 'user-uuid';
   ```

### 🗺️ GPS & Tracking Issues

#### GPS Not Working

**Symptoms:**
- "Location not available" errors
- Inaccurate location data
- Tracking not updating

**Solutions:**

1. **Check Browser Permissions**
   ```javascript
   // Request location permission
   navigator.geolocation.getCurrentPosition(
     position => console.log(position),
     error => console.error(error)
   );
   ```

2. **Verify HTTPS Connection**
   - GPS requires HTTPS in production
   - Use ngrok for local HTTPS testing

3. **Check Device Settings**
   - Enable location services
   - Allow browser location access
   - Ensure GPS is enabled on mobile

4. **Test Location API**
   ```javascript
   // Test geolocation API
   if ("geolocation" in navigator) {
     console.log("Geolocation available");
   } else {
     console.log("Geolocation not available");
   }
   ```

#### Map Not Loading

**Symptoms:**
- Blank map area
- Map tiles not loading
- "Map failed to load" errors

**Solutions:**

1. **Check Map API Keys**
   ```env
   VITE_MAPBOX_TOKEN=your_mapbox_token
   ```

2. **Verify Network Connectivity**
   ```bash
   curl -I https://api.mapbox.com
   ```

3. **Clear Map Cache**
   ```javascript
   // Clear map cache in browser
   // Or force refresh map component
   ```

### 📱 Mobile App Issues

#### Capacitor Build Failures

**Symptoms:**
- Android/iOS build errors
- Plugin conflicts
- Native functionality not working

**Solutions:**

1. **Sync Capacitor**
   ```bash
   npx cap sync
   npx cap copy
   ```

2. **Update Plugins**
   ```bash
   npm update @capacitor/core @capacitor/cli
   npx cap doctor
   ```

3. **Clean Native Projects**
   ```bash
   # Android
   cd android && ./gradlew clean
   
   # iOS
   cd ios && xcodebuild clean
   ```

4. **Check Plugin Permissions**
   ```xml
   <!-- Android permissions in android/app/src/main/AndroidManifest.xml -->
   <uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
   ```

#### Offline Functionality Issues

**Symptoms:**
- Data not syncing when back online
- Offline features not working
- Data loss during offline periods

**Solutions:**

1. **Check Service Worker**
   ```javascript
   // Verify service worker registration
   if ('serviceWorker' in navigator) {
     navigator.serviceWorker.getRegistrations().then(registrations => {
       console.log('Service Workers:', registrations);
     });
   }
   ```

2. **Verify IndexedDB**
   ```javascript
   // Check offline data storage
   const request = indexedDB.open('PaveMasterDB');
   request.onsuccess = () => console.log('IndexedDB available');
   ```

3. **Force Sync**
   ```javascript
   // Trigger manual sync when online
   if (navigator.onLine) {
     // Call sync function
     syncOfflineData();
   }
   ```

### 💰 Financial & Calculation Issues

#### Calculation Errors

**Symptoms:**
- Incorrect material calculations
- Wrong cost estimations
- Formula errors

**Solutions:**

1. **Verify Input Values**
   ```javascript
   // Check for NaN or invalid inputs
   if (isNaN(value) || value < 0) {
     throw new Error('Invalid input value');
   }
   ```

2. **Update Calculation Formulas**
   ```javascript
   // Example: Asphalt calculation
   const tonnage = (area * thickness * density) / 2000;
   ```

3. **Check Unit Conversions**
   ```javascript
   // Ensure consistent units
   const sqft = length * width; // feet
   const sqyd = sqft / 9; // yards
   ```

#### Payment Integration Issues

**Symptoms:**
- Payment processing failures
- Invoice generation errors
- Tax calculation problems

**Solutions:**

1. **Check Payment Gateway Configuration**
   ```env
   VITE_STRIPE_PUBLIC_KEY=pk_...
   STRIPE_SECRET_KEY=sk_...
   ```

2. **Verify Tax Settings**
   ```javascript
   // Check tax calculation logic
   const tax = subtotal * taxRate;
   const total = subtotal + tax;
   ```

3. **Test Payment Flow**
   ```bash
   # Use test payment methods
   # Card: 4242424242424242
   ```

### 🤖 AI & ML Issues

#### AI Features Not Working

**Symptoms:**
- Predictive analytics not loading
- AI recommendations not appearing
- ML model errors

**Solutions:**

1. **Check TensorFlow.js**
   ```javascript
   // Verify TensorFlow.js loading
   import * as tf from '@tensorflow/tfjs';
   console.log('TensorFlow version:', tf.version);
   ```

2. **Verify Model Loading**
   ```javascript
   // Check model availability
   try {
     const model = await tf.loadLayersModel('/models/prediction-model.json');
     console.log('Model loaded successfully');
   } catch (error) {
     console.error('Model loading failed:', error);
   }
   ```

3. **Check Data Preprocessing**
   ```javascript
   // Ensure data is properly formatted for ML
   const processedData = normalizeData(rawData);
   ```

### 🔧 Equipment & IoT Issues

#### IoT Device Connectivity

**Symptoms:**
- Devices not reporting data
- Sensor readings unavailable
- Equipment status not updating

**Solutions:**

1. **Check Device Network**
   ```bash
   # Verify device connectivity
   ping device-ip-address
   ```

2. **Verify MQTT Broker**
   ```javascript
   // Check MQTT connection
   const client = mqtt.connect('mqtt://broker.url');
   client.on('connect', () => console.log('MQTT connected'));
   ```

3. **Check Device Certificates**
   ```bash
   # Verify SSL certificates for IoT devices
   openssl x509 -in device-cert.pem -text -noout
   ```

#### Equipment Tracking Issues

**Symptoms:**
- Equipment location not updating
- Maintenance schedules not working
- Equipment history missing

**Solutions:**

1. **Verify Equipment Registration**
   ```sql
   SELECT * FROM equipment WHERE id = 'equipment-id';
   ```

2. **Check Tracking Updates**
   ```javascript
   // Ensure tracking data is being sent
   const trackingData = {
     equipmentId: 'eq-123',
     location: { lat: 40.7128, lng: -74.0060 },
     timestamp: new Date().toISOString()
   };
   ```

## Performance Issues

### 🐌 Slow Loading Times

#### Application Performance

**Symptoms:**
- Slow page loads
- Laggy user interface
- High memory usage

**Solutions:**

1. **Check Bundle Size**
   ```bash
   npm run build
   npm run analyze
   ```

2. **Optimize Images**
   ```bash
   # Compress images
   npx imagemin input/*.jpg --out-dir=output
   ```

3. **Enable Lazy Loading**
   ```javascript
   // Implement lazy loading for components
   const LazyComponent = lazy(() => import('./Component'));
   ```

4. **Check Memory Leaks**
   ```javascript
   // Use React DevTools Profiler
   // Monitor memory usage in browser
   ```

#### Database Performance

**Symptoms:**
- Slow queries
- High database load
- Timeout errors

**Solutions:**

1. **Analyze Slow Queries**
   ```sql
   -- Check slow queries in Supabase
   SELECT query, mean_time, calls 
   FROM pg_stat_statements 
   ORDER BY mean_time DESC;
   ```

2. **Add Database Indexes**
   ```sql
   -- Add indexes for frequently queried columns
   CREATE INDEX idx_projects_status ON projects(status);
   ```

3. **Optimize Queries**
   ```sql
   -- Use efficient queries
   SELECT id, name FROM projects 
   WHERE status = 'active' 
   LIMIT 50;
   ```

### 📊 Data Issues

#### Data Synchronization Problems

**Symptoms:**
- Data not updating across devices
- Stale data displayed
- Sync conflicts

**Solutions:**

1. **Check Real-time Subscriptions**
   ```javascript
   // Verify Supabase real-time
   const subscription = supabase
     .channel('projects')
     .on('postgres_changes', {
       event: '*',
       schema: 'public',
       table: 'projects'
     }, payload => {
       console.log('Change received!', payload);
     })
     .subscribe();
   ```

2. **Force Data Refresh**
   ```javascript
   // Manually refresh data
   const { data, error } = await supabase
     .from('projects')
     .select('*')
     .order('created_at', { ascending: false });
   ```

3. **Check Conflict Resolution**
   ```javascript
   // Implement last-write-wins or custom conflict resolution
   const resolveConflict = (local, remote) => {
     return remote.updated_at > local.updated_at ? remote : local;
   };
   ```

## Security Issues

### 🔒 Security Vulnerabilities

#### XSS Prevention

**Symptoms:**
- Script injection warnings
- Malicious content execution
- Security audit failures

**Solutions:**

1. **Sanitize User Input**
   ```javascript
   import DOMPurify from 'dompurify';
   const cleanHTML = DOMPurify.sanitize(userInput);
   ```

2. **Use Content Security Policy**
   ```html
   <meta http-equiv="Content-Security-Policy" 
         content="default-src 'self'; script-src 'self' 'unsafe-inline';">
   ```

3. **Validate All Inputs**
   ```javascript
   import { z } from 'zod';
   const schema = z.string().min(1).max(100);
   const validatedInput = schema.parse(userInput);
   ```

#### API Security

**Symptoms:**
- Unauthorized API access
- Rate limit exceeded
- API key exposure

**Solutions:**

1. **Verify Authentication**
   ```javascript
   // Check JWT token validation
   const { data: user } = await supabase.auth.getUser();
   if (!user) throw new Error('Unauthorized');
   ```

2. **Implement Rate Limiting**
   ```javascript
   // Use rate limiting middleware
   const rateLimit = {
     windowMs: 15 * 60 * 1000, // 15 minutes
     max: 100 // limit each IP to 100 requests per windowMs
   };
   ```

3. **Secure API Keys**
   ```env
   # Never commit API keys to version control
   VITE_SUPABASE_ANON_KEY=your_anon_key_here
   ```

## Monitoring & Debugging

### 📊 Application Monitoring

#### Enable Debugging

```javascript
// Enable debug mode
localStorage.setItem('debug', 'pavemaster:*');

// Check console for detailed logs
console.log('Debug mode enabled');
```

#### Monitor Performance

```javascript
// Use Performance API
performance.mark('start-operation');
// ... your operation
performance.mark('end-operation');
performance.measure('operation-duration', 'start-operation', 'end-operation');
```

#### Error Tracking

```javascript
// Implement error boundary
class ErrorBoundary extends React.Component {
  componentDidCatch(error, errorInfo) {
    console.error('Error caught:', error, errorInfo);
    // Send to error tracking service
  }
}
```

### 🔍 Log Analysis

#### Application Logs

```bash
# View application logs
npm run logs

# Filter by log level
npm run logs:error
npm run logs:warn
```

#### Database Logs

```sql
-- Check database logs in Supabase dashboard
-- Or query pg_stat_activity for active connections
SELECT * FROM pg_stat_activity WHERE state = 'active';
```

## Getting Help

### 📞 Support Channels

1. **Documentation**: Check this guide and other docs first
2. **GitHub Issues**: Report bugs and feature requests
3. **Email Support**: support@pavemaster-suite.com
4. **Emergency**: emergency@pavemaster-suite.com (critical issues only)

### 🎯 When Contacting Support

Include the following information:

1. **Environment**: Development, staging, or production
2. **Browser/Device**: Browser version, OS, device type
3. **User Role**: Admin, manager, crew, driver
4. **Steps to Reproduce**: Detailed reproduction steps
5. **Error Messages**: Full error messages and stack traces
6. **Console Logs**: Browser console output
7. **Network Logs**: Failed API requests
8. **Screenshots**: Visual evidence of the issue

### 📋 Issue Template

```markdown
**Environment**: Production/Staging/Development
**Browser**: Chrome 120.0.0.0
**User Role**: Admin
**Issue Type**: Bug/Performance/Security

**Description**:
Brief description of the issue

**Steps to Reproduce**:
1. Go to...
2. Click on...
3. See error

**Expected Behavior**:
What you expected to happen

**Actual Behavior**:
What actually happened

**Error Messages**:
```
Any error messages or console output
```

**Additional Context**:
Any other relevant information
```

---

**Last Updated**: January 2025  
**Version**: 2.0  
**Next Review**: April 2025

For the most up-to-date troubleshooting information, visit our [Knowledge Base](https://docs.pavemaster-suite.com/troubleshooting).