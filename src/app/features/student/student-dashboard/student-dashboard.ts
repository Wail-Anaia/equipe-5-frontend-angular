import {
  Component, OnInit, OnDestroy, inject
} from '@angular/core';
import { CommonModule }      from '@angular/common';
import { RouterLink }        from '@angular/router';
import { MatIconModule }     from '@angular/material/icon';
import { MatChipsModule }    from '@angular/material/chips';
import { Subject, takeUntil, finalize } from 'rxjs';

import { StatsService }      from '../../../core/services/stats.service';
import { DocumentService }   from '../../../core/services/document.service';
import { ProjectService }    from '../../../core/services/project.service';
import { AuthService }       from '../../../core/auth/auth.service';
import { StudentStats }      from '../../../core/models/api.models';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner';

@Component({
  selector: 'app-student-dashboard',
  standalone: true,
  imports: [
    CommonModule, RouterLink,
    MatIconModule, MatChipsModule,
    LoadingSpinnerComponent
  ],
  templateUrl: './student-dashboard.html',
  styleUrls:  ['./student-dashboard.scss']
})
export class StudentDashboardComponent implements OnInit, OnDestroy {

  private statsService    = inject(StatsService);
  private destroy$        = new Subject<void>();
  auth                    = inject(AuthService);

  // ── State ─────────────────────────────────────────
  loading  = true;
  error: string | null = null;
  stats:   StudentStats | null = null;

  // ── Demo mode signal ──────────────────────────────
  readonly demoMode = this.statsService.demoMode;

  // ── Données démo fallback ─────────────────────────
  private readonly demoStats: StudentStats = {
    myProjects: [
      { id: 1, titre: 'Plateforme e-learning IA',   statut: 'EN_COURS',   updatedAt: '2025-03-10' },
      { id: 2, titre: 'Application mobile PFE',      statut: 'EN_ATTENTE', updatedAt: '2025-03-08' },
    ],
    encadrant: {
      id:        1,
      nom:       'Prof. Karim Idrissi',
      email:     'k.idrissi@university.ma',
      specialite: 'Intelligence Artificielle'
    },
    documents: [
      { id: 1, nom: 'Cahier des charges v2.pdf',       type: 'PDF',  uploadedAt: '2025-03-05' },
      { id: 2, nom: 'Rapport d\'avancement.docx',      type: 'DOCX', uploadedAt: '2025-02-28' },
      { id: 3, nom: 'Présentation soutenance.pptx',    type: 'PPTX', uploadedAt: '2025-02-20' },
    ]
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

    this.statsService.getStudentStats()
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.loading = false)
      )
      .subscribe({
        next:  data => { this.stats = data; },
        error: ()   => {
          // Fallback démo si API indisponible
          this.stats = this.demoStats;
        }
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
      EN_COURS: 'En cours', EN_ATTENTE: 'En attente',
      TERMINE:  'Terminé',  VALIDE:     'Validé',
      REJETE:   'Rejeté'
    } as Record<string, string>)[statut] ?? statut;
  }

  // ── Helpers document ──────────────────────────────
  getDocIcon(type: string): string {
    return ({
      PDF:  'picture_as_pdf',
      DOCX: 'description',
      PPTX: 'slideshow',
      XLSX: 'table_chart',
      ZIP:  'folder_zip',
    } as Record<string, string>)[type] ?? 'insert_drive_file';
  }

  getDocColor(type: string): string {
    return ({
      PDF:  '#ef4444',
      DOCX: '#3b82f6',
      PPTX: '#f59e0b',
      XLSX: '#10b981',
      ZIP:  '#8b5cf6',
    } as Record<string, string>)[type] ?? '#64748b';
  }

  // ── Progress bar pour les projets ─────────────────
  getProgressValue(statut: string): number {
    return ({
      EN_ATTENTE: 10,
      EN_COURS:   55,
      TERMINE:    85,
      VALIDE:    100,
      REJETE:      0,
    } as Record<string, number>)[statut] ?? 0;
  }
}
