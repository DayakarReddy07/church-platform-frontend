import {
  Component,
  OnInit,
  signal
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import {
  FeedService,
  FeedItem
} from '../../core/services/feed.service';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-feed',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './feed.component.html',
  styleUrls: ['./feed.component.scss']
})
export class FeedComponent implements OnInit {

  feedItems = signal<FeedItem[]>([]);
  stats = signal<any>(null);
  suggestedChurches = signal<any[]>([]);
  isLoading = signal(true);
  activeTab = signal<'feed' | 'discover'>('feed');
  skeletons = Array(5).fill(0);

  constructor(
    private feedService: FeedService,
    public authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadFeed();
    this.loadStats();
  }

  loadFeed() {
    this.isLoading.set(true);

    const feed$ = this.activeTab() === 'feed'
      ? this.feedService.getFeed()
      : this.feedService.getDiscoverFeed();

    feed$.subscribe({
      next: (items) => {
        this.feedItems.set(items);
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
      }
    });
  }

  loadStats() {
    this.feedService.getFeedStats().subscribe({
      next: (stats) => {
        this.stats.set(stats);
        this.suggestedChurches.set(
          stats.suggestedChurches || []
        );
      }
    });
  }

  switchTab(tab: 'feed' | 'discover') {
    this.activeTab.set(tab);
    this.loadFeed();
  }

  toggleLike(item: FeedItem) {
    this.feedService.toggleLike(item.id).subscribe({
      next: (res) => {
        // Update item in feed
        this.feedItems.update(items =>
          items.map(i => {
            if (i.id === item.id && i.itemType === 'POST') {
              return {
                ...i,
                isLiked: res.isLiked,
                likeCount: res.likeCount
              };
            }
            return i;
          })
        );
      }
    });
  }

  followChurch(churchId: number) {
    this.feedService.followChurch(churchId).subscribe({
      next: () => {
        // Remove from suggested
        this.suggestedChurches.update(churches =>
          churches.filter(c => c.id !== churchId)
        );
        // Reload feed
        this.loadFeed();
      }
    });
  }

  getTimeAgo(dateStr: string): string {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  }

  getEventDate(dateStr: string): string {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  }

  getChurchInitials(name: string): string {
    return name?.split(' ')
      .map((w: string) => w[0])
      .join('')
      .substring(0, 2)
      .toUpperCase() || '';
  }

  getUserInitials(): string {
    const name = this.authService.currentUser()?.name || '';
    return name.split(' ')
      .map(w => w[0])
      .join('')
      .substring(0, 2)
      .toUpperCase();
  }

  registerForEvent(item: FeedItem) {
  if (item.isRegistered) {
    // Cancel registration
    this.feedService
      .cancelRegistration(item.id)
      .subscribe({
        next: () => {
          this.feedItems.update(items =>
            items.map(i => {
              if (i.id === item.id &&
                  i.itemType === 'EVENT') {
                return {
                  ...i,
                  isRegistered: false,
                  registrationCount:
                    (i.registrationCount || 0) - 1
                };
              }
              return i;
            })
          );
        }
      });
  } else {
    // Register
    this.feedService
      .registerForEvent(item.id)
      .subscribe({
        next: () => {
          this.feedItems.update(items =>
            items.map(i => {
              if (i.id === item.id &&
                  i.itemType === 'EVENT') {
                return {
                  ...i,
                  isRegistered: true,
                  registrationCount:
                    (i.registrationCount || 0) + 1
                };
              }
              return i;
            })
          );
        },
        error: (err) => {
          alert(err.error?.message ||
            'Registration failed!');
        }
      });
  }
}

watchSermon(sermonId: number) {
  this.router.navigate(['/app/sermon', sermonId]);
}

}