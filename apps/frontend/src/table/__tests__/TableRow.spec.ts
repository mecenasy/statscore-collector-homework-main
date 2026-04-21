import { mount } from '@vue/test-utils';
import { describe, it, expect } from 'vitest';
import TableRow from '../TableRow.vue';

describe('TableRow', () => {
  it('renders as tr', () => {
    const wrapper = mount(TableRow);
    expect(wrapper.find('tr').exists()).toBe(true);
  });

  it('renders slot content', () => {
    const wrapper = mount(TableRow, {
      slots: { default: '<td>cell</td>' },
    });
    expect(wrapper.find('td').text()).toBe('cell');
  });
});
