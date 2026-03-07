import { TestBed } from '@angular/core/testing';
import { Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { describe, it, expect, beforeEach, vi } from 'vitest';

import { roleGuard } from './role.guard';
import { AuthService } from '../auth/auth.service';
import { Role } from '../auth/auth.model';

/** Helper : crée un ActivatedRouteSnapshot avec data.roles */
function routeWithRoles(roles: Role[]): ActivatedRouteSnapshot {
  return { data: { roles } } as unknown as ActivatedRouteSnapshot;
}

const dummyState = {} as RouterStateSnapshot;

describe('roleGuard', () => {

  let authServiceSpy: { role: Role };
  let routerSpy: { navigate: ReturnType<typeof vi.fn> };

  beforeEach(() => {

    authServiceSpy = {
      role: 'ADMIN'
    };

    routerSpy = {
      navigate: vi.fn()
    };

    TestBed.configureTestingModule({
      providers: [
        { provide: AuthService, useValue: authServiceSpy },
        { provide: Router, useValue: routerSpy }
      ]
    });

  });

  // ── ADMIN ─────────────────────────────────────────

  it('T-RG-01 : ADMIN accède à une route ADMIN → true', () => {

    authServiceSpy.role = 'ADMIN';

    const result = TestBed.runInInjectionContext(() =>
      roleGuard(routeWithRoles(['ADMIN']), dummyState)
    );

    expect(result).toBe(true);
    expect(routerSpy.navigate).not.toHaveBeenCalled();

  });

  it('T-RG-02 : ETUDIANT accède à une route ADMIN → false + redirect', () => {

    authServiceSpy.role = 'ETUDIANT';

    const result = TestBed.runInInjectionContext(() =>
      roleGuard(routeWithRoles(['ADMIN']), dummyState)
    );

    expect(result).toBe(false);
    expect(routerSpy.navigate).toHaveBeenCalledTimes(1);
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/unauthorized']);

  });

  it('T-RG-03 : ENCADRANT accède à une route ADMIN → false', () => {

    authServiceSpy.role = 'ENCADRANT';

    const result = TestBed.runInInjectionContext(() =>
      roleGuard(routeWithRoles(['ADMIN']), dummyState)
    );

    expect(result).toBe(false);
    expect(routerSpy.navigate).toHaveBeenCalledTimes(1);

  });

  // ── ENCADRANT ─────────────────────────────────────

  it('T-RG-04 : ENCADRANT accède à une route ENCADRANT → true', () => {

    authServiceSpy.role = 'ENCADRANT';

    const result = TestBed.runInInjectionContext(() =>
      roleGuard(routeWithRoles(['ENCADRANT']), dummyState)
    );

    expect(result).toBe(true);

  });

  it('T-RG-05 : ETUDIANT accède à une route ENCADRANT → false', () => {

    authServiceSpy.role = 'ETUDIANT';

    const result = TestBed.runInInjectionContext(() =>
      roleGuard(routeWithRoles(['ENCADRANT']), dummyState)
    );

    expect(result).toBe(false);
    expect(routerSpy.navigate).toHaveBeenCalled();

  });

  // ── MULTI ROLES ───────────────────────────────────

  it('T-RG-06 : Route [ADMIN, ENCADRANT] — ADMIN autorisé', () => {

    authServiceSpy.role = 'ADMIN';

    const result = TestBed.runInInjectionContext(() =>
      roleGuard(routeWithRoles(['ADMIN', 'ENCADRANT']), dummyState)
    );

    expect(result).toBe(true);

  });

  it('T-RG-07 : Route [ADMIN, ENCADRANT] — ENCADRANT autorisé', () => {

    authServiceSpy.role = 'ENCADRANT';

    const result = TestBed.runInInjectionContext(() =>
      roleGuard(routeWithRoles(['ADMIN', 'ENCADRANT']), dummyState)
    );

    expect(result).toBe(true);

  });

  it('T-RG-08 : Route [ADMIN, ENCADRANT] — ETUDIANT interdit', () => {

    authServiceSpy.role = 'ETUDIANT';

    const result = TestBed.runInInjectionContext(() =>
      roleGuard(routeWithRoles(['ADMIN', 'ENCADRANT']), dummyState)
    );

    expect(result).toBe(false);
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/unauthorized']);

  });

  // ── CAS LIMITES ───────────────────────────────────

  it('T-RG-09 : Aucun rôle requis → refus par sécurité', () => {

    authServiceSpy.role = 'ADMIN';

    const result = TestBed.runInInjectionContext(() =>
      roleGuard(routeWithRoles(undefined as any), dummyState)
    );

    expect(result).toBe(false);
    expect(routerSpy.navigate).toHaveBeenCalled();

  });

});
