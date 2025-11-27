import { Routes } from '@angular/router';

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