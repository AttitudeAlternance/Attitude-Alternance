-- ============================================================================
-- Migration — Ajout du support CV (lecture et compréhension de CV PDF)
-- À exécuter en plus du schema.sql déjà en place (ne pas réexécuter schema.sql)
-- ============================================================================

-- Nouvelles colonnes sur profiles pour stocker le CV et son contenu analysé
alter table public.profiles add column if not exists cv_file_path text;
alter table public.profiles add column if not exists cv_text text;
alter table public.profiles add column if not exists cv_summary text;
alter table public.profiles add column if not exists cv_uploaded_at timestamptz;

-- Bucket de stockage privé pour les fichiers CV (PDF)
insert into storage.buckets (id, name, public)
values ('cvs', 'cvs', false)
on conflict (id) do nothing;

-- Chaque étudiant ne peut lire/écrire que dans son propre dossier (nommé avec son user id)
create policy if not exists "cv_select_own"
  on storage.objects for select
  using (bucket_id = 'cvs' and auth.uid()::text = (storage.foldername(name))[1]);

create policy if not exists "cv_insert_own"
  on storage.objects for insert
  with check (bucket_id = 'cvs' and auth.uid()::text = (storage.foldername(name))[1]);

create policy if not exists "cv_update_own"
  on storage.objects for update
  using (bucket_id = 'cvs' and auth.uid()::text = (storage.foldername(name))[1]);

create policy if not exists "cv_delete_own"
  on storage.objects for delete
  using (bucket_id = 'cvs' and auth.uid()::text = (storage.foldername(name))[1]);
