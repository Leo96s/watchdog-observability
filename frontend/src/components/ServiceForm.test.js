import { describe, test, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import ServiceForm from './ServiceForm.vue';

describe('ServiceForm', () => {
  test('emits add with the expected payload and advanced defaults', async () => {
    const wrapper = mount(ServiceForm, { props: { isSubmitting: false } });

    await wrapper.find('input[placeholder="Service Name"]').setValue('My API');
    await wrapper.find('input[placeholder="URL (http://...)"]').setValue('https://api.example.com');

    await wrapper.findAll('button')[0].trigger('click');

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
    const wrapper = mount(ServiceForm, { props: { isSubmitting: false } });

    await wrapper.find('input[placeholder="Service Name"]').setValue('My API');
    await wrapper.find('input[placeholder="URL (http://...)"]').setValue('https://api.example.com');

    // Add two notification rows, only fill the second one.
    const addAlertButton = wrapper.findAll('button')[1];
    await addAlertButton.trigger('click');
    await addAlertButton.trigger('click');

    const valueInputs = wrapper.findAll('input[placeholder="URL of Webhook"]');
    await valueInputs[1].setValue('https://discord.example/hook');

    await wrapper.findAll('button')[0].trigger('click');

    const emitted = wrapper.emitted('add');
    expect(emitted[0][0].notifications).toEqual([
      { type: 'webhook', value: 'https://discord.example/hook' },
    ]);
  });

  test('does not emit and shows an error when advanced headers is invalid JSON', async () => {
    const wrapper = mount(ServiceForm, { props: { isSubmitting: false } });

    await wrapper.find('input[placeholder="Service Name"]').setValue('My API');
    await wrapper.find('input[placeholder="URL (http://...)"]').setValue('https://api.example.com');

    await wrapper.findAll('button')[2].trigger('click'); // toggle advanced options
    await wrapper.find('textarea').setValue('{not valid json');

    await wrapper.findAll('button')[0].trigger('click');

    expect(wrapper.emitted('add')).toBeUndefined();
    expect(wrapper.text()).toContain('Headers must be valid JSON');
  });
});
