<script setup lang="ts">
</script>

<template>
  <tr class="table-row">
    <slot />
  </tr>
</template>

<style scoped lang="scss">
.table-row {
  transition: background-color 0.15s;

  &:hover {
    background-color: #f9fafb;
  }
}
</style>
