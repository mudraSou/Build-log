-- Run this in Supabase SQL Editor to add the title column
alter table posts add column if not exists title text;
