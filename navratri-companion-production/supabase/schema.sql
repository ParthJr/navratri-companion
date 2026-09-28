-- =========================================================================
-- NAVRATRI COMPANION - PRODUCTION SUPABASE / POSTGRESQL MASTER SCHEMA
-- =========================================================================
-- Execute this entire script in your Supabase Project -> SQL Editor
-- This establishes the complete central relational database schema,
-- foreign keys, indexes, RLS policies, and storage bucket definitions.
-- =========================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =========================================================================
-- 1. USERS TABLE (Central User Registry)
-- =========================================================================
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(50),
  password_hash TEXT,
  role VARCHAR(50) NOT NULL DEFAULT 'customer' CHECK (role IN ('customer', 'companion', 'user', 'admin', 'owner', 'CUSTOMER', 'COMPANION')),
  city VARCHAR(255) DEFAULT 'Ahmedabad, Gujarat',
  account_status VARCHAR(50) DEFAULT 'pending_payment' CHECK (account_status IN ('pending_payment', 'pending_approval', 'active', 'suspended', 'blocked', 'payment_rejected', 'inactive')),
  payment_status VARCHAR(50) DEFAULT 'pending' CHECK (payment_status IN ('pending', 'approved', 'rejected', 'pending_payment', 'PENDING', 'APPROVED', 'REJECTED')),
  fee_paid BOOLEAN DEFAULT FALSE,
  profile_status VARCHAR(50) DEFAULT 'created',
  verification_status VARCHAR(50) DEFAULT 'id_submitted',
  login_enabled BOOLEAN DEFAULT FALSE,
  profile_photo TEXT,
  date_of_birth TEXT,
  age INTEGER,
  bio TEXT,
  languages TEXT,
  garba_style TEXT,
  available_cities TEXT,
  hourly_rate NUMERIC(10, 2),
  id_document TEXT,
  face_match_score TEXT DEFAULT 'Not performed',
  phone_verified BOOLEAN DEFAULT FALSE,
  review_status TEXT DEFAULT 'Pending Review',
  aadhaar_image TEXT,
  selfie_image TEXT,
  policy_consent JSONB,
  payment_reference VARCHAR(255),
  payment_submitted_at TIMESTAMPTZ,
  approved_at TIMESTAMPTZ,
  approved_by VARCHAR(255),
  rejected_at TIMESTAMPTZ,
  rejection_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_user_id ON public.users(user_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON public.users(role);
CREATE INDEX IF NOT EXISTS idx_users_account_status ON public.users(account_status);
CREATE INDEX IF NOT EXISTS idx_users_payment_status ON public.users(payment_status);

-- =========================================================================
-- 2. REGISTRATION PAYMENTS TABLE (₹499 Fee Verification)
-- =========================================================================
CREATE TABLE IF NOT EXISTS public.registration_payments (
  id VARCHAR(255) PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL REFERENCES public.users(user_id) ON DELETE CASCADE,
  amount NUMERIC(10, 2) DEFAULT 499.00,
  payment_method VARCHAR(50) DEFAULT 'UPI',
  payment_reference VARCHAR(255) NOT NULL,
  payment_status VARCHAR(50) DEFAULT 'PENDING' CHECK (payment_status IN ('PENDING', 'APPROVED', 'REJECTED', 'pending', 'approved', 'rejected')),
  submitted_at TIMESTAMPTZ DEFAULT NOW(),
  approved_at TIMESTAMPTZ,
  approved_by VARCHAR(255),
  rejected_at TIMESTAMPTZ,
  rejection_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_reg_payments_user_id ON public.registration_payments(user_id);
CREATE INDEX IF NOT EXISTS idx_reg_payments_status ON public.registration_payments(payment_status);
CREATE INDEX IF NOT EXISTS idx_reg_payments_ref ON public.registration_payments(payment_reference);

-- =========================================================================
-- 3. USER PROFILES TABLE
-- =========================================================================
CREATE TABLE IF NOT EXISTS public.user_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id VARCHAR(255) UNIQUE NOT NULL REFERENCES public.users(user_id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(50),
  city VARCHAR(255) DEFAULT 'Ahmedabad, Gujarat',
  age INTEGER,
  gender VARCHAR(50),
  bio TEXT,
  emergency_contact_name VARCHAR(255),
  emergency_contact_phone VARCHAR(50),
  emergency_contact_relation VARCHAR(100),
  preferred_locations TEXT[],
  preferred_garba_style VARCHAR(100),
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON public.user_profiles(user_id);
CREATE OR REPLACE VIEW public.profiles AS SELECT * FROM public.user_profiles;

-- =========================================================================
-- 4. HOST / COMPANION APPLICATIONS TABLE
-- =========================================================================
CREATE TABLE IF NOT EXISTS public.host_applications (
  id VARCHAR(255) PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL REFERENCES public.users(user_id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  age INTEGER NOT NULL,
  date_of_birth TEXT,
  city VARCHAR(255) DEFAULT 'Ahmedabad, Gujarat',
  area VARCHAR(255),
  locality_area VARCHAR(255),
  garba_style VARCHAR(255),
  applied_at TIMESTAMPTZ DEFAULT NOW(),
  id_document VARCHAR(255),
  aadhaar_image TEXT,
  selfie_image TEXT,
  profile_photo TEXT,
  avatar TEXT,
  registration_fee_paid BOOLEAN DEFAULT FALSE,
  face_match_score TEXT DEFAULT 'Not performed',
  status VARCHAR(50) DEFAULT 'pending_review' CHECK (status IN ('pending', 'pending_review', 'under_review', 'action_required', 'approved', 'rejected', 'PENDING', 'UNDER_REVIEW', 'ACTION_REQUIRED', 'APPROVED', 'REJECTED')),
  phone VARCHAR(50),
  email VARCHAR(255),
  experience_years VARCHAR(50),
  bio TEXT,
  languages TEXT,
  hourly_rate NUMERIC(10, 2),
  phone_verified BOOLEAN DEFAULT FALSE,
  review_status VARCHAR(255) DEFAULT 'Pending Review',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_host_apps_user_id ON public.host_applications(user_id);
CREATE INDEX IF NOT EXISTS idx_host_apps_status ON public.host_applications(status);

-- Backward compatibility alias for companion_applications
CREATE OR REPLACE VIEW public.companion_applications AS SELECT * FROM public.host_applications;

-- =========================================================================
-- 5. KYC VERIFICATIONS TABLE
-- =========================================================================
CREATE TABLE IF NOT EXISTS public.kyc_verifications (
  id VARCHAR(255) PRIMARY KEY,
  user_id VARCHAR(255) UNIQUE NOT NULL REFERENCES public.users(user_id) ON DELETE CASCADE,
  document_type VARCHAR(100) DEFAULT 'Aadhaar / Govt ID',
  document_url TEXT,
  selfie_url TEXT,
  verification_status VARCHAR(50) DEFAULT 'PENDING_REVIEW' CHECK (verification_status IN ('NOT_SUBMITTED', 'PENDING_REVIEW', 'VERIFIED', 'REJECTED', 'ACTION_REQUIRED')),
  phone_verified BOOLEAN DEFAULT FALSE,
  face_match_score TEXT DEFAULT 'Not performed',
  reviewed_by VARCHAR(255),
  reviewed_at TIMESTAMPTZ,
  rejection_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_kyc_user_id ON public.kyc_verifications(user_id);

-- =========================================================================
-- 6. BOOKINGS TABLE
-- =========================================================================
CREATE TABLE IF NOT EXISTS public.bookings (
  id VARCHAR(255) PRIMARY KEY,
  booking_reference VARCHAR(255) UNIQUE NOT NULL,
  customer_id VARCHAR(255) NOT NULL,
  customer_name VARCHAR(255) NOT NULL,
  customer_phone VARCHAR(50),
  companion_id VARCHAR(255) NOT NULL,
  companion_name VARCHAR(255) NOT NULL,
  companion_phone VARCHAR(50),
  companion_upi VARCHAR(255),
  companion_age INTEGER,
  companion_city VARCHAR(255),
  companion_avatar TEXT,
  date TEXT NOT NULL,
  raw_date TEXT,
  time_slot TEXT NOT NULL,
  duration_package VARCHAR(50) NOT NULL,
  venue TEXT NOT NULL,
  city VARCHAR(255) DEFAULT 'Ahmedabad',
  base_price NUMERIC(10, 2) NOT NULL,
  platform_fee NUMERIC(10, 2) NOT NULL DEFAULT 50.00,
  total_price NUMERIC(10, 2) NOT NULL,
  companion_earnings NUMERIC(10, 2) NOT NULL,
  status VARCHAR(50) DEFAULT 'PENDING_PAYMENT_VERIFICATION' CHECK (status IN ('PENDING_PAYMENT_VERIFICATION', 'confirmed', 'checked_in', 'session_active', 'completed', 'cancelled')),
  payment_status VARCHAR(50) DEFAULT 'PENDING' CHECK (payment_status IN ('PENDING', 'PAID', 'REFUNDED', 'DISPUTED')),
  payment_reference VARCHAR(255),
  escrow_status VARCHAR(50) DEFAULT 'Held in Escrow',
  completion_otp VARCHAR(10),
  otp_verified BOOLEAN DEFAULT FALSE,
  check_in_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  payout_status VARCHAR(50) DEFAULT 'escrow_held' CHECK (payout_status IN ('escrow_held', 'ready_to_pay', 'PENDING_ADMIN_APPROVAL', 'approved', 'paid', 'rejected')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_bookings_customer_id ON public.bookings(customer_id);
CREATE INDEX IF NOT EXISTS idx_bookings_companion_id ON public.bookings(companion_id);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON public.bookings(status);
CREATE INDEX IF NOT EXISTS idx_bookings_payout_status ON public.bookings(payout_status);

-- =========================================================================
-- 7. BOOKING PAYMENTS TABLE
-- =========================================================================
CREATE TABLE IF NOT EXISTS public.booking_payments (
  id VARCHAR(255) PRIMARY KEY,
  booking_id VARCHAR(255) NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
  customer_id VARCHAR(255) NOT NULL,
  amount NUMERIC(10, 2) NOT NULL,
  payment_method VARCHAR(50) DEFAULT 'UPI',
  payment_reference VARCHAR(255) NOT NULL,
  status VARCHAR(50) DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'VERIFIED', 'REJECTED')),
  submitted_at TIMESTAMPTZ DEFAULT NOW(),
  verified_at TIMESTAMPTZ,
  verified_by VARCHAR(255),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_booking_payments_booking_id ON public.booking_payments(booking_id);

-- =========================================================================
-- 8. COMPLETION OTPS TABLE
-- =========================================================================
CREATE TABLE IF NOT EXISTS public.completion_otps (
  id VARCHAR(255) PRIMARY KEY,
  booking_id VARCHAR(255) UNIQUE NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
  otp VARCHAR(10) NOT NULL,
  status VARCHAR(50) DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'VERIFIED', 'EXPIRED')),
  generated_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ DEFAULT NOW() + INTERVAL '30 minutes',
  verified_at TIMESTAMPTZ
);

-- =========================================================================
-- 9. PAYOUTS TABLE
-- =========================================================================
CREATE TABLE IF NOT EXISTS public.payouts (
  id VARCHAR(255) PRIMARY KEY,
  booking_id VARCHAR(255) NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
  companion_id VARCHAR(255) NOT NULL,
  companion_name VARCHAR(255) NOT NULL,
  companion_upi VARCHAR(255) NOT NULL,
  amount NUMERIC(10, 2) NOT NULL,
  platform_fee NUMERIC(10, 2) DEFAULT 0,
  gross_amount NUMERIC(10, 2) NOT NULL,
  status VARCHAR(50) DEFAULT 'PENDING_ADMIN_APPROVAL' CHECK (status IN ('PENDING_ADMIN_APPROVAL', 'APPROVED', 'PAID', 'REJECTED', 'pending', 'approved', 'paid', 'rejected')),
  transaction_reference VARCHAR(255),
  approved_at TIMESTAMPTZ,
  approved_by VARCHAR(255),
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_payouts_booking_id ON public.payouts(booking_id);
CREATE INDEX IF NOT EXISTS idx_payouts_companion_id ON public.payouts(companion_id);
CREATE INDEX IF NOT EXISTS idx_payouts_status ON public.payouts(status);

-- =========================================================================
-- 10. COMPLAINTS & GRIEVANCES TABLE
-- =========================================================================
CREATE TABLE IF NOT EXISTS public.complaints (
  id VARCHAR(255) PRIMARY KEY,
  booking_id VARCHAR(255),
  reporter_type VARCHAR(50) NOT NULL CHECK (reporter_type IN ('guest', 'companion', 'customer')),
  reporter_name VARCHAR(255) NOT NULL,
  reporter_phone VARCHAR(50),
  target_name VARCHAR(255) NOT NULL,
  category VARCHAR(100) NOT NULL,
  severity VARCHAR(50) DEFAULT 'medium' CHECK (severity IN ('low', 'medium', 'high', 'urgent')),
  status VARCHAR(50) DEFAULT 'open' CHECK (status IN ('open', 'investigating', 'resolved', 'dismissed')),
  subject TEXT NOT NULL,
  description TEXT NOT NULL,
  assigned_admin VARCHAR(255),
  resolution_notes TEXT,
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_complaints_status ON public.complaints(status);

-- =========================================================================
-- 11. NOTIFICATIONS TABLE
-- =========================================================================
CREATE TABLE IF NOT EXISTS public.notifications (
  id VARCHAR(255) PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  type VARCHAR(50) DEFAULT 'system',
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);

-- =========================================================================
-- 12. AUDIT LOGS TABLE
-- =========================================================================
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  action VARCHAR(255) NOT NULL,
  category VARCHAR(100) NOT NULL,
  details TEXT NOT NULL,
  actor_id VARCHAR(255) DEFAULT 'system',
  ip_address VARCHAR(100),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_category ON public.audit_logs(category);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created ON public.audit_logs(created_at);

-- =========================================================================
-- 13. PLATFORM SETTINGS TABLE
-- =========================================================================
CREATE TABLE IF NOT EXISTS public.platform_settings (
  key VARCHAR(255) PRIMARY KEY,
  value JSONB NOT NULL,
  description TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seed default platform settings
INSERT INTO public.platform_settings (key, value, description)
VALUES 
  ('registration_fee', '{"amount": 499, "currency": "INR", "upi_id": "9974203300@okbizaxis"}', 'Platform registration fee and UPI receiver'),
  ('system_status', '{"maintenance": false, "notice": "System operating normally"}', 'Global maintenance mode toggle')
ON CONFLICT (key) DO NOTHING;

-- =========================================================================
-- SUPABASE STORAGE BUCKETS
-- =========================================================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('profile-photos', 'profile-photos', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public)
VALUES ('kyc-documents', 'kyc-documents', false)
ON CONFLICT (id) DO NOTHING;

-- =========================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =========================================================================
-- Enable RLS across all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.registration_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.host_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kyc_verifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.booking_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.completion_otps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.complaints ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.platform_settings ENABLE ROW LEVEL SECURITY;

-- 1. Service Role Bypass: The server-side backend with SUPABASE_SERVICE_ROLE_KEY
-- has full access to all operations.
DO $$ 
DECLARE
  tbl text;
BEGIN
  FOR tbl IN 
    SELECT tablename FROM pg_tables WHERE schemaname = 'public'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS "service_role_all_%s" ON public.%I', tbl, tbl);
    EXECUTE format('CREATE POLICY "service_role_all_%s" ON public.%I FOR ALL TO service_role USING (true) WITH CHECK (true)', tbl, tbl);
  END LOOP;
END $$;

-- 2. Public Read Policies
DROP POLICY IF EXISTS "anon_read_active_companions" ON public.users;
CREATE POLICY "anon_read_active_companions" ON public.users
  FOR SELECT TO anon, authenticated
  USING (role = 'companion' AND account_status = 'active');

DROP POLICY IF EXISTS "anon_read_profiles" ON public.user_profiles;
CREATE POLICY "anon_read_profiles" ON public.user_profiles
  FOR SELECT TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS "anon_read_settings" ON public.platform_settings;
CREATE POLICY "anon_read_settings" ON public.platform_settings
  FOR SELECT TO anon, authenticated
  USING (true);

-- 3. Public Insert Policies (for self-service signup & booking workflows)
DROP POLICY IF EXISTS "anon_insert_users" ON public.users;
CREATE POLICY "anon_insert_users" ON public.users
  FOR INSERT TO anon, authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "anon_insert_payments" ON public.registration_payments;
CREATE POLICY "anon_insert_payments" ON public.registration_payments
  FOR INSERT TO anon, authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "anon_insert_applications" ON public.host_applications;
CREATE POLICY "anon_insert_applications" ON public.host_applications
  FOR INSERT TO anon, authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "anon_insert_bookings" ON public.bookings;
CREATE POLICY "anon_insert_bookings" ON public.bookings
  FOR INSERT TO anon, authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "anon_insert_complaints" ON public.complaints;
CREATE POLICY "anon_insert_complaints" ON public.complaints
  FOR INSERT TO anon, authenticated
  WITH CHECK (true);

-- =========================================================================
-- REALTIME SUBSCRIPTIONS
-- =========================================================================
-- Enable Supabase Realtime publication on crucial tables for instant cross-device updates
ALTER PUBLICATION supabase_realtime ADD TABLE public.users;
ALTER PUBLICATION supabase_realtime ADD TABLE public.registration_payments;
ALTER PUBLICATION supabase_realtime ADD TABLE public.host_applications;
ALTER PUBLICATION supabase_realtime ADD TABLE public.bookings;
ALTER PUBLICATION supabase_realtime ADD TABLE public.payouts;
ALTER PUBLICATION supabase_realtime ADD TABLE public.complaints;
