import {
  Component,
  OnInit,
  signal
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule
} from '@angular/forms';
import { Router } from '@angular/router';
import { ChurchService, Church }
  from '../../core/services/church.service';
import { AdminService }
  from '../../core/services/admin.service';
import { AuthService }
  from '../../core/services/auth.service';
import { ImageUploadComponent } from '../../shared/components/image-upload.component';

type AdminTab =
  'dashboard' |
  'sermons' |
  'events' |
  'posts' |
  'settings';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ImageUploadComponent],
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.scss']
})
export class AdminComponent implements OnInit {

  minDate = new Date().toISOString().slice(0, 16);
churchError = signal('');
  // State
  church = signal<Church | null>(null);
  isLoading = signal(true);
  hasChurch = signal(false);
  activeTab = signal<AdminTab>('dashboard');

  // Content
  sermons = signal<any[]>([]);
  events = signal<any[]>([]);
  posts = signal<any[]>([]);

  // Modals
  showSermonModal = signal(false);
  showEventModal = signal(false);
  showPostModal = signal(false);
  isSubmitting = signal(false);
  submitSuccess = signal('');

  // Forms
  churchForm: FormGroup;
  sermonForm: FormGroup;
  eventForm: FormGroup;
  postForm: FormGroup;

  // Setup steps
  setupStep = signal(1);
  errorMessage: any;

  constructor(
    private churchService: ChurchService,
    private adminService: AdminService,
    public authService: AuthService,
    private fb: FormBuilder,
    private router: Router
  ) {
    this.churchForm = this.fb.group({
      name: ['', Validators.required],
      description: ['', Validators.required],
      location: ['', Validators.required],
      city: ['', Validators.required],
      state: ['', Validators.required],
      country: ['India', Validators.required],
      website: [''],
      phone: [''],
      logo: ['']
    });

    this.sermonForm = this.fb.group({
      title: ['', Validators.required],
      description: [''],
      videoUrl: ['', Validators.required],
      thumbnailUrl: [''],
      speaker: ['', Validators.required],
      series: ['']
    });

    this.eventForm = this.fb.group({
      title: ['', Validators.required],
      description: [''],
      location: [''],
      imageUrl: [''],
      eventDate: ['', Validators.required],
      isOnline: [false],
      meetingLink: ['']
    });

    this.postForm = this.fb.group({
      title: [''],
      content: ['', Validators.required],
      type: ['ANNOUNCEMENT'],
      imageUrl: ['']
    });
  }

  ngOnInit() {
    this.loadMyChurch();
  }

 loadMyChurch() {
  this.isLoading.set(true);
  this.churchService.getMyChurch().subscribe({
    next: (church) => {
      this.church.set(church);
      this.hasChurch.set(true);
      this.isLoading.set(false);
      // ✅ Load all content after church loads
      this.loadAllContent();
    },
    error: (err) => {
      if (err.status === 404 ||
          err.status === 400 ||
          err.status === 500) {
        this.hasChurch.set(false);
      }
      this.isLoading.set(false);
    }
  });
 }

loadAllContent() {
  // Load sermons
  this.adminService.getMySermons().subscribe({
    next: (s) => {
      console.log('Sermons loaded:', s.length);
      this.sermons.set(s);
    },
    error: (e) => {
      console.log('Sermons error:', e);
      this.sermons.set([]);
    }
  });

  // Load events
  this.adminService.getMyEvents().subscribe({
    next: (e) => {
      console.log('Events loaded:', e.length);
      this.events.set(e);
    },
    error: (e) => {
      console.log('Events error:', e);
      this.events.set([]);
    }
  });

  // Load posts
  this.adminService.getMyPosts().subscribe({
    next: (p) => {
      console.log('Posts loaded:', p.length);
      this.posts.set(p);
    },
    error: (e) => {
      console.log('Posts error:', e);
      this.posts.set([]);
    }
  });
}

// Step navigation with validation
goToStep2() {
  // Mark step 1 fields as touched to show errors
  const nameControl = this.churchForm.get('name');
  const descControl = this.churchForm.get('description');

  nameControl?.markAsTouched();
  descControl?.markAsTouched();

  // Only proceed if step 1 is valid
  if (nameControl?.invalid || descControl?.invalid) {
    return; // Stay on step 1 and show errors
  }

  this.setupStep.set(2);
}

goToStep3() {
  // Mark step 2 fields as touched
  const locationControl = this.churchForm.get('location');
  const cityControl = this.churchForm.get('city');
  const stateControl = this.churchForm.get('state');

  locationControl?.markAsTouched();
  cityControl?.markAsTouched();
  stateControl?.markAsTouched();

  // Only proceed if step 2 is valid
  if (locationControl?.invalid ||
      cityControl?.invalid ||
      stateControl?.invalid) {
    return; // Stay on step 2 and show errors
  }

  this.setupStep.set(3);
}

  // ── Church Setup ──────────────────────
registerChurch() {
  if (this.churchForm.invalid) {
    this.churchForm.markAllAsTouched();
    return;
  }

  this.isSubmitting.set(true);
  this.churchError.set(''); // Clear previous error

  this.churchService
    .registerChurch(this.churchForm.value)
    .subscribe({
      next: (church) => {
        this.church.set(church);
        this.hasChurch.set(true);
        this.isSubmitting.set(false);
        this.loadAllContent();
      },
      error: (err) => {
        this.isSubmitting.set(false);
        // Show error on the form itself!
        this.churchError.set(
          err.error?.message ||
          'Failed to register church. Try again!'
        );
      }
    });
}
  // ── Sermons ───────────────────────────
  submitSermon() {
    if (this.sermonForm.invalid) {
      this.sermonForm.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);
    this.adminService
      .uploadSermon(this.sermonForm.value)
      .subscribe({
        next: (sermon) => {
          this.sermons.update(s => [sermon, ...s]);
          this.showSermonModal.set(false);
          this.sermonForm.reset();
          this.isSubmitting.set(false);
          this.submitSuccess.set('Sermon uploaded! ✅');
          setTimeout(() =>
            this.submitSuccess.set(''), 3000
          );
        },
        error: () => this.isSubmitting.set(false)
      });
  }

  deleteSermon(id: number) {
    if (!confirm('Delete this sermon?')) return;
    this.adminService.deleteSermon(id).subscribe({
      next: () => {
        this.sermons.update(s =>
          s.filter(x => x.id !== id)
        );
      }
    });
  }

  // ── Events ────────────────────────────
  submitEvent() {
    if (this.eventForm.invalid) {
      this.eventForm.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);
    this.adminService
      .createEvent(this.eventForm.value)
      .subscribe({
        next: (event) => {
          this.events.update(e => [event, ...e]);
          this.showEventModal.set(false);
          this.eventForm.reset();
          this.isSubmitting.set(false);
          this.submitSuccess.set('Event created! ✅');
          setTimeout(() =>
            this.submitSuccess.set(''), 3000
          );
        },
        error: () => this.isSubmitting.set(false)
      });
  }

  deleteEvent(id: number) {
    if (!confirm('Delete this event?')) return;
    this.adminService.deleteEvent(id).subscribe({
      next: () => {
        this.events.update(e =>
          e.filter(x => x.id !== id)
        );
      }
    });
  }

  // ── Posts ─────────────────────────────
  submitPost() {
    if (this.postForm.invalid) {
      this.postForm.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);
    this.adminService
      .createPost(this.postForm.value)
      .subscribe({
        next: (post) => {
          this.posts.update(p => [post, ...p]);
          this.showPostModal.set(false);
          this.postForm.reset({ type: 'ANNOUNCEMENT' });
          this.isSubmitting.set(false);
          this.submitSuccess.set('Post published! ✅');
          setTimeout(() =>
            this.submitSuccess.set(''), 3000
          );
        },
        error: () => this.isSubmitting.set(false)
      });
  }

  deletePost(id: number) {
  if (!confirm('Delete this post?')) return;
  this.adminService.deletePost(id).subscribe({
    next: () => {
      this.posts.update(p =>
        p.filter(x => x.id !== id)
      );
    }
  });
}

  // ── Helpers ───────────────────────────
  setTab(tab: AdminTab) {
    this.activeTab.set(tab);
  }

  formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString(
      'en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      }
    );
  }

  getChurchInitials(): string {
    return this.church()?.name
      ?.split(' ')
      .map(w => w[0])
      .join('')
      .substring(0, 2)
      .toUpperCase() || '';
  }

onSermonThumbnailUploaded(url: string) {
  this.sermonForm.patchValue({
    thumbnailUrl: url
  });
}

onPostImageUploaded(url: string) {
  this.postForm.patchValue({
    imageUrl: url
  });
}

onChurchLogoUploaded(url: string) {
  this.churchForm.patchValue({
    logo: url
  });
}

updateChurchLogo(url: string) {
  if (!url || !this.church()) return;

  // Update church with new logo
  this.churchService.updateChurch(
    this.church()!.id,
    { logo: url }
  ).subscribe({
    next: (updated) => {
      this.church.set(updated);
      this.submitSuccess.set('Logo updated! ✅');
      setTimeout(() =>
        this.submitSuccess.set(''), 3000
      );
    },
    error: () => {
      alert('Failed to update logo!');
    }
  });
}
}