import { defineStore } from 'pinia';
import { computed, ref } from 'vue';

import { loginRequest } from '@/services/auth.service';
import {
  clearLoginLockout,
  readLoginLockout,
  writeLoginLockout,
} from '@/services/login-lockout.storage';
import { clearSession, readSession, writeSession } from '@/services/session.storage';
import type { AuthUser, LoginCredentials } from '@/types/auth';
import { notifyError, notifySuccess, notifyWarning } from '@/utils/notify';

const MAX_FAILED_ATTEMPTS = 3;
const LOCKOUT_DURATION_MS = 5 * 60 * 1000;

export const useAuthStore = defineStore('auth', () => {
  const restored = readSession();
  const restoredLockout = readLoginLockout();

  const user = ref<AuthUser | null>(
    restored
      ? {
          id: restored.userId,
          username: restored.username,
          displayName: restored.displayName,
        }
      : null,
  );
  const token = ref<string | null>(restored?.token ?? null);
  const loading = ref(false);
  const failedAttempts = ref(restoredLockout.failedAttempts);
  const lockedUntil = ref<number | null>(restoredLockout.lockedUntil);

  const isAuthenticated = computed(() => Boolean(token.value && user.value));

  const isLocked = computed(() => Boolean(lockedUntil.value && lockedUntil.value > Date.now()));

  const lockRemainingMs = computed(() => {
    if (!lockedUntil.value) {
      return 0;
    }
    return Math.max(0, lockedUntil.value - Date.now());
  });

  const remainingAttempts = computed(() =>
    Math.max(0, MAX_FAILED_ATTEMPTS - failedAttempts.value),
  );

  function persistLockout(): void {
    writeLoginLockout({
      failedAttempts: failedAttempts.value,
      lockedUntil: lockedUntil.value,
    });
  }

  function clearFailedAttempts(): void {
    failedAttempts.value = 0;
    lockedUntil.value = null;
    clearLoginLockout();
  }

  function refreshLockoutState(): void {
    if (lockedUntil.value && lockedUntil.value <= Date.now()) {
      clearFailedAttempts();
    }
  }

  function registerFailedAttempt(): void {
    failedAttempts.value += 1;

    if (failedAttempts.value >= MAX_FAILED_ATTEMPTS) {
      lockedUntil.value = Date.now() + LOCKOUT_DURATION_MS;
      failedAttempts.value = MAX_FAILED_ATTEMPTS;
      persistLockout();
      notifyError(
        'Demasiados intentos fallidos. El acceso quedó bloqueado temporalmente por 5 minutos.',
      );
      return;
    }

    persistLockout();
    notifyWarning(
      `Credenciales inválidas. Te quedan ${remainingAttempts.value} intento(s) antes del bloqueo.`,
    );
  }

  async function login(credentials: LoginCredentials): Promise<boolean> {
    refreshLockoutState();

    if (isLocked.value) {
      const minutes = Math.max(1, Math.ceil(lockRemainingMs.value / 60000));
      notifyError(
        `Acceso bloqueado por intentos fallidos. Espera aproximadamente ${minutes} minuto(s).`,
      );
      return false;
    }

    loading.value = true;

    try {
      const session = await loginRequest(credentials);
      user.value = session.user;
      token.value = session.token;
      writeSession({
        token: session.token,
        userId: session.user.id,
        username: session.user.username,
        displayName: session.user.displayName,
      });
      clearFailedAttempts();
      notifySuccess(`Bienvenido, ${session.user.displayName}`);
      return true;
    } catch {
      registerFailedAttempt();
      return false;
    } finally {
      loading.value = false;
    }
  }

  function logout(): void {
    user.value = null;
    token.value = null;
    clearSession();
    notifySuccess('Sesión cerrada correctamente');
  }

  return {
    user,
    token,
    loading,
    failedAttempts,
    lockedUntil,
    isAuthenticated,
    isLocked,
    lockRemainingMs,
    remainingAttempts,
    maxFailedAttempts: MAX_FAILED_ATTEMPTS,
    login,
    logout,
    refreshLockoutState,
  };
});
