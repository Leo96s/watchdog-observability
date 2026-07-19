import { describe, test, expect, vi } from 'vitest';
import { mount } from '@vue/test-utils';

vi.mock('./services/api.service', () => ({
  default: {
    get: vi.fn().mockResolvedValue({ data: [] }),
    post: vi.fn(),
    delete: vi.fn(),
    patch: vi.fn(),
  },
}));

vi.mock('./composables/useSocket', () => ({
  useServiceSocket: vi.fn(),
}));

import App from './App.vue';

describe('App.vue fetchHistory', () => {
  test('regression: does not throw on an invalid service name and shows an error toast instead of a ReferenceError', async () => {
    const wrapper = mount(App);

    await expect(wrapper.vm.fetchHistory(undefined)).resolves.not.toThrow();
    await wrapper.vm.$nextTick();

    expect(document.body.textContent).toContain('Nome do serviço inválido');
  });
});
