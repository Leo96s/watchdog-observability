<script setup>
import { ref } from 'vue';
import { Plus, Loader2, Bell, X, Settings2 } from 'lucide-vue-next';
import BaseSelect from './BaseSelect.vue';

const props = defineProps(['isSubmitting', 'isOpen']);
const emit = defineEmits(['add', 'close']);

const notificationOptions = [
  { label: 'Webhook', value: 'webhook' },
  { label: 'Email', value: 'email' },
];
const methodOptions = [
  { label: 'GET', value: 'GET' }, { label: 'POST', value: 'POST' },
  { label: 'PUT', value: 'PUT' }, { label: 'HEAD', value: 'HEAD' },
];

const showAdvanced = ref(false);
const advancedError = ref('');
const newService = ref({ name: '', url: '', notifications: [], method: 'GET', expectedStatus: 200, headers: '' });

const addNotification = () => newService.value.notifications.push({ type: 'webhook', value: '' });
const removeNotification = (i) => newService.value.notifications.splice(i, 1);

const handleSubmit = () => {
  if (!newService.value.name || !newService.value.url) return;
  advancedError.value = '';
  let headers;
  if (newService.value.headers.trim()) {
    try { headers = JSON.parse(newService.value.headers); }
    catch { advancedError.value = 'Headers must be valid JSON'; return; }
  }
  emit('add', {
    name: newService.value.name,
    url: newService.value.url,
    notifications: newService.value.notifications.filter((n) => n.value.trim() !== ''),
    method: newService.value.method,
    expectedStatus: Number(newService.value.expectedStatus) || 200,
    headers,
  });
  newService.value = { name: '', url: '', notifications: [], method: 'GET', expectedStatus: 200, headers: '' };
  showAdvanced.value = false;
};
</script>

<template>
  <div v-if="isOpen" @click="$emit('close')" class="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-[var(--wd-overlay)] backdrop-blur-md wd-overlay-in">
    <div @click.stop class="w-full max-w-[480px] rounded-[26px] border border-[var(--wd-tint)]/[.09] p-8 wd-modal-in max-h-[88vh] overflow-y-auto"
      style="background: linear-gradient(165deg,var(--wd-surface-1),var(--wd-surface-2)); box-shadow: 0 40px 80px -20px var(--wd-shadow);">

      <div class="flex items-center justify-between mb-[22px]">
        <h2 class="m-0 text-[19px] font-extrabold flex items-center gap-2.5"><Plus :size="20" class="text-[#60a5fa]" />Novo serviço</h2>
        <button @click="$emit('close')" class="w-[34px] h-[34px] border-none rounded-[10px] bg-[var(--wd-tint)]/[.05] text-[var(--wd-text-subtle)] flex items-center justify-center cursor-pointer transition-all hover:bg-[#f8717129] hover:text-[#f87171]"><X :size="18" /></button>
      </div>

      <div class="flex flex-col gap-4">
        <div>
          <label class="text-[10px] tracking-[.12em] uppercase text-[var(--wd-text-faint)] font-bold ml-1">Nome do serviço</label>
          <input v-model="newService.name" placeholder="Ex.: API Gateway"
            class="w-full mt-[7px] bg-[var(--wd-input-bg)] border border-[var(--wd-tint)]/[.08] rounded-[13px] px-[15px] py-[13px] text-[var(--wd-text)] text-sm outline-none transition-colors focus:border-[#3b82f699]" />
        </div>
        <div>
          <label class="text-[10px] tracking-[.12em] uppercase text-[var(--wd-text-faint)] font-bold ml-1">URL</label>
          <input v-model="newService.url" placeholder="https://…"
            class="w-full mt-[7px] bg-[var(--wd-input-bg)] border border-[var(--wd-tint)]/[.08] rounded-[13px] px-[15px] py-[13px] text-[var(--wd-text)] font-mono text-[13px] outline-none transition-colors focus:border-[#3b82f699]" />
        </div>

        <!-- alerts -->
        <div>
          <button @click="addNotification" type="button" class="text-[11px] text-[var(--wd-text-subtle)] hover:text-[#60a5fa] flex items-center gap-2 transition-colors font-bold uppercase tracking-tight">
            <Bell :size="14" /> + Configurar alertas (Email/Webhook)
          </button>
          <div v-if="newService.notifications.length" class="mt-3 flex flex-col gap-2">
            <div v-for="(notif, i) in newService.notifications" :key="i" class="flex gap-2 wd-row-in">
              <div class="w-40 shrink-0"><BaseSelect v-model="notif.type" :options="notificationOptions" /></div>
              <input v-model="notif.value" :placeholder="notif.type === 'email' ? 'example@email.com' : 'URL do Webhook'"
                class="flex-1 bg-[var(--wd-input-bg)] border border-[var(--wd-tint)]/[.08] rounded-[13px] px-4 py-2.5 text-[var(--wd-text)] text-xs outline-none focus:border-[#3b82f699]" />
              <button @click="removeNotification(i)" class="text-[var(--wd-text-muted)] hover:text-[#f87171] p-2"><X :size="16" /></button>
            </div>
          </div>
        </div>

        <!-- advanced -->
        <div>
          <button @click="showAdvanced = !showAdvanced" type="button" class="text-[11px] text-[var(--wd-text-subtle)] hover:text-[#60a5fa] flex items-center gap-2 transition-colors font-bold uppercase tracking-tight">
            <Settings2 :size="14" /> {{ showAdvanced ? 'Ocultar opções avançadas' : 'Opções avançadas (método, status, headers)' }}
          </button>
          <div v-if="showAdvanced" class="mt-3 flex flex-col gap-3">
            <div class="flex gap-3">
              <div class="w-36"><BaseSelect v-model="newService.method" :options="methodOptions" /></div>
              <input v-model="newService.expectedStatus" type="number" placeholder="Status esperado (200)"
                class="flex-1 bg-[var(--wd-input-bg)] border border-[var(--wd-tint)]/[.08] rounded-[13px] px-4 py-2.5 text-[var(--wd-text)] text-xs outline-none focus:border-[#3b82f699]" />
            </div>
            <textarea v-model="newService.headers" rows="3" placeholder='Headers (JSON), ex.: { "Authorization": "Bearer ..." }'
              class="w-full bg-[var(--wd-input-bg)] border border-[var(--wd-tint)]/[.08] rounded-[13px] p-4 text-[var(--wd-text)] outline-none text-xs font-mono focus:border-[#3b82f699]"></textarea>
            <p v-if="advancedError" class="text-[#f87171] text-xs text-center">{{ advancedError }}</p>
          </div>
        </div>

        <button @click="handleSubmit" :disabled="isSubmitting"
          class="mt-1.5 w-full bg-gradient-to-br from-[#3b82f6] to-[#2563eb] text-white border-none rounded-[13px] py-3.5 font-bold text-sm cursor-pointer transition-transform hover:-translate-y-px active:scale-[.98] disabled:opacity-50 flex items-center justify-center gap-2"
          style="box-shadow: 0 10px 24px -10px rgba(59,130,246,.9);">
          <Loader2 v-if="isSubmitting" class="animate-spin" :size="18" />
          {{ isSubmitting ? 'A processar…' : 'Começar a monitorizar' }}
        </button>
      </div>
    </div>
  </div>
</template>
