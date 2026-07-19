# Base de dados

PostgreSQL, gerido por Sequelize. O schema é criado e alterado
**apenas via migrations** (`sequelize-cli`) — não há `sync({alter:true})`
em produção.

## Tabelas

### `ServiceStatuses`

Estado atual de cada serviço monitorizado.

| Coluna | Tipo | Nota |
|---|---|---|
| `serviceName` | STRING | |
| `url` | STRING | único |
| `status` | STRING | `UP` / `DOWN` / `DEGRADED` / `UNKNOWN` |
| `responseTime` | INTEGER | ms, do último check |
| `sslExpiry` | DATE | validade do certificado, se aplicável |
| `method` | STRING | por omissão `GET` |
| `expectedStatus` | INTEGER | por omissão `200` |
| `headers` / `body` | JSONB | enviados em cada check |
| `isActive` | BOOLEAN | soft delete — `false` = apagado |

### `NotificationDestinations`

| Coluna | Tipo | Nota |
|---|---|---|
| `serviceId` | INTEGER | FK → `ServiceStatuses.id`, `ON DELETE CASCADE` |
| `type` | ENUM | `webhook` \| `email` |
| `value` | STRING | URL do webhook ou endereço de email |

### `ServiceLogs`

Histórico de checks (uma linha por check). `serviceId` (FK, sem
cascade), `status`, `responseTime`, `sslExpiry`, mais um índice
composto em `(serviceId, createdAt)` para as queries de histórico e
uptime.

### `ServiceAlertStates`

Guarda o último estado conhecido de cada serviço, para detetar
mudanças de estado e disparar alertas. `serviceId` é a própria chave
primária (FK → `ServiceStatuses.id`, `ON DELETE CASCADE`), mais
`lastStatus` e `lastChange`.

## Migrations

```sh
cd backend
npm run db:migrate          # aplica as pendentes
npm run db:migrate:undo     # reverte a última
```

Ficheiros em `backend/src/database/migrations/`, configuração em
`backend/.sequelizerc` + `backend/src/database/config.js` (usa as
mesmas variáveis `DB_*` do runtime).

O `Dockerfile` do backend corre `npm run db:migrate` antes de
`npm start` (via `backend/scripts/docker-entrypoint.sh`, que tenta
até 15 vezes com 10s de intervalo — cobre o caso de o DNS interno da
base de dados ainda não estar pronto no primeiro deploy).
