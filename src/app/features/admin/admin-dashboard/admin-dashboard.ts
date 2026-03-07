import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule }   from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterLink } from '@angular/router';
import { StatsService, AdminStats } from '../../../core/services/stats.service';

interface StatCard {
  title: string;
  value: number | string;
  subtitle: string;
  icon: string;
  colorClass: string;
  trend?: number;     // % variation
  trendUp?: boolean;
  route?: string;
}

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatButtonModule, MatTooltipModule, RouterLink],
  templateUrl: './admin-dashboard.html',
  styleUrls: ['./admin-dashboard.scss']
})
export class AdminDashboard implements OnInit {

  private statsService = inject(StatsService);

  loading = true;
  stats: AdminStats | null = null;
  error: string | null = null;

  statCards: StatCard[] = [];

  readonly quickActions = [
    { label: 'Créer un compte',    icon: 'person_add',   route: '/users/create',  color: '#6C63FF' },
    { label: 'Nouveau projet',     icon: 'folder_open',  route: '/projects/new',  color: '#10b981' },
    { label: 'Journal d\'audit',   icon: 'receipt_long', route: '/audit',         color: '#f59e0b' },
    { label: 'Paramètres',        icon: 'settings',     route: '/settings',      color: '#64748b' },
  ];

  ngOnInit(): void {
    this.loadStats();
  }

  loadStats(): void {
    this.loading = true;
    this.statsService.getAdminStats().subscribe({
      next: (data) => {
        this.stats = data;
        this.buildStatCards(data);
        this.loading = false;
      },
      error: () => {
        // Données de démo si l'API n'est pas encore disponible
        this.buildDemoCards();
        this.loading = false;
      }
    });
  }

  private buildStatCards(data: AdminStats): void {
    this.statCards = [
      {
        title: 'Utilisateurs',
        value: data.totalUsers,
        subtitle: 'comptes actifs',
        icon: 'group',
        colorClass: 'card--indigo',
        trend: 12,
        trendUp: true,
        route: '/users'
      },
      {
        title: 'Projets',
        value: data.totalProjects,
        subtitle: `${data.activeProjects} en cours`,
        icon: 'folder_special',
        colorClass: 'card--emerald',
        trend: 8,
        trendUp: true,
        route: '/projects'
      },
      {
        title: 'Étudiants',
        value: data.totalStudents,
        subtitle: 'inscrits',
        icon: 'school',
        colorClass: 'card--violet',
        trend: 5,
        trendUp: true
      },
      {
        title: 'Encadrants',
        value: data.totalEncadrants,
        subtitle: 'disponibles',
        icon: 'supervisor_account',
        colorClass: 'card--amber',
        trend: 0,
        trendUp: true
      },
    ];
  }

  private buildDemoCards(): void {
    this.statCards = [
      { title: 'Utilisateurs',  value: 142, subtitle: 'comptes actifs',   icon: 'group',               colorClass: 'card--indigo',  trend: 12, trendUp: true,  route: '/users'    },
      { title: 'Projets',       value: 38,  subtitle: '24 en cours',      icon: 'folder_special',      colorClass: 'card--emerald', trend: 8,  trendUp: true,  route: '/projects' },
      { title: 'Étudiants',     value: 120, subtitle: 'inscrits',         icon: 'school',              colorClass: 'card--violet',  trend: 5,  trendUp: true                      },
      { title: 'Encadrants',    value: 18,  subtitle: 'disponibles',      icon: 'supervisor_account',  colorClass: 'card--amber',   trend: 0,  trendUp: true                      },
    ];
  }

  // Données démo pour la table des activités récentes
  readonly recentActivities = [
    { action: 'USER_CREATED',   user: 'Yasmine Benhaddou',  detail: 'Compte ETUDIANT créé',         time: 'il y a 5 min',  icon: 'person_add',    color: '#6C63FF' },
    { action: 'LOGIN_SUCCESS',  user: 'Prof. Karim Idrissi', detail: 'Connexion réussie',            time: 'il y a 12 min', icon: 'login',         color: '#10b981' },
    { action: 'USER_DISABLED',  user: 'Admin',               detail: 'Compte désactivé — Omar Z.',  time: 'il y a 1h',     icon: 'block',         color: '#f59e0b' },
    { action: 'LOGIN_FAILED',   user: 'inconnu',             detail: '3 tentatives échouées',       time: 'il y a 2h',     icon: 'warning',       color: '#ef4444' },
    { action: 'ROLE_CHANGED',   user: 'Admin',               detail: 'Rôle mis à jour → ENCADRANT', time: 'il y a 3h',     icon: 'manage_accounts', color: '#8b5cf6' },
  ];
}
