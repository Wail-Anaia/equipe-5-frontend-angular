import {
  Component, OnInit, OnDestroy, inject
} from '@angular/core';
import { CommonModule }    from '@angular/common';
import { RouterLink }      from '@angular/router';
import { MatIconModule }   from '@angular/material/icon';
import { Subject, takeUntil, finalize } from 'rxjs';

import { StatsService }    from '../../../core/services/stats.service';
import { AuthService }     from '../../../core/auth/auth.service';
import { EncadrantStats }  from '../../../core/models/api.models';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner';

@Component({
  selector: 'app-encadrant-dashboard',
  standalone: true,
  imports: [
    CommonModule, RouterLink,
    MatIconModule, LoadingSpinnerComponent
  ],
  templateUrl: './encadrant-dashboard.html',
  styleUrls:  ['./encadrant-dashboard.scss']
})
export class EncadrantDashboardComponent implements OnInit, OnDestroy {

  private statsService = inject(StatsService);
  private destroy$     = new Subject<void>();
  auth                 = inject(AuthService);

  // ── State ─────────────────────────────────────────
  loading = true;
  error: string | null = null;
  stats: EncadrantStats | null = null;

  // ── Demo mode signal ──────────────────────────────
  readonly demoMode = this.statsService.demoMode;

  // ── Données démo fallback ─────────────────────────
  private readonly demoStats: EncadrantStats = {
    supervisedProjects: [
      { id: 1, titre: 'Plateforme e-learning IA',      statut: 'EN_COURS',   updatedAt: '2025-03-10' },
      { id: 2, titre: 'Système de recommandation NLP',  statut: 'EN_ATTENTE', updatedAt: '2025-03-07' },
      { id: 3, titre: 'Dashboard analyse données',       statut: 'VALIDE',     updatedAt: '2025-02-28' },
      { id: 4, titre: 'Application mobile santé',        statut: 'EN_COURS',   updatedAt: '2025-02-25' },
    ],
    followedStudents: [
      { id: 1, nom: 'Yasmine Benhaddou', email: 'y.benhaddou@etu.ma', projet: 'Plateforme e-learning IA' },
      { id: 2, nom: 'Omar Zouheir',      email: 'o.zouheir@etu.ma',   projet: 'Système de recommandation NLP' },
      { id: 3, nom: 'Sara Alami',        email: 's.alami@etu.ma',      projet: 'Dashboard analyse données' },
      { id: 4, nom: 'Amine Benali',      email: 'a.benali@etu.ma',     projet: 'Application mobile santé' },
    ],
    pendingReviews: 2
  };

  // ── Lifecycle ─────────────────────────────────────
  ngOnInit(): void {
    this.loadStats();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ── Load depuis API ───────────────────────────────
  loadStats(): void {
    this.loading = true;
    this.error   = null;

    this.statsService.getEncadrantStats()
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.loading = false)
      )
      .subscribe({
        next:  data => { this.stats = data; },
        error: ()   => { this.stats = this.demoStats; }
      });
  }

  // ── Helpers statut ────────────────────────────────
  getStatutClass(statut: string): string {
    return ({
      EN_COURS:   'status--active',
      EN_ATTENTE: 'status--pending',
      TERMINE:    'status--done',
      VALIDE:     'status--validated',
      REJETE:     'status--rejected',
    } as Record<string, string>)[statut] ?? 'status--pending';
  }

  getStatutLabel(statut: string): string {
    return ({
      EN_COURS:   'En cours',
      EN_ATTENTE: 'En attente',
      TERMINE:    'Terminé',
      VALIDE:     'Validé',
      REJETE:     'Rejeté'
    } as Record<string, string>)[statut] ?? statut;
  }

  // ── Initiales avatar ──────────────────────────────
  getInitials(nom: string): string {
    const parts = nom.trim().split(' ');
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return nom.substring(0, 2).toUpperCase();
  }

  // ── Couleur avatar par index ──────────────────────
  getAvatarColor(index: number): string {
    const colors = ['#10b981', '#6C63FF', '#f59e0b', '#3b82f6', '#ef4444', '#8b5cf6'];
    return colors[index % colors.length];
  }

  // ── Compteurs par statut ──────────────────────────
  countByStatus(statut: string): number {
    return this.stats?.supervisedProjects
      .filter(p => p.statut === statut).length ?? 0;
  }
}
