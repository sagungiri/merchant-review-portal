import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AuthService } from '@core/services/auth.service';
import { Button } from '@shared/components';
import { SideMenu } from './side-menu/side-menu';

@Component({
  selector: 'app-shell',
  imports: [RouterOutlet, Button, SideMenu],
  templateUrl: './shell.html',
  styleUrl: './shell.scss',
})
export class Shell {
  readonly auth = inject(AuthService);
}
