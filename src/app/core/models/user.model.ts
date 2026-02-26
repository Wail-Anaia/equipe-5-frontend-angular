// Synchronisé avec l'enum Role du backend Spring Boot
export type Role = 'ADMIN' | 'ENCADRANT' | 'ETUDIANT';

export interface User {
  id?: number;
  nom: string;            // ← 'nom', pas 'username' (synchro backend)
  email: string;
  role: Role;
  actif?: boolean;
}

export interface CreateUserRequest {
  nom: string;
  email: string;
  password: string;
  role: Role;
}
