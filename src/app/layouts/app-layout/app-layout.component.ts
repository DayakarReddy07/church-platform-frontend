import { Component, signal, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule, NavigationEnd } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './app-layout.component.html',
  styleUrls: ['./app-layout.component.scss']
})
export class AppLayoutComponent {

  isSidebarOpen = signal(true);
  isMobile = signal(false);
  currentRoute = signal('');
  showProfileMenu = signal(false);
  notificationCount = signal(3);

  navItems = [
    {
      icon: '🏠',
      label: 'My Feed',
      route: '/app/feed',
      badge: null
    },
    {
      icon: '🔍',
      label: 'Discover',
      route: '/discover',
      badge: null
    },
    {
      icon: '⛪',
      label: 'My Churches',
      route: '/app/churches',
      badge: null
    },
    {
      icon: '🎵',
      label: 'Sermons',
      route: '/app/sermons',
      badge: null
    },
    {
      icon: '📅',
      label: 'Events',
      route: '/app/events',
      badge: null
    },
    {
      icon: '🙏',
      label: 'Prayer Wall',
      route: '/app/prayer',
      badge: null
    },
    {
      icon: '👤',
      label: 'My Profile',
      route: '/app/profile',
      badge: null
    },
  ];

  adminItems = [
    {
      icon: '📊',
      label: 'Dashboard',
      route: '/app/admin',
    },
    {
      icon: '🎵',
      label: 'Manage Sermons',
      route: '/app/admin/sermons',
    },
    {
      icon: '📅',
      label: 'Manage Events',
      route: '/app/admin/events',
    },
    {
      icon: '📝',
      label: 'Manage Posts',
      route: '/app/admin/posts',
    },
  ];

  constructor(
    public authService: AuthService,
    private router: Router
  ) {
    // Track current route for active state
    this.router.events.pipe(
      filter(e => e instanceof NavigationEnd)
    ).subscribe((e: any) => {
      this.currentRoute.set(e.url);
    });

    this.checkScreenSize();
  }

  @HostListener('window:resize')
  checkScreenSize() {
    const mobile = window.innerWidth < 1024;
    this.isMobile.set(mobile);
    if (mobile) {
      this.isSidebarOpen.set(false);
    } else {
      this.isSidebarOpen.set(true);
    }
  }

  toggleSidebar() {
    this.isSidebarOpen.update(v => !v);
  }

  toggleProfileMenu() {
    this.showProfileMenu.update(v => !v);
  }

  isActive(route: string): boolean {
    return this.currentRoute().startsWith(route);
  }

  isAdmin(): boolean {
    return this.authService.getRole() === 'CHURCH_ADMIN' ||
           this.authService.getRole() === 'SUPER_ADMIN';
  }

  navigateTo(route: string) {
    this.router.navigate([route]);
    if (this.isMobile()) {
      this.isSidebarOpen.set(false);
    }
  }

  logout() {
    this.authService.logout();
  }

  getUserInitials(): string {
    const name = this.authService.currentUser()?.name || '';
    return name.split(' ')
      .map(w => w[0])
      .join('')
      .substring(0, 2)
      .toUpperCase();
  }
}