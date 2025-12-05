-- Corriger la politique RLS pour permettre l'accès via invite_token
-- Un utilisateur peut voir un challenge s'il a le token d'invitation

DROP POLICY IF EXISTS "Anyone can view public or unlisted challenges" ON public.challenges;

CREATE POLICY "Anyone can view accessible challenges"
  ON public.challenges FOR SELECT
  USING (
    visibility IN ('public', 'unlisted') OR
    owner_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM public.challenge_members
      WHERE challenge_id = id AND user_id = auth.uid()
    )
  );

-- Note: L'accès via invite_token est géré côté application
-- car on ne peut pas passer le token dans la requête RLS
-- La solution est de rendre tous les challenges visibles via leur invite_token
-- en changeant temporairement la visibilité ou en utilisant une requête avec bypass RLS
