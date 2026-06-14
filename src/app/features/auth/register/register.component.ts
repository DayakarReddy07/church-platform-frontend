import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { GoogleSigninButtonModule } from '@abacritt/angularx-social-login';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule, GoogleSigninButtonModule],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent {

  registerForm: FormGroup;
  isLoading = signal(false);
  errorMessage = signal('');
  showPassword = signal(false);
  selectedRole = signal<'MEMBER' | 'CHURCH_ADMIN'>('MEMBER');
  stars: any[] = [];
  isGoogleLoading = signal(false);
  googleError = signal('');

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.registerForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      role: ['MEMBER']
    });

    this.generateStars();
    this.authService.googleAuthSuccess$.subscribe((user: any) => {
    if (user?.role === 'CHURCH_ADMIN') {
      this.router.navigate(['/app/admin']);
    } else {
      this.router.navigate(['/app/feed']);
    }
  });

  this.authService.googleAuthError$.subscribe((msg: string) => {
    this.googleError.set(msg);
  });
  }

  generateStars() {
    for (let i = 0; i < 100; i++) {
      this.stars.push({
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 3 + 1,
        opacity: Math.random() * 0.8 + 0.2,
        duration: Math.random() * 3 + 2,
        delay: Math.random() * 3,
      });
    }
  }

  selectRole(role: 'MEMBER' | 'CHURCH_ADMIN') {
    this.selectedRole.set(role);
    this.registerForm.patchValue({ role });
     this.authService.setGoogleRole(role);
  }

  togglePassword() {
    this.showPassword.update(v => !v);
  }

  onSubmit() {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set('');

    this.authService.register(this.registerForm.value).subscribe({
      next: (user) => {
        this.isLoading.set(false);
        if (user.role === 'CHURCH_ADMIN') {
          this.router.navigate(['/app/admin']);
        } else {
          this.router.navigate(['/app/feed']);
        }
      },
      error: (err) => {
        this.isLoading.set(false);
        this.errorMessage.set(
          err.error?.message || 'Registration failed!'
        );
      }
    });
  }

  isInvalid(field: string): boolean {
    const control = this.registerForm.get(field);
    return !!(control?.invalid && control?.touched);
  }

//   loginWithGoogle() {
//   this.isGoogleLoading.set(true);

//   // Get selected role
//   const role = this.selectedRole();

//   this.authService.loginWithGoogle(role)
//     .then((user: any) => {
//       this.isGoogleLoading.set(false);
//       if (user?.role === 'CHURCH_ADMIN') {
//         this.router.navigate(['/app/admin']);
//       } else {
//         this.router.navigate(['/app/feed']);
//       }
//     })
//     .catch((err: any) => {
//   this.isGoogleLoading.set(false);
//   console.error('Google error:', err);  // ← add this
//   this.googleError.set(
//     err?.error?.message || err?.message || 'Google login failed!'
//   );
// });
// }
}