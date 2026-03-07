import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { Sidebar } from '../../components/sidebar/sidebar';
import { Navbar } from '../../components/navbar/navbar';

@Component({
  selector: 'app-dashboard-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, Sidebar, Navbar],
  templateUrl: './dashboard-layout.html',
  styleUrl: './dashboard-layout.scss',
})
export class DashboardLayoutComponent {
  collapsed = signal(false);
  pageTitle = signal('Tableau de bord');
}
