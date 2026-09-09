-- Schema for the tweet emotion labeling task.
--
-- Gold labels are deliberately NOT stored here. They ship with the app in
-- data/tweets.json, stay server-side, and never reach the browser or the
-- database, so a leaked publishable key cannot expose the answer key.

create table if not exists public.sessions (
  id                 uuid primary key,
  display_name       text,
  assigned_tweet_ids text[] not null,
  started_at         timestamptz not null default now(),
  completed_at       timestamptz,
  constraint assigned_five check (array_length(assigned_tweet_ids, 1) = 5)
);

comment on table public.sessions is
  'One row per participant. assigned_tweet_ids records the 5 tweets drawn for
   them at start, so a dropout is distinguishable from someone who never began.';

create table if not exists public.labels (
  id         uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.sessions(id) on delete cascade,
  tweet_id   text not null,
  label      text not null
             check (label in ('anger','fear','joy','love','sadness','surprise')),
  created_at timestamptz not null default now(),
  unique (session_id, tweet_id)
);

comment on table public.labels is
  'One row per judgment: who labeled which tweet with which label.';

create index if not exists labels_session_id_idx on public.labels (session_id);

alter table public.sessions enable row level security;
alter table public.labels   enable row level security;

-- Participants may start a session, mark it complete, and submit labels.
-- There is deliberately no SELECT policy: the publishable key can write
-- data but cannot read anyone's responses back.
create policy sessions_insert on public.sessions
  for insert to anon with check (true);

create policy sessions_update on public.sessions
  for update to anon using (true) with check (true);

create policy labels_insert on public.labels
  for insert to anon with check (true);
