---
outline: deep
---

# Referência da API

Base path: `VITE_API_URL/api` no frontend (ex: `http://localhost:3000/api`).
Rotas marcadas 🔒 exigem o header `X-API-Key` — ver [Segurança](/seguranca).

## Serviços

### `GET /api/health`

Lista todos os serviços ativos, com o estado atual. Suporta paginação:
`?limit=` (por omissão 100, máximo 500) e `?offset=`.

```json
[
  {
    "id": 1,
    "name": "Minha API",
    "url": "https://api.example.com",
    "status": "UP",
    "lastChecked": "2026-07-19T21:00:00.000Z",
    "responseTime": 87,
    "sslExpiry": "2026-10-01T00:00:00.000Z"
  }
]
```

`status` é um de: `UP`, `DOWN`, `DEGRADED`, `UNKNOWN` (antes do
primeiro check).

### `GET /api/services/:id`

Detalhe completo de um serviço (inclui `method`, `expectedStatus`,
`headers`, `body` e os `destinations` de notificação). `404` se não
existir ou estiver inativo.

### `POST /api/services` 🔒

```json
{
  "name": "Minha API",
  "url": "https://api.example.com",
  "method": "GET",
  "expectedStatus": 200,
  "headers": { "Authorization": "Bearer ..." },
  "notifications": [{ "type": "webhook", "value": "https://discord.com/api/webhooks/..." }]
}
```

Só `name` e `url` são obrigatórios. O `url` (e cada `notifications[].value`
do tipo `webhook`) passam pelo [SSRF guard](/seguranca). Se já existir um
serviço inativo com o mesmo `url`, é reativado em vez de duplicado
(`200`); caso contrário cria um novo (`201`); URL já ativo devolve `409`.

### `PATCH /api/services/:id` 🔒

Mesmo corpo que o `POST`, todos os campos opcionais — só atualiza o
que for enviado. Reaplica o SSRF guard se o `url` mudar.

### `DELETE /api/services/:id` 🔒

Desativa o serviço (soft delete — `isActive: false`), e apaga os
destinos de notificação e o estado de alerta associados.

## Notificações

### `POST /api/services/:id/notifications` 🔒

```json
{ "type": "webhook", "value": "https://discord.com/api/webhooks/..." }
```

`type` tem de ser `"webhook"` ou `"email"`. Um `email` é validado por
formato; um `webhook` passa pelo SSRF guard.

### `DELETE /api/services/:id/notifications/:notifId` 🔒

## Histórico

### `GET /api/history/:name`

Histórico de checks de um serviço pelo nome, mais recente primeiro.
Suporta `?limit=` (por omissão 200, máximo 500) e `?offset=`.

## Métricas

### `GET /realTime-metrics`

Formato Prometheus (`prom-client`), com `watchdog_request_duration_ms`,
`watchdog_service_up` e `watchdog_service_uptime_percent`. É este
endpoint que o `prometheus.yml` do projeto raspa.

### `GET /upTime-metrics/metrics`

Atualiza e devolve o mesmo `watchdog_service_uptime_percent` calculado
sobre as últimas 24h, no mesmo registo do endpoint acima.

## Tempo real (Socket.IO)

O backend liga o Socket.IO ao mesmo servidor HTTP. Eventos emitidos:

| Evento | Quando | Payload |
|---|---|---|
| `services:snapshot` | Assim que um cliente se liga | Array com o mesmo formato de `GET /api/health` |
| `service:update` | A seguir a cada health check | Um único objeto no mesmo formato |

Ver `frontend/src/composables/useSocket.js` para o consumo no painel.
