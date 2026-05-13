# Prompt: Create a New Backend Module

Use this prompt with an AI assistant to generate a complete new module for the Modular Monolith application. Fill in the variables below and provide the entire prompt.

---

## Prompt Template

```
Create a new module called "{ModuleName}" for my Modular Monolith application.

## Module Specification

- **Module Name**: {ModuleName} (e.g., "Todos")
- **Schema Name**: {schema_name} (e.g., "todos")
- **Description**: {Brief description of what this module does}

### Entities

{For each entity, list name + properties with types}

Example:
- **TodoItem**
  - Id: Guid (PK)
  - Title: string (required, max 200)
  - Description: string (optional, max 2000)
  - IsCompleted: bool (default false)
  - DueDate: DateTime? (optional)
  - CreatedAtUtc: DateTime (auditable)
  - UpdatedAtUtc: DateTime? (auditable)

### Features (CRUD + Custom)

{List the features/endpoints you need}

Example:
- CreateTodoItem (POST /api/todos) — requires authorization
- GetAllTodoItems (GET /api/todos) — requires authorization
- GetTodoItemById (GET /api/todos/{id}) — requires authorization
- CompleteTodoItem (PATCH /api/todos/{id}/complete) — requires authorization
- DeleteTodoItem (DELETE /api/todos/{id}) — requires authorization

### Cross-Module Dependencies

- **Exposes PublicApi**: {yes/no} — Will other modules call this module?
- **Depends On**: {List of modules this depends on, e.g., "Projects via IProjectsModuleApi"}

## Architecture Rules

Follow these patterns EXACTLY as used in the existing codebase:

### 1. Project Structure

Create these 4 projects (or 3 if no PublicApi needed):

```
Modules/{ModuleName}/
  Modules.{ModuleName}.Domain/
    Entities/{Entity}.cs
    Policies/{ModuleName}PolicyConsts.cs
    Errors/{ModuleName}Errors.cs
    Modules.{ModuleName}.Domain.csproj
  Modules.{ModuleName}.Infrastructure/
    Database/{ModuleName}DbContext.cs
    Database/DbConsts.cs
    Database/Configuration/{Entity}Configuration.cs
    Database/{ModuleName}DatabaseMigrator.cs
    Policies/{ModuleName}PolicyFactory.cs
    DependencyInjection.cs
    Modules.{ModuleName}.Infrastructure.csproj
  Modules.{ModuleName}.Features/
    Features/{FeatureName}/{FeatureName}.Endpoint.cs
    Features/{FeatureName}/{FeatureName}.Handler.cs
    Features/{FeatureName}/{FeatureName}.Validators.cs
    Features/Shared/Routes/RouteConsts.cs
    Features/Shared/Responses/{Entity}Response.cs
    Tracing/{ModuleName}ActivitySource.cs
    Tracing/{ModuleName}TracingMiddleware.cs
    DependencyInjection.cs
    AssemblyReference.cs
    Modules.{ModuleName}.Features.csproj
  Modules.{ModuleName}.PublicApi/          (if exposes PublicApi)
    I{ModuleName}ModuleApi.cs
    Contracts/{RequestName}.cs
    Modules.{ModuleName}.PublicApi.csproj
```

### 2. Domain Layer

Create `Entities/{Entity}.cs` and `Policies/{ModuleName}PolicyConsts.cs`:

```csharp
// Entities/{Entity}.cs
using Modules.Common.Domain.Entities;

namespace Modules.{ModuleName}.Domain.Entities;

public class {Entity} : IAuditableEntity
{
    public Guid Id { get; set; }
    // ... properties
    public DateTime CreatedAtUtc { get; set; }
    public DateTime? UpdatedAtUtc { get; set; }
}

// Policies/{ModuleName}PolicyConsts.cs
namespace Modules.{ModuleName}.Domain.Policies;

public static class {ModuleName}PolicyConsts
{
    public const string ReadPolicy = "{schema_name}:read";
    public const string CreatePolicy = "{schema_name}:create";
    public const string UpdatePolicy = "{schema_name}:update";
    public const string DeletePolicy = "{schema_name}:delete";
}
```

### 3. Infrastructure Layer

Create these files: `Database/{ModuleName}DbContext.cs`, `Database/DbConsts.cs`, `Database/{ModuleName}DatabaseMigrator.cs`, `Policies/{ModuleName}PolicyFactory.cs`, `DependencyInjection.cs`. Optionally add `Database/Configuration/{Entity}Configuration.cs` for custom EF configuration.

```csharp
// Database/DbConsts.cs
namespace Modules.{ModuleName}.Infrastructure.Database;

public static class DbConsts
{
    public const string SchemaName = "{schema_name}";
    public const string MigrationHistoryTableName = "migration_history";
}

// Database/{ModuleName}DbContext.cs
using Microsoft.EntityFrameworkCore;
using Modules.{ModuleName}.Domain.Entities;

namespace Modules.{ModuleName}.Infrastructure.Database;

public class {ModuleName}DbContext(DbContextOptions<{ModuleName}DbContext> options) : DbContext(options)
{
    public DbSet<{Entity}> {Entities} { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);
        modelBuilder.HasDefaultSchema(DbConsts.SchemaName);
        modelBuilder.ApplyConfigurationsFromAssembly(typeof({ModuleName}DbContext).Assembly);
    }
}

// Database/{ModuleName}DatabaseMigrator.cs
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Modules.Common.Infrastructure.Database;

namespace Modules.{ModuleName}.Infrastructure.Database;

public class {ModuleName}DatabaseMigrator : IModuleDatabaseMigrator
{
    public async Task MigrateAsync(IServiceScope scope, CancellationToken cancellationToken = default)
    {
        var dbContext = scope.ServiceProvider.GetRequiredService<{ModuleName}DbContext>();
        await dbContext.Database.MigrateAsync(cancellationToken);
    }
}

// Policies/{ModuleName}PolicyFactory.cs
using Microsoft.AspNetCore.Authorization;
using Modules.{ModuleName}.Domain.Policies;
using Modules.Common.Infrastructure.Policies;

namespace Modules.{ModuleName}.Infrastructure.Policies;

internal sealed class {ModuleName}PolicyFactory : IPolicyFactory
{
    public string ModuleName => "{ModuleName}";

    public Dictionary<string, Action<AuthorizationPolicyBuilder>> GetPolicies()
    {
        return new Dictionary<string, Action<AuthorizationPolicyBuilder>>
        {
            [{ModuleName}PolicyConsts.ReadPolicy] = policy => policy.RequireClaim({ModuleName}PolicyConsts.ReadPolicy),
            [{ModuleName}PolicyConsts.CreatePolicy] = policy => policy.RequireClaim({ModuleName}PolicyConsts.CreatePolicy),
            [{ModuleName}PolicyConsts.UpdatePolicy] = policy => policy.RequireClaim({ModuleName}PolicyConsts.UpdatePolicy),
            [{ModuleName}PolicyConsts.DeletePolicy] = policy => policy.RequireClaim({ModuleName}PolicyConsts.DeletePolicy)
        };
    }
}

// DependencyInjection.cs
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Modules.{ModuleName}.Infrastructure.Database;
using Modules.{ModuleName}.Infrastructure.Policies;
using Modules.Common.Infrastructure.Database;
using Modules.Common.Infrastructure.Policies;

// ReSharper disable once CheckNamespace
namespace Microsoft.Extensions.DependencyInjection;

public static class DependencyInjection
{
    public static IServiceCollection Add{ModuleName}Infrastructure(this IServiceCollection services, IConfiguration configuration)
    {
        var postgresConnectionString = configuration.GetConnectionString("Postgres");

        services.AddDbContext<{ModuleName}DbContext>(x => x
            .UseNpgsql(postgresConnectionString, npgsqlOptions =>
                npgsqlOptions.MigrationsHistoryTable(DbConsts.MigrationHistoryTableName, DbConsts.SchemaName))
            .UseSnakeCaseNamingConvention()
        );

        services.AddScoped<IModuleDatabaseMigrator, {ModuleName}DatabaseMigrator>();
        services.AddSingleton<IPolicyFactory, {ModuleName}PolicyFactory>();

        return services;
    }
}
```

### 4. Features Layer — Module Setup

Create these files: `Tracing/{ModuleName}ActivitySource.cs`, `Tracing/{ModuleName}TracingMiddleware.cs`, `Features/Shared/Routes/RouteConsts.cs`, `Features/Shared/Responses/{Entity}Response.cs`, `DependencyInjection.cs`, `AssemblyReference.cs`.

```csharp
// Tracing/{ModuleName}ActivitySource.cs
using System.Diagnostics;

namespace Modules.{ModuleName}.Features.Tracing;

internal static class {ModuleName}ActivitySource
{
    internal static readonly ActivitySource Instance = new("{schema_name}");
}

// Tracing/{ModuleName}TracingMiddleware.cs
using System.Diagnostics;
using Microsoft.AspNetCore.Http;
using Modules.{ModuleName}.Features.Features.Shared.Routes;

namespace Modules.{ModuleName}.Features.Tracing;

public class {ModuleName}TracingMiddleware(RequestDelegate next)
{
    public async Task InvokeAsync(HttpContext context)
    {
        if (!context.Request.Path.StartsWithSegments(RouteConsts.BaseRoute, StringComparison.Ordinal))
        {
            await next(context);
            return;
        }

        using var activity = {ModuleName}ActivitySource.Instance.StartActivity(
            $"{{{ModuleName}ActivitySource.Instance.Name}}.{context.Request.Method.ToLower()}");

        activity?.SetTag("module", {ModuleName}ActivitySource.Instance.Name);
        activity?.SetTag("http.method", context.Request.Method);
        activity?.SetTag("http.path", context.Request.Path);

        try
        {
            await next(context);
            activity?.SetTag("http.status_code", context.Response.StatusCode);
            activity?.SetStatus(context.Response.StatusCode >= 400
                ? ActivityStatusCode.Error : ActivityStatusCode.Ok);
        }
        catch (Exception ex)
        {
            activity?.SetStatus(ActivityStatusCode.Error, ex.Message);
            throw;
        }
    }
}

// Features/Shared/Routes/RouteConsts.cs
namespace Modules.{ModuleName}.Features.Features.Shared.Routes;

internal static class RouteConsts
{
    internal const string BaseRoute = "/api/{route-name}";
    internal const string Create = BaseRoute;
    internal const string GetAll = BaseRoute;
    internal const string GetById = BaseRoute + "/{id}";
    internal const string Update = BaseRoute + "/{id}";
    internal const string Delete = BaseRoute + "/{id}";
}

// Features/Shared/Responses/{Entity}Response.cs
namespace Modules.{ModuleName}.Features.Features.Shared.Responses;

public record {Entity}Response(Guid Id, string Name /* other fields */);

// DependencyInjection.cs
using FluentValidation;
using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.Configuration;
using Modules.{ModuleName}.Features.Tracing;
using Modules.Common.API.Abstractions;
using Modules.Common.Application.Extensions;

// ReSharper disable once CheckNamespace
namespace Microsoft.Extensions.DependencyInjection;

public static class {ModuleName}ModuleRegistration
{
    public static string ActivityModuleName => {ModuleName}ActivitySource.Instance.Name;

    public static IServiceCollection Add{ModuleName}Module(this IServiceCollection services, IConfiguration configuration)
    {
        return services
            .Add{ModuleName}ModuleApi()
            .Add{ModuleName}Infrastructure(configuration);
    }

    private static IServiceCollection Add{ModuleName}ModuleApi(this IServiceCollection services)
    {
        services.RegisterApiEndpointsFromAssemblyContaining(typeof({ModuleName}ModuleRegistration));
        services.RegisterHandlersFromAssemblyContaining(typeof({ModuleName}ModuleRegistration));
        services.AddValidatorsFromAssembly(typeof({ModuleName}ModuleRegistration).Assembly);
        return services;
    }
}

public class {ModuleName}MiddlewareConfigurator : IModuleMiddlewareConfigurator
{
    public IApplicationBuilder Configure(IApplicationBuilder app)
    {
        return app.UseMiddleware<{ModuleName}TracingMiddleware>();
    }
}

// AssemblyReference.cs
using System.Reflection;
using System.Runtime.CompilerServices;

[assembly: InternalsVisibleTo("AssemblytoVisible")]

namespace Modules.{ModuleName}.Features;

public static class AssemblyReference
{
    public static readonly Assembly Assembly = typeof(AssemblyReference).Assembly;
}
```

### 5. Feature Vertical Slice (CREATE example)

Each use-case lives in its own folder: `Features/Create{Entity}/`. Contains Endpoint, Handler, and Validator. Repeat this pattern for GetAll, GetById, Update, Delete — adjusting HTTP method, route, and logic.

```csharp
// Features/Create{Entity}/Create{Entity}.Endpoint.cs
using FluentValidation;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Modules.{ModuleName}.Domain.Policies;
using Modules.{ModuleName}.Features.Features.Shared.Routes;
using Modules.Common.API.Abstractions;
using Modules.Common.API.Extensions;

namespace Modules.{ModuleName}.Features.Features.Create{Entity};

public sealed record Create{Entity}Request(string Name /* fields */);

public class Create{Entity}ApiEndpoint : IApiEndpoint
{
    public void MapEndpoint(WebApplication app)
    {
        app.MapPost(RouteConsts.Create, Handle)
            .RequireAuthorization({ModuleName}PolicyConsts.CreatePolicy);
    }

    private static async Task<IResult> Handle(
        [FromBody] Create{Entity}Request request,
        IValidator<Create{Entity}Request> validator,
        ICreate{Entity}Handler handler,
        CancellationToken cancellationToken)
    {
        var validationResult = await validator.ValidateAsync(request, cancellationToken);
        if (!validationResult.IsValid)
            return Results.ValidationProblem(validationResult.ToDictionary());

        var response = await handler.HandleAsync(request, cancellationToken);
        return response.IsError ? response.Errors.ToProblem() : Results.Ok(response.Value);
    }
}

// Features/Create{Entity}/Create{Entity}.Handler.cs
using Microsoft.Extensions.Logging;
using Modules.{ModuleName}.Domain.Entities;
using Modules.{ModuleName}.Features.Features.Shared.Responses;
using Modules.{ModuleName}.Infrastructure.Database;
using Modules.Common.Domain.Handlers;
using Modules.Common.Domain.Results;

namespace Modules.{ModuleName}.Features.Features.Create{Entity};

internal interface ICreate{Entity}Handler : IHandler
{
    Task<Result<{Entity}Response>> HandleAsync(Create{Entity}Request request, CancellationToken cancellationToken);
}

internal sealed class Create{Entity}Handler(
    {ModuleName}DbContext dbContext,
    ILogger<Create{Entity}Handler> logger)
    : ICreate{Entity}Handler
{
    public async Task<Result<{Entity}Response>> HandleAsync(
        Create{Entity}Request request, CancellationToken cancellationToken)
    {
        logger.LogInformation("Creating {Entity} with name {Name}", request.Name);

        var entity = new {Entity} { Name = request.Name /* map other fields */ };

        dbContext.{Entities}.Add(entity);
        await dbContext.SaveChangesAsync(cancellationToken);

        return new {Entity}Response(entity.Id, entity.Name /* other fields */);
    }
}

// Features/Create{Entity}/Create{Entity}.Validators.cs
using FluentValidation;

namespace Modules.{ModuleName}.Features.Features.Create{Entity};

public class Create{Entity}RequestValidator : AbstractValidator<Create{Entity}Request>
{
    public Create{Entity}RequestValidator()
    {
        RuleFor(x => x.Name)
            .NotEmpty().WithMessage("{Entity} name is required")
            .MaximumLength(200).WithMessage("{Entity} name must not exceed 200 characters");
        // ... add rules for other fields
    }
}
```

### 6. .csproj Files

**Domain.csproj** (references Common.Domain for IAuditableEntity, Result, etc.):
```xml
<Project Sdk="Microsoft.NET.Sdk">
    <PropertyGroup>
        <TargetFramework>net10.0</TargetFramework>
        <ImplicitUsings>enable</ImplicitUsings>
        <Nullable>enable</Nullable>
    </PropertyGroup>
    <ItemGroup>
        <ProjectReference Include="..\..\..\Common\Modules.Common.Domain\Modules.Common.Domain.csproj" />
    </ItemGroup>
</Project>
```

**Infrastructure.csproj**:
```xml
<Project Sdk="Microsoft.NET.Sdk">
    <PropertyGroup>
        <TargetFramework>net10.0</TargetFramework>
        <ImplicitUsings>enable</ImplicitUsings>
        <Nullable>enable</Nullable>
    </PropertyGroup>
    <ItemGroup>
        <PackageReference Include="EFCore.NamingConventions" />
        <PackageReference Include="Microsoft.EntityFrameworkCore" />
        <PackageReference Include="Npgsql.EntityFrameworkCore.PostgreSQL" />
    </ItemGroup>
    <ItemGroup>
        <ProjectReference Include="..\..\..\Common\Modules.Common.Infrastructure\Modules.Common.Infrastructure.csproj" />
        <ProjectReference Include="..\Modules.{ModuleName}.Domain\Modules.{ModuleName}.Domain.csproj" />
    </ItemGroup>
</Project>
```

**Features.csproj**:
```xml
<Project Sdk="Microsoft.NET.Sdk">
    <PropertyGroup>
        <TargetFramework>net10.0</TargetFramework>
        <ImplicitUsings>enable</ImplicitUsings>
        <Nullable>enable</Nullable>
    </PropertyGroup>
    <ItemGroup>
        <FrameworkReference Include="Microsoft.AspNetCore.App" />
    </ItemGroup>
    <ItemGroup>
        <ProjectReference Include="..\..\..\Common\Modules.Common.API\Modules.Common.API.csproj" />
        <ProjectReference Include="..\..\..\Common\Modules.Common.Application\Modules.Common.Application.csproj" />
        <ProjectReference Include="..\Modules.{ModuleName}.Domain\Modules.{ModuleName}.Domain.csproj" />
        <ProjectReference Include="..\Modules.{ModuleName}.Infrastructure\Modules.{ModuleName}.Infrastructure.csproj" />
    </ItemGroup>
    <ItemGroup>
        <PackageReference Include="FluentValidation.DependencyInjectionExtensions" />
    </ItemGroup>
</Project>
```

**PublicApi.csproj** (if needed):
```xml
<Project Sdk="Microsoft.NET.Sdk">
    <PropertyGroup>
        <TargetFramework>net10.0</TargetFramework>
        <ImplicitUsings>enable</ImplicitUsings>
        <Nullable>enable</Nullable>
    </PropertyGroup>
    <ItemGroup>
        <ProjectReference Include="..\..\..\Common\Modules.Common.Domain\Modules.Common.Domain.csproj" />
    </ItemGroup>
</Project>
```

## Post-Generation Integration Steps

After generating the module, integrate it into the host:

### 1. Add to Solution

```bash
dotnet sln add Modules/{ModuleName}/Modules.{ModuleName}.Domain/Modules.{ModuleName}.Domain.csproj
dotnet sln add Modules/{ModuleName}/Modules.{ModuleName}.Infrastructure/Modules.{ModuleName}.Infrastructure.csproj
dotnet sln add Modules/{ModuleName}/Modules.{ModuleName}.Features/Modules.{ModuleName}.Features.csproj
# If PublicApi exists:
dotnet sln add Modules/{ModuleName}/Modules.{ModuleName}.PublicApi/Modules.{ModuleName}.PublicApi.csproj
```

### 2. Reference from Host

Add to `ModularMonolith.Host.csproj`:
```xml
<ProjectReference Include="..\Modules\{ModuleName}\Modules.{ModuleName}.Features\Modules.{ModuleName}.Features.csproj" />
```

### 3. Register in Program.cs

```csharp
// Add to module registrations
builder.Services.Add{ModuleName}Module(builder.Configuration);

// Add to activity sources in AddCoreInfrastructure
builder.Services.AddCoreInfrastructure(builder.Configuration,
[
    // ... existing sources,
    {ModuleName}ModuleRegistration.ActivityModuleName
]);
```

### 4. Add EF Migration

```bash
dotnet ef migrations add Initial{ModuleName} \
  --project Modules/{ModuleName}/Modules.{ModuleName}.Infrastructure \
  --startup-project ModularMonolith.Host
```

### 5. Update Architecture Tests

Add isolation test in `Common/Modules.Common.Tests.Architecture/ModuleTests.cs`:

```csharp
private const string {ModuleName}Namespace = "Modules.{ModuleName}";

[Fact]
public void {ModuleName}Module_ShouldNotHaveDependencyOn_AnyOtherModule()
{
    var result = Types.InAssemblies(Get{ModuleName}ModuleAssemblies())
        .Should()
        .NotHaveDependencyOnAny(
            UsersNamespace,
            // ... other module namespaces
        )
        .GetResult();

    Assert.True(result.IsSuccessful, string.Join(", ", result.FailingTypeNames ?? []));
}
```

### 6. Seed User Permissions

Update `UserSeedService.cs` to grant permissions for the new module to admin/user roles.

### 7. Build & Verify

```bash
dotnet build ModularMonolithTemplate.sln
dotnet test Common/Modules.Common.Tests.Architecture
```
```

---

## Example Usage

The template uses two example modules — **Projects** (exposes PublicApi) and **Todos** (depends on Projects) — to demonstrate all module concepts including cross-module communication.

### Example 1: Projects Module (exposes PublicApi)

```
Create a new module called "Projects" for my Modular Monolith application.

## Module Specification

- **Module Name**: Projects
- **Schema Name**: projects
- **Description**: Manages projects that group todo items

### Entities

- **Project**
  - Id: Guid (PK)
  - Name: string (required, max 200)
  - Description: string (optional, max 2000)
  - IsActive: bool (default true)
  - CreatedAtUtc: DateTime (auditable)
  - UpdatedAtUtc: DateTime? (auditable)

### Features

- CreateProject (POST /api/projects) — requires projects:create
- GetAllProjects (GET /api/projects) — requires projects:read
- GetProjectById (GET /api/projects/{id}) — requires projects:read
- DeleteProject (DELETE /api/projects/{id}) — requires projects:delete

### Cross-Module Dependencies

- **Exposes PublicApi**: yes (Todos module will call ValidateProjectExists)
- **Depends On**: none

[... then paste all architecture rules from above ...]
```

### Example 2: Todos Module (depends on Projects)

```
Create a new module called "Todos" for my Modular Monolith application.

## Module Specification

- **Module Name**: Todos
- **Schema Name**: todos
- **Description**: Manages todo items within projects

### Entities

- **TodoItem**
  - Id: Guid (PK)
  - Title: string (required, max 200)
  - Description: string (optional, max 2000)
  - ProjectId: Guid (required, FK to Projects module)
  - IsCompleted: bool (default false)
  - DueDate: DateTime? (optional)
  - CreatedAtUtc: DateTime (auditable)
  - UpdatedAtUtc: DateTime? (auditable)

### Features

- CreateTodoItem (POST /api/todos) — requires todos:create, validates project exists via IProjectsModuleApi
- GetAllTodoItems (GET /api/todos) — requires todos:read
- GetTodoItemById (GET /api/todos/{id}) — requires todos:read
- CompleteTodoItem (PATCH /api/todos/{id}/complete) — requires todos:update
- DeleteTodoItem (DELETE /api/todos/{id}) — requires todos:delete

### Cross-Module Dependencies

- **Exposes PublicApi**: no
- **Depends On**: Projects via IProjectsModuleApi (ValidateProjectExists)

[... then paste all architecture rules from above ...]
```

### What These Two Examples Demonstrate

| Concept | Where it's shown |
|---------|-----------------|
| Vertical slices (Endpoint + Handler + Validator) | Both modules |
| Result pattern (Result<T>, Error types) | Both modules |
| Authorization policies (IPolicyFactory) | Both modules |
| Tracing (ActivitySource + middleware) | Both modules |
| PublicApi interface | Projects exposes `IProjectsModuleApi` |
| Cross-module sync call | Todos calls `IProjectsModuleApi.ValidateProjectExists()` |
| Domain events | Projects publishes `ProjectDeletedEvent` |
| Cross-module event handling | Todos handles `ProjectDeletedEvent` (unassigns todos) |
| Architecture test isolation | Todos references only `Projects.PublicApi`, not internals |
