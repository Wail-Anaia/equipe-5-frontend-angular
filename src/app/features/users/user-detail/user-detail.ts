import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { MatIconModule }   from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

interface UserDetail {
  id: number;
  nom: string;
  email: string;
  role: 'ADMIN' | 'ENCADRANT' | 'ETUDIANT';
  actif: boolean;
  createdAt: string;
  updatedAt: string;
}

@Component({
  selector: 'app-user-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, MatIconModule, MatSnackBarModule],
  templateUrl: './user-detail.html',
  styleUrls: ['./user-detail.scss']
})
export class UserDetailComponent implements OnInit {

  private route  = inject(ActivatedRoute);
  private http   = inject(HttpClient);
  private router = inject(Router);
  private snack  = inject(MatSnackBar);

  user: UserDetail | null = null;
  loading = true;
  toggling = false;

  private readonly demoUser: UserDetail = {
    id: 1, nom: 'Yasmine Benhaddou', email: 'y.benhaddou@etu.ma',
    role: 'ETUDIANT', actif: true,
    createdAt: '2024-02-01T10:00:00', updatedAt: '2024-03-10T14:30:00'
  };

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    this.http.get<UserDetail>(`/api/users/${id}`).subscribe({
      next:  u  => { this.user = u; this.loading = false; },
      error: () => { this.user = this.demoUser; this.loading = false; }
    });
  }

  toggleStatus(): void {
    if (!this.user || this.toggling) return;
    this.toggling = true;
    const newStatus = !this.user.actif;

    this.http.patch(`/api/users/${this.user.id}/status`, { actif: newStatus }).subscribe({
      next: () => {
        this.user!.actif = newStatus;
        this.toggling = false;
        const msg = newStatus ? `✅ Compte activé` : `⏸ Compte désactivé`;
        this.snack.open(msg, 'Fermer', { duration: 3000, panelClass: newStatus ? 'snack-success' : 'snack-info' });
      },
      error: () => {
        this.toggling = false;
        this.snack.open('Erreur lors de la mise à jour', 'Fermer', { duration: 3000, panelClass: 'snack-error' });
      }
    });
  }

  getRoleClass(): string {
    if (!this.user) return '';

    const roleMap: Record<UserDetail['role'], string> = {
      ADMIN: 'role--admin',
      ENCADRANT: 'role--encadrant',
      ETUDIANT: 'role--etudiant'
    };

    return roleMap[this.user.role];
  }

  getInitials(): string {
    const parts = (this.user?.nom ?? '').trim().split(' ');
    return parts.length >= 2 ? parts[0][0] + parts[1][0] : (this.user?.nom ?? 'U').substring(0, 2).toUpperCase();
  }
}
