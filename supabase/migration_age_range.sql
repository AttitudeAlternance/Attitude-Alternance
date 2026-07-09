-- ============================================================================
-- Migration — Tranche d'âge (statistiques démographiques agrégées)
-- À exécuter en plus des migrations précédentes déjà en place
-- ============================================================================

alter table public.profiles add column if not exists age_range text;
