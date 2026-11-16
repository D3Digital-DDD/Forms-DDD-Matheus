@AGENTS.md

# DDD Private — Formulário de aplicação

Formulário de aplicação para a **DDD Private**, mentoria individual de e-commerce do Matheus Porto
(2 meses + 5 calls por R$ 28 mil · 4 meses + 9 calls por R$ 35 mil). Público de alto ticket:
o design precisa transmitir exclusividade e luxo. Identidade visual = a do **DDD Club**.

## Stack (não trocar sem o usuário pedir)
- Next.js (App Router) + TypeScript + Tailwind CSS v4
- GitHub para versionamento · deploy na Vercel
- Supabase para guardar os leads
- Sempre a versão MAIS RECENTE de cada ferramenta/lib. Conferir a doc oficial atual antes de integrar
  (para o Next, ver `node_modules/next/dist/docs/`). Se uma API tiver versão na URL, guardar numa constante única.

## Comandos
- `npm run dev` — servidor local (http://localhost:3000)
- `npm run build` — build de produção
- `npm run lint` — lint

## Segurança
- Segredos só em variáveis de ambiente (`.env.local` local; Environment Variables na Vercel). Nunca no código, nunca commitados.
- `.env*` está no `.gitignore` (exceto `.env.example`, que só tem os nomes das variáveis).
- **Nenhuma** variável sensível com prefixo `NEXT_PUBLIC_`. A gravação no Supabase acontece só no servidor (Server Action).

## Identidade visual (manual Hifen / DDD Club)
- Cores: Muted Black `#0F0E0E` · Pine Green `#074223` · Olive Oasis `#41644A` · Golden Heart `#B78B56`
  · Smoked White `#D9D4CB` · Bright Green `#CFD0BF`
- Fontes da marca (pagas, sem licença): IvyOra Display, Termina, Nautica.
  Substitutas gratuitas em uso: **Cormorant Garamond** (títulos), **Archivo** expandida (rótulos/UI), **Pinyon Script** (assinatura).
- Logo: monograma DDD em `public/brand/ddd-monogram.png` (branco, transparente — tingido via CSS mask).

## Fluxo do formulário
Nome → WhatsApp → "Já tem operação?" → ramifica (o lead não percebe):
- **Sim:** faturamento → canal → gargalo → quando começar → caixa para investir
- **Não:** momento atual → capital para começar → tempo semanal → quando começar → caixa para investir
As perguntas ficam em `src/lib/questions.ts` (fonte única).

## Como trabalhar neste projeto
- Antes de construir algo: mostrar o PLANO e esperar aprovação.
- Explicar tudo em português simples. Em caso de erro, explicar antes de corrigir.
- Design caprichado, responsivo e mobile-first.
- Uma mudança por vez; não alterar o que não foi pedido.
- Git: commit a cada mudança aprovada (`feat:` / `fix:` / `refactor:` / `chore:`). **Nunca dar push sem revisão do usuário.**
- Manter este CLAUDE.md atualizado.
