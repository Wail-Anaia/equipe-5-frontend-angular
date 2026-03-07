import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { MatIconModule } from '@angular/material/icon';

interface AuditEntry {
  id: number;
  action: string;
  userId: number | null;
  performedBy: number | null;
  details: string;
  createdAt: string;
}

@Component({
  selector: 'app-audit',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule],
  templateUrl: './audit.html',
  styleUrl: './audit.scss',
})
export class AuditComponent implements OnInit {

  private http = inject(HttpClient);

  allLogs:      AuditEntry[] = [];
  filteredLogs: AuditEntry[] = [];
  activeFilter = 'ALL';

  readonly actionFilters = [
    { value: 'ALL',           label: 'Tout',           color: '#6C63FF' },
    { value: 'LOGIN_SUCCESS', label: 'Connexions',     color: '#10b981' },
    { value: 'LOGIN_FAILED',  label: 'Échecs login',   color: '#ef4444' },
    { value: 'USER_CREATED',  label: 'Créations',      color: '#3b82f6' },
    { value: 'USER_DISABLED', label: 'Désactivations', color: '#f59e0b' },
    { value: 'ROLE_CHANGED',  label: 'Rôles modifiés', color: '#8b5cf6' },
  ];

  private readonly demoLogs: AuditEntry[] = [
    { id: 1, action: 'USER_CREATED',  userId: 5,    performedBy: 1,    details: 'Compte créé : yasmine@etu.ma | Rôle : ETUDIANT',   createdAt: '2024-03-10T09:15:00' },
    { id: 2, action: 'LOGIN_SUCCESS', userId: 2,    performedBy: 2,    details: 'Login réussi : k.idrissi@university.ma',            createdAt: '2024-03-10T08:42:00' },
    { id: 3, action: 'USER_DISABLED', userId: 4,    performedBy: 1,    details: 'Statut modifié : omar@etu.ma → actif=false',        createdAt: '2024-03-09T16:30:00' },
    { id: 4, action: 'LOGIN_FAILED',  userId: null, performedBy: null, details: 'Tentative échouée pour : inconnu@test.com',         createdAt: '2024-03-09T14:55:00' },
    { id: 5, action: 'ROLE_CHANGED',  userId: 3,    performedBy: 1,    details: 'Rôle mis à jour → ENCADRANT : sara@etu.ma',         createdAt: '2024-03-08T11:20:00' },
    { id: 6, action: 'USER_CREATED',  userId: 6,    performedBy: 1,    details: 'Compte créé : amine@etu.ma | Rôle : ETUDIANT',      createdAt: '2024-03-08T10:05:00' },
    { id: 7, action: 'LOGIN_SUCCESS', userId: 1,    performedBy: 1,    details: 'Login réussi : admin@university.ma',                createdAt: '2024-03-07T09:00:00' },
  ];

  ngOnInit(): void {
    this.http.get<AuditEntry[]>('/api/audit').subscribe({
      next:  (data) => { this.allLogs = data; this.filterLogs(); },
      error: ()     => { this.allLogs = this.demoLogs; this.filterLogs(); }
    });
  }

  filterLogs(): void {
    this.filteredLogs = this.activeFilter === 'ALL'
      ? this.allLogs
      : this.allLogs.filter(l => l.action === this.activeFilter);
  }

  getActionColor(action: string): string {
    return {
      USER_CREATED: '#3b82f6', USER_DISABLED: '#f59e0b', USER_ENABLED:  '#10b981',
      LOGIN_SUCCESS: '#10b981', LOGIN_FAILED: '#ef4444', ROLE_CHANGED:  '#8b5cf6',
    }[action] ?? '#64748b';
  }

  getActionIcon(action: string): string {
    return {
      USER_CREATED: 'person_add', USER_DISABLED: 'block',    USER_ENABLED:  'check_circle',
      LOGIN_SUCCESS: 'login',     LOGIN_FAILED:  'warning',   ROLE_CHANGED:  'manage_accounts',
    }[action] ?? 'info';
  }
}
