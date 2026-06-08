import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  // ─── Public Routes ────────────────────
  {
    path: '',
    loadComponent: () =>
      import('./features/landing/landing.component').then(
        (m) => m.LandingComponent,
      ),
  },
  {
    path: 'auth/login',
    loadComponent: () =>
      import('./features/auth/login/login.component').then(
        (m) => m.LoginComponent,
      ),
  },
  {
    path: 'auth/register',
    loadComponent: () =>
      import('./features/auth/register/register.component').then(
        (m) => m.RegisterComponent,
      ),
  },
  {
    path: 'church/:slug',
    loadComponent: () =>
      import('./features/church/church-profile.component').then(
        (m) => m.ChurchProfileComponent,
      ),
  },

  // ─── Protected Routes ─────────────────
  {
    path: 'app',
    loadComponent: () =>
      import('./layouts/app-layout/app-layout.component').then(
        (m) => m.AppLayoutComponent,
      ),
    canActivate: [authGuard],
    children: [
      {
        path: 'feed',
        loadComponent: () =>
          import('./features/feed/feed.component').then((m) => m.FeedComponent),
      },
      {
        path: 'events',
        loadComponent: () =>
          import('./features/events/events.component').then(
            (m) => m.EventsComponent,
          ),
      },
      {
        path: 'prayer',
        loadComponent: () =>
          import('./features/prayer/prayer.component').then(
            (m) => m.PrayerComponent,
          ),
      },
      {
        path: 'profile',
        loadComponent: () =>
          import('./features/profile/profile.component').then(
            (m) => m.ProfileComponent,
          ),
      },
      {
        path: 'admin',
        loadComponent: () =>
          import('./features/admin/admin.component').then(
            (m) => m.AdminComponent,
          ),
      },
      {
        path: 'sermon/:id',
        loadComponent: () =>
          import('./features/sermons/sermon-player.component').then(
            (m) => m.SermonPlayerComponent,
          ),
      },
      {
        path: 'discover',
        loadComponent: () =>
          import('./features/discover/discover.component').then(
            (m) => m.DiscoverComponent,
          ),
      },
      {
        path: 'super-admin',
        loadComponent: () =>
          import('./features/super-admin/super-admin.component').then(
            (m) => m.SuperAdminComponent,
          ),
      },
      { path: '', redirectTo: 'feed', pathMatch: 'full' },
    ],
  },

  // ─── Fallback ─────────────────────────
  { path: '**', redirectTo: '' },
];
