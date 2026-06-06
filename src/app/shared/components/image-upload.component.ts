import {
  Component,
  Input,
  Output,
  EventEmitter,
  signal
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { UploadService }
  from '../../core/services/upload.service';
import { ImageCropperModalComponent }
  from './image-cropper-modal.component';

@Component({
  selector: 'app-image-upload',
  standalone: true,
  imports: [CommonModule, ImageCropperModalComponent],
  template: `
    <div class="upload-container">

      <!-- Preview -->
      <div
        class="image-preview"
        *ngIf="previewUrl() && !showCropper()">
        <img
          [src]="previewUrl()"
          class="preview-img"/>
        <button
          class="remove-btn"
          (click)="removeImage()">
          ✕
        </button>
      </div>

      <!-- Upload Area -->
      <div
        class="upload-area"
        *ngIf="!previewUrl()"
        (click)="fileInput.click()"
        (dragover)="onDragOver($event)"
        (drop)="onDrop($event)"
        [class.uploading]="isUploading()">

        <div *ngIf="!isUploading()">
          <div class="upload-icon">📸</div>
          <p class="upload-text">{{ placeholder }}</p>
          <p class="upload-hint">
            Click or drag & drop
            <br>Max 5MB — JPG, PNG, WebP
          </p>
        </div>

        <div *ngIf="isUploading()"
          class="uploading-state">
          <div class="upload-spinner"></div>
          <p>Uploading...</p>
        </div>

      </div>

      <!-- Hidden file input -->
      <input
        #fileInput
        type="file"
        accept="image/*"
        style="display: none"
        (change)="onFileSelected($event)"/>

      <!-- Error -->
      <p class="upload-error" *ngIf="error()">
        ⚠️ {{ error() }}
      </p>

    </div>

    <!-- Cropper Modal -->
    <app-image-cropper-modal
      *ngIf="showCropper() && selectedFile()"
      [imageFile]="selectedFile()!"
      [aspectRatio]="getCropAspectRatio()"
      [resizeWidth]="getCropSize()"
      [resizeHeight]="getCropSize()"
      (cropped)="onCropComplete($event)"
      (cancelled)="onCropCancelled()">
    </app-image-cropper-modal>
  `,
  styles: [`
    .upload-container { width: 100%; }

    .image-preview {
      width: 100%;
      height: 160px;
      border-radius: 12px;
      position: relative;
      border: 1px solid rgba(201, 168, 76, 0.3);
      overflow: hidden;

      .preview-img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        object-position: center;
      }

      .remove-btn {
        position: absolute;
        top: 8px;
        right: 8px;
        width: 28px;
        height: 28px;
        background: rgba(231, 76, 60, 0.8);
        border: none;
        border-radius: 50%;
        color: white;
        cursor: pointer;
        font-size: 12px;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: background 0.2s;

        &:hover { background: #e74c3c; }
      }
    }

    .upload-area {
      width: 100%;
      height: 140px;
      border: 2px dashed rgba(201, 168, 76, 0.3);
      border-radius: 12px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all 0.3s ease;
      text-align: center;
      padding: 20px;
      gap: 8px;

      &:hover, &.uploading {
        border-color: #C9A84C;
        background: rgba(201, 168, 76, 0.05);
      }

      .upload-icon { font-size: 32px; }
      .upload-text {
        color: white;
        font-size: 14px;
        font-weight: 500;
        margin: 0;
      }
      .upload-hint {
        color: #8892B0;
        font-size: 12px;
        margin: 0;
        line-height: 1.5;
      }
    }

    .uploading-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 12px;

      p { color: #C9A84C; font-size: 14px; margin: 0; }
    }

    .upload-spinner {
      width: 32px;
      height: 32px;
      border: 3px solid rgba(201, 168, 76, 0.2);
      border-top-color: #C9A84C;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }

    @keyframes spin { to { transform: rotate(360deg); } }

    .upload-error {
      color: #e74c3c;
      font-size: 12px;
      margin-top: 8px;
    }
  `]
})
export class ImageUploadComponent {

  @Input() placeholder = 'Upload Image';
  @Input() uploadType:
    'profile' | 'church-logo' |
    'post-image' | 'sermon-thumbnail' = 'post-image';

  @Output() imageUploaded = new EventEmitter<string>();

  previewUrl = signal<string>('');
  isUploading = signal(false);
  error = signal('');
  showCropper = signal(false);
  selectedFile = signal<File | null>(null);

  constructor(private uploadService: UploadService) {}

  // Aspect ratio based on upload type
  getCropAspectRatio(): number {
    switch (this.uploadType) {
      case 'profile':
      case 'church-logo':
        return 1;      // Square
      case 'sermon-thumbnail':
        return 16 / 9; // Widescreen
      case 'post-image':
        return 4 / 3;  // Standard
      default:
        return 1;
    }
  }

  // Crop size based on type
  getCropSize(): number {
    switch (this.uploadType) {
      case 'profile':
        return 300;
      case 'church-logo':
        return 400;
      case 'sermon-thumbnail':
        return 640;
      case 'post-image':
        return 800;
      default:
        return 400;
    }
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) this.processFile(file);
  }

  onDragOver(event: DragEvent) {
    event.preventDefault();
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    const file = event.dataTransfer?.files[0];
    if (file) this.processFile(file);
  }

  processFile(file: File) {
    // Validate
    if (file.size > 5 * 1024 * 1024) {
      this.error.set('File must be less than 5MB!');
      return;
    }
    if (!file.type.startsWith('image/')) {
      this.error.set('Only image files allowed!');
      return;
    }

    this.error.set('');
    this.selectedFile.set(file);
    // Show cropper
    this.showCropper.set(true);
  }

  // User confirmed crop
  onCropComplete(croppedBase64: string) {
    this.showCropper.set(false);
    this.previewUrl.set(croppedBase64);
    // Convert base64 to File and upload
    this.uploadBase64(croppedBase64);
  }

  onCropCancelled() {
    this.showCropper.set(false);
    this.selectedFile.set(null);
  }

  uploadBase64(base64: string) {
    this.isUploading.set(true);

    // Convert base64 to blob
    const blob = this.base64ToBlob(base64);
    const file = new File(
      [blob],
      'cropped-image.jpg',
      { type: 'image/jpeg' }
    );

    // Upload based on type
    let upload$;
    switch (this.uploadType) {
      case 'profile':
        upload$ = this.uploadService.uploadProfile(file);
        break;
      case 'church-logo':
        upload$ = this.uploadService.uploadChurchLogo(file);
        break;
      case 'sermon-thumbnail':
        upload$ = this.uploadService
          .uploadSermonThumbnail(file);
        break;
      default:
        upload$ = this.uploadService.uploadPostImage(file);
    }

    upload$.subscribe({
      next: (res) => {
        this.isUploading.set(false);
        this.previewUrl.set(res.url);
        this.imageUploaded.emit(res.url);
      },
      error: (err) => {
        this.isUploading.set(false);
        this.previewUrl.set('');
        this.error.set(
          err.error?.message || 'Upload failed!'
        );
      }
    });
  }

  // Convert base64 to Blob
  base64ToBlob(base64: string): Blob {
    const parts = base64.split(';base64,');
    const contentType = parts[0].split(':')[1];
    const raw = window.atob(parts[1]);
    const rawLength = raw.length;
    const uInt8Array = new Uint8Array(rawLength);

    for (let i = 0; i < rawLength; ++i) {
      uInt8Array[i] = raw.charCodeAt(i);
    }

    return new Blob([uInt8Array], { type: contentType });
  }

  removeImage() {
    this.previewUrl.set('');
    this.imageUploaded.emit('');
  }
}