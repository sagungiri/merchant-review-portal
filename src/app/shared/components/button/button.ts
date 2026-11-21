import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  ViewEncapsulation,
} from '@angular/core';
import { MatButton } from '@angular/material/button';
import { MatProgressSpinner } from '@angular/material/progress-spinner';

export type ButtonVariant = 'primary' | 'secondary' | 'text' | 'danger';

@Component({
  selector: 'app-button',
  imports: [MatButton, MatProgressSpinner],
  template: `
    <button
      matButton
      [matButton]="appearance()"
      [type]="type()"
      [disabled]="disabled() || loading()"
      [class.danger]="variant() === 'danger'"
      [class.loading]="loading()"
      [attr.aria-busy]="loading()"
    >
      @if (loading()) {
        <mat-progress-spinner mode="indeterminate" [diameter]="16" [strokeWidth]="2" />
      }
      <ng-content />
    </button>
  `,
  styleUrl: './button.scss',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'app-button',
    '[class.block]': 'block()',
  },
})
export class Button {
  readonly variant = input<ButtonVariant>('primary');
  readonly type = input<'button' | 'submit' | 'reset'>('button');
  readonly disabled = input(false, { transform: booleanAttribute });
  readonly loading = input(false, { transform: booleanAttribute });
  readonly block = input(false, { transform: booleanAttribute });

  readonly appearance = computed(() => {
    const variant = this.variant();
    if (variant === 'secondary') {
      return 'outlined' as const;
    }
    if (variant === 'text') {
      return 'text' as const;
    }
    return 'filled' as const;
  });
}
