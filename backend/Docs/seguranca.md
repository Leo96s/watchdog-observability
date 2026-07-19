# Segurança

## Autenticação (API key)

Não há sistema de utilizadores — apenas uma chave de administrador
partilhada. Rotas de **leitura** (`GET`) ficam sempre públicas; rotas
de **escrita** (`POST`, `PATCH`, `DELETE`) exigem o header:

```
X-API-Key: <ADMIN_API_KEY>
```

Implementado em `backend/src/middleware/apiKeyAuth.middleware.js`.
Se `ADMIN_API_KEY` não estiver definida no ambiente, o middleware
recusa **todos** os pedidos de escrita com `500` em vez de os deixar
passar — falha fechado por omissão.

No frontend, a key fica guardada em `localStorage` (`watchdog_api_key`)
depois de a definires no botão 🔑 do painel, e é enviada
automaticamente pelo interceptor em `frontend/src/services/api.service.js`
em qualquer pedido `POST`/`PATCH`/`PUT`/`DELETE`.

## Proteção contra SSRF

Um serviço monitorizado ou um destino de webhook podem, em teoria,
apontar para qualquer URL — incluindo endereços internos da rede onde
o backend corre (ex: metadata endpoints de cloud, bases de dados
internas). `backend/src/utils/urlSafety.js` valida cada URL antes do
backend lhe fazer qualquer pedido:

- Só permite `http:`/`https:`.
- Recusa `localhost`.
- Recusa IPs literais em gamas privadas/loopback/link-local/reservadas
  (`10.0.0.0/8`, `172.16.0.0/12`, `192.168.0.0/16`, `127.0.0.0/8`,
  `169.254.0.0/16`, etc., IPv4 e IPv6).
- Resolve o hostname via DNS e valida **todos** os IPs devolvidos —
  protege contra um domínio público que aponte para um IP interno.

Usado em três pontos de `services.routes.js`: ao criar um serviço, ao
editar o URL de um serviço existente, e ao criar um destino de
notificação do tipo `webhook`.

## CORS

`backend/src/app.js` restringe as origens permitidas a
`FRONTEND_ORIGIN` (ver [Configuração](/config)). A mesma lógica de
comparação é partilhada com o Socket.IO em `server.js`, através de
`backend/src/utils/corsOrigins.js`.

## Métricas Prometheus

`GET /upTime-metrics/metrics` costumava construir o texto do
Prometheus concatenando strings, incluindo o nome do serviço (dado
pelo utilizador) sem qualquer escaping — um nome com aspas ou uma
quebra de linha conseguia injetar métricas falsas. Hoje usa
`prom-client` (`Gauge.labels(...).set(...)`), que escapa os valores
dos labels automaticamente.
