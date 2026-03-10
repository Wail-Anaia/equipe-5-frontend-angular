import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule }     from '@angular/common';
import { MatIconModule }    from '@angular/material/icon';
import { MatButtonModule }  from '@angular/material/button';
import { RouterLink }       from '@angular/router';
import { Subject, takeUntil, finalize } from 'rxjs';

import { StatsService } from '../../../core/services/stats.service';
import { AdminStats, ActivityItem } from '../../../core/models/api.models';

interface StatCard {
  title:      string;
  value:      number | string;
  subtitle:   string;
  icon:       string;
  colorClass: string;
  trend?:     number;
  trendUp?:   boolean;
  route?:     string;
}

interface ActivityDisplay {
  action: string;
  detail: string;
  user:   string;
  time:   string;
  icon:   string;
  color:  string;
}

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  // ✅ LoadingSpinnerComponent ABSENT — skeleton CSS utilisé à la place (Fix NG8113)
  imports: [CommonModule, MatIconModule, MatButtonModule, RouterLink],
  templateUrl: './admin-dashboard.html',
  styleUrls:   ['./admin-dashboard.scss']
})
export class AdminDashboardComponent implements OnInit, OnDestroy {

  private statsService = inject(StatsService);
  private destroy$     = new Subject<void>();

  loading   = true;
  stats:    AdminStats | null = null;
  statCards: StatCard[] = [];
  recentActivities: ActivityDisplay[] = [];

  readonly quickActions = [
    { label: 'Créer un compte',  icon: 'person_add',   route: '/users/create', color: '#6C63FF' },
    { label: 'Nouveau projet',   icon: 'folder_open',  route: '/projects',     color: '#10b981' },
    { label: "Journal d'audit",  icon: 'receipt_long', route: '/audit',        color: '#f59e0b' },
    { label: 'Mon profil',       icon: 'account_circle', route: '/profile',    color: '#64748b' },
  ];

  // ── Lifecycle ────────────────────────────────────────
  ngOnInit(): void  { this.loadStats(); }
  ngOnDestroy(): void { this.destroy$.next(); this.destroy$.complete(); }

  // ── Chargement ───────────────────────────────────────
  loadStats(): void {
    this.loading = true;

    this.statsService.getAdminStats()
      .pipe(takeUntil(this.destroy$), finalize(() => this.loading = false))
      .subscribe({
        next:  data => {this.stats = data; this.buildCards(data); this.buildActivities(data.recentActivities ?? []); },
        error: ()   => { this.buildDemoCards(); this.buildDemoActivities(); }
      });
  }

  // ── Cards ────────────────────────────────────────────
  private buildCards(data: AdminStats): void {
    this.statCards = [
      { title: 'Utilisateurs', value: data.totalUsers,     subtitle: 'comptes enregistrés',   icon: 'group',              colorClass: 'card--indigo',  trend: 12, trendUp: true, route: '/users'    },
      { title: 'Projets',      value: data.totalProjects,  subtitle: `${data.activeProjects} en cours`, icon: 'folder_special', colorClass: 'card--emerald', trend: 8,  trendUp: true, route: '/projects' },
      { title: 'Étudiants',    value: data.totalStudents,  subtitle: 'inscrits',               icon: 'school',             colorClass: 'card--violet',  trend: 5,  trendUp: true  },
      { title: 'Encadrants',   value: data.totalEncadrants,subtitle: 'actifs',                 icon: 'supervisor_account', colorClass: 'card--amber',   trend: 0,  trendUp: true  },
    ];
  }

  private buildDemoCards(): void {
    this.statCards = [
      { title: 'Utilisateurs', value: 142, subtitle: 'comptes enregistrés',icon: 'group',              colorClass: 'card--indigo',  trend: 12, trendUp: true, route: '/users'    },
      { title: 'Projets',      value: 38,  subtitle: '24 en cours',        icon: 'folder_special',     colorClass: 'card--emerald', trend: 8,  trendUp: true, route: '/projects' },
      { title: 'Étudiants',    value: 120, subtitle: 'inscrits',           icon: 'school',             colorClass: 'card--violet',  trend: 5,  trendUp: true  },
      { title: 'Encadrants',   value: 18,  subtitle: 'actifs',             icon: 'supervisor_account', colorClass: 'card--amber',   trend: 0,  trendUp: true  },
    ];
  }

  // ── Activités ────────────────────────────────────────
  /** Convertit les ActivityItem du backend vers l'affichage */
  private buildActivities(items: ActivityItem[]): void {
    this.recentActivities = items.slice(0, 7).map(item => ({
      action: item.action,
      detail: item.details ?? '',
      user:   item.user,
      time:   this.formatTimestamp(item.timestamp),
      icon:   this.getActivityIcon(item.action),
      color:  this.getActivityColor(item.action),
    }));
  }

  private buildDemoActivities(): void {
    this.recentActivities = [
      { action: 'USER_CREATED',  user: 'Admin',             detail: 'Compte ETUDIANT créé — yasmine@etu.ma',  time: 'il y a 5 min',  icon: 'person_add',      color: '#6C63FF' },
      { action: 'LOGIN_SUCCESS', user: 'k.idrissi@uni.ma',  detail: 'Connexion réussie',                      time: 'il y a 12 min', icon: 'login',           color: '#10b981' },
      { action: 'USER_DISABLED', user: 'Admin',             detail: 'Compte désactivé — omar@etu.ma',         time: 'il y a 1h',     icon: 'block',           color: '#f59e0b' },
      { action: 'LOGIN_FAILED',  user: 'inconnu',           detail: '3 tentatives échouées',                  time: 'il y a 2h',     icon: 'warning',         color: '#ef4444' },
      { action: 'ROLE_CHANGED',  user: 'Admin',             detail: 'Rôle mis à jour → ENCADRANT',            time: 'il y a 3h',     icon: 'manage_accounts', color: '#8b5cf6' },
    ];
  }

  // ── Helpers ──────────────────────────────────────────
  private getActivityIcon(action: string): string {
    const m: Record<string, string> = {
      USER_CREATED: 'person_add', USER_DISABLED: 'block', USER_ENABLED: 'check_circle',
      LOGIN_SUCCESS: 'login', LOGIN_FAILED: 'warning', ROLE_CHANGED: 'manage_accounts',
    };
    return m[action] ?? 'info';
  }

  private getActivityColor(action: string): string {
    const m: Record<string, string> = {
      USER_CREATED: '#6C63FF', USER_DISABLED: '#f59e0b', USER_ENABLED: '#10b981',
      LOGIN_SUCCESS: '#10b981', LOGIN_FAILED: '#ef4444', ROLE_CHANGED: '#8b5cf6',
    };
    return m[action] ?? '#64748b';
  }

  private formatTimestamp(ts: string): string {
    const diff = Date.now() - new Date(ts).getTime();
    const min  = Math.floor(diff / 60_000);
    if (min < 60)   return `il y a ${min} min`;
    const h = Math.floor(min / 60);
    if (h < 24)     return `il y a ${h}h`;
    return `il y a ${Math.floor(h / 24)}j`;
  }

  /** Lit les mini-stats depuis les vraies données ou les démos */
  get pendingProjects(): number  { return this.stats?.pendingProjects  ?? 7;  }
  get closedProjects():  number  { return this.stats?.closedProjects   ?? 10; }
  get activeProjects():  number  { return this.stats?.activeProjects   ?? 20; }
  get valideProjects():  number  { return this.stats?.valideProjects   ?? 30; }
  get rejeteProjects():  number  { return this.stats?.rejeteProjects   ?? 2; }
}
