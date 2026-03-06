export type Role = 'ADMIN' | 'ENCADRANT' | 'ETUDIANT';

export interface AuthResponse {
  token: string;
  email: string;
  nom: string;
  role: Role;
  expiresIn: number;
}

export interface AuthState {
  token: string | null;
  user: { email: string; nom: string; role: Role } | null;
}

export interface CreateUserRequest {
  nom: string;
  email: string;
  password: string;
  role: Role;
}

export interface UserResponse {
  id: number;
  nom: string;
  email: string;
  role: Role;
  actif: boolean;
  createdAt: string;
}
