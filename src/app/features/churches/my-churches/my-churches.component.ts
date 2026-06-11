import {
  Component,
  OnInit,
  signal
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule }
  from '@angular/router';
import { FeedService } from '../../../core/services/feed.service';
import { FollowService } from '../../../core/services/follow.service';


@Component({
  selector: 'app-my-churches',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './my-churches.component.html',
  styleUrls: ['./my-churches.component.scss']
})
export class MyChurchesComponent implements OnInit {

  churches = signal<any[]>([]);
  isLoading = signal(true);

  constructor(
    private feedService: FeedService,
    private followService: FollowService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadMyChurches();
  }

  loadMyChurches() {
    this.feedService.getFollowedChurches()
      .subscribe({
        next: (churches) => {
          this.churches.set(churches);
          this.isLoading.set(false);
        },
        error: () => this.isLoading.set(false)
      });
  }

  unfollowChurch(churchId: number) {
    this.followService
      .unfollowChurch(churchId)
      .subscribe({
        next: () => {
          this.churches.update(list =>
            list.filter(c => c.id !== churchId)
          );
        }
      });
  }

  viewChurch(slug: string) {
    this.router.navigate(['/church', slug]);
  }

  getInitials(name: string): string {
    return name?.split(' ')
      .map((w: string) => w[0])
      .join('')
      .substring(0, 2)
      .toUpperCase() || '';
  }
}