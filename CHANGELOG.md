## v1.9.4 - 2026-07-20
* fix(frontend): show toast feedback when adding/rejecting alert destinations
## v1.9.3 - 2026-07-20
* docs: add project overview README
## v1.9.2 - 2026-07-20
* fix(deploy): stop excluding Docs from the Docker build context
## v1.9.1 - 2026-07-20
* fix(frontend): translate modals and fix their off-center positioning
* feat(frontend): add light/dark theme toggle in Settings
## v1.8.1 - 2026-07-20
* fix(frontend): stop loading Vuetify to fix Tailwind styling
## v1.8.0 - 2026-07-20
* feat(frontend): redesign dashboard with dark theme and sidebar nav
## v1.7.6 - 2026-07-19
* docs: escreve documentacao real do projeto
## v1.7.5 - 2026-07-19
* fix(deploy): serve os docs como build estatico em vez do dev server
* fix(ui): impede que clicar em historico/apagar abra o modal de alertas
## v1.7.3 - 2026-07-19
* fix(deploy): resolve o hostname interno curto do Render para o publico
* fix(deploy): torna as migrations resilientes a atrasos no arranque da BD
## v1.7.1 - 2026-07-19
* chore: reforca Dockerfiles, adiciona exemplos de variaveis e corrige CVEs
* feat(ui): edicao de servicos, gestao de alertas e definir API key
* feat: substitui polling por updates em tempo real via Socket.IO
* feat(db): gere o schema com migrations do sequelize-cli
* chore(backend): remove modulo de metricas morto e adota logger pino
* fix(backend): corrige porta do SSL checker e queries N+1 do uptime
* fix(cors): restringe origens e tolera hostnames sem esquema do Render
* feat(security): protege escrita com API key e bloqueia SSRF
## v1.3.14 - 2026-07-19
* chore: adiciona validacao de commits e protecoes locais pre-commit
* fix(ci): atualiza workflow de versionamento para a versao mais recente
## v1.3.12 - 2026-03-01
* fix: ainda tentando resolver erro de enviar emails
## v1.3.11 - 2026-03-01
* fix: fazendo debug
## v1.3.10 - 2026-03-01
* fix: corrigido erro
## v1.3.9 - 2026-03-01
* fix: faltou isto
## v1.3.8 - 2026-03-01
* fix: alterado o sistema de email para ver se o render aceita
## v1.3.7 - 2026-03-01
* fix: decidido mudar a estratégia para enviar emails
## v1.3.6 - 2026-03-01
* fix: corrigindo erro
## v1.3.5 - 2026-03-01
* fix: mais uma tentativa
## v1.3.4 - 2026-03-01
* fix: resolvendo o erro de alerta por email
## v1.3.3 - 2026-03-01
* fix: mais uma tentativa de resolver erro de email
## v1.3.2 - 2026-03-01
* fix: ainda a tentar resolver alertas por email no render
## v1.3.1 - 2026-03-01
* fix: tentando resoolver erro de envio de emails do render
## v1.3.0 - 2026-02-28
* feat: agora é possível receber alertas por e-mail
* fix: adicionado rota para adicionar notificaçoes a serviço que já existe
* fix: resolvidos bugs no frontend
* feat: agora os serviços podem ser observados por alertas pelo use
## v1.1.2 - 2026-02-21
* fix: Melhorado o visual do Toaster
* fix: resolvido erro
* feat: agora é possível apagar um serviço
* fix: corrigido inconsistências e documentado o código
## v1.0.5 - 2026-02-17
* fix: update render.yaml
## v1.0.4 - 2026-02-17
* fix: update do render.yaml
## v1.0.3 - 2026-02-17
* fix: update de render.yaml
## v1.0.2 - 2026-02-17
* fix: atualizado o ficheiro render.yaml
## v1.0.1 - 2026-02-17
* fix: corrigido uns erros e preparado para deploy
## v1.0.0 - 2026-02-16
* BREAKING CHANGE: primeira versão de watchdog funcional
## v0.5.0 - 2026-02-14
* feat: Implementado uma base sólida para o backend
## v0.4.0 - 2026-02-14
* feat: creação de sistemas de alertas e integração prometheus
## v0.3.0 - 2026-02-14
* feat: Primeiro health check real e implementação de websockets
## v0.2.0 - 2026-02-14
* feat: implementado a primeira versão do frontend
## v0.1.1 - 2026-02-14
* ci: fix de um bug na pipeline
