-- Perfil de alimentación de Ecoland Salud.
-- Las necesidades guardadas pueden revelar datos de salud (RGPD art. 9): solo se guardan
-- con consentimiento explícito, cada persona ve únicamente su propio perfil y puede borrarlo.
CREATE TABLE public.health_profiles (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  needs text[] NOT NULL DEFAULT '{}',
  avoid_allergens text[] NOT NULL DEFAULT '{}',
  consent_given_at timestamp with time zone NOT NULL,
  consent_version text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.health_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own health profile"
ON public.health_profiles FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own health profile"
ON public.health_profiles FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own health profile"
ON public.health_profiles FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own health profile"
ON public.health_profiles FOR DELETE
USING (auth.uid() = user_id);
