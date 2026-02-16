<script setup>
import { ref, onMounted } from 'vue';
import api from './services/api.service'; 
import { Activity, CheckCircle, XCircle, Plus, Loader2 } from 'lucide-vue-next';
import { Toaster, toast } from 'vue-sonner';

const services = ref([]);
const isSubmitting = ref(false);
const newService = ref({ name: '', url: '' });

const fetchStatus = async () => {
  try {
    const res = await api.get('/health');
    services.value = Array.isArray(res.data) ? res.data.filter(s => s.name) : [];
  } catch (err) {
    console.error("Erro ao carregar serviços", err);
    services.value = [];
  }
};

const addService = async () => {
  if (!newService.value.name || !newService.value.url) {
    toast.error("Preencha todos os campos!");
    return;
  }

  isSubmitting.value = true;

  try {
    await api.post('/services', newService.value);
    toast.success(`Serviço "${newService.value.name}" adicionado!`);
    newService.value = { name: '', url: '' };
    await fetchStatus();
  } catch (err) {
    toast.error("Erro ao comunicar com o servidor.");
  } finally {
    isSubmitting.value = false;
  }
};

onMounted(() => {
  fetchStatus();
  setInterval(fetchStatus, 10000);
});
</script>

<template>
  <Toaster position="top-right" richColors />

  <div class="min-h-screen w-full bg-[#f3f4f6] pb-10 font-sans antialiased">

    <!-- HEADER FULL WIDTH -->
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

        <button @click="addService" :disabled="isSubmitting"
                class="bg-[#3b82f6] hover:bg-[#2563eb] text-white px-6 py-3 rounded-full font-bold text-sm flex items-center gap-2 transition-all whitespace-nowrap cursor-pointer">
          <Plus v-if="!isSubmitting" :size="18" />
          <Loader2 v-else class="animate-spin" :size="18" />
          Adicionar
        </button>
      </div>
    </div>

    <!-- CONTEÚDO CENTRADO -->
    <div class="px-4">
      <div class="max-w-[1400px] mx-auto">

        <div v-if="services.length > 0" class="grid grid-cols-1 md:grid-cols-2 gap-6">

          <div v-for="service in services" :key="service.id"
               class="bg-white p-8 shadow-md border-l-[6px] transition-all flex flex-col justify-between relative"
               :class="service.status === 'UP' ? 'border-[#3b82f6]' : 'border-red-500'">

            <div class="text-left">
              <h3 class="text-xl font-bold text-gray-900 leading-tight">{{ service.name }}</h3>
              <p class="text-[#3b82f6] font-bold text-sm mt-1">{{ service.name }}</p>
              <p class="text-gray-400 text-xs mt-1">@{{ service.url }}</p>
            </div>

            <div class="flex justify-between items-end mt-8">
              <div class="text-left font-bold text-xs uppercase tracking-tight"
                   :class="service.status === 'UP' ? 'text-[#3b82f6]' : 'text-red-500'">
                Status: {{ service.status }}
              </div>

              <div class="flex gap-[3px]">
                <div v-for="i in 12" :key="i"
                     :class="service.status === 'UP' ? 'bg-[#3b82f6]' : 'bg-red-500'"
                     class="w-[6px] h-3 opacity-60"></div>
              </div>
            </div>

            <div class="absolute right-8 top-1/2 -translate-y-1/2">
              <div :class="service.status === 'UP' ? 'bg-blue-50 text-[#3b82f6]' : 'bg-red-50 text-red-500'"
                   class="p-2 rounded-full border border-current opacity-40">
                <CheckCircle v-if="service.status === 'UP'" :size="24" />
                <XCircle v-else :size="24" />
              </div>
            </div>

          </div>

        </div>

        <div v-else class="text-center p-20 bg-white/50 rounded-[2rem] border-2 border-dashed border-gray-300">
          <p class="text-gray-500 font-medium">
            Nenhum serviço registado. Adicione o primeiro no painel acima!
          </p>
        </div>

      </div>
    </div>

  </div>
</template>
