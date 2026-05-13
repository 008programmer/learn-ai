import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule, RouterLink],
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
        <span
          class="lp-serif font-semibold text-xl"
          style="color: var(--lp-gold); letter-spacing: 0.08em"
        >
          Modular Monolith
        </span>
        <div class="flex items-center gap-3">
          @if (auth.isAuthenticated()) {
            @if (auth.email()) {
              <span class="lp-sans text-sm" style="color: var(--lp-fg); opacity: 0.7">
                {{ auth.email() }}
              </span>
            }
            <a routerLink="/shipments" class="lp-btn-gold" style="padding: 0.35rem 1rem; font-size: 0.8125rem">
              Go to app
            </a>
            <button
              class="lp-btn-ghost"
              style="padding: 0.35rem 1rem; font-size: 0.8125rem"
              (click)="auth.logout()"
            >
              Sign out
            </button>
          } @else {
            <a routerLink="/login" class="lp-btn-ghost" style="padding: 0.35rem 1rem; font-size: 0.8125rem">
              Sign in
            </a>
            <a routerLink="/register" class="lp-btn-gold" style="padding: 0.35rem 1rem; font-size: 0.8125rem">
              Get started
            </a>
          }
        </div>
      </header>

      <!-- Hero -->
      <section
        class="flex flex-1 flex-col items-center justify-center text-center px-6 pt-16"
      >
        <div class="flex flex-col items-center gap-5 max-w-2xl w-full">
          <h1
            class="lp-reveal lp-serif font-semibold leading-none"
            style="
              font-size: clamp(2.5rem, 8vw, 5rem);
              color: var(--lp-fg);
              letter-spacing: -0.02em;
              animation-delay: 0.2s;
            "
          >
            Modular Monolith Template
          </h1>

          <p
            class="lp-reveal lp-serif"
            style="
              color: var(--lp-gold-dim);
              font-size: 1.1rem;
              font-style: italic;
              letter-spacing: 0.06em;
              animation-delay: 0.38s;
            "
          >
            A production-ready starting point for your next project
          </p>

          <p
            class="lp-reveal max-w-md text-base leading-relaxed"
            style="
              color: var(--lp-fg-dim);
              font-weight: 300;
              animation-delay: 0.54s;
            "
          >
            Modular monolith architecture with ASP.NET Core, React, and
            PostgreSQL.
          </p>

          <div
            class="lp-reveal flex flex-wrap gap-3 pt-3 justify-center"
            style="animation-delay: 0.7s"
          >
            <a routerLink="/register" class="lp-btn-gold">
              Get started
            </a>
            <a routerLink="/login" class="lp-btn-ghost"> Sign in </a>
          </div>
        </div>
      </section>

      <!-- Footer -->
      <footer
        class="flex h-12 items-center justify-center gap-3 px-6 text-xs lp-sans"
        style="color: var(--lp-fg-faint)"
      >
        <span>Modular Monolith Template</span>
        <span>&middot;</span>
        <span>&copy; {{ year }}</span>
      </footer>
    </div>
  `,
})
export class LandingComponent {
  year = new Date().getFullYear();

  constructor(readonly auth: AuthService) {}
}
