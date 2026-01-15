-- Drop the security definer view and replace with security invoker
DROP VIEW IF EXISTS public.admin_orders_view;

-- Create admin_orders_view with security invoker (safer)
CREATE OR REPLACE VIEW public.admin_orders_view
WITH (security_invoker=on) AS
SELECT 
  o.id,
  o.order_number,
  o.created_at,
  o.status,
  o.subtotal,
  o.total,
  o.user_id,
  p.full_name,
  p.eco_points,
  p.phone,
  FLOOR(o.total) as points_awarded
FROM public.orders o
LEFT JOIN public.profiles p ON o.user_id = p.user_id
ORDER BY o.created_at DESC;

-- Create security definer function to check admin status
CREATE OR REPLACE FUNCTION public.is_admin(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(
    (SELECT is_admin FROM public.profiles WHERE user_id = _user_id LIMIT 1),
    false
  )
$$;

-- Drop old policies that might cause recursion
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all orders" ON public.orders;
DROP POLICY IF EXISTS "Admins can view all order items" ON public.order_items;

-- Recreate admin policies using the security definer function
CREATE POLICY "Admins can view all profiles" 
ON public.profiles 
FOR SELECT 
USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can view all orders" 
ON public.orders 
FOR SELECT 
USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can view all order items" 
ON public.order_items 
FOR SELECT 
USING (public.is_admin(auth.uid()));