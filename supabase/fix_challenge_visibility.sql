-- Corriger la politique RLS pour permettre l'accès aux challenges unlisted
-- Les challenges unlisted peuvent être vus par n'importe qui (via invite link)

DROP POLICY IF EXISTS "Anyone can view accessible challenges" ON public.challenges;
DROP POLICY IF EXISTS "Anyone can view public or unlisted challenges" ON public.challenges;

CREATE POLICY "Users can view challenges"
  ON public.challenges FOR SELECT
  USING (
    -- Les challenges public sont visibles par tous
    visibility = 'public' OR
    -- Les challenges unlisted sont visibles par tous (accès via invite token)
    visibility = 'unlisted' OR
    -- Le propriétaire peut toujours voir son challenge
    owner_id = auth.uid() OR
    -- Les membres peuvent voir les challenges auxquels ils participent
    EXISTS (
      SELECT 1 FROM public.challenge_members
      WHERE challenge_id = id AND user_id = auth.uid()
    )
  );
