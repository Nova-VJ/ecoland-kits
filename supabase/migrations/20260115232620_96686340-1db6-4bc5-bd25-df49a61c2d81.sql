-- Add eco_points column to profiles table
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS eco_points integer DEFAULT 0;

-- Add is_admin column to profiles table
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_admin boolean DEFAULT false;

-- Create admin_order_views table for admin to see all orders with eco points
CREATE OR REPLACE VIEW public.admin_orders_view AS
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

-- Create function to add eco points after order completion
CREATE OR REPLACE FUNCTION public.add_eco_points_on_order()
RETURNS TRIGGER AS $$
BEGIN
  -- Add points equal to the floor of order total (1 point per euro spent)
  UPDATE public.profiles 
  SET eco_points = COALESCE(eco_points, 0) + FLOOR(NEW.total)
  WHERE user_id = NEW.user_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger to auto-add eco points when order is created
DROP TRIGGER IF EXISTS trigger_add_eco_points ON public.orders;
CREATE TRIGGER trigger_add_eco_points
AFTER INSERT ON public.orders
FOR EACH ROW
EXECUTE FUNCTION public.add_eco_points_on_order();

-- Update RLS policy for profiles to allow admin access
CREATE POLICY "Admins can view all profiles" 
ON public.profiles 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() AND is_admin = true
  )
);

-- Update RLS policy for orders to allow admin access
CREATE POLICY "Admins can view all orders" 
ON public.orders 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() AND is_admin = true
  )
);

-- Update RLS policy for order_items to allow admin access
CREATE POLICY "Admins can view all order items" 
ON public.order_items 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() AND is_admin = true
  )
);