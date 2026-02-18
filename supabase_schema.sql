-- Kabarak University Voting Platform - Supabase Schema

-- 1. Create Profiles Table
-- Stores user identity and voting status
create table public.profiles (
  id uuid references auth.users on delete cascade not null primary key,
  full_name text not null,
  email text unique not null,
  registration_number text,
  has_voted boolean default false,
  role text default 'student' check (role in ('student', 'admin')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.profiles enable row level security;
create policy "Public profiles are viewable by everyone." on public.profiles for select using (true);
create policy "Users can update own profile." on public.profiles for update using (auth.uid() = id);

-- 2. Create Positions Table
-- E.g. Chairperson, Secretary General
create table public.positions (
  id uuid default uuid_generate_v4() primary key,
  title text not null,
  "order" integer default 0
);

-- 3. Create Candidates Table
-- Linked to a specific position
create table public.candidates (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  position_id uuid references public.positions(id) on delete cascade,
  manifesto_text text,
  image_url text
);

-- 4. Create Votes Table
-- Anonymous votes. Note: No direct link to 'profiles' to ensure ballot secrecy.
create table public.votes (
  id uuid default uuid_generate_v4() primary key,
  position_id uuid references public.positions(id),
  candidate_id uuid references public.candidates(id),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 5. Secure Voting Function (Database Transaction)
-- Checks if user voted -> Inserts votes -> Marks user as voted -> Returns success
create or replace function cast_vote(
  p_votes jsonb -- [{"position_id": "uuid", "candidate_id": "uuid"}]
) returns jsonb
language plpgsql
security definer
as $$
declare
  vote_record jsonb;
  v_user_id uuid;
begin
  -- Get current user ID from auth context
  v_user_id := auth.uid();
  
  -- Validation: Check if user exists and hasn't voted
  if exists (select 1 from public.profiles where id = v_user_id and has_voted = true) then
    return jsonb_build_object('success', false, 'error', 'User has already voted');
  end if;

  -- Insert votes for each position
  for vote_record in select * from jsonb_array_elements(p_votes)
  loop
    insert into public.votes (position_id, candidate_id)
    values ((vote_record->>'position_id')::uuid, (vote_record->>'candidate_id')::uuid);
  end loop;

  -- Mark profile as has_voted
  update public.profiles
  set has_voted = true
  where id = v_user_id;

  -- Return success and a transaction hash (simulated)
  return jsonb_build_object(
    'success', true, 
    'receipt', encode(digest(v_user_id::text || now()::text, 'sha256'), 'hex')
  );
exception when others then
  return jsonb_build_object('success', false, 'error', SQLERRM);
end;
$$;
