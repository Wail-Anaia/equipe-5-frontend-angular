import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { MatIconModule }                from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

type Role = 'ADMIN' | 'ENCADRANT' | 'ETUDIANT';

@Component({
  selector: 'app-create-user',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    MatIconModule,
    MatSnackBarModule
  ],
  templateUrl: './create-user.html',
  styleUrls: ['./create-user.scss']
})
export class CreateUser {

  private fb     = inject(FormBuilder);
  private http   = inject(HttpClient);
  private router = inject(Router);
  private snack  = inject(MatSnackBar);

  loading      = false;
  hidePassword = true;
  submitted    = false;

  readonly roles: { value: Role; label: string; icon: string; desc: string }[] = [
    { value: 'ETUDIANT',  label: 'Étudiant',   icon: 'school',               desc: 'Accès limité à ses projets et documents' },
    { value: 'ENCADRANT', label: 'Encadrant',  icon: 'supervisor_account',   desc: 'Encadre et suit les projets étudiants'   },
    { value: 'ADMIN',     label: 'Admin',      icon: 'admin_panel_settings', desc: 'Accès complet à la plateforme'           },
  ];

  form = this.fb.nonNullable.group({
    nom:      ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
    email:    ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    role:     ['ETUDIANT' as Role, Validators.required]
  });

  submit(): void {
    this.submitted = true;
    if (this.form.invalid || this.loading) return;

    this.loading = true;

    this.http.post('/api/users', this.form.getRawValue()).subscribe({
      next: (user: any) => {
        this.loading = false;
        this.snack.open(
          `✅ Compte créé pour ${user?.nom ?? this.form.value.nom}`,
          'Fermer',
          { duration: 5000, panelClass: 'snack-success', horizontalPosition: 'center', verticalPosition: 'top' }
        );
        this.router.navigate(['/users']);
      },
      error: (err: HttpErrorResponse) => {
        this.loading = false;
        const msg = err.error?.error
          ?? Object.values(err.error?.details ?? {}).join(' | ')
          ?? 'Erreur lors de la création.';
        this.snack.open(msg, 'Fermer', {
          duration: 5000, panelClass: 'snack-error',
          horizontalPosition: 'center', verticalPosition: 'top'
        });
      }
    });
  }

  isInvalid(field: string): boolean {
    const ctrl = this.form.get(field);
    return !!(ctrl?.invalid && (ctrl?.touched || this.submitted));
  }

  getError(field: string): string {
    const ctrl = this.form.get(field);
    if (!ctrl?.errors) return '';
    if (ctrl.errors['required'])  return 'Ce champ est obligatoire';
    if (ctrl.errors['email'])     return "Format d'email invalide";
    if (ctrl.errors['minlength']) return `Minimum ${ctrl.errors['minlength'].requiredLength} caractères`;
    if (ctrl.errors['maxlength']) return `Maximum ${ctrl.errors['maxlength'].requiredLength} caractères`;
    return 'Valeur invalide';
  }

  selectRole(role: Role): void {
    this.form.patchValue({ role });
  }

  get passwordStrength(): number {
    const pw = this.form.get('password')?.value ?? '';
    let score = 0;
    if (pw.length >= 6)           score++;
    if (pw.length >= 10)          score++;
    if (/[A-Z]/.test(pw))         score++;
    if (/[0-9]/.test(pw))         score++;
    if (/[^A-Za-z0-9]/.test(pw))  score++;
    return score;
  }

  get passwordStrengthLabel(): string {
    const s = this.passwordStrength;
    if (s <= 1) return 'Faible';
    if (s <= 3) return 'Moyen';
    return 'Fort';
  }

  get passwordStrengthClass(): string {
    const s = this.passwordStrength;
    if (s <= 1) return 'strength--weak';
    if (s <= 3) return 'strength--medium';
    return 'strength--strong';
  }
}
