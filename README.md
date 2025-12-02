# Run&Roast - MicroChallenges

Application SaaS connectée à Strava pour créer des défis sportifs privés entre amis.

## Stack Technique

- **Framework**: Next.js 14 (App Router)
- **Langage**: TypeScript
- **UI**: React + Tailwind CSS
- **Auth & Database**: Supabase (PostgreSQL + Auth)
- **API**: Strava OAuth2

## Prérequis

- Node.js 18+ et npm
- Un compte Supabase
- Un compte Strava API

## Installation

### 1. Cloner le projet

```bash
git clone <votre-repo>
cd runandroast
```

### 2. Installer les dépendances

```bash
npm install
```

### 3. Configuration Supabase

#### a. Créer un projet Supabase

1. Créez un compte sur [supabase.com](https://supabase.com)
2. Créez un nouveau projet
3. Notez votre URL du projet et votre clé API (anon key)

#### b. Exécuter le schéma SQL

1. Allez dans le SQL Editor de votre projet Supabase
2. Copiez le contenu de `supabase/schema.sql`
3. Exécutez le script SQL

Cela créera toutes les tables nécessaires :
- `profiles`
- `strava_connections`
- `challenges`
- `challenge_members`
- `activity_snapshots`

Les Row Level Security (RLS) policies sont également configurées automatiquement.

### 4. Configuration Strava API

#### a. Créer une application Strava

1. Allez sur [www.strava.com/settings/api](https://www.strava.com/settings/api)
2. Créez une nouvelle application
3. Configurez les champs :
   - **Application Name**: Run&Roast (ou votre nom)
   - **Category**: Social Network ou Training
   - **Website**: `http://localhost:3000` (en dev)
   - **Authorization Callback Domain**: `localhost` (en dev)

4. Notez votre **Client ID** et **Client Secret**

#### b. URL de callback

En développement : `http://localhost:3000/api/strava/callback`
En production : `https://votredomaine.com/api/strava/callback`

### 5. Variables d'environnement

Créez un fichier `.env.local` à la racine du projet :

```bash
cp .env.example .env.local
```

Remplissez les variables :

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://votre-projet.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=votre_anon_key
SUPABASE_SERVICE_ROLE_KEY=votre_service_role_key

# Strava OAuth Configuration
STRAVA_CLIENT_ID=votre_client_id
STRAVA_CLIENT_SECRET=votre_client_secret
STRAVA_REDIRECT_URI=http://localhost:3000/api/strava/callback

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 6. Lancer le projet

```bash
npm run dev
```

Ouvrez [http://localhost:3000](http://localhost:3000) dans votre navigateur.

## Structure du projet

```
runandroast/
├── app/                          # Routes Next.js (App Router)
│   ├── api/
│   │   └── strava/              # Routes API Strava OAuth
│   │       ├── authorize/
│   │       ├── callback/
│   │       └── sync/
│   ├── challenges/
│   │   ├── new/                 # Création de défi
│   │   └── [id]/                # Page du défi + leaderboard
│   ├── dashboard/               # Dashboard utilisateur
│   ├── join/
│   │   └── [invite_token]/      # Rejoindre un défi
│   ├── login/                   # Connexion
│   ├── signup/                  # Inscription
│   ├── layout.tsx               # Layout principal
│   ├── page.tsx                 # Landing page
│   └── globals.css              # Styles globaux
├── components/
│   ├── challenges/              # Composants liés aux défis
│   ├── dashboard/               # Composants du dashboard
│   ├── layout/                  # Composants de layout (Header, Container)
│   └── ui/                      # Composants UI réutilisables
├── lib/
│   ├── supabase/               # Clients Supabase (server, client, middleware)
│   ├── leaderboard.ts          # Logique de calcul des classements
│   ├── strava.ts               # Helpers API Strava
│   └── utils.ts                # Utilitaires divers
├── types/
│   ├── database.types.ts       # Types générés Supabase
│   └── index.ts                # Types applicatifs
├── supabase/
│   └── schema.sql              # Schéma SQL de la base de données
├── middleware.ts               # Middleware Next.js (auth)
└── package.json
```

## Utilisation

### 1. Créer un compte

1. Allez sur la page d'inscription
2. Créez votre compte avec email/mot de passe
3. Connectez votre compte Strava depuis le dashboard

### 2. Créer un défi

1. Cliquez sur "Créer un défi"
2. Remplissez les informations :
   - Titre
   - Description (optionnel)
   - Sport (run, ride, hike, etc.)
   - Métrique (distance, temps, dénivelé, nombre d'activités)
   - Dates de début et fin
3. Un lien d'invitation unique est généré

### 3. Inviter des participants

1. Sur la page du défi, copiez le lien d'invitation
2. Partagez-le avec vos amis
3. Ils devront créer un compte et connecter Strava pour participer

### 4. Synchroniser les activités

1. Depuis le dashboard, cliquez sur "Synchroniser mes activités"
2. Vos activités Strava des 90 derniers jours sont importées
3. Le leaderboard est mis à jour automatiquement

### 5. Voir le classement

1. Accédez à la page d'un défi
2. Le classement affiche tous les participants selon la métrique choisie
3. Vos activités dans la période du défi sont comptabilisées

## Fonctionnalités principales

- **Authentification** : Email/mot de passe via Supabase Auth
- **OAuth Strava** : Connexion et synchronisation des activités
- **Création de défis** : Personnalisable (sport, métrique, dates)
- **Invitations** : Liens uniques pour rejoindre un défi
- **Leaderboard** : Classement en temps réel selon la métrique
- **Synchronisation** : Import des activités Strava
- **Row Level Security** : Sécurité au niveau des données

## 📚 Documentation

**[📖 DOCUMENTATION_INDEX.md](DOCUMENTATION_INDEX.md)** - Index complet de toute la documentation

### Pour commencer
- **[QUICKSTART.md](QUICKSTART.md)** - Guide de démarrage rapide ⭐ Commencez ici !
- **[SETUP.md](SETUP.md)** - Configuration complète et avancée

### En cas de problème
- **[QUICK_FIX_GUIDE.md](QUICK_FIX_GUIDE.md)** - Solution rapide en 3 étapes ⚡
- **[TROUBLESHOOTING.md](TROUBLESHOOTING.md)** - Guide de résolution des problèmes courants ⭐
- **[DEBUG_NO_ACTIVITIES.md](DEBUG_NO_ACTIVITIES.md)** - Debug spécifique pour les activités invisibles

### Documentation technique
- **[RLS_POLICIES_EXPLAINED.md](RLS_POLICIES_EXPLAINED.md)** - Explication des Row Level Security policies
- **[POLICY_ARCHITECTURE.md](POLICY_ARCHITECTURE.md)** - Architecture et flux des RLS policies
- **[FIXES_SUMMARY.md](FIXES_SUMMARY.md)** - Résumé de toutes les corrections apportées

## 🆘 Problèmes courants

| Problème | Solution |
|----------|----------|
| Activités synchronisées mais invisibles | Appliquer [fix_all_policies.sql](supabase/fix_all_policies.sql) |
| "infinite recursion detected" | Appliquer [fix_all_policies.sql](supabase/fix_all_policies.sql) |
| Nom et photo manquants | Se reconnecter à Strava |
| "Failed to store activities" | Voir [TROUBLESHOOTING.md](TROUBLESHOOTING.md) |

➡️ **Pour un diagnostic complet, consultez [TROUBLESHOOTING.md](TROUBLESHOOTING.md)**

## Évolutions futures

- Webhooks Strava pour synchronisation automatique
- Notifications par email
- Graphiques de progression
- Défis publics
- Badges et récompenses
- Export des résultats

## Déploiement

### Vercel (recommandé)

1. Push votre code sur GitHub
2. Importez le projet sur [vercel.com](https://vercel.com)
3. Configurez les variables d'environnement
4. Déployez

N'oubliez pas de :
- Mettre à jour `NEXT_PUBLIC_APP_URL` avec votre domaine
- Mettre à jour `STRAVA_REDIRECT_URI` avec votre domaine
- Modifier l'Authorization Callback Domain dans les settings Strava

## Licence

MIT
