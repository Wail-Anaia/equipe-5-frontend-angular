import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { StatsService, EncadrantStats } from '../../../core/services/stats.service';
import { AuthService } from '../../../core/auth/auth.service';

@Component({
  selector: 'app-encadrant-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, MatIconModule],
  templateUrl: './encadrant-dashboard.html',
  styleUrls: ['./encadrant-dashboard.scss']
})
export class EncadrantDashboard implements OnInit {

  private statsService = inject(StatsService);
  auth = inject(AuthService);

  loading = true;
  stats: EncadrantStats | null = null;

  private readonly demoStats: EncadrantStats = {
    supervisedProjects: [
      { id: 1, titre: 'Plateforme e-learning IA',        statut: 'EN_COURS',   updatedAt: '2024-03-10' },
      { id: 2, titre: 'Système de recommandation NLP',    statut: 'EN_ATTENTE', updatedAt: '2024-03-07' },
      { id: 3, titre: 'Dashboard analyse données',         statut: 'VALIDE',     updatedAt: '2024-02-28' },
      { id: 4, titre: 'Application mobile santé',          statut: 'EN_COURS',   updatedAt: '2024-02-25' },
    ],
    followedStudents: [
      { id: 1, nom: 'Yasmine Benhaddou', email: 'y.benhaddou@etu.ma', projet: 'Plateforme e-learning IA' },
      { id: 2, nom: 'Omar Zouheir',      email: 'o.zouheir@etu.ma',   projet: 'Système de recommandation NLP' },
      { id: 3, nom: 'Sara Alami',        email: 's.alami@etu.ma',      projet: 'Dashboard analyse données' },
      { id: 4, nom: 'Amine Benali',      email: 'a.benali@etu.ma',     projet: 'Application mobile santé' },
    ],
    pendingReviews: 2
  };

  ngOnInit(): void {
    this.statsService.getEncadrantStats().subscribe({
      next:  (data) => { this.stats = data; this.loading = false; },
      error: ()     => { this.stats = this.demoStats; this.loading = false; }
    });
  }

  getStatutClass(statut: string): string {
    const map: Record<string, string> = {
      EN_COURS:   'status--active',
      EN_ATTENTE: 'status--pending',
      TERMINE:    'status--done',
      VALIDE:     'status--validated',
    };
    return map[statut] ?? 'status--pending';
  }

  getStatutLabel(statut: string): string {
    const map: Record<string, string> = {
      EN_COURS: 'En cours', EN_ATTENTE: 'En attente',
      TERMINE: 'Terminé', VALIDE: 'Validé'
    };
    return map[statut] ?? statut;
  }

  getInitials(nom: string): string {
    const parts = nom.trim().split(' ');
    if (parts.length >= 2) return parts[0][0] + parts[1][0];
    return nom.substring(0, 2).toUpperCase();
  }
}
