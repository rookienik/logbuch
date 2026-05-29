-- Run this in Supabase → SQL Editor → New query

create table cases (
  id        text primary key,
  fallnr    text,
  date      text not null,
  role      text not null,
  note      text,
  tags      text,
  created_at timestamptz default now()
);

-- Allow all operations without login (single-user app with secret key)
alter table cases enable row level security;

create policy "Allow all" on cases
  for all
  using (true)
  with check (true);
