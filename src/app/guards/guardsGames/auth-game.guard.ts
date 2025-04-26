import { inject } from '@angular/core';
import { CanActivateChildFn, Router } from '@angular/router';
import { AuthService } from '../../services/auth/auth.service';


export const authGameGuard: CanActivateChildFn = async (childRoute, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  
  // Verificar si el usuario tiene una sesión activa
  const session = await authService.getSession();
  
  if (!session) {
    // Si no está autenticado, redirigir al login
    router.navigate(['/login']);
    return false;
  }
  
  // Si está autenticado, permitir el acceso
  return true;
};


