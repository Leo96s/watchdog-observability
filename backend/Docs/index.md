---
# https://vitepress.dev/reference/default-theme-home-page
layout: home

hero:
  name: "Watchdog Docs"
  text: "Monitorização de serviços em tempo real"
  tagline: Health checks, SSL, uptime, alertas por webhook/email e métricas Prometheus.
  actions:
    - theme: brand
      text: Instalação
      link: /instalar
    - theme: alt
      text: Referência da API
      link: /api-reference

features:
  - title: Health checks automáticos
    details: Verifica cada serviço ativo a cada 30 segundos (HTTP + validade do certificado SSL) e guarda o histórico.
  - title: Tempo real via Socket.IO
    details: O painel recebe updates instantâneos assim que um health check termina, sem polling.
  - title: Alertas configuráveis
    details: Notificações por webhook (Discord/Slack) ou email (EmailJS) quando um serviço muda de estado.
  - title: Protegido contra SSRF
    details: URLs de serviços e webhooks são validados contra IPs privados/loopback/link-local antes de qualquer pedido.
  - title: Métricas Prometheus
    details: Endpoint /realTime-metrics pronto a ser raspado, com uptime e estado por serviço.
  - title: Escrita protegida por API key
    details: Criar, editar ou apagar serviços exige o header X-API-Key; a leitura fica pública.
---
