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
import {
  PrayerService,
  Prayer
} from '../../core/services/prayer.service';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-prayer',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './prayer.component.html',
  styleUrls: ['./prayer.component.scss']
})
export class PrayerComponent implements OnInit {

  prayers = signal<Prayer[]>([]);
  myPrayers = signal<Prayer[]>([]);
  isLoading = signal(true);
  isSubmitting = signal(false);
  showSubmitForm = signal(false);
  activeTab = signal<'all' | 'mine'>('all');
  submitSuccess = signal(false);

  // Candles for animation
  candles = Array(12).fill(0).map((_, i) => ({
    delay: i * 0.4,
    duration: 2 + Math.random() * 2,
    x: Math.random() * 100,
  }));

  prayerForm: FormGroup;

  constructor(
    private prayerService: PrayerService,
    public authService: AuthService,
    private fb: FormBuilder
  ) {
    this.prayerForm = this.fb.group({
      content: ['', [
        Validators.required,
        Validators.minLength(10),
        Validators.maxLength(500)
      ]],
      isPublic: [true]
    });
  }

  ngOnInit() {
    this.loadPrayers();
  }

  loadPrayers() {
    this.isLoading.set(true);
    this.prayerService.getPublicPrayers().subscribe({
      next: (prayers) => {
        this.prayers.set(prayers);
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false)
    });
  }

  loadMyPrayers() {
    this.prayerService.getMyPrayers().subscribe({
      next: (prayers) => this.myPrayers.set(prayers)
    });
  }

  switchTab(tab: 'all' | 'mine') {
    this.activeTab.set(tab);
    if (tab === 'mine' && this.myPrayers().length === 0) {
      this.loadMyPrayers();
    }
  }

  toggleForm() {
    this.showSubmitForm.update(v => !v);
    this.submitSuccess.set(false);
    this.prayerForm.reset({ isPublic: true });
  }

  submitPrayer() {
    if (this.prayerForm.invalid) {
      this.prayerForm.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);

    this.prayerService
      .submitPrayer(this.prayerForm.value)
      .subscribe({
        next: (prayer) => {
          this.isSubmitting.set(false);
          this.submitSuccess.set(true);
          this.prayerForm.reset({ isPublic: true });

          // Add to list if public
          if (prayer.isPublic) {
            this.prayers.update(p => [prayer, ...p]);
          }

          // Hide form after 2 seconds
          setTimeout(() => {
            this.showSubmitForm.set(false);
            this.submitSuccess.set(false);
          }, 2000);
        },
        error: () => this.isSubmitting.set(false)
      });
  }

  togglePraying(prayer: Prayer) {
    this.prayerService.togglePraying(prayer.id).subscribe({
      next: (res) => {
        // Update prayer in list
        this.prayers.update(prayers =>
          prayers.map(p => {
            if (p.id === prayer.id) {
              return {
                ...p,
                isPraying: res.isPraying,
                prayerCount: res.prayerCount
              };
            }
            return p;
          })
        );
      }
    });
  }

  getTimeAgo(dateStr: string): string {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  }

  getCharCount(): number {
    return this.prayerForm.get('content')?.value?.length || 0;
  }

  getUserInitials(): string {
    const name = this.authService.currentUser()?.name || '';
    return name.split(' ')
      .map(w => w[0])
      .join('')
      .substring(0, 2)
      .toUpperCase();
  }
}