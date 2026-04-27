import { CanActivateFn, ActivatedRouteSnapshot, Router } from '@angular/router';
import { inject } from '@angular/core';

export const authGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  const router = inject(Router);

  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');

  // ✅ Pas de token → redirige vers login
  if (!token) {
    router.navigate(['/login']);
    return false;
  }

  // ✅ Vérifie le rôle requis par la route
  const requiredRole = route.data['role'];
  if (requiredRole && role !== requiredRole) {
    router.navigate(['/login']);
    return false;
  }

  return true;
};