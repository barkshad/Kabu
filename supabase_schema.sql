-- 1. Create Profiles Table (Linked to Auth)
create table public.profiles (
  id uuid references auth.users on delete cascade not null primary key,
  full_name text,
  email text unique not null,
  has_voted boolean default false,
  role text default 'student' check (role in ('student', 'admin')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.profiles enable row level security;

-- Policies for Profiles
create policy "Public profiles are viewable by everyone." on public.profiles for select using (true);
create policy "Users can insert their own profile." on public.profiles for insert with check (auth.uid() = id);
create policy "Users can update own profile." on public.profiles for update using (auth.uid() = id);

-- 2. Create Positions Table
create table public.positions (
  id uuid default uuid_generate_v4() primary key,
  title text not null,
  "order" integer default 0
);

-- 3. Create Candidates Table
create table public.candidates (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  position_id uuid references public.positions(id) on delete cascade,
  manifesto_text text,
  image_url text
);

-- 4. Create Votes Table (Anonymous)
-- Note: We do NOT link to profiles here to ensure anonymity at the database level.
create table public.votes (
  id uuid default uuid_generate_v4() primary key,
  position_id uuid references public.positions(id),
  candidate_id uuid references public.candidates(id),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 5. Helper Function for Transactional Voting
-- This function ensures a user is marked as voted AND the vote is cast in one transaction.
create or replace function cast_vote(
  p_user_id uuid,
  p_votes jsonb -- Expected format: [{"position_id": "...", "candidate_id": "..."}]
) returns boolean
language plpgsql
security definer
as $$
declare
  vote_record jsonb;
begin
  -- Check if user has already voted
  if exists (select 1 from public.profiles where id = p_user_id and has_voted = true) then
    raise exception 'User has already voted';
  end if;

  -- Insert votes
  for vote_record in select * from jsonb_array_elements(p_votes)
  loop
    insert into public.votes (position_id, candidate_id)
    values ((vote_record->>'position_id')::uuid, (vote_record->>'candidate_id')::uuid);
  end loop;

  -- Mark user as voted
  update public.profiles
  set has_voted = true
  where id = p_user_id;

  return true;
end;
$$;