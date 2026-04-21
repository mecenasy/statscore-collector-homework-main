<script setup lang="ts">
defineProps<{
  label: string;
  options: string[];
  modelValue: string;
  allOption?: boolean;
}>();

defineEmits<{
  'update:modelValue': [value: string];
}>();
</script>

<template>
  <div class="select">
    <label class="select__label" for="select-input">
      {{ label }}
    </label>
    <select
      id="select-input"
      class="select__input"
      :value="modelValue"
      @change="$emit('update:modelValue', ($event.target as HTMLSelectElement).value)"
    >
      <option v-if="allOption" value="">All</option>
      <option v-for="option in options" :key="option" :value="option">
        {{ option }}
      </option>
    </select>
  </div>
</template>

<style scoped lang="scss">
.select {
  display: flex;
  align-items: center;
  gap: 8px;

  &__label {
    font-size: 13px;
    font-weight: 600;
    color: #6b7280;
    white-space: nowrap;
  }

  &__input {
    padding: 7px 28px 7px 10px;
    border: 1px solid #d1d5db;
    border-radius: 6px;
    background-color: #fff;
    font-size: 13px;
    color: #374151;
    appearance: none;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%236b7280' d='M6 8L1 3h10z'/%3E%3C/svg%3E");
    background-repeat: no-repeat;
    background-position: right 9px center;
    cursor: pointer;
    transition: border-color 0.15s;

    &:focus {
      outline: none;
      border-color: #4f6ef7;
      box-shadow: 0 0 0 3px rgba(79, 110, 247, 0.15);
    }
  }
}
</style>
