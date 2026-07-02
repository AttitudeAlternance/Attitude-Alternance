-- ============================================================================
-- Migration — Email dans profiles (nécessaire pour les rappels de relance)
-- À exécuter en plus des migrations précédentes déjà en place
-- ============================================================================

alter table public.profiles add column if not exists email text;

-- Remplit l'email des profils déjà existants à partir de auth.users
update public.profiles p
set email = u.email
from auth.users u
where p.id = u.id and p.email is null;

-- Met à jour la création automatique de profil pour inclure l'email dès l'inscription
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, first_name, email)
  values (new.id, coalesce(new.raw_user_meta_data->>'first_name', ''), new.email);
  return new;
end;
$$ language plpgsql security definer;
