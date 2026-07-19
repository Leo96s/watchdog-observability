<script setup>
import { KeyRound } from 'lucide-vue-next';

const STORAGE_KEY = 'watchdog_api_key';

const configureApiKey = () => {
  const current = localStorage.getItem(STORAGE_KEY) || '';
  const next = prompt('Admin API key (used to create/edit/delete services):', current);

  if (next === null) return;

  if (next.trim() === '') {
    localStorage.removeItem(STORAGE_KEY);
  } else {
    localStorage.setItem(STORAGE_KEY, next.trim());
  }
};
</script>

<template>
  <button @click="configureApiKey" title="Set admin API key"
    class="absolute top-6 right-20 z-50 text-gray-400 hover:text-white transition-all cursor-pointer p-2 rounded-lg hover:bg-white/5">
    <KeyRound :size="20" />
  </button>
</template>
