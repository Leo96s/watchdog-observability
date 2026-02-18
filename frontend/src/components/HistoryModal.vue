<script setup>
defineProps(['isOpen', 'history']);
defineEmits(['close']);
</script>

<template>
  <div v-if="isOpen" class="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
    <div class="bg-white rounded-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden shadow-2xl flex flex-col">
      <div class="p-6 border-b flex justify-between items-center bg-gray-50">
        <h2 class="text-xl font-bold text-gray-800">Histórico Recente</h2>
        <button @click="$emit('close')" class="text-gray-500 hover:text-red-500 text-2xl">&times;</button>
      </div>

      <div class="p-6 overflow-y-auto">
        <table class="w-full text-left">
          <thead>
            <tr class="text-xs uppercase text-gray-400 font-bold border-b">
              <th class="pb-3">Data/Hora</th>
              <th class="pb-3 text-center">Status</th>
              <th class="pb-3 text-right">Latência</th>
            </tr>
          </thead>
          <tbody class="divide-y">
            <tr v-for="log in history" :key="log.id" class="text-sm">
              <td class="py-3 text-gray-600">
                {{ new Date(log.createdAt).toLocaleString() }}
              </td>
              <td class="py-3 text-center">
                <span :class="log.status === 'UP' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'"
                  class="px-2 py-1 rounded-full text-[10px] font-bold">
                  {{ log.status }}
                </span>
              </td>
              <td class="px-6 py-4 text-right text-xs font-mono text-gray-400">
                {{ log.responseTime || '---' }}ms
              </td>
            </tr>
          </tbody>
        </table>
        <p v-if="history.length === 0" class="text-center py-10 text-gray-400">Sem registos no histórico.</p>
      </div>
    </div>
  </div>
</template>