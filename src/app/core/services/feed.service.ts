import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface FeedItem {
  itemType: 'POST' | 'SERMON' | 'EVENT';
  id: number;
  title: string;
  content: string;
  imageUrl: string;

  // Sermon fields
  videoUrl: string;
  speaker: string;
  series: string;

  // Event fields
  eventDate: string;
  location: string;
  isOnline: boolean;
  registrationCount: number;
  isRegistered: boolean; 

  // Post fields
  likeCount: number;
  commentCount: number;
  isLiked: boolean;
  postType: string;

  // Church info
  churchId: number;
  churchName: string;
  churchSlug: string;
  churchLogo: string;

  // Author
  authorName: string;
  createdAt: string;
}

export interface FeedStats {
  followingCount: number;
  totalSermons: number;
  totalEvents: number;
  totalPosts: number;
  upcomingEvents: any[];
  suggestedChurches: any[];
}

@Injectable({ providedIn: 'root' })
export class FeedService {

  private api = `${environment.apiUrl}`;

  constructor(private http: HttpClient) {}

  // Get personalized feed
  getFeed(): Observable<FeedItem[]> {
    return this.http.get<FeedItem[]>(`${this.api}/feed`);
  }

  // Get discover feed
  getDiscoverFeed(): Observable<FeedItem[]> {
    return this.http.get<FeedItem[]>(`${this.api}/feed/discover`);
  }

  // Get feed stats
  getFeedStats(): Observable<FeedStats> {
    return this.http.get<FeedStats>(`${this.api}/feed/stats`);
  }

  // Like/Unlike post
  toggleLike(postId: number): Observable<any> {
    return this.http.post(
      `${this.api}/posts/${postId}/like`, {}
    );
  }

  // Follow/Unfollow church
  followChurch(churchId: number): Observable<any> {
    return this.http.post(
      `${this.api}/follows/${churchId}`, {}
    );
  }

  // Get public churches
  getChurches(): Observable<any[]> {
    return this.http.get<any[]>(
      `${this.api}/churches/public`
    );
  }

  // Register for event
registerForEvent(eventId: number): Observable<any> {
  return this.http.post(
    `${this.api}/events/${eventId}/register`, {}
  );
}

// Cancel event registration
cancelRegistration(eventId: number): Observable<any> {
  return this.http.delete(
    `${this.api}/events/${eventId}/register`
  );
}

getFollowedChurches(): Observable<any[]> {
  return this.http.get<any[]>(
    `${this.api}/follows/my-churches`
  );
}
}