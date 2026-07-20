# Watchdog Observability

Sistema de monitorização de serviços em tempo real: health checks
periódicos (HTTP + validade de certificado SSL), painel Vue com
atualizações instantâneas via Socket.IO, alertas por webhook
(Discord/Slack) ou email, e métricas Prometheus.

📖 **Documentação completa:** [watchdog-docs.onrender.com](https://watchdog-docs.onrender.com/)
(fonte em [`backend/Docs/`](backend/Docs/), site gerado com [VitePress](https://vitepress.dev/)).

## Funcionalidades

- **Health checks automáticos** — verifica cada serviço ativo a cada
  30 segundos e guarda o histórico de latência/estado.
- **Tempo real via Socket.IO** — o painel recebe updates assim que um
  health check termina, sem polling.
- **Alertas configuráveis** — notificação por webhook (Discord/Slack)
  ou email (EmailJS) quando um serviço muda de estado.
- **Protegido contra SSRF** — URLs de serviços e webhooks são
  validadas contra IPs privados/loopback/link-local antes de qualquer
  pedido.
- **Métricas Prometheus** — endpoint pronto a ser raspado, com uptime
  e estado por serviço.
- **Escrita protegida por API key** — criar, editar ou apagar
  serviços exige o header `X-API-Key`; a leitura fica pública.
- **Painel com tema claro/escuro e PT/EN/ES** — dashboard com sidebar,
  notificações, histórico de atividade e sparklines de latência por
  serviço.

## Arquitetura

| Pasta | O que é | Stack |
|---|---|---|
| [`backend/`](backend/) | API REST + worker de health checks + Socket.IO | Node.js, Express, Sequelize (PostgreSQL) |
| [`frontend/`](frontend/) | Painel de monitorização | Vue 3, Tailwind CSS v4, Vite |
| [`backend/Docs/`](backend/Docs/) | Este site de documentação | VitePress |

Os três correm como serviços Docker independentes (ver
`docker-compose.yml` / `render.yaml`), ligados a uma base de dados
PostgreSQL partilhada.

## Como correr localmente

```sh
cp .env.example .env   # preenche os valores — ver a Configuração de ambiente nos docs
docker compose up --build
```

Isto arranca `postgres`, `backend`, `frontend` (porta 80), `docs`
(porta 5174), `prometheus` e `grafana`. Passos detalhados, correr sem
Docker e a suite de testes de cada app estão descritos em
[Instalação](https://watchdog-docs.onrender.com/instalar).

## Referência da API

Ver [Referência da API](https://watchdog-docs.onrender.com/api-reference)
para todos os endpoints REST e eventos Socket.IO.

## Alterações recentes

- **Novo layout do painel** — redesign completo com tema escuro,
  sidebar de navegação, notificações + histórico de atividade,
  sparklines de latência e barras de uptime nos cards de serviço.
- **Tema claro/escuro** — seletor nas Definições, com sistema de
  design tokens em CSS custom properties.
- **Internacionalização** — PT/EN/ES em toda a interface, incluindo os
  modais de adicionar/editar serviço e alertas.
- **Correção de bug de posicionamento** — os modais de editar serviço
  e alertas abriam confinados à caixa do card em vez de centrados na
  janela (causa: `transform` no card ao passar o rato criava um novo
  *containing block* para os seus filhos `position: fixed`); resolvido
  com `<Teleport to="body">`.
- **Correção de deploy da documentação** — o `backend/.dockerignore`
  excluía a pasta `Docs/` também do build da imagem de documentação
  (não só da imagem do backend), pelo que o site publicado nunca tinha
  o VitePress copiado para dentro do nginx.

Histórico completo em [`CHANGELOG.md`](CHANGELOG.md).

## Licença

[MIT](LICENSE)
