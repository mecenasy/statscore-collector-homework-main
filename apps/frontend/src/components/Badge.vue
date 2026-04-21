<script setup lang="ts">
defineProps<{
  label: string;
  value: boolean;
}>();
</script>

<template>
  <span class="flag-badge" :class="{ 'flag-badge--active': value }">
    <span class="flag-badge__checkbox">
      <svg
        v-if="value"
        class="flag-badge__check"
        viewBox="0 0 12 12"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M2 6l3 3 5-5"
          stroke="#22c55e"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </svg>
    </span>
    <span class="flag-badge__label">{{ label }}</span>
  </span>
</template>

<style scoped lang="scss">
.flag-badge {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 3px 8px 3px 4px;
  border-radius: 999px;
  border: 1px solid #d1d5db;
  background-color: #f3f4f6;
  font-size: 11px;
  color: #6b7280;
  white-space: nowrap;

  &--active {
    border-color: #bbf7d0;
    background-color: #f0fdf4;
    color: #15803d;
  }

  &__checkbox {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 14px;
    height: 14px;
    border-radius: 3px;
    border: 1.5px solid #d1d5db;
    background: #fff;
    flex-shrink: 0;

    .flag-badge--active & {
      border-color: #22c55e;
      background-color: #dcfce7;
    }
  }

  &__check {
    width: 12px;
    height: 12px;
  }

  &__label {
    font-weight: 500;
    text-transform: capitalize;
  }
}
</style>
