-- ============================================================================
-- Migration — Programme de parrainage
-- À exécuter en plus des migrations précédentes déjà en place
-- ============================================================================

alter table public.profiles add column if not exists referral_code text unique;
alter table public.profiles add column if not exists referred_by uuid references auth.users(id);
alter table public.profiles add column if not exists bonus_applications integer not null default 0;

-- Génère un code de parrainage pour les profils déjà existants qui n'en ont pas encore
update public.profiles
set referral_code = substr(md5(random()::text || id::text), 1, 8)
where referral_code is null;

-- Met à jour la création automatique de profil pour générer un code de parrainage dès l'inscription
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, first_name, email, referral_code)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'first_name', ''),
    new.email,
    substr(md5(random()::text || new.id::text), 1, 8)
  );
  return new;
end;
$$ language plpgsql security definer;
