import { isDuplicateName, normalizePaymentPayload } from '@/domain/payment-method';
import type {
  PaymentMethod,
  PaymentMethodFilters,
  PaymentMethodPayload,
  PaymentMethodStatus,
} from '@/types/payment-method';
import { delay } from '@/utils/delay';

export class PaymentMethodServiceError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'PaymentMethodServiceError';
  }
}

/**
 * Fuente única de datos mock para métodos de pago.
 * Simula latencia de red y reglas básicas de negocio.
 */
let paymentMethodsDb: PaymentMethod[] = [
  {
    id: 'pm-1',
    name: 'Visa Corporativa',
    type: 'credit_card',
    status: 'active',
    description: 'Tarjeta principal para gastos operativos',
    createdAt: '2025-11-12T10:00:00.000Z',
  },
  {
    id: 'pm-2',
    name: 'Transferencia Bancolombia',
    type: 'bank_transfer',
    status: 'active',
    description: 'Cuenta corriente empresarial',
    createdAt: '2025-12-03T15:30:00.000Z',
  },
  {
    id: 'pm-3',
    name: 'Nequi',
    type: 'digital_wallet',
    status: 'inactive',
    description: 'Billetera digital para pagos rápidos',
    createdAt: '2026-01-20T09:15:00.000Z',
  },
  {
    id: 'pm-4',
    name: 'Efectivo caja',
    type: 'cash',
    status: 'active',
    createdAt: '2026-02-08T18:45:00.000Z',
  },
  {
    id: 'pm-5',
    name: 'Mastercard Débito',
    type: 'debit_card',
    status: 'inactive',
    description: 'Uso limitado a compras locales',
    createdAt: '2026-03-01T12:00:00.000Z',
  },
];

function cloneMethods(methods: PaymentMethod[]): PaymentMethod[] {
  return methods.map((method) => ({ ...method }));
}

function matchesFilters(method: PaymentMethod, filters: PaymentMethodFilters): boolean {
  if (filters.name) {
    const needle = filters.name.trim().toLowerCase();
    if (!method.name.toLowerCase().includes(needle)) {
      return false;
    }
  }

  if (filters.type && method.type !== filters.type) {
    return false;
  }

  if (filters.status && method.status !== filters.status) {
    return false;
  }

  return true;
}

export async function fetchPaymentMethods(
  filters: PaymentMethodFilters = {},
): Promise<PaymentMethod[]> {
  await delay(500);

  const filtered = paymentMethodsDb
    .filter((method) => matchesFilters(method, filters))
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  return cloneMethods(filtered);
}

export async function createPaymentMethod(payload: PaymentMethodPayload): Promise<PaymentMethod> {
  await delay(550);

  const normalized = normalizePaymentPayload(payload);

  if (!normalized.name) {
    throw new PaymentMethodServiceError('El nombre es obligatorio.');
  }

  if (isDuplicateName(paymentMethodsDb, normalized.name)) {
    throw new PaymentMethodServiceError(
      'Ya existe un método de pago con ese nombre. Usa un nombre distinto.',
    );
  }

  const created: PaymentMethod = {
    id: `pm-${crypto.randomUUID()}`,
    name: normalized.name,
    type: normalized.type,
    status: normalized.status ?? 'active',
    createdAt: new Date().toISOString(),
  };

  if (normalized.description) {
    created.description = normalized.description;
  }

  paymentMethodsDb = [created, ...paymentMethodsDb];
  return { ...created };
}

export async function updatePaymentMethod(
  id: string,
  payload: PaymentMethodPayload,
): Promise<PaymentMethod> {
  await delay(550);

  const index = paymentMethodsDb.findIndex((method) => method.id === id);
  if (index === -1) {
    throw new PaymentMethodServiceError('El método de pago no existe o ya fue eliminado.');
  }

  const current = paymentMethodsDb[index];
  if (!current) {
    throw new PaymentMethodServiceError('El método de pago no existe o ya fue eliminado.');
  }

  const normalized = normalizePaymentPayload(payload);

  if (!normalized.name) {
    throw new PaymentMethodServiceError('El nombre es obligatorio.');
  }

  if (isDuplicateName(paymentMethodsDb, normalized.name, id)) {
    throw new PaymentMethodServiceError(
      'Ya existe un método de pago con ese nombre. Usa un nombre distinto.',
    );
  }

  const updated: PaymentMethod = {
    id: current.id,
    name: normalized.name,
    type: normalized.type,
    status: normalized.status ?? current.status,
    createdAt: current.createdAt,
  };

  if (normalized.description) {
    updated.description = normalized.description;
  }

  paymentMethodsDb = [
    ...paymentMethodsDb.slice(0, index),
    updated,
    ...paymentMethodsDb.slice(index + 1),
  ];

  return { ...updated };
}

export async function togglePaymentMethodStatus(
  id: string,
  status: PaymentMethodStatus,
): Promise<PaymentMethod> {
  await delay(350);

  const index = paymentMethodsDb.findIndex((method) => method.id === id);
  if (index === -1) {
    throw new PaymentMethodServiceError('El método de pago no existe o ya fue eliminado.');
  }

  const current = paymentMethodsDb[index];
  if (!current) {
    throw new PaymentMethodServiceError('El método de pago no existe o ya fue eliminado.');
  }

  const updated: PaymentMethod = {
    ...current,
    status,
  };

  paymentMethodsDb = [
    ...paymentMethodsDb.slice(0, index),
    updated,
    ...paymentMethodsDb.slice(index + 1),
  ];

  return { ...updated };
}

export async function deletePaymentMethod(id: string): Promise<void> {
  await delay(450);

  const exists = paymentMethodsDb.some((method) => method.id === id);
  if (!exists) {
    throw new PaymentMethodServiceError('El método de pago no existe o ya fue eliminado.');
  }

  paymentMethodsDb = paymentMethodsDb.filter((method) => method.id !== id);
}
