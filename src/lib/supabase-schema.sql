
-- 1. USERS
create table if not exists public.users (
  id uuid references auth.users not null primary key,
  email text not null,
  name text,
  role text default 'user',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 1b. SETTINGS (key-value)
create table if not exists public.settings (
  key text primary key,
  value text,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. LEADS
create table if not exists public.leads (
  id uuid default uuid_generate_v4() primary key,
  phone text unique not null,
  name text,
  email text,
  source text default 'site',
  channel text,
  campaign text,
  city text,
  state text,
  country text,
  zipcode text,
  company text,
  job_title text,
  industry text,
  company_size text,
  budget_min numeric,
  budget_max numeric,
  potential_value numeric,
  currency text default 'BRL',
  stage text default 'new', -- new, qualifying, proposal, won, lost
  score int default 0,
  tags jsonb default '[]'::jsonb,
  pipeline_id uuid,
  pipeline_stage_id uuid,
  last_contact_at timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. CONVERSATIONS
create table if not exists public.conversations (
  id uuid default uuid_generate_v4() primary key,
  lead_id uuid references public.leads(id) on delete cascade not null,
  channel text default 'whatsapp', -- whatsapp, email, sms, telegram
  status text default 'open', -- open, pending, closed
  last_provider text,
  assigned_to uuid references public.users(id),
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4. MESSAGES
create table if not exists public.messages (
  id uuid default uuid_generate_v4() primary key,
  conversation_id uuid references public.conversations(id) on delete cascade not null,
  direction text not null, -- in, out
  channel text default 'whatsapp',
  content text not null,
  attachment_url text,
  attachment_type text,
  template_name text,
  status text default 'sent', -- sent, delivered, read, failed, queued
  provider_message_id text,
  metadata jsonb default '{}'::jsonb,
  raw jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 5. OFFERS
create table if not exists public.offers (
  id uuid default uuid_generate_v4() primary key,
  title text not null,
  slug text unique not null,
  price numeric not null,
  price_original numeric,
  discount_percentage numeric,
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
create table if not exists public.events (
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
alter table public.leads add column if not exists last_interaction_at timestamp with time zone;

-- POLICIES (Simplified for initial setup)
create policy "Public read offers" on public.offers for select using (true);
create policy "Authenticated access all" on public.leads for all using (auth.role() = 'authenticated');
create policy "Authenticated access events" on public.events for all using (auth.role() = 'authenticated');
create policy "Public insert events" on public.events for insert with check (true);

-- 8. CATEGORIES
create table if not exists public.categories (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  slug text unique not null,
  description text,
  image_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 9. CATALOG TAGS
create table if not exists public.catalog_tags (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  slug text unique not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 10. PRICE HISTORY
create table if not exists public.price_history (
  id uuid default uuid_generate_v4() primary key,
  offer_id uuid references public.offers(id) on delete cascade,
  price numeric not null,
  currency text default 'BRL',
  recorded_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 11. OFFER REVIEWS
create table if not exists public.offer_reviews (
  id uuid default uuid_generate_v4() primary key,
  offer_id uuid references public.offers(id) on delete cascade,
  author text,
  rating numeric,
  comment text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 12. OFFER FAQS
create table if not exists public.offer_faqs (
  id uuid default uuid_generate_v4() primary key,
  offer_id uuid references public.offers(id) on delete cascade,
  question text not null,
  answer text,
  position int default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 13. OFFER ENRICHMENTS
alter table public.offers add column if not exists currency text default 'BRL';
alter table public.offers add column if not exists images jsonb default '[]'::jsonb;
alter table public.offers add column if not exists tags jsonb default '[]'::jsonb;
alter table public.offers add column if not exists updated_at timestamp with time zone default timezone('utc'::text, now());
alter table public.offers add column if not exists rating numeric;

-- POLICIES FOR NEW TABLES
alter table public.categories enable row level security;
alter table public.catalog_tags enable row level security;
alter table public.price_history enable row level security;
alter table public.offer_reviews enable row level security;
alter table public.offer_faqs enable row level security;

create policy "Public read categories" on public.categories for select using (true);
create policy "Public read tags" on public.catalog_tags for select using (true);
create policy "Public read price history" on public.price_history for select using (true);
create policy "Public read reviews" on public.offer_reviews for select using (true);
create policy "Public read faqs" on public.offer_faqs for select using (true);

-- 14. PIPELINES
create table if not exists public.pipelines (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  type text default 'sales', -- sales, post-sales, support, reengagement
  color text default '#f97316',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table if not exists public.pipeline_stages (
  id uuid default uuid_generate_v4() primary key,
  pipeline_id uuid references public.pipelines(id) on delete cascade,
  key text not null,
  name text not null,
  order_index int default 0,
  probability int default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 15. LEAD ACTIVITIES & TASKS
create table if not exists public.lead_interactions (
  id uuid default uuid_generate_v4() primary key,
  lead_id uuid references public.leads(id) on delete cascade,
  type text not null, -- call, email, message, meeting, note
  channel text,
  content text,
  metadata jsonb default '{}'::jsonb,
  created_by uuid references public.users(id),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table if not exists public.lead_tasks (
  id uuid default uuid_generate_v4() primary key,
  lead_id uuid references public.leads(id) on delete cascade,
  title text not null,
  due_at timestamp with time zone,
  status text default 'open', -- open, done, snoozed
  priority text default 'normal', -- low, normal, high
  channel text,
  assignee uuid references public.users(id),
  reminder_at timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 16. AUTOMATION RULES
create table if not exists public.automation_rules (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  trigger text not null, -- lead_created, stage_changed, form_answered, interaction_logged
  conditions jsonb default '{}'::jsonb,
  actions jsonb default '[]'::jsonb,
  active boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 18. MESSAGE TEMPLATES (WhatsApp / Email / SMS)
create table if not exists public.message_templates (
  id uuid default uuid_generate_v4() primary key,
  name text unique not null,
  channel text not null, -- whatsapp, email, sms
  language text default 'pt_BR',
  title text,
  subject text,
  body text not null,
  placeholders jsonb default '[]'::jsonb,
  approved boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.message_templates add column if not exists name text unique;
alter table public.message_templates add column if not exists channel text;
alter table public.message_templates add column if not exists language text default 'pt_BR';
alter table public.message_templates add column if not exists title text;
alter table public.message_templates add column if not exists subject text;
alter table public.message_templates add column if not exists body text;
alter table public.message_templates add column if not exists placeholders jsonb default '[]'::jsonb;
alter table public.message_templates add column if not exists approved boolean default false;

update public.message_templates
set name = coalesce(name, 'template_' || id),
    channel = coalesce(channel, 'whatsapp'),
    title = coalesce(title, name, 'Template'),
    body = coalesce(body, 'Sem corpo definido.'),
    approved = coalesce(approved, false);

alter table public.message_templates alter column name set not null;
alter table public.message_templates alter column channel set not null;
alter table public.message_templates alter column body set not null;
-- evitar falhas de NOT NULL em ambientes existentes
alter table public.message_templates alter column title drop not null;

-- 19. PROVIDER ACCOUNTS (per channel)
create table if not exists public.provider_accounts (
  id uuid default uuid_generate_v4() primary key,
  type text not null, -- whatsapp, email, sms, telegram
  name text,
  credentials jsonb not null,
  active boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.message_templates enable row level security;
alter table public.provider_accounts enable row level security;
create policy "Public read templates" on public.message_templates for select using (true);
create policy "Authenticated provider accounts" on public.provider_accounts for all using (auth.role() = 'authenticated');

-- Seeds for approved templates (idempotent)
insert into public.message_templates (name, channel, language, subject, body, approved)
values 
  ('pedido_confirmacao', 'whatsapp', 'pt_BR', null, 'Seu pedido {{order_id}} foi confirmado! Previsão de envio: {{ship_date}}.', true),
  ('lembrete_pagamento', 'whatsapp', 'pt_BR', null, 'Lembrete: pagamento pendente do pedido {{order_id}}. Clique para concluir: {{payment_link}}', true),
  ('pos_venda_checkin', 'whatsapp', 'pt_BR', null, 'Tudo certo com sua compra {{order_id}}? Responda 1 para sim, 2 para falar com um atendente.', true)
on conflict (name) do nothing;

-- 20. ORDERS (Shopee / e-commerce)
create table if not exists public.orders (
  id uuid default uuid_generate_v4() primary key,
  order_sn text unique not null,
  status text,
  buyer_id text,
  shop_id text,
  total_amount numeric,
  currency text default 'BRL',
  commission_amount numeric,
  shipping_fee numeric,
  payment_method text,
  payout_status text,
  est_delivery_at timestamp with time zone,
  delivered_at timestamp with time zone,
  canceled_at timestamp with time zone,
  source text default 'shopee',
  affiliate boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table if not exists public.order_items (
  id uuid default uuid_generate_v4() primary key,
  order_id uuid references public.orders(id) on delete cascade,
  product_id text,
  sku text,
  name text,
  quantity int,
  price numeric,
  currency text default 'BRL',
  commission_amount numeric,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table if not exists public.shipments (
  id uuid default uuid_generate_v4() primary key,
  order_id uuid references public.orders(id) on delete cascade,
  tracking_number text,
  carrier text,
  status text,
  eta_at timestamp with time zone,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table if not exists public.payouts (
  id uuid default uuid_generate_v4() primary key,
  order_id uuid references public.orders(id) on delete cascade,
  amount numeric,
  fee numeric,
  currency text default 'BRL',
  released_at timestamp with time zone,
  status text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 17. CALENDAR CONNECTIONS
create table if not exists public.calendar_accounts (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.users(id),
  provider text, -- google, outlook
  email text,
  access_token text,
  refresh_token text,
  expires_at timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table if not exists public.calendar_events (
  id uuid default uuid_generate_v4() primary key,
  lead_id uuid references public.leads(id) on delete cascade,
  calendar_account_id uuid references public.calendar_accounts(id) on delete cascade,
  external_id text,
  title text,
  start_at timestamp with time zone,
  end_at timestamp with time zone,
  location text,
  status text default 'confirmed',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS for new tables
alter table public.pipelines enable row level security;
alter table public.pipeline_stages enable row level security;
alter table public.lead_interactions enable row level security;
alter table public.lead_tasks enable row level security;
alter table public.automation_rules enable row level security;
alter table public.calendar_accounts enable row level security;
alter table public.calendar_events enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.shipments enable row level security;
alter table public.payouts enable row level security;

create policy "Public read pipelines" on public.pipelines for select using (true);
create policy "Public read pipeline stages" on public.pipeline_stages for select using (true);
create policy "Authenticated leads interactions" on public.lead_interactions for all using (auth.role() = 'authenticated');
create policy "Authenticated leads tasks" on public.lead_tasks for all using (auth.role() = 'authenticated');
create policy "Authenticated automation rules" on public.automation_rules for all using (auth.role() = 'authenticated');
create policy "Authenticated calendar accounts" on public.calendar_accounts for all using (auth.role() = 'authenticated');
create policy "Authenticated calendar events" on public.calendar_events for all using (auth.role() = 'authenticated');
create policy "Public read orders" on public.orders for select using (true);
create policy "Public read order items" on public.order_items for select using (true);
create policy "Public read shipments" on public.shipments for select using (true);
create policy "Public read payouts" on public.payouts for select using (true);

-- 21. AUDIT LOG
create table if not exists public.audit_log (
  id uuid default uuid_generate_v4() primary key,
  actor_user_id uuid references public.users(id),
  action text not null,
  entity text not null,
  entity_id uuid,
  before_state jsonb default '{}'::jsonb,
  after_state jsonb default '{}'::jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);
alter table public.audit_log enable row level security;
create policy "Authenticated access audit_log" on public.audit_log for all using (auth.role() = 'authenticated');

-- 22. BOT CONFIG
create table if not exists public.bot_config (
  id uuid default uuid_generate_v4() primary key,
  active_versions jsonb default '{}'::jsonb,
  make_bot_token text,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);
alter table public.bot_config enable row level security;
create policy "Authenticated access bot_config" on public.bot_config for all using (auth.role() = 'authenticated');

-- 23. PROMPT FLOWS
create table if not exists public.prompt_flows (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  "key" text unique not null,
  status text default 'draft',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now())
);
alter table public.prompt_flows enable row level security;
create policy "Authenticated access prompt_flows" on public.prompt_flows for all using (auth.role() = 'authenticated');

-- 24. PROMPT VERSIONS
create table if not exists public.prompt_versions (
  id uuid default uuid_generate_v4() primary key,
  flow_id uuid references public.prompt_flows(id) on delete cascade,
  version int not null,
  status text default 'draft',
  content text,
  variables_schema jsonb default '{}'::jsonb,
  rules jsonb default '{}'::jsonb,
  created_by uuid references public.users(id),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now())
);
alter table public.prompt_versions enable row level security;
create policy "Authenticated access prompt_versions" on public.prompt_versions for all using (auth.role() = 'authenticated');
