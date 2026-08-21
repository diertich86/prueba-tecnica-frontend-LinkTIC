import type {
  PaymentMethod,
  PaymentMethodPayload,
  PaymentMethodType,
} from '@/types/payment-method';

export const PAYMENT_METHOD_TYPE_LABELS: Record<PaymentMethodType, string> = {
  credit_card: 'Tarjeta de crédito',
  debit_card: 'Tarjeta de débito',
  bank_transfer: 'Transferencia bancaria',
  cash: 'Efectivo',
  digital_wallet: 'Billetera digital',
};

export const PAYMENT_METHOD_TYPE_OPTIONS = (
  Object.entries(PAYMENT_METHOD_TYPE_LABELS) as [PaymentMethodType, string][]
).map(([value, label]) => ({ value, label }));

export function formatPaymentMethodType(type: PaymentMethodType): string {
  return PAYMENT_METHOD_TYPE_LABELS[type];
}

export function formatCreatedAt(isoDate: string): string {
  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) {
    return isoDate;
  }

  return new Intl.DateTimeFormat('es-CO', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date);
}

export function normalizePaymentPayload(payload: PaymentMethodPayload): PaymentMethodPayload {
  const description = payload.description?.trim();
  const normalized: PaymentMethodPayload = {
    name: payload.name.trim(),
    type: payload.type,
  };

  if (description) {
    normalized.description = description;
  }

  if (payload.status) {
    normalized.status = payload.status;
  }

  return normalized;
}

export function isDuplicateName(
  methods: PaymentMethod[],
  name: string,
  excludeId?: string,
): boolean {
  const normalized = name.trim().toLowerCase();
  return methods.some(
    (method) => method.id !== excludeId && method.name.trim().toLowerCase() === normalized,
  );
}
