-- =============================================
-- MIGRATION: Nommer explicitement la contrainte unique des activités
-- =============================================
-- À exécuter dans le SQL Editor de Supabase

-- Supprimer la contrainte anonyme si elle existe
ALTER TABLE public.activity_snapshots
DROP CONSTRAINT IF EXISTS activity_snapshots_user_id_strava_activity_id_key;

-- Recréer la contrainte avec un nom explicite
ALTER TABLE public.activity_snapshots
ADD CONSTRAINT activity_snapshots_user_activity_unique
UNIQUE (user_id, strava_activity_id);

-- Vérifier que la contrainte existe
SELECT conname, contype
FROM pg_constraint
WHERE conrelid = 'public.activity_snapshots'::regclass
AND contype = 'u';
