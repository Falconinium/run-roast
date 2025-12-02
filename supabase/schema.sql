-- =============================================
-- SCHEMA SQL POUR RUN&ROAST (MicroChallenges)
-- =============================================
-- À exécuter dans le SQL Editor de Supabase

-- Extension pour UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- TABLE: profiles
-- =============================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Index pour recherche par email
CREATE INDEX IF NOT EXISTS profiles_email_idx ON public.profiles(email);

-- =============================================
-- TABLE: strava_connections
-- =============================================
CREATE TABLE IF NOT EXISTS public.strava_connections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  strava_athlete_id TEXT NOT NULL,
  access_token TEXT NOT NULL,
  refresh_token TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  athlete_firstname TEXT,
  athlete_lastname TEXT,
  athlete_profile_image TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE(user_id)
);

-- Index pour recherche par athlete_id
CREATE INDEX IF NOT EXISTS strava_connections_athlete_idx ON public.strava_connections(strava_athlete_id);

-- =============================================
-- TABLE: challenges
-- =============================================
CREATE TABLE IF NOT EXISTS public.challenges (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  sport TEXT NOT NULL CHECK (sport IN ('run', 'ride', 'hike', 'walk', 'swim', 'other')),
  metric TEXT NOT NULL CHECK (metric IN ('distance', 'time', 'elevation', 'count')),
  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ NOT NULL,
  visibility TEXT NOT NULL DEFAULT 'private' CHECK (visibility IN ('private', 'unlisted', 'public')),
  invite_token TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  CHECK (end_date > start_date)
);

-- Index pour recherche par owner
CREATE INDEX IF NOT EXISTS challenges_owner_idx ON public.challenges(owner_id);

-- Index unique pour invite_token
CREATE UNIQUE INDEX IF NOT EXISTS challenges_invite_token_idx ON public.challenges(invite_token);

-- =============================================
-- TABLE: challenge_members
-- =============================================
CREATE TABLE IF NOT EXISTS public.challenge_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  challenge_id UUID NOT NULL REFERENCES public.challenges(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('owner', 'member')),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE(challenge_id, user_id)
);

-- Index pour recherche par challenge
CREATE INDEX IF NOT EXISTS challenge_members_challenge_idx ON public.challenge_members(challenge_id);

-- Index pour recherche par user
CREATE INDEX IF NOT EXISTS challenge_members_user_idx ON public.challenge_members(user_id);

-- =============================================
-- TABLE: activity_snapshots
-- =============================================
CREATE TABLE IF NOT EXISTS public.activity_snapshots (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  strava_activity_id TEXT NOT NULL,
  sport_type TEXT NOT NULL,
  distance NUMERIC NOT NULL DEFAULT 0,
  moving_time INTEGER NOT NULL DEFAULT 0,
  elapsed_time INTEGER NOT NULL DEFAULT 0,
  total_elevation_gain NUMERIC NOT NULL DEFAULT 0,
  start_date TIMESTAMPTZ NOT NULL,
  raw_payload JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE(user_id, strava_activity_id)
);

-- Index pour recherche par user et date
CREATE INDEX IF NOT EXISTS activity_snapshots_user_date_idx ON public.activity_snapshots(user_id, start_date);

-- Index pour recherche par strava_activity_id
CREATE INDEX IF NOT EXISTS activity_snapshots_strava_id_idx ON public.activity_snapshots(strava_activity_id);

-- =============================================
-- FUNCTION: Trigger pour updated_at
-- =============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers pour updated_at
DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_strava_connections_updated_at ON public.strava_connections;
CREATE TRIGGER update_strava_connections_updated_at
  BEFORE UPDATE ON public.strava_connections
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_challenges_updated_at ON public.challenges;
CREATE TRIGGER update_challenges_updated_at
  BEFORE UPDATE ON public.challenges
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- ROW LEVEL SECURITY (RLS)
-- =============================================

-- Enable RLS sur toutes les tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.strava_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.challenge_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_snapshots ENABLE ROW LEVEL SECURITY;

-- Policies pour profiles
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Policies pour strava_connections
DROP POLICY IF EXISTS "Users can manage their own Strava connection" ON public.strava_connections;
CREATE POLICY "Users can manage their own Strava connection"
  ON public.strava_connections
  USING (auth.uid() = user_id);

-- Policies pour challenges
DROP POLICY IF EXISTS "Anyone can view public or unlisted challenges" ON public.challenges;
CREATE POLICY "Anyone can view public or unlisted challenges"
  ON public.challenges FOR SELECT
  USING (
    visibility IN ('public', 'unlisted') OR
    owner_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM public.challenge_members
      WHERE challenge_id = id AND user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can create challenges" ON public.challenges;
CREATE POLICY "Users can create challenges"
  ON public.challenges FOR INSERT
  WITH CHECK (auth.uid() = owner_id);

DROP POLICY IF EXISTS "Owners can update their challenges" ON public.challenges;
CREATE POLICY "Owners can update their challenges"
  ON public.challenges FOR UPDATE
  USING (auth.uid() = owner_id);

DROP POLICY IF EXISTS "Owners can delete their challenges" ON public.challenges;
CREATE POLICY "Owners can delete their challenges"
  ON public.challenges FOR DELETE
  USING (auth.uid() = owner_id);

-- Policies pour challenge_members
DROP POLICY IF EXISTS "Members can view members of their challenges" ON public.challenge_members;
CREATE POLICY "Members can view members of their challenges"
  ON public.challenge_members FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.challenge_members cm
      WHERE cm.challenge_id = challenge_id AND cm.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can join challenges" ON public.challenge_members;
CREATE POLICY "Users can join challenges"
  ON public.challenge_members FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Members can leave challenges" ON public.challenge_members;
CREATE POLICY "Members can leave challenges"
  ON public.challenge_members FOR DELETE
  USING (auth.uid() = user_id AND role != 'owner');

-- Policies pour activity_snapshots
DROP POLICY IF EXISTS "Users can view activities of challenge members" ON public.activity_snapshots;
CREATE POLICY "Users can view activities of challenge members"
  ON public.activity_snapshots FOR SELECT
  USING (
    auth.uid() = user_id OR
    EXISTS (
      SELECT 1 FROM public.challenge_members cm1
      JOIN public.challenge_members cm2 ON cm1.challenge_id = cm2.challenge_id
      WHERE cm1.user_id = auth.uid() AND cm2.user_id = activity_snapshots.user_id
    )
  );

DROP POLICY IF EXISTS "Users can insert their own activities" ON public.activity_snapshots;
CREATE POLICY "Users can insert their own activities"
  ON public.activity_snapshots FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own activities" ON public.activity_snapshots;
CREATE POLICY "Users can update their own activities"
  ON public.activity_snapshots FOR UPDATE
  USING (auth.uid() = user_id);
