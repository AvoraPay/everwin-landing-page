# API da corretora para sincronização Prop

## Escopo

Contrato interno entre o portal Prop (`www.everwin.capital`) e o backend da
corretora (`api.everwin.capital`). O portal usa o Bearer administrativo já
configurado. A evolução inicial é aditiva sob `/api/admin/prop/v1`.

O cálculo oficial continua no portal Prop. A corretora deve devolver fatos
brutos e snapshots auditáveis; ela não decide se a avaliação passou ou falhou.

## Endpoints necessários

### `GET /api/admin/prop/v1/users:resolve?email=<email>`

Resolve o `platformUserId` durante o provisionamento ou reparo de contas antigas.

Resposta `200`:

```json
{
  "userId": "usr_123",
  "email": "trader@everwin.capital",
  "status": "active"
}
```

Erros: `404 user_not_found`, `409 ambiguous_user`, `401/403` para autenticação.

### `GET /api/admin/prop/v1/users/{userId}/snapshot`

Snapshot consistente do momento atual. É usado para atualizar o painel e para
detectar violações intradiárias mesmo quando não houve trade fechado.

Resposta `200`:

```json
{
  "userId": "usr_123",
  "asOf": "2026-08-12T21:30:00.000Z",
  "timezone": "America/Sao_Paulo",
  "currency": "BRL",
  "cashBalance": 150000,
  "equity": 149250,
  "realizedPnl": -250,
  "unrealizedPnl": -500,
  "dayStartEquity": 150000,
  "dayLowEquity": 149100,
  "dayHighEquity": 150200,
  "openPositions": 2,
  "lastTradeAt": "2026-08-12T21:28:10.000Z",
  "sequence": 18422
}
```

`dayLowEquity` é obrigatório: calcular drawdown diário apenas com trades
fechados deixa perdas intradiárias invisíveis.

### `GET /api/admin/prop/v1/users/{userId}/daily-results?from=YYYY-MM-DD&to=YYYY-MM-DD&cursor=<opaque>&limit=100`

Resultados diários consolidados na timezone informada. Paginação por cursor,
`limit` máximo 200.

Resposta `200`:

```json
{
  "items": [
    {
      "date": "2026-08-12",
      "startEquity": 150000,
      "endEquity": 151200,
      "lowEquity": 149500,
      "highEquity": 151350,
      "realizedPnl": 1200,
      "fees": 35,
      "trades": 4,
      "lastEventAt": "2026-08-12T21:28:10.000Z"
    }
  ],
  "nextCursor": null
}
```

Esse endpoint alimenta dias operados, PnL acumulado, melhor dia, consistência,
meta, drawdown máximo e reconstrução após perda de webhook.

### `GET /api/admin/prop/v1/users/{userId}/trades?from=<ISO>&to=<ISO>&cursor=<opaque>&limit=100`

Trilha de auditoria e reconciliação. Cada trade precisa de `tradeId` estável,
timestamps, ativo, lado, quantidade, preços, lucro realizado, taxas e status.
Retorno paginado no mesmo formato de `daily-results`.

## Webhook recomendado

A corretora deve enviar eventos para o endpoint já existente:

`POST https://www.everwin.capital/api/webhooks/deposit`

Headers:

- `Content-Type: application/json`
- `X-Webhook-Secret: <segredo compartilhado>`
- `Idempotency-Key: <eventId>`

Eventos: `trade.closed`, `equity.updated`, `deposit.created` e
`withdrawal.created`. O webhook dá atualização rápida; os GETs diários são a
reconciliação autoritativa. Um não substitui o outro.

## Regras operacionais

- Valores monetários são números em unidade da moeda, nunca centavos implícitos.
- Todos os timestamps são ISO-8601 UTC; o fechamento diário inclui `timezone`.
- GETs têm consistência read-after-write e `Cache-Control: no-store`.
- O `sequence` cresce monotonamente por usuário para detectar snapshots antigos.
- Respostas de erro seguem `{ "error": { "code", "message", "requestId" } }`.
- Retentativas de webhook são idempotentes pelo `eventId`/`Idempotency-Key`.
- Retenção mínima recomendada: histórico completo da avaliação mais 180 dias.

## O que cada dado permite calcular

| Regra do portal | Fonte mínima |
|---|---|
| Saldo e PnL atual | `snapshot` |
| Drawdown diário intradiário | `dayStartEquity` e `dayLowEquity` |
| Perda máxima total | menor `lowEquity` desde o início |
| Meta de lucro | `equity`/`endEquity` versus saldo inicial |
| Dias operados | `daily-results.trades > 0` |
| Consistência | maior `realizedPnl` diário / lucro acumulado |
| Auditoria de divergência | `trades` |

