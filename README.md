# AlternanceBoost

Application SaaS complète d'accompagnement à la recherche d'alternance : suivi des candidatures (CRM), génération de messages par IA, rappels de relance et espace personnel étudiant.

## Stack technique

- **Next.js 14** (App Router) + **TypeScript**
- **Tailwind CSS**
- **Supabase** (authentification + base de données PostgreSQL, avec Row Level Security)
- Déploiement pensé pour **Vercel**

## Structure du projet

```
alternance-saas/
├── src/
│   ├── app/                      # Routes (App Router)
│   │   ├── page.tsx               # Landing page
│   │   ├── login/                 # Connexion
│   │   ├── signup/                # Inscription
│   │   ├── auth/callback/         # Callback Supabase (confirmation email)
│   │   ├── api/generate-message/  # Route API du générateur IA (côté serveur)
│   │   └── dashboard/             # Espace connecté (protégé par le middleware)
│   │       ├── page.tsx           # Vue d'ensemble
│   │       ├── applications/      # CRM de candidatures
│   │       ├── messages/          # Générateur de messages IA
│   │       ├── resources/         # Bibliothèque de ressources
│   │       └── profile/           # Profil étudiant
│   ├── components/
│   │   ├── ui/                    # Composants réutilisables (Button, Card, Modal, Form...)
│   │   ├── layout/                # Navbar, Sidebar, AppShell
│   │   ├── landing/                # Sections de la page d'accueil
│   │   ├── applications/           # CRM (formulaire, tableau, board)
│   │   ├── messages/                # Générateur de messages
│   │   └── profile/                 # Formulaire de profil
│   ├── lib/
│   │   ├── supabase/               # Clients Supabase (browser, server, middleware)
│   │   ├── ai/generateMessage.ts   # Générateur IA (placeholder, facilement remplaçable)
│   │   ├── types.ts                # Types partagés (miroir du schéma SQL)
│   │   └── utils.ts
│   └── middleware.ts               # Protection des routes /dashboard
└── supabase/
    └── schema.sql                  # Schéma complet à exécuter dans Supabase
```

## 1. Installation

```bash
npm install
```

## 2. Configuration de Supabase

1. Créez un projet sur [supabase.com](https://supabase.com).
2. Dans **SQL Editor**, exécutez l'intégralité du fichier [`supabase/schema.sql`](./supabase/schema.sql).
   Il crée :
   - la table `profiles` (informations complémentaires de l'étudiant, liée à `auth.users`) ;
   - la table `applications` (candidatures suivies dans le CRM) ;
   - la table `generated_messages` (historique des messages générés) ;
   - les triggers (mise à jour de `updated_at`, création automatique d'un profil à l'inscription) ;
   - les policies **Row Level Security** : chaque utilisateur ne voit et ne modifie que ses propres données.
3. Dans **Authentication > Providers**, l'authentification par email/mot de passe est active par défaut.
   - Pour du développement rapide, vous pouvez désactiver « Confirm email » dans **Authentication > Settings** afin de tester sans avoir à confirmer chaque compte.
4. Récupérez vos clés dans **Project Settings > API** :
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## 3. Variables d'environnement

Copiez `.env.example` en `.env.local` :

```bash
cp .env.example .env.local
```

Renseignez :

```
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Optionnel : active la génération IA réelle si renseignée
OPENAI_API_KEY=
ANTHROPIC_API_KEY=
```

> Sans clé `OPENAI_API_KEY` ni `ANTHROPIC_API_KEY`, le générateur de messages utilise automatiquement une génération locale (placeholder), fonctionnelle et personnalisée, sans dépendance externe.

## 4. Lancement en local

```bash
npm run dev
```

L'application est disponible sur [http://localhost:3000](http://localhost:3000).

## 5. Brancher une vraie API IA (OpenAI / Claude)

Toute la logique de génération est centralisée dans **`src/lib/ai/generateMessage.ts`** et appelée uniquement depuis la route serveur **`src/app/api/generate-message/route.ts`** (la clé API n'est donc jamais exposée au navigateur).

Pour activer une vraie génération IA :

1. Ajoutez votre clé dans `.env.local` (`OPENAI_API_KEY` ou `ANTHROPIC_API_KEY`).
2. Dans `generateMessage.ts`, remplacez le contenu de la fonction `generateMessage()` par un appel à l'API souhaitée (un exemple d'appel à l'API Anthropic est déjà présent en commentaire dans le fichier).
3. La fonction `buildPrompt()` est prête à l'emploi pour construire le prompt à partir des informations saisies par l'étudiant.

Aucune autre modification n'est nécessaire : l'interface, la sauvegarde en base et l'historique fonctionnent à l'identique.

## 6. Déploiement sur Vercel

1. Poussez le projet sur un dépôt GitHub / GitLab / Bitbucket.
2. Sur [vercel.com](https://vercel.com), cliquez sur **New Project** et importez le dépôt.
3. Renseignez les variables d'environnement (les mêmes que dans `.env.local`) dans **Settings > Environment Variables** :
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `OPENAI_API_KEY` / `ANTHROPIC_API_KEY` (optionnel)
4. Déployez. Vercel détecte automatiquement Next.js, aucune configuration supplémentaire n'est nécessaire.
5. Dans Supabase, ajoutez l'URL de production dans **Authentication > URL Configuration** (Site URL + Redirect URLs) afin que la confirmation d'email et les redirections fonctionnent correctement en production.

## Fonctionnalités principales

- **Landing page** : promesse, problème/solution, bénéfices, fonctionnement, tarifs, FAQ.
- **Authentification** : inscription, connexion, déconnexion via Supabase Auth ; routes `/dashboard/*` protégées par middleware.
- **Dashboard** : statistiques (candidatures envoyées, en attente, entretiens, relances à faire) et accès rapides.
- **CRM de candidatures** : ajout, modification, suppression, filtre par statut, tri par date, mise en évidence des relances dues ou en retard.
- **Générateur de messages IA** : mail de candidature, mail de relance, message LinkedIn, mail de remerciement — avec choix du ton et historique des messages générés.
- **Ressources** : conseils CV, LinkedIn, entretien, méthode de relance, organisation, exemples de messages.
- **Profil** : informations personnelles utilisées pour personnaliser les messages générés, avec indicateur de complétion.

## Notes techniques

- Toutes les données sont protégées par des policies **RLS** : un utilisateur ne peut lire ou modifier que ses propres candidatures, messages et profil.
- Les états vides (aucune candidature, aucun message généré, profil incomplet) sont gérés explicitement dans l'interface.
- Le design (couleurs, typographies, composants) est défini dans `tailwind.config.ts` et peut être ajusté globalement depuis ce fichier.
