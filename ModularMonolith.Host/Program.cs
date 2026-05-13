using ModularMonolith.Host.Seeding;
using Modules.Common.API.Extensions;
using Modules.Common.Infrastructure.Database;
using Modules.Common.Infrastructure.HourlyAccess;

var builder = WebApplication.CreateBuilder(args);

builder.AddServiceDefaults();

builder.Services.AddWebHostDependencies();

builder.AddCoreHostLogging();

builder.Services.AddCoreWebApiInfrastructure();

var allowedOrigins = builder.Configuration
    .GetSection("AllowedCorsOrigins").Get<string[]>() ?? [];

builder.Services.AddCors(options =>
    options.AddPolicy("ClientAppPolicy", p => p
        .WithOrigins(allowedOrigins)
        .AllowAnyHeader()
        .AllowAnyMethod()
        .AllowCredentials()));

builder.Services.AddCoreInfrastructure(builder.Configuration,
[
    ShipmentsModuleRegistration.ActivityModuleName,
    CarriersModuleRegistration.ActivityModuleName,
    StocksModuleRegistration.ActivityModuleName
]);

builder.Services
    .AddUsersModule(builder.Configuration)
    .AddShipmentsModule(builder.Configuration)
    .AddCarriersModule(builder.Configuration)
    .AddStocksModule(builder.Configuration);

// Seed entities in DEVELOPMENT mode
if (builder.Environment.IsDevelopment())
{
    builder.Services.AddScoped<SeedService>();
}

var app = builder.Build();

app.MapDefaultEndpoints();

// Run migrations in DEVELOPMENT mode
if (app.Environment.IsDevelopment())
{
    using var scope = app.Services.CreateScope();
    await scope.MigrateModuleDatabasesAsync();

    var userSeedService = scope.ServiceProvider.GetRequiredService<UserSeedService>();
    await userSeedService.SeedUsersAsync();

    var seedService = scope.ServiceProvider.GetRequiredService<SeedService>();
    await seedService.SeedDataAsync();
}

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors("ClientAppPolicy");

app.UseHourlyAccessLimit();

app.UseAuthentication();
app.UseAuthorization();

app.UseModuleMiddlewares();

app.MapGet("/api/access-limit/status", (HttpContext ctx, IHourlyAccessLimitService svc) =>
{
    var clientKey = ctx.Request.Headers["X-Forwarded-For"].FirstOrDefault()?.Split(',')[0].Trim()
        ?? ctx.Connection.RemoteIpAddress?.ToString()
        ?? "unknown";

    return Results.Ok(svc.GetStatus(clientKey));
}).AllowAnonymous();

app.MapApiEndpoints();

await app.RunAsync();
