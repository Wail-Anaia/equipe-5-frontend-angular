import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminDashboard } from '../admin/admin-dashboard/admin-dashboard';
import { StudentDashboard } from '../student/student-dashboard/student-dashboard';
import { EncadrantDashboard } from '../encadrant/encadrant-dashboard/encadrant-dashboard';
import { AuthService } from '../../core/auth/auth.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule,
            AdminDashboard,
            StudentDashboard,
            EncadrantDashboard],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class DashboardComponent {
  auth = inject(AuthService);
}
