# RLS Policies - Explication et Corrections

## 🔴 Problèmes identifiés

### 1. Récursion infinie dans `challenge_members`

**Ancienne policy (PROBLÉMATIQUE)** :
```sql
CREATE POLICY "Members can view members of their challenges"
  ON public.challenge_members FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.challenge_members cm
      WHERE cm.challenge_id = challenge_id AND cm.user_id = auth.uid()
    )
  );
```

**Pourquoi c'est un problème** :
- La policy fait une requête sur `challenge_members` pour vérifier l'accès
- Cette requête déclenche à nouveau la même policy
- Résultat : **boucle infinie** → erreur ou performance dégradée

**Solution** :
```sql
CREATE POLICY "Members can view challenge members"
  ON public.challenge_members FOR SELECT
  USING (true);
```

- Permet à tous les utilisateurs authentifiés de voir les membres
- Pas de récursion
- Le filtrage peut être fait côté application si nécessaire

### 2. Policy `activity_snapshots` trop restrictive

**Problème** :
- Les utilisateurs ne pouvaient pas voir leurs propres activités
- La policy combinée était trop complexe et inefficace

**Solution** :
- Séparer en **2 policies distinctes** :
  1. Une pour voir ses propres activités (simple et rapide)
  2. Une pour voir les activités des membres des mêmes challenges

## ✅ Solutions appliquées

### Policy `challenge_members`

| Action | Policy | Description |
|--------|--------|-------------|
| **SELECT** | `Members can view challenge members` | Tous les utilisateurs peuvent voir les membres (pas de récursion) |
| **INSERT** | `Users can join challenges as themselves` | Un utilisateur ne peut s'ajouter que lui-même |
| **DELETE** | `Members can leave challenges they joined` | Un membre peut quitter (sauf s'il est owner) |
| **UPDATE** | `Owners can update members` | Seul le propriétaire du challenge peut modifier les rôles |

### Policy `activity_snapshots`

| Action | Policy | Description |
|--------|--------|-------------|
| **SELECT (1)** | `Users can view their own activities` | Voir ses propres activités (rapide) |
| **SELECT (2)** | `Users can view challenge members activities` | Voir les activités des membres des mêmes challenges |
| **INSERT** | `Users can insert their own activities` | Ne peut créer que ses propres activités |
| **UPDATE** | `Users can update their own activities` | Ne peut modifier que ses propres activités |

## 🚀 Comment appliquer les corrections

### Option 1 : Utiliser le script complet (RECOMMANDÉ)

```bash
# 1. Ouvrez Supabase SQL Editor
# 2. Copiez-collez le contenu de ce fichier :
cat supabase/fix_all_policies.sql

# 3. Exécutez le script
```

Le script :
- ✅ Supprime toutes les anciennes policies problématiques
- ✅ Crée les nouvelles policies corrigées
- ✅ Affiche un rapport de vérification

### Option 2 : Vérifier manuellement

```sql
-- Vérifier les policies actuelles
SELECT tablename, policyname, cmd, permissive
FROM pg_policies
WHERE schemaname = 'public'
AND tablename IN ('challenge_members', 'activity_snapshots')
ORDER BY tablename, cmd, policyname;
```

**Ce que vous devriez voir** :

```
tablename            | policyname                                  | cmd    | permissive
---------------------|---------------------------------------------|--------|------------
activity_snapshots   | Users can insert their own activities       | INSERT | permissive
activity_snapshots   | Users can update their own activities       | UPDATE | permissive
activity_snapshots   | Users can view challenge members activities | SELECT | permissive
activity_snapshots   | Users can view their own activities         | SELECT | permissive
challenge_members    | Members can leave challenges they joined    | DELETE | permissive
challenge_members    | Members can view challenge members          | SELECT | permissive
challenge_members    | Owners can update members                   | UPDATE | permissive
challenge_members    | Users can join challenges as themselves     | INSERT | permissive
```

## 📋 Checklist de vérification

Après avoir appliqué les corrections :

- [ ] Les policies sont créées sans erreur
- [ ] Vous pouvez synchroniser vos activités Strava
- [ ] Vos activités s'affichent sur le dashboard
- [ ] Vous pouvez voir les activités des membres de vos challenges
- [ ] Vous pouvez créer et rejoindre des challenges
- [ ] La page `/debug/activities` montre vos activités

## 🐛 Debug

### Les activités ne s'affichent pas

1. Allez sur http://localhost:3000/debug/activities
2. Vérifiez :
   - ✅ Profile ID et Auth User ID correspondent
   - ✅ Activities Count > 0
   - ❌ Si Activities Count = 0 → Les policies ne sont pas appliquées

### Erreur "infinite recursion detected"

➡️ La policy `challenge_members` est encore récursive
➡️ Appliquez `fix_all_policies.sql`

### Les activités sont synchronisées mais invisibles

➡️ Problème de RLS policies
➡️ Appliquez `fix_all_policies.sql`

## 📚 Références

- [fix_all_policies.sql](supabase/fix_all_policies.sql) - Script de correction complet
- [DEBUG_NO_ACTIVITIES.md](DEBUG_NO_ACTIVITIES.md) - Guide de debug détaillé
- [QUICKSTART.md](QUICKSTART.md) - Guide de démarrage rapide
- [Supabase RLS Documentation](https://supabase.com/docs/guides/auth/row-level-security)

## 🔐 Principes de sécurité respectés

1. **Least Privilege** : Les utilisateurs ne peuvent modifier que leurs propres données
2. **Isolation** : Les données privées ne sont visibles qu'aux membres des challenges
3. **No Recursion** : Les policies n'interrogent pas la table qu'elles protègent
4. **Performance** : Les policies simples sont évaluées en premier

## ⚠️ À NE PAS FAIRE

- ❌ Ne pas désactiver RLS en production (`ALTER TABLE ... DISABLE ROW LEVEL SECURITY`)
- ❌ Ne pas utiliser `USING (true)` pour INSERT/UPDATE/DELETE (uniquement SELECT si nécessaire)
- ❌ Ne pas créer de policies récursives (qui interrogent la même table)
- ❌ Ne pas avoir trop de policies sur la même table (regrouper quand possible)
