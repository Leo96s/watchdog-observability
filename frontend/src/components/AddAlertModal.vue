<script setup>
import { ref, watch } from 'vue';
import { X, Bell, Send, Trash2 } from 'lucide-vue-next';
import api from '../services/api.service';
import BaseSelect from './BaseSelect.vue';

const props = defineProps(['service', 'isOpen']);
const emit = defineEmits(['close']);

const type = ref('webhook');
const value = ref('');
const loading = ref(false);
const destinations = ref([]);

const fetchDestinations = async () => {
  if (!props.service?.id) return;
  try {
    const res = await api.get(`/services/${props.service.id}`);
    destinations.value = res.data.destinations || [];
  } catch { console.error('Erro ao carregar destinos de notificação'); }
};

watch(() => props.isOpen, (open) => { if (open) fetchDestinations(); });

const handleAdd = async () => {
  if (!value.value) return;
  loading.value = true;
  try {
    await api.post(`/services/${props.service.id}/notifications`, { type: type.value, value: value.value });
    value.value = '';
    await fetchDestinations();
  } catch { console.error('Erro ao adicionar alerta'); }
  finally { loading.value = false; }
};

const removeDestination = async (notifId) => {
  try {
    await api.delete(`/services/${props.service.id}/notifications/${notifId}`);
    destinations.value = destinations.value.filter((d) => d.id !== notifId);
  } catch { console.error('Erro ao remover alerta'); }
};
</script>

<template>
  <div v-if="isOpen" @click="$emit('close')" class="fixed inset-0 z-[110] flex items-center justify-center p-6 bg-[var(--wd-overlay)] backdrop-blur-md wd-overlay-in">
    <div @click.stop class="w-full max-w-[460px] rounded-[26px] border border-[var(--wd-tint)]/[.09] p-8 wd-modal-in"
      style="background: linear-gradient(165deg,var(--wd-surface-1),var(--wd-surface-2)); box-shadow: 0 40px 80px -20px var(--wd-shadow);">

      <div class="flex items-center justify-between mb-1.5">
        <h2 class="m-0 text-[19px] font-extrabold flex items-center gap-2.5"><Bell :size="20" class="text-[#60a5fa]" />Alertas</h2>
        <button @click="$emit('close')" class="w-[34px] h-[34px] border-none rounded-[10px] bg-[var(--wd-tint)]/[.05] text-[var(--wd-text-subtle)] flex items-center justify-center cursor-pointer transition-all hover:bg-[#f8717129] hover:text-[#f87171]"><X :size="18" /></button>
      </div>
      <p class="m-0 mb-5 text-[12px] text-[var(--wd-text-muted)] font-mono">@{{ service?.url }}</p>

      <div v-if="destinations.length" class="flex flex-col gap-2 mb-[18px]">
        <div v-for="dest in destinations" :key="dest.id" class="flex items-center justify-between gap-2.5 bg-[var(--wd-input-bg)] border border-[var(--wd-tint)]/[.06] rounded-[13px] px-3.5 py-2.5 wd-row-in">
          <span class="text-xs text-[var(--wd-text)] truncate">
            <span class="text-[#60a5fa] font-extrabold uppercase text-[10px] mr-2">{{ dest.type }}</span>{{ dest.value }}
          </span>
          <button @click="removeDestination(dest.id)" class="text-[var(--wd-text-muted)] hover:text-[#f87171] shrink-0 flex transition-colors"><Trash2 :size="15" /></button>
        </div>
      </div>

      <div class="flex flex-col gap-3.5">
        <div>
          <label class="text-[10px] tracking-[.12em] uppercase text-[var(--wd-text-faint)] font-bold ml-1">Tipo de alerta</label>
          <div class="mt-[7px]">
            <BaseSelect v-model="type" :options="[{ label: 'Discord / Slack Webhook', value: 'webhook' }, { label: 'E-mail', value: 'email' }]" />
          </div>
        </div>
        <div>
          <label class="text-[10px] tracking-[.12em] uppercase text-[var(--wd-text-faint)] font-bold ml-1">Destino (URL ou email)</label>
          <input v-model="value" :placeholder="type === 'email' ? 'exemplo@mail.com' : 'https://discord.com/api/webhooks/…'"
            class="w-full mt-[7px] bg-[var(--wd-input-bg)] border border-[var(--wd-tint)]/[.08] rounded-[13px] px-[15px] py-[13px] text-[var(--wd-text)] font-mono text-[13px] outline-none transition-colors focus:border-[#3b82f699]" />
        </div>
        <button @click="handleAdd" :disabled="loading"
          class="mt-0.5 w-full bg-gradient-to-br from-[#3b82f6] to-[#2563eb] text-white border-none rounded-[13px] py-3.5 font-bold text-sm cursor-pointer transition-transform hover:-translate-y-px active:scale-[.98] disabled:opacity-50 flex items-center justify-center gap-2"
          style="box-shadow: 0 10px 24px -10px rgba(59,130,246,.9);">
          <Send :size="17" v-if="!loading" />{{ loading ? 'A guardar…' : 'Ativar alerta' }}
        </button>
      </div>
    </div>
  </div>
</template>
