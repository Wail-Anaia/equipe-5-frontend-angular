import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink }   from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { ProjectService, ProjectResponse, StatutProjet } from '../../../core/services/project.service';

@Component({
  selector: 'app-my-projects',
  standalone: true,
  imports: [CommonModule, RouterLink, MatIconModule],
  templateUrl: './my-projects.html',
  styleUrls:   ['./my-projects.scss']
})
export class MyProjectsComponent implements OnInit {

  private svc = inject(ProjectService);

  projects: ProjectResponse[] = [];
  loading   = true;

  private readonly demo: ProjectResponse[] = [
    { id:1, titre:'Plateforme e-learning IA',  description:'Développement d\'une plateforme d\'apprentissage en ligne avec IA.',        technologies:'Angular, Spring Boot, TensorFlow', statut:'EN_COURS',   encadrant:{id:2,nom:'Prof. Karim Idrissi',email:'k.idrissi@university.ma'},  team:{id:1,nom:'Team Alpha'}, createdAt:'2024-01-15', updatedAt:'2024-03-10' },
    { id:2, titre:'Application mobile santé',  description:'Application mobile de suivi de santé permettant de gérer le bien-être.',     technologies:'Flutter, Firebase, Dart',          statut:'EN_ATTENTE', encadrant:{id:2,nom:'Prof. Karim Idrissi',email:'k.idrissi@university.ma'},  team:null,                   createdAt:'2024-02-01', updatedAt:'2024-03-08' },
  ];

  ngOnInit(): void {
    this.svc.getMyProjects().subscribe({
      next:  ps => { this.projects = ps;         this.loading = false; },
      error: ()  => { this.projects = this.demo; this.loading = false; }
    });
  }

  label(s: string): string { return this.svc.statutLabel(s as StatutProjet); }
  css(s: string):   string { return this.svc.statutClass(s as StatutProjet); }
  progress(s: StatutProjet): number { return ({ EN_ATTENTE:10, EN_COURS:55, TERMINE:85, VALIDE:100 } as Record<string, number>)[s] ?? 0; }
  techs(t: string | null): string[] { return (t ?? '').split(',').map(x => x.trim()).filter(Boolean).slice(0, 4); }
}
