<script setup>
import { ref, onMounted } from 'vue';
import api from './services/api.service';
import { Toaster, toast } from 'vue-sonner';

import ServiceForm from './components/ServiceForm.vue';
import ServiceCard from './components/ServiceCard.vue';
import HistoryModal from './components/HistoryModal.vue';
import DocsButton from './components/DocsButton.vue';

const services = ref([]);
const isSubmitting = ref(false);
const showModal = ref(false);
const selectedHistory = ref([]);
const loadingHistory = ref(false);

const fetchStatus = async () => {
  try {
    const res = await api.get('/health');
    services.value = Array.isArray(res.data) ? res.data.filter(s => s.name) : [];
  } catch (err) {
    console.error("Erro ao carregar serviços", err);
    services.value = [];
  }
};

const fetchHistory = async (serviceName) => {
  if (!serviceName) return toast.error("Nome do serviço inválido");
  loadingHistory.value = true;
  try {
    const res = await api.get(`/history/${serviceName}`);
    selectedHistory.value = res.data;
    showModal.value = true;
    toast.success("Histórico carregado.");
  } catch (err) {
    toast.error("Não foi possível carregar o histórico.");
  } finally {
    loadingHistory.value = false;
  }
};

const addService = async (newServiceData) => {
  if (!newServiceData.name || !newServiceData.url) {
    toast.error("Preencha todos os campos!");
    return;
  }
  isSubmitting.value = true;
  try {
    await api.post('/services', newServiceData);
    toast.success(`Serviço "${newServiceData.name}" adicionado!`);
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

    <div class="bg-[#1a1a1a] p-10 shadow-xl mb-12 flex flex-col items-center w-full relative">

      <DocsButton />

      <ServiceForm :isSubmitting="isSubmitting" @add="addService" />
    </div>

    <div class="px-4">
      <div class="max-w-[1400px] mx-auto">
        <div v-if="services.length > 0" class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <ServiceCard v-for="service in services" :key="service.id" :service="service" @openHistory="fetchHistory" />
        </div>

        <div v-else class="text-center p-20 bg-white/50 rounded-[2rem] border-2 border-dashed border-gray-300">
          <p class="text-gray-500 font-medium">
            Doesn't look like you have any services being monitored yet. Use the form above to add a service and start
            monitoring its status in real-time!
          </p>
        </div>
      </div>
    </div>

    <HistoryModal :isOpen="showModal" :history="selectedHistory" @close="showModal = false" />
  </div>
</template>