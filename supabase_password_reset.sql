-- ==============================================================================
-- Super Admin Password Reset & Temporary Password Expiration Schema Migration
-- ==============================================================================

-- 1. Add password reset & temporary flag columns to users table
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS must_change_password BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS temporary_password BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS password_expires_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS password_reset_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS password_reset_by TEXT;

-- 2. Indexes for efficient lookup of expiring passwords
CREATE INDEX IF NOT EXISTS idx_users_password_expires_at ON users (password_expires_at) 
WHERE temporary_password = TRUE;

-- 3. Audit log table check (if not already present)
CREATE TABLE IF NOT EXISTS admin_audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    admin_id TEXT NOT NULL,
    admin_name TEXT,
    admin_role TEXT,
    action TEXT NOT NULL,
    category TEXT NOT NULL,
    details TEXT,
    target_user_id TEXT,
    target_user_role TEXT,
    ip_address TEXT,
    user_agent TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON admin_audit_logs (action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_target_user_id ON admin_audit_logs (target_user_id);
