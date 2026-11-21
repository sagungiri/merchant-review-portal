import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { Status } from '@shared/models/status.model';

@Component({
  selector: 'app-status-badge',
  template: `<span class="badge" [attr.data-tone]="status().tone">{{ status().label }}</span>`,
  styleUrl: './status-badge.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StatusBadge<T extends string = string> {
  readonly status = input.required<Status<T>>();
}
