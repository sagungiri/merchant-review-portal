import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { RouterLink } from '@angular/router';
import { AppRoutes } from '@shared/constants/routes.constant';

@Component({
  selector: 'app-forbidden',
  imports: [RouterLink, MatButtonModule],
  template: `
    <h1>Not allowed</h1>
    <p>You do not have permission to open this page.</p>
    <a mat-flat-button [routerLink]="merchants">Back to merchants</a>
  `,
})
export class Forbidden {
  readonly merchants = AppRoutes.merchants;
}
