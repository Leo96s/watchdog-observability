<script setup>
import { BookOpen } from 'lucide-vue-next';

const openDocs = () => {
  // Ajusta a porta conforme necessário (VitePress costuma usar 5174 por padrão)
  window.open('http://localhost:5174', '_blank');
};
</script>

<template>
  <button 
    @click="openDocs" 
    class="absolute top-6 right-6 z-50 flex items-center gap-2 text-white hover:text-gray-200 transition-all cursor-pointer group p-2 rounded-lg hover:bg-white/5"
    title="Abrir Documentação"
  >
    <span class="text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity duration-300">
      DOCS
    </span>
    <BookOpen :size="24" />
  </button>
</template>