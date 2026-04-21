import { mount } from '@vue/test-utils';
import { describe, it, expect } from 'vitest';
import TableCell from '../TableCell.vue';

describe('TableCell', () => {
  it('renders as td by default', () => {
    const wrapper = mount(TableCell, { slots: { default: 'content' } });
    expect(wrapper.find('td').exists()).toBe(true);
    expect(wrapper.find('th').exists()).toBe(false);
  });

  it('renders as th when header prop is set', () => {
    const wrapper = mount(TableCell, {
      props: { header: true },
      slots: { default: 'Header' },
    });
    expect(wrapper.find('th').exists()).toBe(true);
    expect(wrapper.find('td').exists()).toBe(false);
  });

  it('applies header class when header prop is set', () => {
    const wrapper = mount(TableCell, { props: { header: true } });
    expect(wrapper.find('th').classes()).toContain('table-cell--header');
  });

  it('renders slot content', () => {
    const wrapper = mount(TableCell, { slots: { default: 'Hello' } });
    expect(wrapper.text()).toBe('Hello');
  });
});
