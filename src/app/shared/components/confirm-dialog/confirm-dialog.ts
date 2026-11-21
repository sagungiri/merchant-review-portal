import { ChangeDetectionStrategy, Component, inject, Injectable } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogActions, MatDialogContent, MatDialogRef, MatDialogTitle } from '@angular/material/dialog';
import { map, Observable } from 'rxjs';
import { Button } from '../button/button';

export interface ConfirmOptions {
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  tone?: 'default' | 'danger';
}

@Component({
  selector: 'app-confirm-dialog',
  imports: [MatDialogTitle, MatDialogContent, MatDialogActions, Button],
  template: `
    <h2 mat-dialog-title>{{ data.title }}</h2>
    <mat-dialog-content>{{ data.message }}</mat-dialog-content>
    <mat-dialog-actions>
      <app-button variant="text" (click)="close(false)">{{ data.cancelLabel ?? 'Cancel' }}</app-button>
      <app-button [variant]="data.tone === 'danger' ? 'danger' : 'primary'" (click)="close(true)">
        {{ data.confirmLabel ?? 'Confirm' }}
      </app-button>
    </mat-dialog-actions>
  `,
  styleUrl: './confirm-dialog.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ConfirmDialog {
  readonly data = inject<ConfirmOptions>(MAT_DIALOG_DATA);
  private readonly ref = inject(MatDialogRef<ConfirmDialog, boolean>);

  close(confirmed: boolean): void {
    this.ref.close(confirmed);
  }
}

@Injectable({ providedIn: 'root' })
export class ConfirmService {
  private readonly dialog = inject(MatDialog);

  open(options: ConfirmOptions): Observable<boolean> {
    return this.dialog
      .open<ConfirmDialog, ConfirmOptions, boolean>(ConfirmDialog, {
        data: options,
        width: '400px',
        autoFocus: 'first-tabbable',
        panelClass: 'app-confirm-dialog',
      })
      .afterClosed()
      .pipe(map((result) => result === true));
  }
}
