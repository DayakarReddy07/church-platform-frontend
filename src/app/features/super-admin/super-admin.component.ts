import {
  Component,
  OnInit,
  signal
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  SuperAdminService,
  PlatformStats
} from '../../core/services/super-admin.service';
import { Router } from '@angular/router';
import { AuthService }
  from '../../core/services/auth.service';

type SuperTab =
  'overview' | 'churches' | 'users';

@Component({
  selector: 'app-super-admin',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './super-admin.component.html',
  styleUrls: ['./super-admin.component.scss']
})
export class SuperAdminComponent implements OnInit {

  stats = signal<PlatformStats | null>(null);
  churches = signal<any[]>([]);
  users = signal<any[]>([]);
  isLoading = signal(true);
  activeTab = signal<SuperTab>('overview');
  toastMessage = signal('');
  filterVerified = signal
    <'all' | 'verified' | 'pending'
  >('all');

  constructor(
    private superAdminService: SuperAdminService,
    private router: Router,
    public authService: AuthService
  ) {}

  ngOnInit() {
    // Only super admin can access
    if (this.authService.getRole() !== 'SUPER_ADMIN') {
      this.router.navigate(['/app/feed']);
      return;
    }
    this.loadStats();
    this.loadChurches();
  }

  loadStats() {
    this.superAdminService.getStats().subscribe({
      next: (stats) => {
        this.stats.set(stats);
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false)
    });
  }

  loadChurches() {
    this.superAdminService.getAllChurches()
      .subscribe({
        next: (churches) => {
          this.churches.set(churches);
        },
        error: () => {}
      });
  }

  loadUsers() {
    this.superAdminService.getAllUsers().subscribe({
      next: (users) => this.users.set(users),
      error: () => {}
    });
  }

  setTab(tab: SuperTab) {
    this.activeTab.set(tab);
    if (tab === 'users' &&
        this.users().length === 0) {
      this.loadUsers();
    }
  }

  // Verify church
  verifyChurch(church: any) {
    this.superAdminService
      .verifyChurch(church.id)
      .subscribe({
        next: (res) => {
          this.churches.update(list =>
            list.map(c =>
              c.id === church.id
                ? { ...c, verified: true }
                : c
            )
          );
          this.showToast(res.message);
          this.loadStats();
        }
      });
  }

  // Unverify church
  unverifyChurch(church: any) {
    this.superAdminService
      .unverifyChurch(church.id)
      .subscribe({
        next: (res) => {
          this.churches.update(list =>
            list.map(c =>
              c.id === church.id
                ? { ...c, verified: false }
                : c
            )
          );
          this.showToast(res.message);
          this.loadStats();
        }
      });
  }

  // Delete church
  deleteChurch(church: any) {
    if (!confirm(
      `Delete "${church.name}"? This cannot be undone!`
    )) return;

    this.superAdminService
      .deleteChurch(church.id)
      .subscribe({
        next: (res) => {
          this.churches.update(list =>
            list.filter(c => c.id !== church.id)
          );
          this.showToast(res.message);
          this.loadStats();
        }
      });
  }

  // Toggle user status
  toggleUser(user: any) {
    this.superAdminService
      .toggleUserStatus(user.id)
      .subscribe({
        next: (res) => {
          this.users.update(list =>
            list.map(u =>
              u.id === user.id
                ? { ...u, enabled: !u.enabled }
                : u
            )
          );
          this.showToast(res.message);
        }
      });
  }

  // Filter churches
  getFilteredChurches(): any[] {
    const filter = this.filterVerified();
    if (filter === 'verified') {
      return this.churches()
        .filter(c => c.verified);
    }
    if (filter === 'pending') {
      return this.churches()
        .filter(c => !c.verified);
    }
    return this.churches();
  }

  // View church profile
  viewChurch(slug: string) {
    this.router.navigate(['/church', slug]);
  }

  // Show toast notification
  showToast(message: string) {
    this.toastMessage.set(message);
    setTimeout(() =>
      this.toastMessage.set(''), 3000
    );
  }

  // Format date
  formatDate(dateStr: string): string {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString(
      'en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      }
    );
  }

  // Get initials
  getInitials(name: string): string {
    return name?.split(' ')
      .map(w => w[0])
      .join('')
      .substring(0, 2)
      .toUpperCase() || '';
  }
}