import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { MatCardModule }       from '@angular/material/card';
import { MatFormFieldModule }  from '@angular/material/form-field';
import { MatInputModule }      from '@angular/material/input';
import { MatSelectModule }     from '@angular/material/select';
import { MatButtonModule }     from '@angular/material/button';
import { MatIconModule }       from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Role, CreateUserRequest, UserResponse } from '../../../core/auth/auth.model';

@Component({
  selector: 'app-create-user',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule,
    MatCardModule, MatFormFieldModule, MatInputModule, MatSelectModule,
    MatButtonModule, MatIconModule, MatSnackBarModule, MatProgressSpinnerModule
  ],
  templateUrl: './create-user.html',
  styleUrl: './create-user.scss'
})
export class CreateUser {

  private fb    = inject(FormBuilder);
  private http  = inject(HttpClient);
  private snack = inject(MatSnackBar);

  loading      = false;
  hidePassword = true;

  readonly roles: Role[] = ['ADMIN', 'ENCADRANT', 'ETUDIANT'];

  form = this.fb.nonNullable.group({
    nom:      ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
    email:    ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    role:     ['ETUDIANT' as Role, Validators.required]
  });

  submit(): void {
    if (this.form.invalid || this.loading) return;

    this.loading = true;
    const payload: CreateUserRequest = this.form.getRawValue();

    this.http.post<UserResponse>('/api/users', payload).subscribe({
      next: (user) => {
        this.loading = false;
        this.snack.open(
          `Compte créé pour ${user.nom} (${user.role})`,
          'Fermer', { duration: 5000, panelClass: 'snack-success' }
        );
        this.form.reset({ role: 'ETUDIANT' });
      },
      error: (err: HttpErrorResponse) => {
        this.loading = false;
        const msg = err.error?.error
          ?? Object.values(err.error?.details ?? {}).join(' | ')
          ?? 'Erreur lors de la création.';
        this.snack.open(msg, 'Fermer', { duration: 5000, panelClass: 'snack-error' });
      }
    });
  }

  isInvalid(field: string): boolean {
    const ctrl = this.form.get(field);
    return !!(ctrl?.invalid && ctrl?.touched);
  }
}
