# Structure du projet Run&Roast

```
runandroast/
│
├── app/                                    # Routes Next.js (App Router)
│   ├── api/                               # API Routes
│   │   └── strava/
│   │       ├── authorize/
│   │       │   └── route.ts              # Initialisation OAuth Strava
│   │       ├── callback/
│   │       │   └── route.ts              # Callback OAuth Strava
│   │       └── sync/
│   │           └── route.ts              # Synchronisation activités Strava
│   │
│   ├── challenges/
│   │   ├── new/
│   │   │   └── page.tsx                  # Formulaire création de défi
│   │   └── [id]/
│   │       └── page.tsx                  # Page du défi + leaderboard
│   │
│   ├── dashboard/
│   │   └── page.tsx                      # Dashboard utilisateur
│   │
│   ├── join/
│   │   └── [invite_token]/
│   │       └── page.tsx                  # Rejoindre un défi via lien
│   │
│   ├── login/
│   │   └── page.tsx                      # Page de connexion
│   │
│   ├── signup/
│   │   └── page.tsx                      # Page d'inscription
│   │
│   ├── layout.tsx                        # Layout racine avec Header
│   ├── page.tsx                          # Landing page (accueil)
│   └── globals.css                       # Styles globaux Tailwind
│
├── components/                            # Composants React
│   ├── challenges/
│   │   ├── InviteLinkSection.tsx        # Affichage lien d'invitation
│   │   ├── JoinChallengeButton.tsx      # Bouton pour rejoindre un défi
│   │   └── Leaderboard.tsx              # Tableau de classement
│   │
│   ├── dashboard/
│   │   ├── StravaConnectionStatus.tsx   # Statut connexion Strava
│   │   └── SyncActivitiesButton.tsx     # Bouton sync activités
│   │
│   ├── layout/
│   │   ├── Container.tsx                # Container responsive
│   │   └── Header.tsx                   # Header avec navigation
│   │
│   └── ui/                               # Composants UI réutilisables
│       ├── Button.tsx
│       ├── Card.tsx
│       ├── Input.tsx
│       ├── Select.tsx
│       └── Textarea.tsx
│
├── lib/                                   # Bibliothèques et utilitaires
│   ├── supabase/
│   │   ├── client.ts                    # Client Supabase (browser)
│   │   ├── server.ts                    # Client Supabase (server)
│   │   └── middleware.ts                # Middleware Supabase pour auth
│   │
│   ├── leaderboard.ts                   # Logique calcul des classements
│   ├── strava.ts                        # Helpers API Strava
│   └── utils.ts                         # Fonctions utilitaires
│
├── types/                                 # Types TypeScript
│   ├── database.types.ts                # Types générés des tables Supabase
│   └── index.ts                         # Types applicatifs (exports)
│
├── supabase/                             # Configuration Supabase
│   └── schema.sql                       # Schéma SQL complet avec RLS
│
├── middleware.ts                         # Middleware Next.js (auth routing)
│
├── .env.example                          # Template des variables d'env
├── .gitignore                            # Fichiers à ignorer par git
├── package.json                          # Dépendances et scripts npm
├── tsconfig.json                         # Configuration TypeScript
├── tailwind.config.ts                    # Configuration Tailwind CSS
├── postcss.config.mjs                    # Configuration PostCSS
├── next.config.mjs                       # Configuration Next.js
│
├── README.md                             # Documentation principale
├── SETUP.md                              # Guide de configuration détaillé
└── ARBORESCENCE.md                       # Ce fichier
```

## Fichiers clés

### Configuration
- **`.env.local`** : Variables d'environnement (à créer depuis `.env.example`)
- **`tsconfig.json`** : Configuration TypeScript stricte
- **`tailwind.config.ts`** : Configuration Tailwind avec chemins

### Authentification
- **`middleware.ts`** : Protection des routes `/dashboard` et `/challenges`
- **`lib/supabase/server.ts`** : Helpers pour auth côté serveur
- **`lib/supabase/client.ts`** : Client pour composants client

### API Strava
- **`lib/strava.ts`** : Toutes les fonctions API Strava
- **`app/api/strava/*`** : Routes API pour OAuth et sync

### Base de données
- **`supabase/schema.sql`** : Schéma complet avec tables, indexes, RLS
- **`types/database.types.ts`** : Types TypeScript des tables

### UI
- **`components/ui/*`** : Composants réutilisables (Button, Card, Input, etc.)
- **`app/globals.css`** : Styles Tailwind importés

## Points d'entrée

### Pages publiques
- `/` - Landing page
- `/login` - Connexion
- `/signup` - Inscription

### Pages protégées (authentification requise)
- `/dashboard` - Dashboard personnel
- `/challenges/new` - Création de défi
- `/challenges/[id]` - Page d'un défi
- `/join/[invite_token]` - Rejoindre un défi

### API
- `GET /api/strava/authorize` - Redirection OAuth Strava
- `GET /api/strava/callback` - Callback OAuth
- `POST /api/strava/sync` - Synchronisation des activités

## Flux de données

### Création d'un défi
1. Utilisateur remplit le formulaire → `/challenges/new`
2. Client envoie les données → Supabase (INSERT challenges)
3. Génération d'un `invite_token` unique
4. Ajout du créateur dans `challenge_members` avec role='owner'
5. Redirection vers `/challenges/[id]`

### Synchronisation Strava
1. Utilisateur clique "Synchroniser" → Appel `POST /api/strava/sync`
2. Vérification/refresh du token Strava si expiré
3. Appel API Strava `/athlete/activities`
4. UPSERT des activités dans `activity_snapshots`
5. Retour du nombre d'activités synchronisées

### Calcul du leaderboard
1. Page `/challenges/[id]` chargée
2. Récupération du challenge, membres, et activités
3. Appel `calculateLeaderboard()` côté serveur
4. Filtrage des activités (dates + sport)
5. Agrégation par utilisateur (sommes)
6. Calcul du score selon la métrique
7. Tri et attribution des rangs
8. Rendu du tableau

## Sécurité

### Row Level Security (RLS)
Toutes les tables ont des policies RLS :
- Users peuvent voir/modifier leur profil uniquement
- Membres d'un défi peuvent voir les autres membres
- Activities visibles aux co-participants d'un défi

### Authentification
- Session gérée par Supabase Auth
- Cookies sécurisés via middleware Next.js
- Routes protégées automatiquement

### Tokens Strava
- Stockés chiffrés dans Supabase
- Jamais exposés côté client
- Refresh automatique quand expirés
