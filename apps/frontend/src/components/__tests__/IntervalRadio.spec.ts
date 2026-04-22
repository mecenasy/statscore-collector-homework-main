import { mount } from '@vue/test-utils';
import { describe, it, expect } from 'vitest';
import IntervalRadio from '../IntervalRadio.vue';

describe('IntervalRadio', () => {
  it('renders an option for each interval', () => {
    const wrapper = mount(IntervalRadio, { props: { modelValue: 5 } });
    const labels = wrapper.findAll('.interval-radio__option');
    expect(labels.length).toBeGreaterThan(0);
  });

  it('marks the active option with active class', () => {
    const wrapper = mount(IntervalRadio, { props: { modelValue: 5 } });
    const active = wrapper.findAll('.interval-radio__option--active');
    expect(active).toHaveLength(1);
    expect(active[0].text()).toContain('5');
  });

  it('emits update:modelValue with selected value on change', async () => {
    const wrapper = mount(IntervalRadio, { props: { modelValue: 5 } });
    const inputs = wrapper.findAll('input[type="radio"]');
    await inputs[1].trigger('change');
    const emitted = wrapper.emitted('update:modelValue');
    expect(emitted).toBeTruthy();
    expect(emitted![0][0]).toBeTypeOf('number');
  });

  it('all inputs are disabled when disabled prop is set', () => {
    const wrapper = mount(IntervalRadio, { props: { modelValue: 5, disabled: true } });
    const inputs = wrapper.findAll('input[type="radio"]');
    inputs.forEach((input) => {
      expect((input.element as HTMLInputElement).disabled).toBe(true);
    });
  });

  it('inputs are enabled by default', () => {
    const wrapper = mount(IntervalRadio, { props: { modelValue: 5 } });
    const inputs = wrapper.findAll('input[type="radio"]');
    inputs.forEach((input) => {
      expect((input.element as HTMLInputElement).disabled).toBe(false);
    });
  });
});
