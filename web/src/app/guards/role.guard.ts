import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Store } from '@ngxs/store';
import { AuthState } from '../state/auth.state';

export const roleGuard = (allowedRoles: string[]): CanActivateFn => {
  return (route, state) => {
    const store = inject(Store);
    const router = inject(Router);

    const isAuthenticated = store.selectSnapshot(AuthState.isAuthenticated);
    const userRole = store.selectSnapshot(AuthState.userRole);

    if (!isAuthenticated) {
      router.navigate(['/login'], {
        queryParams: { returnUrl: state.url },
      });
      return false;
    }

    if (!userRole || !allowedRoles.includes(userRole)) {
      router.navigate(['/unauthorized']);
      return false;
    }

    return true;
  };
};
