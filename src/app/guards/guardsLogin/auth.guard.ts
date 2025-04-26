import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../../services/auth/auth.service';

export const authGuard: CanActivateFn = async (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  console.log("Entro al guard");

  const session = await authService.getSession();

  if (session) {
    router.navigate(['/']);
    return false;
  }
  return true;
};
