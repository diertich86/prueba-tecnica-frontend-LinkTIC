<template>
  <q-page padding class="payment-methods-page">
    <div class="q-mb-md">
      <h1 class="text-h5 text-weight-medium q-ma-none">Métodos de pago</h1>
      <p class="text-body2 text-grey-8 q-mt-xs q-mb-none">
        Consulta, filtra y administra los métodos de pago registrados.
      </p>
    </div>

    <GenericFilterBar class="q-mb-md" :fields="filterFields" @change="onFilterChange">
      <template #actions>
        <q-btn unelevated color="primary" icon="add" label="Nuevo" @click="openCreate" />
      </template>
    </GenericFilterBar>

    <q-card flat bordered>
      <q-table
        flat
        row-key="id"
        :rows="paymentStore.items"
        :columns="columns"
        :loading="paymentStore.loading"
        :rows-per-page-options="[5, 10, 20]"
        :pagination="{ rowsPerPage: 10 }"
        no-data-label="No hay métodos de pago para mostrar"
        loading-label="Cargando métodos de pago..."
        binary-state-sort
      >
        <template #body-cell-type="props">
          <q-td :props="props">
            {{ formatPaymentMethodType(props.row.type) }}
          </q-td>
        </template>

        <template #body-cell-status="props">
          <q-td :props="props">
            <q-badge :color="props.row.status === 'active' ? 'positive' : 'grey'">
              {{ props.row.status === 'active' ? 'Activo' : 'Inactivo' }}
            </q-badge>
          </q-td>
        </template>

        <template #body-cell-createdAt="props">
          <q-td :props="props">
            {{ formatCreatedAt(props.row.createdAt) }}
          </q-td>
        </template>

        <template #body-cell-actions="props">
          <q-td :props="props" class="q-gutter-xs">
            <q-btn
              flat
              dense
              round
              icon="edit"
              color="primary"
              :aria-label="`Editar ${props.row.name}`"
              :disable="paymentStore.saving"
              @click="openEdit(props.row)"
            />
            <q-btn
              flat
              dense
              round
              icon="delete"
              color="negative"
              :aria-label="`Eliminar ${props.row.name}`"
              :disable="paymentStore.saving"
              @click="confirmDelete(props.row)"
            />
          </q-td>
        </template>

        <template #no-data>
          <div class="full-width column flex-center text-grey-7 q-pa-lg">
            <q-icon name="payments" size="42px" class="q-mb-sm" />
            <div class="text-subtitle1">
              {{
                paymentStore.errorMessage ? 'No se pudo cargar la información' : 'Sin resultados'
              }}
            </div>
            <div class="text-body2 q-mt-xs text-center">
              {{
                paymentStore.errorMessage ?? 'Ajusta los filtros o crea un nuevo método de pago.'
              }}
            </div>
            <q-btn
              v-if="paymentStore.errorMessage"
              class="q-mt-md"
              color="primary"
              outline
              label="Reintentar"
              icon="refresh"
              @click="paymentStore.loadPaymentMethods()"
            />
          </div>
        </template>
      </q-table>
    </q-card>

    <PaymentMethodFormDialog
      v-model="formDialogOpen"
      :method="selectedMethod"
      :saving="paymentStore.saving"
      @save="onSave"
    />
  </q-page>
</template>

<script setup lang="ts">
import type { QTableColumn } from 'quasar';
import { Dialog } from 'quasar';
import { onMounted, ref } from 'vue';

import GenericFilterBar from '@/components/filters/GenericFilterBar.vue';
import PaymentMethodFormDialog from '@/components/payments/PaymentMethodFormDialog.vue';
import {
  formatCreatedAt,
  formatPaymentMethodType,
  PAYMENT_METHOD_TYPE_OPTIONS,
} from '@/domain/payment-method';
import { usePaymentMethodsStore } from '@/stores/payment-methods.store';
import type { FilterFieldConfig, FilterValues } from '@/types/filters';
import type {
  PaymentMethod,
  PaymentMethodFilters,
  PaymentMethodPayload,
  PaymentMethodStatus,
  PaymentMethodType,
} from '@/types/payment-method';

const paymentStore = usePaymentMethodsStore();

const formDialogOpen = ref(false);
const selectedMethod = ref<PaymentMethod | null>(null);

const filterFields: FilterFieldConfig[] = [
  {
    key: 'name',
    label: 'Nombre',
    type: 'text',
    placeholder: 'Buscar por nombre',
    minChars: 3,
  },
  {
    key: 'type',
    label: 'Tipo',
    type: 'select',
    options: PAYMENT_METHOD_TYPE_OPTIONS,
  },
  {
    key: 'status',
    label: 'Estado',
    type: 'select',
    options: [
      { label: 'Activo', value: 'active' },
      { label: 'Inactivo', value: 'inactive' },
    ],
  },
];

const columns: QTableColumn<PaymentMethod>[] = [
  {
    name: 'name',
    label: 'Nombre',
    field: 'name',
    align: 'left',
    sortable: true,
  },
  {
    name: 'type',
    label: 'Tipo',
    field: 'type',
    align: 'left',
    sortable: true,
  },
  {
    name: 'status',
    label: 'Estado',
    field: 'status',
    align: 'left',
    sortable: true,
  },
  {
    name: 'createdAt',
    label: 'Fecha de creación',
    field: 'createdAt',
    align: 'left',
    sortable: true,
  },
  {
    name: 'actions',
    label: 'Acciones',
    field: 'id',
    align: 'right',
  },
];

function toStoreFilters(values: FilterValues): PaymentMethodFilters {
  const filters: PaymentMethodFilters = {};

  if (values.name) {
    filters.name = values.name;
  }
  if (values.type) {
    filters.type = values.type as PaymentMethodType;
  }
  if (values.status) {
    filters.status = values.status as PaymentMethodStatus;
  }

  return filters;
}

function onFilterChange(values: FilterValues) {
  void paymentStore.loadPaymentMethods(toStoreFilters(values));
}

function openCreate() {
  selectedMethod.value = null;
  formDialogOpen.value = true;
}

function openEdit(method: PaymentMethod) {
  selectedMethod.value = method;
  formDialogOpen.value = true;
}

async function onSave(payload: PaymentMethodPayload) {
  const ok = selectedMethod.value
    ? await paymentStore.update(selectedMethod.value.id, payload)
    : await paymentStore.create(payload);

  if (ok) {
    formDialogOpen.value = false;
    selectedMethod.value = null;
  }
}

function confirmDelete(method: PaymentMethod) {
  Dialog.create({
    title: 'Confirmar eliminación',
    message: `¿Seguro que deseas eliminar "${method.name}"? Esta acción no se puede deshacer.`,
    cancel: {
      flat: true,
      label: 'Cancelar',
      color: 'grey-8',
    },
    ok: {
      unelevated: true,
      label: 'Eliminar',
      color: 'negative',
    },
    persistent: true,
  }).onOk(() => {
    void paymentStore.remove(method.id);
  });
}

onMounted(() => {
  void paymentStore.loadPaymentMethods();
});
</script>
