import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { AuthResponse, AuthState, Role } from './auth.model';

@Injectable({ providedIn: 'root' })
export class AuthService {

  private readonly API = 'http://localhost:8080/api/auth';

  // Token en mémoire uniquement (jamais localStorage)
  private readonly _state = signal<AuthState>({ token: null, user: null });

  readonly user    = computed(() => this._state().user);
  readonly token   = computed(() => this._state().token);
  readonly isLoggedIn = computed(() => this._state().token !== null);
  readonly role    = computed(() => this._state().user?.role ?? null);
  readonly isAdmin = computed(() => this._state().user?.role === 'ADMIN');

  constructor(private http: HttpClient, private router: Router) {}

  login(email: string, password: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.API}/login`, { email, password }).pipe(
      tap(res => {
        this._state.set({
          token: res.token,
          user: { email: res.email, nom: res.nom, role: res.role }
        });
      })
    );
  }

  logout(): void {
    this._state.set({ token: null, user: null });
    this.router.navigate(['/login']);
  }

  hasRole(role: Role): boolean {
    return this._state().user?.role === role;
  }

  getToken(): string | null {
    return this._state().token;
  }
}
