import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { MatIconModule } from '@angular/material/icon';

type StatutProjet = 'EN_ATTENTE' | 'EN_COURS' | 'TERMINE' | 'VALIDE';

interface ProjectDetail {
  id: number;
  titre: string;
  description: string;
  statut: StatutProjet;
  etudiant: { id: number; nom: string; email: string };
  encadrant: { id: number; nom: string; email: string } | null;
  createdAt: string;
  updatedAt: string;
}

@Component({
  selector: 'app-project-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, MatIconModule],
  templateUrl: './project-detail.html',
  styleUrls: ['./project-detail.scss']
})
export class ProjectDetailComponent implements OnInit {

  private route = inject(ActivatedRoute);
  private http  = inject(HttpClient);

  project: ProjectDetail | null = null;
  loading = true;

  private readonly demo: ProjectDetail = {
    id: 1,
    titre: 'Plateforme e-learning IA',
    description: 'Développement d\'une plateforme d\'apprentissage en ligne intégrant des algorithmes d\'intelligence artificielle pour la personnalisation du parcours pédagogique.',
    statut: 'EN_COURS',
    etudiant:  { id: 3, nom: 'Yasmine Benhaddou', email: 'y.benhaddou@etu.ma' },
    encadrant: { id: 2, nom: 'Prof. Karim Idrissi', email: 'k.idrissi@university.ma' },
    createdAt: '2024-01-15T09:00:00',
    updatedAt: '2024-03-10T14:30:00',
  };

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    this.http.get<ProjectDetail>(`/api/projects/${id}`).subscribe({
      next:  p  => { this.project = p; this.loading = false; },
      error: () => { this.project = this.demo; this.loading = false; }
    });
  }

  getStatutClass(): string {
    if (!this.project) return '';

    const map: Record<StatutProjet, string> = {
      EN_COURS: 'status--active',
      EN_ATTENTE: 'status--pending',
      TERMINE: 'status--done',
      VALIDE: 'status--validated'
    };

    return map[this.project.statut];
  }

  getStatutLabel(): string {
    if (!this.project) return '';

    const map: Record<StatutProjet, string> = {
      EN_COURS: 'En cours',
      EN_ATTENTE: 'En attente',
      TERMINE: 'Terminé',
      VALIDE: 'Validé'
    };

    return map[this.project.statut];
  }
}
