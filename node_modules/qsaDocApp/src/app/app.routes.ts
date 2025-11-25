import { Router, Routes } from '@angular/router';
import { Auth } from './services/auth';
import { inject } from '@angular/core';

const authGuard = () => {
  const authService = inject(Auth);
  const router = inject(Router);

  if (authService.name) {
    return true;
  }
  router.navigate(['/login']);
  return false;
};

export const routes: Routes = [
  {
    path: 'home',
    loadComponent: () => import('./home/home.page').then((m) => m.HomePage),
  },
  {
    path: '',
    redirectTo: 'chat',
    pathMatch: 'full',
  },
  {
    path: 'login',
    loadComponent: () => import('./login/login.page').then( m => m.LoginPage)
  },
  {
    path: 'chat',
    loadComponent: () => import('./chat/chat.page').then( m => m.ChatPage),
    canActivate: [authGuard],
  },
];
