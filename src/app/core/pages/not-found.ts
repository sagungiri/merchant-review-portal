import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { RouterLink } from '@angular/router';
import { AppRoutes } from '@shared/constants/routes.constant';

@Component({
  selector: 'app-not-found',
  imports: [RouterLink, MatButtonModule],
  template: `
    <h1>Page not found</h1>
    <a mat-flat-button [routerLink]="merchants">Back to merchants</a>
  `,
})
export class NotFound {
  readonly merchants = AppRoutes.merchants;
}
