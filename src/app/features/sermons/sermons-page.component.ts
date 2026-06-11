import {
  Component,
  OnInit,
  signal
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import {
  SermonService,
  Sermon
} from '../../core/services/sermon.service';

@Component({
  selector: 'app-sermons-page',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './sermons-page.component.html',
  styleUrls: ['./sermons-page.component.scss']
})
export class SermonsPageComponent implements OnInit {

  sermons = signal<Sermon[]>([]);
  isLoading = signal(true);
  currentPage = signal(0);
  totalPages = signal(0);
  hasMore = signal(false);

  constructor(
    private sermonService: SermonService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadSermons();
  }

  loadSermons(page: number = 0) {
    this.isLoading.set(true);
    this.sermonService.getAllSermons(page, 12)
      .subscribe({
        next: (data) => {
          if (page === 0) {
            this.sermons.set(data.content || []);
          } else {
            this.sermons.update(s =>
              [...s, ...(data.content || [])]
            );
          }
          this.totalPages.set(data.totalPages);
          this.hasMore.set(!data.isLast);
          this.isLoading.set(false);
        },
        error: () => this.isLoading.set(false)
      });
  }

  loadMore() {
    const next = this.currentPage() + 1;
    this.currentPage.set(next);
    this.loadSermons(next);
  }

  watchSermon(id: number) {
    this.router.navigate(['/app/sermon', id]);
  }

  getThumbnail(sermon: Sermon): string {
    if (sermon.thumbnailUrl) return sermon.thumbnailUrl;
    return this.sermonService
      .getYouTubeThumbnail(sermon.videoUrl);
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
}