export interface AuthUser {
  id: string;
  username: string;
  displayName: string;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface AuthSession {
  user: AuthUser;
  token: string;
}
