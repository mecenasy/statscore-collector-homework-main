import { mount } from '@vue/test-utils';
import { describe, it, expect } from 'vitest';
import Button from '../Button.vue';

describe('Button', () => {
  it('renders slot content', () => {
    const wrapper = mount(Button, { slots: { default: 'Click me' } });
    expect(wrapper.text()).toContain('Click me');
  });

  it('is not disabled by default', () => {
    const wrapper = mount(Button);
    expect(wrapper.find('button').attributes('disabled')).toBeUndefined();
  });

  it('is disabled when loading', () => {
    const wrapper = mount(Button, { props: { loading: true } });
    expect(wrapper.find('button').element.disabled).toBe(true);
  });

  it('shows spinner when loading', () => {
    const wrapper = mount(Button, { props: { loading: true } });
    expect(wrapper.find('.button__spinner').exists()).toBe(true);
  });

  it('hides spinner when not loading', () => {
    const wrapper = mount(Button, { props: { loading: false } });
    expect(wrapper.find('.button__spinner').exists()).toBe(false);
  });

  it('emits click event on click', async () => {
    const wrapper = mount(Button);
    await wrapper.find('button').trigger('click');
    expect(wrapper.emitted('click')).toHaveLength(1);
  });

  it('does not emit click when disabled', async () => {
    const wrapper = mount(Button, { props: { loading: true } });
    await wrapper.find('button').trigger('click');
    expect(wrapper.emitted('click')).toBeUndefined();
  });
});
