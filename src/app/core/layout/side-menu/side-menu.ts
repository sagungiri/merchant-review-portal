import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { Permissions } from '@shared/constants/permissions.constant';
import { AppRoutes } from '@shared/constants/routes.constant';
import { HasPermissionDirective } from '@shared/directives/has-permission.directive';

@Component({
  selector: 'app-side-menu',
  imports: [RouterLink, RouterLinkActive, HasPermissionDirective],
  templateUrl: './side-menu.html',
  styleUrl: './side-menu.scss',
})
export class SideMenu {
  readonly routes = AppRoutes;
  readonly permissions = Permissions;
}
