-- ============================================================================
-- Migration — Statut administrateur (pour la page /dashboard/admin)
-- À exécuter en plus des migrations précédentes déjà en place
-- ============================================================================

alter table public.profiles add column if not exists is_admin boolean not null default false;

-- Après avoir exécuté cette requête, remplacez l'email ci-dessous par le vôtre
-- et exécutez cette ligne séparément pour vous donner accès à la page /dashboard/admin :
--
-- update public.profiles set is_admin = true where email = 'votre-email@exemple.com';
