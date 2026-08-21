<template>
  <q-layout view="hHh Lpr fFf" class="app-shell">
    <q-header elevated class="bg-primary text-white">
      <q-toolbar>
        <q-toolbar-title class="text-weight-medium"> Gestión de métodos de pago </q-toolbar-title>

        <div class="row items-center q-gutter-sm">
          <span class="text-caption gt-xs" aria-live="polite">
            {{ authStore.user?.displayName }}
          </span>
          <q-btn
            flat
            dense
            icon="logout"
            label="Cerrar sesión"
            aria-label="Cerrar sesión"
          />
        </div>
      </q-toolbar>
    </q-header>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup lang="ts">
import { Dialog } from 'quasar';
import { useRouter } from 'vue-router';

import { useAuthStore } from '@/stores/auth.store';

const authStore = useAuthStore();
const router = useRouter();

</script>

<style scoped>
.app-shell {
  min-height: 100vh;
  background:
    radial-gradient(circle at top left, rgba(25, 118, 210, 0.08), transparent 40%),
    linear-gradient(180deg, #f5f7fb 0%, #eef2f7 100%);
}
</style>