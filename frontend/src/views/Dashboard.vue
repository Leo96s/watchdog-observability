<script setup>
import { ref, onMounted } from "vue";
import socket from "../services/socket.service";

const services = ref([]);

onMounted(() => {
  socket.on("status-update", (data) => {
    services.value = data;
  });
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
