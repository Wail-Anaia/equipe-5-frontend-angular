import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Role } from '../models/user.model';

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
}

@Injectable({ providedIn: 'root' })
export class UserService {

  private readonly apiUrl = `${environment.apiUrl}/users`;

  constructor(private http: HttpClient) {}

  create(payload: CreateUserRequest): Observable<UserResponse> {
    return this.http.post<UserResponse>(this.apiUrl, payload);
  }
}
