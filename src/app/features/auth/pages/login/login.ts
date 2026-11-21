import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { ActivatedRoute, Router } from '@angular/router';
import { apiErrorMessage } from '@core/models/api-error.model';
import { AuthService } from '@core/services/auth.service';
import { PermissionService } from '@core/services/permission.service';
import { Button, FormContainer, ToastService } from '@shared/components';
import { AppRoutes } from '@shared/constants/routes.constant';
import { safeReturnUrl } from '@shared/utils/safe-return-url';
import { switchMap } from 'rxjs';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, MatFormFieldModule, MatInputModule, FormContainer, Button],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class Login {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly permissions = inject(PermissionService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly toast = inject(ToastService);

  readonly submitting = signal(false);

  readonly form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required],
  });

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.submitting.set(true);

    const { email, password } = this.form.getRawValue();
    this.auth
      .login(email, password)
      .pipe(switchMap(() => this.permissions.load()))
      .subscribe({
        next: () => {
          this.toast.success('Signed in successfully');
          void this.router.navigateByUrl(
            safeReturnUrl(this.route.snapshot.queryParamMap.get('returnUrl'), AppRoutes.dashboard),
          );
        },
        error: (err) => {
          this.submitting.set(false);
          this.toast.error(apiErrorMessage(err, err?.message ?? 'Invalid email or password'));
        },
      });
  }
}
