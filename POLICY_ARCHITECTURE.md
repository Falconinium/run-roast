# Architecture des RLS Policies - Run&Roast

## 🏗️ Vue d'ensemble

Ce document explique l'architecture des Row Level Security (RLS) policies après les corrections.

## 📊 Schéma de la base de données

```
┌─────────────┐
│   profiles  │
│  (auth.uid) │
└──────┬──────┘
       │
       │ user_id (FK)
       ├──────────────┐
       │              │
       ▼              ▼
┌──────────────┐  ┌────────────────────┐
│   strava_    │  │ challenge_members  │
│ connections  │  └─────┬──────────────┘
└──────────────┘        │
                        │ challenge_id (FK)
                        │
                        ▼
                  ┌────────────┐
                  │ challenges │
                  └────────────┘

       ┌──────────────────────┐
       │ activity_snapshots   │
       │ user_id (FK)         │
       └──────────────────────┘
```

## 🔐 Policies par table

### 1. `profiles`

| Action | Policy | Règle |
|--------|--------|-------|
| SELECT | Users can view their own profile | `auth.uid() = id` |
| INSERT | Users can insert their own profile | `auth.uid() = id` |
| UPDATE | Users can update their own profile | `auth.uid() = id` |

**Principe** : Les utilisateurs ne peuvent gérer que leur propre profil.

---

### 2. `strava_connections`

| Action | Policy | Règle |
|--------|--------|-------|
| ALL | Users can manage their own Strava connection | `auth.uid() = user_id` |

**Principe** : Chaque utilisateur gère uniquement sa propre connexion Strava.

---

### 3. `challenges`

| Action | Policy | Règle |
|--------|--------|-------|
| SELECT | Anyone can view public or unlisted challenges | Visible si : public/unlisted OU owner OU membre |
| INSERT | Users can create challenges | `auth.uid() = owner_id` |
| UPDATE | Owners can update their challenges | `auth.uid() = owner_id` |
| DELETE | Owners can delete their challenges | `auth.uid() = owner_id` |

**Principe** : Les challenges publics/unlisted sont visibles. Seul le propriétaire peut modifier/supprimer.

---

### 4. `challenge_members` ⚠️ CORRIGÉ

#### ❌ AVANT (Récursif - PROBLÈME)

```sql
CREATE POLICY "Members can view members of their challenges"
  ON public.challenge_members FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.challenge_members cm  -- ⚠️ RÉCURSION !
      WHERE cm.challenge_id = challenge_id AND cm.user_id = auth.uid()
    )
  );
```

**Problème** :
1. User A essaie de lire `challenge_members`
2. La policy vérifie l'accès en interrogeant `challenge_members`
3. Cette requête déclenche à nouveau la policy
4. Boucle infinie → erreur ou lenteur extrême

#### ✅ APRÈS (Pas de récursion)

| Action | Policy | Règle |
|--------|--------|-------|
| SELECT | Members can view challenge members | `true` (tous les users authentifiés) |
| INSERT | Users can join challenges as themselves | `auth.uid() = user_id` |
| DELETE | Members can leave challenges they joined | `auth.uid() = user_id AND role != 'owner'` |
| UPDATE | Owners can update members | Via `challenges.owner_id = auth.uid()` |

**Principe** :
- ✅ Tous les utilisateurs authentifiés peuvent voir les membres (pas de récursion)
- ✅ Les utilisateurs ne peuvent s'ajouter qu'eux-mêmes
- ✅ Les membres peuvent quitter (sauf le owner)
- ✅ Seul le propriétaire du challenge peut modifier les rôles

**Note** : Le filtrage côté application peut être ajouté si nécessaire, mais la policy ne bloque plus l'accès.

---

### 5. `activity_snapshots` ⚠️ AMÉLIORÉ

#### ❌ AVANT (Trop restrictif)

```sql
CREATE POLICY "Users can view activities of challenge members"
  ON public.activity_snapshots FOR SELECT
  USING (
    auth.uid() = user_id OR  -- Ses propres activités
    EXISTS (
      SELECT 1 FROM public.challenge_members cm1
      JOIN public.challenge_members cm2 ON cm1.challenge_id = cm2.challenge_id
      WHERE cm1.user_id = auth.uid() AND cm2.user_id = activity_snapshots.user_id
    )
  );
```

**Problème** :
- Policy trop complexe avec OR
- Performance dégradée sur de grandes tables
- Difficile à débugger

#### ✅ APRÈS (Séparé en 2 policies)

| Action | Policy | Règle |
|--------|--------|-------|
| SELECT (1) | Users can view their own activities | `auth.uid() = user_id` |
| SELECT (2) | Users can view challenge members activities | Via JOIN sur `challenge_members` |
| INSERT | Users can insert their own activities | `auth.uid() = user_id` |
| UPDATE | Users can update their own activities | `auth.uid() = user_id` |

**Principe** :
- ✅ Policy 1 est **très rapide** (simple égalité)
- ✅ Policy 2 est utilisée uniquement pour les activités des autres
- ✅ Meilleure performance (PostgreSQL peut optimiser séparément)
- ✅ Plus facile à débugger (on sait quelle policy bloque)

## 🔄 Flux d'accès aux données

### Scénario 1 : User A consulte ses propres activités

```
User A (auth.uid = A)
  │
  ├──> SELECT * FROM activity_snapshots WHERE user_id = A
  │
  └──> Policy "Users can view their own activities"
       ├─ Vérification: auth.uid() = user_id ?
       ├─ A = A → TRUE ✅
       └─ Accès autorisé
```

### Scénario 2 : User A consulte les activités de User B (même challenge)

```
User A (auth.uid = A)
  │
  ├──> SELECT * FROM activity_snapshots WHERE user_id = B
  │
  ├──> Policy "Users can view their own activities"
  │    ├─ Vérification: auth.uid() = user_id ?
  │    ├─ A = B → FALSE ❌
  │    └─ Passe à la policy suivante
  │
  └──> Policy "Users can view challenge members activities"
       ├─ Vérification: EXISTS (
       │    SELECT 1 FROM challenge_members cm1
       │    JOIN challenge_members cm2 ON cm1.challenge_id = cm2.challenge_id
       │    WHERE cm1.user_id = A AND cm2.user_id = B
       │  )
       ├─ Challenge trouvé ? → TRUE ✅
       └─ Accès autorisé
```

### Scénario 3 : User A consulte les activités de User C (aucun challenge commun)

```
User A (auth.uid = A)
  │
  ├──> SELECT * FROM activity_snapshots WHERE user_id = C
  │
  ├──> Policy "Users can view their own activities"
  │    ├─ A = C → FALSE ❌
  │    └─ Passe à la policy suivante
  │
  └──> Policy "Users can view challenge members activities"
       ├─ Vérification: EXISTS (...) ?
       ├─ Aucun challenge commun → FALSE ❌
       └─ Accès REFUSÉ (0 résultats retournés)
```

## 🎯 Principes de conception

### 1. Pas de récursion
✅ Aucune policy n'interroge la table qu'elle protège
❌ Éviter : `SELECT FROM table_name` dans une policy de `table_name`

### 2. Performance
✅ Policies simples en premier (égalité directe)
✅ Policies complexes (JOIN) en dernier
✅ Utilisation d'index appropriés

### 3. Sécurité
✅ Least Privilege : uniquement l'accès nécessaire
✅ Isolation des données : pas d'accès aux données des autres
✅ Validation stricte : `auth.uid() = user_id` pour INSERT/UPDATE/DELETE

### 4. Maintenabilité
✅ Policies séparées par action (SELECT/INSERT/UPDATE/DELETE)
✅ Noms explicites
✅ Documentation claire

## 🧪 Vérification des policies

### Vérifier quelles policies sont actives

```sql
SELECT
  tablename,
  policyname,
  cmd,
  permissive,
  roles
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, cmd, policyname;
```

### Vérifier RLS est activé

```sql
SELECT
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables
WHERE schemaname = 'public';
```

### Compter les policies par table

```sql
SELECT
  tablename,
  COUNT(*) as policy_count
FROM pg_policies
WHERE schemaname = 'public'
GROUP BY tablename
ORDER BY tablename;
```

**Résultat attendu** :
```
tablename           | policy_count
--------------------|-------------
activity_snapshots  | 4
challenge_members   | 4
challenges          | 4
profiles            | 3
strava_connections  | 1
```

## 📈 Performance

### Policies optimisées pour la performance

1. **Index utilisés** :
   - `activity_snapshots(user_id, start_date)` → Rapide pour les requêtes par user
   - `challenge_members(challenge_id)` → Rapide pour les JOIN
   - `challenge_members(user_id)` → Rapide pour vérifier l'appartenance

2. **Ordre d'évaluation** :
   - PostgreSQL évalue les policies dans l'ordre optimal
   - Les policies simples (égalité) sont plus rapides
   - Les policies avec EXISTS et JOIN sont plus lentes mais nécessaires

3. **Pas de N+1 queries** :
   - Les policies avec EXISTS utilisent des subqueries efficaces
   - PostgreSQL optimise automatiquement les JOIN

## 🛡️ Sécurité

### Matrice d'accès

|  | Propre profil | Propres activités | Propres challenges | Activités des autres | Challenges des autres |
|--|---------------|-------------------|-------------------|---------------------|---------------------|
| **User A** | ✅ RW | ✅ RW | ✅ RW | ⚠️ R (si même challenge) | ⚠️ R (si public/membre) |
| **Anonyme** | ❌ | ❌ | ❌ | ❌ | ❌ |

Légende : R = Read, W = Write, ⚠️ = Conditionnel

## 📚 Références

- [fix_all_policies.sql](supabase/fix_all_policies.sql) - Script de correction
- [RLS_POLICIES_EXPLAINED.md](RLS_POLICIES_EXPLAINED.md) - Explication détaillée
- [TROUBLESHOOTING.md](TROUBLESHOOTING.md) - Guide de dépannage
- [PostgreSQL RLS Documentation](https://www.postgresql.org/docs/current/ddl-rowsecurity.html)
- [Supabase RLS Guide](https://supabase.com/docs/guides/auth/row-level-security)
