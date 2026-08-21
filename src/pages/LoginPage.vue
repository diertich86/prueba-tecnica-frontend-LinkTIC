<template>
  <div class="login-page flex flex-center q-pa-md">
    <div class="login-backdrop" aria-hidden="true">
      <picture>
        <source srcset="/images/login-bg.webp" type="image/webp" />
        <img
          class="login-backdrop__image"
          src="/images/login-bg.jpg"
          alt=""
          width="1024"
          height="542"
          decoding="async"
          fetchpriority="high"
        />
      </picture>
      <div class="login-backdrop__overlay" />
    </div>

    <div class="login-panel column items-center">
      <picture class="login-logo-wrap">
        <source srcset="/images/login-logo.webp" type="image/webp" />
        <img
          class="login-logo"
          src="/images/login-logo.png"
          alt="Linktic"
          width="60"
          height="60"
          decoding="async"
        />
      </picture>

      <q-card class="login-card q-pa-md" flat bordered>
        <q-card-section>
          <div class="text-h5 text-weight-medium text-primary">Prueba Técnica</div>
          <div class="text-subtitle1 text-grey-8 q-mt-xs">
            Inicia sesión para administrar métodos de pago
          </div>
        </q-card-section>

        <q-card-section>
          <q-form class="column q-gutter-y-md" greedy @submit.prevent="onSubmit">
            <q-input
              v-model="form.username"
              label="Usuario"
              autocomplete="username"
              outlined
              dense
              class="full-width"
              :disable="authStore.loading || authStore.isLocked"
              :rules="[(val) => !!val?.trim() || 'El usuario es obligatorio']"
              lazy-rules
            >
              <template #prepend>
                <q-icon name="person" />
              </template>
            </q-input>

            <q-input
              v-model="form.password"
              :type="showPassword ? 'text' : 'password'"
              label="Contraseña"
              autocomplete="current-password"
              outlined
              dense
              class="full-width"
              :disable="authStore.loading || authStore.isLocked"
              :rules="[(val) => !!val || 'La contraseña es obligatoria']"
              lazy-rules
            >
              <template #prepend>
                <q-icon name="lock" />
              </template>
              <template #append>
                <q-icon
                  :name="showPassword ? 'visibility_off' : 'visibility'"
                  class="cursor-pointer"
                  role="button"
                  tabindex="0"
                  :aria-label="showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'"
                  @click="showPassword = !showPassword"
                  @keyup.enter="showPassword = !showPassword"
                />
              </template>
            </q-input>

            <q-btn
              type="submit"
              color="primary"
              class="full-width"
              label="Iniciar sesión"
              :loading="authStore.loading"
              :disable="authStore.isLocked"
              unelevated
            />
          </q-form>

          <q-banner
            v-if="authStore.isLocked"
            dense
            rounded
            class="bg-negative text-white q-mt-md"
            role="alert"
          >
            Acceso bloqueado por intentos fallidos. Espera
            {{ lockCountdownLabel }} para volver a intentar.
          </q-banner>

          <q-banner
            v-else-if="authStore.failedAttempts > 0"
            dense
            rounded
            class="bg-orange-1 text-orange-10 q-mt-md"
            role="status"
          >
            Intentos fallidos: {{ authStore.failedAttempts }}/{{ authStore.maxFailedAttempts }}.
            Quedan {{ authStore.remainingAttempts }} antes del bloqueo temporal.
          </q-banner>
        </q-card-section>
      </q-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, reactive, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import { useAuthStore } from '@/stores/auth.store';

const authStore = useAuthStore();
const router = useRouter();
const route = useRoute();

const showPassword = ref(false);
const nowTick = ref(Date.now());
let tickTimer: ReturnType<typeof setInterval> | null = null;

const form = reactive({
  username: '',
  password: '',
});

const lockCountdownLabel = computed(() => {
  const remaining = Math.max(0, (authStore.lockedUntil ?? 0) - nowTick.value);
  if (remaining <= 0) {
    return 'unos segundos';
  }

  const totalSeconds = Math.ceil(remaining / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  if (minutes <= 0) {
    return `${seconds}s`;
  }

  return `${minutes}m ${seconds.toString().padStart(2, '0')}s`;
});

async function onSubmit() {
  const ok = await authStore.login({
    username: form.username,
    password: form.password,
  });

  if (!ok) {
    return;
  }

  const redirect = typeof route.query.redirect === 'string' ? route.query.redirect : '/';
  const safeRedirect = redirect.startsWith('/') && !redirect.startsWith('//') ? redirect : '/';
  await router.replace(safeRedirect);
}

onMounted(() => {
  authStore.refreshLockoutState();
  tickTimer = setInterval(() => {
    nowTick.value = Date.now();
    authStore.refreshLockoutState();
  }, 1000);
});

onUnmounted(() => {
  if (tickTimer) {
    clearInterval(tickTimer);
  }
});
</script>

<style scoped>
.login-page {
  position: relative;
  isolation: isolate;
  min-height: 100vh;
  overflow: hidden;
}

.login-backdrop {
  position: absolute;
  inset: 0;
  z-index: -1;
}

.login-backdrop__image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
  display: block;
}

.login-backdrop__overlay {
  position: absolute;
  inset: 0;
  background:
    linear-gradient(120deg, rgba(4, 12, 28, 0.72) 0%, rgba(8, 28, 64, 0.55) 55%, rgba(4, 18, 40, 0.68) 100%);
}

.login-panel {
  width: min(100%, 420px);
  gap: 16px;
}

.login-logo-wrap {
  display: flex;
  justify-content: center;
  line-height: 0;
}

.login-logo {
  width: 60px;
  height: 60px;
  object-fit: cover;
  border-radius: 50%;
  border: 2px solid #ffffff;
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.25);
  background: #0a1f44;
}

.login-card {
  width: 100%;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(6px);
  box-shadow: 0 18px 40px rgba(0, 0, 0, 0.28);
}
</style>
