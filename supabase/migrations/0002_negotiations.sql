-- V2V Day 4: negotiation sessions for RUN_NEGOTIATION voice intents

create table if not exists negotiation_sessions (
  id uuid primary key default gen_random_uuid(),
  merchant_id text not null,
  status text not null default 'open' check (status in ('open', 'agreed', 'failed')),
  context jsonb not null default '{}'::jsonb,
  turns jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists negotiation_sessions_merchant_id_idx
  on negotiation_sessions (merchant_id);

create index if not exists negotiation_sessions_status_idx
  on negotiation_sessions (status);

alter table negotiation_sessions enable row level security;

create policy "service_role_full_access_negotiations"
  on negotiation_sessions
  for all
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');

create or replace function public.set_negotiation_sessions_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger negotiation_sessions_set_updated_at
  before update on negotiation_sessions
  for each row
  execute function public.set_negotiation_sessions_updated_at();
