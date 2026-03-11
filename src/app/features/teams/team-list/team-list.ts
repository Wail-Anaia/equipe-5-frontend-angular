import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule }  from '@angular/forms';
import { RouterLink }   from '@angular/router';
import { MatIconModule }    from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { TeamService, TeamResponse } from '../../../core/services/team.service';

@Component({
  selector: 'app-team-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, MatIconModule, MatTooltipModule, MatSnackBarModule],
  templateUrl: './team-list.html',
  styleUrls:   ['./team-list.scss']
})
export class TeamListComponent implements OnInit {

  private svc   = inject(TeamService);
  private snack = inject(MatSnackBar);

  teams:   TeamResponse[] = [];
  loading  = true;
  search   = '';

  private readonly demo: TeamResponse[] = [
    { id:1, nom:'Team Alpha', createdAt:'2024-01-15', membres:[
      { id:3, nom:'Yasmine Benhaddou', email:'y.benhaddou@etu.ma', role:'ETUDIANT', actif:true  },
      { id:4, nom:'Omar Zouheir',      email:'o.zouheir@etu.ma',   role:'ETUDIANT', actif:true  },
    ]},
    { id:2, nom:'Team Beta',  createdAt:'2024-01-20', membres:[
      { id:5, nom:'Sara Alami',   email:'s.alami@etu.ma',  role:'ETUDIANT', actif:true  },
      { id:6, nom:'Amine Benali', email:'a.benali@etu.ma', role:'ETUDIANT', actif:false },
    ]},
    { id:3, nom:'Team Gamma', createdAt:'2024-02-01', membres:[
      { id:7, nom:'Fatima Zahra', email:'f.zahra@etu.ma', role:'ETUDIANT', actif:true },
    ]},
  ];

  ngOnInit(): void {
    this.svc.getAll().subscribe({
      next:  ts => { this.teams = ts;         this.loading = false; },
      error: ()  => { this.teams = this.demo; this.loading = false; }
    });
  }

  delete(t: TeamResponse): void {
    if (!confirm('Supprimer equipe ' + t.nom + ' ?')) return;
    this.svc.delete(t.id).subscribe({
      next:  () => { this.teams = this.teams.filter(x => x.id !== t.id); this.snack.open('Equipe supprimee', 'Fermer', { duration: 3000 }); },
      error: () => this.snack.open('Erreur suppression', 'Fermer', { duration: 3000, panelClass: 'snack-error' })
    });
  }

  get filtered(): TeamResponse[] {
    const q = this.search.toLowerCase();
    return !q ? this.teams : this.teams.filter(t => t.nom.toLowerCase().includes(q));
  }

  initials(nom: string): string {
    const p = nom.trim().split(' ');
    return p.length >= 2 ? p[0][0] + p[1][0] : nom.substring(0, 2).toUpperCase();
  }
}
