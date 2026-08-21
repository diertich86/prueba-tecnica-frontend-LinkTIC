import { defineStore } from 'pinia';
import { computed, ref } from 'vue';

import { loginRequest } from '@/services/auth.service';
import { clearSession, readSession, writeSession } from '@/services/session.storage';
import type { AuthUser, LoginCredentials } from '@/types/auth';
import { notifyError, notifySuccess } from '@/utils/notify';

export const useAuthStore = defineStore('auth', () => {
  const restored = readSession();

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

  const isAuthenticated = computed(() => Boolean(token.value && user.value));

  async function login(credentials: LoginCredentials): Promise<boolean> {
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
      notifySuccess(`Bienvenido, ${session.user.displayName}`);
      return true;
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'No se pudo iniciar sesión. Intenta de nuevo.';
      notifyError(message);
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
    isAuthenticated,
    login,
    logout,
  };
});