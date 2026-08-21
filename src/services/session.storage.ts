const SESSION_KEY = 'prueba-tecnica.auth.session';

export interface StoredSession {
  token: string;
  userId: string;
  username: string;
  displayName: string;
}

/** Leemos la sesion mock desde sessionStorage. */
export function readSession(): StoredSession | null {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    if (!raw) {
      return null;
    }

    const parsed = JSON.parse(raw) as StoredSession;
    if (!parsed.token || !parsed.userId || !parsed.username) {
      sessionStorage.removeItem(SESSION_KEY);
      return null;
    }

    return parsed;
  } catch {
    sessionStorage.removeItem(SESSION_KEY);
    return null;
  }
}

/** Se guarda la sesion mock en sessionStorage */
export function writeSession(session: StoredSession): void {
  sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

/** Aqui se elimina la sesion mock del navegador */
export function clearSession(): void {
  sessionStorage.removeItem(SESSION_KEY);
}
