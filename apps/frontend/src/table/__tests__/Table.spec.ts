import { mount } from '@vue/test-utils';
import { describe, it, expect } from 'vitest';
import Table from '../Table.vue';

const columns = [
  { key: 'name', label: 'Name' },
  { key: 'age',  label: 'Age' },
];

const rows = [
  { name: 'Alice', age: 30 },
  { name: 'Bob',   age: 25 },
];

describe('Table', () => {
  it('renders column headers', () => {
    const wrapper = mount(Table, { props: { columns, rows } });
    const headers = wrapper.findAll('th').map((th) => th.text());
    expect(headers).toEqual(['Name', 'Age']);
  });

  it('renders correct number of header cells', () => {
    const wrapper = mount(Table, { props: { columns, rows } });
    expect(wrapper.findAll('th')).toHaveLength(columns.length);
  });

  it('renders a row for each item', () => {
    const wrapper = mount(Table, { props: { columns, rows } });
    expect(wrapper.findAll('tbody tr')).toHaveLength(rows.length);
  });

  it('renders correct number of cells per row', () => {
    const wrapper = mount(Table, { props: { columns, rows } });
    const firstRow = wrapper.findAll('tbody tr')[0];
    expect(firstRow.findAll('td')).toHaveLength(columns.length);
  });

  it('shows empty row when rows is empty', () => {
    const wrapper = mount(Table, {
      props: { columns, rows: [], emptyText: 'No data', empty: true },
    });
    expect(wrapper.find('tbody td').text()).toBe('No data');
  });

  it('sets colspan on empty cell equal to column count', () => {
    const wrapper = mount(Table, {
      props: { columns, rows: [], emptyText: 'No data', empty: true },
    });
    expect(wrapper.find('tbody td').attributes('colspan')).toBe(String(columns.length));
  });

  it('does not show empty row when rows exist', () => {
    const wrapper = mount(Table, {
      props: { columns, rows, emptyText: 'No data', empty: false },
    });
    expect(wrapper.text()).not.toContain('No data');
  });

  it('renders slot content for each column cell', () => {
    const wrapper = mount(Table, {
      props: { columns, rows },
      slots: {
        name: ({ row }: { row: typeof rows[0] }) => row.name,
        age:  ({ row }: { row: typeof rows[0] }) => String(row.age),
      },
    });
    expect(wrapper.text()).toContain('Alice');
    expect(wrapper.text()).toContain('30');
  });
});
