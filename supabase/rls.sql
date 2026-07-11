-- Row Level Security for tables created by Prisma.
-- The app itself talks to Postgres through Prisma with the postgres role
-- (which owns the tables and is not subject to these policies), so RLS here
-- is defense-in-depth: it stops the anon/authenticated PostgREST surface
-- from reading other users' rows if it is ever enabled.
--
-- Run in the Supabase SQL editor AFTER `prisma db push`.

alter table "User" enable row level security;
alter table "Subscription" enable row level security;
alter table "Generation" enable row level security;

create policy "Users can read own profile"
  on "User" for select
  using (auth.uid()::text = id);

create policy "Users can read own subscription"
  on "Subscription" for select
  using (auth.uid()::text = "userId");

create policy "Users can read own generations"
  on "Generation" for select
  using (auth.uid()::text = "userId");

-- No insert/update/delete policies on purpose: all writes go through the
-- app's API routes (service connection), never from the client.
