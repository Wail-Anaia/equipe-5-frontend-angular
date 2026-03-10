import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule }  from '@angular/common';
import { FormsModule }   from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { Subject, takeUntil, finalize } from 'rxjs';

import { AuditService }  from '../../core/services/audit.service';
import { AuditLog }      from '../../core/models/api.models';
import { LoadingSpinnerComponent } from '../../shared/components/loading-spinner/loading-spinner';

@Component({
  selector: 'app-audit',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule, LoadingSpinnerComponent],
  templateUrl: './audit.html',
  styleUrl: './audit.scss',
})
export class AuditComponent implements OnInit, OnDestroy {

  private auditService = inject(AuditService);
  private destroy$     = new Subject<void>();

  loading       = true;
  logs:         AuditLog[] = [];
  activeFilter  = '';
  currentPage   = 0;
  totalPages    = 1;
  totalElements = 0;

  readonly actionFilters = [
    { value: '',              label: 'Tout',           color: '#6C63FF' },
    { value: 'LOGIN_SUCCESS', label: 'Connexions',     color: '#10b981' },
    { value: 'LOGIN_FAILED',  label: 'Échecs login',   color: '#ef4444' },
    { value: 'USER_CREATED',  label: 'Créations',      color: '#3b82f6' },
    { value: 'USER_DISABLED', label: 'Désactivations', color: '#f59e0b' },
    { value: 'ROLE_CHANGED',  label: 'Rôles modifiés', color: '#8b5cf6' },
  ];

  ngOnInit(): void { this.loadPage(0); }
  ngOnDestroy(): void { this.destroy$.next(); this.destroy$.complete(); }

  setFilter(action: string): void {
    this.activeFilter = action;
    this.loadPage(0);
  }

  loadPage(page: number): void {
    if (page < 0) return;
    this.loading = true;

    const action = this.activeFilter || undefined;

    this.auditService.getLogs(page, 50, action)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.loading = false)
      )
      .subscribe(data => {
        this.logs          = data.content;
        this.currentPage   = data.number;
        this.totalPages    = data.totalPages;
        this.totalElements = data.totalElements;
      });
  }

  getActionColor(action: string): string {
    return {
      USER_CREATED: '#3b82f6', USER_DISABLED: '#f59e0b', USER_ENABLED: '#10b981',
      LOGIN_SUCCESS: '#10b981', LOGIN_FAILED: '#ef4444', ROLE_CHANGED: '#8b5cf6',
    }[action] ?? '#64748b';
  }

  getActionIcon(action: string): string {
    return {
      USER_CREATED: 'person_add', USER_DISABLED: 'block',    USER_ENABLED:  'check_circle',
      LOGIN_SUCCESS: 'login',     LOGIN_FAILED:  'warning',   ROLE_CHANGED:  'manage_accounts',
    }[action] ?? 'info';
  }
}
