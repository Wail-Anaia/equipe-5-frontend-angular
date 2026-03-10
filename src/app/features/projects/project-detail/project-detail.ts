import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MatIconModule }   from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ProjectService, ProjectResponse, StatutProjet } from '../../../core/services/project.service';
import { AuthService } from '../../../core/auth/auth.service';

@Component({
  selector: 'app-project-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, MatIconModule, MatSnackBarModule],
  templateUrl: './project-detail.html',
  styleUrls:   ['./project-detail.scss']
})
export class ProjectDetailComponent implements OnInit {

  private route = inject(ActivatedRoute);
  private svc   = inject(ProjectService);
  private snack = inject(MatSnackBar);
  readonly auth = inject(AuthService);

  project: ProjectResponse | null = null;
  loading  = true;

  private readonly demo: ProjectResponse = {
    id: 1,
    titre: 'Plateforme e-learning IA',
    description: 'Développement d\'une plateforme d\'apprentissage en ligne intégrant des algorithmes d\'intelligence artificielle pour la personnalisation du parcours pédagogique des étudiants.',
    technologies: 'Angular 17, Spring Boot 3, TensorFlow, PostgreSQL',
    statut: 'EN_COURS',
    encadrant: { id:2, nom:'Prof. Karim Idrissi', email:'k.idrissi@university.ma' },
    team: { id:1, nom:'Team Alpha' },
    createdAt: '2024-01-15T09:00:00',
    updatedAt: '2024-03-10T14:30:00',
  };

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.svc.getById(id).subscribe({
      next:  p  => { this.project = p;        this.loading = false; },
      error: () => { this.project = this.demo; this.loading = false; }
    });
  }

  changeStatut(s: StatutProjet): void {
    if (!this.project) return;
    const prev = this.project.statut;
    this.project.statut = s;   // optimistic update

    this.svc.update(this.project.id, {
      titre:        this.project.titre,
      description:  this.project.description,
      technologies: this.project.technologies ?? undefined,
      encadrantId:  this.project.encadrant?.id,
      teamId:       this.project.team?.id,
      statut:       s,
    }).subscribe({
      next:  p  => { this.project = p; this.snack.open(`✅ Statut mis à jour → ${this.svc.statutLabel(s)}`, 'Fermer', { duration: 3000 }); },
      error: () => { this.project!.statut = prev; this.snack.open('Erreur mise à jour', 'Fermer', { duration: 3000, panelClass: 'snack-error' }); }
    });
  }

  label(s: string): string { return this.svc.statutLabel(s as StatutProjet); }
  css(s: string):   string { return this.svc.statutClass(s as StatutProjet); }
  dot(s: string):   string { return this.svc.statutDotColor(s as StatutProjet); }
  techs(): string[]        { return (this.project?.technologies ?? '').split(',').map(t => t.trim()).filter(Boolean); }

  readonly allStatuts: StatutProjet[] = ['EN_ATTENTE', 'EN_COURS', 'TERMINE', 'VALIDE'];
}
