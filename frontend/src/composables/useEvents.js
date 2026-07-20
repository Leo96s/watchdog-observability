import { reactive, computed } from 'vue';

/**
 * Store global de eventos de mudança de estado dos serviços.
 * Alimentado a partir do socket (service:update) em App.vue.
 *
 *  - events:    lista completa de eventos (up / down / added / removed) → Histórico
 *  - notifs:    subconjunto up/down não descartados → Notificações (com badge)
 *  - unread:    contador para o badge do sino
 *
 * O estado é module-level, por isso é partilhado por qualquer componente
 * que chame useEvents().
 */
const state = reactive({
  events: [],        // { id, name, url, type: 'up'|'down'|'added'|'removed', ts }
  dismissed: [],     // ids de notificações descartadas
  unread: 0,
});

// Último estado conhecido por serviço, para detetar transições UP<->DOWN.
const lastStatus = new Map();
let seq = 0;

function push(type, service) {
  state.events.unshift({
    id: `${Date.now()}-${seq++}`,
    name: service.name,
    url: service.url,
    type,
    ts: Date.now(),
  });
  if (state.events.length > 100) state.events.length = 100;
  if (type === 'up' || type === 'down') state.unread++;
}

export function useEvents() {
  // Semente inicial a partir de um snapshot, sem gerar eventos nem badge.
  const seedFromSnapshot = (services = []) => {
    services.forEach((s) => { if (s?.name) lastStatus.set(s.id, s.status); });
  };

  // Chamar em cada service:update. Deteta a transição de estado.
  const recordUpdate = (update) => {
    if (!update?.name) return;
    const prev = lastStatus.get(update.id);
    lastStatus.set(update.id, update.status);
    if (prev !== undefined && prev !== update.status) {
      push(update.status === 'UP' ? 'up' : 'down', update);
    }
  };

  const recordAdded = (service) => { if (service?.name) { lastStatus.set(service.id, service.status || 'UP'); push('added', service); } };
  const recordRemoved = (service) => { if (service?.name) { lastStatus.delete(service.id); push('removed', service); } };

  const markAllRead = () => { state.unread = 0; };
  const dismiss = (id) => { if (!state.dismissed.includes(id)) { state.dismissed.push(id); if (state.unread > 0) state.unread--; } };
  const clearNotifs = () => {
    notifs.value.forEach((n) => { if (!state.dismissed.includes(n.id)) state.dismissed.push(n.id); });
    state.unread = 0;
  };

  const notifs = computed(() =>
    state.events.filter((e) => (e.type === 'up' || e.type === 'down') && !state.dismissed.includes(e.id))
  );
  const events = computed(() => state.events);
  const unread = computed(() => state.unread);

  return { events, notifs, unread, seedFromSnapshot, recordUpdate, recordAdded, recordRemoved, markAllRead, dismiss, clearNotifs };
}
