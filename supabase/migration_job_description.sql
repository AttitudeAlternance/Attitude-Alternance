-- ============================================================================
-- Migration — Ajout de la description de l'offre sur les candidatures
-- À exécuter en plus de schema.sql et migration_cv.sql déjà en place
-- ============================================================================

alter table public.applications add column if not exists job_description text;
