import { defineStore } from 'pinia';
import { ref } from 'vue';

import {
  createPaymentMethod,
  deletePaymentMethod,
  fetchPaymentMethods,
  togglePaymentMethodStatus,
  updatePaymentMethod,
} from '@/services/payment-methods.service';
import type {
  PaymentMethod,
  PaymentMethodFilters,
  PaymentMethodPayload,
  PaymentMethodStatus,
} from '@/types/payment-method';
import { notifyError, notifySuccess } from '@/utils/notify';

export const usePaymentMethodsStore = defineStore('payment-methods', () => {
  const items = ref<PaymentMethod[]>([]);
  const filters = ref<PaymentMethodFilters>({});
  const loading = ref(false);
  const saving = ref(false);
  const errorMessage = ref<string | null>(null);

  async function loadPaymentMethods(nextFilters?: PaymentMethodFilters): Promise<void> {
    if (nextFilters) {
      filters.value = { ...nextFilters };
    }

    loading.value = true;
    errorMessage.value = null;

    try {
      items.value = await fetchPaymentMethods(filters.value);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'No se pudieron cargar los métodos de pago.';
      errorMessage.value = message;
      notifyError(message);
    } finally {
      loading.value = false;
    }
  }

  async function create(payload: PaymentMethodPayload): Promise<boolean> {
    saving.value = true;

    try {
      await createPaymentMethod(payload);
      notifySuccess('Método de pago creado correctamente');
      await loadPaymentMethods();
      return true;
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'No se pudo crear el método de pago.';
      notifyError(message);
      return false;
    } finally {
      saving.value = false;
    }
  }

  async function update(id: string, payload: PaymentMethodPayload): Promise<boolean> {
    saving.value = true;

    try {
      await updatePaymentMethod(id, payload);
      notifySuccess('Método de pago actualizado correctamente');
      await loadPaymentMethods();
      return true;
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'No se pudo actualizar el método de pago.';
      notifyError(message);
      return false;
    } finally {
      saving.value = false;
    }
  }

  async function setStatus(id: string, status: PaymentMethodStatus): Promise<boolean> {
    const previous = items.value.map((item) => ({ ...item }));
    const target = items.value.find((item) => item.id === id);

    if (target) {
      target.status = status;
    }

    try {
      await togglePaymentMethodStatus(id, status);
      notifySuccess(status === 'active' ? 'Método de pago activado' : 'Método de pago desactivado');
      return true;
    } catch (error) {
      items.value = previous;
      const message =
        error instanceof Error ? error.message : 'No se pudo cambiar el estado del método de pago.';
      notifyError(message);
      return false;
    }
  }

  async function remove(id: string): Promise<boolean> {
    saving.value = true;

    try {
      await deletePaymentMethod(id);
      notifySuccess('Método de pago eliminado correctamente');
      await loadPaymentMethods();
      return true;
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'No se pudo eliminar el método de pago.';
      notifyError(message);
      return false;
    } finally {
      saving.value = false;
    }
  }

  function clearFilters(): void {
    filters.value = {};
  }

  return {
    items,
    filters,
    loading,
    saving,
    errorMessage,
    loadPaymentMethods,
    create,
    update,
    setStatus,
    remove,
    clearFilters,
  };
});
