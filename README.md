# DDD Private — Formulário de aplicação

Formulário da mentoria individual **DDD Private** (Matheus Porto), com a identidade visual do DDD Club.

## Rodar localmente

```bash
npm install
npm run dev
```

Abra http://localhost:3000 (ou a porta que aparecer no terminal).

Sem o Supabase configurado, o formulário funciona normalmente em desenvolvimento e
apenas **mostra o lead no terminal** (não salva). Em produção, ele exige o Supabase.

## Conectar o Supabase (para salvar os leads)

1. Crie um projeto em https://supabase.com.
2. No projeto: **SQL Editor → New query**, cole o conteúdo de
   `supabase/migrations/20261116000000_create_leads.sql` e clique em **Run**.
3. Em **Project Settings → API Keys**, copie a **Secret key** e, em **Data API**, a **Project URL**.
4. Copie `.env.example` para `.env.local` e preencha:
   ```
   SUPABASE_URL=https://xxxx.supabase.co
   SUPABASE_SECRET_KEY=sb_secret_...
   ```
5. Na Vercel: **Settings → Environment Variables**, adicione as mesmas duas variáveis.

Os leads aparecem em **Table Editor → leads**.

## Editar as perguntas

Todas as perguntas e opções ficam em `src/lib/questions.ts`.

## Links com UTM

O formulário salva automaticamente `utm_source`, `utm_medium`, `utm_campaign`, `utm_content`
e `utm_term` da URL. Ex.: `https://seu-dominio.com/?utm_source=instagram&utm_campaign=stories`
