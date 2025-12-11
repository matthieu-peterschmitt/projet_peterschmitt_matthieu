import type { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';
import { roleGuard } from './guards/role.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/pollutions',
    pathMatch: 'full',
  },
  {
    path: 'login',
    loadComponent: () => import('./components/login/login.component').then((m) => m.LoginComponent),
  },
  {
    path: 'register',
    loadComponent: () =>
      import('./components/register/register.component').then((m) => m.RegisterComponent),
  },
  {
    path: 'unauthorized',
    loadComponent: () =>
      import('./components/unauthorized/unauthorized.component').then(
        (m) => m.UnauthorizedComponent,
      ),
  },
  {
    path: 'pollutions',
    loadComponent: () =>
      import('./components/pollution-list/pollution-list.component').then(
        (m) => m.PollutionListComponent,
      ),
  },
  {
    path: 'pollution/new',
    loadComponent: () =>
      import('./components/pollution-form/pollution-form.component').then(
        (m) => m.PollutionFormComponent,
      ),
    canActivate: [authGuard],
  },
  {
    path: 'pollution/:id',
    loadComponent: () =>
      import('./components/pollution-detail/pollution-detail.component').then(
        (m) => m.PollutionDetailComponent,
      ),
  },
  {
    path: 'pollution/:id/edit',
    loadComponent: () =>
      import('./components/pollution-edit/pollution-edit.component').then(
        (m) => m.PollutionEditComponent,
      ),
    canActivate: [authGuard],
  },
  {
    path: 'users',
    loadComponent: () =>
      import('./components/user-list/user-list.component').then((m) => m.UserListComponent),
    canActivate: [authGuard],
  },
  {
    path: 'user/new',
    loadComponent: () =>
      import('./components/user-form/user-form.component').then((m) => m.UserFormComponent),
    canActivate: [roleGuard(['admin'])],
  },
  {
    path: 'favorites',
    loadComponent: () =>
      import('./components/favorites/favorites.component').then((m) => m.FavoritesComponent),
    canActivate: [authGuard],
  },
  {
    path: '**',
    redirectTo: '/pollutions',
  },
];
