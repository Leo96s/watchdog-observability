import { defineConfig } from 'vitepress'

// Render's fromService/property:host only gives the internal short service
// name (e.g. "watchdog-frontend-m48x"), not a resolvable public hostname -
// append ".onrender.com" when the value has no scheme and no dot.
function resolvePanelUrl(rawUrl?: string): string {
  if (!rawUrl) return 'http://localhost:80'

  let host = rawUrl
  if (!/^https?:\/\//i.test(host) && !host.includes('.')) {
    host = `${host}.onrender.com`
  }

  return /^https?:\/\//i.test(host) ? host : `https://${host}`
}

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "Watchdog Docs",
  description: "Documentação do sistema de monitorização",
  themeConfig: {
    nav: [
      { text: 'Home', link: '/' },
      { text: 'Painel', link: resolvePanelUrl(process.env.PANEL_URL) }
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
