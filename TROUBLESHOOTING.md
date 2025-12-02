# 🆘 Troubleshooting - Run&Roast

Guide rapide pour résoudre les problèmes courants.

## 🔍 Diagnostic rapide

### Symptôme → Solution

| Problème | Cause probable | Solution rapide |
|----------|---------------|-----------------|
| "No activities found" après sync | Pas d'activités dans les 90 derniers jours | Faites du sport ! 🏃 |
| "Activities synced" mais rien ne s'affiche | RLS policies bloquent l'accès | Appliquer [fix_all_policies.sql](supabase/fix_all_policies.sql) |
| "Failed to store activities" | Colonnes manquantes dans la DB | Appliquer migrations 1 et 2 du [QUICKSTART.md](QUICKSTART.md) |
| "infinite recursion detected" | Policy récursive dans `challenge_members` | Appliquer [fix_all_policies.sql](supabase/fix_all_policies.sql) |
| Nom et photo manquants | Connexion Strava avant la migration | Se reconnecter à Strava |
| "Activities Count: 0" dans /debug/activities | RLS policies incorrectes | Appliquer [fix_all_policies.sql](supabase/fix_all_policies.sql) |

## 🚨 Problèmes critiques

### 1. Les activités ne s'affichent pas (le plus fréquent)

**Symptômes** :
- "Successfully synced 26 activities" ✅
- Section "Mes dernières activités" vide ❌

**Diagnostic** :
```bash
# Allez sur la page de debug
open http://localhost:3000/debug/activities
```

**Ce que vous devriez voir** :
- ✅ Profile ID = Auth User ID
- ✅ Activities Count > 0
- ✅ Liste des activités

**Si Activities Count = 0** :
➡️ **C'est un problème de RLS policies**

**Solution** :
1. Ouvrez Supabase SQL Editor
2. Copiez-collez le contenu de `supabase/fix_all_policies.sql`
3. Exécutez le script
4. Rafraîchissez le dashboard

### 2. Erreur "infinite recursion detected"

**Cause** :
Policy récursive dans `challenge_members` qui s'interroge elle-même.

**Solution** :
Appliquer [fix_all_policies.sql](supabase/fix_all_policies.sql)

### 3. "Failed to store activities"

**Causes possibles** :

#### A. Colonnes manquantes dans `strava_connections`
```sql
-- Vérifier dans Supabase Table Editor
-- Colonnes requises : athlete_firstname, athlete_lastname, athlete_profile_image
```

**Solution** :
```sql
ALTER TABLE public.strava_connections
ADD COLUMN IF NOT EXISTS athlete_firstname TEXT,
ADD COLUMN IF NOT EXISTS athlete_lastname TEXT,
ADD COLUMN IF NOT EXISTS athlete_profile_image TEXT;
```

#### B. Contrainte de duplicatas
**Solution** : Le code gère maintenant automatiquement les duplicatas. Si le problème persiste :
```sql
-- Voir Migration 2 dans QUICKSTART.md
```

## 🔧 Commandes utiles

### Vérifier les policies RLS

```sql
-- Voir toutes les policies
SELECT tablename, policyname, cmd, permissive
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, cmd;
```

### Vérifier les activités dans la DB

```sql
-- Compter les activités par utilisateur
SELECT user_id, COUNT(*) as activity_count
FROM public.activity_snapshots
GROUP BY user_id;
```

### Vérifier les connexions Strava

```sql
-- Voir les connexions Strava
SELECT
  user_id,
  athlete_firstname,
  athlete_lastname,
  expires_at > NOW() as token_valid
FROM public.strava_connections;
```

### Nettoyer les anciennes policies (si besoin)

```sql
-- Supprimer TOUTES les policies d'une table (DANGER !)
-- À utiliser uniquement si vous allez les recréer immédiatement
DO $$
DECLARE
  pol RECORD;
BEGIN
  FOR pol IN
    SELECT policyname
    FROM pg_policies
    WHERE schemaname = 'public'
    AND tablename = 'activity_snapshots'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.activity_snapshots', pol.policyname);
  END LOOP;
END $$;
```

## 🧪 Tests de diagnostic

### Test 1 : Vérifier l'authentification

```bash
# Dans la console du navigateur (F12)
const { data: { user } } = await supabase.auth.getUser()
console.log('User ID:', user?.id)
```

### Test 2 : Tester la requête d'activités

```bash
# Dans la console du navigateur
const { data, error } = await supabase
  .from('activity_snapshots')
  .select('*')
  .limit(1)

console.log('Data:', data)
console.log('Error:', error)
```

Si `error` contient un message sur les policies → RLS problem

### Test 3 : Vérifier RLS est activé

```sql
-- Dans Supabase SQL Editor
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN ('activity_snapshots', 'challenge_members', 'profiles');
```

Devrait retourner `rowsecurity = true` pour toutes les tables.

## 🔄 Procédure de réinitialisation complète

**⚠️ DANGER : Cela supprime toutes vos données !**

Si vous voulez repartir de zéro :

```sql
-- 1. Supprimer toutes les données
TRUNCATE public.activity_snapshots CASCADE;
TRUNCATE public.challenge_members CASCADE;
TRUNCATE public.challenges CASCADE;
TRUNCATE public.strava_connections CASCADE;
-- NE PAS TRUNCATE profiles (sinon vous perdez votre compte)

-- 2. Réappliquer le schema complet
-- Copiez-collez supabase/schema.sql

-- 3. Appliquer les corrections
-- Copiez-collez supabase/fix_all_policies.sql
```

## 📊 Vérification post-installation

Checklist pour vérifier que tout fonctionne :

- [ ] ✅ Connexion Strava réussie
- [ ] ✅ Nom et photo s'affichent dans le header
- [ ] ✅ Synchronisation des activités réussie
- [ ] ✅ Les activités s'affichent sur le dashboard
- [ ] ✅ `/debug/activities` montre les activités
- [ ] ✅ Création de challenge fonctionne
- [ ] ✅ Rejoindre un challenge fonctionne
- [ ] ✅ Les activités des membres du challenge sont visibles

## 📞 Obtenir de l'aide

Si rien ne fonctionne après avoir suivi ce guide :

1. **Collectez les informations** :
   - Screenshot de `/debug/activities`
   - Logs de la console (F12 → Console)
   - Message d'erreur exact

2. **Vérifiez la documentation** :
   - [RLS_POLICIES_EXPLAINED.md](RLS_POLICIES_EXPLAINED.md) - Explication des policies
   - [DEBUG_NO_ACTIVITIES.md](DEBUG_NO_ACTIVITIES.md) - Debug des activités
   - [QUICKSTART.md](QUICKSTART.md) - Guide de démarrage

3. **Derniers recours** :
   - Désactiver temporairement RLS (⚠️ EN LOCAL UNIQUEMENT) :
     ```sql
     ALTER TABLE public.activity_snapshots DISABLE ROW LEVEL SECURITY;
     ```
   - Si ça fonctionne → Le problème vient des policies
   - **RÉACTIVER RLS après le test !**
     ```sql
     ALTER TABLE public.activity_snapshots ENABLE ROW LEVEL SECURITY;
     ```

## 🎯 Checklist de migration

Pour ceux qui migrent depuis une version antérieure :

- [ ] Migration 1 : Colonnes athlete dans `strava_connections`
- [ ] Migration 2 : Contrainte unique (optionnel)
- [ ] Migration 3 : Fix des RLS policies (OBLIGATOIRE)
- [ ] Reconnexion à Strava
- [ ] Test de synchronisation
- [ ] Vérification sur `/debug/activities`

## 💡 Astuces

### Voir les requêtes SQL exécutées

Dans votre code Next.js, ajoutez temporairement :

```typescript
const { data, error } = await supabase
  .from('activity_snapshots')
  .select('*')

console.log('Supabase request:', {
  data,
  error,
  count: data?.length
})
```

### Forcer la reconnexion Strava

1. Supprimer la connexion dans Supabase :
   ```sql
   DELETE FROM public.strava_connections WHERE user_id = 'YOUR_USER_ID';
   ```
2. Aller sur `/strava/connect`
3. Réautoriser l'application

### Vider le cache Next.js

```bash
rm -rf .next
npm run dev
```
