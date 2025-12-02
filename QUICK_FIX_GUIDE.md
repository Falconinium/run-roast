# 🚀 Guide de correction rapide - Run&Roast

## ⚡ TL;DR - Solution en 3 étapes

### Étape 1 : Appliquer le fix SQL (5 min)

1. Ouvrez **Supabase SQL Editor**
2. Copiez-collez le contenu de **`supabase/fix_all_policies.sql`**
3. Cliquez sur **"Run"**

✅ Vous devriez voir : "Success. No rows returned"

### Étape 2 : Tester (2 min)

1. Allez sur http://localhost:3000/dashboard
2. Cliquez sur **"Synchroniser mes activités"**
3. Vérifiez que les activités s'affichent

✅ Vous devriez voir vos 3 dernières activités

### Étape 3 : Vérifier (1 min)

Allez sur http://localhost:3000/debug/activities

✅ Vous devriez voir :
- Profile ID = Auth User ID ✅
- Activities Count > 0 ✅
- Liste de vos activités ✅

---

## ❌ Ça ne fonctionne toujours pas ?

### Problème : "Activities Count: 0"

➡️ Les policies ne sont pas appliquées correctement

**Solution** :
```sql
-- Vérifier les policies actives
SELECT tablename, policyname, cmd
FROM pg_policies
WHERE schemaname = 'public'
AND tablename = 'activity_snapshots';
```

Vous devriez voir **4 policies** :
1. Users can insert their own activities (INSERT)
2. Users can update their own activities (UPDATE)
3. Users can view their own activities (SELECT)
4. Users can view challenge members activities (SELECT)

Si ce n'est pas le cas → Réexécutez `fix_all_policies.sql`

### Problème : "infinite recursion detected"

➡️ Les anciennes policies récursives sont encore actives

**Solution** :
```sql
-- Supprimer TOUTES les policies de challenge_members
DO $$
DECLARE pol RECORD;
BEGIN
  FOR pol IN
    SELECT policyname
    FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'challenge_members'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.challenge_members', pol.policyname);
  END LOOP;
END $$;

-- Puis réexécutez fix_all_policies.sql
```

### Problème : Nom et photo manquants

➡️ Connexion Strava avant la migration

**Solution** : Se déconnecter et se reconnecter à Strava

---

## 🔍 Vérifications rapides

### Vérifier RLS est activé
```sql
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN ('activity_snapshots', 'challenge_members');
```
Résultat attendu : `rowsecurity = true` pour les 2 tables

### Vérifier les activités dans la DB
```sql
SELECT COUNT(*) FROM public.activity_snapshots;
```
Si 0 → Vous devez synchroniser vos activités Strava

### Vérifier votre connexion Strava
```sql
SELECT
  athlete_firstname,
  athlete_lastname,
  expires_at > NOW() as token_valid
FROM public.strava_connections
WHERE user_id = auth.uid();
```
Si `token_valid = false` → Reconnectez-vous à Strava

---

## 📋 Checklist complète

- [ ] ✅ `fix_all_policies.sql` exécuté sans erreur
- [ ] ✅ 4 policies sur `activity_snapshots`
- [ ] ✅ 4 policies sur `challenge_members`
- [ ] ✅ Strava connecté (nom et photo visibles)
- [ ] ✅ Activités synchronisées
- [ ] ✅ Activités visibles sur le dashboard
- [ ] ✅ `/debug/activities` montre Activities Count > 0
- [ ] ✅ Aucune erreur "infinite recursion"

---

## 🆘 Besoin d'aide ?

### Consultez la documentation complète

- **[TROUBLESHOOTING.md](TROUBLESHOOTING.md)** - Guide complet avec tous les problèmes
- **[RLS_POLICIES_EXPLAINED.md](RLS_POLICIES_EXPLAINED.md)** - Explication technique
- **[POLICY_ARCHITECTURE.md](POLICY_ARCHITECTURE.md)** - Architecture des policies

### Debug pas à pas

1. **Logs du terminal** : `npm run dev` - Cherchez les erreurs
2. **Console navigateur** : F12 → Onglet Console - Cherchez les erreurs
3. **Page de debug** : http://localhost:3000/debug/activities
4. **Supabase logs** : Dans Supabase → Logs → PostgREST logs

---

## 💡 Comprendre le problème

### Pourquoi ce fix est nécessaire ?

**Avant** :
- La policy `challenge_members` était **récursive**
- Elle interrogeait `challenge_members` pour vérifier l'accès
- Cela créait une boucle infinie → ❌ Erreur

**Après** :
- La policy permet à tous les users de voir les membres
- Pas de récursion → ✅ Fonctionne
- Le filtrage peut être fait côté application si nécessaire

### Schéma simplifié

```
AVANT (❌ Récursif)
User → Lit challenge_members
     → Policy vérifie dans challenge_members
     → Policy vérifie dans challenge_members
     → Policy vérifie dans challenge_members
     → ... INFINI

APRÈS (✅ Direct)
User → Lit challenge_members
     → Policy autorise directement
     → Résultat retourné
```

---

## 📄 Fichiers importants

| Fichier | Utilité |
|---------|---------|
| `supabase/fix_all_policies.sql` | ⭐ **À EXÉCUTER** - Corrige tout |
| `TROUBLESHOOTING.md` | Guide complet de dépannage |
| `app/debug/activities/page.tsx` | Page de debug `/debug/activities` |

---

## 🎯 Commande unique pour tout vérifier

```sql
-- À exécuter dans Supabase SQL Editor
-- Affiche un résumé complet

SELECT
  'Policies activity_snapshots' as check_name,
  COUNT(*)::text as result
FROM pg_policies
WHERE schemaname = 'public' AND tablename = 'activity_snapshots'

UNION ALL

SELECT
  'Policies challenge_members',
  COUNT(*)::text
FROM pg_policies
WHERE schemaname = 'public' AND tablename = 'challenge_members'

UNION ALL

SELECT
  'Total activities',
  COUNT(*)::text
FROM public.activity_snapshots

UNION ALL

SELECT
  'Strava connections',
  COUNT(*)::text
FROM public.strava_connections

UNION ALL

SELECT
  'Challenges',
  COUNT(*)::text
FROM public.challenges;
```

**Résultat attendu** :
```
check_name                    | result
------------------------------|--------
Policies activity_snapshots   | 4
Policies challenge_members    | 4
Total activities              | 26  (ou votre nombre)
Strava connections            | 1
Challenges                    | 0+  (dépend de vous)
```

Si les policies ne sont pas à 4 → Exécutez `fix_all_policies.sql`

---

**Version** : 1.0 - Décembre 2025
**Testé sur** : PostgreSQL 15, Supabase, Next.js 14
