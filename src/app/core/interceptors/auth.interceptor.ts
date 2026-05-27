import { HttpInterceptorFn } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn =
  (req, next) => {

  // Get token from localStorage
  const token = localStorage.getItem('onebody_token');

  // If token exists → add to every request
  if (token) {
    const clonedReq = req.clone({
      headers: req.headers.set(
        'Authorization',
        `Bearer ${token}`
      )
    });
    return next(clonedReq);
  }

  // No token → send request as is
  return next(req);
};