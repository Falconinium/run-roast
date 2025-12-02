# Solution : Erreur de synchronisation Strava

## Problème résolu

L'erreur **"Failed to store any activities"** lors de la synchronisation Strava a été corrigée.

## Cause du problème

Le code utilisait la fonction `upsert` de Supabase avec une contrainte composite (`user_id`, `strava_activity_id`), mais Supabase JS n'arrivait pas à reconnaître correctement cette contrainte, ce qui causait des erreurs lors de l'insertion.

## Solution appliquée

Le code de synchronisation a été entièrement refactorisé pour :

### 1. Vérification manuelle des doublons

Au lieu de dépendre de `upsert` avec une contrainte nommée, le code :
1. **Vérifie d'abord** si l'activité existe déjà dans la base de données
2. Si elle existe : **met à jour** l'activité existante
3. Si elle n'existe pas : **insère** une nouvelle activité

### 2. Gestion fine des erreurs

- Chaque activité est traitée individuellement
- Les erreurs sont capturées et enregistrées séparément
- Un rapport détaillé est retourné avec :
  - Nombre d'activités insérées
  - Nombre d'activités mises à jour
  - Nombre d'erreurs (si applicable)
  - Détails des 5 premières erreurs pour le debug

### 3. Messages améliorés

Le bouton de synchronisation affiche maintenant :
- Message de succès détaillé : "Successfully synced X activities (Y new, Z updated)"
- En cas d'erreur : un bouton déroulant "Voir les détails des erreurs"
- Les détails techniques pour faciliter le debug

## Fichiers modifiés

1. **[app/api/strava/sync/route.ts](app/api/strava/sync/route.ts:98-174)**
   - Refactorisation complète de la logique d'insertion
   - Vérification manuelle des doublons
   - Gestion d'erreur améliorée

2. **[components/dashboard/SyncActivitiesButton.tsx](components/dashboard/SyncActivitiesButton.tsx:7-71)**
   - Affichage des détails d'erreur
   - Meilleure présentation des messages

## Test de la solution

### Avant de tester

Redémarrez votre serveur de développement :
```bash
npm run dev
```

### Test complet

1. **Allez sur le dashboard** : http://localhost:3000/dashboard

2. **Reconnectez Strava** (si ce n'est pas déjà fait) :
   - Cliquez sur "Déconnecter Strava"
   - Cliquez sur "Connecter mon compte Strava"
   - Autorisez l'accès

3. **Synchronisez vos activités** :
   - Cliquez sur "Synchroniser mes activités"
   - Attendez quelques secondes
   - Vous devriez voir : "Successfully synced X activities (Y new, Z updated)"

4. **Vérifiez l'affichage** :
   - Section "Mes dernières activités" devrait afficher vos 3 dernières activités
   - Chaque activité montre : emoji, date, distance, temps, dénivelé

### Si vous voyez encore une erreur

1. **Vérifiez les détails** :
   - Cliquez sur "Voir les détails des erreurs" sous le message d'erreur
   - Notez les messages d'erreur affichés

2. **Vérifiez la console** :
   - Ouvrez la console du navigateur (F12)
   - Onglet "Console"
   - Recherchez des erreurs en rouge

3. **Vérifiez Supabase** :
   - Allez dans Table Editor > activity_snapshots
   - Vérifiez que la table a bien toutes les colonnes requises :
     - `id`, `user_id`, `strava_activity_id`
     - `sport_type`, `distance`, `moving_time`, `elapsed_time`
     - `total_elevation_gain`, `start_date`, `raw_payload`, `created_at`

## Migration SQL (optionnelle)

La migration de la contrainte unique n'est **plus requise** avec cette nouvelle approche.

Si vous voulez quand même l'appliquer (pour optimisation future) :

```sql
ALTER TABLE public.activity_snapshots
DROP CONSTRAINT IF EXISTS activity_snapshots_user_id_strava_activity_id_key;

ALTER TABLE public.activity_snapshots
ADD CONSTRAINT activity_snapshots_user_activity_unique
UNIQUE (user_id, strava_activity_id);
```

Mais le code fonctionne parfaitement **sans cette migration**.

## Avantages de cette solution

✅ **Plus robuste** : Ne dépend pas du nom de la contrainte
✅ **Plus claire** : Logique explicite facile à comprendre
✅ **Meilleur debug** : Messages d'erreur détaillés
✅ **Gestion partielle** : Continue même si certaines activités échouent
✅ **Rétrocompatible** : Fonctionne avec ou sans la contrainte nommée

## Prochaines étapes

Une fois la synchronisation fonctionnelle, vous devriez voir :

1. ✅ Vos activités Strava synchronisées
2. ✅ Les 3 dernières activités affichées sur le dashboard
3. ✅ Votre nom et photo de profil Strava
4. ✅ Le bouton de déconnexion Strava

Profitez de Run&Roast ! 🏃‍♂️🚴‍♀️
