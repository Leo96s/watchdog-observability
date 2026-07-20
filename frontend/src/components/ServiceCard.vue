<script setup>
import { ref, computed, watch } from 'vue';
import { History, Trash2, Pencil } from 'lucide-vue-next';
import AddAlertModal from './AddAlertModal.vue';
import EditServiceModal from './EditServiceModal.vue';
import { useI18n } from '../i18n';

const props = defineProps(['service', 'index']);
defineEmits(['openHistory', 'deleteService', 'serviceUpdated', 'feedback']);
const { t } = useI18n();

const isAlertOpen = ref(false);
const isEditOpen = ref(false);
const flash = ref(false);

// Buffers locais alimentados a cada atualização recebida via socket.
const latencies = ref([]);   // últimos N valores de latência
const statuses = ref([]);    // últimos N estados ('UP'/'DOWN')
const MAX = 30;

const latencyOf = (s) => s.responseTime ?? s.latency ?? s.ping ?? null;

const seed = () => {
  const l = latencyOf(props.service);
  latencies.value = l != null ? [l] : [];
  statuses.value = [props.service.status];
};
seed();

let prevStatus = props.service.status;
watch(
  () => props.service,
  (s) => {
    const l = latencyOf(s);
    if (l != null) { latencies.value.push(l); if (latencies.value.length > MAX) latencies.value.shift(); }
    statuses.value.push(s.status); if (statuses.value.length > MAX) statuses.value.shift();
    if (s.status !== prevStatus) {
      prevStatus = s.status;
      flash.value = true;
      setTimeout(() => (flash.value = false), 900);
    }
  },
  { deep: true }
);

const isUp = computed(() => props.service.status === 'UP');
const color = computed(() => (isUp.value ? '#34d399' : '#f87171'));
const curLatency = computed(() => (latencies.value.length ? latencies.value[latencies.value.length - 1] : null));
const hasSpark = computed(() => latencies.value.length >= 2);
const uptimePct = computed(() => {
  if (!statuses.value.length) return null;
  const up = statuses.value.filter((s) => s === 'UP').length;
  return ((up / statuses.value.length) * 100).toFixed(2);
});
const bars = computed(() => statuses.value.slice(-MAX));

// SVG sparkline path
const spark = computed(() => {
  const data = latencies.value;
  if (data.length < 2) return { line: '', area: '' };
  const w = 220, h = 46, pad = 4;
  const min = Math.min(...data), max = Math.max(...data), rng = (max - min) || 1;
  const pts = data.map((v, i) => [(i / (data.length - 1)) * w, pad + (1 - (v - min) / rng) * (h - 2 * pad)]);
  const line = pts.map((p, i) => (i ? 'L' : 'M') + p[0].toFixed(1) + ' ' + p[1].toFixed(1)).join(' ');
  return { line, area: `${line} L ${w} ${h} L 0 ${h} Z` };
});
const gradId = computed(() => `wd-grad-${props.service.id}`);
</script>

<template>
  <div @click="isAlertOpen = true"
    class="relative rounded-[18px] p-[22px] overflow-hidden cursor-pointer border border-[var(--wd-tint)]/[.07] wd-card-in transition-all hover:-translate-y-[3px] hover:border-[#3b82f659]"
    style="background: linear-gradient(165deg,var(--wd-surface-1),var(--wd-card-2));"
    :style="`animation-delay:${(index || 0) * 70}ms`">

    <AddAlertModal :service="service" :isOpen="isAlertOpen" @close="isAlertOpen = false" @feedback="$emit('feedback', $event)" />
    <EditServiceModal :service="service" :isOpen="isEditOpen" @close="isEditOpen = false" @updated="$emit('serviceUpdated')" @feedback="$emit('feedback', $event)" />

    <div class="absolute left-0 top-0 bottom-0 w-1" :style="`background:${color}`"></div>
    <div v-if="flash" class="absolute inset-0 rounded-[18px] pointer-events-none wd-flash" :style="`background:${isUp ? 'rgba(52,211,153,.18)' : 'rgba(248,113,113,.18)'}`"></div>

    <!-- header -->
    <div class="flex items-start justify-between gap-2.5 relative">
      <div class="min-w-0">
        <div class="flex items-center gap-2.5">
          <span class="w-[11px] h-[11px] rounded-full shrink-0" :class="isUp ? 'wd-pulse-up' : 'wd-pulse-down'" :style="`background:${color}`"></span>
          <h3 class="m-0 text-[17px] font-extrabold tracking-[-.01em] truncate">{{ service.name }}</h3>
        </div>
        <div class="text-[12px] text-[var(--wd-text-muted)] font-mono mt-1.5 truncate">@{{ service.url }}</div>
      </div>
      <div class="flex gap-1 shrink-0">
        <button @click.stop="$emit('openHistory', service.name)" :title="t.recentHistory"
          class="w-8 h-8 border-none rounded-[9px] bg-[var(--wd-tint)]/[.04] text-[var(--wd-text-muted)] flex items-center justify-center cursor-pointer transition-all hover:bg-[#3b82f629] hover:text-[#60a5fa]"><History :size="16" /></button>
        <button @click.stop="isEditOpen = true" :title="t.edit"
          class="w-8 h-8 border-none rounded-[9px] bg-[var(--wd-tint)]/[.04] text-[var(--wd-text-muted)] flex items-center justify-center cursor-pointer transition-all hover:bg-[#3b82f629] hover:text-[#60a5fa]"><Pencil :size="16" /></button>
        <button @click.stop="$emit('deleteService', service.id)" :title="t.remove"
          class="w-8 h-8 border-none rounded-[9px] bg-[var(--wd-tint)]/[.04] text-[var(--wd-text-muted)] flex items-center justify-center cursor-pointer transition-all hover:bg-[#f8717129] hover:text-[#f87171]"><Trash2 :size="16" /></button>
      </div>
    </div>

    <!-- latency + sparkline -->
    <div class="flex items-end justify-between mt-[18px]">
      <div>
        <div class="text-[10px] tracking-[.12em] uppercase text-[var(--wd-text-muted)] font-bold">{{ t.latency }}</div>
        <div class="text-[24px] font-extrabold font-mono leading-none" :style="`color:${color}`">
          {{ curLatency ?? '—' }}<span v-if="curLatency != null" class="text-[13px] text-[var(--wd-text-muted)] font-semibold">ms</span>
        </div>
      </div>
      <svg v-if="hasSpark" width="150" height="46" viewBox="0 0 220 46" preserveAspectRatio="none" style="overflow: visible;">
        <defs>
          <linearGradient :id="gradId" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" :stop-color="color" stop-opacity=".35" />
            <stop offset="1" :stop-color="color" stop-opacity="0" />
          </linearGradient>
        </defs>
        <path :d="spark.area" :fill="`url(#${gradId})`" />
        <path :d="spark.line" fill="none" :stroke="color" stroke-width="2" stroke-linejoin="round" stroke-linecap="round" />
      </svg>
    </div>

    <!-- uptime bars -->
    <div class="mt-[18px]">
      <div class="flex items-center justify-between mb-[7px]">
        <span class="text-[10px] tracking-[.12em] uppercase text-[var(--wd-text-muted)] font-bold">{{ t.uptime }}</span>
        <span v-if="uptimePct != null" class="text-[12px] font-extrabold font-mono" :style="`color:${color}`">{{ uptimePct }}%</span>
      </div>
      <div class="flex gap-0.5 h-[22px] items-end">
        <div v-for="(b, i) in bars" :key="i" class="flex-1 h-full rounded-[2px] origin-bottom wd-bar" :style="`background:${b === 'UP' ? '#34d399' : '#f87171'};animation:wd-barIn .5s cubic-bezier(.2,.7,.2,1) both;animation-delay:${i * 18}ms`"></div>
      </div>
    </div>

    <!-- footer -->
    <div class="flex items-center justify-between mt-[18px] pt-3.5 border-t border-[var(--wd-tint)]/[.06]">
      <span class="inline-flex items-center gap-1.5 text-[11px] font-extrabold tracking-[.06em] uppercase px-2.5 py-[5px] rounded-full"
        :style="`background:${isUp ? 'rgba(52,211,153,.13)' : 'rgba(248,113,113,.13)'};color:${color}`">
        {{ isUp ? t.opStatus : t.downStatus }}
      </span>
    </div>
  </div>
</template>
