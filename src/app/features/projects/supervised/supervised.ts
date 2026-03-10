import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule }  from '@angular/forms';
import { RouterLink }   from '@angular/router';
import { MatIconModule }    from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ProjectService, ProjectResponse, StatutProjet } from '../../../core/services/project.service';

@Component({
  selector: 'app-supervised',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, MatIconModule, MatTooltipModule],
  templateUrl: './supervised.html',
  styleUrls:   ['./supervised.scss']
})
export class SupervisedComponent implements OnInit {

  private svc = inject(ProjectService);

  projects:    ProjectResponse[] = [];
  loading      = true;
  search       = '';
  filterStatut = 'ALL';

  readonly statutOptions = [
    { value: 'ALL',        label: 'Tous'       },
    { value: 'EN_COURS',   label: 'En cours'   },
    { value: 'EN_ATTENTE', label: 'En attente' },
    { value: 'VALIDE',     label: 'Validé'     },
    { value: 'TERMINE',    label: 'Terminé'    },
  ];

  private readonly demo: ProjectResponse[] = [
    { id:1, titre:'Plateforme e-learning IA',       description:'IA pédagogique.',           technologies:'Angular, Spring Boot', statut:'EN_COURS',   encadrant:{id:2,nom:'Prof. Karim Idrissi',email:'k.idrissi@university.ma'}, team:{id:1,nom:'Team Alpha'}, createdAt:'2024-01-15', updatedAt:'2024-03-10' },
    { id:2, titre:'Système de recommandation NLP',  description:'NLP recommandation.',        technologies:'Python, BERT',         statut:'EN_ATTENTE', encadrant:{id:2,nom:'Prof. Karim Idrissi',email:'k.idrissi@university.ma'}, team:null,                   createdAt:'2024-01-20', updatedAt:'2024-03-07' },
    { id:3, titre:'Dashboard analyse données',      description:'Tableau de bord académique.',technologies:'React, D3.js',         statut:'VALIDE',     encadrant:{id:2,nom:'Prof. Karim Idrissi',email:'k.idrissi@university.ma'}, team:{id:2,nom:'Team Beta'},  createdAt:'2024-01-10', updatedAt:'2024-02-28' },
    { id:4, titre:'Application mobile santé',       description:'Santé mobile.',               technologies:'Flutter, Firebase',    statut:'EN_COURS',   encadrant:{id:2,nom:'Prof. Karim Idrissi',email:'k.idrissi@university.ma'}, team:null,                   createdAt:'2024-02-01', updatedAt:'2024-02-25' },
  ];

  ngOnInit(): void {
    this.svc.getSupervisedProjects().subscribe({
      next:  ps => { this.projects = ps;         this.loading = false; },
      error: ()  => { this.projects = this.demo; this.loading = false; }
    });
  }

  get filtered(): ProjectResponse[] {
    const q = this.search.toLowerCase();
    return this.projects.filter(p =>
      (!q || p.titre.toLowerCase().includes(q))
      && (this.filterStatut === 'ALL' || p.statut === this.filterStatut)
    );
  }

  label(s: string): string  { return this.svc.statutLabel(s as StatutProjet); }
  css(s: string):   string  { return this.svc.statutClass(s as StatutProjet); }
  dot(s: string):   string  { return this.svc.statutDotColor(s as StatutProjet); }
  techs(t: string | null): string[] { return (t ?? '').split(',').map(x => x.trim()).filter(Boolean).slice(0, 3); }

  count(s: string): number { return this.projects.filter(p => p.statut === s).length; }
}
