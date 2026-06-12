import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AdminService {

  private api = `${environment.apiUrl}`;

  constructor(private http: HttpClient) {}

  // ── Sermons ──────────────────────────
  uploadSermon(data: any): Observable<any> {
    return this.http.post(
      `${this.api}/sermons/upload`, data
    );
  }

  getMySermons(): Observable<any[]> {
    return this.http.get<any[]>(
      `${this.api}/sermons/my-sermons`
    );
  }

  updateSermon(id: number, data: any): Observable<any> {
    return this.http.put(
      `${this.api}/sermons/${id}`, data
    );
  }

  deleteSermon(id: number): Observable<any> {
    return this.http.delete(
      `${this.api}/sermons/${id}`
    );
  }

  // ── Events ───────────────────────────
  createEvent(data: any): Observable<any> {
    return this.http.post(
      `${this.api}/events/create`, data
    );
  }

  getMyEvents(): Observable<any[]> {
    return this.http.get<any[]>(
      `${this.api}/events/my-events`
    );
  }

  deleteEvent(id: number): Observable<any> {
    return this.http.delete(
      `${this.api}/events/${id}`
    );
  }

  // ── Posts ────────────────────────────
  createPost(data: any): Observable<any> {
    return this.http.post(
      `${this.api}/posts/create`, data
    );
  }

  deletePost(id: number): Observable<any> {
    return this.http.delete(
      `${this.api}/posts/${id}`
    );
  }

  // ── Prayer Requests ──────────────────
  getPrayerRequests(): Observable<any[]> {
    return this.http.get<any[]>(
      `${this.api}/prayers/public`
    );
  }

  // Get my posts
getMyPosts(): Observable<any[]> {
  return this.http.get<any[]>(
    `${this.api}/posts/my-posts`
  );
}

}