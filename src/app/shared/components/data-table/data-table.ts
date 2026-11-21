import { NgTemplateOutlet } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  contentChild,
  contentChildren,
  input,
  TemplateRef,
} from '@angular/core';
import {
  MatCell,
  MatCellDef,
  MatColumnDef,
  MatHeaderCell,
  MatHeaderCellDef,
  MatHeaderRow,
  MatHeaderRowDef,
  MatRow,
  MatRowDef,
  MatTable,
} from '@angular/material/table';
import { LoadingSpinner } from '../loading-spinner/loading-spinner';

export type ColumnAlign = 'start' | 'center' | 'end';

@Component({
  selector: 'app-column',
  template: '',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DataColumn {
  readonly key = input.required<string>();
  readonly header = input.required<string>();
  readonly align = input<ColumnAlign>('start');
  readonly width = input<string>();
  readonly cell = contentChild(TemplateRef);
}

@Component({
  selector: 'app-data-table',
  imports: [
    MatTable,
    MatColumnDef,
    MatHeaderCell,
    MatHeaderCellDef,
    MatCell,
    MatCellDef,
    MatHeaderRow,
    MatHeaderRowDef,
    MatRow,
    MatRowDef,
    NgTemplateOutlet,
    LoadingSpinner,
  ],
  template: `
    <div class="card">
      @if (rows().length > 0 && columns().length > 0) {
        <div class="frame" [class.dimmed]="loading()">
          <table mat-table [dataSource]="rows()">
            @for (column of columns(); track column.key()) {
              <ng-container [matColumnDef]="column.key()">
                <th
                  mat-header-cell
                  *matHeaderCellDef
                  [style.width]="column.width() || null"
                  [style.text-align]="column.align()"
                >
                  {{ column.header() }}
                </th>
                <td mat-cell *matCellDef="let row" [style.text-align]="column.align()">
                  @if (column.cell(); as cell) {
                    <ng-container
                      [ngTemplateOutlet]="cell"
                      [ngTemplateOutletContext]="{ $implicit: row }"
                    />
                  } @else {
                    {{ display(row, column.key()) }}
                  }
                </td>
              </ng-container>
            }

            <tr mat-header-row *matHeaderRowDef="displayedColumns(); sticky: true"></tr>
            <tr mat-row *matRowDef="let row; columns: displayedColumns()"></tr>
          </table>
        </div>
      } @else if (!loading()) {
        <p class="empty">{{ emptyMessage() }}</p>
      }

      @if (loading()) {
        <app-loading-spinner [overlay]="rows().length > 0" label="Loading" />
      }
    </div>
  `,
  styleUrl: './data-table.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DataTable<T extends object> {
  readonly rows = input.required<readonly T[]>();
  readonly loading = input(false);
  readonly emptyMessage = input('Nothing here yet');

  readonly columns = contentChildren(DataColumn);
  readonly displayedColumns = computed(() => this.columns().map((column) => column.key()));

  display(row: T, key: string): string {
    const value = (row as Record<string, unknown>)[key];
    return value == null ? '' : String(value);
  }
}
