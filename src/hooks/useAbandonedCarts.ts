import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface AbandonedCart {
  id: string;
  cart_items: any[];
  total_price: number;
  item_count: number;
  abandoned_at: string;
  recovered: boolean;
}

export const useAbandonedCarts = () => {
  const [carts, setCarts] = useState<AbandonedCart[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchCarts = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setIsLoading(false); return; }

    const { data } = await supabase
      .from('abandoned_carts')
      .select('*')
      .eq('user_id', user.id)
      .order('abandoned_at', { ascending: false })
      .limit(10);

    setCarts((data as AbandonedCart[]) || []);
    setIsLoading(false);
  }, []);

  useEffect(() => { fetchCarts(); }, [fetchCarts]);

  const saveAbandonedCart = useCallback(async (cartItems: any[], totalPrice: number) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || cartItems.length === 0) return;

    await supabase.from('abandoned_carts').insert({
      user_id: user.id,
      cart_items: cartItems,
      total_price: totalPrice,
      item_count: cartItems.reduce((s: number, i: any) => s + (i.quantity || 1), 0),
    });
  }, []);

  const markRecovered = useCallback(async (cartId: string) => {
    await supabase
      .from('abandoned_carts')
      .update({ recovered: true })
      .eq('id', cartId);
    fetchCarts();
  }, [fetchCarts]);

  const deleteCart = useCallback(async (cartId: string) => {
    await supabase
      .from('abandoned_carts')
      .delete()
      .eq('id', cartId);
    fetchCarts();
  }, [fetchCarts]);

  return { carts, isLoading, saveAbandonedCart, markRecovered, deleteCart, refetch: fetchCarts };
};
