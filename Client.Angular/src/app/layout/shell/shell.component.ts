import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, RouterOutlet],
  template: `
    <div
      class="flex h-screen overflow-hidden lp-sans"
      style="background: var(--lp-bg); color: var(--lp-fg)"
    >
      <!-- Sidebar -->
      <aside
        class="flex w-56 flex-col"
        style="
          border-right: 1px solid var(--lp-border);
          background: var(--lp-header-bg);
          backdrop-filter: blur(18px);
        "
      >
        <!-- Brand -->
        <a
          routerLink="/"
          class="flex h-14 items-center px-5 transition-opacity hover:opacity-80"
          style="border-bottom: 1px solid var(--lp-border)"
        >
          <span
            class="lp-serif font-semibold text-xl"
            style="color: var(--lp-gold); letter-spacing: 0.08em"
          >
            Modular Monolith
          </span>
        </a>

        <!-- Nav -->
        <nav class="flex-1 p-3 space-y-0.5">
          @for (item of navItems; track item.to) {
            <a
              [routerLink]="item.to"
              routerLinkActive="nav-active"
              class="flex items-center gap-3 rounded-r-md px-3 py-2 text-sm transition-all duration-150"
              style="
                color: var(--lp-fg-dim);
                border-left: 2px solid transparent;
                padding-left: calc(0.75rem - 2px);
              "
            >
              {{ item.label }}
            </a>
          }
        </nav>

        <!-- Footer -->
        <div
          class="p-3 space-y-2"
          style="border-top: 1px solid var(--lp-border)"
        >
          @if (auth.email()) {
            <p
              class="truncate px-2 text-xs"
              style="color: var(--lp-fg-faint)"
            >
              {{ auth.email() }}
            </p>
          }
          <button
            class="lp-btn-ghost w-full justify-start gap-2 text-xs"
            style="padding: 0.4rem 0.75rem; font-size: 0.8125rem"
            (click)="auth.logout()"
          >
            Sign out
          </button>
        </div>
      </aside>

      <!-- Main content -->
      <main class="flex-1 overflow-y-auto p-6">
        <router-outlet />
      </main>
    </div>
  `,
  styles: [
    `
      :host ::ng-deep .nav-active {
        background: var(--lp-gold-bg) !important;
        color: var(--lp-gold) !important;
        border-left: 2px solid var(--lp-gold) !important;
        padding-left: calc(0.75rem - 2px) !important;
      }
    `,
  ],
})
export class ShellComponent {
  navItems = [
    { to: '/shipments', label: 'Shipments' },
    { to: '/carriers', label: 'Carriers' },
    { to: '/stocks', label: 'Stocks' },
    { to: '/users', label: 'Users' },
  ];

  constructor(readonly auth: AuthService) {}
}
