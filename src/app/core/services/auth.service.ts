import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { tap } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface AuthUser {
  name: string;
  email: string;
  role: string;
  token: string;
  message: string;
  profilePic?: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {

  private apiUrl = `${environment.apiUrl}/auth`;

  // signal = Angular's new way to track state
  // Like a variable that auto updates the UI
  currentUser = signal<AuthUser | null>(
    this.getUserFromStorage()
  );

  constructor(
    private http: HttpClient,
    private router: Router
  ) {}

  // Register
  register(data: any) {
    return this.http
      .post<AuthUser>(`${this.apiUrl}/register`, data)
      .pipe(tap(user => this.saveUser(user)));
  }

  // Login
  login(data: any) {
    return this.http
      .post<AuthUser>(`${this.apiUrl}/login`, data)
      .pipe(tap(user => this.saveUser(user)));
  }

  // Logout
  logout() {
    localStorage.removeItem('onebody_token');
    localStorage.removeItem('onebody_user');
    this.currentUser.set(null);
    this.router.navigate(['/']);
  }

  // Check if logged in
  isLoggedIn(): boolean {
    return !!localStorage.getItem('onebody_token');
  }

  // Get token
  getToken(): string | null {
    return localStorage.getItem('onebody_token');
  }

  //  Get current user role
  getRole(): string {
    const user = this.currentUser();
    return user ? user.role : '';
  }

  //  Save user to localStorage
  public saveUser(user: AuthUser) {
    localStorage.setItem('onebody_token', user.token);
    localStorage.setItem(
      'onebody_user',
      JSON.stringify(user)
    );
    this.currentUser.set(user);
  }

  //  Read user from localStorage
  private getUserFromStorage(): AuthUser | null {
    const user = localStorage.getItem('onebody_user');
    return user ? JSON.parse(user) : null;
  }

  // Update profile picture
updateProfilePic(profilePicUrl: string): Observable<any> {
  return this.http.put(
    `${environment.apiUrl}/users/update-profile-pic`,
    { profilePic: profilePicUrl }
  ).pipe(
    tap((user: any) => {
      // Update stored user with new profilePic
      const currentUser = this.currentUser();
      if (currentUser) {
        const updatedUser = {
          ...currentUser,
          profilePic: profilePicUrl,
          token: user.token
        };
        this.saveUser(updatedUser);
      }
    })
  );
}
}