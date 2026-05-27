import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { publicGuard } from './core/guards/public.guard';

export const routes: Routes = [
  // Public Layout Routes
  // {
  //   path: '',
  //   loadComponent: () =>
  //     import('./layouts/public-layout/public-layout.component')
  //       .then(m => m.PublicLayoutComponent),
  //   children: [
  //     {
  //       path: '',
  //       loadComponent: () =>
  //         import('./features/landing/landing.component')
  //           .then(m => m.LandingComponent),
  //     },
  //     {
  //       path: 'discover',
  //       loadComponent: () =>
  //         import('./features/discover/discover.component')
  //           .then(m => m.DiscoverComponent),
  //     },
  //     {
  //       path: 'church/:slug',
  //       loadComponent: () =>
  //         import('./features/church/church-profile.component')
  //           .then(m => m.ChurchProfileComponent),
  //     },
  //     {
  //       path: 'sermons',
  //       loadComponent: () =>
  //         import('./features/sermons/sermons.component')
  //           .then(m => m.SermonsComponent),
  //     },
  //   ]
  // },

  // // Auth Routes (no layout)
  // {
  //   path: 'auth',
  //   children: [
  //     {
  //       path: 'login',
  //       loadComponent: () =>
  //         import('./features/auth/login/login.component')
  //           .then(m => m.LoginComponent),
  //       canActivate: [publicGuard],
  //     },
  //     {
  //       path: 'register',
  //       loadComponent: () =>
  //         import('./features/auth/register/register.component')
  //           .then(m => m.RegisterComponent),
  //       canActivate: [publicGuard],
  //     },
  //   ]
  // },

  // // App Layout Routes (Protected)
  // {
  //   path: 'app',
  //   loadComponent: () =>
  //     import('./layouts/app-layout/app-layout.component')
  //       .then(m => m.AppLayoutComponent),
  //   canActivate: [authGuard],
  //   children: [
  //     {
  //       path: 'feed',
  //       loadComponent: () =>
  //         import('./features/feed/feed.component')
  //           .then(m => m.FeedComponent),
  //     },
  //     {
  //       path: 'events',
  //       loadComponent: () =>
  //         import('./features/events/events.component')
  //           .then(m => m.EventsComponent),
  //     },
  //     {
  //       path: 'prayer',
  //       loadComponent: () =>
  //         import('./features/prayer/prayer.component')
  //           .then(m => m.PrayerComponent),
  //     },
  //     {
  //       path: 'profile',
  //       loadComponent: () =>
  //         import('./features/profile/profile.component')
  //           .then(m => m.ProfileComponent),
  //     },
  //     {
  //       path: 'admin',
  //       loadComponent: () =>
  //         import('./features/admin/admin.component')
  //           .then(m => m.AdminComponent),
  //     },
  //   ]
  // },
{
    path: '',
    loadComponent: () =>
      import('./features/landing/landing.component')
        .then(m => m.LandingComponent),
  },
  {
    path: 'auth/login',
    loadComponent: () =>
      import('./features/auth/login/login.component')
        .then(m => m.LoginComponent),
  },
  {
    path: 'auth/register',
    loadComponent: () =>
      import('./features/auth/register/register.component')
        .then(m => m.RegisterComponent),
  },
  // Fallback
  { path: '**', redirectTo: '' }
];