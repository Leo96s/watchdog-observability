import { defineConfig } from 'vitepress'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "Watchdog Docs",
  description: "Documentação do sistema de monitorização",
  themeConfig: {
    nav: [
      { text: 'Home', link: '/' },
      { text: 'Painel', link: 'http://localhost:80' }
    ],
    sidebar: [
      {
        text: 'Guia de Início',
        items: [
          { text: 'Instalação', link: '/instalar' },
          { text: 'Configuração .env', link: '/config' },
        ]
      },
      {
        text: 'Arquitetura',
        items: [
          { text: 'Backend (Node/Sequelize)', link: '/api/backend' },
          { text: 'Frontend (Vue 3)', link: '/api/frontend' },
          { text: 'Base de Dados', link: '/api/database' }
        ]
      }
    ]
  }
});
