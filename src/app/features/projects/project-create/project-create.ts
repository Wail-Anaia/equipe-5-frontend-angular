import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

interface UserRef  { id: number; nom: string; email: string; }
interface TeamRef  { id: number; nom: string; }

@Component({
  selector: 'app-project-create',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, MatIconModule, MatSnackBarModule],
  templateUrl: './project-create.html',
  styleUrls:   ['./project-create.scss']
})
export class ProjectCreateComponent implements OnInit {

  private fb     = inject(FormBuilder);
  private http   = inject(HttpClient);
  private router = inject(Router);
  private snack  = inject(MatSnackBar);

  loading      = false;
  submitted    = false;
  encadrants:  UserRef[] = [];
  teams:       TeamRef[] = [];

  form = this.fb.nonNullable.group({
    titre:        ['', [Validators.required, Validators.minLength(5), Validators.maxLength(200)]],
    description:  ['', [Validators.required, Validators.minLength(20)]],
    technologies: [''],
    encadrantId:  [null as number | null],
    teamId:       [null as number | null],
  });

  ngOnInit(): void {
    // Charger les encadrants disponibles
    this.http.get<any>('/api/users?role=ENCADRANT&size=100').subscribe({
      next: res => this.encadrants = (res.content ?? res) as UserRef[],
      error: ()  => this.encadrants = [
        { id:2, nom:'Prof. Karim Idrissi', email:'k.idrissi@university.ma' },
        { id:5, nom:'Prof. Hind Nassiri',  email:'h.nassiri@university.ma' },
      ]
    });
    // Charger les équipes
    this.http.get<TeamRef[]>('/api/teams').subscribe({
      next: ts => this.teams = ts,
      error: () => this.teams = [
        { id:1, nom:'Team Alpha' },
        { id:2, nom:'Team Beta'  },
      ]
    });
  }

  submit(): void {
    this.submitted = true;
    if (this.form.invalid || this.loading) return;
    this.loading = true;

    const raw = this.form.getRawValue();
    // Ne pas envoyer les champs null
    const body: Record<string, unknown> = {
      titre:       raw.titre,
      description: raw.description,
    };
    if (raw.technologies?.trim()) body['technologies'] = raw.technologies.trim();
    if (raw.encadrantId)          body['encadrantId']  = raw.encadrantId;
    if (raw.teamId)               body['teamId']       = raw.teamId;

    this.http.post<{ titre: string; id: number }>('/api/projects', body).subscribe({
      next: p => {
        this.loading = false;
        this.snack.open(`✅ Projet « ${p?.titre ?? raw.titre} » créé`, 'Fermer',
          { duration: 4000, panelClass: 'snack-success', horizontalPosition: 'center', verticalPosition: 'top' });
        this.router.navigate(['/projects']);
      },
      error: (err: HttpErrorResponse) => {
        this.loading = false;
        const msg = err.error?.error ?? err.error?.message ?? 'Erreur lors de la création.';
        this.snack.open(msg, 'Fermer', { duration: 4000, panelClass: 'snack-error', horizontalPosition: 'center', verticalPosition: 'top' });
      }
    });
  }

  isInvalid(f: string): boolean { const c = this.form.get(f); return !!(c?.invalid && (c.touched || this.submitted)); }
  getError(f: string): string {
    const c = this.form.get(f);
    if (!c?.errors) return '';
    if (c.errors['required'])   return 'Ce champ est obligatoire';
    if (c.errors['minlength'])  return `Minimum ${c.errors['minlength'].requiredLength} caractères`;
    if (c.errors['maxlength'])  return `Maximum ${c.errors['maxlength'].requiredLength} caractères`;
    return 'Valeur invalide';
  }
}
