
-- Table for tracking product views
CREATE TABLE public.product_views (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  product_id TEXT NOT NULL,
  product_type TEXT NOT NULL DEFAULT 'catalog-product',
  product_name TEXT NOT NULL,
  product_image TEXT,
  product_price NUMERIC,
  viewed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.product_views ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own product views"
ON public.product_views FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own product views"
ON public.product_views FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own product views"
ON public.product_views FOR DELETE
USING (auth.uid() = user_id);

-- Index for fast lookups
CREATE INDEX idx_product_views_user ON public.product_views(user_id, viewed_at DESC);

-- Table for abandoned carts
CREATE TABLE public.abandoned_carts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  cart_items JSONB NOT NULL DEFAULT '[]',
  total_price NUMERIC NOT NULL DEFAULT 0,
  item_count INTEGER NOT NULL DEFAULT 0,
  abandoned_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  recovered BOOLEAN NOT NULL DEFAULT false
);

ALTER TABLE public.abandoned_carts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own abandoned carts"
ON public.abandoned_carts FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own abandoned carts"
ON public.abandoned_carts FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own abandoned carts"
ON public.abandoned_carts FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own abandoned carts"
ON public.abandoned_carts FOR DELETE
USING (auth.uid() = user_id);

CREATE INDEX idx_abandoned_carts_user ON public.abandoned_carts(user_id, abandoned_at DESC);
