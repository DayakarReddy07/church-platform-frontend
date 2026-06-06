import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class FollowService {
  private api = 'http://localhost:8080/api/follows';

  constructor(private http: HttpClient) {}

  followChurch(churchId: number): Observable<any> {
    return this.http.post(`${this.api}/${churchId}`, {});
  }

  unfollowChurch(churchId: number): Observable<any> {
    return this.http.delete(`${this.api}/${churchId}`);
  }

  checkFollowStatus(churchId: number): Observable<any> {
    return this.http.get(`${this.api}/${churchId}/status`);
  }
}
