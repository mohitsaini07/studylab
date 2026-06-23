-- StudyLab database, storage, indexes, triggers, and RLS policies.
-- Run this entire file in the Supabase SQL editor once.

create extension if not exists pgcrypto;

create table if not exists public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  first_name text,
  last_name text,
  avatar_url text,
  created_at timestamptz not null default now()
);

alter table public.users add column if not exists first_name text;
alter table public.users add column if not exists last_name text;
alter table public.users add column if not exists avatar_url text;

create table if not exists public.study_sets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  title text not null check (char_length(title) between 1 and 180),
  file_name text not null,
  file_url text not null,
  summary text not null default '',
  topics jsonb not null default '[]'::jsonb,
  page_count integer not null default 0 check (page_count >= 0),
  status text not null default 'processing' check (status in ('processing','ready','failed')),
  error_message text,
  created_at timestamptz not null default now()
);

create table if not exists public.questions (
  id uuid primary key default gen_random_uuid(),
  study_set_id uuid not null references public.study_sets(id) on delete cascade,
  type text not null check (type in ('mcq','short','long')),
  question text not null,
  answer text not null,
  options jsonb,
  topic text,
  explanation text,
  created_at timestamptz not null default now()
);

create table if not exists public.flashcards (
  id uuid primary key default gen_random_uuid(),
  study_set_id uuid not null references public.study_sets(id) on delete cascade,
  front text not null,
  back text not null,
  topic text,
  created_at timestamptz not null default now()
);

create table if not exists public.quiz_attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  study_set_id uuid not null references public.study_sets(id) on delete cascade,
  score integer not null check (score >= 0),
  total_questions integer not null check (total_questions > 0),
  weak_topics jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.flashcard_reviews (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  study_set_id uuid not null references public.study_sets(id) on delete cascade,
  reviewed_count integer not null check (reviewed_count >= 0),
  known_count integer not null check (known_count >= 0),
  completed boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.user_settings (
  user_id uuid primary key references public.users(id) on delete cascade,
  daily_reminder boolean not null default true,
  weekly_report boolean not null default true,
  study_set_ready boolean not null default true,
  product_updates boolean not null default false,
  compact_sidebar boolean not null default false,
  reduce_motion boolean not null default false,
  keep_pdfs boolean not null default true,
  learning_analytics boolean not null default true,
  updated_at timestamptz not null default now()
);

create index if not exists study_sets_user_created_idx on public.study_sets(user_id, created_at desc);
create index if not exists questions_study_set_idx on public.questions(study_set_id);
create index if not exists flashcards_study_set_idx on public.flashcards(study_set_id);
create index if not exists quiz_attempts_user_created_idx on public.quiz_attempts(user_id, created_at desc);
create index if not exists flashcard_reviews_user_created_idx on public.flashcard_reviews(user_id, created_at desc);

create or replace function public.handle_new_user() returns trigger language plpgsql security definer set search_path = '' as $$
begin
  insert into public.users (id, email, first_name, last_name, avatar_url)
  values (
    new.id,
    coalesce(new.email, ''),
    nullif(coalesce(new.raw_user_meta_data ->> 'first_name', split_part(coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name', ''), ' ', 1)), ''),
    nullif(coalesce(new.raw_user_meta_data ->> 'last_name', regexp_replace(coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name', ''), '^\S+\s*', '')), ''),
    nullif(coalesce(new.raw_user_meta_data ->> 'avatar_url', new.raw_user_meta_data ->> 'picture', new.raw_user_meta_data ->> 'photo_url'), '')
  )
  on conflict (id) do update set
    email = excluded.email,
    first_name = coalesce(excluded.first_name, public.users.first_name),
    last_name = coalesce(excluded.last_name, public.users.last_name),
    avatar_url = coalesce(excluded.avatar_url, public.users.avatar_url);
  return new;
end;
$$;
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert or update of email, raw_user_meta_data on auth.users for each row execute procedure public.handle_new_user();
insert into public.users (id, email, first_name, last_name, avatar_url)
select
  id,
  coalesce(email, ''),
  nullif(coalesce(raw_user_meta_data ->> 'first_name', split_part(coalesce(raw_user_meta_data ->> 'full_name', raw_user_meta_data ->> 'name', ''), ' ', 1)), ''),
  nullif(coalesce(raw_user_meta_data ->> 'last_name', regexp_replace(coalesce(raw_user_meta_data ->> 'full_name', raw_user_meta_data ->> 'name', ''), '^\S+\s*', '')), ''),
  nullif(coalesce(raw_user_meta_data ->> 'avatar_url', raw_user_meta_data ->> 'picture', raw_user_meta_data ->> 'photo_url'), '')
from auth.users
on conflict (id) do update set
  email = excluded.email,
  first_name = coalesce(excluded.first_name, public.users.first_name),
  last_name = coalesce(excluded.last_name, public.users.last_name),
  avatar_url = coalesce(excluded.avatar_url, public.users.avatar_url);

alter table public.users enable row level security;
alter table public.study_sets enable row level security;
alter table public.questions enable row level security;
alter table public.flashcards enable row level security;
alter table public.quiz_attempts enable row level security;
alter table public.flashcard_reviews enable row level security;
alter table public.user_settings enable row level security;

drop policy if exists "users_read_self" on public.users;
drop policy if exists "users_insert_self" on public.users;
drop policy if exists "users_update_self" on public.users;
drop policy if exists "study_sets_owner_all" on public.study_sets;
drop policy if exists "questions_owner_all" on public.questions;
drop policy if exists "flashcards_owner_all" on public.flashcards;
drop policy if exists "quiz_attempts_owner_all" on public.quiz_attempts;
drop policy if exists "flashcard_reviews_owner_all" on public.flashcard_reviews;
drop policy if exists "user_settings_owner_all" on public.user_settings;

create policy "users_read_self" on public.users for select to authenticated using ((select auth.uid()) = id);
create policy "users_insert_self" on public.users for insert to authenticated with check ((select auth.uid()) = id);
create policy "users_update_self" on public.users for update to authenticated using ((select auth.uid()) = id) with check ((select auth.uid()) = id);
create policy "study_sets_owner_all" on public.study_sets for all to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "questions_owner_all" on public.questions for all to authenticated using (exists (select 1 from public.study_sets s where s.id = study_set_id and s.user_id = (select auth.uid()))) with check (exists (select 1 from public.study_sets s where s.id = study_set_id and s.user_id = (select auth.uid())));
create policy "flashcards_owner_all" on public.flashcards for all to authenticated using (exists (select 1 from public.study_sets s where s.id = study_set_id and s.user_id = (select auth.uid()))) with check (exists (select 1 from public.study_sets s where s.id = study_set_id and s.user_id = (select auth.uid())));
create policy "quiz_attempts_owner_all" on public.quiz_attempts for all to authenticated using ((select auth.uid()) = user_id and exists (select 1 from public.study_sets s where s.id = study_set_id and s.user_id = (select auth.uid()))) with check ((select auth.uid()) = user_id and exists (select 1 from public.study_sets s where s.id = study_set_id and s.user_id = (select auth.uid())));
create policy "flashcard_reviews_owner_all" on public.flashcard_reviews for all to authenticated using ((select auth.uid()) = user_id and exists (select 1 from public.study_sets s where s.id = study_set_id and s.user_id = (select auth.uid()))) with check ((select auth.uid()) = user_id and exists (select 1 from public.study_sets s where s.id = study_set_id and s.user_id = (select auth.uid())));
create policy "user_settings_owner_all" on public.user_settings for all to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('study-pdfs', 'study-pdfs', false, 26214400, array['application/pdf'])
on conflict (id) do update set public = false, file_size_limit = excluded.file_size_limit, allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "pdf_owner_select" on storage.objects;
drop policy if exists "pdf_owner_insert" on storage.objects;
drop policy if exists "pdf_owner_delete" on storage.objects;

create policy "pdf_owner_select" on storage.objects for select to authenticated using (bucket_id = 'study-pdfs' and (storage.foldername(name))[1] = (select auth.uid())::text);
create policy "pdf_owner_insert" on storage.objects for insert to authenticated with check (bucket_id = 'study-pdfs' and (storage.foldername(name))[1] = (select auth.uid())::text);
create policy "pdf_owner_delete" on storage.objects for delete to authenticated using (bucket_id = 'study-pdfs' and (storage.foldername(name))[1] = (select auth.uid())::text);
