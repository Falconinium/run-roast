# Debug : Activités synchronisées mais non affichées

## Problème

Vous voyez le message "Successfully synced 26 activities" mais la section "Mes dernières activités" est vide.

## Diagnostic

### Étape 1 : Page de debug

J'ai créé une page de debug pour diagnostiquer le problème.

Allez sur : **http://localhost:3000/debug/activities**

Cette page affiche :
- Votre Profile ID
- Votre Auth User ID
- Si les IDs correspondent
- Le nombre d'activités trouvées
- Les détails des activités (si trouvées)
- Les erreurs éventuelles

### Étape 2 : Vérifier les RLS Policies

Le problème vient probablement des **Row Level Security policies** de Supabase.

#### Solution rapide : Appliquer la policy corrigée

Dans Supabase SQL Editor, exécutez :

```sql
-- Supprimer l'ancienne policy
DROP POLICY IF EXISTS "Users can view activities of challenge members" ON public.activity_snapshots;

-- Créer une policy pour voir ses propres activités
DROP POLICY IF EXISTS "Users can view their own activities" ON public.activity_snapshots;
CREATE POLICY "Users can view their own activities"
  ON public.activity_snapshots FOR SELECT
  USING (auth.uid() = user_id);

-- Policy pour voir les activités des membres des mêmes challenges
DROP POLICY IF EXISTS "Users can view challenge members activities" ON public.activity_snapshots;
CREATE POLICY "Users can view challenge members activities"
  ON public.activity_snapshots FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.challenge_members cm1
      JOIN public.challenge_members cm2 ON cm1.challenge_id = cm2.challenge_id
      WHERE cm1.user_id = auth.uid() AND cm2.user_id = activity_snapshots.user_id
    )
  );
```

### Étape 3 : Vérifier dans Supabase Table Editor

1. Allez dans Supabase → **Table Editor** → **activity_snapshots**
2. Vérifiez que vos 26 activités sont bien là
3. Vérifiez que la colonne `user_id` correspond à votre ID utilisateur

### Étape 4 : Vérifier les logs

Dans le terminal où vous lancez `npm run dev`, vous devriez voir :

```
Recent activities fetched: 3
```

Si vous voyez :
```
Recent activities fetched: 0
```

C'est que les RLS policies bloquent l'accès.

Si vous voyez :
```
Error fetching recent activities: { ... }
```

Il y a une erreur de requête.

## Solution temporaire : Désactiver RLS pour tester

⚠️ **À NE FAIRE QUE POUR TESTER EN LOCAL**

Dans Supabase :

1. Allez dans **Table Editor** → **activity_snapshots**
2. Cliquez sur les 3 points → **Edit table**
3. Décochez "Enable Row Level Security"
4. Rafraîchissez le dashboard

Si les activités s'affichent maintenant, le problème vient bien des RLS policies.

**N'oubliez pas de réactiver RLS après le test !**

## Vérification finale

Après avoir appliqué la correction SQL :

1. Redémarrez le serveur : `npm run dev`
2. Allez sur http://localhost:3000/dashboard
3. Les 3 dernières activités devraient s'afficher

## Si ça ne fonctionne toujours pas

Envoyez-moi les informations de la page de debug :
- http://localhost:3000/debug/activities
- Faites une capture d'écran ou copiez les informations

Je pourrai diagnostiquer plus précisément le problème.
