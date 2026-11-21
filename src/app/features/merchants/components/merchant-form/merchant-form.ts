import { Component, effect, input, output, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AbstractControl, FormBuilder, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { Button, FormContainer, StatusBadge, Step, Stepper } from '@shared/components';
import { statusByValue } from '@shared/models/status.model';
import { debounceTime, filter } from 'rxjs';
import { MERCHANT_STATUSES, MerchantDraft, MerchantStatus } from '../../models/merchant.model';

function last4(control: AbstractControl): ValidationErrors | null {
  const value = String(control.value ?? '').trim();
  if (!value || /^\d{4}$/.test(value)) {
    return null;
  }
  return { last4: true };
}

@Component({
  selector: 'app-merchant-form',
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    FormContainer,
    Button,
    StatusBadge,
    Stepper,
    Step,
  ],
  templateUrl: './merchant-form.html',
  styleUrl: './merchant-form.scss',
})
export class MerchantForm {
  private readonly fb = new FormBuilder();

  readonly title = input.required<string>();
  readonly status = input<MerchantStatus>('DRAFT');
  readonly value = input<MerchantDraft | null>(null);
  readonly submitting = input(false);

  readonly draftChange = output<MerchantDraft>();
  readonly submitted = output<MerchantDraft>();

  readonly badge = () => statusByValue(MERCHANT_STATUSES, this.status());
  readonly stepIndex = signal(0);

  readonly form = this.fb.nonNullable.group({
    business: this.fb.nonNullable.group({
      merchantName: ['', Validators.required],
      businessAddress: [''],
      expectedMonthlyVolume: [0, Validators.min(0)],
    }),
    contact: this.fb.nonNullable.group({
      contactEmail: ['', Validators.email],
      contactPhone: [''],
    }),
    financial: this.fb.nonNullable.group({
      taxId: [''],
      bankAccountLast4: ['', last4],
    }),
  });

  constructor() {
    effect(() => {
      const value = this.value();
      if (!value) {
        return;
      }
      this.form.patchValue({
        business: {
          merchantName: value.merchantName,
          businessAddress: value.businessAddress,
          expectedMonthlyVolume: value.expectedMonthlyVolume,
        },
        contact: {
          contactEmail: value.contactEmail,
          contactPhone: value.contactPhone,
        },
        financial: {
          taxId: value.taxId,
          bankAccountLast4: value.bankAccountLast4,
        },
      });
      this.stepIndex.set(Math.min(2, Math.max(0, (value.draftStep || 1) - 1)));
      this.form.markAsPristine();
    });

    this.form.valueChanges
      .pipe(
        debounceTime(700),
        filter(
          () =>
            this.form.dirty &&
            !this.submitting() &&
            !!this.form.controls.business.controls.merchantName.value.trim(),
        ),
        takeUntilDestroyed(),
      )
      .subscribe(() => this.draftChange.emit(this.payload()));
  }

  back(): void {
    this.stepIndex.update((index) => Math.max(0, index - 1));
  }

  next(): void {
    if (!this.stepValid()) {
      return;
    }
    this.stepIndex.update((index) => Math.min(2, index + 1));
  }

  submit(): void {
    if (this.stepIndex() < 2) {
      this.next();
      return;
    }
    if (this.status() !== 'DRAFT' || !this.readyToSubmit()) {
      return;
    }
    this.submitted.emit(this.payload());
  }

  private payload(): MerchantDraft {
    const { business, contact, financial } = this.form.getRawValue();
    return {
      merchantName: business.merchantName.trim(),
      businessAddress: business.businessAddress.trim(),
      expectedMonthlyVolume: Number(business.expectedMonthlyVolume) || 0,
      contactEmail: contact.contactEmail.trim(),
      contactPhone: contact.contactPhone.trim(),
      taxId: financial.taxId.trim(),
      bankAccountLast4: financial.bankAccountLast4.trim(),
      draftStep: this.stepIndex() + 1,
    };
  }

  private stepValid(): boolean {
    const group = this.currentGroup();
    group.markAllAsTouched();
    group.updateValueAndValidity();
    return group.valid;
  }

  private readyToSubmit(): boolean {
    const { business, contact, financial } = this.form.controls;
    const required = [
      business.controls.merchantName,
      business.controls.businessAddress,
      contact.controls.contactEmail,
      contact.controls.contactPhone,
      financial.controls.taxId,
      financial.controls.bankAccountLast4,
    ];

    for (const control of required) {
      if (!String(control.value ?? '').trim()) {
        control.setErrors({ ...control.errors, required: true });
      }
      control.markAsTouched();
    }

    if (business.invalid) {
      this.stepIndex.set(0);
    } else if (contact.invalid) {
      this.stepIndex.set(1);
    } else if (this.form.invalid) {
      this.stepIndex.set(2);
    }

    return this.form.valid;
  }

  private currentGroup() {
    return [this.form.controls.business, this.form.controls.contact, this.form.controls.financial][
      this.stepIndex()
    ];
  }
}
