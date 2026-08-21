# Prueba Técnica — Frontend - LinkTic

Gestión de métodos de pago construida con **Vue 3**, **Quasar** y **Pinia**.

## Stack

- Vue 3 (Composition API)
- Quasar Framework (CLI + Vite)
- Pinia
- TypeScript estricto
- Vue Router

## Requisitos

- Node.js `^22.12` o `^24`
- npm

## Instalación y arranque

```bash
npm install
npm run dev
```

## Credenciales mock

| Campo      | Valor       |
| ---------- | ----------- |
| Usuario    | `admin`     |
| Contraseña | `Admin123!` |

Si el usuario agrega otra combinación muestra un error genérico de autenticación.
Tras **3 intentos fallidos**, el formulario se bloquea durante **5 minutos** (control en frontend, persistido en `sessionStorage`).

## Funcionalidades

1. **Login obligatorio** con fondo optimizado.
2. **Guards de ruta**: rutas protegidas que redirigen a `/login` si no hay sesión.
3. **Logout** con confirmación de salida, se limpia sesión y regresa al login.
4. **Bloqueo temporal** Si el usuario genera más de 3 intentos fallidos al inicio de sesión.
5. **Listado** de métodos de pago (nombre, tipo, estado, fecha de creación).
6. **Filtros reactivos**: El input buscar por nombre desde 3 caracteres, tipo y estado al instante.
7. **Crear / editar** con el mismo formulario modal.
8. **Eliminar** con modal de confirmación.

## Arquitectura

```text
Page / Layout
    ↓ intención
Pinia Store (Acciones asincronas de UI)
    ↓
Service mock (Simulación API)
    ↓
Estado global + QNotify (errores/éxitos)
```

### Estructura relevante

```text
src/
├── components/
│   ├── filters/GenericFilterBar.vue      # Filtros genéricos
│   └── payments/PaymentMethodFormDialog.vue
├── domain/payment-method.ts              # Etiquetas
├── layouts/MainLayout.vue
├── pages/
│   ├── LoginPage.vue
│   └── PaymentMethodsPage.vue
├── router/                               # Rutas + beforeEach (guards)
├── services/
│   ├── auth.service.ts
│   ├── payment-methods.service.ts        # Mock central de pagos
│   └── session.storage.ts
├── stores/
│   ├── auth.store.ts
│   └── payment-methods.store.ts
├── types/
└── utils/notify.ts                       # Notificaciones globales
```

Los mocks estan en `services/`. Los stores consumen esos servicios, actualizan el estado y propagan errores con `Notify`.

## Modelo de datos (supuestos)

### Método de pago

| Campo         | Tipo      | Notas                                                                  |
| ------------- | --------- | ---------------------------------------------------------------------- |
| `id`          | `string`  | Identificador generado en el mock                                      |
| `name`        | `string`  | Obligatorio, unico                                                     |
| `type`        | unión     | `credit_card`, `debit_card`, `bank_transfer`, `cash`, `digital_wallet` |
| `status`      | unión     | `active` - `inactive`                                                  |
| `description` | `string?` | Opcional                                                               |
| `createdAt`   | `string`  | ISO 8601                                                               |


### Sesión

La sesión se guarda en `sessionStorage`, token simulado mas datos de usuario.