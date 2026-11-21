import { computed, Directive, effect, inject, input, TemplateRef, ViewContainerRef } from '@angular/core';
import { PermissionService } from '@core/services/permission.service';

@Directive({
  selector: '[appHasPermission]',
  exportAs: 'hasPermission',
})
export class HasPermissionDirective {
  private readonly templateRef = inject(TemplateRef<unknown>, { optional: true });
  private readonly viewContainer = inject(ViewContainerRef);
  private readonly permissions = inject(PermissionService);

  readonly appHasPermission = input.required<string>();
  readonly allowed = computed(() => this.permissions.hasPermissionCode(this.appHasPermission()));

  constructor() {
    if (!this.templateRef) {
      return;
    }

    const template = this.templateRef;
    effect(() => {
      this.viewContainer.clear();
      if (this.allowed()) {
        this.viewContainer.createEmbeddedView(template);
      }
    });
  }
}
