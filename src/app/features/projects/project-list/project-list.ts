import { Component, OnInit, inject } from '@angular/core';
import { CommonModule }   from '@angular/common';
import { FormsModule }    from '@angular/forms';
import { RouterLink }     from '@angular/router';
import { MatIconModule }    from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ProjectService, ProjectResponse, StatutProjet } from '../../../core/services/project.service';

@Component({
  selector: 'app-project-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink,
            MatIconModule, MatTooltipModule, MatSnackBarModule],
  templateUrl: './project-list.html',
  styleUrls:   ['./project-list.scss']
})
export class ProjectListComponent implements OnInit {

  private svc   = inject(ProjectService);
  private snack = inject(MatSnackBar);

  projects:    ProjectResponse[] = [];
  loading      = true;
  search       = '';
  filterStatut = 'ALL';
  page         = 0;
  size         = 12;
  total        = 0;
  totalPages   = 0;

  readonly statutOptions = [
    { value: 'ALL',        label: 'Tous',        color: '#6C63FF' },
    { value: 'EN_COURS',   label: 'En cours',    color: '#10b981' },
    { value: 'EN_ATTENTE', label: 'En attente',  color: '#f59e0b' },
    { value: 'VALIDE',     label: 'Validé',      color: '#3b82f6' },
    { value: 'TERMINE',    label: 'Terminé',     color: '#8b5cf6' },
  ];

  private readonly demo: ProjectResponse[] = [
    { id:1, titre:'Plateforme e-learning IA',      description:'IA pour personnaliser le parcours pédagogique.',        technologies:'Angular, Spring Boot, TensorFlow', statut:'EN_COURS',   encadrant:{id:2,nom:'Prof. Karim Idrissi',email:'k.idrissi@university.ma'},   team:{id:1,nom:'Team Alpha'}, createdAt:'2024-01-15', updatedAt:'2024-03-10' },
    { id:2, titre:'Système de recommandation NLP', description:'Moteur de recommandation basé sur le langage naturel.', technologies:'Python, FastAPI, BERT',            statut:'EN_ATTENTE', encadrant:{id:2,nom:'Prof. Karim Idrissi',email:'k.idrissi@university.ma'},   team:null,                   createdAt:'2024-01-20', updatedAt:'2024-03-07' },
    { id:3, titre:'Dashboard analyse données',     description:'Tableau de bord interactif pour données académiques.',  technologies:'React, D3.js, FastAPI',            statut:'VALIDE',     encadrant:{id:5,nom:'Prof. Hind Nassiri',email:'h.nassiri@university.ma'},    team:{id:2,nom:'Team Beta'},  createdAt:'2024-01-10', updatedAt:'2024-02-28' },
    { id:4, titre:'Application mobile santé',      description:'App mobile de suivi de santé pour étudiants.',          technologies:'Flutter, Firebase',                statut:'EN_COURS',   encadrant:{id:2,nom:'Prof. Karim Idrissi',email:'k.idrissi@university.ma'},   team:null,                   createdAt:'2024-02-01', updatedAt:'2024-02-25' },
    { id:5, titre:'IoT Smart Campus',              description:'Réseau de capteurs IoT pour gestion du campus.',         technologies:'Arduino, MQTT, Node-RED',          statut:'TERMINE',    encadrant:{id:5,nom:'Prof. Hind Nassiri',email:'h.nassiri@university.ma'},    team:{id:3,nom:'Team Gamma'}, createdAt:'2023-10-01', updatedAt:'2024-01-15' },
    { id:6, titre:'Chatbot support académique',    description:'Assistant conversationnel pour étudiants.',              technologies:'Rasa, Python, React',              statut:'EN_COURS',   encadrant:{id:2,nom:'Prof. Karim Idrissi',email:'k.idrissi@university.ma'},   team:null,                   createdAt:'2024-02-10', updatedAt:'2024-03-05' },
  ];

  ngOnInit(): void { this.load(); }

  load(): void {
    this.loading = true;
    this.svc.getAll(this.page, this.size).subscribe({
      next: res => { this.projects = res.content; this.total = res.totalElements; this.totalPages = res.totalPages; this.loading = false; },
      error: ()  => { this.projects = this.demo;  this.total = this.demo.length;  this.totalPages = 1;             this.loading = false; }
    });
  }

  delete(p: ProjectResponse): void {
    if (!confirm(`Supprimer « ${p.titre} » ?`)) return;
    this.svc.delete(p.id).subscribe({
      next:  () => { this.projects = this.projects.filter(x => x.id !== p.id); this.snack.open('🗑 Projet supprimé', 'Fermer', { duration: 3000 }); },
      error: () => this.snack.open('Erreur suppression', 'Fermer', { duration: 3000, panelClass: 'snack-error' })
    });
  }

  get filtered(): ProjectResponse[] {
    const q = this.search.toLowerCase();
    return this.projects.filter(p =>
      (!q || p.titre.toLowerCase().includes(q) || (p.technologies ?? '').toLowerCase().includes(q))
      && (this.filterStatut === 'ALL' || p.statut === this.filterStatut)
    );
  }

  techs(t: string | null): string[] { return (t ?? '').split(',').map(x => x.trim()).filter(Boolean).slice(0, 3); }
  label(s: string): string   { return this.svc.statutLabel(s as StatutProjet); }
  css(s: string): string     { return this.svc.statutClass(s as StatutProjet); }
  dot(s: string): string     { return this.svc.statutDotColor(s as StatutProjet); }

  prevPage(): void { if (this.page > 0)               { this.page--; this.load(); } }
  nextPage(): void { if (this.page < this.totalPages-1) { this.page++; this.load(); } }
}
