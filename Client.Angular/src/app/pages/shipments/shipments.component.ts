import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService, ShipmentResponse } from '../../core/services/api.service';

@Component({
  selector: 'app-shipments',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-6">
      <div class="flex items-center justify-between">
        <h1
          class="lp-serif font-semibold text-2xl"
          style="color: var(--lp-fg)"
        >
          Shipments
        </h1>
      </div>

      <!-- Search -->
      <div class="flex gap-3">
        <input
          [(ngModel)]="searchNumber"
          placeholder="Search by shipment number…"
          class="flex-1 rounded-md px-3 py-2 text-sm"
          style="
            border: 1px solid var(--lp-border);
            background: var(--lp-bg);
            color: var(--lp-fg);
          "
          (keydown.enter)="search()"
        />
        <button class="lp-btn-gold" (click)="search()">Search</button>
      </div>

      @if (error) {
        <p class="text-sm" style="color: #dc2626">{{ error }}</p>
      }

      <!-- Result -->
      @if (shipment) {
        <div
          class="rounded-xl p-6 space-y-4"
          style="
            border: 1px solid var(--lp-border);
            background: var(--lp-gold-bg);
          "
        >
          <div class="flex items-center justify-between">
            <h2
              class="lp-serif font-semibold text-lg"
              style="color: var(--lp-fg)"
            >
              Shipment {{ shipment.number }}
            </h2>
            <span
              class="text-xs px-3 py-1 rounded-full"
              style="
                border: 1px solid var(--lp-gold-border);
                color: var(--lp-gold);
              "
            >
              {{ shipment.status }}
            </span>
          </div>

          <div class="grid grid-cols-2 gap-3 text-sm">
            <div>
              <span style="color: var(--lp-fg-dim)">Order ID:</span>
              {{ shipment.orderId }}
            </div>
            <div>
              <span style="color: var(--lp-fg-dim)">Carrier:</span>
              {{ shipment.carrier }}
            </div>
            <div>
              <span style="color: var(--lp-fg-dim)">Receiver:</span>
              {{ shipment.receiverEmail }}
            </div>
            <div>
              <span style="color: var(--lp-fg-dim)">Address:</span>
              {{ shipment.address.street }}, {{ shipment.address.city }}
              {{ shipment.address.zip }}
            </div>
          </div>

          @if (shipment.items.length > 0) {
            <table class="w-full text-sm">
              <thead>
                <tr style="border-bottom: 1px solid var(--lp-border)">
                  <th
                    class="text-left py-2"
                    style="color: var(--lp-fg-dim)"
                  >
                    Product
                  </th>
                  <th
                    class="text-right py-2"
                    style="color: var(--lp-fg-dim)"
                  >
                    Quantity
                  </th>
                </tr>
              </thead>
              <tbody>
                @for (item of shipment.items; track item.product) {
                  <tr style="border-bottom: 1px solid var(--lp-border)">
                    <td class="py-2">{{ item.product }}</td>
                    <td class="text-right py-2">{{ item.quantity }}</td>
                  </tr>
                }
              </tbody>
            </table>
          }
        </div>
      } @else if (!error) {
        <p class="text-sm" style="color: var(--lp-fg-dim)">
          No shipments loaded. Search for a shipment number above.
        </p>
      }
    </div>
  `,
})
export class ShipmentsComponent {
  searchNumber = '';
  shipment: ShipmentResponse | null = null;
  error = '';

  constructor(private readonly api: ApiService) {}

  search(): void {
    if (!this.searchNumber.trim()) return;
    this.error = '';
    this.shipment = null;

    this.api.getShipmentByNumber(this.searchNumber.trim()).subscribe({
      next: (res) => (this.shipment = res),
      error: () => (this.error = 'Shipment not found.'),
    });
  }
}
