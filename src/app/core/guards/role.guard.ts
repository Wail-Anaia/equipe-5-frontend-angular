import { inject }          from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService }     from '../auth/auth.service';
import { Role }            from '../models/api.models';

export const roleGuard: CanActivateFn = (route, _state) => {
  const auth   = inject(AuthService);
  const router = inject(Router);

  const allowedRoles = route.data['roles'] as Role[] | undefined;
  const userRole     = auth.role();

  if (!allowedRoles || !allowedRoles.length) return true;

  if (userRole && allowedRoles.includes(userRole)) return true;

  router.navigate(['/unauthorized']);
  return false;
};
