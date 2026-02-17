
-- Eco-Coach conversations table
CREATE TABLE public.eco_coach_conversations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL DEFAULT 'Nueva conversación',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.eco_coach_conversations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own conversations"
  ON public.eco_coach_conversations FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own conversations"
  ON public.eco_coach_conversations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own conversations"
  ON public.eco_coach_conversations FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own conversations"
  ON public.eco_coach_conversations FOR DELETE
  USING (auth.uid() = user_id);

-- Eco-Coach messages table
CREATE TABLE public.eco_coach_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id UUID NOT NULL REFERENCES public.eco_coach_conversations(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.eco_coach_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view messages of their conversations"
  ON public.eco_coach_messages FOR SELECT
  USING (conversation_id IN (SELECT id FROM public.eco_coach_conversations WHERE user_id = auth.uid()));

CREATE POLICY "Users can insert messages to their conversations"
  ON public.eco_coach_messages FOR INSERT
  WITH CHECK (conversation_id IN (SELECT id FROM public.eco_coach_conversations WHERE user_id = auth.uid()));

-- Saved diets table
CREATE TABLE public.saved_diets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  conversation_id UUID REFERENCES public.eco_coach_conversations(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  diet_content TEXT NOT NULL,
  product_slugs JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.saved_diets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own diets"
  ON public.saved_diets FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own diets"
  ON public.saved_diets FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own diets"
  ON public.saved_diets FOR DELETE
  USING (auth.uid() = user_id);

-- Trigger for updated_at on conversations
CREATE TRIGGER update_eco_coach_conversations_updated_at
  BEFORE UPDATE ON public.eco_coach_conversations
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
