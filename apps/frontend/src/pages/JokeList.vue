<script setup lang="ts">
import { ref, computed } from 'vue';
import axios from 'axios';
import Button from '../components/Button.vue';
import Select from '../components/Select.vue';
import Badge from '../components/Badge.vue';
import Table, { type Column } from '../table/Table.vue';
import type { Joke } from '../table/types';

const COLUMNS: Column<Joke>[] = [
  { key: 'category', label: 'Category' },
  { key: 'setup',    label: 'Setup' },
  { key: 'delivery', label: 'Delivery' },
  { key: 'flags',    label: 'Flags' },
];

const EMPTY_TEXT = 'Click "Fetch a joke" to load data.';

const jokes = ref<Joke[]>([]);
const loading = ref(false);
const error = ref<string | null>(null);
const selectedCategory = ref('');

const availableCategories = computed(() => {
  const seen = new Set<string>();
  return jokes.value
    .map((j) => j.category)
    .filter((cat) => (seen.has(cat) ? false : seen.add(cat) && true));
});

const filteredJokes = computed(() =>
  selectedCategory.value
    ? jokes.value.filter((j) => j.category === selectedCategory.value)
    : jokes.value
);

async function fetchJoke() {
  loading.value = true;
  error.value = null;
  try {
    const { data } = await axios.get(
      'https://v2.jokeapi.dev/joke/Any?type=twopart'
    );
    jokes.value.push({
      id: data.id,
      category: data.category,
      setup: data.setup,
      delivery: data.delivery,
      flags: data.flags,
    });
  } catch {
    error.value = 'Failed to fetch a joke. Please try again.';
  } finally {
    loading.value = false;
  }
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
      <Button :loading="loading" @click="fetchJoke">
        Fetch a joke
      </Button>
    </div>

    <Table :columns="COLUMNS" :rows="filteredJokes" :empty-text="EMPTY_TEXT">
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
