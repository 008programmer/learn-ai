namespace Modules.Common.Infrastructure.HourlyAccess;

public sealed class HourlyAccessLimitSettings
{
    public const string SectionName = "HourlyAccessLimit";

    public bool Enabled { get; init; }

    public int MaxUsersPerHour { get; init; } = 50;

    public int SessionDurationMinutes { get; init; } = 60;
}
