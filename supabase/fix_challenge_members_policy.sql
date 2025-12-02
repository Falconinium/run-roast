-- =============================================
-- FIX FINAL: Correction complète de la policy challenge_members
-- =============================================

-- Supprimer TOUTES les anciennes policies de challenge_members
DROP POLICY IF EXISTS "Members can view members of their challenges" ON public.challenge_members;
DROP POLICY IF EXISTS "Users can join challenges" ON public.challenge_members;
DROP POLICY IF EXISTS "Members can leave challenges" ON public.challenge_members;

-- 1. Policy pour SELECT (lecture) - SANS RÉCURSION
CREATE POLICY "Members can view challenge members"
  ON public.challenge_members FOR SELECT
  USING (true);  -- Tout le monde peut voir les membres (on filtrera côté application si nécessaire)

-- 2. Policy pour INSERT (rejoindre un défi)
CREATE POLICY "Users can join challenges as themselves"
  ON public.challenge_members FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- 3. Policy pour DELETE (quitter un défi)
CREATE POLICY "Members can leave challenges they joined"
  ON public.challenge_members FOR DELETE
  USING (auth.uid() = user_id AND role != 'owner');

-- 4. Policy pour UPDATE (optionnelle)
DROP POLICY IF EXISTS "Owners can update members" ON public.challenge_members;
CREATE POLICY "Owners can update members"
  ON public.challenge_members FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.challenges
      WHERE challenges.id = challenge_members.challenge_id
      AND challenges.owner_id = auth.uid()
    )
  );

-- Vérifier les policies
SELECT tablename, policyname, cmd, permissive
FROM pg_policies
WHERE schemaname = 'public'
AND tablename = 'challenge_members'
ORDER BY cmd, policyname;
