-- Préférences de recherche d'offres d'alternance (API La bonne alternance).
-- target_city et target_sector existent déjà et restent inchangés (utilisés ailleurs en texte libre).
-- target_sectors est un nouveau champ dédié : une liste de secteurs prédéfinis, mappés vers des
-- codes ROME officiels côté code (voir src/lib/romeSecteurs.ts), nécessaire pour interroger l'API.
alter table public.profiles
  add column if not exists target_sectors text[] not null default '{}',
  add column if not exists search_radius integer not null default 30,
  add column if not exists notify_new_offers boolean not null default true,
  add column if not exists signup_source text,
  add column if not exists phone text;

comment on column public.profiles.target_sectors is 'Secteurs prédéfinis choisis par l''étudiant pour la recherche d''offres (clés de src/lib/romeSecteurs.ts)';
comment on column public.profiles.search_radius is 'Rayon de recherche en km autour de target_city (valeurs usuelles : 10, 30, 60, 100)';
comment on column public.profiles.notify_new_offers is 'Si vrai, l''étudiant reçoit un email quotidien listant les nouvelles offres correspondant à ses préférences';
comment on column public.profiles.signup_source is 'Origine de l''inscription si présente dans l''URL (?src=...), ex. "linkedin-lancement" — pour repérer une campagne précise dans la page Admin';
comment on column public.profiles.phone is 'Numéro de téléphone, requis pour la candidature en 1 clic via l''API La bonne alternance (POST /job/v1/apply)';
