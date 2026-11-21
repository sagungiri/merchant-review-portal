import { Component } from '@angular/core';

@Component({
  selector: 'app-dashboard',
  template: `<h1>Dashboard</h1>`,
  styles: `
    h1 {
      margin: 0;
      font: var(--mat-sys-headline-medium);
    }
  `,
})
export class Dashboard {}
