import { Routes } from '@angular/router';
import { AdminGuard } from './core/guards/admin.guard';

export const routes: Routes = [
  { path: '', redirectTo: '/home', pathMatch: 'full' },

  {
    path: 'home',
    loadComponent: () => import('./features/home/home.component').then(m => m.HomeComponent),
    title: 'TopServers - Best Web Hosting'
  },
  {
    path: 'signin',
    loadComponent: () => import('./auth/signin/signin.component').then(m => m.SigninComponent),
    title: 'Sign In - TopServers'
  },
  {
    path: 'signup',
    loadComponent: () => import('./auth/signup/signup.component').then(m => m.SignupComponent),
    title: 'Sign Up - TopServers'
  },
  {
    path: 'dedicated',
    loadComponent: () => import('./features/dedicated/dedicated.component').then(m => m.DedicatedComponent),
    title: 'Dedicated Hosting - TopServers'
  },
  {
    path: 'admin/dashboard',
    canActivate: [AdminGuard],
    loadComponent: () => import('./admin/dashboard/dashboard.component').then(m => m.DashboardComponent),
    title: 'Admin Dashboard - TopServers'
  },
  {
    path: 'admin/users',
    canActivate: [AdminGuard],
    loadComponent: () => import('./admin/users/users-list.component').then(m => m.UsersListComponent),
    title: 'Admin - Users'
  },
  {
    path: 'admin/users/new',
    canActivate: [AdminGuard],
    loadComponent: () => import('./admin/users/user-edit.component').then(m => m.UserEditComponent),
    title: 'Admin - Add User'
  },
  {
    path: 'admin/users/:id/edit',
    canActivate: [AdminGuard],
    loadComponent: () => import('./admin/users/user-edit.component').then(m => m.UserEditComponent),
    title: 'Admin - Edit User'
  },
  {
    path: 'admin/vps',
    canActivate: [AdminGuard],
    loadComponent: () => import('./admin/vps/vps-list.component').then(m => m.VpsListComponent),
    title: 'Admin - VPS'
  },
  {
    path: 'admin/vps/new',
    canActivate: [AdminGuard],
    loadComponent: () => import('./admin/vps/vps-edit.component').then(m => m.VpsEditComponent),
    title: 'Admin - Add VPS'
  },
  {
    path: 'admin/vps/:id/edit',
    canActivate: [AdminGuard],
    loadComponent: () => import('./admin/vps/vps-edit.component').then(m => m.VpsEditComponent),
    title: 'Admin - Edit VPS'
  },
  {
    path: 'admin/dedicated',
    canActivate: [AdminGuard],
    loadComponent: () => import('./admin/dedicated/dedicated-list.component').then(m => m.DedicatedListComponent),
    title: 'Admin - Dedicated'
  },
  {
    path: 'admin/dedicated/new',
    canActivate: [AdminGuard],
    loadComponent: () => import('./admin/dedicated/dedicated-edit.component').then(m => m.DedicatedEditComponent),
    title: 'Admin - Add Dedicated'
  },
  {
    path: 'admin/dedicated/:id/edit',
    canActivate: [AdminGuard],
    loadComponent: () => import('./admin/dedicated/dedicated-edit.component').then(m => m.DedicatedEditComponent),
    title: 'Admin - Edit Dedicated'
  },
  {
    path: 'admin/promos',
    canActivate: [AdminGuard],
    loadComponent: () => import('./admin/promos/promos-list.component').then(m => m.PromosListComponent),
    title: 'Admin - Promos'
  },
  {
    path: 'admin/promos/new',
    canActivate: [AdminGuard],
    loadComponent: () => import('./admin/promos/promo-edit.component').then(m => m.PromoEditComponent),
    title: 'Admin - New Promo'
  },
  {
    path: 'admin/promos/:id/edit',
    canActivate: [AdminGuard],
    loadComponent: () => import('./admin/promos/promo-edit.component').then(m => m.PromoEditComponent),
    title: 'Admin - Edit Promo'
  },
  {
    path: 'admin/packages',
    canActivate: [AdminGuard],
    loadComponent: () => import('./admin/packages/packages-list.component').then(m => m.PackagesListComponent),
    title: 'Admin - Packages'
  },
  {
    path: 'admin/packages/new',
    canActivate: [AdminGuard],
    loadComponent: () => import('./admin/packages/package-edit.component').then(m => m.PackageEditComponent),
    title: 'Admin - New Package'
  },
  {
    path: 'admin/packages/:id/edit',
    canActivate: [AdminGuard],
    loadComponent: () => import('./admin/packages/package-edit.component').then(m => m.PackageEditComponent),
    title: 'Admin - Edit Package'
  },
  {
    path: 'vps',
    loadComponent: () => import('./features/vps/vps.component').then(m => m.VpsComponent),
    title: 'VPS Hosting - TopServers'
  },
  {
    path: 'promos',
    loadComponent: () => import('./features/promos/promos.component').then(m => m.PromosComponent),
    title: 'Promos & Special Offers'
  },
  {
    path: 'contact',
    loadComponent: () => import('./features/contact/contact.component').then(m => m.ContactComponent),
    title: 'Contact Us - TopServers'
  },

  { path: '**', redirectTo: '/home' }
];
