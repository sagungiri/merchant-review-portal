import { DatePipe } from '@angular/common';
import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { Router, RouterLink } from '@angular/router';
import { apiErrorMessage } from '@core/models/api-error.model';
import { Button, DataColumn, DataTable, PageRequest, Pagination, StatusBadge } from '@shared/components';
import { statusByValue } from '@shared/models/status.model';
import { Permissions } from '@shared/constants/permissions.constant';
import { AppRoutes } from '@shared/constants/routes.constant';
import { HasPermissionDirective } from '@shared/directives/has-permission.directive';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import { MERCHANT_STATUSES, MerchantListItem, MerchantStatus } from '../../models/merchant.model';
import { MerchantService } from '../../merchants.service';

@Component({
  selector: 'app-merchant-list',
  imports: [
    DatePipe,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    RouterLink,
    DataTable,
    DataColumn,
    Pagination,
    Button,
    StatusBadge,
    HasPermissionDirective,
  ],
  templateUrl: './merchant-list.html',
  styleUrl: './merchant-list.scss',
})
export class MerchantList implements OnInit {
  private readonly merchants = inject(MerchantService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly router = inject(Router);

  readonly permissions = Permissions;

  readonly statuses = MERCHANT_STATUSES;
  readonly statusOf = (value: MerchantStatus) => statusByValue(MERCHANT_STATUSES, value);
  readonly detailUrl = AppRoutes.merchantDetail;

  createMerchant(): void {
    void this.router.navigateByUrl(AppRoutes.merchantNew);
  }

  readonly searchControl = new FormControl('', { nonNullable: true });
  readonly statusControl = new FormControl<MerchantStatus | ''>('', { nonNullable: true });

  readonly items = signal<MerchantListItem[]>([]);
  readonly total = signal(0);
  readonly page = signal(1);
  readonly pageSize = signal(10);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);

  private search = '';
  private status: MerchantStatus | '' = '';

  ngOnInit(): void {
    this.searchControl.valueChanges
      .pipe(debounceTime(300), distinctUntilChanged(), takeUntilDestroyed(this.destroyRef))
      .subscribe((value) => {
        this.search = value.trim();
        this.page.set(1);
        this.load();
      });

    this.statusControl.valueChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((value) => {
      this.status = value;
      this.page.set(1);
      this.load();
    });

    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.error.set(null);
    this.merchants
      .list({
        page: this.page(),
        pageSize: this.pageSize(),
        status: this.status,
        q: this.search,
      })
      .subscribe({
        next: (result) => {
          this.items.set(result.items);
          this.total.set(result.total);
          this.loading.set(false);
        },
        error: (err) => {
          this.loading.set(false);
          this.items.set([]);
          this.error.set(apiErrorMessage(err, 'Could not load merchants'));
        },
      });
  }

  onPage(request: PageRequest): void {
    this.page.set(request.page);
    this.pageSize.set(request.pageSize);
    this.load();
  }
}
