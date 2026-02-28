<script setup>
import { ref } from 'vue';
import { Activity, Plus, Loader2, Bell, X } from 'lucide-vue-next';
import BaseSelect from './BaseSelect.vue';

const props = defineProps(['isSubmitting']);
const emit = defineEmits(['add']);

const notificationOptions = [
  { label: 'Webhook', value: 'webhook' },
  { label: 'Email', value: 'email' }
];

const newService = ref({
  name: '',
  url: '',
  notifications: [] // Array para e-mails e webhooks
});

const addNotification = () => {
  newService.value.notifications.push({ type: 'webhook', value: '' });
};

const removeNotification = (index) => {
  newService.value.notifications.splice(index, 1);
};

const handleSubmit = () => {
  if (!newService.value.name || !newService.value.url) return;

  // Filtra campos de notificação vazios antes de enviar
  const payload = {
    ...newService.value,
    notifications: newService.value.notifications.filter(n => n.value.trim() !== '')
  };

  emit('add', payload);
 
  newService.value = { name: '', url: '', notifications: [] };
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