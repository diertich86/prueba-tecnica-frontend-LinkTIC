const LOCKOUT_KEY = 'prueba-tecnica.auth.lockout';

export interface LoginLockoutState {
  failedAttempts: number;
  lockedUntil: number | null;
}

const DEFAULT_STATE: LoginLockoutState = {
  failedAttempts: 0,
  lockedUntil: null,
};

export function readLoginLockout(): LoginLockoutState {
  try {
    const raw = sessionStorage.getItem(LOCKOUT_KEY);
    if (!raw) {
      return { ...DEFAULT_STATE };
    }

    const parsed = JSON.parse(raw) as LoginLockoutState;
    return {
      failedAttempts: Number(parsed.failedAttempts) || 0,
      lockedUntil:
        typeof parsed.lockedUntil === 'number' && parsed.lockedUntil > Date.now()
          ? parsed.lockedUntil
          : null,
    };
  } catch {
    sessionStorage.removeItem(LOCKOUT_KEY);
    return { ...DEFAULT_STATE };
  }
}

export function writeLoginLockout(state: LoginLockoutState): void {
  sessionStorage.setItem(LOCKOUT_KEY, JSON.stringify(state));
}

export function clearLoginLockout(): void {
  sessionStorage.removeItem(LOCKOUT_KEY);
}
