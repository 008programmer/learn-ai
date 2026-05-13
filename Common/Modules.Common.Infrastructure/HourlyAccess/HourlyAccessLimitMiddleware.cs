using System.Net;
using System.Text.Json;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Options;

namespace Modules.Common.Infrastructure.HourlyAccess;

public sealed class HourlyAccessLimitMiddleware
{
    private static readonly string[] ExcludedPrefixes =
    [
        "/api/users/login",
        "/api/users/register",
        "/api/users/refresh",
        "/api/users/forgot-password",
        "/api/users/reset-password",
        "/api/access-limit",
    ];

    private readonly RequestDelegate _next;
    private readonly IHourlyAccessLimitService _accessLimitService;
    private readonly HourlyAccessLimitSettings _settings;

    public HourlyAccessLimitMiddleware(
        RequestDelegate next,
        IHourlyAccessLimitService accessLimitService,
        IOptions<HourlyAccessLimitSettings> settings)
    {
        _next = next;
        _accessLimitService = accessLimitService;
        _settings = settings.Value;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        if (!_settings.Enabled)
        {
            await _next(context);
            return;
        }

        var path = context.Request.Path.Value ?? string.Empty;
        if (IsExcluded(path))
        {
            await _next(context);
            return;
        }

        var clientKey = GetClientKey(context);
        var result = _accessLimitService.TryGrantAccess(clientKey);

        if (!result.IsGranted)
        {
            context.Response.StatusCode = StatusCodes.Status429TooManyRequests;
            context.Response.ContentType = "application/json";

            var status = _accessLimitService.GetStatus(clientKey);
            var body = new
            {
                type = "https://tools.ietf.org/html/rfc6585#section-4",
                title = "Hourly access limit reached",
                status = StatusCodes.Status429TooManyRequests,
                detail = $"The application is limited to {_settings.MaxUsersPerHour} users per hour. Please try again when the window resets.",
                windowResetsAt = status.WindowResetsAt,
            };

            await context.Response.WriteAsync(JsonSerializer.Serialize(body));
            return;
        }

        await _next(context);
    }

    private static bool IsExcluded(string path) =>
        ExcludedPrefixes.Any(prefix => path.StartsWith(prefix, StringComparison.OrdinalIgnoreCase));

    private static string GetClientKey(HttpContext context)
    {
        var forwardedFor = context.Request.Headers["X-Forwarded-For"].FirstOrDefault();
        if (!string.IsNullOrWhiteSpace(forwardedFor))
        {
            var firstIp = forwardedFor.Split(',')[0].Trim();
            if (!string.IsNullOrWhiteSpace(firstIp))
            {
                return firstIp;
            }
        }

        return context.Connection.RemoteIpAddress?.ToString() ?? "unknown";
    }
}
