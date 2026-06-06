import {
  Component,
  Input,
  Output,
  EventEmitter,
  signal
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ImageCropperComponent,
  ImageCroppedEvent
} from 'ngx-image-cropper';

@Component({
  selector: 'app-image-cropper-modal',
  standalone: true,
  imports: [CommonModule, ImageCropperComponent],
  template: `
    <div class="cropper-overlay" (click)="onCancel()">
      <div class="cropper-modal"
        (click)="$event.stopPropagation()">

        <div class="cropper-header">
          <h3>✂️ Crop Image</h3>
          <button (click)="onCancel()">✕</button>
        </div>

        <div class="cropper-body">
          <image-cropper
  [imageFile]="imageFile"
  [maintainAspectRatio]="true"
  [aspectRatio]="aspectRatio"
  [resizeToWidth]="resizeWidth"
  [resizeToHeight]="resizeHeight"
  [cropperMinWidth]="100"
  format="jpeg"
  [output]="'base64'"
  (imageCropped)="onImageCropped($event)"
  (imageLoaded)="imageLoaded()"
  (cropperReady)="cropperReady()"
  (loadImageFailed)="loadImageFailed()">
</image-cropper>
        </div>

        <div class="cropper-actions">
          <button
            class="cancel-btn"
            (click)="onCancel()">
            Cancel
          </button>
          <button
            class="crop-btn"
            (click)="confirmCrop()"
            [disabled]="!croppedImageData()">
            ✂️ Crop & Use
          </button>
        </div>

      </div>
    </div>
  `,
  styles: [`
    .cropper-overlay {
      position: fixed;
      inset: 0;
      background: rgba(0,0,0,0.8);
      backdrop-filter: blur(8px);
      z-index: 1000;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 24px;
    }

    .cropper-modal {
      background: #111530;
      border: 1px solid rgba(201, 168, 76, 0.2);
      border-radius: 20px;
      width: 100%;
      max-width: 500px;
      overflow: hidden;
    }

    .cropper-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 20px 24px;
      border-bottom: 1px solid rgba(201, 168, 76, 0.1);

      h3 {
        font-family: 'Playfair Display', serif;
        font-size: 20px;
        color: white;
      }

      button {
        background: rgba(201, 168, 76, 0.1);
        border: 1px solid rgba(201, 168, 76, 0.2);
        color: #C9A84C;
        border-radius: 8px;
        width: 30px;
        height: 30px;
        cursor: pointer;
        font-size: 12px;
        display: flex;
        align-items: center;
        justify-content: center;
      }
    }

    .cropper-body {
      padding: 16px;
      max-height: 400px;
      overflow: hidden;
    }

    .cropper-actions {
      display: flex;
      gap: 12px;
      padding: 16px 24px;
      border-top: 1px solid rgba(201, 168, 76, 0.1);

      .cancel-btn {
        flex: 1;
        background: transparent;
        border: 1px solid rgba(201, 168, 76, 0.2);
        color: #8892B0;
        border-radius: 10px;
        padding: 12px;
        cursor: pointer;
        font-family: 'Inter', sans-serif;
        font-size: 14px;
        transition: all 0.2s;

        &:hover {
          border-color: rgba(201, 168, 76, 0.4);
          color: white;
        }
      }

      .crop-btn {
        flex: 2;
        background: linear-gradient(
          135deg, #C9A84C, #E2C17A
        );
        border: none;
        border-radius: 10px;
        padding: 12px;
        color: #060919;
        font-weight: 700;
        cursor: pointer;
        font-family: 'Inter', sans-serif;
        font-size: 14px;
        transition: all 0.3s;

        &:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 6px 20px
            rgba(201, 168, 76, 0.3);
        }

        &:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
      }
    }
  `]
})
export class ImageCropperModalComponent {

  @Input() imageFile!: File;
  @Input() aspectRatio: number = 1; // 1 = square
  @Input() resizeWidth: number = 400;
  @Input() resizeHeight: number = 400;

  @Output() cropped = new EventEmitter<string>();
  @Output() cancelled = new EventEmitter<void>();

  croppedImageData = signal<string>('');

  onImageCropped(event: ImageCroppedEvent) {
  // Try all possible return formats
  if (event.base64) {
    this.croppedImageData.set(event.base64);
  } else if (event.objectUrl) {
    this.croppedImageData.set(event.objectUrl);
  } else if (event.blob) {
    // Convert blob to base64
    const reader = new FileReader();
    reader.onload = (e: any) => {
      this.croppedImageData.set(e.target.result);
    };
    reader.readAsDataURL(event.blob);
  }
}

  imageLoaded() {}
  cropperReady() {}
  loadImageFailed() {
    console.error('Load image failed');
  }

  confirmCrop() {
    if (this.croppedImageData()) {
      this.cropped.emit(this.croppedImageData());
    }
  }

  onCancel() {
    this.cancelled.emit();
  }
}