import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';

interface AuthState {
  token: string | null;
  refreshToken: string | null;
  userId: string | null;
  email: string | null;
}

interface LoginRequest {
  email: string;
  password: string;
}

interface RegisterRequest {
  email: string;
  password: string;
  city: string;
}

interface LoginResponse {
  token: string;
  refreshToken: string;
}

interface UserResponse {
  id: string;
  email: string;
  city: string;
}

const STORAGE_KEY = 'auth-storage';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly state = signal<AuthState>(this.loadState());

  readonly token = computed(() => this.state().token);
  readonly email = computed(() => this.state().email);
  readonly isAuthenticated = computed(() => !!this.state().token);

  constructor(
    private readonly http: HttpClient,
    private readonly router: Router,
  ) {}

  login(request: LoginRequest): Observable<LoginResponse> {
    return this.http
      .post<LoginResponse>(`${environment.apiBaseUrl}/users/login`, request)
      .pipe(tap((res) => this.setAuth(res.token, res.refreshToken)));
  }

  register(request: RegisterRequest): Observable<UserResponse> {
    return this.http.post<UserResponse>(
      `${environment.apiBaseUrl}/users/register`,
      request,
    );
  }

  refreshToken(): Observable<LoginResponse> {
    const { token, refreshToken } = this.state();
    return this.http
      .post<LoginResponse>(`${environment.apiBaseUrl}/users/refresh`, {
        token,
        refreshToken,
      })
      .pipe(tap((res) => this.setAuth(res.token, res.refreshToken)));
  }

  logout(): void {
    this.clearAuth();
    void this.router.navigate(['/login']);
  }

  setAuth(
    token: string,
    refreshToken: string,
    userId?: string,
    email?: string,
  ): void {
    const current = this.state();
    const newState: AuthState = {
      token,
      refreshToken,
      userId: userId ?? current.userId,
      email: email ?? current.email,
    };
    this.state.set(newState);
    this.saveState(newState);
  }

  private clearAuth(): void {
    const empty: AuthState = {
      token: null,
      refreshToken: null,
      userId: null,
      email: null,
    };
    this.state.set(empty);
    localStorage.removeItem(STORAGE_KEY);
  }

  private loadState(): AuthState {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return { token: null, refreshToken: null, userId: null, email: null };
      const parsed = JSON.parse(raw);
      return parsed.state ?? { token: null, refreshToken: null, userId: null, email: null };
    } catch {
      return { token: null, refreshToken: null, userId: null, email: null };
    }
  }

  private saveState(state: AuthState): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ state, version: 0 }));
  }
}
