export interface User {
  id?: string;
  nom: string;
  prenom?: string;
  login: string;
  pass?: string;
  role?: string;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export interface LoginCredentials {
  login: string;
  password: string;
}

export interface RegisterData {
  login: string;
  password: string;
  nom: string;
  prenom: string;
  role?: string;
}
