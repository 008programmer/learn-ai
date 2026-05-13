import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface ShipmentResponse {
  number: string;
  orderId: string;
  address: { street: string; city: string; zip: string };
  carrier: string;
  receiverEmail: string;
  status: string;
  items: { product: string; quantity: number }[];
}

export interface HourlyAccessStatus {
  enabled: boolean;
  maxUsersPerHour: number;
  sessionDurationMinutes: number;
  currentUsersInWindow: number;
  windowResetsAt: string;
}

@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly base = environment.apiBaseUrl;

  constructor(private readonly http: HttpClient) {}

  getShipmentByNumber(number: string): Observable<ShipmentResponse> {
    return this.http.get<ShipmentResponse>(
      `${this.base}/shipments/${encodeURIComponent(number)}`,
    );
  }

  getAccessLimitStatus(): Observable<HourlyAccessStatus> {
    return this.http.get<HourlyAccessStatus>(
      `${this.base}/access-limit/status`,
    );
  }
}
