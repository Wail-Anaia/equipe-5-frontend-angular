import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { DocumentResponse } from '../models/api.models';
import { ApiErrorHandler } from './api-error-handler';

@Injectable({ providedIn: 'root' })
export class DocumentService {

  private http         = inject(HttpClient);
  private errorHandler = inject(ApiErrorHandler);
  private readonly BASE = `${environment.apiUrl}/documents`;

  getMyDocuments(): Observable<DocumentResponse[]> {
    return this.http.get<DocumentResponse[]>(`${this.BASE}/my`)
      .pipe(catchError(err => this.errorHandler.handle(err)));
  }

  getByProject(projectId: number): Observable<DocumentResponse[]> {
    return this.http.get<DocumentResponse[]>(`${this.BASE}/project/${projectId}`)
      .pipe(catchError(err => this.errorHandler.handle(err)));
  }

  upload(payload: {
    fileName: string;
    filePath: string;
    fileSize?: number;
    projectId: number;
  }): Observable<DocumentResponse> {
    return this.http.post<DocumentResponse>(this.BASE, payload)
      .pipe(catchError(err => this.errorHandler.handle(err)));
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.BASE}/${id}`)
      .pipe(catchError(err => this.errorHandler.handle(err)));
  }
}
