# Prompt: Set Up Cross-Module Communication

Use this prompt when a module needs to call another module's functionality. Cross-module communication uses the PublicApi pattern — the only allowed seam between modules. This is enforced by architecture tests.

---

## Prompt Template

```
Set up cross-module communication between "{CallerModule}" and "{TargetModule}" in my Modular Monolith application.

## Communication Specification

- **Caller Module**: {CallerModule} (the module that needs to call)
- **Target Module**: {TargetModule} (the module being called)
- **Communication Type**: {sync (direct API call) | event-based | both}
- **Description**: {Why the caller needs to talk to the target}

### Operations (Synchronous — via PublicApi interface)

{List operations the caller needs from the target}

Example:
- ValidateProjectExists(projectId: Guid) → Result<Success>
- GetProjectName(projectId: Guid) → Result<string>

### Events (Asynchronous — via IEventPublisher)

{List events published by the caller that the target should react to}

Example:
- ProjectDeletedEvent(ProjectId: Guid)
  → Todos module should unassign all todo items from the deleted project

## Architecture Rules — Follow Exactly

### CRITICAL: Module Isolation

Modules are **strictly isolated**. The architecture tests in `ModuleTests.cs` enforce:

- Module A can ONLY reference Module B's `PublicApi` project
- Module A CANNOT reference Module B's Domain, Infrastructure, or Features projects
- This is validated at build time by NetArchTest.Rules

### Communication Patterns

```
Pattern 1: Synchronous (Caller → Target via PublicApi)
───────────────────────────────────────────────────────
Caller.Features ──references──► Target.PublicApi (interface only)
Target.Features ──implements──► Target.PublicApi.I{Target}ModuleApi

Pattern 2: Event-Based (Caller publishes → Target handles)
───────────────────────────────────────────────────────
Caller.Features ── publishes ──► IEvent (defined in Caller)
Target.Features ── handles  ──► IEventHandler<CallerEvent>
(Target references Caller.PublicApi which contains the event contract)
```

---

## Step 1: Create the PublicApi Project (if it doesn't exist for target module)

### `Modules/{TargetModule}/Modules.{TargetModule}.PublicApi/I{TargetModule}ModuleApi.cs`

```csharp
using Modules.Common.Domain.Results;
using Modules.{TargetModule}.PublicApi.Contracts;

namespace Modules.{TargetModule}.PublicApi;

public interface I{TargetModule}ModuleApi
{
    Task<Result<Success>> {OperationName}Async(
        {OperationRequest} request,
        CancellationToken cancellationToken);

    // Add more operations as needed
}
```

### `Modules/{TargetModule}/Modules.{TargetModule}.PublicApi/Contracts/{OperationRequest}.cs`

```csharp
namespace Modules.{TargetModule}.PublicApi.Contracts;

public record {OperationRequest}(
    Guid Id,
    // ... fields the caller provides
    string Name
);
```

### `Modules.{TargetModule}.PublicApi.csproj`

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

---

## Step 2: Implement the PublicApi Internally (in target module)

### `Modules/{TargetModule}/Modules.{TargetModule}.Features/InternalApi/{TargetModule}ModuleApi.cs`

```csharp
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Modules.{TargetModule}.Infrastructure.Database;
using Modules.{TargetModule}.PublicApi;
using Modules.{TargetModule}.PublicApi.Contracts;
using Modules.Common.Domain.Results;

namespace Modules.{TargetModule}.Features.InternalApi;

internal sealed class {TargetModule}ModuleApi(
    {TargetModule}DbContext dbContext,
    ILogger<{TargetModule}ModuleApi> logger)
    : I{TargetModule}ModuleApi
{
    public async Task<Result<Success>> {OperationName}Async(
        {OperationRequest} request,
        CancellationToken cancellationToken)
    {
        logger.LogInformation("Processing {Operation} for {Id}",
            nameof({OperationName}Async), request.Id);

        // Business logic here — query DbContext, validate, etc.
        var entity = await dbContext.{Entities}
            .FirstOrDefaultAsync(x => x.Id == request.Id, cancellationToken);

        if (entity is null)
        {
            return Error.NotFound("{Entity}.NotFound", "{Entity} not found");
        }

        // Perform the operation
        // ...

        await dbContext.SaveChangesAsync(cancellationToken);

        return new Success();
    }
}
```

### `Modules/{TargetModule}/Modules.{TargetModule}.Features/InternalApi/Decorators/Traced{TargetModule}ModuleApi.cs`

Wrap the internal API with OpenTelemetry tracing:

```csharp
using Modules.{TargetModule}.Features.Tracing;
using Modules.{TargetModule}.PublicApi;
using Modules.{TargetModule}.PublicApi.Contracts;
using Modules.Common.Domain.Results;

namespace Modules.{TargetModule}.Features.InternalApi.Decorators;

internal sealed class Traced{TargetModule}ModuleApi(
    I{TargetModule}ModuleApi inner)
    : I{TargetModule}ModuleApi
{
    public async Task<Result<Success>> {OperationName}Async(
        {OperationRequest} request,
        CancellationToken cancellationToken)
    {
        using var activity = {TargetModule}ActivitySource.Instance.StartActivity(
            $"{{{TargetModule}ActivitySource.Instance.Name}}.{OperationName}");

        activity?.SetTag("module", {TargetModule}ActivitySource.Instance.Name);
        activity?.SetTag("operation", "{OperationName}");
        activity?.SetTag("{entity}.id", request.Id.ToString());

        var result = await inner.{OperationName}Async(request, cancellationToken);

        activity?.SetTag("result.success", result.IsSuccess.ToString());

        return result;
    }
}
```

---

## Step 3: Register the PublicApi in Target Module DI

Update `Modules/{TargetModule}/Modules.{TargetModule}.Features/DependencyInjection.cs`:

```csharp
public static class {TargetModule}ModuleRegistration
{
    public static IServiceCollection Add{TargetModule}Module(
        this IServiceCollection services, IConfiguration configuration)
    {
        return services
            .Add{TargetModule}ModuleApi()
            .Add{TargetModule}Infrastructure(configuration);
    }

    private static IServiceCollection Add{TargetModule}ModuleApi(
        this IServiceCollection services)
    {
        // Register the internal implementation
        services.AddScoped<{TargetModule}ModuleApi>();

        // Register the interface with tracing decorator
        services.AddScoped<I{TargetModule}ModuleApi>(provider =>
        {
            var actual = provider.GetRequiredService<{TargetModule}ModuleApi>();
            return new Traced{TargetModule}ModuleApi(actual);
        });

        services.RegisterApiEndpointsFromAssemblyContaining(
            typeof({TargetModule}ModuleRegistration));
        services.RegisterHandlersFromAssemblyContaining(
            typeof({TargetModule}ModuleRegistration));
        services.AddValidatorsFromAssembly(
            typeof({TargetModule}ModuleRegistration).Assembly);

        return services;
    }
}
```

---

## Step 4: Reference PublicApi from Caller Module

### Update `Modules/{CallerModule}/Modules.{CallerModule}.Features/Modules.{CallerModule}.Features.csproj`

Add a project reference to the target's PublicApi ONLY:

```xml
<ItemGroup>
    <!-- Existing references -->
    <ProjectReference Include="..\..\{TargetModule}\Modules.{TargetModule}.PublicApi\Modules.{TargetModule}.PublicApi.csproj" />
</ItemGroup>
```

**NEVER reference Domain, Infrastructure, or Features projects of another module.**

### Use in Caller Handler

```csharp
using Modules.{TargetModule}.PublicApi;
using Modules.{TargetModule}.PublicApi.Contracts;

internal sealed class Create{CallerEntity}Handler(
    {CallerModule}DbContext dbContext,
    I{TargetModule}ModuleApi {targetModule}Api,
    ILogger<Create{CallerEntity}Handler> logger)
    : ICreate{CallerEntity}Handler
{
    public async Task<Result<{Response}>> HandleAsync(
        Create{CallerEntity}Request request,
        CancellationToken cancellationToken)
    {
        // Call the target module via PublicApi
        var checkResult = await {targetModule}Api.{OperationName}Async(
            new {OperationRequest}(request.Id),
            cancellationToken);

        if (checkResult.IsError)
        {
            return checkResult.Errors;
        }

        // Continue with business logic...
    }
}
```

---

## Step 5: Event-Based Communication (Optional)

### Define Event Contract (in Caller's PublicApi)

If the target needs to react to events from the caller, put the event in the caller's PublicApi so the target can reference it:

```csharp
// Modules/{CallerModule}/Modules.{CallerModule}.PublicApi/Events/{EventName}.cs
using Modules.Common.Domain.Events;

namespace Modules.{CallerModule}.PublicApi.Events;

public record {EventName}(
    Guid {CallerEntity}Id,
    // ... relevant fields
) : IEvent;
```

### Publish Event (in Caller Handler)

```csharp
using Modules.Common.Domain.Events;
using Modules.{CallerModule}.PublicApi.Events;

internal sealed class Create{CallerEntity}Handler(
    {CallerModule}DbContext dbContext,
    IEventPublisher eventPublisher,
    ILogger<Create{CallerEntity}Handler> logger)
    : ICreate{CallerEntity}Handler
{
    public async Task<Result<{Response}>> HandleAsync(
        Create{CallerEntity}Request request,
        CancellationToken cancellationToken)
    {
        // ... create entity and save ...

        // Publish event for other modules to react
        await eventPublisher.PublishAsync(
            new {EventName}(entity.Id, /* fields */),
            cancellationToken);

        return new {Response}(/* fields */);
    }
}
```

### Handle Event (in Target Module)

The target module references the caller's PublicApi to get the event type:

```csharp
// Modules/{TargetModule}/Modules.{TargetModule}.Features/Features/{FeatureName}/Events/{EventName}Handler.cs
using Modules.Common.Domain.Events;
using Modules.{CallerModule}.PublicApi.Events;
using Modules.{TargetModule}.Infrastructure.Database;

namespace Modules.{TargetModule}.Features.Features.{FeatureName}.Events;

public class {EventName}Handler(
    {TargetModule}DbContext dbContext,
    ILogger<{EventName}Handler> logger)
    : IEventHandler<{EventName}>
{
    public async Task HandleAsync({EventName} @event, CancellationToken cancellationToken)
    {
        logger.LogInformation("Handling {Event} for {EntityId}",
            nameof({EventName}), @event.{CallerEntity}Id);

        // React to the event — update target module's data
        // ...

        await dbContext.SaveChangesAsync(cancellationToken);
    }
}
```

**Important:** Add a project reference from Target's Features.csproj to Caller's PublicApi.csproj.

---

## Step 6: Update Architecture Tests

Update `Common/Modules.Common.Tests.Architecture/ModuleTests.cs`:

```csharp
// If {CallerModule} now depends on {TargetModule}:
[Fact]
public void {CallerModule}Module_ShouldOnlyReference_PublicApiProjects()
{
    var callerAssemblies = Get{CallerModule}ModuleAssemblies();

    // Verify it does NOT reference internal projects
    var internalResult = Types.InAssemblies(callerAssemblies)
        .Should()
        .NotHaveDependencyOnAny(
            "{TargetModule}Namespace" + ".Domain",
            "{TargetModule}Namespace" + ".Infrastructure",
            "{TargetModule}Namespace" + ".Features")
        .GetResult();

    Assert.True(internalResult.IsSuccessful,
        $"{CallerModule} should not reference internal {TargetModule} projects");

    // Optionally verify it DOES reference PublicApi
    var hasPublicApiDep = Types.InAssemblies(callerAssemblies)
        .That()
        .HaveDependencyOn("{TargetModule}Namespace" + ".PublicApi")
        .GetTypes()
        .Any();

    Assert.True(hasPublicApiDep,
        "{CallerModule} should reference {TargetModule}.PublicApi");
}
```

Also update existing tests to verify that {TargetModule} remains isolated from {CallerModule}'s internals.

---

## Step 7: Update ModuleAssemblies

Update `Common/Modules.Common.Tests.Architecture/ModuleAssemblies.cs` with assembly references for any new PublicApi projects.

---

## Post-Generation Checklist

- [ ] PublicApi project created with interface + contracts
- [ ] Internal implementation created in target module
- [ ] Tracing decorator wrapping internal implementation
- [ ] DI registration updated in target module
- [ ] Caller's .csproj references target's PublicApi only
- [ ] Caller handler injects and uses `I{TargetModule}ModuleApi`
- [ ] Events defined in PublicApi (if event-based)
- [ ] Event handlers created in target module (if event-based)
- [ ] Architecture tests updated for new dependency
- [ ] Build passes: `dotnet build ModularMonolithTemplate.sln`
- [ ] Architecture tests pass: `dotnet test Common/Modules.Common.Tests.Architecture`
```
