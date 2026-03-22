-- Run this in Supabase SQL Editor

create table posts (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  description text not null,
  link text,
  created_at timestamptz default now()
);

-- Enable Row Level Security
alter table posts enable row level security;

-- Allow anyone to read posts
create policy "Anyone can read posts"
  on posts for select
  using (true);

-- Allow anyone to insert posts
create policy "Anyone can insert posts"
  on posts for insert
  with check (true);
