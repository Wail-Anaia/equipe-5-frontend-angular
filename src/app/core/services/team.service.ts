import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

// ─── DTOs (miroir Spring Boot TeamDto / TeamMemberRequest) ────────────────────
export interface TeamMember {
  id:    number;
  nom:   string;
  email: string;
  role:  'ADMIN' | 'ENCADRANT' | 'ETUDIANT';
  actif: boolean;
}

export interface TeamResponse {
  id:        number;
  nom:       string;
  membres:   TeamMember[];
  createdAt: string;
}

export interface TeamRequest {
  nom: string;
}

export interface AddMemberRequest {
  userId: number;
}

@Injectable({ providedIn: 'root' })
export class TeamService {

  private http = inject(HttpClient);
  private readonly API = `${environment.apiUrl}/teams`;

  /** GET /api/teams */
  getAll(): Observable<TeamResponse[]> {
    return this.http.get<TeamResponse[]>(this.API);
  }

  /** GET /api/teams/{id} */
  getById(id: number): Observable<TeamResponse> {
    return this.http.get<TeamResponse>(`${this.API}/${id}`);
  }

  /** POST /api/teams */
  create(req: TeamRequest): Observable<TeamResponse> {
    return this.http.post<TeamResponse>(this.API, req);
  }

  /** DELETE /api/teams/{id} */
  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.API}/${id}`);
  }

  /** POST /api/teams/{id}/members */
  addMember(teamId: number, userId: number): Observable<TeamResponse> {
    const body: AddMemberRequest = { userId };
    return this.http.post<TeamResponse>(`${this.API}/${teamId}/members`, body);
  }

  /** DELETE /api/teams/{teamId}/members/{userId} */
  removeMember(teamId: number, userId: number): Observable<TeamResponse> {
    return this.http.delete<TeamResponse>(`${this.API}/${teamId}/members/${userId}`);
  }
}
