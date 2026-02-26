import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { Role } from '../models/user.model';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
}

export interface JwtPayload {
  sub: string;
  role: Role;
  iat: number;
  exp: number;
}

@Injectable({ providedIn: 'root' })
export class AuthService {

  private http   = inject(HttpClient);
  private router = inject(Router);

  private readonly api = `${environment.apiUrl}/auth`;
  private token: string | null = null;  // stockage mémoire (pas localStorage)

  login(credentials: LoginRequest) {
    return this.http.post<AuthResponse>(`${this.api}/login`, credentials).pipe(
      tap(res => this.token = res.token)
    );
  }

  logout(): void {
    this.token = null;
    this.router.navigate(['/login']);
  }

  getToken(): string | null {
    return this.token;
  }

  isLogged(): boolean {
    return !!this.token && !this.isTokenExpired();
  }

  getRole(): Role | null {
    return this.decodeToken()?.role ?? null;
  }

  decodeToken(): JwtPayload | null {
    if (!this.token) return null;
    try {
      return JSON.parse(atob(this.token.split('.')[1])) as JwtPayload;
    } catch {
      return null;
    }
  }

  private isTokenExpired(): boolean {
    const payload = this.decodeToken();
    if (!payload) return true;
    return payload.exp * 1000 < Date.now();
  }
}
