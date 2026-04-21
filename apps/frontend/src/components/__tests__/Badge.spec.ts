import { mount } from '@vue/test-utils';
import { describe, it, expect } from 'vitest';
import Badge from '../Badge.vue';

describe('Badge', () => {
  it('renders label', () => {
    const wrapper = mount(Badge, { props: { label: 'nsfw', value: false } });
    expect(wrapper.find('.flag-badge__label').text()).toBe('nsfw');
  });

  it('does not have active class when value is false', () => {
    const wrapper = mount(Badge, { props: { label: 'nsfw', value: false } });
    expect(wrapper.find('.flag-badge').classes()).not.toContain('flag-badge--active');
  });

  it('has active class when value is true', () => {
    const wrapper = mount(Badge, { props: { label: 'nsfw', value: true } });
    expect(wrapper.find('.flag-badge').classes()).toContain('flag-badge--active');
  });

  it('shows checkmark svg when value is true', () => {
    const wrapper = mount(Badge, { props: { label: 'nsfw', value: true } });
    expect(wrapper.find('.flag-badge__check').exists()).toBe(true);
  });

  it('hides checkmark svg when value is false', () => {
    const wrapper = mount(Badge, { props: { label: 'nsfw', value: false } });
    expect(wrapper.find('.flag-badge__check').exists()).toBe(false);
  });
});
