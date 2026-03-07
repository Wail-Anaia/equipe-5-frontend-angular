import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { MatIconModule }    from '@angular/material/icon';
import { MatButtonModule }  from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';

interface UserResponse {
  id: number;
  nom: string;
  email: string;
  role: 'ADMIN' | 'ENCADRANT' | 'ETUDIANT';
  actif: boolean;
  createdAt: string;
}

interface PageResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule,
            MatIconModule, MatButtonModule,
            MatTooltipModule, MatSnackBarModule, MatSlideToggleModule],
  templateUrl: './user-list.html',
  styleUrls: ['./user-list.scss']
})
export class UserList implements OnInit {

  private http  = inject(HttpClient);
  private snack = inject(MatSnackBar);

  users: UserResponse[] = [];
  loading  = true;
  search   = '';
  page     = 0;
  size     = 10;
  total    = 0;
  totalPages = 0;

  // Demo data fallback
  private readonly demoUsers: UserResponse[] = [
    { id: 1, nom: 'Super Admin',        email: 'admin@university.ma',   role: 'ADMIN',     actif: true,  createdAt: '2024-01-10' },
    { id: 2, nom: 'Prof. Karim Idrissi',email: 'k.idrissi@university.ma', role: 'ENCADRANT', actif: true,  createdAt: '2024-01-15' },
    { id: 3, nom: 'Yasmine Benhaddou', email: 'y.benhaddou@etu.ma',    role: 'ETUDIANT',  actif: true,  createdAt: '2024-02-01' },
    { id: 4, nom: 'Omar Zouheir',      email: 'o.zouheir@etu.ma',      role: 'ETUDIANT',  actif: true,  createdAt: '2024-02-03' },
    { id: 5, nom: 'Sara Alami',        email: 's.alami@etu.ma',        role: 'ETUDIANT',  actif: false, createdAt: '2024-02-10' },
    { id: 6, nom: 'Prof. Hind Nassiri',email: 'h.nassiri@university.ma', role: 'ENCADRANT', actif: true,  createdAt: '2024-01-20' },
  ];

  ngOnInit(): void { this.loadUsers(); }

  loadUsers(): void {
    this.loading = true;
    this.http.get<PageResponse<UserResponse>>(
      `/api/users?page=${this.page}&size=${this.size}`
    ).subscribe({
      next: (res) => {
        this.users      = res.content;
        this.total      = res.totalElements;
        this.totalPages = res.totalPages;
        this.loading    = false;
      },
      error: () => {
        this.users   = this.demoUsers;
        this.total   = this.demoUsers.length;
        this.loading = false;
      }
    });
  }

  toggleStatus(user: UserResponse): void {
    const newStatus = !user.actif;
    this.http.patch(`/api/users/${user.id}/status`, { actif: newStatus }).subscribe({
      next: () => {
        user.actif = newStatus;
        const msg = newStatus ? `✅ ${user.nom} activé` : `⏸ ${user.nom} désactivé`;
        this.snack.open(msg, 'Fermer', { duration: 3000, panelClass: newStatus ? 'snack-success' : 'snack-info' });
      },
      error: () => {
        this.snack.open('Erreur lors de la mise à jour', 'Fermer', { duration: 3000, panelClass: 'snack-error' });
      }
    });
  }

  get filteredUsers(): UserResponse[] {
    if (!this.search.trim()) return this.users;
    const q = this.search.toLowerCase();
    return this.users.filter(u =>
      u.nom.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      u.role.toLowerCase().includes(q)
    );
  }

  getRoleClass(role: string): string {
    return { ADMIN: 'role--admin', ENCADRANT: 'role--encadrant', ETUDIANT: 'role--etudiant' }[role] ?? '';
  }

  getInitials(nom: string): string {
    const p = nom.trim().split(' ');
    return p.length >= 2 ? p[0][0] + p[1][0] : nom.substring(0,2).toUpperCase();
  }

  prevPage(): void { if (this.page > 0) { this.page--; this.loadUsers(); } }
  nextPage(): void { if (this.page < this.totalPages - 1) { this.page++; this.loadUsers(); } }
}
