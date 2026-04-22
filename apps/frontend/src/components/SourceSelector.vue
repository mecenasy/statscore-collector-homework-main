<script setup lang="ts">
defineProps<{
  sources: { id: string; name: string }[];
  modelValue: string[];
}>();

defineEmits<{
  'update:modelValue': [value: string[]];
}>();
</script>

<template>
  <div class="source-selector">
    <span class="source-selector__label">Sources</span>
    <label
      v-for="source in sources"
      :key="source.id"
      class="source-selector__item"
    >
      <input
        type="checkbox"
        :value="source.id"
        :checked="modelValue.includes(source.id)"
        @change="
          $emit(
            'update:modelValue',
            modelValue.includes(source.id)
              ? modelValue.filter((s) => s !== source.id)
              : [...modelValue, source.id],
          )
        "
      />
      {{ source.name }}
    </label>
  </div>
</template>

<style scoped lang="scss">
.source-selector {
  display: flex;
  align-items: center;
  gap: 8px;

  &__label {
    font-size: 13px;
    font-weight: 600;
    color: #374151;
  }

  &__item {
    display: flex;
    align-items: center;
    gap: 4px;
    font-size: 13px;
    color: #374151;
    cursor: pointer;

    input[type='checkbox'] {
      accent-color: #6366f1;
    }
  }
}
</style>
