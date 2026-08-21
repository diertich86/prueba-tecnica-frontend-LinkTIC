import type { RouteRecordRaw } from 'vue-router';

declare module 'vue-router' {
  interface RouteMeta {
    requiresAuth?: boolean;
    guestOnly?: boolean;
    title?: string;
  }
}

const routes: RouteRecordRaw[] = [
  {
    path: '/login',
    component: () => import('@/pages/LoginPage.vue'),
    meta: {
      guestOnly: true,
      title: 'Iniciar sesión',
    },
  },
  {
    path: '/',
    component: () => import('@/layouts/MainLayout.vue'),
    meta: {
      requiresAuth: true,
    },
    children: [
      {
        path: '',
        name: 'payment-methods',
        component: () => import('@/pages/PaymentMethodsPage.vue'),
        meta: {
          requiresAuth: true,
          title: 'Métodos de pago',
        },
      },
    ],
  },
  {
    path: '/:catchAll(.*)*',
    component: () => import('@/pages/ErrorNotFound.vue'),
  },
];

export default routes;