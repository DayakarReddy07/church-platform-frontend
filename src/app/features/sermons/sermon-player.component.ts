import { Component, OnInit, signal, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { SermonService, Sermon } from '../../core/services/sermon.service';
import { FollowService } from '../../core/services/follow.service';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-sermon-player',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './sermon-player.component.html',
  styleUrls: ['./sermon-player.component.scss'],
})
export class SermonPlayerComponent implements OnInit, OnDestroy {
  sermon = signal<Sermon | null>(null);
  relatedSermons = signal<Sermon[]>([]);
  isLoading = signal(true);
  isPlaying = signal(false);
  embedUrl = signal<SafeResourceUrl | null>(null);
  isSaved = signal(false);
  isFollowing = signal(false);

  private sermonId: number = 0;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private sermonService: SermonService,
    private sanitizer: DomSanitizer,
    public authService: AuthService,
  ) {}

  ngOnInit() {
    // Get sermon ID from URL
    this.route.params.subscribe((params) => {
      this.sermonId = +params['id'];
      this.loadSermon();
    });
  }

  ngOnDestroy() {
    // Stop video when leaving page
    this.isPlaying.set(false);
  }

  loadSermon() {
    this.isLoading.set(true);
    this.isPlaying.set(false);

    this.sermonService.getSermonById(this.sermonId).subscribe({
      next: (sermon) => {
        this.sermon.set(sermon);
        this.isLoading.set(false);
        this.loadRelatedSermons(sermon.churchId);

        // Generate thumbnail if missing
        if (!sermon.thumbnailUrl && sermon.videoUrl) {
          const thumb = this.sermonService.getYouTubeThumbnail(sermon.videoUrl);
          this.sermon.update((s) => (s ? { ...s, thumbnailUrl: thumb } : s));
        }
      },
      error: () => {
        this.isLoading.set(false);
        this.router.navigate(['/app/feed']);
      },
    });
  }

  loadRelatedSermons(churchId: number) {
    this.sermonService.getSermonsByChurch(churchId).subscribe({
      next: (sermons) => {
        // Exclude current sermon
        this.relatedSermons.set(
          sermons.filter((s) => s.id !== this.sermonId).slice(0, 6),
        );
      },
    });
  }

  navigateToFeed() {
  this.router.navigate(['/app/feed']);
}

  // Play video
  playVideo() {
    const sermon = this.sermon();
    if (!sermon?.videoUrl) return;

    const embedUrl = this.sermonService.getYouTubeEmbedUrl(sermon.videoUrl);

    if (embedUrl) {
      // Sanitize URL for Angular
      this.embedUrl.set(
        this.sanitizer.bypassSecurityTrustResourceUrl(embedUrl),
      );
      this.isPlaying.set(true);
    } else {
      // Open in new tab if not YouTube
      window.open(sermon.videoUrl, '_blank');
    }
  }

  // Navigate to related sermon
  watchSermon(id: number) {
    this.router.navigate(['/app/sermon', id]);
  }

  // Toggle save
  toggleSave() {
    this.isSaved.update((v) => !v);
  }

  // Share sermon
  shareSermon() {
    const url = window.location.href;
    if (navigator.share) {
      navigator.share({
        title: this.sermon()?.title || '',
        text: `Watch "${this.sermon()?.title}" by ${this.sermon()?.speaker}`,
        url: url,
      });
    } else {
      navigator.clipboard.writeText(url);
      alert('Link copied to clipboard! 📋');
    }
  }

  // Format date
  formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  }

  // Get initials
  getInitials(name: string): string {
    return (
      name
        ?.split(' ')
        .map((w) => w[0])
        .join('')
        .substring(0, 2)
        .toUpperCase() || ''
    );
  }

  // Get thumbnail with fallback
  getThumbnail(sermon: Sermon): string {
    if (sermon.thumbnailUrl) return sermon.thumbnailUrl;
    if (sermon.videoUrl) {
      return this.sermonService.getYouTubeThumbnail(sermon.videoUrl);
    }
    return '';
  }
}
