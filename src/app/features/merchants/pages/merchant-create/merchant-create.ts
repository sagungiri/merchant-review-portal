import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { apiErrorMessage } from '@core/models/api-error.model';
import { ToastService } from '@shared/components';
import { AppRoutes } from '@shared/constants/routes.constant';
import { catchError, Observable, shareReplay, switchMap, tap, throwError } from 'rxjs';
import { MerchantForm } from '../../components/merchant-form/merchant-form';
import { Merchant, MerchantDraft } from '../../models/merchant.model';
import { MerchantService } from '../../merchants.service';

@Component({
  selector: 'app-merchant-create',
  imports: [MerchantForm],
  template: `
    <app-merchant-form
      title="New merchant"
      [submitting]="submitting()"
      (draftChange)="save($event)"
      (submitted)="submit($event)"
    />
  `,
})
export class MerchantCreate {
  private readonly merchants = inject(MerchantService);
  private readonly router = inject(Router);
  private readonly toast = inject(ToastService);

  readonly submitting = signal(false);

  private pendingCreate: Observable<Merchant> | null = null;

  save(draft: MerchantDraft): void {
    if (this.submitting()) {
      return;
    }

    this.create(draft).subscribe({
      next: (merchant) => {
        void this.router.navigate([AppRoutes.merchantEdit(merchant.id)], { replaceUrl: true });
      },
      error: (err) => this.toast.error(apiErrorMessage(err, 'Could not save the draft')),
    });
  }

  submit(draft: MerchantDraft): void {
    this.submitting.set(true);
    this.create(draft)
      .pipe(switchMap((merchant) => this.merchants.update(merchant.id, { status: 'SUBMITTED' })))
      .subscribe({
        next: (merchant) => {
          this.toast.success('Submitted for review');
          void this.router.navigateByUrl(AppRoutes.merchantDetail(merchant.id));
        },
        error: (err) => {
          this.submitting.set(false);
          this.toast.error(apiErrorMessage(err, 'Could not submit'));
        },
      });
  }

  private create(draft: MerchantDraft): Observable<Merchant> {
    if (!this.pendingCreate) {
      this.pendingCreate = this.merchants.create(draft).pipe(
        tap(() => {
          this.pendingCreate = null;
        }),
        catchError((err) => {
          this.pendingCreate = null;
          return throwError(() => err);
        }),
        shareReplay(1),
      );
    }
    return this.pendingCreate;
  }
}
