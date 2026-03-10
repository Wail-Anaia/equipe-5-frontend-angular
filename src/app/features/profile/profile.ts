import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { AuthService } from '../../core/auth/auth.service';

import { environment } from '../../../environments/environment';


@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatIconModule, MatSnackBarModule],
  templateUrl: './profile.html',
  styleUrls: ['./profile.scss']
})
export class Profile {

  auth  = inject(AuthService);
  private fb    = inject(FormBuilder);
  private http  = inject(HttpClient);
  private snack = inject(MatSnackBar);

  loading      = false;
  hideOld      = true;
  hideNew      = true;
  submitted    = false;
  activeTab: 'info' | 'password' = 'info';

  passwordForm = this.fb.nonNullable.group({
    currentPassword: ['', [Validators.required]],
    newPassword:     ['', [Validators.required, Validators.minLength(6)]],
  });

  getRoleLabel(): string {
    const map: Record<string, string> = { ADMIN: 'Administrateur', ENCADRANT: 'Encadrant', ETUDIANT: 'Étudiant' };
    return map[this.auth.role()!] ?? '';
  }

  getRoleClass(): string {
    return { ADMIN: 'role--admin', ENCADRANT: 'role--encadrant', ETUDIANT: 'role--etudiant' }[this.auth.role()!] ?? '';
  }

  getInitials(): string {
    const parts = this.auth.userName().trim().split(' ');
    return parts.length >= 2 ? parts[0][0] + parts[1][0] : this.auth.userName().substring(0, 2).toUpperCase();
  }

  changePassword(): void {
    this.submitted = true;
    if (this.passwordForm.invalid || this.loading) return;
    this.loading = true;

    this.http.patch(`${environment.apiUrl}/users/me/password`, this.passwordForm.getRawValue()).subscribe({
      next: () => {
        this.loading = false;
        this.submitted = false;
        this.passwordForm.reset();
        this.snack.open('✅ Mot de passe mis à jour', 'Fermer',
          { duration: 3000, panelClass: 'snack-success', horizontalPosition: 'center', verticalPosition: 'top' });
      },
      error: (err: HttpErrorResponse) => {
        this.loading = false;
        const msg = err.error?.error ?? 'Erreur lors du changement de mot de passe.';
        this.snack.open(msg, 'Fermer',
          { duration: 4000, panelClass: 'snack-error', horizontalPosition: 'center', verticalPosition: 'top' });
      }
    });
  }

  isInvalid(field: string): boolean {
    const c = this.passwordForm.get(field);
    return !!(c?.invalid && (c.touched || this.submitted));
  }
}
