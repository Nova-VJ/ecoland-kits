import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface ProductView {
  id: string;
  product_id: string;
  product_type: string;
  product_name: string;
  product_image: string | null;
  product_price: number | null;
  viewed_at: string;
}

export const useProductViews = () => {
  const [views, setViews] = useState<ProductView[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchViews = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setIsLoading(false); return; }

    const { data } = await supabase
      .from('product_views')
      .select('*')
      .eq('user_id', user.id)
      .order('viewed_at', { ascending: false })
      .limit(20);

    setViews((data as ProductView[]) || []);
    setIsLoading(false);
  }, []);

  useEffect(() => { fetchViews(); }, [fetchViews]);

  const trackView = useCallback(async (product: {
    id: string; type: string; name: string; image?: string; price?: number;
  }) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Avoid duplicate recent views (same product within last hour)
    const oneHourAgo = new Date(Date.now() - 3600000).toISOString();
    const { data: existing } = await supabase
      .from('product_views')
      .select('id')
      .eq('user_id', user.id)
      .eq('product_id', product.id)
      .gte('viewed_at', oneHourAgo)
      .limit(1);

    if (existing && existing.length > 0) return;

    await supabase.from('product_views').insert({
      user_id: user.id,
      product_id: product.id,
      product_type: product.type,
      product_name: product.name,
      product_image: product.image || null,
      product_price: product.price || null,
    });
  }, []);

  return { views, isLoading, trackView, refetch: fetchViews };
};
