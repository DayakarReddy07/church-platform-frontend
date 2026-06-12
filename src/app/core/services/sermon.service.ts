import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Sermon {
  id: number;
  title: string;
  description: string;
  videoUrl: string;
  audioUrl: string;
  thumbnailUrl: string;
  speaker: string;
  series: string;
  churchId: number;
  churchName: string;
  churchSlug: string;
  churchLogo: string;
  createdAt: string;
}

@Injectable({ providedIn: 'root' })
export class SermonService {

  private api = `${environment.apiUrl}/sermons`;

  constructor(private http: HttpClient) {}

  // Get sermon by id
  getSermonById(id: number): Observable<Sermon> {
    return this.http.get<Sermon>(
      `${this.api}/public/${id}`
    );
  }

  // Get sermons by church
  getSermonsByChurch(
    churchId: number
  ): Observable<Sermon[]> {
    return this.http.get<Sermon[]>(
      `${this.api}/public/church/${churchId}`
    );
  }

  // Get all sermons paginated
  getAllSermons(
    page: number = 0,
    size: number = 10
  ): Observable<any> {
    return this.http.get<any>(
      `${this.api}/public?page=${page}&size=${size}`
    );
  }

  // Search sermons
  searchSermons(keyword: string): Observable<Sermon[]> {
    return this.http.get<Sermon[]>(
      `${this.api}/search?keyword=${keyword}`
    );
  }

  // Extract YouTube video ID from URL
  getYouTubeId(url: string): string {
    if (!url) return '';

    // Handle different YouTube URL formats
    const patterns = [
      /youtube\.com\/watch\?v=([^&]+)/,
      /youtu\.be\/([^?]+)/,
      /youtube\.com\/embed\/([^?]+)/,
      /youtube\.com\/shorts\/([^?]+)/,
    ];

    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) return match[1];
    }

    return '';
  }

  // Get YouTube embed URL
  getYouTubeEmbedUrl(url: string): string {
    const videoId = this.getYouTubeId(url);
    if (!videoId) return '';
    return `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1`;
  }

  // Get YouTube thumbnail
  getYouTubeThumbnail(url: string): string {
    const videoId = this.getYouTubeId(url);
    if (!videoId) return '';
    return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
  }
}