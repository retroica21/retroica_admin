-- Function to calculate seller earnings
CREATE OR REPLACE FUNCTION get_seller_earnings(
  seller_uuid UUID,
  start_date TIMESTAMPTZ DEFAULT NULL,
  end_date TIMESTAMPTZ DEFAULT NULL
)
RETURNS TABLE (
  total_sales DECIMAL,
  total_fees DECIMAL,
  net_earnings DECIMAL,
  order_count BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COALESCE(SUM(sale_price), 0)::DECIMAL as total_sales,
    COALESCE(SUM(platform_fees), 0)::DECIMAL as total_fees,
    COALESCE(SUM(net_amount), 0)::DECIMAL as net_earnings,
    COUNT(*)::BIGINT as order_count
  FROM public.orders
  WHERE 
    seller_id = seller_uuid
    AND status IN ('completed', 'shipped', 'paid')
    AND (start_date IS NULL OR order_date >= start_date)
    AND (end_date IS NULL OR order_date <= end_date);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get platform performance summary
CREATE OR REPLACE FUNCTION get_platform_summary(
  seller_uuid UUID DEFAULT NULL
)
RETURNS TABLE (
  platform platform_type,
  active_listings BIGINT,
  total_sales BIGINT,
  total_revenue DECIMAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    pl.platform,
    COUNT(DISTINCT CASE WHEN pl.status = 'active' THEN pl.id END)::BIGINT as active_listings,
    COUNT(DISTINCT o.id)::BIGINT as total_sales,
    COALESCE(SUM(o.net_amount), 0)::DECIMAL as total_revenue
  FROM public.platform_listings pl
  LEFT JOIN public.orders o ON o.product_id = pl.product_id AND o.platform = pl.platform
  LEFT JOIN public.products p ON p.id = pl.product_id
  WHERE seller_uuid IS NULL OR p.seller_id = seller_uuid
  GROUP BY pl.platform;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get product listing status across all platforms
CREATE OR REPLACE FUNCTION get_product_status(product_uuid UUID)
RETURNS TABLE (
  platform platform_type,
  status listing_status,
  platform_url TEXT,
  price DECIMAL,
  listed_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    pl.platform,
    pl.status,
    pl.platform_url,
    pl.price,
    pl.listed_at
  FROM public.platform_listings pl
  WHERE pl.product_id = product_uuid
  ORDER BY pl.platform;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
