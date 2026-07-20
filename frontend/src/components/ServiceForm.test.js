import { describe, test, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import ServiceForm from './ServiceForm.vue';

// O ServiceForm passou a ser um modal (isOpen/close); o botão de fecho (X) é
// o primeiro botão do template, seguido de "+ alertas", (linhas de alerta
// removíveis), "opções avançadas" e por fim o botão de submissão.
const mountOpen = () => mount(ServiceForm, { props: { isSubmitting: false, isOpen: true } });
const submitButton = (wrapper) => wrapper.findAll('button').at(-1);

describe('ServiceForm', () => {
  test('emits add with the expected payload and advanced defaults', async () => {
    const wrapper = mountOpen();

    await wrapper.find('input[placeholder="Ex.: API Gateway"]').setValue('My API');
    await wrapper.find('input[placeholder="https://…"]').setValue('https://api.example.com');

    await submitButton(wrapper).trigger('click');

    const emitted = wrapper.emitted('add');
    expect(emitted).toHaveLength(1);
    expect(emitted[0][0]).toMatchObject({
      name: 'My API',
      url: 'https://api.example.com',
      notifications: [],
      method: 'GET',
      expectedStatus: 200,
    });
  });

  test('filters out notification entries left empty', async () => {
    const wrapper = mountOpen();

    await wrapper.find('input[placeholder="Ex.: API Gateway"]').setValue('My API');
    await wrapper.find('input[placeholder="https://…"]').setValue('https://api.example.com');

    // Add two notification rows, only fill the second one.
    const addAlertButton = wrapper.findAll('button')[1];
    await addAlertButton.trigger('click');
    await addAlertButton.trigger('click');

    const valueInputs = wrapper.findAll('input[placeholder="URL do Webhook"]');
    await valueInputs[1].setValue('https://discord.example/hook');

    await submitButton(wrapper).trigger('click');

    const emitted = wrapper.emitted('add');
    expect(emitted[0][0].notifications).toEqual([
      { type: 'webhook', value: 'https://discord.example/hook' },
    ]);
  });

  test('does not emit and shows an error when advanced headers is invalid JSON', async () => {
    const wrapper = mountOpen();

    await wrapper.find('input[placeholder="Ex.: API Gateway"]').setValue('My API');
    await wrapper.find('input[placeholder="https://…"]').setValue('https://api.example.com');

    await wrapper.findAll('button')[2].trigger('click'); // toggle advanced options
    await wrapper.find('textarea').setValue('{not valid json');

    await submitButton(wrapper).trigger('click');

    expect(wrapper.emitted('add')).toBeUndefined();
    expect(wrapper.text()).toContain('Headers must be valid JSON');
  });
});
