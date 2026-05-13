import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-access-denied',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div
      class="min-h-screen flex flex-col lp-sans"
      style="background: var(--lp-bg); color: var(--lp-fg)"
    >
      <!-- Header -->
      <header
        class="fixed top-0 left-0 right-0 z-50 flex h-16 items-center justify-between px-6 md:px-12"
        style="
          border-bottom: 1px solid var(--lp-border);
          background: var(--lp-header-bg);
          backdrop-filter: blur(18px);
        "
      >
        <a
          routerLink="/"
          class="lp-serif font-semibold text-xl"
          style="color: var(--lp-gold); letter-spacing: 0.08em; text-decoration: none"
        >
          Modular Monolith
        </a>
        <div class="flex items-center gap-3">
          <a routerLink="/login" class="lp-btn-ghost">Sign in</a>
        </div>
      </header>

      <!-- Content -->
      <main
        class="flex flex-1 flex-col items-center justify-center px-6 pt-16 text-center gap-8 max-w-xl mx-auto w-full"
      >
        <h1
          class="lp-serif font-semibold"
          style="font-size: clamp(1.75rem, 5vw, 2.75rem); color: var(--lp-fg)"
        >
          Hourly limit reached
        </h1>
        <p
          class="text-base leading-relaxed"
          style="color: var(--lp-fg-dim); font-weight: 300"
        >
          This application limits the number of concurrent users each hour. All
          slots for this hour are currently taken.
        </p>

        <div class="flex flex-wrap gap-3 justify-center">
          <button class="lp-btn-ghost" (click)="reload()">Check again</button>
          <a routerLink="/" class="lp-btn-gold">Back to home</a>
        </div>

        <p class="text-xs" style="color: var(--lp-fg-faint)">
          Access is granted on a first-come, first-served basis each hour.
          <br />
          Refresh the page or try again when the window resets.
        </p>
      </main>
    </div>
  `,
})
export class AccessDeniedComponent {
  reload(): void {
    window.location.reload();
  }
}
