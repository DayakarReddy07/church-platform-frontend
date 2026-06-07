import { Component, signal, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule, NavigationEnd } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { debounceTime, distinctUntilChanged, filter } from 'rxjs/operators';
import { FormsModule } from '@angular/forms';
import {
  SearchResult,
  SearchService,
} from '../../core/services/search.service';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './app-layout.component.html',
  styleUrls: ['./app-layout.component.scss'],
})
export class AppLayoutComponent {
  isSidebarOpen = signal(true);
  isMobile = signal(false);
  currentRoute = signal('');
  showProfileMenu = signal(false);
  notificationCount = signal(3);

  searchKeyword = signal('');
  searchResults = signal<SearchResult[]>([]);
  isSearching = signal(false);
  showSearchResults = signal(false);

  private searchSubject = new Subject<string>();

  navItems = [
    {
      icon: '🏠',
      label: 'My Feed',
      route: '/app/feed',
      badge: null,
    },
    {
      icon: '🔍',
      label: 'Discover',
      route: '/app/discover',
      badge: null,
    },
    {
      icon: '⛪',
      label: 'My Churches',
      route: '/app/churches',
      badge: null,
    },
    {
      icon: '🎵',
      label: 'Sermons',
      route: '/app/sermons',
      badge: null,
    },
    {
      icon: '📅',
      label: 'Events',
      route: '/app/events',
      badge: null,
    },
    {
      icon: '🙏',
      label: 'Prayer Wall',
      route: '/app/prayer',
      badge: null,
    },
    {
      icon: '👤',
      label: 'My Profile',
      route: '/app/profile',
      badge: null,
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
    private router: Router,
    private searchService: SearchService,
  ) {
    // Track current route for active state
    this.router.events
      .pipe(filter((e) => e instanceof NavigationEnd))
      .subscribe((e: any) => {
        this.currentRoute.set(e.url);
      });

    this.checkScreenSize();

    // (waits 300ms after user stops typing)
    this.searchSubject
      .pipe(debounceTime(300), distinctUntilChanged())
      .subscribe((keyword) => {
        if (keyword.trim().length >= 2) {
          this.performSearch(keyword);
        } else {
          this.searchResults.set([]);
          this.showSearchResults.set(false);
        }
      });
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
    this.isSidebarOpen.update((v) => !v);
  }

  toggleProfileMenu() {
    this.showProfileMenu.update((v) => !v);
  }

  isActive(route: string): boolean {
    return this.currentRoute().startsWith(route);
  }

  isAdmin(): boolean {
    return (
      this.authService.getRole() === 'CHURCH_ADMIN' ||
      this.authService.getRole() === 'SUPER_ADMIN'
    );
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
    return name
      .split(' ')
      .map((w) => w[0])
      .join('')
      .substring(0, 2)
      .toUpperCase();
  }

  // Called when user types in search
  onSearchInput(keyword: string) {
    this.searchKeyword.set(keyword);
    this.searchSubject.next(keyword);
    if (keyword.length > 0) {
      this.showSearchResults.set(true);
    }
  }

  // Perform actual search
  performSearch(keyword: string) {
    this.isSearching.set(true);
    this.searchService.searchAll(keyword).subscribe({
      next: (results) => {
        this.searchResults.set(results);
        this.isSearching.set(false);
        this.showSearchResults.set(true);
      },
      error: () => this.isSearching.set(false),
    });
  }

  // Navigate to search result
  goToResult(result: SearchResult) {
    this.showSearchResults.set(false);
    this.searchKeyword.set('');
    this.searchResults.set([]);

    switch (result.type) {
      case 'CHURCH':
        this.router.navigate(['/church', result.slug]);
        break;
      case 'SERMON':
        this.router.navigate(['/app/sermon', result.id]);
        break;
      case 'EVENT':
        this.router.navigate(['/app/events']);
        break;
      case 'POST':
        this.router.navigate(['/app/feed']);
        break;
    }
  }

  // Clear search
  clearSearch() {
    this.searchKeyword.set('');
    this.searchResults.set([]);
    this.showSearchResults.set(false);
  }

  // Close search on outside click
  closeSearch() {
    setTimeout(() => {
      this.showSearchResults.set(false);
    }, 200);
  }

  // Get type icon
  getTypeIcon(type: string): string {
    switch (type) {
      case 'CHURCH':
        return '⛪';
      case 'SERMON':
        return '🎵';
      case 'EVENT':
        return '📅';
      case 'POST':
        return '📝';
      default:
        return '🔍';
    }
  }

  // Get initials for image fallback
  getResultInitials(title: string): string {
    return (
      title
        ?.split(' ')
        .map((w) => w[0])
        .join('')
        .substring(0, 2)
        .toUpperCase() || ''
    );
  }
}
