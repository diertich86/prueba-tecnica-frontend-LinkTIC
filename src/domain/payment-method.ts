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

/** Esto devuelve la etiqueta legible del tipo de metodo de pago. */
export function formatPaymentMethodType(type: PaymentMethodType): string {
  return PAYMENT_METHOD_TYPE_LABELS[type];
}

/** Formatea la fecha de creación para la UI. */
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

/** Se normaliza el payload antes de enviarlo al servicio mock */
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

/** Aqui se indica si ya existe un metodo con el mismo nombre */
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
