import { Routes } from '@angular/router';
import { LoginComponent } from './features/auth/login/login';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  // Redirection par défaut
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },

  // ✅ DASHBOARD EMPLOYÉ (UTILISATEUR)
  {
    path: 'dashboard',
    canActivate: [authGuard],
    data: { role: 'UTILISATEUR' },
    loadComponent: () =>
      import('./features/dashboard/dashboard').then(m => m.DashboardComponent)
  },

  // ✅ DASHBOARD ADMIN
  {
    path: 'admin',
    canActivate: [authGuard],
    data: { role: 'ADMIN' },
    children: [
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./features/dashboard/admin-dashboard/admin-dashboard')
            .then(m => m.AdminDashboardComponent)
      },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
    ]
  },

  // ✅ DASHBOARD CHEF
  {
    path: 'chef',
    canActivate: [authGuard],
    data: { role: 'CHEF' },
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

  // ✅ ROUTES COMMUNES (protégées, accessibles à tous les rôles)
  {
    path: 'conges',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/conges/conge-list/conge-list').then(m => m.CongeListComponent)
  },
  {
    path: 'conges/nouveau',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/conges/conge-form/conge-form').then(m => m.CongeFormComponent)
  },
  {
    path: 'prets',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/prets/pret-list/pret-list').then(m => m.PretListComponent)
  },
  {
    path: 'prets/nouveau',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/prets/pret-form/pret-form').then(m => m.PretFormComponent)
  },
  {
    path: 'avances',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/avances/avance-list/avance-list').then(m => m.AvanceListComponent)
  },
  {
  path: 'avances/nouveau',
  canActivate: [authGuard],
  loadComponent: () =>
    import('./features/avances/avance-form/avance-form').then(m => m.AvanceFormComponent)
},
  {
    path: 'autorisations',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/autorisations/autorisation-list/autorisation-list')
        .then(m => m.AutorisationListComponent)
  },
  {
    path: 'autorisations/nouveau',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/autorisations/autorisation-form/autorisation-form')
        .then(m => m.AutorisationFormComponent)
  },
    {
  path: 'documents/nouveau',
  canActivate: [authGuard],
  loadComponent: () =>
    import('./features/documents/document-form/document-form')
      .then(m => m.DocumentFormComponent)
},
  {
    path: 'documents',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/documents/document-list/document-list')
        .then(m => m.DocumentListComponent)
  },
  // Fallback — toute URL inconnue redirige vers login
  { path: '**', redirectTo: 'login' }
];