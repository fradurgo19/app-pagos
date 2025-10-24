/*
  # Utility Bill Management System Schema

  ## Overview
  Creates the complete database schema for a utility bill management application with role-based access control, bill tracking, and document management.

  ## New Tables
  
  ### 1. `profiles`
  Extends auth.users with additional user information:
  - `id` (uuid, primary key, references auth.users)
  - `email` (text, unique)
  - `full_name` (text)
  - `role` (text) - 'basic_user' or 'area_coordinator'
  - `department` (text)
  - `location` (text)
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### 2. `utility_bills`
  Stores all utility bill information:
  - `id` (uuid, primary key)
  - `user_id` (uuid, references profiles)
  - `service_type` (text) - electricity, water, gas, internet, phone, etc.
  - `provider` (text)
  - `description` (text)
  - `value` (numeric) - bill amount
  - `period` (text) - YYYY-MM format
  - `invoice_number` (text)
  - `total_amount` (numeric)
  - `consumption` (numeric)
  - `unit_of_measure` (text) - kWh, m³, GB, etc.
  - `cost_center` (text)
  - `location` (text)
  - `due_date` (date)
  - `document_url` (text) - URL to uploaded document
  - `document_name` (text)
  - `status` (text) - draft, pending, approved, overdue, paid
  - `notes` (text)
  - `approved_by` (uuid, references profiles)
  - `approved_at` (timestamptz)
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### 3. `budget_thresholds`
  Stores budget limits for monitoring:
  - `id` (uuid, primary key)
  - `service_type` (text)
  - `location` (text)
  - `monthly_limit` (numeric)
  - `warning_threshold` (numeric) - percentage (e.g., 80 for 80%)
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### 4. `notifications`
  Tracks system notifications:
  - `id` (uuid, primary key)
  - `user_id` (uuid, references profiles)
  - `bill_id` (uuid, references utility_bills)
  - `type` (text) - due_reminder, budget_alert, approval_request
  - `message` (text)
  - `read` (boolean)
  - `created_at` (timestamptz)

  ## Security
  - Enable RLS on all tables
  - Users can view and edit their own bills
  - Area coordinators can view all bills in their location
  - Area coordinators can approve bills
  - Budget thresholds are read-only for basic users

  ## Indexes
  - Index on bills by user_id, period, service_type for fast filtering
  - Index on bills by status and due_date for overdue queries
  - Index on notifications by user_id and read status
*/

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  full_name text NOT NULL,
  role text NOT NULL DEFAULT 'basic_user' CHECK (role IN ('basic_user', 'area_coordinator')),
  department text,
  location text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Create utility_bills table
CREATE TABLE IF NOT EXISTS utility_bills (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles ON DELETE CASCADE,
  service_type text NOT NULL CHECK (service_type IN ('electricity', 'water', 'gas', 'internet', 'phone', 'waste', 'sewer', 'other')),
  provider text,
  description text,
  value numeric NOT NULL CHECK (value >= 0),
  period text NOT NULL,
  invoice_number text,
  contract_number text,
  total_amount numeric NOT NULL CHECK (total_amount >= 0),
  consumption numeric CHECK (consumption >= 0),
  unit_of_measure text,
  cost_center text,
  location text NOT NULL,
  due_date date NOT NULL,
  document_url text,
  document_name text,
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'pending', 'approved', 'overdue', 'paid')),
  notes text,
  approved_by uuid REFERENCES profiles,
  approved_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE utility_bills ENABLE ROW LEVEL SECURITY;

-- Create budget_thresholds table
CREATE TABLE IF NOT EXISTS budget_thresholds (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  service_type text NOT NULL,
  location text NOT NULL,
  monthly_limit numeric NOT NULL CHECK (monthly_limit >= 0),
  warning_threshold numeric NOT NULL DEFAULT 80 CHECK (warning_threshold > 0 AND warning_threshold <= 100),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(service_type, location)
);

ALTER TABLE budget_thresholds ENABLE ROW LEVEL SECURITY;

-- Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles ON DELETE CASCADE,
  bill_id uuid REFERENCES utility_bills ON DELETE CASCADE,
  type text NOT NULL CHECK (type IN ('due_reminder', 'budget_alert', 'approval_request', 'bill_approved')),
  message text NOT NULL,
  read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_bills_user_id ON utility_bills(user_id);
CREATE INDEX IF NOT EXISTS idx_bills_period ON utility_bills(period);
CREATE INDEX IF NOT EXISTS idx_bills_service_type ON utility_bills(service_type);
CREATE INDEX IF NOT EXISTS idx_bills_status ON utility_bills(status);
CREATE INDEX IF NOT EXISTS idx_bills_due_date ON utility_bills(due_date);
CREATE INDEX IF NOT EXISTS idx_bills_location ON utility_bills(location);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read);

-- RLS Policies for profiles
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- RLS Policies for utility_bills
CREATE POLICY "Users can view own bills"
  ON utility_bills FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Area coordinators can view location bills"
  ON utility_bills FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'area_coordinator'
      AND profiles.location = utility_bills.location
    )
  );

CREATE POLICY "Users can insert own bills"
  ON utility_bills FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own bills"
  ON utility_bills FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Area coordinators can update location bills"
  ON utility_bills FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'area_coordinator'
      AND profiles.location = utility_bills.location
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'area_coordinator'
      AND profiles.location = utility_bills.location
    )
  );

CREATE POLICY "Users can delete own draft bills"
  ON utility_bills FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id AND status = 'draft');

-- RLS Policies for budget_thresholds
CREATE POLICY "All users can view budget thresholds"
  ON budget_thresholds FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Area coordinators can manage budget thresholds"
  ON budget_thresholds FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'area_coordinator'
    )
  );

CREATE POLICY "Area coordinators can update budget thresholds"
  ON budget_thresholds FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'area_coordinator'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'area_coordinator'
    )
  );

-- RLS Policies for notifications
CREATE POLICY "Users can view own notifications"
  ON notifications FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications"
  ON notifications FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "System can insert notifications"
  ON notifications FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_utility_bills_updated_at
  BEFORE UPDATE ON utility_bills
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_budget_thresholds_updated_at
  BEFORE UPDATE ON budget_thresholds
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();