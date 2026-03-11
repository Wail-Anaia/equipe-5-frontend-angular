import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

// ─── Enums ────────────────────────────────────────────────────────────────────
export type StatutProjet = 'EN_ATTENTE' | 'EN_COURS' | 'TERMINE' | 'VALIDE';

// ─── DTOs (miroir exact des DTOs Spring Boot) ─────────────────────────────────
export interface UserRef {
  id:    number;
  nom:   string;
  email: string;
}

export interface TeamRef {
  id:  number;
  nom: string;
}

export interface ProjectResponse {
  id:           number;
  titre:        string;
  description:  string;
  technologies: string | null;
  statut:       StatutProjet;
  encadrant:    UserRef | null;
  team:         TeamRef | null;
  createdAt:    string;
  updatedAt:    string;
}

export interface ProjectRequest {
  titre:        string;
  description:  string;
  technologies?: string;
  encadrantId?: number;
  teamId?:      number;
}

export interface ProjectUpdateRequest extends ProjectRequest {
  statut?: StatutProjet;
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

// ─── Service ──────────────────────────────────────────────────────────────────
@Injectable({ providedIn: 'root' })
export class ProjectService {

  private http = inject(HttpClient);
  private readonly API = `${environment.apiUrl}/projects`;

  /** GET /api/projects?page=&size= — ADMIN, ENCADRANT */
  getAll(page = 0, size = 12): Observable<PageResponse<ProjectResponse>> {
    const params = new HttpParams().set('page', page).set('size', size);
    return this.http.get<PageResponse<ProjectResponse>>(this.API, { params });
  }

  /** GET /api/projects/{id} */
  getById(id: number): Observable<ProjectResponse> {
    return this.http.get<ProjectResponse>(`${this.API}/${id}`);
  }

  /** GET /api/projects/student — ETUDIANT */
  getMyProjects(): Observable<ProjectResponse[]> {
    return this.http.get<ProjectResponse[]>(`${this.API}/student`);
  }

  /** GET /api/projects/my — ENCADRANT */
  getSupervisedProjects(): Observable<ProjectResponse[]> {
    return this.http.get<ProjectResponse[]>(`${this.API}/my`);
  }

  /** POST /api/projects */
  create(req: ProjectRequest): Observable<ProjectResponse> {
    return this.http.post<ProjectResponse>(this.API, req);
  }

  /** PUT /api/projects/{id} */
  update(id: number, req: ProjectUpdateRequest): Observable<ProjectResponse> {
    return this.http.put<ProjectResponse>(`${this.API}/${id}`, req);
  }

  /** DELETE /api/projects/{id} */
  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.API}/${id}`);
  }

  /** Helper labels */
  statutLabel(s: StatutProjet): string {
    return ({ EN_COURS: 'En cours', EN_ATTENTE: 'En attente', VALIDE: 'Validé', TERMINE: 'Terminé' } as Record<string, string>)[s] ?? s;
  }

  statutClass(s: StatutProjet): string {
    return ({ EN_COURS: 'status--active', EN_ATTENTE: 'status--pending', VALIDE: 'status--validated', TERMINE: 'status--done' } as Record<string, string>)[s] ?? '';
  }

  statutDotColor(s: StatutProjet): string {
    return ({ EN_COURS: '#10b981', EN_ATTENTE: '#f59e0b', VALIDE: '#3b82f6', TERMINE: '#8b5cf6' } as Record<string, string>)[s] ?? '#94a3b8';
  }
}
