import { inject } from '@angular/core';
import { CanActivateFn, Router, ActivatedRouteSnapshot } from '@angular/router';
import { AuthService } from '../auth/auth.service';
import { Role } from '../auth/auth.model';

export const roleGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  const auth     = inject(AuthService);
  const router   = inject(Router);
  const required = route.data['roles'] as Role[];

  if (required && required.includes(auth.role()!)) {
    return true;
  }

  router.navigate(['/unauthorized']);
  return false;
};
