import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, forkJoin } from 'rxjs';
import { map } from 'rxjs/operators';

export interface SearchResult {
  type: 'CHURCH' | 'SERMON' | 'EVENT' | 'POST';
  id: number;
  title: string;
  subtitle: string;
  imageUrl: string;
  slug?: string;
  churchName?: string;
}

@Injectable({ providedIn: 'root' })
export class SearchService {

  private api = 'http://localhost:8080/api';

  constructor(private http: HttpClient) {}

  // Search everything at once
  searchAll(keyword: string):
    Observable<SearchResult[]> {

    // Search churches, sermons in parallel
    return forkJoin({
      churches: this.http.get<any[]>(
        `${this.api}/churches/search?keyword=${keyword}`
      ),
      sermons: this.http.get<any[]>(
        `${this.api}/sermons/search?keyword=${keyword}`
      ),
    }).pipe(
      map(({ churches, sermons }) => {
        const results: SearchResult[] = [];

        // Map churches
        churches.forEach(c => results.push({
          type: 'CHURCH',
          id: c.id,
          title: c.name,
          subtitle: `📍 ${c.city}, ${c.state}`,
          imageUrl: c.logo || '',
          slug: c.slug
        }));

        // Map sermons
        sermons.forEach(s => results.push({
          type: 'SERMON',
          id: s.id,
          title: s.title,
          subtitle: `🎤 ${s.speaker} · ${s.churchName}`,
          imageUrl: s.thumbnailUrl || '',
          churchName: s.churchName
        }));

        return results;
      })
    );
  }
}