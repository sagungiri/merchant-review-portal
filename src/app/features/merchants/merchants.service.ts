import { inject, Injectable } from '@angular/core';
import { ApiService } from '@core/services/api.service';
import { Paged } from '@shared/models/paged.model';
import { ApiEndpoints } from '@shared/constants/api-endpoints.constant';
import { Observable } from 'rxjs';
import { Merchant, MerchantDraft, MerchantListItem, MerchantStatus } from './models/merchant.model';

export interface MerchantQuery {
  page: number;
  pageSize: number;
  status?: MerchantStatus | '';
  q?: string;
}

@Injectable({ providedIn: 'root' })
export class MerchantService {
  private readonly api = inject(ApiService);

  list(query: MerchantQuery): Observable<Paged<MerchantListItem>> {
    return this.api.get(ApiEndpoints.merchants.list, {
      params: {
        page: query.page,
        pageSize: query.pageSize,
        status: query.status,
        q: query.q,
      },
    });
  }

  get(id: string): Observable<Merchant> {
    return this.api.get(ApiEndpoints.merchants.byId(id));
  }

  create(draft: MerchantDraft): Observable<Merchant> {
    return this.api.post(ApiEndpoints.merchants.list, draft);
  }

  update(id: string, body: Partial<MerchantDraft> & { status?: 'SUBMITTED' }): Observable<Merchant> {
    return this.api.patch(ApiEndpoints.merchants.byId(id), body);
  }

  review(id: string, decision: 'APPROVED' | 'REJECTED'): Observable<Merchant> {
    return this.api.post(ApiEndpoints.merchants.review(id), { decision });
  }
}
