import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
    { 
        path: '',
        component: HomeComponent 
    },
    { 
        path: 'login', 
        loadComponent: () => import('./pages/login/login.component').then(m => m.LoginComponent), 
        canActivate: [authGuard] 
    },
    { 
        path: 'registro', 
        loadComponent: () => import('./pages/registro/registro.component').then(m => m.RegistroComponent),
        canActivate: [authGuard] 
     },
    { 
        path: 'quien-soy', 
        loadComponent: () => import('./pages/quien-soy/quien-soy.component').then(m => m.QuienSoyComponent) 
    },
];