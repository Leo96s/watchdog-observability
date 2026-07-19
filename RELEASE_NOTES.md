## v1.7.1 - 2026-07-19
* chore: reforca Dockerfiles, adiciona exemplos de variaveis e corrige CVEs
* feat(ui): edicao de servicos, gestao de alertas e definir API key
* feat: substitui polling por updates em tempo real via Socket.IO
* feat(db): gere o schema com migrations do sequelize-cli
* chore(backend): remove modulo de metricas morto e adota logger pino
* fix(backend): corrige porta do SSL checker e queries N+1 do uptime
* fix(cors): restringe origens e tolera hostnames sem esquema do Render
* feat(security): protege escrita com API key e bloqueia SSRF
