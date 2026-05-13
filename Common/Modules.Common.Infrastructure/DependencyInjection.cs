using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using Modules.Common.Infrastructure.Configuration;
using Modules.Common.Infrastructure.HourlyAccess;
using Modules.Common.Infrastructure.Policies;
using Npgsql;
using OpenTelemetry.Metrics;
using OpenTelemetry.Resources;
using OpenTelemetry.Trace;

// ReSharper disable once CheckNamespace
namespace Microsoft.Extensions.DependencyInjection;

public static class DependencyInjection
{
    public static IServiceCollection AddCoreInfrastructure(
        this IServiceCollection services,
        IConfiguration configuration,
        string[] activityModuleNames)
    {
        services.AddMemoryCache();

        services.AddHostOpenTelemetry(activityModuleNames);

        services.AddJwtAuthentication(configuration);
        services.AddClaimsAuthorization();
        services.AddHourlyAccessLimit(configuration);

        return services;
    }

    public static IApplicationBuilder UseHourlyAccessLimit(this IApplicationBuilder app) =>
        app.UseMiddleware<HourlyAccessLimitMiddleware>();

    private static IServiceCollection AddHourlyAccessLimit(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        services.AddOptions<HourlyAccessLimitSettings>()
            .Bind(configuration.GetSection(HourlyAccessLimitSettings.SectionName));

        services.AddSingleton<IHourlyAccessLimitService, HourlyAccessLimitService>();

        return services;
    }

    private static IServiceCollection AddHostOpenTelemetry(
        this IServiceCollection services,
        params string[] activityModuleNames)
    {
        services
            .AddOpenTelemetry()
            .WithMetrics(metrics =>
            {
	            metrics.AddAspNetCoreInstrumentation()
		            .AddHttpClientInstrumentation()
		            .AddRuntimeInstrumentation();
            })
            .ConfigureResource(resource => resource.AddService("ShippingModularMonolith"))
            .WithTracing(tracing =>
            {
                tracing
                    .AddAspNetCoreInstrumentation()
                    .AddHttpClientInstrumentation()
                    .AddNpgsql()
                    .AddSource(activityModuleNames);

                tracing.AddOtlpExporter();
            });

        return services;
    }

    private static IServiceCollection AddJwtAuthentication(this IServiceCollection services, IConfiguration configuration)
    {
        services.AddOptions<AuthConfiguration>()
            .Bind(configuration.GetSection(nameof(AuthConfiguration)));

        var tokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = configuration["AuthConfiguration:Issuer"],
            ValidAudience = configuration["AuthConfiguration:Audience"],
#pragma warning disable S6781
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(configuration["AuthConfiguration:Key"]  ?? throw new InvalidOperationException("JWT key is not configured")))
#pragma warning restore S6781
        };

        services.AddSingleton(tokenValidationParameters);

        services.AddAuthentication(options =>
            {
                options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
                options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
                options.DefaultScheme = JwtBearerDefaults.AuthenticationScheme;
            })
            .AddJwtBearer(options =>
            {
                options.TokenValidationParameters = tokenValidationParameters;
            });

        return services;
    }

    private static IServiceCollection AddClaimsAuthorization(this IServiceCollection services)
    {
        services.AddSingleton<IConfigureOptions<AuthorizationOptions>, AuthorizationConfigureOptions>();
        services.AddAuthorization();

        return services;
    }
}
