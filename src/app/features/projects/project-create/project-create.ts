import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

@Component({
  selector: 'app-project-create',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, MatIconModule, MatSnackBarModule],
  templateUrl: './project-create.html',
  styleUrls: ['./project-create.scss']
})
export class ProjectCreate {

  private fb     = inject(FormBuilder);
  private http   = inject(HttpClient);
  private router = inject(Router);
  private snack  = inject(MatSnackBar);

  loading   = false;
  submitted = false;

  form = this.fb.nonNullable.group({
    titre:       ['', [Validators.required, Validators.minLength(5), Validators.maxLength(200)]],
    description: ['', [Validators.required, Validators.minLength(20)]],
  });

  submit(): void {
    this.submitted = true;
    if (this.form.invalid || this.loading) return;
    this.loading = true;

    this.http.post('/api/projects', this.form.getRawValue()).subscribe({
      next: (p: any) => {
        this.loading = false;
        this.snack.open(`✅ Projet « ${p?.titre ?? this.form.value.titre} » créé`, 'Fermer',
          { duration: 4000, panelClass: 'snack-success', horizontalPosition: 'center', verticalPosition: 'top' });
        this.router.navigate(['/projects']);
      },
      error: (err: HttpErrorResponse) => {
        this.loading = false;
        const msg = err.error?.error ?? 'Erreur lors de la création du projet.';
        this.snack.open(msg, 'Fermer',
          { duration: 4000, panelClass: 'snack-error', horizontalPosition: 'center', verticalPosition: 'top' });
      }
    });
  }

  isInvalid(field: string): boolean {
    const c = this.form.get(field);
    return !!(c?.invalid && (c.touched || this.submitted));
  }

  getError(field: string): string {
    const c = this.form.get(field);
    if (!c?.errors) return '';
    if (c.errors['required'])   return 'Ce champ est obligatoire';
    if (c.errors['minlength'])  return `Minimum ${c.errors['minlength'].requiredLength} caractères`;
    if (c.errors['maxlength'])  return `Maximum ${c.errors['maxlength'].requiredLength} caractères`;
    return 'Valeur invalide';
  }
}
