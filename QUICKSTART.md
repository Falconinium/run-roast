# Guide de démarrage rapide - Run&Roast

## 🚀 Actions à faire maintenant

### 1. Appliquer les migrations SQL

Ouvrez Supabase SQL Editor et exécutez ces 2 migrations :

#### Migration 1 : Profil athlète
```sql
ALTER TABLE public.strava_connections
ADD COLUMN IF NOT EXISTS athlete_firstname TEXT,
ADD COLUMN IF NOT EXISTS athlete_lastname TEXT,
ADD COLUMN IF NOT EXISTS athlete_profile_image TEXT;
```

#### Migration 2 : Contrainte unique (OPTIONNEL - non requise avec le nouveau code)
```sql
-- Cette migration est maintenant optionnelle car le code gère
-- manuellement les doublons sans dépendre du nom de la contrainte
ALTER TABLE public.activity_snapshots
DROP CONSTRAINT IF EXISTS activity_snapshots_user_id_strava_activity_id_key;

ALTER TABLE public.activity_snapshots
ADD CONSTRAINT activity_snapshots_user_activity_unique
UNIQUE (user_id, strava_activity_id);
```

**Note** : Vous pouvez sauter cette migration si vous rencontrez des problèmes. Le code synchronise maintenant les activités sans dépendre de cette contrainte spécifique.

#### Migration 3 : Corriger TOUTES les RLS policies (IMPORTANT)

**Utilisez le script complet qui corrige tous les problèmes** :

```bash
# Ouvrez ce fichier dans Supabase SQL Editor et exécutez-le
cat supabase/fix_all_policies.sql
```

Ou copiez-collez le contenu de [supabase/fix_all_policies.sql](supabase/fix_all_policies.sql) dans le SQL Editor de Supabase.

Ce script corrige :
- ✅ Politique récursive dans `challenge_members` (causait des erreurs infinies)
- ✅ Politiques manquantes pour `activity_snapshots`
- ✅ Séparation correcte des permissions (SELECT/INSERT/UPDATE/DELETE)

### 2. Redémarrer le serveur

```bash
npm run dev
```

### 3. Reconnecter Strava

1. Allez sur [http://localhost:3000/dashboard](http://localhost:3000/dashboard)
2. Cliquez sur **"Déconnecter Strava"** (en haut à droite de la section)
3. Confirmez
4. Cliquez sur **"Connecter mon compte Strava"**
5. Autorisez l'accès sur Strava

### 4. Synchroniser vos activités

1. Cliquez sur **"Synchroniser mes activités"**
2. Attendez quelques secondes
3. Vous devriez voir : "Successfully synced X activities"

## ✅ Ce que vous devriez voir

### Section "Connexion Strava"
```
┌─────────────────────────────────────────┐
│ 🟢 Connecté à Strava  [Déconnecter]    │
│                                         │
│  [Photo]  Jean Dupont                  │
│           Athlete ID: 12345678         │
│                                         │
│  [Synchroniser mes activités]          │
└─────────────────────────────────────────┘
```

### Section "Mes dernières activités"
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

## ❌ Problèmes courants

### "Je ne vois pas mon nom ni ma photo"

➡️ Vous devez vous **reconnecter** à Strava pour que ces informations soient récupérées.

### "Failed to store activities"

➡️ **Solution** : Le code a été mis à jour pour gérer ce problème automatiquement. Si vous voyez toujours cette erreur :
1. Vérifiez la console du navigateur (F12) pour voir les détails
2. Cliquez sur "Voir les détails des erreurs" sous le message d'erreur
3. Vérifiez que les colonnes de la table `activity_snapshots` existent bien dans Supabase

### "No activities found"

➡️ Vérifiez que vous avez des activités Strava dans les 90 derniers jours.

### "Aucune activité récente" (alors que la sync a réussi)

➡️ **C'est un problème de RLS policies**. Vous devez appliquer la **Migration 3** (ci-dessus).

**Debug** :
1. Allez sur http://localhost:3000/debug/activities
2. Vérifiez si vos activités sont trouvées
3. Si "Activities Count: 0" → Appliquez la Migration 3
4. Consultez [DEBUG_NO_ACTIVITIES.md](DEBUG_NO_ACTIVITIES.md) pour plus de détails

## 📚 Documentation complète

- **[README.md](README.md)** - Documentation générale
- **[TROUBLESHOOTING.md](TROUBLESHOOTING.md)** - Guide de résolution des problèmes (recommandé)
- **[RLS_POLICIES_EXPLAINED.md](RLS_POLICIES_EXPLAINED.md)** - Explication des policies de sécurité
- **[DEBUG_NO_ACTIVITIES.md](DEBUG_NO_ACTIVITIES.md)** - Debug des activités invisibles
- **[SETUP.md](SETUP.md)** - Configuration complète et avancée

## 🆘 Besoin d'aide ?

### 🔍 Diagnostic rapide

Si vous rencontrez un problème, consultez d'abord **[TROUBLESHOOTING.md](TROUBLESHOOTING.md)** qui contient :
- 📋 Tableau de diagnostic symptôme → solution
- 🔧 Commandes SQL utiles pour vérifier l'état de votre DB
- 🧪 Tests de diagnostic pas à pas
- 🔄 Procédure de réinitialisation si nécessaire

### Étapes de debug recommandées

1. Vérifiez les logs du terminal (`npm run dev`)
2. Vérifiez la console du navigateur (F12)
3. Allez sur [http://localhost:3000/debug/activities](http://localhost:3000/debug/activities)
4. Consultez **[TROUBLESHOOTING.md](TROUBLESHOOTING.md)** pour une aide détaillée
