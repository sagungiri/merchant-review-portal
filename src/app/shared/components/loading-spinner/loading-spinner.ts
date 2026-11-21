import { booleanAttribute, ChangeDetectionStrategy, Component, input } from '@angular/core';
import { MatProgressSpinner } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-loading-spinner',
  imports: [MatProgressSpinner],
  template: `
    <div role="status">
      <mat-progress-spinner
        mode="indeterminate"
        [diameter]="diameter()"
        [strokeWidth]="3"
        [attr.aria-label]="label() || 'Loading'"
      />
      @if (label()) {
        <span>{{ label() }}</span>
      }
    </div>
  `,
  styleUrl: './loading-spinner.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class.overlay]': 'overlay()',
  },
})
export class LoadingSpinner {
  readonly label = input<string>();
  readonly diameter = input(32);
  readonly overlay = input(false, { transform: booleanAttribute });
}
