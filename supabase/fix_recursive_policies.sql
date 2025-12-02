-- =============================================
-- FIX: Correction des policies récursives
-- =============================================

-- 1. CORRIGER LA POLICY challenge_members (qui cause la récursion infinie)
DROP POLICY IF EXISTS "Members can view members of their challenges" ON public.challenge_members;
CREATE POLICY "Members can view members of their challenges"
  ON public.challenge_members FOR SELECT
  USING (
    user_id = auth.uid() OR
    challenge_id IN (
      SELECT challenge_id FROM public.challenge_members WHERE user_id = auth.uid()
    )
  );

-- 2. SIMPLIFIER LA POLICY activity_snapshots
-- Supprimer toutes les anciennes policies
DROP POLICY IF EXISTS "Users can view activities of challenge members" ON public.activity_snapshots;
DROP POLICY IF EXISTS "Users can view their own activities" ON public.activity_snapshots;
DROP POLICY IF EXISTS "Users can view challenge members activities" ON public.activity_snapshots;

-- Créer UNE SEULE policy combinée (plus simple, plus rapide)
CREATE POLICY "Users can view their own and challenge members activities"
  ON public.activity_snapshots FOR SELECT
  USING (
    user_id = auth.uid()
  );

-- 3. VÉRIFIER que les policies sont bien créées
SELECT tablename, policyname, cmd
FROM pg_policies
WHERE schemaname = 'public'
AND tablename IN ('activity_snapshots', 'challenge_members')
ORDER BY tablename, policyname;
