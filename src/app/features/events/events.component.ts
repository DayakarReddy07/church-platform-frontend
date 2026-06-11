import {
  Component,
  OnInit,
  signal
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { AuthService }
  from '../../core/services/auth.service';

@Component({
  selector: 'app-events',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './events.component.html',
  styleUrls: ['./events.component.scss']
})
export class EventsComponent implements OnInit {

  events = signal<any[]>([]);
  myEvents = signal<any[]>([]);
  isLoading = signal(true);
  activeTab = signal<'upcoming' | 'mine'>('upcoming');

  private api = 'http://localhost:8080/api';

  constructor(
    private http: HttpClient,
    public authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadUpcomingEvents();
  }

  loadUpcomingEvents() {
    this.isLoading.set(true);
    this.http.get<any[]>(
      `${this.api}/events/upcoming`
    ).subscribe({
      next: (events) => {
        this.events.set(events);
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false)
    });
  }

  loadMyRegistrations() {
    this.http.get<any[]>(
      `${this.api}/events/my-registrations`
    ).subscribe({
      next: (events) => this.myEvents.set(events),
      error: () => {}
    });
  }

  switchTab(tab: 'upcoming' | 'mine') {
    this.activeTab.set(tab);
    if (tab === 'mine' &&
        this.myEvents().length === 0) {
      this.loadMyRegistrations();
    }
  }

  registerForEvent(eventId: number) {
    this.http.post(
      `${this.api}/events/${eventId}/register`,
      {}
    ).subscribe({
      next: () => {
        this.events.update(list =>
          list.map(e =>
            e.id === eventId
              ? {
                  ...e,
                  isRegistered: true,
                  registrationCount:
                    e.registrationCount + 1
                }
              : e
          )
        );
      },
      error: (err) => {
        alert(err.error?.message ||
          'Registration failed!');
      }
    });
  }

  formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString(
      'en-IN', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      }
    );
  }

  formatTime(dateStr: string): string {
    return new Date(dateStr).toLocaleTimeString(
      'en-IN', {
        hour: '2-digit',
        minute: '2-digit'
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