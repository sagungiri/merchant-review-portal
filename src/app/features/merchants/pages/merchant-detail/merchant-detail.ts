import { DatePipe, DecimalPipe } from '@angular/common';
import { Component, computed, inject, input, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { apiErrorMessage } from '@core/models/api-error.model';
import { Button, ConfirmService, FormContainer, LoadingSpinner, StatusBadge, ToastService } from '@shared/components';
import { isFinalStatus, statusByValue } from '@shared/models/status.model';
import { Permissions } from '@shared/constants/permissions.constant';
import { AppRoutes } from '@shared/constants/routes.constant';
import { HasPermissionDirective } from '@shared/directives/has-permission.directive';
import { MERCHANT_STATUSES, Merchant, MerchantStatus } from '../../models/merchant.model';
import { MerchantService } from '../../merchants.service';

@Component({
  selector: 'app-merchant-detail',
  imports: [
    DatePipe,
    DecimalPipe,
    FormContainer,
    Button,
    LoadingSpinner,
    StatusBadge,
    HasPermissionDirective,
  ],
  templateUrl: './merchant-detail.html',
  styleUrl: './merchant-detail.scss',
})
export class MerchantDetail implements OnInit {
  private readonly merchants = inject(MerchantService);
  private readonly router = inject(Router);
  private readonly toast = inject(ToastService);
  private readonly confirm = inject(ConfirmService);

  readonly id = input.required<string>();
  readonly permissions = Permissions;
  readonly statusOf = (value: MerchantStatus) => statusByValue(MERCHANT_STATUSES, value);

  readonly merchant = signal<Merchant | null>(null);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  readonly revealed = signal(false);
  readonly reviewing = signal<'APPROVED' | 'REJECTED' | null>(null);

  readonly canEdit = computed(() => {
    const record = this.merchant();
    return !!record && !isFinalStatus(MERCHANT_STATUSES, record.status);
  });
  readonly canReview = computed(() => this.merchant()?.status === 'IN_REVIEW');

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.error.set(null);
    this.merchants.get(this.id()).subscribe({
      next: (merchant) => {
        this.merchant.set(merchant);
        this.loading.set(false);
      },
      error: (err) => {
        this.loading.set(false);
        this.error.set(apiErrorMessage(err, 'Could not load this merchant'));
      },
    });
  }

  secret(value: string): string {
    if (!value) {
      return '—';
    }
    return this.revealed() ? value : '••••';
  }

  toggleSecret(): void {
    this.revealed.update((open) => !open);
  }

  edit(): void {
    void this.router.navigateByUrl(AppRoutes.merchantEdit(this.id()));
  }

  approve(): void {
    this.ask('APPROVED');
  }

  reject(): void {
    this.ask('REJECTED');
  }

  historyLabel(action: string): string {
    const labels: Record<string, string> = {
      ASSIGNED: 'Assigned',
      APPROVED: 'Approved',
      REJECTED: 'Rejected',
      NOTE: 'Note',
    };
    return labels[action] ?? action;
  }

  private ask(decision: 'APPROVED' | 'REJECTED'): void {
    const name = this.merchant()?.merchantName ?? 'this merchant';
    const approving = decision === 'APPROVED';
    this.confirm
      .open({
        title: approving ? 'Approve merchant?' : 'Reject merchant?',
        message: approving
          ? `Approve ${name}? This locks the record.`
          : `Reject ${name}? This locks the record.`,
        confirmLabel: approving ? 'Approve' : 'Reject',
        tone: approving ? 'default' : 'danger',
      })
      .subscribe((ok) => {
        if (ok) {
          this.decide(decision);
        }
      });
  }

  private decide(decision: 'APPROVED' | 'REJECTED'): void {
    this.reviewing.set(decision);
    this.merchants.review(this.id(), decision).subscribe({
      next: (merchant) => {
        this.merchant.set(merchant);
        this.reviewing.set(null);
        this.toast.success(decision === 'APPROVED' ? 'Merchant approved' : 'Merchant rejected');
      },
      error: (err) => {
        this.reviewing.set(null);
        this.toast.error(apiErrorMessage(err, 'Could not save the decision'));
      },
    });
  }
}
