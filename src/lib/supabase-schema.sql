
-- 1. USERS
create table public.users (
  id uuid references auth.users not null primary key,
  email text not null,
  name text,
  role text default 'user',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. LEADS
create table public.leads (
  id uuid default uuid_generate_v4() primary key,
  phone text unique not null,
  name text,
  source text default 'site',
  stage text default 'new', -- new, qualifying, proposal, won, lost
  score int default 0,
  tags jsonb default '[]'::jsonb,
  last_contact_at timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. CONVERSATIONS
create table public.conversations (
  id uuid default uuid_generate_v4() primary key,
  lead_id uuid references public.leads(id) on delete cascade not null,
  channel text default 'whatsapp',
  status text default 'open', -- open, pending, closed
  assigned_to uuid references public.users(id),
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4. MESSAGES
create table public.messages (
  id uuid default uuid_generate_v4() primary key,
  conversation_id uuid references public.conversations(id) on delete cascade not null,
  direction text not null, -- in, out
  content text not null,
  raw jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 5. OFFERS
create table public.offers (
  id uuid default uuid_generate_v4() primary key,
  title text not null,
  slug text unique not null,
  price numeric not null,
  category text,
  description text,
  shopee_url text,
  whatsapp_cta_text text,
  status text default 'draft', -- draft, published, expired
  published_at timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  clicks int default 0
);

-- 6. EVENTS (Tracking)
create table public.events (
  id uuid default uuid_generate_v4() primary key,
  type text not null, -- page_view, offer_click, whatsapp_click, lead_submit
  lead_id uuid references public.leads(id),
  offer_id uuid references public.offers(id),
  session_id text,
  utm_source text,
  utm_medium text,
  utm_campaign text,
  utm_content text,
  utm_term text,
  referrer text,
  path text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 7. LEAD QUALIFICATIONS
create table public.lead_qualifications (
  id uuid default uuid_generate_v4() primary key,
  lead_id uuid references public.leads(id) on delete cascade not null,
  budget_range text,
  category_interest text,
  urgency text,
  notes text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ENABLE RLS
alter table public.users enable row level security;
alter table public.leads enable row level security;
alter table public.conversations enable row level security;
alter table public.messages enable row level security;
alter table public.offers enable row level security;
alter table public.events enable row level security;
alter table public.lead_qualifications enable row level security;

-- POLICIES (Simplified for initial setup)
create policy "Public read offers" on public.offers for select using (true);
create policy "Authenticated access all" on public.leads for all using (auth.role() = 'authenticated');
create policy "Authenticated access events" on public.events for all using (auth.role() = 'authenticated');
create policy "Public insert events" on public.events for insert with check (true);
