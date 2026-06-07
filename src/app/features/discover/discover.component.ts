import {
  Component,
  OnInit,
  signal
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import {
  ChurchService,
  Church
} from '../../core/services/church.service';
import { FollowService }
  from '../../core/services/follow.service';
import { AuthService }
  from '../../core/services/auth.service';

@Component({
  selector: 'app-discover',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './discover.component.html',
  styleUrls: ['./discover.component.scss']
})
export class DiscoverComponent implements OnInit {

  churches = signal<Church[]>([]);
  filteredChurches = signal<Church[]>([]);
  isLoading = signal(true);
  searchKeyword = signal('');
  followingIds = signal<number[]>([]);
  followingInProgress = signal<number[]>([]);

  // Filter options
  selectedCity = signal('');
  cities = signal<string[]>([]);

  constructor(
    private churchService: ChurchService,
    private followService: FollowService,
    public authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadChurches();
  }

  loadChurches() {
    this.isLoading.set(true);
    this.churchService.getAllChurches().subscribe({
      next: (churches) => {
        this.churches.set(churches);
        this.filteredChurches.set(churches);
        this.isLoading.set(false);

        // Extract unique cities
        const uniqueCities = [
          ...new Set(
            churches
              .map(c => c.city)
              .filter(c => c)
          )
        ];
        this.cities.set(uniqueCities);
      },
      error: () => this.isLoading.set(false)
    });
  }

  // Search churches
  onSearch(keyword: string) {
    this.searchKeyword.set(keyword);
    this.applyFilters();
  }

  // Filter by city
  onCityFilter(city: string) {
    this.selectedCity.set(city);
    this.applyFilters();
  }

  // Apply all filters
  applyFilters() {
    let result = this.churches();
    const keyword = this.searchKeyword()
      .toLowerCase().trim();
    const city = this.selectedCity();

    if (keyword) {
      result = result.filter(c =>
        c.name.toLowerCase().includes(keyword) ||
        c.city?.toLowerCase().includes(keyword) ||
        c.description?.toLowerCase().includes(keyword)
      );
    }

    if (city) {
      result = result.filter(c => c.city === city);
    }

    this.filteredChurches.set(result);
  }

  // Clear filters
  clearFilters() {
    this.searchKeyword.set('');
    this.selectedCity.set('');
    this.filteredChurches.set(this.churches());
  }

  // Follow/Unfollow church
  toggleFollow(church: Church, event: Event) {
    event.stopPropagation();

    if (!this.authService.isLoggedIn()) {
      this.router.navigate(['/auth/login']);
      return;
    }

    // Add to in-progress
    this.followingInProgress.update(
      ids => [...ids, church.id]
    );

    const isFollowing = this.followingIds()
      .includes(church.id);

    const action$ = isFollowing
      ? this.followService.unfollowChurch(church.id)
      : this.followService.followChurch(church.id);

    action$.subscribe({
      next: () => {
        // Update following list
        if (isFollowing) {
          this.followingIds.update(
            ids => ids.filter(id => id !== church.id)
          );
          // Decrease count
          this.filteredChurches.update(churches =>
            churches.map(c =>
              c.id === church.id
                ? { ...c, followerCount: c.followerCount - 1 }
                : c
            )
          );
        } else {
          this.followingIds.update(
            ids => [...ids, church.id]
          );
          // Increase count
          this.filteredChurches.update(churches =>
            churches.map(c =>
              c.id === church.id
                ? { ...c, followerCount: c.followerCount + 1 }
                : c
            )
          );
        }

        // Remove from in-progress
        this.followingInProgress.update(
          ids => ids.filter(id => id !== church.id)
        );
      },
      error: () => {
        this.followingInProgress.update(
          ids => ids.filter(id => id !== church.id)
        );
      }
    });
  }

  isFollowing(churchId: number): boolean {
    return this.followingIds().includes(churchId);
  }

  isInProgress(churchId: number): boolean {
    return this.followingInProgress().includes(churchId);
  }

  // View church profile
  viewChurch(slug: string) {
    this.router.navigate(['/church', slug]);
  }

  getInitials(name: string): string {
    return name?.split(' ')
      .map(w => w[0])
      .join('')
      .substring(0, 2)
      .toUpperCase() || '';
  }
}