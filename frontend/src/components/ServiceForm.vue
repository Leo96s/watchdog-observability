<script setup>
import { ref } from 'vue';
import { Activity, Plus, Loader2, Bell, X, Settings2 } from 'lucide-vue-next';
import BaseSelect from './BaseSelect.vue';

const props = defineProps(['isSubmitting']);
const emit = defineEmits(['add']);

const notificationOptions = [
  { label: 'Webhook', value: 'webhook' },
  { label: 'Email', value: 'email' }
];

const methodOptions = [
  { label: 'GET', value: 'GET' },
  { label: 'POST', value: 'POST' },
  { label: 'PUT', value: 'PUT' },
  { label: 'HEAD', value: 'HEAD' },
];

const showAdvanced = ref(false);
const advancedError = ref('');

const newService = ref({
  name: '',
  url: '',
  notifications: [], // Array para e-mails e webhooks
  method: 'GET',
  expectedStatus: 200,
  headers: '',
});

const addNotification = () => {
  newService.value.notifications.push({ type: 'webhook', value: '' });
};

const removeNotification = (index) => {
  newService.value.notifications.splice(index, 1);
};

const handleSubmit = () => {
  if (!newService.value.name || !newService.value.url) return;

  advancedError.value = '';
  let headers;
  if (newService.value.headers.trim()) {
    try {
      headers = JSON.parse(newService.value.headers);
    } catch {
      advancedError.value = 'Headers must be valid JSON';
      return;
    }
  }

  // Filtra campos de notificação vazios antes de enviar
  const payload = {
    name: newService.value.name,
    url: newService.value.url,
    notifications: newService.value.notifications.filter(n => n.value.trim() !== ''),
    method: newService.value.method,
    expectedStatus: Number(newService.value.expectedStatus) || 200,
    headers,
  };

  emit('add', payload);

  newService.value = { name: '', url: '', notifications: [], method: 'GET', expectedStatus: 200, headers: '' };
};
</script>

<template>
  <div class="bg-[#1a1a1a] p-10 shadow-2xl mb-12 flex flex-col items-center w-full">
    <Activity class="text-[#3b82f6] mb-4" :size="32" />
    <h1 class="text-4xl font-bold text-white mb-2 text-center">
      Watchdog <span class="text-[#3b82f6]">Panel</span>
    </h1>
    <p class="text-gray-400 text-sm mb-8 font-medium uppercase tracking-widest">Real Time Monitorization</p>

    <div class="w-full max-w-2xl space-y-4">
      <div class="flex flex-col sm:flex-row gap-3 w-full justify-center items-center">
        <input v-model="newService.name" placeholder="Service Name"
          class="bg-[#333] border-none px-6 py-3 rounded-full text-white placeholder-gray-500 outline-none w-full sm:w-48 text-sm focus:ring-2 focus:ring-[#3b82f6] transition-all" />

        <input v-model="newService.url" placeholder="URL (http://...)"
          class="bg-[#333] border-none px-6 py-3 rounded-full text-white placeholder-gray-500 outline-none w-full sm:flex-1 text-sm focus:ring-2 focus:ring-[#3b82f6] transition-all" />

        <button @click="handleSubmit" :disabled="isSubmitting"
          class="bg-[#3b82f6]! hover:bg-[#2563eb]! text-white px-8 py-3 rounded-full font-bold text-sm flex items-center gap-2 transition-all whitespace-nowrap cursor-pointer disabled:bg-gray-600">
          <Plus v-if="!isSubmitting" :size="18" />
          <Loader2 v-else class="animate-spin" :size="18" />
          {{ isSubmitting ? 'A processar' : 'Adicionar' }}
        </button>
      </div>

      <div class="flex flex-col items-center mt-6">
        <button @click="addNotification" type="button"
          class="text-xs text-white hover:text-[#3b82f6]! flex items-center gap-2 transition-colors font-semibold uppercase tracking-tighter">
          <Bell :size="14" />
          + Configure Alerts (Email/Webhook)
        </button>

        <div v-if="newService.notifications.length > 0" class="w-full mt-4 space-y-2">
          <div v-for="(notif, index) in newService.notifications" :key="index"
            class="flex gap-2 animate-in fade-in slide-in-from-top-1">

            <div class="w-44 shrink-0">
              <BaseSelect v-model="notif.type" :options="notificationOptions" class="rounded-full! shadow-sm" />
            </div>

            <input v-model="notif.value" :placeholder="notif.type === 'email' ? 'example@email.com' : 'URL of Webhook'"
              class="flex-1 bg-[#2a2a2a] border-none px-5 py-2 rounded-full text-white text-xs outline-none focus:ring-1 focus:ring-[#3b82f6]" />

            <button @click="removeNotification(index)" class="text-gray-500 hover:text-red-500 p-2">
              <X :size="16" />
            </button>
          </div>
        </div>
      </div>

      <div class="flex flex-col items-center mt-4">
        <button @click="showAdvanced = !showAdvanced" type="button"
          class="text-xs text-white hover:text-[#3b82f6]! flex items-center gap-2 transition-colors font-semibold uppercase tracking-tighter">
          <Settings2 :size="14" />
          {{ showAdvanced ? 'Hide advanced options' : 'Advanced options (method, expected status, headers)' }}
        </button>

        <div v-if="showAdvanced" class="w-full mt-4 space-y-3">
          <div class="flex gap-3">
            <div class="w-36">
              <BaseSelect v-model="newService.method" :options="methodOptions" class="rounded-full!" />
            </div>
            <input v-model="newService.expectedStatus" type="number" placeholder="Expected status (200)"
              class="flex-1 bg-[#2a2a2a] border-none px-5 py-2 rounded-full text-white text-xs outline-none focus:ring-1 focus:ring-[#3b82f6]" />
          </div>

          <textarea v-model="newService.headers" rows="3" placeholder='Headers (JSON), e.g. { "Authorization": "Bearer ..." }'
            class="w-full bg-[#2a2a2a] text-white rounded-2xl p-4 border-none outline-none text-xs font-mono focus:ring-1 focus:ring-[#3b82f6]"></textarea>

          <p v-if="advancedError" class="text-red-500 text-xs text-center">{{ advancedError }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Adiciona uma animação suave para os novos campos */
.animate-in {
  animation: fadeIn 0.3s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>