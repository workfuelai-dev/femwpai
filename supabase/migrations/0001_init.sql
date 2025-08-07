create table if not exists public.contacts (
  id uuid primary key default gen_random_uuid(),
  wa_id text unique not null,
  name text,
  profile_pic text,
  created_at timestamptz not null default now()
);

create table if not exists public.conversations (
  id uuid primary key default gen_random_uuid(),
  contact_id uuid not null references public.contacts(id) on delete cascade,
  auto_reply_enabled boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  direction text not null check (direction in ('in','out')),
  type text not null,
  wa_message_id text,
  content_text text,
  payload jsonb,
  status text,
  created_at timestamptz not null default now()
);

create index if not exists idx_messages_conv_created on public.messages(conversation_id, created_at);

create table if not exists public.attachments (
  id uuid primary key default gen_random_uuid(),
  message_id uuid not null references public.messages(id) on delete cascade,
  type text not null,
  storage_path text,
  mime_type text,
  sha256 text,
  size_bytes bigint,
  width int,
  height int,
  duration_ms int,
  file_name text,
  created_at timestamptz not null default now()
);

-- Simple view for sidebar
create or replace view public.conversations_with_contacts as
select c.id, c.auto_reply_enabled, ct.id as contact_id, ct.wa_id, ct.name
from public.conversations c
join public.contacts ct on ct.id = c.contact_id; 