import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Prayer {
  id: number;
  content: string;
  isPublic: boolean;
  userName: string;
  churchName: string;
  prayerCount: number;
  isPraying: boolean;
  createdAt: string;
}

@Injectable({ providedIn: 'root' })
export class PrayerService {

  private api = `${environment.apiUrl}/prayers`;

  constructor(private http: HttpClient) {}

  // Get all public prayers
  getPublicPrayers(): Observable<Prayer[]> {
    return this.http.get<Prayer[]>(`${this.api}/public`);
  }

  // Submit prayer request
  submitPrayer(data: any): Observable<Prayer> {
    return this.http.post<Prayer>(`${this.api}/submit`, data);
  }

  // Toggle praying
  togglePraying(prayerId: number): Observable<any> {
    return this.http.post(
      `${this.api}/${prayerId}/pray`, {}
    );
  }

  // Get my prayers
  getMyPrayers(): Observable<Prayer[]> {
    return this.http.get<Prayer[]>(`${this.api}/my-prayers`);
  }
}