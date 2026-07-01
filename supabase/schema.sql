-- ============================================================================
-- Schéma Supabase — AlternanceBoost
-- À exécuter dans l'éditeur SQL de votre projet Supabase (SQL Editor > New query)
-- ============================================================================

-- Extension nécessaire pour générer des UUID
create extension if not exists "uuid-ossp";

-- ----------------------------------------------------------------------------
-- Table: profiles
-- Un profil par utilisateur, lié à auth.users (1-1)
-- ----------------------------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  first_name text,
  last_name text,
  formation text,
  target_city text,
  target_sector text,
  target_role text,
  linkedin_url text,
  cv_url text,
  goal text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.profiles is 'Informations complémentaires de chaque étudiant, en 1-1 avec auth.users';

-- ----------------------------------------------------------------------------
-- Table: applications
-- Une ligne = une candidature suivie dans le CRM
-- ----------------------------------------------------------------------------
create type public.application_status as enum (
  'a_candidater',
  'envoyee',
  'relance_a_faire',
  'entretien_obtenu',
  'refus',
  'accepte'
);

create table if not exists public.applications (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users (id) on delete cascade,
  company text not null,
  role text not null,
  offer_url text,
  applied_at date,
  status public.application_status not null default 'a_candidater',
  linkedin_contact text,
  contact_email text,
  next_followup_at date,
  comment text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists applications_user_id_idx on public.applications (user_id);
create index if not exists applications_status_idx on public.applications (status);
create index if not exists applications_followup_idx on public.applications (next_followup_at);

comment on table public.applications is 'Candidatures suivies par un étudiant (CRM alternance)';

-- ----------------------------------------------------------------------------
-- Table: generated_messages
-- Historique des messages générés par le générateur IA
-- ----------------------------------------------------------------------------
create type public.message_type as enum (
  'candidature',
  'relance',
  'linkedin',
  'remerciement'
);

create table if not exists public.generated_messages (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users (id) on delete cascade,
  application_id uuid references public.applications (id) on delete set null,
  type public.message_type not null,
  company text,
  role text,
  recruiter_name text,
  tone text,
  content text not null,
  created_at timestamptz not null default now()
);

create index if not exists generated_messages_user_id_idx on public.generated_messages (user_id);

comment on table public.generated_messages is 'Historique des mails / messages LinkedIn générés par le générateur IA';

-- ----------------------------------------------------------------------------
-- Fonction utilitaire : mise à jour automatique de updated_at
-- ----------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists set_updated_at on public.profiles;
create trigger set_updated_at before update on public.profiles
  for each row execute procedure public.set_updated_at();

drop trigger if exists set_updated_at on public.applications;
create trigger set_updated_at before update on public.applications
  for each row execute procedure public.set_updated_at();

-- ----------------------------------------------------------------------------
-- Création automatique d'un profil vide à l'inscription
-- ----------------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, first_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'first_name', ''));
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ============================================================================
-- Row Level Security (RLS) : chaque utilisateur ne voit / modifie que ses données
-- ============================================================================
alter table public.profiles enable row level security;
alter table public.applications enable row level security;
alter table public.generated_messages enable row level security;

-- profiles
create policy "profiles_select_own" on public.profiles
  for select using (auth.uid() = id);
create policy "profiles_update_own" on public.profiles
  for update using (auth.uid() = id);
create policy "profiles_insert_own" on public.profiles
  for insert with check (auth.uid() = id);

-- applications
create policy "applications_select_own" on public.applications
  for select using (auth.uid() = user_id);
create policy "applications_insert_own" on public.applications
  for insert with check (auth.uid() = user_id);
create policy "applications_update_own" on public.applications
  for update using (auth.uid() = user_id);
create policy "applications_delete_own" on public.applications
  for delete using (auth.uid() = user_id);

-- generated_messages
create policy "messages_select_own" on public.generated_messages
  for select using (auth.uid() = user_id);
create policy "messages_insert_own" on public.generated_messages
  for insert with check (auth.uid() = user_id);
create policy "messages_delete_own" on public.generated_messages
  for delete using (auth.uid() = user_id);
