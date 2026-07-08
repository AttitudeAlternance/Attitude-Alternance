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
3. Exécutez ensuite, dans l'ordre, chaque fichier de migration présent dans `supabase/` (un par un, dans une nouvelle requête SQL à chaque fois) :
   - `migration_cv.sql` — lecture de CV (colonnes + bucket de stockage)
   - `migration_job_description.sql` — description de l'offre par candidature
   - `migration_weekly_goal.sql` — objectif hebdomadaire de candidatures
   - `migration_plan_and_usage.sql` — plan Étudiant+, quotas IA, identifiants Stripe
   - `migration_profile_email.sql` — email dans le profil (nécessaire aux rappels par email)
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
   - `ANTHROPIC_API_KEY` (fortement recommandé)
   - `SUPABASE_SERVICE_ROLE_KEY` et `CRON_SECRET` (pour les rappels de relance)
   - `RESEND_API_KEY` et `RESEND_FROM_EMAIL` (optionnel, envoi réel des rappels par email)
   - `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `STRIPE_PRICE_ID` (optionnel, paiement Étudiant+)
4. Déployez. Vercel détecte automatiquement Next.js **et** le fichier `vercel.json` (tâche planifiée quotidienne des rappels de relance).
5. Dans Supabase, ajoutez l'URL de production dans **Authentication > URL Configuration** (Site URL + Redirect URLs) afin que la confirmation d'email et les redirections fonctionnent correctement en production.

## 7. Activer les rappels de relance par email (optionnel)

1. Créez un compte sur [resend.com](https://resend.com) (offre gratuite disponible).
2. Récupérez une clé API et renseignez `RESEND_API_KEY`.
3. Renseignez `RESEND_FROM_EMAIL` avec une adresse d'envoi vérifiée dans Resend (ex : `rappels@votredomaine.fr`).
4. Dans Supabase (**Project Settings > API**), copiez la clé **service_role** dans `SUPABASE_SERVICE_ROLE_KEY`.
5. Générez une valeur aléatoire pour `CRON_SECRET` (ex : `openssl rand -hex 32`).
6. Dans Vercel, sous **Settings > Cron Jobs**, vérifiez que la tâche `/api/cron/send-reminders` (définie dans `vercel.json`) est bien active, et renseignez l'en-tête d'autorisation si l'interface le demande.

Sans ces variables, l'application fonctionne normalement : les relances restent visibles dans le tableau de bord, simplement aucun email n'est envoyé.

## 8. Activer le paiement de l'offre Étudiant+ (optionnel)

1. Créez un compte sur [stripe.com](https://stripe.com).
2. Créez un produit "Étudiant+" avec un prix récurrent mensuel, et copiez son **Price ID** dans `STRIPE_PRICE_ID`.
3. Copiez votre clé secrète (**Developers > API keys**) dans `STRIPE_SECRET_KEY`.
4. Créez un endpoint de webhook pointant vers `https://votre-site.vercel.app/api/stripe/webhook`, écoutant les événements `checkout.session.completed`, `customer.subscription.updated` et `customer.subscription.deleted`, puis copiez le secret de signature dans `STRIPE_WEBHOOK_SECRET`.

Sans ces variables, le bouton "Passer à Étudiant+" affiche un message indiquant que le paiement n'est pas encore disponible, sans bloquer le reste du site.

## 9. Pages légales — à compléter avant un lancement public

Le site inclut désormais trois pages légales, accessibles depuis le pied de page : **Mentions légales**
(`/mentions-legales`), **CGU** (`/cgu`) et **Politique de confidentialité** (`/confidentialite`).

⚠️ **Avant tout lancement public**, ouvrez `src/app/mentions-legales/page.tsx` et remplacez les deux blocs
signalés `[À COMPLÉTER]` par votre identité réelle (nom, statut, adresse, email de contact) : ce sont des
informations obligatoires que seul l'éditeur du site peut renseigner.

Ces documents couvrent les points essentiels (identité de l'éditeur, RGPD, droit de rétractation, droit à
l'effacement) mais ne remplacent pas une relecture par un professionnel du droit, en particulier si le site
est commercialisé à grande échelle ou s'adresse à un public mineur de manière significative.

L'inscription impose désormais l'acceptation explicite des CGU et de la politique de confidentialité (case à
cocher obligatoire), et chaque utilisateur peut supprimer définitivement son compte et l'ensemble de ses
données depuis la page "Mon profil" (droit à l'effacement RGPD).

## Fonctionnalités principales

- **Landing page** : promesse, problème/solution, bénéfices, fonctionnement, tarifs, FAQ.
- **Authentification** : inscription, connexion, déconnexion via Supabase Auth ; routes `/dashboard/*` protégées par middleware.
- **Dashboard** : statistiques (candidatures envoyées, en attente, entretiens, relances à faire), objectif hebdomadaire de candidatures paramétrable avec barre de progression, et accès rapides.
- **CRM de candidatures** : ajout, modification, suppression, filtre par statut, recherche par entreprise/poste, tri par date, mise en évidence des relances dues ou en retard, estimation d'email de contact (schémas courants, à utiliser avec parcimonie), récupération automatique du texte d'une offre depuis son lien.
- **Score de correspondance CV ↔ offre** : compare le résumé de CV de l'étudiant à la description d'une offre pour estimer ses chances, avec points forts et axes à renforcer.
- **Détection d'offres-écoles** : analyse par IA (Claude) pour repérer les annonces publiées par des écoles/organismes de formation à des fins de captation de candidats plutôt que de vraies offres d'entreprise — pourcentage de risque et éléments repérés.
- **Rappels de relance par email** : une tâche planifiée quotidienne envoie un récapitulatif des relances dues à chaque étudiant concerné (nécessite Resend, voir section dédiée).
- **Générateur de messages IA** : mail de candidature, mail de relance, message LinkedIn, mail de remerciement — rédigés par Claude (si clé configurée) en tenant compte de l'annonce et du CV, avec choix du ton, régénération ("autre proposition") et historique.
- **Lecture de CV** : dépôt d'un CV au format PDF, extraction et résumé automatique du profil.
- **Ressources** : conseils CV, LinkedIn, entretien, méthode de relance, organisation, exemples de messages.
- **Profil** : informations personnelles, plan d'abonnement (gratuit / Étudiant+ via Stripe), avec indicateur de complétion.
- **Offre gratuite / Étudiant+** : la version gratuite est limitée à 15 candidatures suivies (compteur cumulé, insensible aux suppressions) et un quota IA quotidien restreint ; l'offre Étudiant+ (paiement Stripe) lève ces limites.
- **Programme de parrainage** : chaque étudiant a un lien de parrainage personnel ; un nouvel inscrit via ce lien débloque 5 candidatures bonus pour lui et son parrain.
- **Contenu public (SEO)** : les guides longs (ex : préparation à l'entretien) sont accessibles publiquement sur `/conseils`, avec un appel à l'action vers l'inscription — indexables par les moteurs de recherche.
- **Page "À propos"** (`/a-propos`) : signal de confiance pour les nouveaux visiteurs, à personnaliser avec votre histoire.
- **Vercel Analytics** : intégré (composant `<Analytics />`), à activer dans Vercel (Project → Analytics → Enable) pour suivre les visites et inscriptions.
- **Page Admin** (`/dashboard/admin`) : vue d'ensemble réservée au propriétaire du site (étudiants inscrits, nouveaux cette semaine, répartition gratuit/Étudiant+, candidatures et messages générés au total, parrainages, MRR estimé). Le paiement détaillé reste à consulter sur le Dashboard Stripe.

## Notes techniques

- Toutes les données sont protégées par des policies **RLS** : un utilisateur ne peut lire ou modifier que ses propres candidatures, messages et profil.
- Les états vides (aucune candidature, aucun message généré, profil incomplet) sont gérés explicitement dans l'interface.
- Le design (couleurs, typographies, composants) est défini dans `tailwind.config.ts` et peut être ajusté globalement depuis ce fichier.
