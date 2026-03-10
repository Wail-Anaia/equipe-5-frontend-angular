import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, catchError, tap } from 'rxjs';

import { StatsService } from './stats.service';

import { environment } from '../../../environments/environment';

// ══════════════════════════════════════════════════════
// Interfaces — alignées avec les DTOs Spring Boot
// ══════════════════════════════════════════════════════

export type Role = 'ADMIN' | 'ENCADRANT' | 'ETUDIANT';

export interface UserResponse {
  id:        number;
  nom:       string;
  email:     string;
  role:      Role;
  actif:     boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateUserRequest {
  nom:      string;
  email:    string;
  password: string;
  role:     Role;
}

export interface UpdateUserStatusRequest {
  actif: boolean;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword:     string;
}

export interface PageResponse<T> {
  content:       T[];
  totalElements: number;
  totalPages:    number;
  number:        number;
  size:          number;
  first:         boolean;
  last:          boolean;
}

// ══════════════════════════════════════════════════════
// SERVICE
// ══════════════════════════════════════════════════════

@Injectable({ providedIn: 'root' })
export class UserService {

  private http         = inject(HttpClient);
  private statsService = inject(StatsService);
  private readonly API = `${environment.apiUrl}/users`;

  // ── Liste paginée ──────────────────────────────────
  getUsers(page = 0, size = 20): Observable<PageResponse<UserResponse>> {
    const params = new HttpParams()
      .set('page', page)
      .set('size', size);
    return this.http.get<PageResponse<UserResponse>>(this.API, { params });
  }

  // ── Détail ─────────────────────────────────────────
  getUserById(id: number): Observable<UserResponse> {
    return this.http.get<UserResponse>(`${this.API}/${id}`);
  }

  // ── Créer un utilisateur ───────────────────────────
  // Méthode `createUser()` — utilisée dans les composants qui l'injectent
  createUser(request: CreateUserRequest): Observable<UserResponse> {
    return this.http.post<UserResponse>(this.API, request).pipe(
      tap(() => this.statsService.invalidateCache('admin'))
    );
  }

  // Alias `create()` — compatibilité avec le code existant qui appelle .create()
  create(request: CreateUserRequest): Observable<UserResponse> {
    return this.createUser(request);
  }

  // ── Activer / Désactiver ───────────────────────────
  setUserStatus(id: number, actif: boolean): Observable<UserResponse> {
    const body: UpdateUserStatusRequest = { actif };
    return this.http.patch<UserResponse>(`${this.API}/${id}/status`, body).pipe(
      tap(() => this.statsService.invalidateCache('admin'))
    );
  }

  // ── Profil connecté ────────────────────────────────
  getMyProfile(): Observable<UserResponse> {
    return this.http.get<UserResponse>(`${environment.apiUrl}/profile/me`);
  }

  // ── Changer son mot de passe ───────────────────────
  changePassword(request: ChangePasswordRequest): Observable<void> {
    return this.http.patch<void>(`${environment.apiUrl}/profile/me/password`, request);
  }
}
