-- ===========================================================================
-- Supabase PostgreSQL Database Schema for Shoppers Stop Retail System
-- Run this script in your Supabase Dashboard SQL Editor (https://supabase.com)
-- ===========================================================================

-- 1. Customers Table
CREATE TABLE IF NOT EXISTS customers (
    id TEXT PRIMARY KEY,
    user_id TEXT UNIQUE,
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    vip_tier TEXT DEFAULT 'Silver',
    total_spend NUMERIC DEFAULT 0.0,
    points INTEGER DEFAULT 500,
    assigned_coupon TEXT DEFAULT '',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_visit TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
ALTER TABLE customers ADD COLUMN IF NOT EXISTS assigned_coupon TEXT DEFAULT '';

-- 2. Coupons Table
CREATE TABLE IF NOT EXISTS coupons (
    id TEXT PRIMARY KEY,
    code TEXT UNIQUE NOT NULL,
    title TEXT,
    description TEXT,
    discount_type TEXT,
    discount_value NUMERIC,
    min_order_value NUMERIC,
    usage_count INTEGER DEFAULT 0,
    max_usage INTEGER DEFAULT 5000,
    status TEXT DEFAULT 'Active',
    start_date DATE,
    end_date DATE,
    applicable_category TEXT,
    redeemed_customers TEXT DEFAULT ''
);
-- IMPORTANT: Run this if the column was not created above
ALTER TABLE coupons ADD COLUMN IF NOT EXISTS redeemed_customers TEXT DEFAULT '';

-- 3. Redemptions Table
CREATE TABLE IF NOT EXISTS redemptions (
    id TEXT PRIMARY KEY,
    coupon_code TEXT,
    customer_name TEXT,
    customer_email TEXT,
    customer_phone TEXT,
    loyalty_tier TEXT,
    order_id TEXT,
    order_total NUMERIC,
    discount_saved NUMERIC,
    redeemed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    store_location TEXT
);

-- 4. Orders Table
CREATE TABLE IF NOT EXISTS orders (
    id TEXT PRIMARY KEY,
    order_id TEXT UNIQUE,
    customer_name TEXT,
    customer_phone TEXT,
    customer_email TEXT,
    items JSONB DEFAULT '[]'::jsonb,
    total_amount NUMERIC,
    coupon_code TEXT,
    discount_saved NUMERIC,
    status TEXT DEFAULT 'Completed',
    order_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    store_location TEXT,
    channel TEXT
);

-- 5. Customer Feedbacks Table
CREATE TABLE IF NOT EXISTS feedbacks (
    id TEXT PRIMARY KEY,
    customer_name TEXT,
    customer_email TEXT,
    customer_phone TEXT,
    loyalty_tier TEXT,
    store_location TEXT,
    category TEXT,
    rating INTEGER,
    title TEXT,
    comment TEXT,
    date DATE,
    time TEXT,
    sentiment TEXT,
    verified_purchase BOOLEAN DEFAULT TRUE,
    helpful_count INTEGER DEFAULT 0,
    manager_response TEXT
);

-- Enable Row Level Security (RLS) policies allowing full access
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE redemptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE feedbacks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read/write on customers" ON customers FOR ALL USING (true);
CREATE POLICY "Allow public read/write on coupons" ON coupons FOR ALL USING (true);
CREATE POLICY "Allow public read/write on redemptions" ON redemptions FOR ALL USING (true);
CREATE POLICY "Allow public read/write on orders" ON orders FOR ALL USING (true);
CREATE POLICY "Allow public read/write on feedbacks" ON feedbacks FOR ALL USING (true);

-- ===========================================================================
-- AUTOMATIC DATABASE TRIGGER: CUSTOMERS -> REDEMPTIONS & COUPONS SYNC
-- ===========================================================================

CREATE OR REPLACE FUNCTION sync_customer_coupon_redemption()
RETURNS TRIGGER AS $$
DECLARE
    clean_coupon TEXT;
    cpn_record RECORD;
    new_red_id TEXT;
    cur_names TEXT;
BEGIN
    clean_coupon := UPPER(TRIM(COALESCE(NEW.assigned_coupon, '')));
    
    IF clean_coupon IS NOT NULL AND clean_coupon <> '' THEN
        new_red_id := 'RED-' || UPPER(SUBSTRING(MD5(NEW.name || clean_coupon || COALESCE(NEW.phone, '')) FROM 1 FOR 8));

        -- 1. Insert/Update redemptions table
        INSERT INTO redemptions (
            id,
            coupon_code,
            customer_name,
            customer_email,
            customer_phone,
            loyalty_tier,
            order_id,
            order_total,
            discount_saved,
            redeemed_at,
            store_location
        ) VALUES (
            new_red_id,
            clean_coupon,
            COALESCE(NEW.name, 'Wi-Fi Guest'),
            COALESCE(NEW.email, ''),
            COALESCE(NEW.phone, ''),
            COALESCE(NEW.vip_tier, 'Gold First Citizen'),
            'SS-ORD-' || UPPER(SUBSTRING(MD5(RANDOM()::TEXT) FROM 1 FOR 6)),
            4999.00,
            1000.00,
            NOW(),
            'Mumbai - Malad West Flagship'
        )
        ON CONFLICT (id) DO UPDATE SET
            customer_name = EXCLUDED.customer_name,
            customer_email = EXCLUDED.customer_email,
            customer_phone = EXCLUDED.customer_phone;

        -- 2. Update usage_count & redeemed_customers in coupons table
        SELECT usage_count, redeemed_customers INTO cpn_record FROM coupons WHERE UPPER(code) = clean_coupon;
        
        IF FOUND THEN
            cur_names := COALESCE(cpn_record.redeemed_customers, '');
            IF POSITION(NEW.name IN cur_names) = 0 THEN
                IF cur_names = '' THEN
                    cur_names := NEW.name;
                ELSE
                    cur_names := cur_names || ', ' || NEW.name;
                END IF;
                
                UPDATE coupons 
                SET usage_count = COALESCE(usage_count, 0) + 1,
                    redeemed_customers = cur_names
                WHERE UPPER(code) = clean_coupon;
            END IF;
        END IF;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_sync_customer_coupon ON customers;

CREATE TRIGGER trg_sync_customer_coupon
AFTER INSERT OR UPDATE OF assigned_coupon ON customers
FOR EACH ROW
EXECUTE FUNCTION sync_customer_coupon_redemption();

