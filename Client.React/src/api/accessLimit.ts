export interface ClientAccessInfo {
  hasAccess: boolean;
  sessionStartedAt: string | null;
  sessionExpiresAt: string | null;
}

export interface HourlyAccessStatus {
  enabled: boolean;
  maxUsersPerHour: number;
  currentUsersInWindow: number;
  sessionDurationMinutes: number;
  windowResetsAt: string;
  yourAccess: ClientAccessInfo;
}

export async function getAccessLimitStatus(): Promise<HourlyAccessStatus> {
  const res = await fetch("/api/access-limit/status");
  return res.json() as Promise<HourlyAccessStatus>;
}
