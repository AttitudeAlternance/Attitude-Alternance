-- ============================================================================
-- Migration — Traçabilité de l'acceptation des CGU
-- À exécuter en plus des migrations précédentes déjà en place
-- ============================================================================

alter table public.profiles add column if not exists terms_accepted_at timestamptz;
