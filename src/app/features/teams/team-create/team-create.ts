import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { TeamService, TeamResponse } from '../../../core/services/team.service';
import { environment } from '../../../../environments/environment';

interface UserOption { id: number; nom: string; email: string; }

@Component({
  selector: 'app-team-create',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, MatIconModule, MatSnackBarModule],
  templateUrl: './team-create.html',
  styleUrls:   ['./team-create.scss']
})
export class TeamCreateComponent implements OnInit {

  private fb     = inject(FormBuilder);
  private svc    = inject(TeamService);
  private http   = inject(HttpClient);
  private router = inject(Router);
  private snack  = inject(MatSnackBar);

  loading   = false;
  submitted = false;
  students: UserOption[] = [];
  selected: Set<number> = new Set();

  form = this.fb.nonNullable.group({
    nom: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
  });

  ngOnInit(): void {
    this.http.get<any>(`${environment.apiUrl}/users?size=200`).subscribe({
      next: res => this.students = ((res.content ?? res) as any[]).filter((u: any) => u.role === 'ETUDIANT'),
      error: () => this.students = [
        { id:3, nom:'Yasmine Benhaddou', email:'y.benhaddou@etu.ma' },
        { id:4, nom:'Omar Zouheir',      email:'o.zouheir@etu.ma'   },
        { id:5, nom:'Sara Alami',        email:'s.alami@etu.ma'     },
        { id:6, nom:'Amine Benali',      email:'a.benali@etu.ma'    },
      ]
    });
  }

  toggle(id: number): void { this.selected.has(id) ? this.selected.delete(id) : this.selected.add(id); }
  isSelected(id: number): boolean { return this.selected.has(id); }

  submit(): void {
    this.submitted = true;
    if (this.form.invalid || this.loading) return;
    this.loading = true;
    this.svc.create({ nom: this.form.getRawValue().nom }).subscribe({
      next: (team: TeamResponse) => {
        const members = Array.from(this.selected);
        if (members.length === 0) { this.done(team.nom); return; }
        let cnt = 0;
        members.forEach(uid => this.svc.addMember(team.id, uid).subscribe({
          next: () => { cnt++; if (cnt === members.length) this.done(team.nom); },
          error: () => { cnt++; if (cnt === members.length) this.done(team.nom); }
        }));
      },
      error: () => {
        this.loading = false;
        this.snack.open('Erreur creation equipe', 'Fermer', { duration: 4000, panelClass: 'snack-error' });
      }
    });
  }

  private done(nom: string): void {
    this.loading = false;
    this.snack.open('Equipe ' + nom + ' creee', 'Fermer', { duration: 4000, panelClass: 'snack-success', horizontalPosition: 'center', verticalPosition: 'top' });
    this.router.navigate(['/teams']);
  }

  isInvalid(f: string): boolean { const c = this.form.get(f); return !!(c?.invalid && (c.touched || this.submitted)); }
  getError(f: string): string {
    const c = this.form.get(f);
    if (!c?.errors) return '';
    if (c.errors['required'])  return 'Champ obligatoire';
    if (c.errors['minlength']) return 'Minimum ' + c.errors['minlength'].requiredLength + ' caracteres';
    if (c.errors['maxlength']) return 'Maximum ' + c.errors['maxlength'].requiredLength + ' caracteres';
    return 'Valeur invalide';
  }
  initials(nom: string): string { const p = nom.trim().split(' '); return p.length >= 2 ? p[0][0] + p[1][0] : nom.substring(0,2).toUpperCase(); }
}
