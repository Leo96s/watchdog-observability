<script setup>
import { History, CheckCircle, XCircle } from 'lucide-vue-next';

defineProps(['service']);
defineEmits(['openHistory']);
</script>

<template>
    <div class="bg-white p-8 shadow-md border-l-[6px] transition-all flex flex-col justify-between relative"
        :class="service.status === 'UP' ? 'border-[#3b82f6]' : 'border-red-500'">

        <div class="text-left">
            <div class="flex items-center justify-between">
                <h3 class="text-xl font-bold text-gray-900 leading-tight">{{ service.name }}</h3>

                <button @click="$emit('openHistory', service.name)"
                    class="p-2 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-blue-500 transition-all cursor-pointer"
                    title="Ver Histórico">
                    <History :size="20" />
                </button>
            </div>

            <p class="text-[#3b82f6] font-bold text-sm mt-1">{{ service.name }}</p>
            <p class="text-gray-400 text-xs mt-1">@{{ service.url }}</p>
        </div>

        <div class="flex justify-between items-end mt-8">
            <div class="text-left font-bold text-xs uppercase tracking-tight"
                :class="service.status === 'UP' ? 'text-[#3b82f6]' : 'text-red-500'">
                Status: {{ service.status }}
            </div>

            <div class="flex gap-[3px]">
                <div v-for="i in 12" :key="i" :class="service.status === 'UP' ? 'bg-[#3b82f6]' : 'bg-red-500'"
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
</template>