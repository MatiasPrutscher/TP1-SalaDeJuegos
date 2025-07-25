import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { authGuard } from './guards/guardsLogin/auth.guard';
import { authGameGuard } from './guards/guardsGames/auth-game.guard';

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
    {
        path: 'juegos',
        loadComponent: () => import('./pages/juegos/juegos.component').then(m => m.JuegosComponent),
        canActivateChild: [authGameGuard],
        children: [
            {
                path: 'ahorcado',
                loadComponent: () => import('./pages/juegos/ahorcado/ahorcado.component').then(m => m.AhorcadoComponent)
            },
            {
                path: 'mayor-menor',
                loadComponent: () => import('./pages/juegos/mayor-menor/mayor-menor.component').then(m => m.MayorMenorComponent)
            },
            {
                path: 'pokedexpedia',
                loadComponent: () => import('./pages/juegos/pokedexpedia/pokedexpedia.component').then(m => m.PokedexpediaComponent)
            },
            {
                path: 'galati',
                loadComponent: () => import('./pages/juegos/galati/galati.component').then(m => m.GalatiComponent)
            }
        ]
    },
    {
        path: 'chat',
        loadComponent: () => import('./pages/chat/chat.component').then(m => m.ChatComponent),
        canActivate: [authGameGuard]
    },
    {
        path: 'resultados',
        loadComponent: () => import('./pages/resultados/resultados.component').then(m => m.ResultadosComponent),
        canActivate: [authGameGuard]
    }
];