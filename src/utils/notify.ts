import { Notify } from 'quasar';

export function notifyError(message: string): void {
  Notify.create({
    type: 'negative',
    message,
    icon: 'error',
  });
}

export function notifySuccess(message: string): void {
  Notify.create({
    type: 'positive',
    message,
    icon: 'check_circle',
  });
}

export function notifyWarning(message: string): void {
  Notify.create({
    type: 'warning',
    message,
    icon: 'warning',
  });
}
