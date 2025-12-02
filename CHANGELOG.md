# Changelog - Run&Roast

## [Non publié] - 2024-12-01

### Ajouté

#### Dashboard
- ✅ **Affichage des 3 dernières activités Strava**
  - Section "Mes dernières activités" sur le dashboard
  - Affichage avec emoji selon le sport (🏃 🚴 🥾 etc.)
  - Détails : distance, temps, dénivelé, date
  - Visible uniquement si Strava est connecté

#### Profil Strava
- ✅ **Photo de profil Strava**
  - Image ronde (64x64px) avec bordure orange
  - Affichée dans la section "Connexion Strava"
- ✅ **Nom complet de l'athlète**
  - Prénom + Nom récupérés depuis Strava
  - Affiché sous la photo de profil
- ✅ **Bouton de déconnexion Strava**
  - Bouton "Déconnecter Strava" en haut à droite de la section
  - Confirmation avant déconnexion
  - Supprime la connexion Strava de la base de données
- ✅ **Bouton de reconnexion**
  - Affiché si les informations du profil sont manquantes
  - Permet de reconnecter pour récupérer nom et photo

### Modifié

#### Base de données
- Ajout de 3 colonnes à `strava_connections`:
  - `athlete_firstname` (TEXT, nullable)
  - `athlete_lastname` (TEXT, nullable)
  - `athlete_profile_image` (TEXT, nullable)
- Amélioration de la contrainte unique sur `activity_snapshots`

#### API Strava
- **Callback OAuth** : Stocke maintenant le nom et la photo de profil
- **Synchronisation** :
  - Gestion améliorée des erreurs
  - Insertion activité par activité pour plus de robustesse
  - Retour détaillé du nombre d'activités synchronisées
  - Meilleure validation des données (conversion en Number)

#### Interface utilisateur
- Refonte de `StravaConnectionStatus` :
  - Design amélioré avec espacement
  - Message d'aide si profil incomplet
  - Intégration du bouton de déconnexion

### Corrigé
- ❌ Erreur "Failed to store activities" lors de la synchronisation
  - Ajout de conversion explicite des nombres
  - Insertion une par une au lieu de batch
  - Gestion fine des erreurs avec détails

### Migration requise

Pour les utilisateurs existants, 2 migrations SQL à appliquer :

1. **Ajouter colonnes profil athlète** : `supabase/migration_add_athlete_info.sql`
2. **Corriger contrainte unique** : `supabase/migration_fix_activity_constraint.sql`

Voir [MIGRATION_GUIDE.md](MIGRATION_GUIDE.md) pour les instructions détaillées.

### Notes techniques

#### Fichiers créés
- `components/dashboard/RecentActivities.tsx` - Affichage des activités récentes
- `components/dashboard/DisconnectStravaButton.tsx` - Bouton de déconnexion
- `app/api/strava/disconnect/route.ts` - API de déconnexion
- `supabase/migration_add_athlete_info.sql` - Migration profil athlète
- `supabase/migration_fix_activity_constraint.sql` - Migration contrainte
- `MIGRATION_GUIDE.md` - Guide de migration détaillé
- `CHANGELOG.md` - Ce fichier

#### Fichiers modifiés
- `types/database.types.ts` - Ajout des nouveaux champs
- `app/api/strava/callback/route.ts` - Stockage info athlète
- `app/api/strava/sync/route.ts` - Amélioration sync
- `components/dashboard/StravaConnectionStatus.tsx` - Affichage profil
- `app/dashboard/page.tsx` - Intégration activités récentes
- `supabase/schema.sql` - Schéma mis à jour pour nouvelles installations

### Breaking Changes

Aucun breaking change. Les anciennes connexions Strava fonctionnent toujours, mais les utilisateurs doivent se reconnecter pour voir leur profil complet.

---

## Instructions rapides

### Pour tester les nouvelles fonctionnalités :

```bash
# 1. Appliquer les migrations SQL dans Supabase
# 2. Redémarrer le serveur
npm run dev

# 3. Sur le dashboard :
# - Déconnectez votre compte Strava
# - Reconnectez-le
# - Synchronisez vos activités
# - Vérifiez que votre photo et nom apparaissent
# - Vérifiez que vos 3 dernières activités s'affichent
```
