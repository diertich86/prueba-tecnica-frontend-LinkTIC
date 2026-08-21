export type PaymentMethodType =
  'credit_card' | 'debit_card' | 'bank_transfer' | 'cash' | 'digital_wallet';

export type PaymentMethodStatus = 'active' | 'inactive';

export interface PaymentMethod {
  id: string;
  name: string;
  type: PaymentMethodType;
  status: PaymentMethodStatus;
  description?: string;
  createdAt: string;
}

export interface PaymentMethodFilters {
  name?: string;
  type?: PaymentMethodType;
  status?: PaymentMethodStatus;
}

export interface PaymentMethodPayload {
  name: string;
  type: PaymentMethodType;
  description?: string;
  status?: PaymentMethodStatus;
}
