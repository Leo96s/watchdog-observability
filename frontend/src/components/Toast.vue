<script setup>
import { onMounted } from 'vue';

const props = defineProps({
  message: String,
  type: {
    type: String,
    default: 'success' // success, error, info
  },
  duration: {
    type: Number,
    default: 3000
  }
});

const emit = defineEmits(['close']);

onMounted(() => {
  setTimeout(() => {
    emit('close');
  }, props.duration);
});
</script>

<template>
  <Teleport to="body">
    <Transition name="toast-fade">
      <div class="fixed top-6 left-1/2 -translate-x-1/2 z-[9999] min-w-[300px] max-w-md">
        <div 
          :class="[
            'px-6 py-3 rounded-2xl shadow-2xl border flex items-center justify-center text-sm font-bold tracking-wide transition-all uppercase',
            type === 'success' ? 'bg-white text-blue-500 border-blue-500' : 'bg-white text-red-500 border-red-500'
          ]"
        >
          {{ message }}
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.toast-fade-enter-active, .toast-fade-leave-active {
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}
.toast-fade-enter-from {
  opacity: 0;
  transform: translate(-50%, -20px) scale(0.9);
}
.toast-fade-leave-to {
  opacity: 0;
  transform: translate(-50%, -20px) scale(0.9);
}
</style>