# Guide de migration - Ajout des informations de l'athlète Strava

## Pour les utilisateurs existants

Si vous avez déjà une base de données Run&Roast en fonctionnement, suivez ces étapes pour ajouter les nouvelles fonctionnalités d'affichage du profil Strava.

### Étape 1: Appliquer les migrations SQL

1. Connectez-vous à votre projet Supabase
2. Allez dans **SQL Editor**

#### Migration 1: Ajouter les informations de l'athlète

Copiez et exécutez le contenu de `supabase/migration_add_athlete_info.sql` :

```sql
ALTER TABLE public.strava_connections
ADD COLUMN IF NOT EXISTS athlete_firstname TEXT,
ADD COLUMN IF NOT EXISTS athlete_lastname TEXT,
ADD COLUMN IF NOT EXISTS athlete_profile_image TEXT;

COMMENT ON COLUMN public.strava_connections.athlete_firstname IS 'Prénom de l''athlète Strava';
COMMENT ON COLUMN public.strava_connections.athlete_lastname IS 'Nom de famille de l''athlète Strava';
COMMENT ON COLUMN public.strava_connections.athlete_profile_image IS 'URL de l''image de profil Strava';
```

#### Migration 2: Corriger la contrainte unique (optionnel mais recommandé)

Copiez et exécutez le contenu de `supabase/migration_fix_activity_constraint.sql` :

```sql
-- Supprimer la contrainte anonyme si elle existe
ALTER TABLE public.activity_snapshots
DROP CONSTRAINT IF EXISTS activity_snapshots_user_id_strava_activity_id_key;

-- Recréer la contrainte avec un nom explicite
ALTER TABLE public.activity_snapshots
ADD CONSTRAINT activity_snapshots_user_activity_unique
UNIQUE (user_id, strava_activity_id);
```

### Étape 2: Mettre à jour le code

Le code a déjà été mis à jour pour utiliser ces nouvelles colonnes. Assurez-vous de:

1. Pull les dernières modifications du code
2. Redémarrer votre serveur de développement:

```bash
npm run dev
```

### Étape 3: Reconnexion Strava (pour les utilisateurs existants)

Les utilisateurs qui ont déjà connecté leur compte Strava devront se **reconnecter** pour que leur nom et photo de profil soient affichés:

1. Allez sur le dashboard
2. Dans la section "Connexion Strava", vous verrez:
   - 🟢 "Connecté à Strava"
   - Un message : "Reconnectez-vous à Strava pour afficher votre profil"
   - Un bouton "Déconnecter Strava" en haut à droite

3. **Option A - Déconnexion/Reconnexion** :
   - Cliquez sur "Déconnecter Strava"
   - Confirmez la déconnexion
   - Cliquez sur "Connecter mon compte Strava"
   - Autorisez à nouveau l'accès sur Strava

4. **Option B - Reconnexion directe** :
   - Cliquez sur le bouton "Reconnecter à Strava" (affiché si le profil n'est pas complet)
   - Autorisez à nouveau l'accès sur Strava

**Note**: Les nouvelles connexions stockeront automatiquement ces informations.

### Étape 4: Vérifier le fonctionnement

1. Connectez-vous à votre application
2. Allez sur le dashboard
3. Dans la section "Connexion Strava", vous devriez maintenant voir:
   - Votre photo de profil Strava (rond avec bordure orange)
   - Votre nom complet (prénom + nom)
   - L'Athlete ID

## Pour les nouvelles installations

Si vous installez Run&Roast pour la première fois:

1. **Utilisez directement** `supabase/schema.sql` (déjà mis à jour)
2. **N'exécutez PAS** la migration `migration_add_athlete_info.sql`
3. Le schéma principal inclut déjà ces colonnes

## Fonctionnalités ajoutées

### Dashboard amélioré

La section "Connexion Strava" affiche maintenant:

```
┌─────────────────────────────────────────┐
│ 🟢 Connecté à Strava                    │
│                                         │
│  [Photo]  Jean Dupont                  │
│           Athlete ID: 12345678         │
│                                         │
│  [Synchroniser mes activités]          │
└─────────────────────────────────────────┘
```

### Activités récentes

La nouvelle section "Mes dernières activités" affiche les 3 dernières activités synchronisées:

```
┌─────────────────────────────────────────┐
│ 🏃 Run                                  │
│ Lundi 1 janvier 2025 à 08:30          │
│                                         │
│ Distance: 10.50 km                     │
│ Temps: 52m                             │
│ Dénivelé: 120 m                        │
└─────────────────────────────────────────┘
```

## Rollback (si nécessaire)

Pour annuler la migration:

```sql
ALTER TABLE public.strava_connections
DROP COLUMN IF EXISTS athlete_firstname,
DROP COLUMN IF EXISTS athlete_lastname,
DROP COLUMN IF EXISTS athlete_profile_image;
```

Puis revertez les modifications dans le code.

## Support

En cas de problème:
1. Vérifiez que la migration a bien été appliquée
2. Vérifiez les logs Supabase
3. Vérifiez la console du navigateur pour les erreurs
4. Assurez-vous que les types TypeScript sont à jour
