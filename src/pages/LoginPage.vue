<template>
  <div class="login-page flex flex-center q-pa-md">
    <div class="login-panel column items-center">
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
              :disable="authStore.loading"
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
              :disable="authStore.loading"
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
              unelevated
            />
          </q-form>
        </q-card-section>
      </q-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import { useAuthStore } from '@/stores/auth.store';

const authStore = useAuthStore();
const router = useRouter();
const route = useRoute();

const showPassword = ref(false);

const form = reactive({
  username: '',
  password: '',
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
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  background: linear-gradient(160deg, #e8eef7 0%, #f7f9fc 55%, #edf3f8 100%);
}

.login-panel {
  width: min(100%, 420px);
}

.login-card {
  width: 100%;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.96);
  box-shadow: 0 18px 40px rgba(0, 0, 0, 0.12);
}
</style>
