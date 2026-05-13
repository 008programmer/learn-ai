import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div
      class="min-h-screen flex items-center justify-center lp-sans"
      style="background: var(--lp-bg); color: var(--lp-fg)"
    >
      <div
        class="w-full max-w-sm p-8 rounded-xl"
        style="border: 1px solid var(--lp-border); background: var(--lp-gold-bg)"
      >
        <h1
          class="lp-serif font-semibold text-2xl mb-1"
          style="color: var(--lp-fg)"
        >
          Sign in
        </h1>
        <p class="text-sm mb-6" style="color: var(--lp-fg-dim)">
          Enter your credentials to continue
        </p>

        @if (error) {
          <div
            class="mb-4 p-3 rounded text-sm"
            style="background: rgba(220,38,38,0.1); color: #dc2626"
          >
            {{ error }}
          </div>
        }

        <form [formGroup]="form" (ngSubmit)="onSubmit()">
          <label class="block mb-4">
            <span class="text-sm font-medium" style="color: var(--lp-fg-dim)"
              >Email</span
            >
            <input
              formControlName="email"
              type="email"
              class="mt-1 block w-full rounded-md px-3 py-2 text-sm"
              style="
                border: 1px solid var(--lp-border);
                background: var(--lp-bg);
                color: var(--lp-fg);
              "
            />
          </label>

          <label class="block mb-6">
            <span class="text-sm font-medium" style="color: var(--lp-fg-dim)"
              >Password</span
            >
            <input
              formControlName="password"
              type="password"
              class="mt-1 block w-full rounded-md px-3 py-2 text-sm"
              style="
                border: 1px solid var(--lp-border);
                background: var(--lp-bg);
                color: var(--lp-fg);
              "
            />
          </label>

          <button
            type="submit"
            class="lp-btn-gold w-full justify-center"
            [disabled]="loading"
          >
            {{ loading ? 'Signing in…' : 'Sign in' }}
          </button>
        </form>

        <p class="mt-4 text-center text-sm" style="color: var(--lp-fg-dim)">
          No account?
          <a
            routerLink="/register"
            style="color: var(--lp-gold); text-decoration: underline"
            >Register</a
          >
        </p>
      </div>
    </div>
  `,
})
export class LoginComponent {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required],
  });
  loading = false;
  error = '';

  onSubmit(): void {
    if (this.form.invalid) return;
    this.loading = true;
    this.error = '';

    const { email, password } = this.form.getRawValue();
    this.auth.login({ email, password }).subscribe({
      next: () => {
        void this.router.navigate(['/shipments']);
      },
      error: () => {
        this.error = 'Invalid email or password.';
        this.loading = false;
      },
    });
  }
}
