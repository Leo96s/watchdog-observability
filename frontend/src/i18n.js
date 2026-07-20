import { reactive, computed } from 'vue';

// Idioma partilhado por toda a app. Persiste no localStorage.
const state = reactive({
  lang: localStorage.getItem('watchdog_lang') || 'pt',
});

export const messages = {
  pt: {
    subtitle: 'Monitorização em tempo real', search: 'Procurar serviço…', addService: 'Adicionar serviço',
    monitored: 'Monitorizados', monitoredSub: 'serviços ativos', operational: 'Operacionais', operationalSub: 'a responder',
    failing: 'Em falha', failingSub: 'a precisar de atenção', avgLatency: 'Latência média', avgLatencySub: 'todas as sondas UP',
    services: 'Serviços', all: 'Todos', updates: 'tempo real', latency: 'Latência', uptime: 'Uptime · sessão',
    opStatus: 'Operacional', downStatus: 'Em baixo', checked: 'verificado', justNow: 'agora',
    secAgo: (n) => `há ${n}s`, minAgo: (n) => `há ${n}m`, hourAgo: (n) => `há ${n}h`,
    noResults: 'Nenhum serviço corresponde ao filtro.',
    empty: 'Ainda não tens serviços monitorizados. Usa "Adicionar serviço" para começar.',
    settings: 'Definições', language: 'Idioma do site',
    notifications: 'Notificações', historyNav: 'Histórico', activityLog: 'Registo de atividade', noEvents: 'Sem eventos por agora.',
    evUp: 'ficou operacional', evDown: 'ficou em baixo', evAdded: 'foi adicionado', evRemoved: 'foi removido',
    clearAll: 'Limpar tudo', remove: 'Remover', recentHistory: 'Histórico recente',
    dateTime: 'Data / hora', statusCol: 'Estado', latencyCol: 'Latência', noHistory: 'Sem registos no histórico.',
    docs: 'Documentação', apiKey: 'API key',
  },
  en: {
    subtitle: 'Real-time monitoring', search: 'Search service…', addService: 'Add service',
    monitored: 'Monitored', monitoredSub: 'active services', operational: 'Operational', operationalSub: 'responding',
    failing: 'Failing', failingSub: 'need attention', avgLatency: 'Avg. latency', avgLatencySub: 'all UP probes',
    services: 'Services', all: 'All', updates: 'real time', latency: 'Latency', uptime: 'Uptime · session',
    opStatus: 'Operational', downStatus: 'Down', checked: 'checked', justNow: 'just now',
    secAgo: (n) => `${n}s ago`, minAgo: (n) => `${n}m ago`, hourAgo: (n) => `${n}h ago`,
    noResults: 'No service matches the filter.',
    empty: "You don't have any monitored services yet. Use \"Add service\" to start.",
    settings: 'Settings', language: 'Site language',
    notifications: 'Notifications', historyNav: 'History', activityLog: 'Activity log', noEvents: 'No events yet.',
    evUp: 'is operational', evDown: 'went down', evAdded: 'was added', evRemoved: 'was removed',
    clearAll: 'Clear all', remove: 'Remove', recentHistory: 'Recent history',
    dateTime: 'Date / time', statusCol: 'Status', latencyCol: 'Latency', noHistory: 'No history records.',
    docs: 'Documentation', apiKey: 'API key',
  },
  es: {
    subtitle: 'Monitorización en tiempo real', search: 'Buscar servicio…', addService: 'Añadir servicio',
    monitored: 'Monitorizados', monitoredSub: 'servicios activos', operational: 'Operativos', operationalSub: 'respondiendo',
    failing: 'Con fallos', failingSub: 'requieren atención', avgLatency: 'Latencia media', avgLatencySub: 'todas las sondas UP',
    services: 'Servicios', all: 'Todos', updates: 'tiempo real', latency: 'Latencia', uptime: 'Uptime · sesión',
    opStatus: 'Operativo', downStatus: 'Caído', checked: 'verificado', justNow: 'ahora',
    secAgo: (n) => `hace ${n}s`, minAgo: (n) => `hace ${n}m`, hourAgo: (n) => `hace ${n}h`,
    noResults: 'Ningún servicio coincide con el filtro.',
    empty: 'Aún no tienes servicios monitorizados. Usa "Añadir servicio" para empezar.',
    settings: 'Ajustes', language: 'Idioma del sitio',
    notifications: 'Notificaciones', historyNav: 'Historial', activityLog: 'Registro de actividad', noEvents: 'Sin eventos por ahora.',
    evUp: 'está operativo', evDown: 'se cayó', evAdded: 'fue añadido', evRemoved: 'fue eliminado',
    clearAll: 'Borrar todo', remove: 'Eliminar', recentHistory: 'Historial reciente',
    dateTime: 'Fecha / hora', statusCol: 'Estado', latencyCol: 'Latencia', noHistory: 'Sin registros en el historial.',
    docs: 'Documentación', apiKey: 'API key',
  },
};

export const LANGUAGES = [
  { code: 'pt', label: 'Português', flag: '🇵🇹' },
  { code: 'en', label: 'English', flag: '🇬🇧' },
  { code: 'es', label: 'Español', flag: '🇪🇸' },
];

export function useI18n() {
  const t = computed(() => messages[state.lang]);
  const lang = computed(() => state.lang);
  const setLang = (code) => {
    if (!messages[code]) return;
    state.lang = code;
    localStorage.setItem('watchdog_lang', code);
  };
  const locale = computed(() => (state.lang === 'pt' ? 'pt-PT' : state.lang === 'es' ? 'es-ES' : 'en-GB'));
  return { t, lang, setLang, locale };
}
