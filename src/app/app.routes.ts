import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadChildren: () =>
      import('./features/users/users-module').then(m => m.UsersModule)
  },
  {
    path: '**',
    redirectTo: ''
  }
];
