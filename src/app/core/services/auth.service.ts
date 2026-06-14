import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { filter, tap } from 'rxjs/operators';
import { firstValueFrom, Observable, Subject } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  SocialAuthService,
  GoogleLoginProvider,
  SocialUser,
} from '@abacritt/angularx-social-login';

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
  private pendingGoogleRole = 'MEMBER';
  // signal = Angular's new way to track state
  // Like a variable that auto updates the UI
  currentUser = signal<AuthUser | null>(this.getUserFromStorage());
// Observable that components can subscribe to
  googleAuthSuccess$ = new Subject<AuthUser>();
  googleAuthError$ = new Subject<string>();
  constructor(
    private http: HttpClient,
    private router: Router,
    private socialAuthService: SocialAuthService,
  ) {
      this.socialAuthService.authState
      .pipe(filter(user => user !== null))
      .subscribe((socialUser) => {
        this.sendGoogleTokenToBackend(socialUser.idToken, this.pendingGoogleRole)
          .then(user => this.googleAuthSuccess$.next(user))
          .catch(err => this.googleAuthError$.next(err?.error?.message || 'Google login failed!'));
      });
  }

  setGoogleRole(role: string) {
  this.pendingGoogleRole = role;
}

  // Register
  register(data: any) {
    return this.http
      .post<AuthUser>(`${this.apiUrl}/register`, data)
      .pipe(tap((user) => this.saveUser(user)));
  }

  // Login
  login(data: any) {
    return this.http
      .post<AuthUser>(`${this.apiUrl}/login`, data)
      .pipe(tap((user) => this.saveUser(user)));
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
    localStorage.setItem('onebody_user', JSON.stringify(user));
    this.currentUser.set(user);
  }

  //  Read user from localStorage
  private getUserFromStorage(): AuthUser | null {
    const user = localStorage.getItem('onebody_user');
    return user ? JSON.parse(user) : null;
  }

  // Update profile picture
  updateProfilePic(profilePicUrl: string): Observable<any> {
    return this.http
      .put(`${environment.apiUrl}/users/update-profile-pic`, {
        profilePic: profilePicUrl,
      })
      .pipe(
        tap((user: any) => {
          // Update stored user with new profilePic
          const currentUser = this.currentUser();
          if (currentUser) {
            const updatedUser = {
              ...currentUser,
              profilePic: profilePicUrl,
              token: user.token,
            };
            this.saveUser(updatedUser);
          }
        }),
      );
  }

//   // Google Login method
//   loginWithGoogle(role: string = 'MEMBER') {
//   return this.socialAuthService
//     .signIn(GoogleLoginProvider.PROVIDER_ID)
//     .then((socialUser: SocialUser) => {
//       return firstValueFrom(                    
//         this.http
//           .post<AuthUser>(`${this.apiUrl}/google`, {
//             token: socialUser.idToken,
//             role: role,
//           })
//           .pipe(tap((user) => this.saveUser(user)))
//       );
//     });
// }


// Call this once after Google button is clicked automatically
listenToGoogleAuth(role: string = 'MEMBER'): Promise<any> {
  return firstValueFrom(
    this.socialAuthService.authState.pipe(
      filter(user => user !== null)  // wait for actual user
    )
  ).then((socialUser: SocialUser) => {
    return firstValueFrom(
      this.http.post<AuthUser>(`${this.apiUrl}/google`, {
        token: socialUser.idToken,
        role: role
      }).pipe(tap(user => this.saveUser(user)))
    );
  });
}

  // Google Logout
  logoutGoogle() {
    this.socialAuthService.signOut().catch(() => {});
  }

  sendGoogleTokenToBackend(idToken: string, role: string): Promise<any> {
  return firstValueFrom(
    this.http.post<AuthUser>(`${this.apiUrl}/google`, {
      token: idToken,
      role: role
    }).pipe(tap(user => this.saveUser(user)))
  );
}
}
