-- Tabela de leads da DDD Private.
-- Rode este SQL no Supabase: Dashboard > SQL Editor > New query > colar > Run.

create table if not exists public.leads (
  id            uuid primary key default gen_random_uuid(),
  created_at    timestamptz not null default now(),
  nome          text not null check (char_length(nome) between 2 and 80),
  whatsapp      text not null check (whatsapp ~ '^[0-9]{10,11}$'),
  caminho       text not null check (caminho in ('com_operacao', 'sem_operacao')),
  respostas     jsonb not null default '{}'::jsonb,
  utm_source    text,
  utm_medium    text,
  utm_campaign  text,
  utm_content   text,
  utm_term      text
);

create index if not exists leads_created_at_idx on public.leads (created_at desc);

-- Segurança: RLS ligado e NENHUMA policy.
-- Resultado: ninguém do navegador lê ou grava. Só o servidor (chave secreta) acessa.
alter table public.leads enable row level security;
