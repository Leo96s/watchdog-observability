<script setup>
import { ref, computed, onMounted } from 'vue';
import {
  Activity, LayoutGrid, Bell, Clock, BookOpen, KeyRound, SlidersHorizontal,
  Search, Plus, Check, X, Server, Gauge, Moon, Sun,
} from 'lucide-vue-next';
import api from './services/api.service';
import { useServiceSocket } from './composables/useSocket';
import { useEvents } from './composables/useEvents';
import { useI18n, LANGUAGES } from './i18n';
import { useTheme } from './theme';
import { resolveApiOrigin } from './utils/resolveApiUrl';

import Toast from './components/Toast.vue';
import ServiceForm from './components/ServiceForm.vue';
import ServiceCard from './components/ServiceCard.vue';
import HistoryModal from './components/HistoryModal.vue';

const { t, lang, setLang, locale } = useI18n();
const { theme, setTheme } = useTheme();
const events = useEvents();

const services = ref([]);
const loading = ref(true);
const isSubmitting = ref(false);
const filter = ref('all');          // all | up | down
const search = ref('');
const panel = ref(null);            // null | 'add' | 'notifications' | 'history' | 'settings'
const showHistoryModal = ref(false);
const selectedHistory = ref([]);

const toast = ref({ show: false, message: '', type: 'success' });
const showToast = (message, type = 'success') => { toast.value = { show: true, message, type }; };

/* ---------- data ---------- */
const fetchStatus = async () => {
  try {
    const res = await api.get('/health');
    services.value = Array.isArray(res.data) ? res.data.filter((s) => s.name) : [];
    events.seedFromSnapshot(services.value);
  } catch (err) {
    console.error('Erro ao carregar serviços', err);
    services.value = [];
  } finally {
    loading.value = false;
  }
};

const fetchHistory = async (serviceName) => {
  if (!serviceName) return showToast('Nome do serviço inválido', 'error');
  try {
    const res = await api.get(`/history/${serviceName}`);
    selectedHistory.value = res.data;
    showHistoryModal.value = true;
  } catch (err) {
    showToast('Não foi possível carregar o histórico.', 'error');
  }
};

const addService = async (payload) => {
  if (!payload.name || !payload.url) return showToast('Preencha todos os campos!', 'error');
  isSubmitting.value = true;
  try {
    await api.post('/services', payload);
    showToast(`${payload.name} — ${t.value.evAdded}`);
    events.recordAdded({ name: payload.name, url: payload.url, status: 'UP' });
    panel.value = null;
    await fetchStatus();
  } catch (err) {
    showToast('Erro ao comunicar com o servidor.', 'error');
  } finally {
    isSubmitting.value = false;
  }
};

const deleteService = async (id) => {
  const svc = services.value.find((s) => s.id === id);
  if (!confirm('Remover este serviço?')) return;
  try {
    await api.delete(`/services/${id}`);
    if (svc) events.recordRemoved(svc);
    showToast(`${svc?.name ?? ''} — ${t.value.evRemoved}`);
    await fetchStatus();
  } catch (err) {
    showToast('Falha ao remover o serviço', 'error');
  }
};

const upsertService = (update) => {
  const idx = services.value.findIndex((s) => s.id === update.id);
  if (idx === -1) services.value.push(update);
  else services.value[idx] = update;
};

useServiceSocket({
  onSnapshot: (snapshot) => {
    services.value = Array.isArray(snapshot) ? snapshot.filter((s) => s.name) : [];
    events.seedFromSnapshot(services.value);
    loading.value = false;
  },
  onUpdate: (update) => {
    if (update?.name) {
      events.recordUpdate(update);
      const prev = services.value.find((s) => s.id === update.id);
      if (prev && prev.status !== update.status) {
        showToast(`${update.name} ${update.status === 'UP' ? t.value.evUp : t.value.evDown}`, update.status === 'UP' ? 'success' : 'error');
      }
      upsertService(update);
    }
  },
});

onMounted(() => {
  fetchStatus();
  setInterval(fetchStatus, 60000);
});

defineExpose({ fetchHistory });

/* ---------- derived ---------- */
const latencyOf = (s) => s.responseTime ?? s.latency ?? s.ping ?? null;
const upCount = computed(() => services.value.filter((s) => s.status === 'UP').length);
const downCount = computed(() => services.value.length - upCount.value);
const avgLatency = computed(() => {
  const ups = services.value.filter((s) => s.status === 'UP' && latencyOf(s) != null);
  if (!ups.length) return null;
  return Math.round(ups.reduce((a, s) => a + latencyOf(s), 0) / ups.length);
});

const visibleServices = computed(() => {
  const q = search.value.trim().toLowerCase();
  return services.value.filter((s) => {
    if (filter.value === 'up' && s.status !== 'UP') return false;
    if (filter.value === 'down' && s.status === 'UP') return false;
    if (q && !(`${s.name} ${s.url}`.toLowerCase().includes(q))) return false;
    return true;
  });
});

/* ---------- event view helpers ---------- */
const rel = (ts) => {
  const s = Math.max(0, Math.floor((Date.now() - ts) / 1000));
  if (s < 5) return t.value.justNow;
  if (s < 60) return t.value.secAgo(s);
  if (s < 3600) return t.value.minAgo(Math.floor(s / 60));
  return t.value.hourAgo(Math.floor(s / 3600));
};
const evMeta = (type) => {
  const good = type === 'up' || type === 'added';
  const verb = type === 'up' ? t.value.evUp : type === 'down' ? t.value.evDown : type === 'added' ? t.value.evAdded : t.value.evRemoved;
  return { good, verb, color: good ? '#34d399' : '#f87171', bg: good ? 'rgba(52,211,153,.13)' : 'rgba(248,113,113,.13)' };
};

const openNotifications = () => { events.markAllRead(); panel.value = 'notifications'; };
const openDocs = () => {
  const docsUrl = resolveApiOrigin(import.meta.env.VITE_DOCS_URL) || 'http://localhost:5174';
  window.open(docsUrl, '_blank');
};
const configureApiKey = () => {
  const KEY = 'watchdog_api_key';
  const next = prompt('Admin API key (usada para criar/editar/remover serviços):', localStorage.getItem(KEY) || '');
  if (next === null) return;
  if (next.trim() === '') localStorage.removeItem(KEY);
  else localStorage.setItem(KEY, next.trim());
  showToast(next.trim() ? 'API key guardada' : 'API key removida');
};
</script>

<template>
  <Toast v-if="toast.show" :message="toast.message" :type="toast.type" @close="toast.show = false" />

  <div class="flex h-screen overflow-hidden" style="background: radial-gradient(1200px 600px at 70% -10%, rgba(59,130,246,.10), transparent 60%), var(--wd-bg);">

    <!-- Sidebar -->
    <aside class="w-[72px] shrink-0 flex flex-col items-center py-[18px] gap-1.5 border-r border-[var(--wd-tint)]/[.06] bg-[var(--wd-tint)]/[.015]">
      <div class="w-[42px] h-[42px] rounded-[13px] bg-gradient-to-br from-[#3b82f6] to-[#2563eb] flex items-center justify-center mb-3.5" style="box-shadow: 0 8px 22px -6px rgba(59,130,246,.7);">
        <Activity :size="22" class="text-white" />
      </div>
      <button title="Dashboard" @click="panel = null"
        class="w-11 h-11 rounded-[13px] flex items-center justify-center cursor-pointer transition-all hover:brightness-125"
        :style="panel === null ? 'background:rgba(59,130,246,.14);color:#60a5fa' : 'color:var(--wd-text-muted)'">
        <LayoutGrid :size="20" />
      </button>
      <button :title="t.notifications" @click="openNotifications"
        class="relative w-11 h-11 rounded-[13px] flex items-center justify-center cursor-pointer transition-all hover:brightness-125"
        :style="panel === 'notifications' ? 'background:rgba(59,130,246,.14);color:#60a5fa' : 'color:var(--wd-text-muted)'">
        <Bell :size="20" />
        <span v-if="events.unread.value > 0"
          class="absolute top-[5px] right-[5px] min-w-[16px] h-4 px-1 rounded-full bg-[#f87171] text-white text-[10px] font-extrabold flex items-center justify-center"
          style="box-shadow: 0 0 0 2px var(--wd-bg);">{{ events.unread.value > 9 ? '9+' : events.unread.value }}</span>
      </button>
      <button :title="t.historyNav" @click="panel = 'history'"
        class="w-11 h-11 rounded-[13px] flex items-center justify-center cursor-pointer transition-all hover:brightness-125"
        :style="panel === 'history' ? 'background:rgba(59,130,246,.14);color:#60a5fa' : 'color:var(--wd-text-muted)'">
        <Clock :size="20" />
      </button>
      <button :title="t.docs" @click="openDocs"
        class="w-11 h-11 rounded-[13px] flex items-center justify-center cursor-pointer transition-all text-[var(--wd-text-muted)] hover:bg-[var(--wd-tint)]/[.06] hover:text-[var(--wd-text)]">
        <BookOpen :size="20" />
      </button>
      <div class="flex-1"></div>
      <button :title="t.apiKey" @click="configureApiKey"
        class="w-11 h-11 rounded-[13px] flex items-center justify-center cursor-pointer transition-all text-[var(--wd-text-muted)] hover:bg-[var(--wd-tint)]/[.06] hover:text-[var(--wd-text)]">
        <KeyRound :size="20" />
      </button>
      <button :title="t.settings" @click="panel = 'settings'"
        class="w-11 h-11 rounded-[13px] flex items-center justify-center cursor-pointer transition-all hover:brightness-125"
        :style="panel === 'settings' ? 'background:rgba(59,130,246,.14);color:#60a5fa' : 'color:var(--wd-text-muted)'">
        <SlidersHorizontal :size="20" />
      </button>
    </aside>

    <!-- Main -->
    <main class="flex-1 overflow-y-auto overflow-x-hidden">
      <header class="sticky top-0 z-20 backdrop-blur-lg border-b border-[var(--wd-tint)]/[.06] px-[34px] py-5 flex items-center gap-5" style="background: var(--wd-header-bg);">
        <div class="flex flex-col gap-[3px]">
          <div class="flex items-center gap-2.5">
            <h1 class="m-0 text-[22px] font-extrabold tracking-[-.02em]">Watchdog <span class="text-[#60a5fa]">Panel</span></h1>
            <span class="inline-flex items-center gap-1.5 text-[11px] font-bold text-[#34d399] bg-[#34d3991f] px-2.5 py-1 rounded-full border border-[#34d39933]">
              <span class="w-1.5 h-1.5 rounded-full bg-[#34d399] wd-blink"></span>LIVE
            </span>
          </div>
          <p class="m-0 text-[11px] tracking-[.16em] uppercase text-[var(--wd-text-muted)] font-semibold">{{ t.subtitle }}</p>
        </div>
        <div class="flex-1"></div>
        <div class="flex items-center gap-2.5 bg-[var(--wd-search-bg)] border border-[var(--wd-tint)]/[.07] rounded-xl px-3.5 py-2.5 w-[230px] focus-within:border-[#3b82f680] transition-colors">
          <Search :size="16" class="text-[var(--wd-text-muted)]" />
          <input v-model="search" :placeholder="t.search" class="bg-transparent border-none outline-none text-[var(--wd-text)] text-[13px] w-full" />
        </div>
        <button @click="panel = 'add'"
          class="inline-flex items-center gap-2 bg-gradient-to-br from-[#3b82f6] to-[#2563eb] text-white border-none rounded-xl px-[18px] py-[11px] font-bold text-[13px] cursor-pointer transition-transform hover:-translate-y-px active:scale-[.98]"
          style="box-shadow: 0 8px 20px -8px rgba(59,130,246,.8);">
          <Plus :size="17" /> {{ t.addService }}
        </button>
      </header>

      <div class="px-[34px] pt-7 pb-12 max-w-[1400px] mx-auto">
        <!-- stats -->
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-[30px]">
          <div class="rounded-2xl p-[18px_20px] border border-[var(--wd-tint)]/[.06]" style="background: linear-gradient(160deg,var(--wd-stat-1),var(--wd-surface-2));">
            <div class="flex items-center justify-between">
              <span class="text-[11px] font-bold tracking-[.1em] uppercase text-[var(--wd-text-faint)]">{{ t.monitored }}</span>
              <span class="w-8 h-8 rounded-[10px] bg-[#3b82f624] flex items-center justify-center text-[#60a5fa]"><Server :size="17" /></span>
            </div>
            <div class="text-[34px] font-extrabold font-mono tracking-[-.03em] mt-3">{{ services.length }}</div>
            <div class="text-[12px] text-[var(--wd-text-faint)] mt-0.5">{{ t.monitoredSub }}</div>
          </div>
          <div class="rounded-2xl p-[18px_20px] border border-[#34d3991f]" style="background: linear-gradient(160deg,var(--wd-stat-up-1),var(--wd-stat-up-2));">
            <div class="flex items-center justify-between">
              <span class="text-[11px] font-bold tracking-[.1em] uppercase text-[var(--wd-text-faint)]">{{ t.operational }}</span>
              <span class="w-8 h-8 rounded-[10px] bg-[#34d39924] flex items-center justify-center text-[#34d399]"><Check :size="17" /></span>
            </div>
            <div class="text-[34px] font-extrabold font-mono tracking-[-.03em] mt-3 text-[#34d399]">{{ upCount }}</div>
            <div class="text-[12px] text-[var(--wd-text-faint)] mt-0.5">{{ t.operationalSub }}</div>
          </div>
          <div class="rounded-2xl p-[18px_20px] border border-[#f871711f]" style="background: linear-gradient(160deg,var(--wd-stat-down-1),var(--wd-stat-down-2));">
            <div class="flex items-center justify-between">
              <span class="text-[11px] font-bold tracking-[.1em] uppercase text-[var(--wd-text-faint)]">{{ t.failing }}</span>
              <span class="w-8 h-8 rounded-[10px] bg-[#f8717124] flex items-center justify-center text-[#f87171]"><X :size="17" /></span>
            </div>
            <div class="text-[34px] font-extrabold font-mono tracking-[-.03em] mt-3 text-[#f87171]">{{ downCount }}</div>
            <div class="text-[12px] text-[var(--wd-text-faint)] mt-0.5">{{ t.failingSub }}</div>
          </div>
          <div class="rounded-2xl p-[18px_20px] border border-[var(--wd-tint)]/[.06]" style="background: linear-gradient(160deg,var(--wd-stat-1),var(--wd-surface-2));">
            <div class="flex items-center justify-between">
              <span class="text-[11px] font-bold tracking-[.1em] uppercase text-[var(--wd-text-faint)]">{{ t.avgLatency }}</span>
              <span class="w-8 h-8 rounded-[10px] bg-[#3b82f624] flex items-center justify-center text-[#60a5fa]"><Gauge :size="17" /></span>
            </div>
            <div class="text-[34px] font-extrabold font-mono tracking-[-.03em] mt-3">{{ avgLatency ?? '—' }}<span v-if="avgLatency" class="text-base text-[var(--wd-text-faint)] font-semibold">ms</span></div>
            <div class="text-[12px] text-[var(--wd-text-faint)] mt-0.5">{{ t.avgLatencySub }}</div>
          </div>
        </div>

        <!-- filters -->
        <div class="flex items-center gap-3.5 mb-[18px]">
          <h2 class="m-0 text-[15px] font-bold">{{ t.services }}</h2>
          <div class="flex gap-1.5 bg-[var(--wd-surface-2)] border border-[var(--wd-tint)]/[.06] rounded-[11px] p-1">
            <button v-for="f in ['all','up','down']" :key="f" @click="filter = f"
              class="border-none rounded-lg px-3.5 py-1.5 text-[12px] font-bold cursor-pointer transition-all"
              :style="filter === f ? 'background:#3b82f6;color:#fff' : 'background:transparent;color:var(--wd-text-subtle)'">
              {{ f === 'all' ? t.all : f === 'up' ? 'Up' : 'Down' }}
              <span class="opacity-60">{{ f === 'all' ? services.length : f === 'up' ? upCount : downCount }}</span>
            </button>
          </div>
          <div class="flex-1"></div>
          <span class="text-[12px] text-[var(--wd-text-muted)] font-mono">{{ t.updates }}</span>
        </div>

        <!-- skeletons -->
        <div v-if="loading" class="grid gap-[18px]" style="grid-template-columns: repeat(auto-fill, minmax(370px, 1fr));">
          <div v-for="i in 6" :key="i" class="bg-[var(--wd-search-bg)] border border-[var(--wd-tint)]/[.06] rounded-[18px] p-[22px] h-[210px] overflow-hidden">
            <div class="flex gap-3 items-center">
              <div class="w-3.5 h-3.5 rounded-full wd-shimmer"></div>
              <div class="w-[130px] h-4 rounded-md wd-shimmer"></div>
            </div>
            <div class="w-[180px] h-[11px] rounded-md mt-3.5 wd-shimmer"></div>
            <div class="w-full h-[52px] rounded-[10px] mt-6 wd-shimmer"></div>
            <div class="w-full h-[30px] rounded-lg mt-[22px] wd-shimmer"></div>
          </div>
        </div>

        <!-- grid -->
        <template v-else>
          <div v-if="visibleServices.length" class="grid gap-[18px]" style="grid-template-columns: repeat(auto-fill, minmax(370px, 1fr));">
            <ServiceCard v-for="(service, i) in visibleServices" :key="service.id" :service="service" :index="i"
              @openHistory="fetchHistory" @deleteService="deleteService" @serviceUpdated="fetchStatus" />
          </div>
          <div v-else-if="services.length" class="text-center py-[70px] text-[var(--wd-text-muted)]">
            <div class="w-14 h-14 mx-auto mb-4 rounded-2xl bg-[var(--wd-tint)]/[.04] flex items-center justify-center text-[var(--wd-text-disabled)]"><Search :size="26" /></div>
            <p class="m-0 text-sm font-semibold">{{ t.noResults }}</p>
          </div>
          <div v-else class="text-center py-20 px-5 rounded-2xl border-2 border-dashed border-[var(--wd-tint)]/[.08] bg-[var(--wd-tint)]/[.02]">
            <p class="text-[var(--wd-text-muted)] font-medium max-w-md mx-auto">{{ t.empty }}</p>
          </div>
        </template>
      </div>
    </main>

    <!-- Add service modal -->
    <ServiceForm :isOpen="panel === 'add'" :isSubmitting="isSubmitting" @add="addService" @close="panel = null" />

    <!-- Per-service history modal -->
    <HistoryModal :isOpen="showHistoryModal" :history="selectedHistory" @close="showHistoryModal = false" />

    <!-- Notifications / History / Settings side panel -->
    <div v-if="panel === 'notifications' || panel === 'history' || panel === 'settings'"
      @click="panel = null"
      class="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-[var(--wd-overlay)] backdrop-blur-md wd-overlay-in">
      <div @click.stop class="w-full max-w-[520px] rounded-[26px] border border-[var(--wd-tint)]/[.09] p-8 wd-modal-in"
        style="background: linear-gradient(165deg,var(--wd-surface-1),var(--wd-surface-2)); box-shadow: 0 40px 80px -20px var(--wd-shadow);">

        <!-- Notifications -->
        <template v-if="panel === 'notifications'">
          <div class="flex items-center justify-between mb-1.5">
            <h2 class="m-0 text-[19px] font-extrabold flex items-center gap-2.5"><Bell :size="20" class="text-[#60a5fa]" />{{ t.notifications }}</h2>
            <div class="flex items-center gap-2">
              <button v-if="events.notifs.value.length" @click="events.clearNotifs()"
                class="border-none rounded-lg bg-[var(--wd-tint)]/[.05] text-[var(--wd-text-subtle)] px-3 py-[7px] text-[11px] font-bold cursor-pointer transition-all hover:bg-[#f8717129] hover:text-[#f87171]">{{ t.clearAll }}</button>
              <button @click="panel = null" class="w-[34px] h-[34px] border-none rounded-[10px] bg-[var(--wd-tint)]/[.05] text-[var(--wd-text-subtle)] flex items-center justify-center cursor-pointer transition-all hover:bg-[#f8717129] hover:text-[#f87171]"><X :size="18" /></button>
            </div>
          </div>
          <div v-if="events.notifs.value.length" class="flex flex-col gap-2 mt-4 max-h-[400px] overflow-y-auto">
            <div v-for="(n, i) in events.notifs.value" :key="n.id" class="flex items-center gap-3 bg-[var(--wd-input-bg)] border border-[var(--wd-tint)]/[.06] rounded-[13px] px-3.5 py-3 wd-row-in" :style="`animation-delay:${Math.min(i,10)*40}ms`">
              <span class="w-[34px] h-[34px] shrink-0 rounded-[10px] flex items-center justify-center" :style="`background:${evMeta(n.type).bg};color:${evMeta(n.type).color}`">
                <Check v-if="evMeta(n.type).good" :size="17" /><X v-else :size="17" />
              </span>
              <div class="min-w-0 flex-1">
                <div class="text-[13px] text-[var(--wd-text)]"><span class="font-extrabold">{{ n.name }}</span> {{ evMeta(n.type).verb }}</div>
                <div class="text-[11px] text-[var(--wd-text-muted)] font-mono mt-0.5">@{{ n.url }}</div>
              </div>
              <span class="text-[11px] text-[var(--wd-text-muted)] font-mono shrink-0">{{ rel(n.ts) }}</span>
              <button @click="events.dismiss(n.id)" :title="t.remove" class="border-none bg-transparent text-[var(--wd-text-disabled)] cursor-pointer shrink-0 flex p-0.5 transition-colors hover:text-[#f87171]"><X :size="15" /></button>
            </div>
          </div>
          <p v-else class="text-center text-[var(--wd-text-muted)] py-11 m-0 text-[13px]">{{ t.noEvents }}</p>
        </template>

        <!-- Activity history -->
        <template v-else-if="panel === 'history'">
          <div class="flex items-center justify-between mb-[18px]">
            <h2 class="m-0 text-[19px] font-extrabold flex items-center gap-2.5"><Clock :size="20" class="text-[#60a5fa]" />{{ t.activityLog }}</h2>
            <button @click="panel = null" class="w-[34px] h-[34px] border-none rounded-[10px] bg-[var(--wd-tint)]/[.05] text-[var(--wd-text-subtle)] flex items-center justify-center cursor-pointer transition-all hover:bg-[#f8717129] hover:text-[#f87171]"><X :size="18" /></button>
          </div>
          <div v-if="events.events.value.length" class="max-h-[400px] overflow-y-auto flex flex-col gap-2">
            <div v-for="(h, i) in events.events.value" :key="h.id" class="flex items-center gap-3 bg-[var(--wd-input-bg)] border border-[var(--wd-tint)]/[.06] rounded-[13px] px-3.5 py-3 wd-row-in" :style="`animation-delay:${Math.min(i,10)*40}ms`">
              <span class="w-[30px] h-[30px] shrink-0 rounded-[9px] flex items-center justify-center" :style="`background:${evMeta(h.type).bg};color:${evMeta(h.type).color}`">
                <Check v-if="evMeta(h.type).good" :size="15" /><X v-else :size="15" />
              </span>
              <div class="min-w-0 flex-1">
                <div class="text-[13px] text-[var(--wd-text)]"><span class="font-extrabold">{{ h.name }}</span> {{ evMeta(h.type).verb }}</div>
                <div class="text-[11px] text-[var(--wd-text-muted)] font-mono mt-0.5">{{ new Date(h.ts).toLocaleString(locale, { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }) }}</div>
              </div>
              <span class="text-[10px] font-extrabold tracking-[.06em] px-2.5 py-[3px] rounded-full shrink-0" :style="`background:${evMeta(h.type).bg};color:${evMeta(h.type).color}`">{{ evMeta(h.type).good ? 'UP' : 'DOWN' }}</span>
            </div>
          </div>
          <p v-else class="text-center text-[var(--wd-text-muted)] py-11 m-0 text-[13px]">{{ t.noEvents }}</p>
        </template>

        <!-- Settings -->
        <template v-else>
          <div class="flex items-center justify-between mb-[22px]">
            <h2 class="m-0 text-[19px] font-extrabold flex items-center gap-2.5"><SlidersHorizontal :size="20" class="text-[#60a5fa]" />{{ t.settings }}</h2>
            <button @click="panel = null" class="w-[34px] h-[34px] border-none rounded-[10px] bg-[var(--wd-tint)]/[.05] text-[var(--wd-text-subtle)] flex items-center justify-center cursor-pointer transition-all hover:bg-[#f8717129] hover:text-[#f87171]"><X :size="18" /></button>
          </div>
          <label class="text-[10px] tracking-[.12em] uppercase text-[var(--wd-text-faint)] font-bold ml-1">{{ t.theme }}</label>
          <div class="flex gap-2 mt-2.5 mb-6">
            <button v-for="opt in [{ code: 'dark', label: t.themeDark, icon: Moon }, { code: 'light', label: t.themeLight, icon: Sun }]" :key="opt.code" @click="setTheme(opt.code)"
              class="flex-1 flex items-center justify-center gap-2 rounded-[13px] px-4 py-3.5 text-sm font-bold cursor-pointer transition-all hover:brightness-110"
              :style="theme === opt.code ? 'background:rgba(59,130,246,.14);color:#60a5fa;border:1px solid rgba(59,130,246,.5)' : 'background:var(--wd-input-bg);color:var(--wd-text);border:1px solid color-mix(in oklab, var(--wd-tint) 8%, transparent)'">
              <component :is="opt.icon" :size="16" />{{ opt.label }}
            </button>
          </div>

          <label class="text-[10px] tracking-[.12em] uppercase text-[var(--wd-text-faint)] font-bold ml-1">{{ t.language }}</label>
          <div class="flex flex-col gap-2 mt-2.5">
            <button v-for="l in LANGUAGES" :key="l.code" @click="setLang(l.code)"
              class="flex items-center justify-between w-full rounded-[13px] px-4 py-3.5 text-sm font-bold cursor-pointer transition-all hover:brightness-110"
              :style="lang === l.code ? 'background:rgba(59,130,246,.14);color:#60a5fa;border:1px solid rgba(59,130,246,.5)' : 'background:var(--wd-input-bg);color:var(--wd-text);border:1px solid color-mix(in oklab, var(--wd-tint) 8%, transparent)'">
              <span class="flex items-center gap-3"><span class="text-xl">{{ l.flag }}</span>{{ l.label }}</span>
              <Check v-if="lang === l.code" :size="18" />
            </button>
          </div>
        </template>

      </div>
    </div>
  </div>
</template>
