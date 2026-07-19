# Deploy

## Render

`render.yaml` define quatro recursos: `watchdog-backend`,
`watchdog-frontend`, `watchdog-docs` (todos `env: docker`) e a base de
dados `watchdog-db` (Postgres, plano `free`).

Os três serviços web ligam-se automaticamente uns aos outros via
`fromService`/`property: host`. **Atenção**: esse valor é só o nome
interno curto do serviço (ex: `watchdog-backend-dvx5`), não o
hostname público — o código já trata disto (ver
[Configuração](/config)), mas é importante saber que existe esta
diferença se algum dia precisares de depurar uma ligação que "não
resolve".

### Primeiro deploy / checklist

1. Push do branch ligado ao blueprint — o Render cria os 4 recursos.
2. Dashboard → `watchdog-backend` → **Environment** → copiar o valor
   gerado de `ADMIN_API_KEY`.
3. Abrir o painel (frontend), clicar no ícone 🔑, colar essa key.
4. Preencher `EMAILJS_SERVICE_ID` / `EMAILJS_TEMPLATE_ID` /
   `EMAILJS_PUBLIC_KEY` / `EMAILJS_PRIVATE_KEY` no dashboard do
   backend, se quiseres alertas por email (ficam por preencher por
   omissão — `sync: false`).
5. Confirmar no log do backend que as migrations correram
   (`npm run db:migrate`) sem erro.

### Gotchas já apanhados em produção

- **Base de dados `free` expira.** O plano `free` do Postgres no
  Render é apagado ao fim de ~30 dias. Se o backend começar a dar
  `ENOTFOUND` a resolver o host da BD, confirma primeiro se a base de
  dados ainda existe no dashboard antes de assumir outra coisa.
- **`VITE_API_URL`/`VITE_DOCS_URL`/`FRONTEND_ORIGIN`/`PANEL_URL` são
  build-time ou lidos a cada arranque, consoante o serviço.** Mudar um
  destes no dashboard só faz efeito depois de um novo deploy do
  serviço que o consome (o frontend e os docs precisam de rebuild; o
  backend só precisa de reiniciar).
- **Não corras o servidor de dev do Vite/VitePress em produção.** Por
  omissão bloqueia pedidos com um header `Host` que não reconheça
  (dá `403`). O frontend e os docs usam sempre build estático servido
  por nginx — ver os respetivos `Dockerfile`.
- **As migrations podem correr antes da base de dados estar pronta**
  no primeiro deploy de um blueprint novo (corrida de DNS). O
  `docker-entrypoint.sh` do backend já tenta várias vezes antes de
  desistir — ver [Base de Dados](/api/database).

## Docker Compose (local)

`docker compose up --build` sobe tudo localmente com as mesmas
imagens usadas em produção (mesmos `Dockerfile`s). Ver
[Instalação](/instalar) para os passos completos e as portas de cada
serviço.
