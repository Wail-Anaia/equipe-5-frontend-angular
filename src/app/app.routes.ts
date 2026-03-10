// src/app/app.routes.ts
import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard }  from './core/guards/role.guard';

export const routes: Routes = [

  // ── Racine → login ──────────────────────────────────
  { path: '', redirectTo: 'login', pathMatch: 'full' },

  // ── Login (public) ──────────────────────────────────
  {
    path: 'login',
    loadComponent: () =>
      import('./features/auth/login/login')
        .then(m => m.Login)
  },

  // ══════════════════════════════════════════════════════
  // LAYOUT PRINCIPAL — sidebar + navbar
  // Toutes les routes enfants nécessitent authGuard
  // ══════════════════════════════════════════════════════
  {
    path: '',
    loadComponent: () =>
      import('./shared/layout/dashboard/dashboard-layout')
        .then(m => m.DashboardLayoutComponent),
    canActivate: [authGuard],
    children: [

      // ── Dashboard (dispatcher par rôle) ─────────────
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./features/dashboard/dashboard')
            .then(m => m.DashboardComponent),
        title: 'Tableau de bord — UniPFE'
      },

      // ── Gestion utilisateurs (ADMIN uniquement) ──────
      {
        path: 'users',
        canActivate: [roleGuard],
        data: { roles: ['ADMIN'] },
        children: [
          {
            path: '',
            loadComponent: () =>
              import('./features/users/user-list/user-list')
                .then(m => m.UserListComponent),
            title: 'Utilisateurs — UniPFE'
          },
          {
            path: 'create',
            loadComponent: () =>
              import('./features/users/create-user/create-user')
                .then(m => m.CreateUserComponent),
            title: 'Créer un compte — UniPFE'
          },
          {
            path: ':id',
            loadComponent: () =>
              import('./features/users/user-detail/user-detail')
                .then(m => m.UserDetailComponent),
            title: 'Profil utilisateur — UniPFE'
          }
        ]
      },

      // ── Projets (ADMIN + ENCADRANT) ──────────────────
      {
        path: 'projects',
        canActivate: [roleGuard],
        data: { roles: ['ADMIN', 'ENCADRANT'] },
        children: [
          {
            path: '',
            loadComponent: () =>
              import('./features/projects/project-list/project-list')
                .then(m => m.ProjectListComponent),
            title: 'Projets — UniPFE'
          },
          {
            path: 'new',
            canActivate: [roleGuard],
            data: { roles: ['ADMIN'] },
            loadComponent: () =>
              import('./features/projects/project-create/project-create')
                .then(m => m.ProjectCreateComponent),
            title: 'Nouveau projet — UniPFE'
          },
          {
            path: ':id',
            loadComponent: () =>
              import('./features/projects/project-detail/project-detail')
                .then(m => m.ProjectDetailComponent),
            title: 'Détail projet — UniPFE'
          }
        ]
      },

      // ── Mes projets (ETUDIANT uniquement) ────────────
      {
        path: 'my-projects',
        canActivate: [roleGuard],
        data: { roles: ['ETUDIANT'] },
        children: [
          {
            path: '',
            loadComponent: () =>
              import('./features/projects/my-projects/my-projects')
                .then(m => m.MyProjectsComponent),
            title: 'Mes projets — UniPFE'
          },
          {
            path: ':id',
            loadComponent: () =>
              import('./features/projects/project-detail/project-detail')
                .then(m => m.ProjectDetailComponent),
            title: 'Mon projet — UniPFE'
          }
        ]
      },

      // ── Projets encadrés (ENCADRANT uniquement) ──────
      {
        path: 'supervised',
        canActivate: [roleGuard],
        data: { roles: ['ENCADRANT'] },
        children: [
          {
            path: '',
            loadComponent: () =>
              import('./features/projects/supervised/supervised')
                .then(m => m.SupervisedComponent),
            title: 'Projets encadrés — UniPFE'
          },
          {
            path: ':id',
            loadComponent: () =>
              import('./features/projects/project-detail/project-detail')
                .then(m => m.ProjectDetailComponent),
            title: 'Projet encadré — UniPFE'
          }
        ]
      },

      // ── Mes documents (ETUDIANT uniquement) ──────────
      {
        path: 'documents',
        canActivate: [roleGuard],
        data: { roles: ['ETUDIANT'] },
        loadComponent: () =>
          import('./features/documents/documents')
            .then(m => m.Documents),
        title: 'Mes documents — UniPFE'
      },

      // ── Journal d'audit (ADMIN uniquement) ───────────
      {
        path: 'audit',
        canActivate: [roleGuard],
        data: { roles: ['ADMIN'] },
        loadComponent: () =>
          import('./features/audit/audit')
            .then(m => m.AuditComponent),
        title: 'Journal d\'audit — UniPFE'
      },

      // ── Profil (tous les rôles) ───────────────────────
      {
        path: 'profile',
        loadComponent: () =>
          import('./features/profile/profile')
            .then(m => m.Profile),
        title: 'Mon profil — UniPFE'
      },

      // ── Accès refusé ──────────────────────────────────
      {
        path: 'unauthorized',
        loadComponent: () =>
          import('./features/auth/unauthorized/unauthorized')
            .then(m => m.Unauthorized),
        title: 'Accès refusé — UniPFE'
      }
    ]
  },

  // ── Wildcard → login ────────────────────────────────
  { path: '**', redirectTo: 'login' }
];
