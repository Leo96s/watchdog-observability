<script setup>
import { ref, watch } from 'vue';
import { X, Pencil, Save } from 'lucide-vue-next';
import api from '../services/api.service';
import BaseSelect from './BaseSelect.vue';

const props = defineProps(['service', 'isOpen']);
const emit = defineEmits(['close', 'updated']);

const methodOptions = [
  { label: 'GET', value: 'GET' },
  { label: 'POST', value: 'POST' },
  { label: 'PUT', value: 'PUT' },
  { label: 'HEAD', value: 'HEAD' },
];

const form = ref({ name: '', url: '', method: 'GET', expectedStatus: 200, headers: '' });
const loading = ref(false);
const loadingDetails = ref(false);
const error = ref('');

// The service list only carries the lightweight status shape; fetch the
// full record (method/expectedStatus/headers) when the modal opens.
watch(() => props.isOpen, async (open) => {
  if (!open || !props.service) return;
  error.value = '';
  loadingDetails.value = true;
  try {
    const res = await api.get(`/services/${props.service.id}`);
    form.value = {
      name: res.data.serviceName || '',
      url: res.data.url || '',
      method: res.data.method || 'GET',
      expectedStatus: res.data.expectedStatus || 200,
      headers: res.data.headers ? JSON.stringify(res.data.headers, null, 2) : '',
    };
  } catch (err) {
    error.value = 'Failed to load service details';
  } finally {
    loadingDetails.value = false;
  }
});

const handleSave = async () => {
  error.value = '';

  let parsedHeaders;
  if (form.value.headers.trim()) {
    try {
      parsedHeaders = JSON.parse(form.value.headers);
    } catch {
      error.value = 'Headers must be valid JSON';
      return;
    }
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
  } finally {
    loading.value = false;
  }
};
</script>

<template>
  <div v-if="isOpen" @click.stop class="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/60 backdrop-blur-md">
    <div
      class="bg-[#1a1a1a] w-full max-w-md rounded-[3rem] border border-white/10 p-12 shadow-[0_32px_64px_-12px_rgba(0,0,0,0.6)] animate-in fade-in zoom-in duration-300">

      <div class="flex justify-between items-center mb-8 ml-4 mt-5">
        <h2 class="text-white font-bold text-lg flex items-center gap-2">
          <Pencil class="text-[#3b82f6]" :size="20" /> Edit Service
        </h2>
        <button @click.stop="$emit('close')" class="text-gray-500 hover:text-white mr-4">
          <X :size="20" />
        </button>
      </div>

      <div class="space-y-4 ml-4 mr-4">
        <div>
          <label class="text-gray-500 text-[10px] uppercase font-bold ml-2">Name</label>
          <input v-model="form.name"
            class="w-full bg-[#2a2a2a] text-white rounded-2xl p-4 border-none outline-none mt-1 focus:ring-1 focus:ring-[#3b82f6]" />
        </div>

        <div>
          <label class="text-gray-500 text-[10px] uppercase font-bold ml-2">URL</label>
          <input v-model="form.url"
            class="w-full bg-[#2a2a2a] text-white rounded-2xl p-4 border-none outline-none mt-1 focus:ring-1 focus:ring-[#3b82f6]" />
        </div>

        <div class="flex gap-3">
          <div class="flex-1">
            <label class="text-gray-500 text-[10px] uppercase font-bold ml-2">Method</label>
            <BaseSelect v-model="form.method" :options="methodOptions" class="mt-1" />
          </div>
          <div class="w-32">
            <label class="text-gray-500 text-[10px] uppercase font-bold ml-2">Expected status</label>
            <input v-model="form.expectedStatus" type="number"
              class="w-full bg-[#2a2a2a] text-white rounded-2xl p-4 border-none outline-none mt-1 focus:ring-1 focus:ring-[#3b82f6]" />
          </div>
        </div>

        <div>
          <label class="text-gray-500 text-[10px] uppercase font-bold ml-2">Headers (JSON, optional)</label>
          <textarea v-model="form.headers" rows="3" placeholder='{ "Authorization": "Bearer ..." }'
            class="w-full bg-[#2a2a2a] text-white rounded-2xl p-4 border-none outline-none mt-1 focus:ring-1 focus:ring-[#3b82f6] font-mono text-xs"></textarea>
        </div>

        <p v-if="error" class="text-red-500 text-xs text-center">{{ error }}</p>

        <div class="flex justify-center w-full mt-6 mb-6">
          <button @click="handleSave" :disabled="loading"
            class="mx-auto px-8 py-2 bg-[#3b82f6]! text-white rounded-xl font-bold hover:bg-[#2563eb] transition-all flex items-center justify-center gap-2 text-sm shadow-lg shadow-[#3b82f6]/20 active:scale-95 disabled:opacity-50">
            <Save :size="18" v-if="!loading" />
            {{ loading ? 'Saving...' : 'Save changes' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
