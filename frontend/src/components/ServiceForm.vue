<script setup>
import { ref } from 'vue';
import { Activity, Plus, Loader2 } from 'lucide-vue-next';

const props = defineProps(['isSubmitting']);
const emit = defineEmits(['add']);

const newService = ref({ name: '', url: '' });

const handleSubmit = () => {
  emit('add', { ...newService.value });
  newService.value = { name: '', url: '' }; // Limpa após emitir
};
</script>

<template>
  <div class="bg-[#1a1a1a] p-10 shadow-2xl mb-12 flex flex-col items-center w-full">
    <Activity class="text-white mb-4" :size="32" />
    <h1 class="text-4xl font-bold text-white mb-2 text-center">
      Watchdog <span class="text-[#3b82f6]">Panel</span>
    </h1>
    <p class="text-gray-400 text-sm mb-8 font-medium">Monitorização em tempo real</p>

    <div class="flex flex-col sm:flex-row gap-3 w-full max-w-xl justify-center items-center">
      <input v-model="newService.name" placeholder="Nome do Serviço"
        class="bg-[#333] border-none px-6 py-3 rounded-full text-white placeholder-gray-500 outline-none w-full sm:w-48 text-sm" />

      <input v-model="newService.url" placeholder="URL (http://...)"
        class="bg-[#333] border-none px-6 py-3 rounded-full text-white placeholder-gray-500 outline-none w-full sm:flex-1 text-sm" />

      <button @click="handleSubmit" :disabled="isSubmitting"
        class="bg-[#3b82f6] hover:bg-[#2563eb] text-white px-6 py-3 rounded-full font-bold text-sm flex items-center gap-2 transition-all whitespace-nowrap cursor-pointer">
        <Plus v-if="!isSubmitting" :size="18" />
        <Loader2 v-else class="animate-spin" :size="18" />
        Adicionar
      </button>
    </div>
  </div>
</template>