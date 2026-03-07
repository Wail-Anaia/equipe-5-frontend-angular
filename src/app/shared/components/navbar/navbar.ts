import { Component, inject, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatIconModule }    from '@angular/material/icon';
import { MatButtonModule }  from '@angular/material/button';
import { MatMenuModule }    from '@angular/material/menu';
import { MatBadgeModule }   from '@angular/material/badge';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDividerModule } from '@angular/material/divider';
import { AuthService } from '../../../core/auth/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink,
            MatIconModule, MatButtonModule, MatMenuModule,
            MatBadgeModule, MatTooltipModule, MatDividerModule],
  templateUrl: './navbar.html',
  styleUrls: ['./navbar.scss']
})
export class Navbar {
  @Input()  pageTitle = 'Tableau de bord';
  @Input()  sidebarCollapsed = false;
  @Output() menuToggle = new EventEmitter<void>();

  auth = inject(AuthService);

  notificationsCount = 3;

  getRoleLabel(): string {
    const map: Record<string, string> = {
      ADMIN: 'Administrateur',
      ENCADRANT: 'Encadrant',
      ETUDIANT: 'Étudiant'
    };
    return map[this.auth.role()!] ?? '';
  }

  getRoleColor(): string {
    const map: Record<string, string> = {
      ADMIN: '#f87171',
      ENCADRANT: '#34d399',
      ETUDIANT: '#a5b4fc'
    };
    return map[this.auth.role()!] ?? '#a5b4fc';
  }

  getInitials(): string {
    const name = this.auth.userName();
    const parts = name.trim().split(' ');
    if (parts.length >= 2) return parts[0][0] + parts[1][0];
    return name.substring(0, 2).toUpperCase();
  }
}
