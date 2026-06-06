import {
  Component,
  OnInit,
  signal
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService }
  from '../../core/services/auth.service';
import { UploadService }
  from '../../core/services/upload.service';
import { ImageUploadComponent }
  from '../../shared/components/image-upload.component';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    CommonModule,
    ImageUploadComponent
  ],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {

  isUpdating = signal(false);
  updateSuccess = signal('');
  showUpload = signal(false);

  constructor(
    public authService: AuthService,
    private uploadService: UploadService
  ) {}

  ngOnInit() {}

  getUserInitials(): string {
    const name = this.authService
      .currentUser()?.name || '';
    return name.split(' ')
      .map(w => w[0])
      .join('')
      .substring(0, 2)
      .toUpperCase();
  }

  onProfilePicUploaded(url: string) {
    if (!url) return;
    this.isUpdating.set(true);

    this.authService.updateProfilePic(url).subscribe({
      next: () => {
        this.isUpdating.set(false);
        this.updateSuccess.set(
          'Profile picture updated! ✅'
        );
        this.showUpload.set(false);
        setTimeout(() =>
          this.updateSuccess.set(''), 3000
        );
      },
      error: () => {
        this.isUpdating.set(false);
      }
    });
  }
}