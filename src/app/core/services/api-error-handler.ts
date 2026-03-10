// ══════════════════════════════════════════════════════
// Gestionnaire d'erreurs HTTP centralisé
// Pattern utilisé chez Google / Amazon dans les frontend
// enterprise Angular
// ══════════════════════════════════════════════════════
import { Injectable, inject } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { EMPTY, Observable, throwError } from 'rxjs';
import { ApiError } from '../models/api.models';

@Injectable({ providedIn: 'root' })
export class ApiErrorHandler {

  private snack  = inject(MatSnackBar);
  private router = inject(Router);

  handle(error: HttpErrorResponse): Observable<never> {
    // 401 — géré par le JWT interceptor (redirect /login)
    if (error.status === 401) return EMPTY;

    const message = this.extractMessage(error);
    this.showError(message);
    return throwError(() => error);
  }

  // Méthode utilitaire pour les composants
  showError(message: string): void {
    this.snack.open(message, 'Fermer', {
      duration: 6000,
      panelClass: 'snack-error',
      horizontalPosition: 'center',
      verticalPosition: 'top'
    });
  }

  showSuccess(message: string): void {
    this.snack.open(message, 'Fermer', {
      duration: 4000,
      panelClass: 'snack-success',
      horizontalPosition: 'center',
      verticalPosition: 'top'
    });
  }

  private extractMessage(error: HttpErrorResponse): string {
    const body = error.error as ApiError | null;

    if (error.status === 0) {
      return 'Impossible de contacter le serveur. Vérifiez votre connexion.';
    }
    if (error.status === 403) {
      return 'Accès refusé. Vous n\'avez pas les droits nécessaires.';
    }
    if (error.status === 404) {
      return body?.error ?? 'Ressource introuvable.';
    }
    if (error.status === 400 && body?.details) {
      return Object.values(body.details).join(' | ');
    }
    if (error.status >= 500) {
      return 'Erreur serveur. Veuillez réessayer plus tard.';
    }
    return body?.error ?? 'Une erreur inattendue est survenue.';
  }
}
