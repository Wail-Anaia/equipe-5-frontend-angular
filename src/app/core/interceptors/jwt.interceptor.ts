// ══════════════════════════════════════════════════════
// JWT Interceptor — Pattern HttpInterceptorFn (Angular 17+)
// Injecte automatiquement le Bearer token sur chaque requête
// Redirige vers /login en cas de 401
// ══════════════════════════════════════════════════════
import {
  HttpInterceptorFn,
  HttpRequest,
  HttpHandlerFn,
  HttpErrorResponse
} from '@angular/common/http';
import { inject }   from '@angular/core';
import { Router }   from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../auth/auth.service';

export const jwtInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn
) => {
  const auth   = inject(AuthService);
  const router = inject(Router);

  const token = auth.getToken();

  // Cloner la requête avec le token si disponible
  const cloned = token
    ? req.clone({
        setHeaders: { Authorization: `Bearer ${token}` }
      })
    : req;

  return next(cloned).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401) {
        // Token expiré ou invalide → logout + redirect
        auth.logout();
        router.navigate(['/login'], {
          queryParams: { reason: 'session-expired' }
        });
      }
      return throwError(() => error);
    })
  );
};
