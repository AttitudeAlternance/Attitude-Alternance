-- ============================================================================
-- Migration — Compteur cumulé de candidatures (anti-contournement de la limite gratuite)
-- À exécuter en plus des migrations précédentes déjà en place
-- ============================================================================

-- Nouveau compteur : ne redescend jamais, même si l'étudiant supprime des candidatures.
-- C'est ce compteur qui doit servir à vérifier la limite de l'offre gratuite,
-- plutôt que le nombre de lignes actuellement présentes dans la table applications.
alter table public.profiles add column if not exists total_applications_created integer not null default 0;

-- Initialise le compteur avec le nombre de candidatures déjà existantes,
-- pour ne pas donner un crédit gratuit supplémentaire aux comptes déjà actifs.
update public.profiles p
set total_applications_created = coalesce(sub.cnt, 0)
from (
  select user_id, count(*) as cnt from public.applications group by user_id
) sub
where p.id = sub.user_id;

-- Incrémente automatiquement le compteur à chaque nouvelle candidature créée,
-- peu importe la façon dont elle est insérée (interface, script, etc.).
create or replace function public.increment_total_applications()
returns trigger as $$
begin
  update public.profiles
  set total_applications_created = total_applications_created + 1
  where id = new.user_id;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_application_created on public.applications;
create trigger on_application_created
  after insert on public.applications
  for each row execute procedure public.increment_total_applications();
