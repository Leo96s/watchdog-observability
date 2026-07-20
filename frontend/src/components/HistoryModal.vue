<script setup>
import { Clock, X } from 'lucide-vue-next';
import { useI18n } from '../i18n';
defineProps(['isOpen', 'history']);
defineEmits(['close']);
const { t, locale } = useI18n();
</script>

<template>
  <div v-if="isOpen" @click="$emit('close')" class="fixed inset-0 z-[110] flex items-center justify-center p-6 bg-[var(--wd-overlay)] backdrop-blur-md wd-overlay-in">
    <div @click.stop class="w-full max-w-[600px] max-h-[80vh] rounded-[26px] border border-[var(--wd-tint)]/[.09] p-8 flex flex-col wd-modal-in"
      style="background: linear-gradient(165deg,var(--wd-surface-1),var(--wd-surface-2)); box-shadow: 0 40px 80px -20px var(--wd-shadow);">

      <div class="flex items-center justify-between mb-[18px]">
        <h2 class="m-0 text-[19px] font-extrabold flex items-center gap-2.5"><Clock :size="20" class="text-[#60a5fa]" />{{ t.recentHistory }}</h2>
        <button @click="$emit('close')" class="w-[34px] h-[34px] border-none rounded-[10px] bg-[var(--wd-tint)]/[.05] text-[var(--wd-text-subtle)] flex items-center justify-center cursor-pointer transition-all hover:bg-[#f8717129] hover:text-[#f87171]"><X :size="18" /></button>
      </div>

      <div class="grid grid-cols-[1fr_auto_auto] gap-x-[18px] text-[10px] tracking-[.12em] uppercase text-[var(--wd-text-muted)] font-bold px-1 pb-2.5 border-b border-[var(--wd-tint)]/[.06]">
        <span>{{ t.dateTime }}</span><span class="text-center">{{ t.statusCol }}</span><span class="text-right">{{ t.latencyCol }}</span>
      </div>

      <div class="overflow-y-auto">
        <div v-for="(log, i) in history" :key="log.id"
          class="grid grid-cols-[1fr_auto_auto] gap-x-[18px] items-center py-2.5 px-1 border-b border-[var(--wd-tint)]/[.04] wd-row-in" :style="`animation-delay:${Math.min(i,10)*35}ms`">
          <span class="text-[13px] text-[var(--wd-text-dim)] font-mono">{{ new Date(log.createdAt).toLocaleString(locale) }}</span>
          <span class="justify-self-center text-[10px] font-extrabold tracking-[.06em] px-2.5 py-[3px] rounded-full"
            :style="log.status === 'UP' ? 'background:rgba(52,211,153,.13);color:#34d399' : 'background:rgba(248,113,113,.13);color:#f87171'">{{ log.status }}</span>
          <span class="justify-self-end text-[13px] font-mono text-[var(--wd-text-muted)]">{{ log.responseTime || '—' }}ms</span>
        </div>
        <p v-if="!history.length" class="text-center py-11 text-[var(--wd-text-muted)] text-[13px]">{{ t.noHistory }}</p>
      </div>
    </div>
  </div>
</template>
