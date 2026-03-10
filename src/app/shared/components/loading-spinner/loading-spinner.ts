// import { Component, Input } from '@angular/core';
// import { CommonModule }     from '@angular/common';
// import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

// @Component({
//   selector: 'app-loading-spinner',
//   standalone: true,
//   imports: [CommonModule, MatProgressSpinnerModule],
//   templateUrl: './loading-spinner.html',
//   styleUrl: './loading-spinner.scss',
// })
// export class LoadingSpinnerComponent {
//   @Input() loading  = false;
//   @Input() diameter = 40;
//   @Input() label    = '';
// }

import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * Spinner de chargement global — overlay avec fond flou.
 * Usage : <app-loading-spinner [loading]="loading" label="Chargement..." [diameter]="44">
 */
@Component({
  selector: 'app-loading-spinner',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="spinner-overlay" *ngIf="loading">
      <div class="spinner-box">
        <svg class="spinner-svg"
             [style.width.px]="diameter"
             [style.height.px]="diameter"
             viewBox="0 0 50 50">
          <circle class="spinner-track" cx="25" cy="25" r="20"
                  fill="none" stroke="#e2e8f0" stroke-width="4"/>
          <circle class="spinner-arc" cx="25" cy="25" r="20"
                  fill="none" stroke="#6C63FF" stroke-width="4"
                  stroke-linecap="round"
                  stroke-dasharray="80 46"/>
        </svg>
        <span class="spinner-label" *ngIf="label">{{ label }}</span>
      </div>
    </div>
  `,
  styles: [`
    .spinner-overlay {
      position: absolute;
      inset: 0;
      background: rgba(255,255,255,0.85);
      backdrop-filter: blur(4px);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 50;
      border-radius: inherit;
    }

    .spinner-box {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 12px;
    }

    .spinner-svg {
      animation: spin 0.9s linear infinite;
    }

    @keyframes spin { to { transform: rotate(360deg); } }

    .spinner-label {
      font-family: 'DM Sans', sans-serif;
      font-size: 0.78rem;
      font-weight: 500;
      color: #64748b;
    }
  `]
})
export class LoadingSpinnerComponent {
  @Input() loading  = false;
  @Input() label    = '';
  @Input() diameter = 44;
}
