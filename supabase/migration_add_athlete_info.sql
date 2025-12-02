-- =============================================
-- MIGRATION: Ajouter les informations de l'athlète Strava
-- =============================================
-- À exécuter dans le SQL Editor de Supabase

-- Ajouter les colonnes pour stocker les informations de l'athlète Strava
ALTER TABLE public.strava_connections
ADD COLUMN IF NOT EXISTS athlete_firstname TEXT,
ADD COLUMN IF NOT EXISTS athlete_lastname TEXT,
ADD COLUMN IF NOT EXISTS athlete_profile_image TEXT;

-- Commentaire pour documenter les nouvelles colonnes
COMMENT ON COLUMN public.strava_connections.athlete_firstname IS 'Prénom de l''athlète Strava';
COMMENT ON COLUMN public.strava_connections.athlete_lastname IS 'Nom de famille de l''athlète Strava';
COMMENT ON COLUMN public.strava_connections.athlete_profile_image IS 'URL de l''image de profil Strava';
