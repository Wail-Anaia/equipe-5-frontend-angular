import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminDashboardComponent } from '../admin/admin-dashboard/admin-dashboard';
import { StudentDashboardComponent } from '../student/student-dashboard/student-dashboard';
import { EncadrantDashboardComponent } from '../encadrant/encadrant-dashboard/encadrant-dashboard';
import { AuthService } from '../../core/auth/auth.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule,
            AdminDashboardComponent,
            StudentDashboardComponent,
            EncadrantDashboardComponent],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class DashboardComponent {
  auth = inject(AuthService);
}
