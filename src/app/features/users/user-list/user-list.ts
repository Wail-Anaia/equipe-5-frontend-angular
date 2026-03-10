import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule }    from '@angular/common';
import { FormsModule }     from '@angular/forms';
import { RouterLink }      from '@angular/router';
import { MatIconModule }   from '@angular/material/icon';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { Subject, takeUntil, debounceTime, distinctUntilChanged, switchMap, finalize } from 'rxjs';

import { UserService }    from '../../../core/services/user-service';
import { UserResponse }   from '../../../core/models/api.models';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner';

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [
    CommonModule, FormsModule, RouterLink,
    MatIconModule, MatSnackBarModule,
    LoadingSpinnerComponent
  ],
  templateUrl: './user-list.html',
  styleUrls: ['./user-list.scss']
})
export class UserListComponent implements OnInit, OnDestroy {

  private userService = inject(UserService);
  private snack       = inject(MatSnackBar);
  private destroy$    = new Subject<void>();
  private search$     = new Subject<string>();

  // ── State ─────────────────────────────────────────
  loading       = true;
  users:        UserResponse[] = [];
  searchQuery   = '';
  currentPage   = 0;
  totalPages    = 1;
  totalElements = 0;
  readonly pageSize = 20;

  ngOnInit(): void {
    this.loadPage(0);

    // Debounce search
    this.search$.pipe(
      debounceTime(350),
      distinctUntilChanged(),
      switchMap(() => {
        this.loading = true;
        return this.userService.getUsers(0, this.pageSize);
      }),
      takeUntil(this.destroy$)
    ).subscribe(page => this.applyPage(page));
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadPage(page: number): void {
    if (page < 0 || page >= this.totalPages && this.totalPages > 0) return;
    this.loading = true;

    this.userService.getUsers(page, this.pageSize)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.loading = false)
      )
      .subscribe(data => this.applyPage(data));
  }

  private applyPage(data: any): void {
    this.users         = data.content;
    this.currentPage   = data.number;
    this.totalPages    = data.totalPages;
    this.totalElements = data.totalElements;
    this.loading       = false;
  }

  onSearch(value: string): void {
    this.search$.next(value);
  }

  toggleStatus(user: UserResponse): void {
    const action = user.actif ? 'désactiver' : 'activer';
    this.userService.setUserStatus(user.id, !user.actif)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: updated => {
          const idx = this.users.findIndex(u => u.id === updated.id);
          if (idx !== -1) this.users[idx] = updated;
          this.snack.open(
            `✅ Compte ${updated.actif ? 'activé' : 'désactivé'} — ${updated.nom}`,
            'Fermer',
            { duration: 4000, panelClass: updated.actif ? 'snack-success' : 'snack-info',
              horizontalPosition: 'center', verticalPosition: 'top' }
          );
        },
        error: () => {
          this.snack.open(`❌ Impossible de ${action} ce compte`, 'Fermer',
            { duration: 5000, panelClass: 'snack-error',
              horizontalPosition: 'center', verticalPosition: 'top' });
        }
      });
  }

  getRoleColor(role: string): string {
    return { ADMIN: '#ef4444', ENCADRANT: '#10b981', ETUDIANT: '#6C63FF' }[role] ?? '#64748b';
  }
}
