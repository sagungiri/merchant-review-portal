import { Component, input } from '@angular/core';

@Component({
  selector: 'app-merchant-detail',
  template: `
    <h1>Merchant detail</h1>
    <p>Record {{ id() }} — risk history and review actions land here next.</p>
  `,
})
export class MerchantDetail {
  readonly id = input.required<string>();
}
