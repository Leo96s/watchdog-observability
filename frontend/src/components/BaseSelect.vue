<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from "vue";

const props = defineProps({
  modelValue: [String, Number],
  options: {
    type: Array,
    required: true
  },
  placeholder: {
    type: String,
    default: "Select option"
  }
});

const emit = defineEmits(["update:modelValue"]);

const isOpen = ref(false);

const selectedLabel = computed(() => {
  return props.options.find(o => o.value === props.modelValue)?.label;
});

const toggle = () => (isOpen.value = !isOpen.value);

const selectOption = (value) => {
  emit("update:modelValue", value);
  isOpen.value = false;
};

/* fechar ao clicar fora */
const handleClickOutside = (e) => {
  if (!e.target.closest(".base-select")) {
    isOpen.value = false;
  }
};

onMounted(() => {
  document.addEventListener("click", handleClickOutside);
});

onBeforeUnmount(() => {
  document.removeEventListener("click", handleClickOutside);
});
</script>

<template>
  <div class="base-select relative w-full">
    <!-- Trigger -->
    <div
      @click="toggle"
      class="w-full bg-[#1a1a1a] text-white rounded-2xl p-4 py-2 cursor-pointer flex justify-between items-center transition hover:bg-[#323232]"
    >
      <span>
        {{ selectedLabel || placeholder }}
      </span>

      <svg
        class="w-4 h-4 transition-transform duration-200"
        :class="{ 'rotate-180': isOpen }"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        viewBox="0 0 24 24"
      >
        <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" />
      </svg>
    </div>

    <!-- Dropdown -->
    <div
      v-if="isOpen"
      class="absolute left-0 mt-2 w-full bg-[#1f1f1f] rounded-2xl shadow-lg border border-white/10 overflow-hidden z-50"
    >
      <div
        v-for="option in options"
        :key="option.value"
        @click="selectOption(option.value)"
        class="px-4 py-3 cursor-pointer transition hover:bg-[#2e2e2e]"
        :class="{
          'bg-[#3b82f6]/20 text-[#3b82f6]': modelValue === option.value,
          'text-white': modelValue !== option.value
        }"
      >
        {{ option.label }}
      </div>
    </div>
  </div>
</template>