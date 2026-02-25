<script setup>
import { ref } from 'vue';
import { X, Bell, Send } from 'lucide-vue-next';
import axios from 'axios';
import BaseSelect from './BaseSelect.vue'

const props = defineProps(['service', 'isOpen']);
const emit = defineEmits(['close']);

const type = ref('webhook');
const value = ref('');
const loading = ref(false);

const handleAdd = async () => {
    if (!value.value) return;
    loading.value = true;

    try {
        // Rota para adicionar apenas uma notificação ao serviço
        await axios.post(`http://localhost:3000/api/services/${props.service.id}/notifications`, {
            type: type.value,
            value: value.value
        });

        value.value = '';
        emit('close');
        alert('Alerta configurado com sucesso!');
    } catch (err) {
        console.error("Erro ao adicionar alerta");
    } finally {
        loading.value = false;
    }
};
</script>

<template>
    <div v-if="isOpen" @click.stop class="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/60 backdrop-blur-md">
        <div
            class="bg-[#1a1a1a] w-full max-w-md rounded-[3rem] border border-white/10 p-12 shadow-[0_32px_64px_-12px_rgba(0,0,0,0.6)] animate-in fade-in zoom-in duration-300">

            <div class="flex justify-between items-center mb-8 ml-4 mt-5">
                <h2 class="text-white font-bold text-lg flex items-center gap-2">
                    <Bell class="text-[#3b82f6]" :size="20" /> New Alert
                </h2>
                <button @click.stop="$emit('close')" class="text-gray-500 hover:text-white mr-4">
                    <X :size="20" />
                </button>
            </div>

            <div class="space-y-4 ml-4 mr-4">
                <div>
                    <label class="text-gray-500 text-[10px] uppercase font-bold ml-2">
                        Type of alert
                    </label>

                    <BaseSelect v-model="type" :options="[
                        { label: 'Discord / Slack Webhook', value: 'webhook' },
                        { label: 'E-mail', value: 'email' }
                    ]" />
                </div>

                <div>
                    <label class="text-gray-500 text-[10px] uppercase font-bold ml-2">Destiny (URL or Email)</label>
                    <input v-model="value" :placeholder="type === 'email' ? 'exemplo@mail.com' : 'https://discord...'"
                        class="w-full bg-[#2a2a2a] text-white rounded-2xl p-4 border-none outline-none mt-1 focus:ring-1 focus:ring-[#3b82f6]" />
                </div>

                <div class="flex justify-center w-full mt-10 mb-6">
                <button @click="handleAdd" :disabled="loading"
                    class="mx-auto px-8 py-2 bg-[#3b82f6]! text-white rounded-xl font-bold hover:bg-[#2563eb] transition-all flex items-center justify-center gap-2 text-sm shadow-lg shadow-[#3b82f6]/20 active:scale-95 disabled:opacity-50">
                    <Send :size="18" v-if="!loading" />
                    {{ loading ? 'Saving...' : 'Activate Alerts' }}
                </button>
                </div>
            </div>
        </div>
    </div>
</template>