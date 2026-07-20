<script setup>
import { ref, watch } from 'vue';
import { X, Pencil, Save } from 'lucide-vue-next';
import api from '../services/api.service';
import BaseSelect from './BaseSelect.vue';

const props = defineProps(['service', 'isOpen']);
const emit = defineEmits(['close', 'updated']);

const methodOptions = [
  { label: 'GET', value: 'GET' }, { label: 'POST', value: 'POST' },
  { label: 'PUT', value: 'PUT' }, { label: 'HEAD', value: 'HEAD' },
];

const form = ref({ name: '', url: '', method: 'GET', expectedStatus: 200, headers: '' });
const loading = ref(false);
const error = ref('');

watch(() => props.isOpen, async (open) => {
  if (!open || !props.service) return;
  error.value = '';
  try {
    const res = await api.get(`/services/${props.service.id}`);
    form.value = {
      name: res.data.serviceName || '',
      url: res.data.url || '',
      method: res.data.method || 'GET',
      expectedStatus: res.data.expectedStatus || 200,
      headers: res.data.headers ? JSON.stringify(res.data.headers, null, 2) : '',
    };
  } catch { error.value = 'Failed to load service details'; }
});

const handleSave = async () => {
  error.value = '';
  let parsedHeaders;
  if (form.value.headers.trim()) {
    try { parsedHeaders = JSON.parse(form.value.headers); }
    catch { error.value = 'Headers must be valid JSON'; return; }
  }
  loading.value = true;
  try {
    await api.patch(`/services/${props.service.id}`, {
      name: form.value.name,
      url: form.value.url,
      method: form.value.method,
      expectedStatus: Number(form.value.expectedStatus) || 200,
      headers: parsedHeaders,
    });
    emit('updated');
    emit('close');
  } catch (err) {
    error.value = err.response?.data?.error || 'Failed to update service';
  } finally { loading.value = false; }
};
</script>

<template>
  <div v-if="isOpen" @click="$emit('close')" class="fixed inset-0 z-[110] flex items-center justify-center p-6 bg-[var(--wd-overlay)] backdrop-blur-md wd-overlay-in">
    <div @click.stop class="w-full max-w-[460px] rounded-[26px] border border-[var(--wd-tint)]/[.09] p-8 wd-modal-in"
      style="background: linear-gradient(165deg,var(--wd-surface-1),var(--wd-surface-2)); box-shadow: 0 40px 80px -20px var(--wd-shadow);">

      <div class="flex items-center justify-between mb-[22px]">
        <h2 class="m-0 text-[19px] font-extrabold flex items-center gap-2.5"><Pencil :size="20" class="text-[#60a5fa]" />Editar serviço</h2>
        <button @click="$emit('close')" class="w-[34px] h-[34px] border-none rounded-[10px] bg-[var(--wd-tint)]/[.05] text-[var(--wd-text-subtle)] flex items-center justify-center cursor-pointer transition-all hover:bg-[#f8717129] hover:text-[#f87171]"><X :size="18" /></button>
      </div>

      <div class="flex flex-col gap-4">
        <div>
          <label class="text-[10px] tracking-[.12em] uppercase text-[var(--wd-text-faint)] font-bold ml-1">Nome</label>
          <input v-model="form.name" class="w-full mt-[7px] bg-[var(--wd-input-bg)] border border-[var(--wd-tint)]/[.08] rounded-[13px] px-[15px] py-[13px] text-[var(--wd-text)] text-sm outline-none transition-colors focus:border-[#3b82f699]" />
        </div>
        <div>
          <label class="text-[10px] tracking-[.12em] uppercase text-[var(--wd-text-faint)] font-bold ml-1">URL</label>
          <input v-model="form.url" class="w-full mt-[7px] bg-[var(--wd-input-bg)] border border-[var(--wd-tint)]/[.08] rounded-[13px] px-[15px] py-[13px] text-[var(--wd-text)] font-mono text-[13px] outline-none transition-colors focus:border-[#3b82f699]" />
        </div>
        <div class="flex gap-3">
          <div class="flex-1">
            <label class="text-[10px] tracking-[.12em] uppercase text-[var(--wd-text-faint)] font-bold ml-1">Método</label>
            <div class="mt-[7px]"><BaseSelect v-model="form.method" :options="methodOptions" /></div>
          </div>
          <div class="w-32">
            <label class="text-[10px] tracking-[.12em] uppercase text-[var(--wd-text-faint)] font-bold ml-1">Status esperado</label>
            <input v-model="form.expectedStatus" type="number" class="w-full mt-[7px] bg-[var(--wd-input-bg)] border border-[var(--wd-tint)]/[.08] rounded-[13px] px-[15px] py-[13px] text-[var(--wd-text)] text-sm outline-none focus:border-[#3b82f699]" />
          </div>
        </div>
        <div>
          <label class="text-[10px] tracking-[.12em] uppercase text-[var(--wd-text-faint)] font-bold ml-1">Headers (JSON, opcional)</label>
          <textarea v-model="form.headers" rows="3" placeholder='{ "Authorization": "Bearer ..." }'
            class="w-full mt-[7px] bg-[var(--wd-input-bg)] border border-[var(--wd-tint)]/[.08] rounded-[13px] p-4 text-[var(--wd-text)] outline-none text-xs font-mono focus:border-[#3b82f699]"></textarea>
        </div>
        <p v-if="error" class="text-[#f87171] text-xs text-center">{{ error }}</p>
        <button @click="handleSave" :disabled="loading"
          class="mt-1.5 w-full bg-gradient-to-br from-[#3b82f6] to-[#2563eb] text-white border-none rounded-[13px] py-3.5 font-bold text-sm cursor-pointer transition-transform hover:-translate-y-px active:scale-[.98] disabled:opacity-50 flex items-center justify-center gap-2"
          style="box-shadow: 0 10px 24px -10px rgba(59,130,246,.9);">
          <Save :size="18" v-if="!loading" />{{ loading ? 'A guardar…' : 'Guardar alterações' }}
        </button>
      </div>
    </div>
  </div>
</template>
