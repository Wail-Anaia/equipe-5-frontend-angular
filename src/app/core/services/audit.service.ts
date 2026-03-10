import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, catchError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuditLog, Page } from '../models/api.models';
import { ApiErrorHandler } from './api-error-handler';

@Injectable({ providedIn: 'root' })
export class AuditService {

  private http         = inject(HttpClient);
  private errorHandler = inject(ApiErrorHandler);
  private readonly BASE = `${environment.apiUrl}/audit`;

  getLogs(page = 0, size = 50, action?: string): Observable<Page<AuditLog>> {
    let params = new HttpParams().set('page', page).set('size', size);
    if (action) params = params.set('action', action);
    return this.http.get<Page<AuditLog>>(this.BASE, { params })
      .pipe(catchError(err => this.errorHandler.handle(err)));
  }
}
