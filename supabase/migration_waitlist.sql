-- ============================================================================
-- Migration — Liste d'attente Étudiant+ (en attendant l'activation de Stripe)
-- À exécuter en plus des migrations précédentes déjà en place
-- ============================================================================

alter table public.profiles add column if not exists waitlist_joined_at timestamptz;
