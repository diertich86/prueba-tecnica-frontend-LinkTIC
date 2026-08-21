<template>
  <q-dialog
    :model-value="modelValue"
    persistent
    @update:model-value="onDialogToggle"
    @escape-key="close"
  >
    <q-card style="min-width: min(100vw - 32px, 480px)">
      <q-card-section class="row items-center">
        <div class="text-h6">{{ isEdit ? 'Editar método de pago' : 'Nuevo método de pago' }}</div>
        <q-space />
        <q-btn icon="close" flat round dense aria-label="Cerrar" :disable="saving" @click="close" />
      </q-card-section>

      <q-card-section>
        <q-form greedy @submit.prevent="onSubmit">
          <div class="q-gutter-md">
            <q-input
              v-model="form.name"
              label="Nombre"
              outlined
              dense
              :disable="saving"
              :rules="[(val) => !!val?.trim() || 'El nombre es obligatorio']"
              lazy-rules
            />

            <q-select
              v-model="form.type"
              :options="PAYMENT_METHOD_TYPE_OPTIONS"
              label="Tipo"
              emit-value
              map-options
              outlined
              dense
              :disable="saving"
              :rules="[(val) => !!val || 'El tipo es obligatorio']"
              lazy-rules
            />

            <q-input
              v-model="form.description"
              label="Descripción"
              type="textarea"
              autogrow
              outlined
              dense
              :disable="saving"
            />

            <div v-if="isEdit" class="row items-center justify-between">
              <div>
                <div class="text-body2 text-weight-medium">Estado</div>
                <div class="text-caption text-grey-7">
                  {{ form.status === 'active' ? 'Activo' : 'Inactivo' }}
                </div>
              </div>
              <q-toggle
                v-model="statusActive"
                color="positive"
                label="Activo"
                left-label
                :disable="saving"
                :aria-label="`Cambiar estado de ${form.name || 'método de pago'}`"
              />
            </div>
          </div>

          <div class="row justify-end q-gutter-sm q-mt-lg">
            <q-btn flat label="Cancelar" color="grey-8" :disable="saving" @click="close" />
            <q-btn
              unelevated
              color="primary"
              :label="isEdit ? 'Guardar cambios' : 'Crear método'"
              type="submit"
              :loading="saving"
            />
          </div>
        </q-form>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { computed, reactive, watch } from 'vue';

import { PAYMENT_METHOD_TYPE_OPTIONS } from '@/domain/payment-method';
import type {
  PaymentMethod,
  PaymentMethodPayload,
  PaymentMethodStatus,
  PaymentMethodType,
} from '@/types/payment-method';

const props = defineProps<{
  modelValue: boolean;
  method: PaymentMethod | null;
  saving?: boolean;
}>();

const emit = defineEmits<{
  'update:modelValue': [value: boolean];
  save: [payload: PaymentMethodPayload];
}>();

const form = reactive<{
  name: string;
  type: PaymentMethodType | null;
  description: string;
  status: PaymentMethodStatus;
}>({
  name: '',
  type: null,
  description: '',
  status: 'active',
});

const isEdit = computed(() => Boolean(props.method));
const saving = computed(() => Boolean(props.saving));

const statusActive = computed({
  get: () => form.status === 'active',
  set: (value: boolean) => {
    form.status = value ? 'active' : 'inactive';
  },
});

function hydrateForm(method: PaymentMethod | null) {
  form.name = method?.name ?? '';
  form.type = method?.type ?? null;
  form.description = method?.description ?? '';
  form.status = method?.status ?? 'active';
}

function close() {
  if (saving.value) {
    return;
  }
  emit('update:modelValue', false);
}

function onDialogToggle(value: boolean) {
  if (!value) {
    close();
    return;
  }
  emit('update:modelValue', true);
}

function onSubmit() {
  if (!form.type || !form.name.trim()) {
    return;
  }

  const payload: PaymentMethodPayload = {
    name: form.name.trim(),
    type: form.type,
  };

  const description = form.description.trim();
  if (description) {
    payload.description = description;
  }

  if (isEdit.value) {
    payload.status = form.status;
  }

  emit('save', payload);
}

watch(
  () => [props.modelValue, props.method] as const,
  ([open]) => {
    if (open) {
      hydrateForm(props.method);
    }
  },
);
</script>
