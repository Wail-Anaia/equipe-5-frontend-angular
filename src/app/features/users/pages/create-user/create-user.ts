import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { UserService } from '../../../../core/services/user-service';
import { Role } from '../../../../core/models/user.model';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-create-user',
  standalone: true,
  imports: [
      ReactiveFormsModule,
      CommonModule,
      MatFormFieldModule,
      MatInputModule,
      MatSelectModule,
      MatButtonModule,
      MatCardModule,
      MatProgressSpinnerModule,
      MatIconModule
    ],
  templateUrl: './create-user.html',
  styleUrls: ['./create-user.scss']
})
export class CreateUserComponent {

  private fb = inject(FormBuilder);
  private userService = inject(UserService);

  roles: Role[] = ['ADMIN', 'ENCADRANT', 'ETUDIANT']; // sync avec le backend
  loading = false;
  successMsg = '';
  errorMsg = '';

  form = this.fb.nonNullable.group({
    nom:      ['', [Validators.required, Validators.minLength(3)]],
    email:    ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    role:     ['ETUDIANT' as Role, Validators.required]
  });

  submit(): void {
    if (this.form.invalid || this.loading) return; // double-clic protection

    this.loading = true;
    this.successMsg = this.errorMsg = '';
    this.userService.create(this.form.getRawValue()).subscribe({
      next: () => {
        this.loading = false;
        this.successMsg = 'Utilisateur créé avec succès';
        this.form.reset({ role: 'ETUDIANT' }); // CA-3 : rôle par défaut
        setTimeout(() => this.successMsg = '', 3000);
      },
      error: (err: HttpErrorResponse) => {
        this.loading = false;
        // Lit le message métier retourné par GlobalExceptionHandler Spring
        this.errorMsg = err.error?.error ?? 'Erreur lors de la création. Réessayez.';
        setTimeout(() => this.errorMsg = '', 4000);
      }
    });
  }

  isInvalid(field: string): boolean {
    const ctrl = this.form.get(field);
    return !!(ctrl?.invalid && ctrl?.touched);
  }
}
