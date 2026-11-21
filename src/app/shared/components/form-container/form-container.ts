import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'app-form-container',
  template: `
    <section class="panel">
      @if (title() || subtitle()) {
        <header>
          @if (title()) {
            <h2>{{ title() }}</h2>
          }
          @if (subtitle()) {
            <p>{{ subtitle() }}</p>
          }
        </header>
      }

      <div class="body">
        <ng-content />
      </div>

      <footer>
        <ng-content select="[formActions]" />
      </footer>
    </section>
  `,
  styleUrl: './form-container.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FormContainer {
  readonly title = input<string>();
  readonly subtitle = input<string>();
}
