# Instalação

O projeto tem três partes: `backend` (API + worker de health checks),
`frontend` (painel Vue) e `Docs` (este site). Todas correm como
serviços separados, ligados por uma base de dados PostgreSQL.

## Com Docker Compose (recomendado)

1. Copia `.env.example` (na raiz do repositório) para `.env` e preenche
   os valores — ver [Configuração de ambiente](/config) para o
   significado de cada variável.
2. Sobe tudo:

```sh
docker compose up --build
```

Isto arranca: `postgres`, `backend` (porta `BACKEND_PORT`, migrations
correm automaticamente no arranque), `frontend` (porta 80), `docs`
(porta 5174), `prometheus` (porta `PROMETHEUS_PORT`) e `grafana`
(porta `GRAFANA_PORT`).

## Sem Docker (desenvolvimento)

Precisas de um PostgreSQL a correr localmente (podes usar só o
serviço `postgres` do `docker-compose.yml` com `docker compose up postgres`).

### Backend

```sh
cd backend
npm install
cp .env.example .env   # preenche DB_*, ADMIN_API_KEY, etc.
npm run db:migrate     # cria o schema
npm run dev             # nodemon, porta 3000 por omissão
```

### Frontend

```sh
cd frontend
npm install
npm run dev              # vite, porta 5173 por omissão
```

Confirma que `frontend/.env` (ou as env vars do teu ambiente) tem
`VITE_API_URL=http://localhost:3000` a apontar para o backend local.

### Docs (este site)

```sh
cd backend
npm run docs:dev
```

## Testes

```sh
cd backend && npm test    # jest + supertest
cd frontend && npm test   # vitest + @vue/test-utils
```

## Scripts úteis (backend)

| Script | O que faz |
|---|---|
| `npm run dev` | Arranca o servidor com nodemon (reload automático) |
| `npm start` | Arranca o servidor (produção) |
| `npm test` | Corre a suite de testes |
| `npm run db:migrate` | Aplica migrations pendentes |
| `npm run db:migrate:undo` | Reverte a última migration |
| `npm run docs:dev` | Servidor de desenvolvimento destes docs |
| `npm run docs:build` | Build estático destes docs |
