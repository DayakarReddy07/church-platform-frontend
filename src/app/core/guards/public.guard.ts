import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

export const publicGuard: CanActivateFn = () => {
  const router = inject(Router);
  const token = localStorage.getItem('onebody_token');

  if (!token) {
    return true;
  }

  router.navigate(['/app/feed']);
  return false;
};