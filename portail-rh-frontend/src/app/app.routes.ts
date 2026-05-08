import { Routes } from '@angular/router';
import { LoginComponent } from './features/auth/login/login';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },

  {
    path: 'dashboard',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/dashboard/dashboard').then(m => m.DashboardComponent)
  },

  {
    path: 'admin',
    canActivate: [authGuard],
    children: [
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./features/dashboard/admin-dashboard/admin-dashboard')
            .then(m => m.AdminDashboardComponent)
      },
      {
        path: 'employes/nouveau',
        loadComponent: () =>
          import('./features/dashboard/admin-dashboard/employe-form/employe-form')
            .then(m => m.EmployeFormComponent)
      },
      {
        path: 'changements',
        loadComponent: () =>
          import('./features/changement-situation/admin-changement-list/admin-changement-list')
            .then(m => m.AdminChangementListComponent)
      },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
    ]
  },

  {
    path: 'chef',
    canActivate: [authGuard],
    children: [
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./features/dashboard/chef-dashboard/chef-dashboard')
            .then(m => m.ChefDashboardComponent)
      },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
    ]
  },

  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./layouts/main-layout/main-layout')
        .then(m => m.MainLayoutComponent),
    children: [
      { path: 'conges',                loadComponent: () => import('./features/conges/conge-list/conge-list').then(m => m.CongeListComponent) },
      { path: 'conges/nouveau',        loadComponent: () => import('./features/conges/conge-form/conge-form').then(m => m.CongeFormComponent) },
      { path: 'prets',                 loadComponent: () => import('./features/prets/pret-list/pret-list').then(m => m.PretListComponent) },
      { path: 'prets/nouveau',         loadComponent: () => import('./features/prets/pret-form/pret-form').then(m => m.PretFormComponent) },
      { path: 'avances',               loadComponent: () => import('./features/avances/avance-list/avance-list').then(m => m.AvanceListComponent) },
      { path: 'avances/nouveau',       loadComponent: () => import('./features/avances/avance-form/avance-form').then(m => m.AvanceFormComponent) },
      { path: 'autorisations',         loadComponent: () => import('./features/autorisations/autorisation-list/autorisation-list').then(m => m.AutorisationListComponent) },
      { path: 'autorisations/nouveau', loadComponent: () => import('./features/autorisations/autorisation-form/autorisation-form').then(m => m.AutorisationFormComponent) },
      { path: 'documents',             loadComponent: () => import('./features/documents/document-list/document-list').then(m => m.DocumentListComponent) },
      { path: 'documents/nouveau',     loadComponent: () => import('./features/documents/document-form/document-form').then(m => m.DocumentFormComponent) },
      { path: 'profil',                loadComponent: () => import('./features/profil/profil-form/profil-form').then(m => m.ProfilFormComponent) },
      { path: 'changements',           loadComponent: () => import('./features/changement-situation/changement-list/changement-list').then(m => m.ChangementListComponent) },
      { path: 'changements/nouveau',   loadComponent: () => import('./features/changement-situation/changement-list/changement-form/changement-form').then(m => m.ChangementFormComponent) },
    ]
  },

  { path: '**', redirectTo: 'login' }
];