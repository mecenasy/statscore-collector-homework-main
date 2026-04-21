<script setup lang="ts">
defineProps<{
  header?: boolean;
}>();
</script>

<template>
  <th v-if="header" class="table-cell table-cell--header">
    <slot />
  </th>
  <td v-else class="table-cell">
    <slot />
  </td>
</template>

<style scoped lang="scss">
.table-cell {
  padding: 10px 14px;
  text-align: left;
  vertical-align: top;
  border-bottom: 1px solid #e5e7eb;
  font-size: 13px;
  color: #374151;
  line-height: 1.5;

  &--header {
    background-color: #f9fafb;
    font-weight: 700;
    font-size: 12px;
    color: #6b7280;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    border-bottom: 2px solid #e5e7eb;
    position: sticky;
    top: 0;
    z-index: 1;
  }
}
</style>
