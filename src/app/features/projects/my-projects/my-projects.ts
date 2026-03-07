import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-my-projects',
  standalone: true,
  imports: [CommonModule, MatIconModule, RouterLink],
  templateUrl: './my-projects.html',
  styleUrl: './my-projects.scss',
})
export class MyProjects {}
