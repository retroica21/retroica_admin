-- Create enum types for platform and status tracking
CREATE TYPE platform_type AS ENUM ('etsy', 'medusa', 'aukro', 'other');
CREATE TYPE product_status AS ENUM ('draft', 'active', 'sold', 'archived');
CREATE TYPE listing_status AS ENUM ('pending', 'active', 'sold', 'delisted', 'error');
CREATE TYPE seller_role AS ENUM ('admin', 'seller');
CREATE TYPE order_status AS ENUM ('pending', 'paid', 'shipped', 'completed', 'cancelled', 'refunded');

-- Profiles table - extends auth.users with role and metadata
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  role seller_role NOT NULL DEFAULT 'seller',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Products table - central inventory
CREATE TABLE IF NOT EXISTS public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT,
  condition TEXT,
  base_price DECIMAL(10, 2) NOT NULL,
  cost DECIMAL(10, 2), -- Cost of goods for profit calculation
  sku TEXT UNIQUE,
  status product_status NOT NULL DEFAULT 'draft',
  images JSONB DEFAULT '[]'::jsonb, -- Array of image URLs
  metadata JSONB DEFAULT '{}'::jsonb, -- Additional product details
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Platform listings - tracks product listings across platforms
CREATE TABLE IF NOT EXISTS public.platform_listings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  platform platform_type NOT NULL,
  platform_listing_id TEXT, -- External platform ID
  platform_url TEXT,
  price DECIMAL(10, 2) NOT NULL,
  status listing_status NOT NULL DEFAULT 'pending',
  listed_at TIMESTAMPTZ,
  sold_at TIMESTAMPTZ,
  delisted_at TIMESTAMPTZ,
  error_message TEXT,
  sync_metadata JSONB DEFAULT '{}'::jsonb, -- Platform-specific data
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(product_id, platform)
);

-- Orders table - tracks sales across platforms
CREATE TABLE IF NOT EXISTS public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE RESTRICT,
  seller_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  platform platform_type NOT NULL,
  platform_order_id TEXT,
  buyer_name TEXT,
  buyer_email TEXT,
  sale_price DECIMAL(10, 2) NOT NULL,
  platform_fees DECIMAL(10, 2) DEFAULT 0,
  shipping_cost DECIMAL(10, 2) DEFAULT 0,
  net_amount DECIMAL(10, 2) NOT NULL, -- sale_price - platform_fees
  status order_status NOT NULL DEFAULT 'pending',
  order_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  shipped_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  notes TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Financial transactions - detailed financial tracking
CREATE TABLE IF NOT EXISTS public.financial_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
  seller_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  transaction_type TEXT NOT NULL, -- 'sale', 'refund', 'fee', 'payout'
  amount DECIMAL(10, 2) NOT NULL,
  platform platform_type NOT NULL,
  description TEXT,
  transaction_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Platform sync log - track API sync operations
CREATE TABLE IF NOT EXISTS public.platform_sync_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  platform platform_type NOT NULL,
  sync_type TEXT NOT NULL, -- 'webhook', 'poll', 'manual'
  status TEXT NOT NULL, -- 'success', 'failure', 'partial'
  records_processed INTEGER DEFAULT 0,
  error_message TEXT,
  sync_started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  sync_completed_at TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Create indexes for performance
CREATE INDEX idx_products_seller_id ON public.products(seller_id);
CREATE INDEX idx_products_status ON public.products(status);
CREATE INDEX idx_products_sku ON public.products(sku);
CREATE INDEX idx_platform_listings_product_id ON public.platform_listings(product_id);
CREATE INDEX idx_platform_listings_platform ON public.platform_listings(platform);
CREATE INDEX idx_platform_listings_status ON public.platform_listings(status);
CREATE INDEX idx_orders_seller_id ON public.orders(seller_id);
CREATE INDEX idx_orders_product_id ON public.orders(product_id);
CREATE INDEX idx_orders_platform ON public.orders(platform);
CREATE INDEX idx_orders_order_date ON public.orders(order_date);
CREATE INDEX idx_financial_transactions_seller_id ON public.financial_transactions(seller_id);
CREATE INDEX idx_financial_transactions_order_id ON public.financial_transactions(order_id);
CREATE INDEX idx_financial_transactions_transaction_date ON public.financial_transactions(transaction_date);
