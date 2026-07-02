-- ============================================================================
-- Migration — Plan Étudiant+, limites d'usage IA, et intégration Stripe
-- À exécuter en plus des migrations précédentes déjà en place
-- ============================================================================

-- Plan de l'utilisateur : 'free' (par défaut) ou 'premium' (Étudiant+)
alter table public.profiles add column if not exists plan text not null default 'free';

-- Identifiants Stripe, remplis automatiquement par le webhook de paiement
alter table public.profiles add column if not exists stripe_customer_id text;
alter table public.profiles add column if not exists stripe_subscription_id text;

-- Compteur d'appels IA (génération de message, analyse de CV, score de correspondance)
-- pour limiter l'usage quotidien et protéger le compte contre une facture inattendue.
alter table public.profiles add column if not exists ai_calls_today integer not null default 0;
alter table public.profiles add column if not exists ai_calls_reset_at date not null default current_date;
