import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-supervised',
  standalone: true,
  imports: [CommonModule, MatIconModule, RouterLink],
  templateUrl: './supervised.html',
  styleUrl: './supervised.scss',
})
export class Supervised {}
