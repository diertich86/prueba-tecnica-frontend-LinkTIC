import { Notify } from 'quasar';

/** Esto muestra un error global al usuario. */
export function notifyError(message: string): void {
  Notify.create({
    type: 'negative',
    message,
    icon: 'error',
  });
}

/** Aqui se muestra una notificación de exito. */
export function notifySuccess(message: string): void {
  Notify.create({
    type: 'positive',
    message,
    icon: 'check_circle',
  });
}

/** Se muestra una advertencia. */
export function notifyWarning(message: string): void {
  Notify.create({
    type: 'warning',
    message,
    icon: 'warning',
  });
}
