-- Run after `prisma db push`. The app connects as the table owner, so these
-- policies only restrict Supabase's anon/authenticated API roles.

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
