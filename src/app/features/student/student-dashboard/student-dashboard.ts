import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatIconModule }  from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { StatsService, StudentStats } from '../../../core/services/stats.service';
import { AuthService } from '../../../core/auth/auth.service';

@Component({
  selector: 'app-student-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, MatIconModule, MatChipsModule],
  templateUrl: './student-dashboard.html',
  styleUrls: ['./student-dashboard.scss']
})
export class StudentDashboard implements OnInit {

  private statsService = inject(StatsService);
  auth = inject(AuthService);

  loading = true;
  stats: StudentStats | null = null;

  // Données démo
  readonly demoStats: StudentStats = {
    myProjects: [
      { id: 1, titre: 'Plateforme e-learning IA', statut: 'EN_COURS',  updatedAt: '2024-03-10' },
      { id: 2, titre: 'Application mobile PFE',  statut: 'EN_ATTENTE', updatedAt: '2024-03-08' },
    ],
    encadrant: {
      id: 1,
      nom: 'Prof. Karim Idrissi',
      email: 'k.idrissi@university.ma',
      specialite: 'Intelligence Artificielle'
    },
    documents: [
      { id: 1, nom: 'Cahier des charges v2.pdf', type: 'PDF',  uploadedAt: '2024-03-05' },
      { id: 2, nom: 'Rapport d\'avancement.docx', type: 'DOCX', uploadedAt: '2024-02-28' },
      { id: 3, nom: 'Présentation soutenance.pptx', type: 'PPTX', uploadedAt: '2024-02-20' },
    ]
  };

  ngOnInit(): void {
    this.statsService.getStudentStats().subscribe({
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
      EN_COURS:   'En cours',
      EN_ATTENTE: 'En attente',
      TERMINE:    'Terminé',
      VALIDE:     'Validé',
    };
    return map[statut] ?? statut;
  }

  getDocIcon(type: string): string {
    const map: Record<string, string> = {
      PDF:  'picture_as_pdf',
      DOCX: 'description',
      PPTX: 'slideshow',
    };
    return map[type] ?? 'insert_drive_file';
  }

  getDocColor(type: string): string {
    const map: Record<string, string> = {
      PDF:  '#ef4444',
      DOCX: '#3b82f6',
      PPTX: '#f59e0b',
    };
    return map[type] ?? '#64748b';
  }
}
