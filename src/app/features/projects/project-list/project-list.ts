import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-project-list',
  standalone: true,
  imports: [CommonModule, MatIconModule, RouterLink],
  templateUrl: './project-list.html',
  styleUrl: './project-list.scss',
})
export class ProjectList {}
