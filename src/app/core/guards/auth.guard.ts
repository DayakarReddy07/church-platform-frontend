import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

export const authGuard: CanActivateFn = () => {
  const router = inject(Router);
  const token = localStorage.getItem('onebody_token');

  if (token) {
    return true; // logged in → allow access
  }

  //  not logged in → go to login
  router.navigate(['/auth/login']);
  return false;
};