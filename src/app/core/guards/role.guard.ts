import { inject } from '@angular/core';
import { CanActivateFn, ActivatedRouteSnapshot, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { Role } from '../models/user.model';

export const roleGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  const auth    = inject(AuthService);
  const router  = inject(Router);
  const allowed: Role[] = route.data['roles'] ?? [];
  const role = auth.getRole();
  return (role && allowed.includes(role)) ? true : router.createUrlTree(['/unauthorized']);
};
