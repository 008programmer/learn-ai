// Single-flight refresh lock
let refreshPromise: Promise<string | null> | null = null;

function getToken(): string | null {
  try {
    const raw = localStorage.getItem("auth-storage");
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    if (
      parsed !== null &&
      typeof parsed === "object" &&
      "state" in parsed &&
      parsed.state !== null &&
      typeof parsed.state === "object" &&
      "token" in parsed.state
    ) {
      return (parsed.state as { token: string | null }).token;
    }
    return null;
  } catch {
    return null;
  }
}

function getRefreshToken(): string | null {
  try {
    const raw = localStorage.getItem("auth-storage");
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    if (
      parsed !== null &&
      typeof parsed === "object" &&
      "state" in parsed &&
      parsed.state !== null &&
      typeof parsed.state === "object" &&
      "refreshToken" in parsed.state
    ) {
      return (parsed.state as { refreshToken: string | null }).refreshToken;
    }
    return null;
  } catch {
    return null;
  }
}

function setTokens(token: string, refreshToken: string): void {
  try {
    const raw = localStorage.getItem("auth-storage");
    const parsed: unknown = raw ? JSON.parse(raw) : { state: {}, version: 0 };
    if (parsed !== null && typeof parsed === "object" && "state" in parsed) {
      const state = parsed.state as Record<string, unknown>;
      state.token = token;
      state.refreshToken = refreshToken;
      localStorage.setItem("auth-storage", JSON.stringify(parsed));
    }
  } catch {
    // ignore
  }
}

function clearTokens(): void {
  localStorage.removeItem("auth-storage");
}

async function doRefresh(): Promise<string | null> {
  const rt = getRefreshToken();
  const oldToken = getToken();
  if (!rt || !oldToken) return null;

  const res = await fetch("/api/users/refresh", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token: oldToken, refreshToken: rt }),
  });

  if (!res.ok) {
    clearTokens();
    return null;
  }

  const data = (await res.json()) as { token: string; refreshToken: string };
  setTokens(data.token, data.refreshToken);
  return data.token;
}

async function refreshOnce(): Promise<string | null> {
  if (!refreshPromise) {
    refreshPromise = doRefresh().finally(() => {
      refreshPromise = null;
    });
  }
  return refreshPromise;
}

export interface ApiError {
  status: number;
  title?: string;
  detail?: string;
}

async function request<T>(
  url: string,
  options: RequestInit = {},
  retry = true
): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(url, { ...options, headers });

  if (res.status === 429) {
    window.location.href = "/access-denied";
    throw { status: 429, title: "Hourly access limit reached" } as ApiError;
  }

  if (res.status === 401 && retry) {
    const newToken = await refreshOnce();
    if (newToken) {
      return request<T>(url, options, false);
    }
    // Refresh failed — redirect to login
    clearTokens();
    window.location.href = "/login";
    throw { status: 401 } as ApiError;
  }

  if (!res.ok) {
    let errorBody: unknown;
    try {
      errorBody = await res.json();
    } catch {
      errorBody = {};
    }
    throw {
      status: res.status,
      ...(errorBody as object),
    } as ApiError;
  }

  if (res.status === 204) {
    return undefined as unknown as T;
  }

  return res.json() as Promise<T>;
}

export const apiClient = {
  get: <T>(url: string) => request<T>(url, { method: "GET" }),
  post: <T>(url: string, body?: unknown) =>
    request<T>(url, {
      method: "POST",
      body: body !== undefined ? JSON.stringify(body) : undefined,
    }),
  put: <T>(url: string, body?: unknown) =>
    request<T>(url, {
      method: "PUT",
      body: body !== undefined ? JSON.stringify(body) : undefined,
    }),
  delete: <T>(url: string) => request<T>(url, { method: "DELETE" }),
};
