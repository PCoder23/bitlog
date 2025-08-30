-- Create foods table
create table if not exists public.foods (
  id uuid primary key default gen_random_uuid(),
  name text unique not null,
  calories_per_100g numeric not null,
  protein_g numeric not null,
  carbs_g numeric not null,
  fat_g numeric not null,
  tags text[] default '{}',
  notes text,
  created_at timestamptz default now()
);

-- Enable RLS
alter table public.foods enable row level security;

-- Allow anonymous read access to foods
drop policy if exists "Public can read foods" on public.foods;
create policy "Public can read foods"
  on public.foods
  for select
  to anon
  using (true);

-- No insert/update/delete for anon (service role bypasses RLS)
