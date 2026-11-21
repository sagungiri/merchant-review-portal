import { Component, inject, input, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { apiErrorMessage } from '@core/models/api-error.model';
import { LoadingSpinner, ToastService } from '@shared/components';
import { AppRoutes } from '@shared/constants/routes.constant';
import { MerchantForm } from '../../components/merchant-form/merchant-form';
import { isFinalStatus } from '@shared/models/status.model';
import { MERCHANT_STATUSES, Merchant, MerchantDraft, MerchantStatus } from '../../models/merchant.model';
import { MerchantService } from '../../merchants.service';

@Component({
  selector: 'app-merchant-edit',
  imports: [MerchantForm, LoadingSpinner],
  template: `
    @if (loading()) {
      <app-loading-spinner label="Loading" />
    } @else {
      <app-merchant-form
        title="Edit merchant"
        [status]="status()"
        [value]="draft()"
        [submitting]="submitting()"
        (draftChange)="save($event)"
        (submitted)="submit($event)"
      />
    }
  `,
})
export class MerchantEdit implements OnInit {
  private readonly merchants = inject(MerchantService);
  private readonly router = inject(Router);
  private readonly toast = inject(ToastService);

  readonly id = input.required<string>();

  readonly loading = signal(true);
  readonly submitting = signal(false);
  readonly draft = signal<MerchantDraft | null>(null);
  readonly status = signal<MerchantStatus>('DRAFT');

  ngOnInit(): void {
    this.merchants.get(this.id()).subscribe({
      next: (merchant) => {
        if (isFinalStatus(MERCHANT_STATUSES, merchant.status)) {
          this.toast.error('This merchant can no longer be edited');
          void this.router.navigateByUrl(AppRoutes.merchantDetail(merchant.id));
          return;
        }
        this.status.set(merchant.status);
        this.draft.set(toDraft(merchant));
        this.loading.set(false);
      },
      error: (err) => {
        this.toast.error(apiErrorMessage(err, 'Could not open this merchant'));
        void this.router.navigateByUrl(AppRoutes.merchants);
      },
    });
  }

  save(draft: MerchantDraft): void {
    if (this.submitting()) {
      return;
    }
    this.merchants.update(this.id(), draft).subscribe({
      error: (err) => this.toast.error(apiErrorMessage(err, 'Could not save the draft')),
    });
  }

  submit(draft: MerchantDraft): void {
    this.submitting.set(true);
    this.merchants
      .update(this.id(), { ...draft, status: 'SUBMITTED' })
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
}

function toDraft(merchant: Merchant): MerchantDraft {
  return {
    merchantName: merchant.merchantName,
    taxId: merchant.taxId,
    bankAccountLast4: merchant.bankAccountLast4,
    contactEmail: merchant.contactEmail,
    contactPhone: merchant.contactPhone,
    businessAddress: merchant.businessAddress,
    expectedMonthlyVolume: merchant.expectedMonthlyVolume,
    draftStep: merchant.draftStep,
  };
}
