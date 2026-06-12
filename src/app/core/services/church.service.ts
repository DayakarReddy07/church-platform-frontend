import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Church {
  id: number;
  name: string;
  slug: string;
  description: string;
  logo: string;
  location: string;
  city: string;
  state: string;
  country: string;
  website: string;
  phone: string;
  verified: boolean;
  adminName: string;
  followerCount: number;
  createdAt: string;
}

@Injectable({ providedIn: 'root' })
export class ChurchService {

  private api = `${environment.apiUrl}`;

  constructor(private http: HttpClient) {}

  // Register church
  registerChurch(data: any): Observable<Church> {
    return this.http.post<Church>(
      `${this.api}/churches/register`, data
    );
  }

  // Get my church
  getMyChurch(): Observable<Church> {
    return this.http.get<Church>(
      `${this.api}/churches/my-church`
    );
  }

  // Update church
  updateChurch(id: number, data: any): Observable<Church> {
    return this.http.put<Church>(
      `${this.api}/churches/${id}`, data
    );
  }

  // Get all public churches
  getAllChurches(): Observable<Church[]> {
    return this.http.get<Church[]>(
      `${this.api}/churches/public`
    );
  }

  // Get church by slug
  getChurchBySlug(slug: string): Observable<Church> {
    return this.http.get<Church>(
      `${this.api}/churches/public/${slug}`
    );
  }
}