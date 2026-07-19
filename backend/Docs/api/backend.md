# Arquitetura do backend

Express 5 + Sequelize + PostgreSQL. Estrutura em `backend/src/`:

```
src/
  app.js              # Express app: CORS, JSON parsing, montagem das rotas
  server.js            # Cria o http.Server + Socket.IO, liga à BD, arranca o worker
  database/
    index.js            # Instância Sequelize usada em runtime
    config.js            # Config para o sequelize-cli (migrations)
    migrations/          # Schema versionado (ver Base de Dados)
  models/                # ServiceStatus, NotificationDestination, ServiceLog, ServiceAlertState
  routes/                # Controllers finos: health, history, services, upTime
  services/              # Regra de negócio (health checks, SSL, alertas, métricas, uptime)
  sockets/
    socket.manager.js     # Loop de 30s que corre os checks e emite updates
  middleware/
    apiKeyAuth.middleware.js
  utils/
    urlSafety.js           # SSRF guard
    corsOrigins.js          # Normalização de origem (CORS)
    serviceMapper.js        # Shape partilhado entre rotas e Socket.IO
    logger.js               # Pino
```

## Ciclo de um health check

1. `socket.manager.js` corre `runChecks()` a cada 30s (e uma vez
   imediatamente ao arrancar): busca todos os `ServiceStatus` com
   `isActive: true` e chama `checkService(service, io)` em paralelo
   para todos (`Promise.all`).
2. `healthChecker.service.js` faz o pedido HTTP (`request.service.js`,
   com fallback de `GET` para `HEAD` se o pedido original falhar),
   compara o status devolvido com `expectedStatus` (ou aceita qualquer
   coisa `< 500` se não estiver definido), e verifica o certificado
   SSL se o URL for `https` (`sslChecker.service.js`).
3. Regista o resultado (`ServiceStatus.update` + `ServiceLog.create`),
   atualiza as métricas Prometheus, e emite `service:update` via
   Socket.IO com o resultado.
4. `alertState.service.js` compara com o último estado conhecido; se
   mudou, `alert.service.js` notifica todos os destinos configurados
   (webhook via `axios.post`, email via EmailJS).

Um `403` da app monitorizada é tratado como "está de pé mas com rate
limit", não como `DOWN` — decisão intencional em `healthChecker.service.js`.

## Autenticação e SSRF

Ver a página [Segurança](/seguranca) — cobre o `apiKeyAuth` middleware
e o `urlSafety` guard usados nas rotas de escrita.

## Logging

Todos os módulos usam o logger Pino (`utils/logger.js`) em vez de
`console.*`, com níveis `info`/`warn`/`error` consoante o caso.
