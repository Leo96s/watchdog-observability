import { reactive, computed, watchEffect } from 'vue';

// Tema partilhado por toda a app. Persiste no localStorage e é aplicado
// como atributo data-theme na raiz do documento (ver style.css).
const state = reactive({
  theme: localStorage.getItem('watchdog_theme') || 'dark',
});

watchEffect(() => {
  document.documentElement.dataset.theme = state.theme;
});

export function useTheme() {
  const theme = computed(() => state.theme);
  const isDark = computed(() => state.theme === 'dark');
  const setTheme = (next) => {
    if (next !== 'dark' && next !== 'light') return;
    state.theme = next;
    localStorage.setItem('watchdog_theme', next);
  };
  const toggleTheme = () => setTheme(isDark.value ? 'light' : 'dark');
  return { theme, isDark, setTheme, toggleTheme };
}
