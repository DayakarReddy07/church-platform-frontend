import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface PlatformStats {
  totalChurches: number;
  verifiedChurches: number;
  pendingChurches: number;
  totalUsers: number;
  totalSermons: number;
  totalEvents: number;
}

@Injectable({ providedIn: 'root' })
export class SuperAdminService {

  private api =
    'http://localhost:8080/api/super-admin';

  constructor(private http: HttpClient) {}

  // Get platform stats
  getStats(): Observable<PlatformStats> {
    return this.http.get<PlatformStats>(
      `${this.api}/stats`
    );
  }

  // Get all churches
  getAllChurches(): Observable<any[]> {
    return this.http.get<any[]>(
      `${this.api}/churches`
    );
  }

  // Verify church
  verifyChurch(id: number): Observable<any> {
    return this.http.put(
      `${this.api}/churches/${id}/verify`, {}
    );
  }

  // Unverify church
  unverifyChurch(id: number): Observable<any> {
    return this.http.put(
      `${this.api}/churches/${id}/unverify`, {}
    );
  }

  // Delete church
  deleteChurch(id: number): Observable<any> {
    return this.http.delete(
      `${this.api}/churches/${id}`
    );
  }

  // Get all users
  getAllUsers(): Observable<any[]> {
    return this.http.get<any[]>(
      `${this.api}/users`
    );
  }

  // Toggle user status
  toggleUserStatus(id: number): Observable<any> {
    return this.http.put(
      `${this.api}/users/${id}/toggle`, {}
    );
  }
}