<template>
  <q-card flat bordered class="generic-filter-bar q-pa-md">
    <div class="row q-col-gutter-md items-end">
      <div
        v-for="field in fields"
        :key="field.key"
        class="col-12"
        :class="fieldColClass"
      >
        <q-input
          v-if="field.type === 'text' || field.type === 'date'"
          v-model="values[field.key]"
          :type="field.type === 'date' ? 'date' : 'text'"
          :label="field.label"
          :placeholder="field.placeholder"
          :clearable="field.clearable !== false"
          :hint="textHint(field)"
          outlined
          dense
          @update:model-value="() => onFieldChanged(field)"
          @clear="() => onFieldChanged(field)"
        />

        <q-select
          v-else-if="field.type === 'select'"
          v-model="values[field.key]"
          :options="field.options ?? []"
          :label="field.label"
          :clearable="field.clearable !== false"
          emit-value
          map-options
          outlined
          dense
          @update:model-value="() => onFieldChanged(field)"
          @clear="() => onFieldChanged(field)"
        />
      </div>

      <div v-if="$slots.actions" class="col-12" :class="actionsColClass">
        <div class="filter-actions">
          <slot name="actions" />
        </div>
      </div>
    </div>
  </q-card>
</template>
<script setup lang="ts">
import { onScopeDispose, reactive, watch } from 'vue';

import type { FilterFieldConfig, FilterValues } from '@/types/filters';

const props = withDefaults(
  defineProps<{
    fields: FilterFieldConfig[];
    fieldColClass?: string;
    actionsColClass?: string;
    debounceMs?: number;
  }>(),
  {
    fieldColClass: 'col-md-3',
    actionsColClass: 'col-md-3',
    debounceMs: 300,
  },
);

defineSlots<{
  actions?: () => unknown;
}>();

const emit = defineEmits<{
  change: [values: FilterValues];
}>();

const values = reactive<FilterValues>({});
const debounceTimers = new Map<string, ReturnType<typeof setTimeout>>();

function hasValue(value: unknown): boolean {
  if (value === null || value === undefined) {
    return false;
  }
  if (typeof value === 'string') {
    return value.trim().length > 0;
  }
  return true;
}

function textHint(field: FilterFieldConfig): string | undefined {
  if (field.type !== 'text' || !field.minChars) {
    return undefined;
  }
  const current = values[field.key]?.trim() ?? '';
  if (current.length === 0 || current.length >= field.minChars) {
    return undefined;
  }
  return `Escribe al menos ${field.minChars} caracteres para filtrar`;
}

function resetValues() {
  for (const key of Object.keys(values)) {
    delete values[key];
  }

  for (const field of props.fields) {
    values[field.key] = '';
  }
}

function buildOutput(): FilterValues {
  const output: FilterValues = {};

  for (const field of props.fields) {
    const raw = values[field.key];
    if (!hasValue(raw)) {
      continue;
    }

    const normalized = typeof raw === 'string' ? raw.trim() : String(raw);

    if (field.type === 'text' && field.minChars && normalized.length < field.minChars) {
      continue;
    }

    output[field.key] = normalized;
  }

  return output;
}

function clearTimer(key: string) {
  const timer = debounceTimers.get(key);
  if (timer) {
    clearTimeout(timer);
    debounceTimers.delete(key);
  }
}

function emitChange() {
  emit('change', buildOutput());
}

function onFieldChanged(field: FilterFieldConfig) {
  if (field.type === 'text') {
    clearTimer(field.key);
    const timer = setTimeout(() => {
      debounceTimers.delete(field.key);
      emitChange();
    }, props.debounceMs);
    debounceTimers.set(field.key, timer);
    return;
  }

  clearTimer(field.key);
  emitChange();
}

watch(
  () => props.fields,
  () => {
    for (const key of [...debounceTimers.keys()]) {
      clearTimer(key);
    }
    resetValues();
  },
  { immediate: true, deep: true },
);

onScopeDispose(() => {
  for (const key of [...debounceTimers.keys()]) {
    clearTimer(key);
  }
});
</script>

<style scoped>
.filter-actions {
  display: flex;
  justify-content: flex-end;
  width: 100%;
}
</style>
