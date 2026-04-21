<script setup lang="ts" generic="T">
import TableCell from './TableCell.vue';
import TableRow from './TableRow.vue';

export interface Column<TRow> {
  key: string;
  label: string;
  render?: (row: TRow) => unknown;
}

const props = defineProps<{
  columns: Column<T>[];
  rows: T[];
  emptyText?: string;
}>();

defineSlots<{
  [key: string]: (props: { row: T }) => unknown;
}>();
</script>

<template>
  <div class="table-wrapper">
    <table class="table">
      <thead>
        <tr>
          <TableCell header v-for="col in columns" :key="col.key">
            {{ col.label }}
          </TableCell>
        </tr>
      </thead>
      <tbody>
        <TableRow v-for="(row, i) in rows" :key="i">
          <TableCell v-for="col in columns" :key="col.key">
            <slot :name="col.key" :row="row" />
          </TableCell>
        </TableRow>
        <tr v-if="rows.length === 0">
          <td :colspan="props.columns.length" class="table__empty">
            {{ emptyText }}
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<style scoped lang="scss">
.table-wrapper {
  max-height: 600px;
  overflow-y: auto;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);
}

.table {
  width: 100%;
  border-collapse: collapse;
  table-layout: fixed;

  &__empty {
    padding: 32px;
    text-align: center;
    color: #9ca3af;
    font-size: 14px;
  }
}
</style>
