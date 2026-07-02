# Attitude Alternance

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
3. Exécutez ensuite [`supabase/migration_cv.sql`](./supabase/migration_cv.sql) (dans une nouvelle requête SQL) pour activer la lecture de CV :
   - ajoute les colonnes `cv_file_path`, `cv_text`, `cv_summary`, `cv_uploaded_at` à `profiles` ;
   - crée un bucket de stockage privé `cvs` avec des policies garantissant que chaque étudiant n'accède qu'à son propre CV.
4. Dans **Authentication > Providers**, l'authentification par email/mot de passe est active par défaut.
   - Pour du développement rapide, vous pouvez désactiver « Confirm email » dans **Authentication > Settings** afin de tester sans avoir à confirmer chaque compte.
5. Récupérez vos clés dans **Project Settings > API** :
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

# Fortement recommandé : active la vraie génération IA (Claude) et l'analyse de CV
ANTHROPIC_API_KEY=
```

> **Sans `ANTHROPIC_API_KEY`**, l'application reste fonctionnelle mais en mode dégradé : le générateur de messages utilise des modèles de phrases pré-écrits (plus mécanique), et le résumé de CV se limite à un extrait brut du texte, sans réelle compréhension. **Avec une clé configurée**, Claude lit réellement l'annonce et le CV pour rédiger des messages naturels et pertinents. Vous pouvez créer une clé sur [console.anthropic.com](https://console.anthropic.com).

## 4. Lancement en local

```bash
npm run dev
```

L'application est disponible sur [http://localhost:3000](http://localhost:3000).

## 5. Fonctionnement de la génération IA et de la lecture de CV

- **Génération de messages** (`src/lib/ai/generateMessage.ts`) : si `ANTHROPIC_API_KEY` est configurée, chaque message est rédigé par Claude en tenant compte de l'annonce collée et du résumé de CV, avec des consignes de style (naturel, clair, impactant, sans jargon robotique). Sans clé, un générateur local prend le relais.
- **Lecture de CV** (`src/app/api/parse-cv/route.ts`) : le PDF déposé est stocké dans Supabase Storage (bucket privé `cvs`), son texte est extrait avec `pdf-parse`, puis résumé par Claude (formation, compétences, expériences, points forts) si une clé est configurée. Ce résumé est réutilisé automatiquement par le générateur de messages, sans que l'étudiant ait à ressaisir ses informations.
- Ces deux routes s'exécutent côté serveur : la clé API n'est jamais exposée au navigateur.

## 6. Déploiement sur Vercel

1. Poussez le projet sur un dépôt GitHub / GitLab / Bitbucket.
2. Sur [vercel.com](https://vercel.com), cliquez sur **New Project** et importez le dépôt.
3. Renseignez les variables d'environnement (les mêmes que dans `.env.local`) dans **Settings > Environment Variables** :
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `ANTHROPIC_API_KEY` (fortement recommandé pour une génération IA et une lecture de CV de qualité)
   - `HUNTER_API_KEY` (optionnel, pour une recherche d'email vérifiée)
4. Déployez. Vercel détecte automatiquement Next.js, aucune configuration supplémentaire n'est nécessaire.
5. Dans Supabase, ajoutez l'URL de production dans **Authentication > URL Configuration** (Site URL + Redirect URLs) afin que la confirmation d'email et les redirections fonctionnent correctement en production.

## Fonctionnalités principales

- **Landing page** : promesse, problème/solution, bénéfices, fonctionnement, tarifs, FAQ.
- **Authentification** : inscription, connexion, déconnexion via Supabase Auth ; routes `/dashboard/*` protégées par middleware.
- **Dashboard** : statistiques (candidatures envoyées, en attente, entretiens, relances à faire), objectif hebdomadaire de candidatures paramétrable avec barre de progression, et accès rapides.
- **CRM de candidatures** : ajout, modification, suppression, filtre par statut, tri par date, mise en évidence des relances dues ou en retard, recherche d'email de contact (schémas courants, ou vérifié via Hunter.io si configuré), récupération automatique du texte d'une offre depuis son lien (fonctionne sur la plupart des pages carrière d'entreprise, pas sur LinkedIn/Indeed/Welcome to the Jungle qui bloquent ce type de récupération).
- **Générateur de messages IA** : mail de candidature, mail de relance, message LinkedIn, mail de remerciement — rédigés par Claude (si clé configurée) en tenant compte de l'annonce et du CV, avec choix du ton et historique des messages générés.
- **Lecture de CV** : dépôt d'un CV au format PDF, extraction et résumé automatique du profil (formation, compétences, expériences), réutilisé pour personnaliser les messages générés.
- **Ressources** : conseils CV, LinkedIn, entretien, méthode de relance, organisation, exemples de messages.
- **Profil** : informations personnelles utilisées pour personnaliser les messages générés, avec indicateur de complétion.

## Notes techniques

- Toutes les données sont protégées par des policies **RLS** : un utilisateur ne peut lire ou modifier que ses propres candidatures, messages et profil.
- Les états vides (aucune candidature, aucun message généré, profil incomplet) sont gérés explicitement dans l'interface.
- Le design (couleurs, typographies, composants) est défini dans `tailwind.config.ts` et peut être ajusté globalement depuis ce fichier.
