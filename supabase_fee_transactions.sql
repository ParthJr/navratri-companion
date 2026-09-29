-- ============================================================================
-- NAVRATRI COMPANION: FEE STRUCTURE & PAYMENT TRANSACTIONS MIGRATION
-- ============================================================================

-- 1. Create fee_configurations table
CREATE TABLE IF NOT EXISTS public.fee_configurations (
    id TEXT PRIMARY KEY,
    fee_code TEXT UNIQUE NOT NULL,
    fee_name TEXT NOT NULL,
    applicable_role TEXT NOT NULL CHECK (applicable_role IN ('CUSTOMER', 'COMPANION')),
    amount NUMERIC(10,2) NOT NULL DEFAULT 0,
    currency TEXT NOT NULL DEFAULT 'INR',
    gst_enabled BOOLEAN NOT NULL DEFAULT true,
    gst_percentage NUMERIC(5,2) NOT NULL DEFAULT 18.0,
    status TEXT NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'INACTIVE')),
    effective_from TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seed initial default fee configurations (Non-destructive)
INSERT INTO public.fee_configurations (id, fee_code, fee_name, applicable_role, amount, currency, gst_enabled, gst_percentage, status)
VALUES
    ('fee_comp_reg', 'COMPANION_REGISTRATION', 'Companion Registration Fee', 'COMPANION', 499.00, 'INR', true, 18.0, 'ACTIVE'),
    ('fee_cust_reg', 'CUSTOMER_REGISTRATION', 'Customer Registration Fee', 'CUSTOMER', 0.00, 'INR', false, 0.0, 'ACTIVE'),
    ('fee_cust_plat', 'CUSTOMER_PLATFORM_FEE', 'Customer Booking Platform Fee', 'CUSTOMER', 50.00, 'INR', true, 18.0, 'ACTIVE'),
    ('fee_comp_plat', 'COMPANION_PLATFORM_FEE', 'Companion Platform Fee', 'COMPANION', 0.00, 'INR', false, 0.0, 'ACTIVE')
ON CONFLICT (fee_code) DO NOTHING;

-- 2. Create payment_transactions table
CREATE TABLE IF NOT EXISTS public.payment_transactions (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    user_name TEXT,
    user_email TEXT,
    user_phone TEXT,
    user_role TEXT NOT NULL CHECK (user_role IN ('CUSTOMER', 'COMPANION')),
    fee_configuration_id TEXT,
    fee_code TEXT NOT NULL,
    fee_name TEXT NOT NULL,
    base_amount NUMERIC(10,2) NOT NULL,
    gst_amount NUMERIC(10,2) NOT NULL DEFAULT 0,
    total_amount NUMERIC(10,2) NOT NULL,
    currency TEXT NOT NULL DEFAULT 'INR',
    status TEXT NOT NULL CHECK (status IN ('INITIATED', 'PENDING', 'PAID', 'FAILED', 'REFUNDED', 'WAIVED')),
    gateway TEXT NOT NULL DEFAULT 'RAZORPAY',
    order_id TEXT UNIQUE NOT NULL,
    payment_id TEXT,
    transaction_id TEXT,
    gateway_reference_id TEXT,
    payment_method TEXT DEFAULT 'UPI',
    paid_at TIMESTAMPTZ,
    waived_by TEXT,
    waive_reason TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    notes TEXT
);

-- Create index on order_id and user_id for fast lookup
CREATE INDEX IF NOT EXISTS idx_payment_transactions_order_id ON public.payment_transactions (order_id);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_user_id ON public.payment_transactions (user_id);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_status ON public.payment_transactions (status);

-- 3. Enable Row Level Security (RLS) on new tables
ALTER TABLE public.fee_configurations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_transactions ENABLE ROW LEVEL SECURITY;

-- Allow public read of active fee configurations
CREATE POLICY "Public Read Active Fees" ON public.fee_configurations
    FOR SELECT USING (status = 'ACTIVE');

-- Service role full access
CREATE POLICY "Service Role Full Fees" ON public.fee_configurations
    FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Service Role Full Payment Transactions" ON public.payment_transactions
    FOR ALL USING (true) WITH CHECK (true);
