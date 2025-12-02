# Guide de configuration détaillé

## Configuration Supabase

### Étape 1 : Créer le projet

1. Rendez-vous sur [supabase.com](https://supabase.com)
2. Cliquez sur "New Project"
3. Choisissez un nom, un mot de passe de base de données, et une région
4. Attendez que le projet soit créé (environ 2 minutes)

### Étape 2 : Récupérer les clés API

1. Dans votre projet Supabase, allez dans **Settings** > **API**
2. Notez les informations suivantes :
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role secret** → `SUPABASE_SERVICE_ROLE_KEY` (⚠️ à garder secret)

### Étape 3 : Exécuter le schéma SQL

1. Allez dans **SQL Editor** dans le menu de gauche
2. Cliquez sur "New query"
3. Copiez tout le contenu de `supabase/schema.sql`
4. Collez-le dans l'éditeur
5. Cliquez sur "Run" (ou Ctrl+Enter)
6. Vérifiez qu'il n'y a pas d'erreurs

### Étape 4 : Vérifier les tables

1. Allez dans **Table Editor**
2. Vous devriez voir ces tables :
   - profiles
   - strava_connections
   - challenges
   - challenge_members
   - activity_snapshots

### Étape 5 : Configurer l'authentification

1. Allez dans **Authentication** > **Providers**
2. Activez "Email" si ce n'est pas déjà fait
3. Configurez les options selon vos préférences (confirmation d'email, etc.)

## Configuration Strava API

### Étape 1 : Créer l'application

1. Allez sur [www.strava.com/settings/api](https://www.strava.com/settings/api)
2. Remplissez le formulaire :
   - **Application Name** : Run&Roast (ou le nom de votre choix)
   - **Category** : Social Network
   - **Club** : Laissez vide
   - **Website** : `http://localhost:3000` (en développement)
   - **Application Description** : Décrivez votre application
   - **Authorization Callback Domain** : `localhost` (en développement)

3. Cochez "I agree to the Strava API Agreement"
4. Cliquez sur "Create"

### Étape 2 : Récupérer les identifiants

Après création, vous verrez :
- **Client ID** : Un nombre (ex: 123456)
- **Client Secret** : Une chaîne de caractères (⚠️ à garder secret)

Notez ces deux valeurs.

### Étape 3 : Scopes requis

L'application demande ces permissions à Strava :
- `read` : Lecture des informations de base
- `activity:read_all` : Lecture de toutes les activités (publiques et privées)

Ces scopes sont configurés dans `lib/strava.ts` ligne 18.

## Configuration des variables d'environnement

Créez un fichier `.env.local` à la racine du projet :

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Strava
STRAVA_CLIENT_ID=123456
STRAVA_CLIENT_SECRET=abc123def456...
STRAVA_REDIRECT_URI=http://localhost:3000/api/strava/callback

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

⚠️ **Important** : Ne commitez JAMAIS le fichier `.env.local` dans git. Il est déjà dans le `.gitignore`.

## Test du setup

### 1. Vérifier les dépendances

```bash
npm install
```

### 2. Lancer en développement

```bash
npm run dev
```

### 3. Tester l'inscription

1. Ouvrez [http://localhost:3000](http://localhost:3000)
2. Cliquez sur "Inscription"
3. Créez un compte
4. Vérifiez que vous êtes redirigé vers le dashboard

### 4. Tester Strava

1. Sur le dashboard, cliquez sur "Connecter mon compte Strava"
2. Vous devriez être redirigé vers Strava
3. Autorisez l'application
4. Vous devriez revenir sur le dashboard avec le statut "Connecté à Strava"

### 5. Tester la synchronisation

1. Cliquez sur "Synchroniser mes activités"
2. Si vous avez des activités sur Strava, elles seront importées
3. Vérifiez dans Supabase > Table Editor > activity_snapshots

### 6. Tester un défi

1. Cliquez sur "Créer un défi"
2. Remplissez le formulaire
3. Créez le défi
4. Vérifiez que vous voyez la page du défi avec le lien d'invitation

## Dépannage

### Erreur : "Invalid API key"

- Vérifiez que `NEXT_PUBLIC_SUPABASE_URL` et `NEXT_PUBLIC_SUPABASE_ANON_KEY` sont corrects
- Relancez le serveur après avoir modifié `.env.local`

### Erreur Strava OAuth

- Vérifiez que `STRAVA_CLIENT_ID` et `STRAVA_CLIENT_SECRET` sont corrects
- Vérifiez que l'Authorization Callback Domain dans Strava est bien `localhost`
- Vérifiez que `STRAVA_REDIRECT_URI` est exactement `http://localhost:3000/api/strava/callback`

### Erreur RLS (Row Level Security)

- Vérifiez que le schéma SQL a été exécuté complètement
- Vérifiez dans Supabase > Authentication > Policies que les policies existent

### Erreur de compilation TypeScript

```bash
# Supprimer node_modules et réinstaller
rm -rf node_modules package-lock.json
npm install
```

## Déploiement en production

### Modifications nécessaires

1. **Supabase** : Aucune modification nécessaire

2. **Strava** :
   - Modifier le Website : `https://votredomaine.com`
   - Modifier l'Authorization Callback Domain : `votredomaine.com`

3. **Variables d'environnement** :
   ```env
   NEXT_PUBLIC_APP_URL=https://votredomaine.com
   STRAVA_REDIRECT_URI=https://votredomaine.com/api/strava/callback
   ```

4. **Vercel** :
   - Ajoutez toutes les variables d'environnement dans Settings > Environment Variables
   - Déployez

## Support

En cas de problème, vérifiez :
1. Les logs de votre terminal
2. La console du navigateur (F12)
3. Les logs dans Supabase > Logs
4. Les paramètres de votre application Strava
