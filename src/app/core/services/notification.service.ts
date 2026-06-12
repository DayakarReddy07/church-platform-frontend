import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Notification {
  id: number;
  type: string;
  message: string;
  link: string;
  imageUrl: string;
  isRead: boolean;
  createdAt: string;
}

@Injectable({ providedIn: 'root' })
export class NotificationService {

  private api =
    `${environment.apiUrl}/notifications`;

  // Track unread count globally
  unreadCount = signal<number>(0);

  constructor(private http: HttpClient) {}

  // Get all notifications
  getNotifications(): Observable<Notification[]> {
    return this.http.get<Notification[]>(
      `${this.api}`
    );
  }

  // Get unread count
  getUnreadCount(): Observable<{count: number}> {
    return this.http.get<{count: number}>(
      `${this.api}/count`
    );
  }

  // Mark all as read
  markAllAsRead(): Observable<any> {
    return this.http.put(
      `${this.api}/read-all`, {}
    );
  }

  // Mark one as read
  markAsRead(id: number): Observable<any> {
    return this.http.put(
      `${this.api}/${id}/read`, {}
    );
  }

  // Load count and update signal
  loadUnreadCount() {
    this.getUnreadCount().subscribe({
      next: (res) => {
        this.unreadCount.set(res.count);
      },
      error: () => {}
    });
  }
}