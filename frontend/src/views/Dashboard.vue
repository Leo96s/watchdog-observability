<script setup>
import { ref, onMounted } from "vue";
import api from "../services/api.service";

const services = ref([]);

onMounted(async () => {
  const response = await api.get("/health");
  services.value = response.data;
});
</script>

<template>
  <div>
    <h2>Estado dos Serviços</h2>
    <div v-for="service in services" :key="service.name">
      {{ service.name }} - {{ service.status }} - {{ service.latency }}ms
    </div>
  </div>
</template>
