-- V2V Day 2: merchant transaction ledger (Supabase)
-- Balance = sum(amount) where status = 'settled' (amount stored in kobo)

create table if not exists transactions (
  id uuid primary key default gen_random_uuid(),
  merchant_id text not null,
  intent_type text not null check (
    intent_type in ('CREATE_INVOICE', 'CHECK_BALANCE', 'RUN_NEGOTIATION')
  ),
  amount bigint not null,
  currency text not null default 'NGN',
  status text not null default 'pending' check (
    status in ('pending', 'settled', 'failed')
  ),
  reference text unique,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists transactions_merchant_id_idx on transactions (merchant_id);
create index if not exists transactions_reference_idx on transactions (reference);
create index if not exists transactions_status_idx on transactions (status);

alter table transactions enable row level security;

create policy "service_role_full_access"
  on transactions
  for all
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');

create or replace function public.set_transactions_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger transactions_set_updated_at
  before update on transactions
  for each row
  execute function public.set_transactions_updated_at();
