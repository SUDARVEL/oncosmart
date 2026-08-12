-- UX Portfolio schema
-- Run in a NEW Supabase project (separate from other apps).

create extension if not exists "pgcrypto";

create table if not exists public.profile (
  id uuid primary key default gen_random_uuid(),
  display_name text not null,
  headline text,
  bio text,
  email text,
  linkedin_url text,
  resume_pdf_path text,
  updated_at timestamptz not null default now()
);

create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  tagline text,
  role text,
  year text,
  tags text[] default '{}',
  cover_path text,
  gallery_x double precision,
  gallery_y double precision,
  gallery_z double precision,
  sort_order int not null default 0,
  published boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.project_sections (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects (id) on delete cascade,
  heading text not null,
  body text not null,
  images text[] default '{}',
  sort_order int not null default 0
);

create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  message text not null,
  created_at timestamptz not null default now()
);

alter table public.profile enable row level security;
alter table public.projects enable row level security;
alter table public.project_sections enable row level security;
alter table public.messages enable row level security;

create policy "Public can read profile"
  on public.profile for select
  to anon, authenticated
  using (true);

create policy "Public can read published projects"
  on public.projects for select
  to anon, authenticated
  using (published = true);

create policy "Public can read sections of published projects"
  on public.project_sections for select
  to anon, authenticated
  using (
    exists (
      select 1 from public.projects p
      where p.id = project_id and p.published = true
    )
  );

create policy "Anyone can submit contact messages"
  on public.messages for insert
  to anon, authenticated
  with check (true);

-- Storage: create a public bucket named `portfolio-media` in the dashboard.
-- Recommended folders: covers/, case-studies/, resume/
