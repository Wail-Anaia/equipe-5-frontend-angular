import { Component, inject, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { MatIconModule }    from '@angular/material/icon';
import { MatRippleModule }  from '@angular/material/core';
import { MatTooltipModule } from '@angular/material/tooltip';
import { AuthService } from '../../../core/auth/auth.service';

interface NavItem {
  label: string;
  icon: string;
  route: string;
  roles: string[];
  children?: NavItem[];
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive,
            MatIconModule, MatRippleModule, MatTooltipModule],
  templateUrl: './sidebar.html',
  styleUrls: ['./sidebar.scss']
})
export class Sidebar {
  @Input()  collapsed = false;
  @Output() collapseToggle = new EventEmitter<void>();

  auth = inject(AuthService);

  readonly navItems: NavItem[] = [
    {
      label: 'Tableau de bord',
      icon: 'dashboard',
      route: '/dashboard',
      roles: ['ADMIN', 'ENCADRANT', 'ETUDIANT']
    },
    {
      label: 'Utilisateurs',
      icon: 'manage_accounts',
      route: '/users',
      roles: ['ADMIN'],
      children: [
        { label: 'Liste des utilisateurs', icon: 'group',      route: '/users',        roles: ['ADMIN'] },
        { label: 'Créer un compte',        icon: 'person_add', route: '/users/create', roles: ['ADMIN'] }
      ]
    },
    {
      label: 'Projets',
      icon: 'folder_special',
      route: '/projects',
      roles: ['ADMIN', 'ENCADRANT']
    },
    {
      label: 'Mes projets',
      icon: 'book',
      route: '/my-projects',
      roles: ['ETUDIANT']
    },
    {
      label: 'Projets encadrés',
      icon: 'supervised_user_circle',
      route: '/supervised',
      roles: ['ENCADRANT']
    },
    {
      label: 'Mes documents',
      icon: 'description',
      route: '/documents',
      roles: ['ETUDIANT']
    },
    {
      label: 'Journal d\'audit',
      icon: 'receipt_long',
      route: '/audit',
      roles: ['ADMIN']
    }
  ];

  expandedItems: Set<string> = new Set();

  visibleItems(): NavItem[] {
    const role = this.auth.role();
    return this.navItems.filter(item => role && item.roles.includes(role));
  }

  toggleExpand(route: string): void {
    if (this.expandedItems.has(route)) {
      this.expandedItems.delete(route);
    } else {
      this.expandedItems.add(route);
    }
  }

  isExpanded(route: string): boolean {
    return this.expandedItems.has(route);
  }

  getRoleLabel(): string {
    const map: Record<string, string> = {
      ADMIN: 'Administrateur',
      ENCADRANT: 'Encadrant',
      ETUDIANT: 'Étudiant'
    };
    return map[this.auth.role()!] ?? '';
  }

  getRoleBadgeClass(): string {
    const map: Record<string, string> = {
      ADMIN: 'badge-admin',
      ENCADRANT: 'badge-encadrant',
      ETUDIANT: 'badge-etudiant'
    };
    return map[this.auth.role()!] ?? '';
  }
}
