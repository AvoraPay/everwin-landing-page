# Deploy do Backend Prop

## Estado atual
- Frontend: Vite/React, pode continuar no Vercel.
- Backend: Express persistente com cron diário e lembrete de pagamento.
- Banco: Supabase Postgres.
- E-mail: Resend.

## Recomendação production-ready
- Manter o frontend no Vercel.
- Subir o backend em um serviço Node persistente: Railway, Render, Fly.io ou DigitalOcean App Platform.
- Apontar o frontend para a URL pública do backend via `VITE_PROP_API_URL`.

## Por que não usar o backend atual direto no Vercel
- O projeto usa `server/index.js` com `node-cron`.
- Funções serverless do Vercel não garantem processo persistente.
- Os jobs de lembrete e sincronização diária não devem depender de instâncias efêmeras.

## Variáveis obrigatórias do backend
- `APP_BASE_URL`
- `PROP_API_PORT`
- `PROP_CORS_ORIGIN`
- `DATABASE_URL`
- `DATABASE_POOL_URL` (recomendado para IPv4)
- `PROP_DATABASE_SSL=true`
- `JWT_ACCESS_SECRET`
- `JWT_REFRESH_SECRET`
- `PROP_DATA_SECRET`
- `RESEND_API_KEY`
- `RESEND_FROM_EMAIL`
- `SUPPORT_EMAIL`
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `PROP_PORTAL_EMAIL_DOMAIN`
- `PROP_PAYMENT_PROVIDER`
- `PROP_CHECKOUT_BASE_URL`
- `PROP_REMINDER_CRON`
- `PROP_DAILY_SYNC_CRON`

## Variáveis obrigatórias do frontend
- `VITE_PROP_API_URL`
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_PUBLISHABLE_KEY`

## String de conexão correta do Supabase
Use a string exata do botão `Connect` no dashboard do Supabase.

### Se o servidor rodar em IPv4
Prefira a Session Pooler URL:
- Formato esperado pela documentação do Supabase:
  - `postgres://postgres.<project-ref>:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:5432/postgres`

### Se o servidor suportar IPv6
Pode usar a Direct Connection:
- `postgresql://postgres:[PASSWORD]@db.<project-ref>.supabase.co:5432/postgres`

## Checklist de deploy
1. Subir o backend como serviço Node persistente.
2. Configurar todas as variáveis de ambiente do backend.
3. Garantir que a URL do banco conecta com SSL.
4. Validar `GET /api/health`.
5. Atualizar `VITE_PROP_API_URL` no frontend com a URL do backend.
6. Fazer redeploy do frontend no Vercel.
7. Testar o fluxo:
   - `/prop/landing/checkout`
   - `/prop/submission?id=...`
   - `/prop/login`
   - `/prop/reset-password`
   - `/prop/admin/submissions`
   - `POST /api/webhooks/stripe`

## Stripe
- O backend já está preparado para Stripe Checkout.
- Quando `STRIPE_SECRET_KEY` estiver configurada, cada nova submissão passa a tentar gerar uma Checkout Session.
- O webhook deve apontar para:
  - `/api/webhooks/stripe`
- Eventos esperados:
  - `checkout.session.completed`
  - `checkout.session.expired`
  - `checkout.session.async_payment_failed`

## Se quiser unificar tudo no Vercel
Vai exigir refactor:
- mover os endpoints para `api/` serverless;
- trocar `node-cron` por Supabase Cron ou outro scheduler externo;
- preferir `DATABASE_POOL_URL` em modo transaction/session;
- revisar autenticação para ambiente stateless.
