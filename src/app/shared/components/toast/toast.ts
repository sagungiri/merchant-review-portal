import { ChangeDetectionStrategy, Component, inject, Injectable } from '@angular/core';
import { MAT_SNACK_BAR_DATA, MatSnackBar, MatSnackBarRef } from '@angular/material/snack-bar';

export type ToastTone = 'success' | 'error' | 'info' | 'warning';

export interface ToastData {
  message: string;
  tone: ToastTone;
}

const ICONS: Record<ToastTone, string> = {
  success: 'check_circle',
  error: 'error',
  warning: 'warning',
  info: 'info',
};

@Component({
  selector: 'app-toast',
  template: `
    <span class="material-icons icon" [attr.data-tone]="data.tone" aria-hidden="true">{{ icon }}</span>
    <span class="message">{{ data.message }}</span>
    <button type="button" class="dismiss" (click)="dismiss()">Dismiss</button>
  `,
  styleUrl: './toast.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Toast {
  readonly data = inject<ToastData>(MAT_SNACK_BAR_DATA);
  readonly icon = ICONS[this.data.tone];
  private readonly ref = inject(MatSnackBarRef);

  dismiss(): void {
    this.ref.dismiss();
  }
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  private readonly snackBar = inject(MatSnackBar);

  success(message: string): void {
    this.show(message, 'success');
  }

  error(message: string): void {
    this.show(message, 'error');
  }

  info(message: string): void {
    this.show(message, 'info');
  }

  warning(message: string): void {
    this.show(message, 'warning');
  }

  private show(message: string, tone: ToastTone): void {
    const stayOpen = tone === 'error' || tone === 'warning';
    this.snackBar.openFromComponent(Toast, {
      data: { message, tone },
      duration: stayOpen ? 6000 : 4000,
      horizontalPosition: 'center',
      verticalPosition: 'bottom',
      panelClass: 'app-toast-pane',
    });
  }
}
