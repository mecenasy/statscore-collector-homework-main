<script setup lang="ts">
defineProps<{
  modelValue: number;
  disabled?: boolean;
}>();

defineEmits<{
  'update:modelValue': [value: number];
}>();

const OPTIONS = [1, 5, 10] as const;
</script>

<template>
  <div class="interval-radio">
    <label
      v-for="sec in OPTIONS"
      :key="sec"
      class="interval-radio__option"
      :class="{ 'interval-radio__option--active': modelValue === sec }"
    >
      <input
        type="radio"
        class="interval-radio__input"
        :value="sec"
        :checked="modelValue === sec"
        :disabled="disabled"
        @change="$emit('update:modelValue', sec)"
      />
      {{ sec }}s
    </label>
  </div>
</template>

<style scoped lang="scss">
.interval-radio {
  display: flex;
  align-items: center;
  gap: 6px;

  &__option {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 6px 12px;
    border-radius: 6px;
    border: 1px solid #d1d5db;
    background: #fff;
    font-size: 13px;
    font-weight: 500;
    color: #374151;
    cursor: pointer;
    transition: border-color 0.15s, background-color 0.15s;

    &--active {
      border-color: #4f6ef7;
      background-color: #eef2ff;
      color: #4f6ef7;
    }

    &:has(input:disabled) {
      opacity: 0.5;
      cursor: not-allowed;
    }
  }

  &__input {
    display: none;
  }
}
</style>
