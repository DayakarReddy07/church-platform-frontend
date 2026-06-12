import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class UploadService {

  private api = `${environment.apiUrl}/upload`;
  constructor(private http: HttpClient) {}

  // Upload profile picture
  uploadProfile(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post(
      `${this.api}/profile`, formData
    );
  }

  // Upload church logo
  uploadChurchLogo(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post(
      `${this.api}/church-logo`, formData
    );
  }

  // Upload post image
  uploadPostImage(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post(
      `${this.api}/post-image`, formData
    );
  }

  // Upload sermon thumbnail
  uploadSermonThumbnail(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post(
      `${this.api}/sermon-thumbnail`, formData
    );
  }
}