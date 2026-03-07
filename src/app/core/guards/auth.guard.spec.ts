import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { describe, it, expect, beforeEach, vi } from 'vitest';

import { authGuard } from './auth.guard';
import { AuthService } from '../auth/auth.service';

describe('authGuard', () => {

  let authServiceMock: any;
  let routerMock: any;

  const dummyRoute = {} as ActivatedRouteSnapshot;
  const dummyState = { url: '/dashboard' } as RouterStateSnapshot;

  beforeEach(() => {

    authServiceMock = {
      isLoggedIn: false
    };

    routerMock = {
      navigate: vi.fn()
    };

    TestBed.configureTestingModule({
      providers: [
        { provide: AuthService, useValue: authServiceMock },
        { provide: Router, useValue: routerMock }
      ]
    });
  });

  it('T-AG-01 : should return true if user is logged in', () => {

    authServiceMock.isLoggedIn = true;

    const result = TestBed.runInInjectionContext(() =>
      authGuard(dummyRoute, dummyState)
    );

    expect(result).toBe(true);
    expect(routerMock.navigate).not.toHaveBeenCalled();

  });

  it('T-AG-02 : should redirect to login if user not logged in', () => {

    authServiceMock.isLoggedIn = false;

    const result = TestBed.runInInjectionContext(() =>
      authGuard(dummyRoute, dummyState)
    );

    expect(result).toBe(false);
    expect(routerMock.navigate).toHaveBeenCalledTimes(1);
    expect(routerMock.navigate).toHaveBeenCalledWith(['/login']);

  });

});
