using Microsoft.Extensions.Options;

namespace Modules.Common.Infrastructure.HourlyAccess;

public sealed record AccessCheckResult(bool IsGranted, DateTime? SessionExpiresAt);

public sealed record ClientAccessInfo(bool HasAccess, DateTime? SessionStartedAt, DateTime? SessionExpiresAt);

public sealed record HourlyAccessStatus(
    bool Enabled,
    int MaxUsersPerHour,
    int CurrentUsersInWindow,
    int SessionDurationMinutes,
    DateTime WindowResetsAt,
    ClientAccessInfo YourAccess);

public interface IHourlyAccessLimitService
{
    AccessCheckResult TryGrantAccess(string clientKey);

    HourlyAccessStatus GetStatus(string clientKey);
}

public sealed class HourlyAccessLimitService : IHourlyAccessLimitService
{
    private readonly HourlyAccessLimitSettings _settings;
    private readonly Dictionary<string, Dictionary<string, DateTime>> _windows = new();
    private readonly object _lock = new();

    public HourlyAccessLimitService(IOptions<HourlyAccessLimitSettings> settings)
    {
        _settings = settings.Value;
    }

    public AccessCheckResult TryGrantAccess(string clientKey)
    {
        if (!_settings.Enabled)
        {
            return new AccessCheckResult(true, null);
        }

        var windowKey = GetWindowKey();

        lock (_lock)
        {
            CleanupOldWindows(windowKey);

            if (!_windows.TryGetValue(windowKey, out var window))
            {
                window = new Dictionary<string, DateTime>();
                _windows[windowKey] = window;
            }

            if (window.TryGetValue(clientKey, out var sessionStart))
            {
                var expiry = sessionStart.AddMinutes(_settings.SessionDurationMinutes);
                return new AccessCheckResult(DateTime.UtcNow <= expiry, expiry);
            }

            if (window.Count >= _settings.MaxUsersPerHour)
            {
                return new AccessCheckResult(false, null);
            }

            var now = DateTime.UtcNow;
            window[clientKey] = now;
            return new AccessCheckResult(true, now.AddMinutes(_settings.SessionDurationMinutes));
        }
    }

    public HourlyAccessStatus GetStatus(string clientKey)
    {
        if (!_settings.Enabled)
        {
            return new HourlyAccessStatus(
                false,
                _settings.MaxUsersPerHour,
                0,
                _settings.SessionDurationMinutes,
                GetWindowResetTime(),
                new ClientAccessInfo(true, null, null));
        }

        var windowKey = GetWindowKey();

        lock (_lock)
        {
            CleanupOldWindows(windowKey);

            if (!_windows.TryGetValue(windowKey, out var window))
            {
                window = new Dictionary<string, DateTime>();
                _windows[windowKey] = window;
            }

            ClientAccessInfo yourAccess;
            if (window.TryGetValue(clientKey, out var sessionStart))
            {
                var sessionExpiry = sessionStart.AddMinutes(_settings.SessionDurationMinutes);
                yourAccess = new ClientAccessInfo(DateTime.UtcNow <= sessionExpiry, sessionStart, sessionExpiry);
            }
            else
            {
                var canJoin = window.Count < _settings.MaxUsersPerHour;
                yourAccess = new ClientAccessInfo(canJoin, null, null);
            }

            return new HourlyAccessStatus(
                _settings.Enabled,
                _settings.MaxUsersPerHour,
                window.Count,
                _settings.SessionDurationMinutes,
                GetWindowResetTime(),
                yourAccess);
        }
    }

    private void CleanupOldWindows(string currentWindowKey)
    {
        var keysToRemove = _windows.Keys
            .Where(k => k != currentWindowKey)
            .ToList();

        foreach (var key in keysToRemove)
        {
            _windows.Remove(key);
        }
    }

    private static string GetWindowKey() =>
        DateTime.UtcNow.ToString("yyyy-MM-dd-HH");

    private static DateTime GetWindowResetTime()
    {
        var now = DateTime.UtcNow;
        return new DateTime(now.Year, now.Month, now.Day, now.Hour, 0, 0, DateTimeKind.Utc).AddHours(1);
    }
}
