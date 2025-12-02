-- =============================================
-- COMPLETE FIX: All RLS Policy Issues
-- =============================================
-- This script fixes all known RLS policy problems:
-- 1. Recursive policy in challenge_members
-- 2. Missing activity_snapshots policies
-- 3. Proper separation of concerns
--
-- Execute this in Supabase SQL Editor
-- =============================================

-- =============================================
-- FIX 1: challenge_members policies (NO RECURSION)
-- =============================================

-- Remove ALL old policies
DROP POLICY IF EXISTS "Members can view members of their challenges" ON public.challenge_members;
DROP POLICY IF EXISTS "Users can join challenges" ON public.challenge_members;
DROP POLICY IF EXISTS "Members can leave challenges" ON public.challenge_members;
DROP POLICY IF EXISTS "Members can view challenge members" ON public.challenge_members;
DROP POLICY IF EXISTS "Users can join challenges as themselves" ON public.challenge_members;
DROP POLICY IF EXISTS "Members can leave challenges they joined" ON public.challenge_members;
DROP POLICY IF EXISTS "Owners can update members" ON public.challenge_members;

-- SELECT: Allow viewing all challenge members (no recursion)
-- Application can filter if needed
CREATE POLICY "Members can view challenge members"
  ON public.challenge_members FOR SELECT
  USING (true);

-- INSERT: Users can only add themselves to challenges
CREATE POLICY "Users can join challenges as themselves"
  ON public.challenge_members FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- DELETE: Members can leave (but owners cannot)
CREATE POLICY "Members can leave challenges they joined"
  ON public.challenge_members FOR DELETE
  USING (auth.uid() = user_id AND role != 'owner');

-- UPDATE: Only challenge owners can update member roles
CREATE POLICY "Owners can update members"
  ON public.challenge_members FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.challenges
      WHERE challenges.id = challenge_members.challenge_id
      AND challenges.owner_id = auth.uid()
    )
  );

-- =============================================
-- FIX 2: activity_snapshots policies (CORRECTED)
-- =============================================

-- Remove ALL old policies
DROP POLICY IF EXISTS "Users can view activities of challenge members" ON public.activity_snapshots;
DROP POLICY IF EXISTS "Users can view their own activities" ON public.activity_snapshots;
DROP POLICY IF EXISTS "Users can view challenge members activities" ON public.activity_snapshots;
DROP POLICY IF EXISTS "Users can insert their own activities" ON public.activity_snapshots;
DROP POLICY IF EXISTS "Users can update their own activities" ON public.activity_snapshots;
DROP POLICY IF EXISTS "Users can view their own and challenge members activities" ON public.activity_snapshots;

-- SELECT: Users can view their own activities
CREATE POLICY "Users can view their own activities"
  ON public.activity_snapshots FOR SELECT
  USING (auth.uid() = user_id);

-- SELECT: Users can view activities of members in same challenges
CREATE POLICY "Users can view challenge members activities"
  ON public.activity_snapshots FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.challenge_members cm1
      JOIN public.challenge_members cm2 ON cm1.challenge_id = cm2.challenge_id
      WHERE cm1.user_id = auth.uid() AND cm2.user_id = activity_snapshots.user_id
    )
  );

-- INSERT: Users can only insert their own activities
CREATE POLICY "Users can insert their own activities"
  ON public.activity_snapshots FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- UPDATE: Users can only update their own activities
CREATE POLICY "Users can update their own activities"
  ON public.activity_snapshots FOR UPDATE
  USING (auth.uid() = user_id);

-- =============================================
-- VERIFICATION
-- =============================================

-- Check all policies are created correctly
SELECT
  tablename,
  policyname,
  cmd,
  permissive,
  CASE cmd
    WHEN 'SELECT' THEN 'USING: ' || COALESCE(qual, 'N/A')
    WHEN 'INSERT' THEN 'WITH CHECK: ' || COALESCE(with_check, 'N/A')
    WHEN 'UPDATE' THEN 'USING: ' || COALESCE(qual, 'N/A')
    WHEN 'DELETE' THEN 'USING: ' || COALESCE(qual, 'N/A')
  END as condition
FROM pg_policies
WHERE schemaname = 'public'
AND tablename IN ('challenge_members', 'activity_snapshots')
ORDER BY tablename, cmd, policyname;

-- Summary
SELECT
  tablename,
  COUNT(*) as policy_count
FROM pg_policies
WHERE schemaname = 'public'
AND tablename IN ('challenge_members', 'activity_snapshots')
GROUP BY tablename
ORDER BY tablename;
