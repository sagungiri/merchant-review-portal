import { Component, input } from '@angular/core';

@Component({
  selector: 'app-merchant-form',
  template: `
    <h1>{{ id() ? 'Edit merchant' : 'New merchant' }}</h1>
    <p>Multi-step form and draft auto-save land here next.</p>
  `,
})
export class MerchantForm {
  readonly id = input<string>();
}
