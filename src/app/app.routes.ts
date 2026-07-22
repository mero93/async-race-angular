import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'garage',
    loadComponent: () => import('./pages/garage/garage'),
    title: 'Garage',
  },
  {
    path: 'winners',
    loadComponent: () => import('./pages/winners/winners'),
    title: 'Winners',
  },
  {
    path: '**',
    redirectTo: 'garage',
  },
];
