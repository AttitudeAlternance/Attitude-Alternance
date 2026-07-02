-- ============================================================================
-- Migration — Objectif hebdomadaire de candidatures
-- À exécuter en plus des migrations précédentes déjà en place
-- ============================================================================

alter table public.profiles add column if not exists weekly_goal integer not null default 5;
