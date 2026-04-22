<script setup lang="ts">
import { ref, computed } from 'vue';
import Button from '../components/Button.vue';
import Select from '../components/Select.vue';
import Badge from '../components/Badge.vue';
import IntervalRadio from '../components/IntervalRadio.vue';
import Table, { type Column } from '../table/Table.vue';
import { useJokeSocket } from '../composables/useJokeSocket';
import type { Joke } from '../table/types';

const COLUMNS: Column<Joke>[] = [
  { key: 'category', label: 'Category' },
  { key: 'setup',    label: 'Setup' },
  { key: 'delivery', label: 'Delivery' },
  { key: 'flags',    label: 'Flags' },
];
const EMPTY_TEXT = 'Click "Start" to load jokes.';

const { jokes, running, error, start, stop, changeInterval } = useJokeSocket();

const selectedCategory = ref('');
const intervalSec = ref(5);

const availableCategories = computed(() => {
  const seen = new Set<string>();
  return jokes.value
    .map((j) => j.category)
    .filter((cat) => (seen.has(cat) ? false : seen.add(cat) && true));
});

const filteredJokes = computed(() =>
  selectedCategory.value
    ? jokes.value.filter((j) => j.category === selectedCategory.value)
    : jokes.value,
);

function toggle() {
  running.value ? stop() : start(intervalSec.value);
}

function onIntervalChange(sec: number) {
  intervalSec.value = sec;
  if (running.value) changeInterval(sec);
}
</script>

<template>
  <div class="joke-list">
    <h1 class="joke-list__title">Jokes</h1>

    <div class="joke-list__toolbar">
      <Select
        label="Category"
        v-model="selectedCategory"
        :options="availableCategories"
        allOption
      />
      <span class="joke-list__spacer" />
      <span v-if="error" class="joke-list__error">{{ error }}</span>
      <IntervalRadio
        :model-value="intervalSec"
        @update:model-value="onIntervalChange"
      />
      <Button @click="toggle">
        {{ running ? 'Stop' : 'Start' }}
      </Button>
    </div>

    <Table :columns="COLUMNS" :rows="filteredJokes" :empty-text="EMPTY_TEXT" :empty="filteredJokes.length === 0">
      <template #category="{ row }">{{ row.category }}</template>
      <template #setup="{ row }">{{ row.setup }}</template>
      <template #delivery="{ row }">{{ row.delivery }}</template>
      <template #flags="{ row }">
        <div class="joke-list__flags">
          <Badge
            v-for="(value, key) in row.flags"
            :key="key"
            :label="key"
            :value="value"
          />
        </div>
      </template>
    </Table>
  </div>
</template>

<style scoped lang="scss">
.joke-list {
  max-width: 1100px;
  margin: 0 auto;
  padding: 32px 24px;
  font-family: system-ui, sans-serif;

  &__title {
    font-size: 24px;
    font-weight: 700;
    color: #111827;
    margin: 0 0 20px;
  }

  &__toolbar {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 12px;
  }

  &__spacer {
    flex: 1;
  }

  &__error {
    font-size: 13px;
    color: #dc2626;
  }

  &__flags {
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
  }
}
</style>
