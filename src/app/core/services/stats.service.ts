import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, tap, timeout, retry } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AdminStats, StudentStats, EncadrantStats } from '../models/api.models';
import { ApiErrorHandler } from './api-error-handler';


@Injectable({ providedIn: 'root' })
export class StatsService {

  private http         = inject(HttpClient);
  private errorHandler = inject(ApiErrorHandler);
  private readonly BASE = `${environment.apiUrl}/stats`;

  // ── Cache en mémoire (60s TTL) ────────────────────
  private cache = new Map<string, { data: unknown; ts: number }>();
  private readonly CACHE_TTL = 60_000;

  // ── Demo mode (activé si API indisponible) ────────
  readonly demoMode = signal(false);

  getAdminStats(): Observable<AdminStats> {
    return this.fetchWithCache<AdminStats>('admin', `${this.BASE}/admin`);
  }

  getStudentStats(): Observable<StudentStats> {
    return this.fetchWithCache<StudentStats>('student', `${this.BASE}/student`);
  }

  getEncadrantStats(): Observable<EncadrantStats> {
    return this.fetchWithCache<EncadrantStats>('encadrant', `${this.BASE}/encadrant`);
  }

  invalidateCache(key?: string): void {
    key ? this.cache.delete(key) : this.cache.clear();
  }

  private fetchWithCache<T>(key: string, url: string): Observable<T> {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.ts < this.CACHE_TTL) {
      return new Observable<T>(obs => {
        obs.next(cached.data as T);
        obs.complete();
      });
    }

    return this.http.get<T>(url).pipe(
      timeout(8000),
      retry(1),
      tap(data => {
        this.cache.set(key, { data, ts: Date.now() });
        this.demoMode.set(false);
      }),
      catchError(err => {
        if (err.status !== 401 && err.status !== 403) {
          this.demoMode.set(true);
        }
        return this.errorHandler.handle(err);
      })
    );
  }
}
