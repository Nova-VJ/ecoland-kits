
-- Add subscription columns to saved_diets
ALTER TABLE public.saved_diets 
ADD COLUMN subscription_active boolean NOT NULL DEFAULT false,
ADD COLUMN subscription_interval text,
ADD COLUMN subscription_plan text,
ADD COLUMN subscription_start timestamp with time zone,
ADD COLUMN subscription_next_order timestamp with time zone;

-- Add UPDATE RLS policy
CREATE POLICY "Users can update their own diets"
ON public.saved_diets
FOR UPDATE
USING (auth.uid() = user_id);
