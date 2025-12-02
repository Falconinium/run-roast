-- =============================================
-- FIX: Policy pour voir ses propres activités
-- =============================================

-- Supprimer l'ancienne policy
DROP POLICY IF EXISTS "Users can view activities of challenge members" ON public.activity_snapshots;

-- Créer une nouvelle policy qui permet de voir ses propres activités
DROP POLICY IF EXISTS "Users can view their own activities" ON public.activity_snapshots;
CREATE POLICY "Users can view their own activities"
  ON public.activity_snapshots FOR SELECT
  USING (auth.uid() = user_id);

-- Policy additionnelle pour voir les activités des membres des mêmes challenges
DROP POLICY IF EXISTS "Users can view challenge members activities" ON public.activity_snapshots;
CREATE POLICY "Users can view challenge members activities"
  ON public.activity_snapshots FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.challenge_members cm1
      JOIN public.challenge_members cm2 ON cm1.challenge_id = cm2.challenge_id
      WHERE cm1.user_id = auth.uid() AND cm2.user_id = activity_snapshots.user_id
    )
  );

-- Vérifier que les policies sont bien créées
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE tablename = 'activity_snapshots';
