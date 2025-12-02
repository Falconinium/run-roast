# 📚 Index de la documentation - Run&Roast

Guide complet de navigation dans toute la documentation du projet.

## 🚀 Par où commencer ?

### Nouveau sur le projet ?
1. **[README.md](README.md)** - Vue d'ensemble du projet
2. **[QUICKSTART.md](QUICKSTART.md)** - Guide de démarrage rapide
3. **[SETUP.md](SETUP.md)** - Configuration détaillée

### Vous avez un problème ?
1. **[QUICK_FIX_GUIDE.md](QUICK_FIX_GUIDE.md)** - Solution rapide (3 étapes)
2. **[TROUBLESHOOTING.md](TROUBLESHOOTING.md)** - Guide complet de dépannage
3. **[DEBUG_NO_ACTIVITIES.md](DEBUG_NO_ACTIVITIES.md)** - Debug des activités invisibles

### Vous voulez comprendre l'architecture ?
1. **[POLICY_ARCHITECTURE.md](POLICY_ARCHITECTURE.md)** - Architecture des RLS policies
2. **[RLS_POLICIES_EXPLAINED.md](RLS_POLICIES_EXPLAINED.md)** - Explication détaillée des policies
3. **[FIXES_SUMMARY.md](FIXES_SUMMARY.md)** - Résumé des corrections

---

## 📖 Documentation par catégorie

### 🏁 Démarrage

| Document | Description | Public cible |
|----------|-------------|--------------|
| [README.md](README.md) | Vue d'ensemble, installation, utilisation | Tous |
| [QUICKSTART.md](QUICKSTART.md) | Guide de démarrage rapide (migrations, setup) | Nouveaux utilisateurs |
| [SETUP.md](SETUP.md) | Configuration complète (Supabase, Strava, ENV) | Développeurs |
| [ARBORESCENCE.md](ARBORESCENCE.md) | Structure du projet | Développeurs |

### 🔧 Dépannage

| Document | Description | Cas d'usage |
|----------|-------------|-------------|
| [QUICK_FIX_GUIDE.md](QUICK_FIX_GUIDE.md) | Solution en 3 étapes | Problème critique, besoin urgent |
| [TROUBLESHOOTING.md](TROUBLESHOOTING.md) | Guide complet avec diagnostic | Problèmes divers, debug approfondi |
| [DEBUG_NO_ACTIVITIES.md](DEBUG_NO_ACTIVITIES.md) | Debug activités invisibles | Activités synchro OK mais invisibles |

### 🏗️ Architecture technique

| Document | Description | Public cible |
|----------|-------------|--------------|
| [POLICY_ARCHITECTURE.md](POLICY_ARCHITECTURE.md) | Architecture et flux des RLS policies | Développeurs, DBA |
| [RLS_POLICIES_EXPLAINED.md](RLS_POLICIES_EXPLAINED.md) | Explication des policies de sécurité | Développeurs |
| [FIXES_SUMMARY.md](FIXES_SUMMARY.md) | Résumé de toutes les corrections | Tous |

### 📜 Scripts SQL

| Fichier | Description | Utilisation |
|---------|-------------|-------------|
| [supabase/schema.sql](supabase/schema.sql) | Schema complet de la DB | Référence, installation initiale |
| [supabase/fix_all_policies.sql](supabase/fix_all_policies.sql) | **Correction de toutes les policies** ⭐ | **À EXÉCUTER** si problèmes |
| [supabase/migration_add_athlete_info.sql](supabase/migration_add_athlete_info.sql) | Ajout colonnes athlete | Migration 1 |
| [supabase/migration_fix_activity_constraint.sql](supabase/migration_fix_activity_constraint.sql) | Fix contrainte unique | Migration 2 (optionnel) |

---

## 🎯 Par problème spécifique

### "Activities Count: 0" dans /debug/activities

➡️ **Documents à consulter** :
1. [QUICK_FIX_GUIDE.md](QUICK_FIX_GUIDE.md) - Section "Problème: Activities Count: 0"
2. [supabase/fix_all_policies.sql](supabase/fix_all_policies.sql) - À exécuter
3. [DEBUG_NO_ACTIVITIES.md](DEBUG_NO_ACTIVITIES.md) - Debug complet

### "infinite recursion detected"

➡️ **Documents à consulter** :
1. [QUICK_FIX_GUIDE.md](QUICK_FIX_GUIDE.md) - Section "Problème: infinite recursion"
2. [RLS_POLICIES_EXPLAINED.md](RLS_POLICIES_EXPLAINED.md) - Section "Récursion infinie"
3. [POLICY_ARCHITECTURE.md](POLICY_ARCHITECTURE.md) - Section "challenge_members"

### "Failed to store activities"

➡️ **Documents à consulter** :
1. [TROUBLESHOOTING.md](TROUBLESHOOTING.md) - Section "Failed to store activities"
2. [QUICKSTART.md](QUICKSTART.md) - Migration 1 (colonnes athlete)
3. Console navigateur (F12) pour voir les détails

### Nom et photo manquants

➡️ **Documents à consulter** :
1. [QUICKSTART.md](QUICKSTART.md) - Section "Je ne vois pas mon nom ni ma photo"
2. [TROUBLESHOOTING.md](TROUBLESHOOTING.md) - Section correspondante
3. Solution : Se reconnecter à Strava

### Activités synchronisées mais invisibles

➡️ **Documents à consulter** :
1. [DEBUG_NO_ACTIVITIES.md](DEBUG_NO_ACTIVITIES.md) - Guide complet
2. [QUICK_FIX_GUIDE.md](QUICK_FIX_GUIDE.md) - Solution rapide
3. [supabase/fix_all_policies.sql](supabase/fix_all_policies.sql) - À exécuter

---

## 🔍 Par type de lecteur

### Utilisateur final (juste utiliser l'app)

1. [README.md](README.md) - Comprendre le projet
2. [QUICKSTART.md](QUICKSTART.md) - Démarrer rapidement
3. [QUICK_FIX_GUIDE.md](QUICK_FIX_GUIDE.md) - Si problème

### Développeur (contribuer au projet)

1. [README.md](README.md) - Vue d'ensemble
2. [SETUP.md](SETUP.md) - Configuration complète
3. [ARBORESCENCE.md](ARBORESCENCE.md) - Structure du code
4. [POLICY_ARCHITECTURE.md](POLICY_ARCHITECTURE.md) - Architecture RLS
5. [TROUBLESHOOTING.md](TROUBLESHOOTING.md) - Debug approfondi

### DevOps / Admin DB

1. [supabase/schema.sql](supabase/schema.sql) - Schema complet
2. [RLS_POLICIES_EXPLAINED.md](RLS_POLICIES_EXPLAINED.md) - Policies détaillées
3. [POLICY_ARCHITECTURE.md](POLICY_ARCHITECTURE.md) - Architecture et performance
4. [TROUBLESHOOTING.md](TROUBLESHOOTING.md) - Commandes SQL utiles

### QA / Testeur

1. [TROUBLESHOOTING.md](TROUBLESHOOTING.md) - Tous les problèmes connus
2. [DEBUG_NO_ACTIVITIES.md](DEBUG_NO_ACTIVITIES.md) - Page de debug
3. [QUICK_FIX_GUIDE.md](QUICK_FIX_GUIDE.md) - Vérifications rapides

---

## 📊 Matrice de couverture

### Problèmes couverts

| Problème | Quick Fix | Troubleshooting | Debug Activities | Policies Explained |
|----------|-----------|-----------------|------------------|-------------------|
| Activities invisibles | ✅ | ✅ | ✅ | ✅ |
| Récursion infinie | ✅ | ✅ | ❌ | ✅ |
| Failed to store | ✅ | ✅ | ❌ | ❌ |
| Nom/photo manquants | ✅ | ✅ | ❌ | ❌ |
| Performance RLS | ❌ | ✅ | ❌ | ✅ |

### Sujets couverts

| Sujet | README | Setup | Architecture | RLS Explained |
|-------|--------|-------|--------------|---------------|
| Installation | ✅ | ✅ | ❌ | ❌ |
| Configuration | ✅ | ✅ | ❌ | ❌ |
| RLS Policies | ❌ | ❌ | ✅ | ✅ |
| Architecture DB | ❌ | ❌ | ✅ | ✅ |
| Strava OAuth | ✅ | ✅ | ❌ | ❌ |

---

## 🗺️ Plan de lecture recommandé

### Parcours 1 : Installation de zéro

1. **[README.md](README.md)** (10 min)
   - Comprendre le projet
   - Prérequis

2. **[SETUP.md](SETUP.md)** (30 min)
   - Configuration Supabase
   - Configuration Strava
   - Variables d'environnement

3. **[QUICKSTART.md](QUICKSTART.md)** (15 min)
   - Migrations SQL
   - Connexion Strava
   - Test de synchronisation

4. **Si problème** → [TROUBLESHOOTING.md](TROUBLESHOOTING.md)

### Parcours 2 : Résoudre un problème urgent

1. **[QUICK_FIX_GUIDE.md](QUICK_FIX_GUIDE.md)** (5 min)
   - Solution rapide en 3 étapes

2. **Si ça ne marche pas** → [TROUBLESHOOTING.md](TROUBLESHOOTING.md) (20 min)
   - Diagnostic approfondi
   - Tests SQL

3. **Si activités invisibles** → [DEBUG_NO_ACTIVITIES.md](DEBUG_NO_ACTIVITIES.md) (10 min)
   - Page de debug
   - Vérifications RLS

### Parcours 3 : Comprendre l'architecture

1. **[FIXES_SUMMARY.md](FIXES_SUMMARY.md)** (10 min)
   - Qu'est-ce qui a été corrigé et pourquoi

2. **[RLS_POLICIES_EXPLAINED.md](RLS_POLICIES_EXPLAINED.md)** (20 min)
   - Problèmes des anciennes policies
   - Solutions appliquées

3. **[POLICY_ARCHITECTURE.md](POLICY_ARCHITECTURE.md)** (30 min)
   - Architecture complète
   - Flux de données
   - Performance

---

## 📝 Glossaire

| Terme | Définition | Document de référence |
|-------|------------|----------------------|
| RLS | Row Level Security - Sécurité au niveau des lignes dans PostgreSQL | [RLS_POLICIES_EXPLAINED.md](RLS_POLICIES_EXPLAINED.md) |
| Policy | Règle de sécurité appliquée à chaque requête SQL | [POLICY_ARCHITECTURE.md](POLICY_ARCHITECTURE.md) |
| Récursion | Quand une policy interroge la table qu'elle protège | [RLS_POLICIES_EXPLAINED.md](RLS_POLICIES_EXPLAINED.md) |
| Activity snapshot | Copie d'une activité Strava à un instant T | [README.md](README.md) |
| Challenge member | Membre participant à un challenge | [README.md](README.md) |
| Supabase | Backend-as-a-Service (PostgreSQL + Auth) | [SETUP.md](SETUP.md) |

---

## 🔗 Liens externes

### Documentation officielle

- [Supabase Docs](https://supabase.com/docs)
- [Supabase RLS Guide](https://supabase.com/docs/guides/auth/row-level-security)
- [PostgreSQL RLS](https://www.postgresql.org/docs/current/ddl-rowsecurity.html)
- [Strava API](https://developers.strava.com/)
- [Next.js Docs](https://nextjs.org/docs)

### Outils utiles

- [Supabase SQL Editor](https://app.supabase.com) - Exécuter les scripts SQL
- [Strava API Settings](https://www.strava.com/settings/api) - Gérer l'application Strava
- Chrome DevTools (F12) - Debug navigateur

---

## 📅 Dernière mise à jour

- **Version** : 1.0
- **Date** : Décembre 2025
- **Auteur** : Claude Code
- **Modifications** : Création de la documentation complète

---

## ✅ Checklist de documentation

Pour les contributeurs, vérifier que :

- [ ] Tous les liens internes fonctionnent
- [ ] Tous les fichiers mentionnés existent
- [ ] Les commandes SQL sont testées
- [ ] Les exemples de code sont valides
- [ ] Les screenshots sont à jour (si présents)
- [ ] Le glossaire est complet
- [ ] Les parcours de lecture sont cohérents

---

**Astuce** : Utilisez la fonction de recherche de votre éditeur (Ctrl+F / Cmd+F) pour trouver rapidement un mot-clé dans cet index !
