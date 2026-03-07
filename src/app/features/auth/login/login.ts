import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { MatCardModule }            from '@angular/material/card';
import { MatFormFieldModule }       from '@angular/material/form-field';
import { MatInputModule }           from '@angular/material/input';
import { MatButtonModule }          from '@angular/material/button';
import { MatIconModule }            from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { AuthService } from '../../../core/auth/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule,
    MatCardModule, MatFormFieldModule, MatInputModule,
    MatButtonModule, MatIconModule,
    MatProgressSpinnerModule, MatSnackBarModule
  ],
  templateUrl: './login.html',
  styleUrls: ['./login.scss']
})
export class Login {

  private fb     = inject(FormBuilder);
  private auth   = inject(AuthService);
  private router = inject(Router);
  private snack  = inject(MatSnackBar);

  loading      = false;
  hidePassword = true;
  loginAttempts = 0;

  form = this.fb.nonNullable.group({
    email:    ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]]
  });

  submit(): void {
    if (this.form.invalid || this.loading) return;

    this.loading = true;
    const { email, password } = this.form.getRawValue();

    this.auth.login(email, password).subscribe({
      next: () => {
        this.loading = false;
        this.router.navigate(['/dashboard']);
      },
      error: (err: HttpErrorResponse) => {
        this.loading = false;
        this.loginAttempts++;
        const msg = err.error?.error
          ?? (err.status === 401 ? 'Email ou mot de passe incorrect.' : 'Erreur de connexion.');
        this.snack.open(msg, 'Fermer', {
          duration: 4000,
          panelClass: 'snack-error',
          horizontalPosition: 'center',
          verticalPosition: 'top'
        });
      }
    });
  }

  hasError(field: string, error: string): boolean {
    const ctrl = this.form.get(field);
    return !!(ctrl?.hasError(error) && (ctrl?.dirty || ctrl?.touched));
  }
}
