import { describe, test, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';

vi.mock('../services/api.service', () => ({
  default: {
    get: vi.fn().mockResolvedValue({ data: { destinations: [] } }),
    post: vi.fn(),
    delete: vi.fn(),
  },
}));

import api from '../services/api.service';
import AddAlertModal from './AddAlertModal.vue';

const service = { id: 1, url: 'https://api.example.com' };

const mountOpen = () => mount(AddAlertModal, {
  props: { service, isOpen: true },
  global: { stubs: { teleport: true } },
});

describe('AddAlertModal', () => {
  beforeEach(() => {
    api.post.mockReset();
    api.delete.mockReset();
  });

  test('regression: emits a success feedback event when a webhook is accepted', async () => {
    api.post.mockResolvedValue({ data: { id: 10, type: 'webhook', value: 'https://discord.example/hook' } });
    const wrapper = mountOpen();

    await wrapper.find('input').setValue('https://discord.example/hook');
    await wrapper.find('button.mt-0\\.5').trigger('click');
    await wrapper.vm.$nextTick();
    await new Promise((r) => setTimeout(r));

    const emitted = wrapper.emitted('feedback');
    expect(emitted).toBeTruthy();
    expect(emitted[0][0]).toMatchObject({ type: 'success' });
  });

  test('regression: emits an error feedback event with the backend reason when a webhook is rejected', async () => {
    api.post.mockRejectedValue({ response: { data: { error: 'Webhook URL rejected: private IP' } } });
    const wrapper = mountOpen();

    await wrapper.find('input').setValue('http://127.0.0.1/hook');
    await wrapper.find('button.mt-0\\.5').trigger('click');
    await wrapper.vm.$nextTick();
    await new Promise((r) => setTimeout(r));

    const emitted = wrapper.emitted('feedback');
    expect(emitted).toBeTruthy();
    expect(emitted[0][0]).toMatchObject({ type: 'error', message: 'Webhook URL rejected: private IP' });
  });
});
