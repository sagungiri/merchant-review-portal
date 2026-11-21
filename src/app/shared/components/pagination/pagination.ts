import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { MatPaginator, PageEvent } from '@angular/material/paginator';

/** 1-based page, matching `Paged` and the merchants API. */
export interface PageRequest {
  page: number;
  pageSize: number;
}

@Component({
  selector: 'app-pagination',
  imports: [MatPaginator],
  template: `
    <mat-paginator
      [length]="total()"
      [pageIndex]="pageIndex()"
      [pageSize]="pageSize()"
      [pageSizeOptions]="pageSizeOptions()"
      [hidePageSize]="hidePageSize()"
      [showFirstLastButtons]="true"
      (page)="onPage($event)"
    />
  `,
  styles: `
    :host {
      display: block;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Pagination {
  readonly page = input(1);
  readonly pageSize = input(10);
  readonly total = input(0);
  readonly pageSizeOptions = input<number[]>([10, 25, 50]);
  readonly hidePageSize = input(false);
  readonly pageChange = output<PageRequest>();

  readonly pageIndex = computed(() => Math.max(0, this.page() - 1));

  onPage(event: PageEvent): void {
    this.pageChange.emit({ page: event.pageIndex + 1, pageSize: event.pageSize });
  }
}
