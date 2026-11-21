import { inject, Injectable, signal } from '@angular/core';
import { PermissionItem } from '@core/models/user.model';
import { ApiService } from '@core/services/api.service';
import { ApiEndpoints } from '@shared/constants/api-endpoints.constant';
import { map, Observable, of } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class PermissionService {
  private readonly api = inject(ApiService);
  private readonly codes = signal<Set<string> | null>(null);

  load(): Observable<Set<string>> {
    const cached = this.codes();
    if (cached) {
      return of(cached);
    }

    return this.api.get<{ permissions: PermissionItem[] }>(ApiEndpoints.permissions).pipe(
      map((res) => {
        const codes = new Set(res.permissions.map((item) => item.code));
        this.codes.set(codes);
        return codes;
      }),
    );
  }

  hasPermissionCode(code: string): boolean {
    return this.codes()?.has(code) ?? false;
  }

  clear(): void {
    this.codes.set(null);
  }
}
