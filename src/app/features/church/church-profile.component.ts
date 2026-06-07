import {
  Component,
  OnInit,
  signal
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule }
  from '@angular/router';
import {
  ChurchService,
  Church
} from '../../core/services/church.service';
import {
  SermonService,
  Sermon
} from '../../core/services/sermon.service';
import { FollowService }
  from '../../core/services/follow.service';
import { AuthService }
  from '../../core/services/auth.service';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-church-profile',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './church-profile.component.html',
  styleUrls: ['./church-profile.component.scss']
})
export class ChurchProfileComponent implements OnInit {

  church = signal<Church | null>(null);
  sermons = signal<Sermon[]>([]);
  events = signal<any[]>([]);
  posts = signal<any[]>([]);
  isLoading = signal(true);
  activeTab = signal<'sermons' | 'events' | 'posts'>('sermons');
  isFollowing = signal(false);
  isFollowInProgress = signal(false);

  private api = 'http://localhost:8080/api';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private churchService: ChurchService,
    private sermonService: SermonService,
    private followService: FollowService,
    public authService: AuthService,
    private http: HttpClient
  ) {}

  ngOnInit() {
    this.route.params.subscribe(params => {
      const slug = params['slug'];
      this.loadChurch(slug);
    });
  }

  loadChurch(slug: string) {
    this.isLoading.set(true);
    this.churchService.getChurchBySlug(slug).subscribe({
      next: (church) => {
        this.church.set(church);
        this.isLoading.set(false);
        this.loadContent(church.id);
        this.checkFollowStatus(church.id);
      },
      error: () => {
        this.isLoading.set(false);
        this.router.navigate(['/discover']);
      }
    });
  }

  loadContent(churchId: number) {
    // Load sermons
    this.sermonService
      .getSermonsByChurch(churchId)
      .subscribe({
        next: (s) => this.sermons.set(s),
        error: () => {}
      });

    // Load events
    this.http.get<any[]>(
      `${this.api}/events/public/church/${churchId}`
    ).subscribe({
      next: (e) => this.events.set(e),
      error: () => {}
    });

    // Load posts
    this.http.get<any[]>(
      `${this.api}/posts/public/church/${churchId}`
    ).subscribe({
      next: (p) => this.posts.set(p),
      error: () => {}
    });
  }

  checkFollowStatus(churchId: number) {
    if (!this.authService.isLoggedIn()) return;

    this.followService
      .checkFollowStatus(churchId)
      .subscribe({
        next: (res) => {
          this.isFollowing.set(res.isFollowing);
        },
        error: () => {}
      });
  }

  toggleFollow() {
    if (!this.authService.isLoggedIn()) {
      this.router.navigate(['/auth/login']);
      return;
    }

    const churchId = this.church()?.id;
    if (!churchId) return;

    this.isFollowInProgress.set(true);

    const action$ = this.isFollowing()
      ? this.followService.unfollowChurch(churchId)
      : this.followService.followChurch(churchId);

    action$.subscribe({
      next: () => {
        const wasFollowing = this.isFollowing();
        this.isFollowing.set(!wasFollowing);
        // Update follower count
        this.church.update(c => c ? {
          ...c,
          followerCount: wasFollowing
            ? c.followerCount - 1
            : c.followerCount + 1
        } : c);
        this.isFollowInProgress.set(false);
      },
      error: () => this.isFollowInProgress.set(false)
    });
  }

  watchSermon(id: number) {
    if (this.authService.isLoggedIn()) {
      this.router.navigate(['/app/sermon', id]);
    } else {
      this.router.navigate(['/auth/login']);
    }
  }

  setTab(tab: 'sermons' | 'events' | 'posts') {
    this.activeTab.set(tab);
  }

  formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString(
      'en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      }
    );
  }

  getInitials(name: string): string {
    return name?.split(' ')
      .map(w => w[0])
      .join('')
      .substring(0, 2)
      .toUpperCase() || '';
  }

  getThumbnail(sermon: Sermon): string {
    if (sermon.thumbnailUrl) return sermon.thumbnailUrl;
    if (sermon.videoUrl) {
      return this.sermonService
        .getYouTubeThumbnail(sermon.videoUrl);
    }
    return '';
  }
}