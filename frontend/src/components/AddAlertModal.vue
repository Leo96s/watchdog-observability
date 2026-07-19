<script setup>
import { ref, watch } from 'vue';
import { X, Bell, Send, Trash2 } from 'lucide-vue-next';
import api from '../services/api.service';
import BaseSelect from './BaseSelect.vue'

const props = defineProps(['service', 'isOpen']);
const emit = defineEmits(['close']);

const type = ref('webhook');
const value = ref('');
const loading = ref(false);
const destinations = ref([]);
const loadingDestinations = ref(false);

const fetchDestinations = async () => {
    if (!props.service?.id) return;
    loadingDestinations.value = true;
    try {
        const res = await api.get(`/services/${props.service.id}`);
        destinations.value = res.data.destinations || [];
    } catch (err) {
        console.error("Erro ao carregar destinos de notificação");
    } finally {
        loadingDestinations.value = false;
    }
};

watch(() => props.isOpen, (open) => {
    if (open) fetchDestinations();
});

const handleAdd = async () => {
    if (!value.value) return;
    loading.value = true;

    try {
        await api.post(`/services/${props.service.id}/notifications`, {
            type: type.value,
            value: value.value
        });

        value.value = '';
        await fetchDestinations();
    } catch (err) {
        console.error("Erro ao adicionar alerta");
    } finally {
        loading.value = false;
    }
};

const removeDestination = async (notifId) => {
    try {
        await api.delete(`/services/${props.service.id}/notifications/${notifId}`);
        destinations.value = destinations.value.filter(d => d.id !== notifId);
    } catch (err) {
        console.error("Erro ao remover alerta");
    }
};
</script>

<template>
    <div v-if="isOpen" @click.stop class="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/60 backdrop-blur-md">
        <div
            class="bg-[#1a1a1a] w-full max-w-md rounded-[3rem] border border-white/10 p-12 shadow-[0_32px_64px_-12px_rgba(0,0,0,0.6)] animate-in fade-in zoom-in duration-300">

            <div class="flex justify-between items-center mb-8 ml-4 mt-5">
                <h2 class="text-white font-bold text-lg flex items-center gap-2">
                    <Bell class="text-[#3b82f6]" :size="20" /> Alerts
                </h2>
                <button @click.stop="$emit('close')" class="text-gray-500 hover:text-white mr-4">
                    <X :size="20" />
                </button>
            </div>

            <div class="space-y-4 ml-4 mr-4">
                <div v-if="destinations.length > 0" class="space-y-2 mb-6">
                    <div v-for="dest in destinations" :key="dest.id"
                        class="flex items-center justify-between bg-[#2a2a2a] rounded-2xl px-4 py-3">
                        <span class="text-white text-xs truncate mr-2">
                            <span class="text-gray-500 uppercase font-bold mr-1">{{ dest.type }}</span>
                            {{ dest.value }}
                        </span>
                        <button @click="removeDestination(dest.id)" class="text-gray-500 hover:text-red-500 shrink-0">
                            <Trash2 :size="16" />
                        </button>
                    </div>
                </div>

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
