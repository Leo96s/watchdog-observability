# Configuração de ambiente

## Backend (`backend/.env`)

| Variável | Obrigatória | Descrição |
|---|---|---|
| `NODE_ENV` | não | `development` ou `production`. Em produção liga SSL na ligação à BD e desativa `sync()` (usa só migrations). |
| `PORT` | não | Porta HTTP do backend. Por omissão `3000`. |
| `DB_HOST` / `DB_PORT` / `DB_NAME` / `DB_USER` / `DB_PASSWORD` | sim | Ligação ao PostgreSQL. |
| `ADMIN_API_KEY` | sim | Chave exigida no header `X-API-Key` para criar/editar/apagar serviços e notificações. Sem esta variável definida, o servidor **recusa todos os pedidos de escrita com 500** (falha fechado, de propósito). |
| `FRONTEND_ORIGIN` | não | Origem(ns) permitida(s) por CORS, separadas por vírgula. Por omissão `http://localhost:5173`. Aceita tanto uma origem completa (`http://localhost:80`) como só o hostname (ver nota sobre o Render abaixo). |
| `EMAILJS_SERVICE_ID` / `EMAILJS_TEMPLATE_ID` / `EMAILJS_PUBLIC_KEY` / `EMAILJS_PRIVATE_KEY` | só para alertas por email | Credenciais do [EmailJS](https://www.emailjs.com/), o único provider de email realmente usado (ver `alert.service.js`). |

## Frontend (build-time, `VITE_*`)

Estas variáveis são lidas em `vite build`/`vite dev` e ficam embutidas
no JavaScript final — mudar o valor exige um novo build.

| Variável | Descrição |
|---|---|
| `VITE_API_URL` | Origem do backend (ex: `http://localhost:3000`). O frontend acrescenta `/api` sozinho — não incluir aqui. |
| `VITE_DOCS_URL` | URL deste site de docs, usado pelo botão "Docs" no painel. |

## Docs (build-time)

| Variável | Descrição |
|---|---|
| `PANEL_URL` | URL do painel (frontend), usado no link "Painel" da navegação destes docs. |

## Nota sobre o Render

O `render.yaml` liga os três serviços entre si automaticamente via
`fromService`/`property: host`. Esse valor é o **nome interno curto**
do serviço no Render (ex: `watchdog-backend-dvx5`), não o hostname
público completo. `resolveApiOrigin` (frontend) e `isOriginAllowed`
(backend) já tratam disto — quando o valor não tem esquema nem ponto,
assumem que é um nome interno do Render e acrescentam
`.onrender.com` antes de o usar. Não precisas de fazer nada extra ao
usar o blueprint.
