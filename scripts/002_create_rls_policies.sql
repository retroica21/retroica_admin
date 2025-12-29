-- Enable Row Level Security on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.platform_listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.financial_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.platform_sync_log ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles"
  ON public.profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Products policies
CREATE POLICY "Sellers can view own products"
  ON public.products FOR SELECT
  USING (seller_id = auth.uid());

CREATE POLICY "Admins can view all products"
  ON public.products FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Sellers can create own products"
  ON public.products FOR INSERT
  WITH CHECK (seller_id = auth.uid());

CREATE POLICY "Sellers can update own products"
  ON public.products FOR UPDATE
  USING (seller_id = auth.uid());

CREATE POLICY "Sellers can delete own products"
  ON public.products FOR DELETE
  USING (seller_id = auth.uid());

-- Platform listings policies
CREATE POLICY "Sellers can view own product listings"
  ON public.platform_listings FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.products
      WHERE products.id = platform_listings.product_id
      AND products.seller_id = auth.uid()
    )
  );

CREATE POLICY "Admins can view all listings"
  ON public.platform_listings FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "System can manage listings"
  ON public.platform_listings FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.products
      WHERE products.id = platform_listings.product_id
      AND products.seller_id = auth.uid()
    )
  );

-- Orders policies
CREATE POLICY "Sellers can view own orders"
  ON public.orders FOR SELECT
  USING (seller_id = auth.uid());

CREATE POLICY "Admins can view all orders"
  ON public.orders FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "System can create orders"
  ON public.orders FOR INSERT
  WITH CHECK (
    seller_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can update orders"
  ON public.orders FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Financial transactions policies
CREATE POLICY "Sellers can view own transactions"
  ON public.financial_transactions FOR SELECT
  USING (seller_id = auth.uid());

CREATE POLICY "Admins can view all transactions"
  ON public.financial_transactions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "System can create transactions"
  ON public.financial_transactions FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Platform sync log policies (admin only)
CREATE POLICY "Admins can view sync logs"
  ON public.platform_sync_log FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can create sync logs"
  ON public.platform_sync_log FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );
