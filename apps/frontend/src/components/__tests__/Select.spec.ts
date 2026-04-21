import { mount } from '@vue/test-utils';
import { describe, it, expect } from 'vitest';
import Select from '../Select.vue';

const defaultProps = {
  label: 'Category',
  options: ['Misc', 'Programming', 'Dark'],
  modelValue: '',
};

describe('Select', () => {
  it('renders label', () => {
    const wrapper = mount(Select, { props: defaultProps });
    expect(wrapper.find('.select__label').text()).toBe('Category');
  });

  it('renders all options', () => {
    const wrapper = mount(Select, { props: defaultProps });
    const options = wrapper.findAll('option').map((o) => o.text());
    expect(options).toEqual(expect.arrayContaining(['Misc', 'Programming', 'Dark']));
  });

  it('shows "All" option when allOption is true', () => {
    const wrapper = mount(Select, { props: { ...defaultProps, allOption: true } });
    const first = wrapper.find('option');
    expect(first.text()).toBe('All');
    expect(first.attributes('value')).toBe('');
  });

  it('hides "All" option when allOption is not set', () => {
    const wrapper = mount(Select, { props: defaultProps });
    const texts = wrapper.findAll('option').map((o) => o.text());
    expect(texts).not.toContain('All');
  });

  it('emits update:modelValue on change', async () => {
    const wrapper = mount(Select, { props: { ...defaultProps, allOption: true } });
    await wrapper.find('select').setValue('Misc');
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual(['Misc']);
  });

  it('reflects modelValue as selected', () => {
    const wrapper = mount(Select, { props: { ...defaultProps, modelValue: 'Dark' } });
    const select = wrapper.find('select').element as HTMLSelectElement;
    expect(select.value).toBe('Dark');
  });
});
