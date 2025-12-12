import { Routes } from '@angular/router';
import { AdminGuard } from './core/guards/admin.guard';

const sharedRoutes: Routes = [
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
    path: 'admin/vps',
    canActivate: [AdminGuard],
    loadComponent: () => import('./admin/vps/vps-list.component').then(m => m.VpsListComponent),
    title: 'Admin - VPS'
  },
  {
    path: 'admin/dedicated',
    canActivate: [AdminGuard],
    loadComponent: () => import('./admin/dedicated/dedicated.component').then(m => m.DedicatedComponent),
    title: 'Admin - Dedicated'
  },
  {
    path: 'order-checkout',
    loadComponent: () => import('./features/orders/orders.component').then(m => m.OrdersComponent)
  },
  {
    path: 'articles',
    loadComponent: () => import('./articles/home-articles/home-articles.component').then(m => m.HomeArticlesComponent),
  },
  {
    path: 'dedicated-vs-vps',
    loadComponent: () => import('./articles/dedicated-vs-vps/dedicated-vs-vps.component').then(m => m.DedicatedVsVpsComponent),
  },
  {
    path: 'beginners-guide',
    loadComponent: () => import('./articles/beginner-guide/beginner-guide.component').then(m => m.BeginnerGuideComponent),
  },
  {
    path: 'montage-guide',
    loadComponent: () => import('./articles/montage-guide/montage-guide.component').then(m => m.MontageGuideComponent),
  },
  {
    path: 'best-stores',
    loadComponent: () => import('./articles/best-store/best-store.component').then(m => m.BestStoreComponent),
  },
  {
    path: 'vps-protection',
    loadComponent: () => import('./articles/vps-protection/vps-protection.component').then(m => m.VpsProtectionComponent),
  },
  {
    path: 'best-vps-trading-ai',
    loadComponent: () => import('./articles/trading-ai-vps/trading-ai-vps.component').then(m => m.TradingAiVpsComponent),
  },
  {
    path: 'admin/promos',
    canActivate: [AdminGuard],
    loadComponent: () => import('./admin/promos/promos-list.component').then(m => m.PromosListComponent),
    title: 'Admin - Promos'
  },
  {
    path: 'admin/packages',
    canActivate: [AdminGuard],
    loadComponent: () => import('./admin/packages/packages-list.component').then(m => m.PackagesListComponent),
    title: 'Admin - Packages'
  },
  {
    path: 'admin/orders',
    canActivate: [AdminGuard],
    loadComponent: () => import('./admin/orders-control/orders-control.component').then(m => m.OrdersControlComponent),
    title: 'Admin - Packages'
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
];

export const routes: Routes = [
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  { path: 'ar', redirectTo: '/ar/home', pathMatch: 'full' },
  ...sharedRoutes,
  {
    path: 'ar',
    children: sharedRoutes.map(route => ({
      ...route,
      path: route.path || ''
    }))
  },
  { path: '**', redirectTo: '/home' }
];
