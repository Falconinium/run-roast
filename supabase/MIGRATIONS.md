# Migrations Supabase

Ce fichier documente les migrations à appliquer sur votre base de données Supabase.

## Migration 1: Ajouter les informations de l'athlète Strava

**Fichier**: `migration_add_athlete_info.sql`

**Date**: Décembre 2024

**Description**: Ajoute les colonnes pour stocker le nom et l'image de profil de l'athlète Strava.

### Colonnes ajoutées à `strava_connections`:
- `athlete_firstname` (TEXT, nullable) - Prénom de l'athlète Strava
- `athlete_lastname` (TEXT, nullable) - Nom de famille de l'athlète Strava
- `athlete_profile_image` (TEXT, nullable) - URL de l'image de profil Strava

### Comment appliquer cette migration:

1. Allez dans votre projet Supabase
2. Ouvrez le **SQL Editor**
3. Copiez le contenu de `migration_add_athlete_info.sql`
4. Collez-le dans l'éditeur
5. Cliquez sur "Run" (ou Ctrl+Enter)

### Vérification:

Après avoir exécuté la migration, vérifiez que les colonnes ont été ajoutées:

```sql
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'strava_connections'
ORDER BY ordinal_position;
```

Vous devriez voir les nouvelles colonnes `athlete_firstname`, `athlete_lastname`, et `athlete_profile_image`.

### Impact:

- Les connexions Strava existantes auront ces colonnes à NULL
- Les nouvelles connexions (ou reconnexions) stockeront automatiquement ces informations
- Pour mettre à jour les connexions existantes, les utilisateurs devront se reconnecter à Strava

### Rollback (si nécessaire):

Si vous devez annuler cette migration:

```sql
ALTER TABLE public.strava_connections
DROP COLUMN IF EXISTS athlete_firstname,
DROP COLUMN IF EXISTS athlete_lastname,
DROP COLUMN IF EXISTS athlete_profile_image;
```

## Note importante

Si vous venez de cloner le projet et que vous n'avez pas encore de base de données:
- **N'exécutez PAS cette migration**
- Utilisez directement `schema.sql` qui sera mis à jour pour inclure ces colonnes dans la version initiale
