import type { AuthSession, LoginCredentials } from '@/types/auth';
import { delay } from '@/utils/delay';

const MOCK_USERNAME = 'admin';
const MOCK_PASSWORD = 'Admin123!';

export class AuthServiceError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AuthServiceError';
  }
}

/**
 * Mock de autenticación centralizado.
 * En producción este servicio llamaría a un endpoint HTTP real.
 */
export async function loginRequest(credentials: LoginCredentials): Promise<AuthSession> {
  await delay(450);

  const username = credentials.username.trim();
  const password = credentials.password;

  if (username === MOCK_USERNAME && password === MOCK_PASSWORD) {
    return {
      token: 'mock-session-token',
      user: {
        id: 'user-1',
        username: MOCK_USERNAME,
        displayName: 'Administrador',
      },
    };
  }

  throw new AuthServiceError('Credenciales inválidas. Verifica usuario y contraseña.');
}
