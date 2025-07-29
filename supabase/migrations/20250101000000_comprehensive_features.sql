-- Enhanced Receipts Table with OCR support
CREATE TABLE IF NOT EXISTS receipts_enhanced (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  original_file_url TEXT,
  processed_file_url TEXT,
  total_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
  tax_amount DECIMAL(10,2) DEFAULT 0,
  vendor_name TEXT,
  vendor_address TEXT,
  receipt_date DATE,
  line_items JSONB DEFAULT '[]'::jsonb,
  project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
  uploaded_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  processed_by_ocr BOOLEAN DEFAULT FALSE,
  ocr_confidence DECIMAL(3,2) DEFAULT 0,
  ocr_raw_data JSONB,
  category TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'processing')),
  approval_required BOOLEAN DEFAULT TRUE,
  approved_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  approved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enhanced Employee Locations with Activity Detection
CREATE TABLE IF NOT EXISTS employee_locations_enhanced (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  device_id UUID REFERENCES devices(id) ON DELETE SET NULL,
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  altitude DECIMAL(8, 2),
  accuracy DECIMAL(6, 2) NOT NULL,
  speed DECIMAL(6, 2) DEFAULT 0,
  heading DECIMAL(5, 2),
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
  activity_type TEXT DEFAULT 'unknown' CHECK (activity_type IN 
    ('standing', 'walking', 'riding', 'driving', 'phone', 'out_of_bounds', 'unknown')),
  is_driver BOOLEAN DEFAULT FALSE,
  battery_level INTEGER CHECK (battery_level >= 0 AND battery_level <= 100),
  signal_strength INTEGER,
  geofence_zones UUID[] DEFAULT '{}',
  travel_distance_daily DECIMAL(8, 2) DEFAULT 0,
  work_hours_today DECIMAL(4, 2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enhanced Geofences with Advanced Features
CREATE TABLE IF NOT EXISTS geofences_enhanced (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  center_latitude DECIMAL(10, 8) NOT NULL,
  center_longitude DECIMAL(11, 8) NOT NULL,
  radius DECIMAL(8, 2) NOT NULL CHECK (radius > 0),
  shape_type TEXT DEFAULT 'circle' CHECK (shape_type IN ('circle', 'polygon')),
  shape_coordinates JSONB, -- For polygon shapes
  color TEXT DEFAULT '#3B82F6',
  type TEXT DEFAULT 'work_site' CHECK (type IN 
    ('work_site', 'office', 'restricted', 'break_area', 'client_site', 'equipment_yard')),
  is_active BOOLEAN DEFAULT TRUE,
  auto_clock_in BOOLEAN DEFAULT FALSE,
  auto_clock_out BOOLEAN DEFAULT FALSE,
  enable_notifications BOOLEAN DEFAULT TRUE,
  notification_delay INTEGER DEFAULT 0, -- Minutes before sending notification
  allowed_roles TEXT[] DEFAULT '{}',
  restricted_hours JSONB, -- Time restrictions
  priority_level INTEGER DEFAULT 1 CHECK (priority_level >= 1 AND priority_level <= 5),
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Task Priorities Table
CREATE TABLE IF NOT EXISTS task_priorities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('critical', 'high', 'medium', 'low')),
  type TEXT DEFAULT 'weekly' CHECK (type IN ('daily', 'weekly')),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'blocked')),
  assigned_to UUID[] DEFAULT '{}',
  project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
  due_date TIMESTAMP WITH TIME ZONE,
  estimated_hours DECIMAL(5, 2),
  actual_hours DECIMAL(5, 2),
  dependencies UUID[] DEFAULT '{}',
  order_index INTEGER DEFAULT 0,
  tags TEXT[] DEFAULT '{}',
  urgency_score INTEGER DEFAULT 0,
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Cost Tracking Enhanced
CREATE TABLE IF NOT EXISTS cost_tracking_enhanced (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  employee_id UUID REFERENCES employees(id) ON DELETE SET NULL,
  cost_type TEXT NOT NULL CHECK (cost_type IN 
    ('labor', 'materials', 'equipment', 'travel', 'overhead', 'miscellaneous')),
  amount DECIMAL(12, 2) NOT NULL,
  currency TEXT DEFAULT 'USD',
  description TEXT,
  receipt_id UUID REFERENCES receipts_enhanced(id) ON DELETE SET NULL,
  time_record_id UUID REFERENCES time_records(id) ON DELETE SET NULL,
  date DATE NOT NULL,
  hour_of_day INTEGER CHECK (hour_of_day >= 0 AND hour_of_day <= 23),
  is_billable BOOLEAN DEFAULT TRUE,
  is_approved BOOLEAN DEFAULT FALSE,
  approved_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  approved_at TIMESTAMP WITH TIME ZONE,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Employee Tracking Events
CREATE TABLE IF NOT EXISTS employee_tracking_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL CHECK (event_type IN 
    ('clock_in', 'clock_out', 'break_start', 'break_end', 'geofence_enter', 'geofence_exit', 
     'activity_change', 'device_low_battery', 'unauthorized_area', 'panic_button')),
  location_id UUID REFERENCES employee_locations_enhanced(id) ON DELETE SET NULL,
  geofence_id UUID REFERENCES geofences_enhanced(id) ON DELETE SET NULL,
  description TEXT,
  severity TEXT DEFAULT 'info' CHECK (severity IN ('info', 'warning', 'critical')),
  auto_generated BOOLEAN DEFAULT TRUE,
  requires_action BOOLEAN DEFAULT FALSE,
  resolved BOOLEAN DEFAULT FALSE,
  resolved_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  resolved_at TIMESTAMP WITH TIME ZONE,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Dashboard Layouts for OverWatch TOSS
CREATE TABLE IF NOT EXISTS dashboard_layouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  layout_data JSONB NOT NULL,
  theme TEXT DEFAULT 'tactical' CHECK (theme IN ('light', 'dark', 'tactical')),
  is_public BOOLEAN DEFAULT FALSE,
  is_default BOOLEAN DEFAULT FALSE,
  grid_size JSONB DEFAULT '{"cols": 12, "rows": 8}'::jsonb,
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(name, created_by)
);

-- Real-time Metrics Cache
CREATE TABLE IF NOT EXISTS metrics_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  metric_type TEXT NOT NULL,
  metric_key TEXT NOT NULL,
  value JSONB NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(metric_type, metric_key, project_id)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_receipts_enhanced_project_date ON receipts_enhanced(project_id, receipt_date);
CREATE INDEX IF NOT EXISTS idx_receipts_enhanced_status ON receipts_enhanced(status);
CREATE INDEX IF NOT EXISTS idx_employee_locations_employee_time ON employee_locations_enhanced(employee_id, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_employee_locations_geofences ON employee_locations_enhanced USING GIN(geofence_zones);
CREATE INDEX IF NOT EXISTS idx_geofences_enhanced_active ON geofences_enhanced(is_active);
CREATE INDEX IF NOT EXISTS idx_geofences_enhanced_type ON geofences_enhanced(type);
CREATE INDEX IF NOT EXISTS idx_task_priorities_project_type ON task_priorities(project_id, type);
CREATE INDEX IF NOT EXISTS idx_task_priorities_status_priority ON task_priorities(status, priority);
CREATE INDEX IF NOT EXISTS idx_cost_tracking_project_date ON cost_tracking_enhanced(project_id, date);
CREATE INDEX IF NOT EXISTS idx_cost_tracking_type ON cost_tracking_enhanced(cost_type);
CREATE INDEX IF NOT EXISTS idx_employee_tracking_events_employee_time ON employee_tracking_events(employee_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_metrics_cache_expires ON metrics_cache(expires_at);

-- Enable RLS on all tables
ALTER TABLE receipts_enhanced ENABLE ROW LEVEL SECURITY;
ALTER TABLE employee_locations_enhanced ENABLE ROW LEVEL SECURITY;
ALTER TABLE geofences_enhanced ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_priorities ENABLE ROW LEVEL SECURITY;
ALTER TABLE cost_tracking_enhanced ENABLE ROW LEVEL SECURITY;
ALTER TABLE employee_tracking_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE dashboard_layouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE metrics_cache ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Receipts Enhanced - Admin/Manager access
CREATE POLICY "Admin can manage all receipts" ON receipts_enhanced
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND role IN ('super_admin', 'admin', 'manager')
    )
  );

CREATE POLICY "Users can view their own receipts" ON receipts_enhanced
  FOR SELECT USING (uploaded_by = auth.uid());

-- Employee Locations Enhanced - Admin only for tracking
CREATE POLICY "Admin can access all employee locations" ON employee_locations_enhanced
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND role IN ('super_admin', 'admin')
    )
  );

CREATE POLICY "Employees can insert their own locations" ON employee_locations_enhanced
  FOR INSERT WITH CHECK (
    employee_id IN (
      SELECT id FROM employees WHERE user_id = auth.uid()
    )
  );

-- Geofences Enhanced - Admin access
CREATE POLICY "Admin can manage geofences" ON geofences_enhanced
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND role IN ('super_admin', 'admin', 'manager')
    )
  );

CREATE POLICY "Users can view active geofences" ON geofences_enhanced
  FOR SELECT USING (is_active = true);

-- Task Priorities - Admin/Manager access
CREATE POLICY "Admin can manage all task priorities" ON task_priorities
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND role IN ('super_admin', 'admin', 'manager')
    )
  );

CREATE POLICY "Users can view tasks assigned to them" ON task_priorities
  FOR SELECT USING (
    auth.uid() = ANY(assigned_to) OR 
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND role IN ('super_admin', 'admin', 'manager')
    )
  );

-- Cost Tracking Enhanced - Admin access
CREATE POLICY "Admin can manage all cost tracking" ON cost_tracking_enhanced
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND role IN ('super_admin', 'admin', 'manager')
    )
  );

-- Employee Tracking Events - Admin only
CREATE POLICY "Admin can access tracking events" ON employee_tracking_events
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND role IN ('super_admin', 'admin')
    )
  );

-- Dashboard Layouts - User access to own layouts
CREATE POLICY "Users can manage their own layouts" ON dashboard_layouts
  FOR ALL USING (created_by = auth.uid());

CREATE POLICY "Users can view public layouts" ON dashboard_layouts
  FOR SELECT USING (is_public = true);

-- Metrics Cache - Admin access
CREATE POLICY "Admin can manage metrics cache" ON metrics_cache
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND role IN ('super_admin', 'admin', 'manager')
    )
  );

-- Functions for automatic calculations

-- Function to calculate urgency score for tasks
CREATE OR REPLACE FUNCTION calculate_task_urgency_score(task_priority TEXT, due_date TIMESTAMP WITH TIME ZONE, task_status TEXT)
RETURNS INTEGER AS $$
DECLARE
  score INTEGER := 0;
  days_until_due INTEGER;
BEGIN
  -- Priority weight
  CASE LOWER(task_priority)
    WHEN 'critical' THEN score := score + 100;
    WHEN 'high' THEN score := score + 75;
    WHEN 'medium' THEN score := score + 50;
    WHEN 'low' THEN score := score + 25;
  END CASE;
  
  -- Due date urgency
  IF due_date IS NOT NULL THEN
    days_until_due := EXTRACT(EPOCH FROM (due_date - NOW())) / 86400;
    IF days_until_due <= 0 THEN score := score + 50; -- Overdue
    ELSIF days_until_due <= 1 THEN score := score + 40; -- Due today/tomorrow
    ELSIF days_until_due <= 3 THEN score := score + 30; -- Due soon
    END IF;
  END IF;
  
  -- Status modifier
  CASE LOWER(task_status)
    WHEN 'blocked' THEN score := score + 20;
    WHEN 'in_progress' THEN score := score + 10;
  END CASE;
  
  RETURN score;
END;
$$ LANGUAGE plpgsql;

-- Function to update task urgency scores
CREATE OR REPLACE FUNCTION update_task_urgency_scores()
RETURNS VOID AS $$
BEGIN
  UPDATE task_priorities 
  SET urgency_score = calculate_task_urgency_score(priority, due_date, status),
      updated_at = NOW()
  WHERE urgency_score != calculate_task_urgency_score(priority, due_date, status);
END;
$$ LANGUAGE plpgsql;

-- Function to check geofence boundaries
CREATE OR REPLACE FUNCTION point_in_geofence(lat DECIMAL, lng DECIMAL, geofence_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  fence_record RECORD;
  distance DECIMAL;
BEGIN
  SELECT * INTO fence_record FROM geofences_enhanced WHERE id = geofence_id AND is_active = true;
  
  IF NOT FOUND THEN
    RETURN FALSE;
  END IF;
  
  -- Calculate distance using Haversine formula (simplified)
  distance := 6371000 * acos(
    cos(radians(lat)) * cos(radians(fence_record.center_latitude)) * 
    cos(radians(fence_record.center_longitude) - radians(lng)) + 
    sin(radians(lat)) * sin(radians(fence_record.center_latitude))
  );
  
  RETURN distance <= fence_record.radius;
END;
$$ LANGUAGE plpgsql;

-- Function to auto-clock employees based on geofencing
CREATE OR REPLACE FUNCTION auto_clock_employee(emp_id UUID, location_lat DECIMAL, location_lng DECIMAL)
RETURNS VOID AS $$
DECLARE
  work_fence RECORD;
  is_in_work_area BOOLEAN := FALSE;
  current_clock_record RECORD;
BEGIN
  -- Check if employee is in any work geofence
  FOR work_fence IN 
    SELECT * FROM geofences_enhanced 
    WHERE type IN ('work_site', 'office') 
    AND is_active = true 
    AND auto_clock_in = true
  LOOP
    IF point_in_geofence(location_lat, location_lng, work_fence.id) THEN
      is_in_work_area := TRUE;
      EXIT;
    END IF;
  END LOOP;
  
  -- Get current clock status
  SELECT * INTO current_clock_record 
  FROM time_records 
  WHERE employee_id = emp_id 
  AND clock_out IS NULL 
  ORDER BY clock_in DESC 
  LIMIT 1;
  
  -- Auto clock in if in work area and not already clocked in
  IF is_in_work_area AND current_clock_record IS NULL THEN
    INSERT INTO time_records (employee_id, clock_in, status, notes)
    VALUES (emp_id, NOW(), 'active', 'Auto-clocked in via geofencing');
    
    -- Log the event
    INSERT INTO employee_tracking_events (employee_id, event_type, description)
    VALUES (emp_id, 'clock_in', 'Automatically clocked in via geofencing');
  END IF;
  
  -- Auto clock out if not in work area and currently clocked in
  IF NOT is_in_work_area AND current_clock_record IS NOT NULL THEN
    UPDATE time_records 
    SET clock_out = NOW(), status = 'completed'
    WHERE id = current_clock_record.id;
    
    -- Log the event
    INSERT INTO employee_tracking_events (employee_id, event_type, description)
    VALUES (emp_id, 'clock_out', 'Automatically clocked out via geofencing');
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update task urgency scores
CREATE OR REPLACE FUNCTION trigger_update_task_urgency()
RETURNS TRIGGER AS $$
BEGIN
  NEW.urgency_score := calculate_task_urgency_score(NEW.priority, NEW.due_date, NEW.status);
  NEW.updated_at := NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_task_urgency_trigger
  BEFORE INSERT OR UPDATE ON task_priorities
  FOR EACH ROW
  EXECUTE FUNCTION trigger_update_task_urgency();

-- Trigger to auto-update timestamps
CREATE OR REPLACE FUNCTION trigger_update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at := NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_receipts_timestamp
  BEFORE UPDATE ON receipts_enhanced
  FOR EACH ROW
  EXECUTE FUNCTION trigger_update_timestamp();

CREATE TRIGGER update_geofences_timestamp
  BEFORE UPDATE ON geofences_enhanced
  FOR EACH ROW
  EXECUTE FUNCTION trigger_update_timestamp();

CREATE TRIGGER update_cost_tracking_timestamp
  BEFORE UPDATE ON cost_tracking_enhanced
  FOR EACH ROW
  EXECUTE FUNCTION trigger_update_timestamp();

CREATE TRIGGER update_dashboard_layouts_timestamp
  BEFORE UPDATE ON dashboard_layouts
  FOR EACH ROW
  EXECUTE FUNCTION trigger_update_timestamp();

-- Enable real-time subscriptions
ALTER PUBLICATION supabase_realtime ADD TABLE receipts_enhanced;
ALTER PUBLICATION supabase_realtime ADD TABLE employee_locations_enhanced;
ALTER PUBLICATION supabase_realtime ADD TABLE geofences_enhanced;
ALTER PUBLICATION supabase_realtime ADD TABLE task_priorities;
ALTER PUBLICATION supabase_realtime ADD TABLE cost_tracking_enhanced;
ALTER PUBLICATION supabase_realtime ADD TABLE employee_tracking_events;
ALTER PUBLICATION supabase_realtime ADD TABLE dashboard_layouts;
ALTER PUBLICATION supabase_realtime ADD TABLE metrics_cache;