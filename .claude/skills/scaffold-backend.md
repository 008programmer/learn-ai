# Skill: scaffold-backend
## Backend Specialist — Vertical Slice Feature Scaffold with MCP Safety Checks

**Invoked by:** scaffold-feature orchestrator (as a subagent)  
**Inputs:** ModuleName, FeatureName, SchemaName

---

## Instructions

You are the backend specialist subagent. Follow these steps exactly.

---

### Step 1 — MCP Pre-flight Check (REQUIRED before generating any code)

Use the MCP postgres tool to run these two queries against the live Aspire database.

**Check 1 — Does the table already exist?**
```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = '{SchemaName}' 
AND table_name = '{feature_name_snake_case}';
```
- If a row is returned → STOP. Tell the orchestrator: "Table {SchemaName}.{feature_name_snake_case} already exists. Aborting to avoid migration conflict."
- If no rows → continue.

**Check 2 — Are there naming conflicts with existing sequences or indexes?**
```sql
SELECT schemaname, tablename, indexname 
FROM pg_indexes 
WHERE schemaname = '{SchemaName}'
AND indexname LIKE '%{feature_name_snake_case}%';
```
- If any rows returned → warn the orchestrator but continue. Include the conflicts in your final report.
- If no rows → continue.

Report pre-check result to orchestrator before proceeding.

---

### Step 2 — Generate Backend Files

Generate these four files following the exact patterns of this codebase:

#### File 1: `Modules/{ModuleName}/Modules.{ModuleName}.Features/Features/{FeatureName}/{FeatureName}.Handler.cs`

Pattern rules:
- Namespace: `Modules.{ModuleName}.Features.Features.{FeatureName}`
- Internal interface `I{FeatureName}Handler : IHandler`
- `internal sealed class {FeatureName}Handler` using primary constructor
- Inject `{ModuleName}DbContext context` and `ILogger<{FeatureName}Handler> logger`
- Return type: `Task<Result<Success>>` for commands, `Task<Result<{FeatureName}Response>>` for queries
- Never throw exceptions — return `Error.NotFound(...)`, `Error.Conflict(...)` etc.
- Log with structured logging: `logger.LogDebug(...)` for not-found, `logger.LogInformation(...)` for success
- Call `context.SaveChangesAsync(cancellationToken)` before returning success

```csharp
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Modules.Common.Domain.Handlers;
using Modules.Common.Domain.Results;
using Modules.{ModuleName}.Infrastructure.Database;

namespace Modules.{ModuleName}.Features.Features.{FeatureName};

internal interface I{FeatureName}Handler : IHandler
{
    Task<Result<Success>> HandleAsync({FeatureName}Request request, CancellationToken cancellationToken);
}

internal sealed class {FeatureName}Handler(
    {ModuleName}DbContext context,
    ILogger<{FeatureName}Handler> logger)
    : I{FeatureName}Handler
{
    public async Task<Result<Success>> HandleAsync({FeatureName}Request request, CancellationToken cancellationToken)
    {
        // TODO: implement business logic
        // Follow the Result pattern — never throw, always return Result<T>

        await context.SaveChangesAsync(cancellationToken);

        logger.LogInformation("{FeatureName} completed successfully");
        return Result.Success;
    }
}
```

#### File 2: `Modules/{ModuleName}/Modules.{ModuleName}.Features/Features/{FeatureName}/{FeatureName}.Endpoint.cs`

Pattern rules:
- Namespace: `Modules.{ModuleName}.Features.Features.{FeatureName}`
- `public sealed record {FeatureName}Request(...)` — define request properties
- `public class {FeatureName}Endpoint : IApiEndpoint`
- `public void MapEndpoint(WebApplication app)` — register route
- Private static `Handle` method — inject validator, handler, cancellation token
- Validate first with FluentValidation, then call handler
- Map `Result` to `IResult` using `.ToProblem()` for errors, `Results.Ok()` or `Results.NoContent()` for success

```csharp
using FluentValidation;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Modules.Common.API.Abstractions;
using Modules.Common.API.Extensions;

namespace Modules.{ModuleName}.Features.Features.{FeatureName};

public sealed record {FeatureName}Request(/* add properties */);

public class {FeatureName}Endpoint : IApiEndpoint
{
    public void MapEndpoint(WebApplication app)
    {
        app.MapPost("/api/{moduleName}/{featureName}", Handle)
           .RequireAuthorization();
    }

    private static async Task<IResult> Handle(
        [FromBody] {FeatureName}Request request,
        IValidator<{FeatureName}Request> validator,
        I{FeatureName}Handler handler,
        CancellationToken cancellationToken)
    {
        var validationResult = await validator.ValidateAsync(request, cancellationToken);
        if (!validationResult.IsValid)
        {
            return Results.ValidationProblem(validationResult.ToDictionary());
        }

        var response = await handler.HandleAsync(request, cancellationToken);
        if (response.IsError)
        {
            return response.Errors.ToProblem();
        }

        return Results.NoContent();
    }
}
```

#### File 3: `Modules/{ModuleName}/Modules.{ModuleName}.Features/Features/{FeatureName}/{FeatureName}.Validators.cs`

```csharp
using FluentValidation;

namespace Modules.{ModuleName}.Features.Features.{FeatureName};

public class {FeatureName}RequestValidator : AbstractValidator<{FeatureName}Request>
{
    public {FeatureName}RequestValidator()
    {
        // TODO: add validation rules
        // RuleFor(x => x.PropertyName).NotEmpty();
    }
}
```

#### File 4: `Modules/{ModuleName}/Modules.{ModuleName}.Tests.Unit/Features/{FeatureName}/{FeatureName}HandlerTests.cs`

```csharp
using NSubstitute;
using Modules.Common.Domain.Results;
using Modules.{ModuleName}.Features.Features.{FeatureName};

namespace Modules.{ModuleName}.Tests.Unit.Features.{FeatureName};

public class {FeatureName}HandlerTests
{
    [Fact]
    public async Task HandleAsync_WhenValid_ReturnsSuccess()
    {
        // Arrange

        // Act

        // Assert
    }

    [Fact]
    public async Task HandleAsync_WhenNotFound_ReturnsNotFoundError()
    {
        // Arrange

        // Act

        // Assert
    }
}
```

---

### Step 3 — MCP Post-flight Migration Check (REQUIRED after generating code)

```sql
SELECT migration_id 
FROM "__EFMigrationsHistory" 
WHERE migration_id LIKE '%{ModuleName}%'
ORDER BY migration_id DESC
LIMIT 5;
```

Report the last applied migration name so the developer knows what migration name to use next.

---

### Step 4 — Report to orchestrator

Return:
- Pre-check result (passed / blocked / warnings)
- List of files created with full paths
- Post-check result — last applied migration name
- Any TODOs the developer needs to complete manually
