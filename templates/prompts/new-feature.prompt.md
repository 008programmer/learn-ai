# Prompt: Add a New Feature (Vertical Slice) to an Existing Module

Use this prompt to add a new feature endpoint + handler + validator to an existing module.

---

## Prompt Template

```
Add a new feature "{FeatureName}" to the "{ModuleName}" module in my Modular Monolith application.

## Feature Specification

- **Module Name**: {ModuleName} (existing module)
- **Feature Name**: {FeatureName} (e.g., "CompleteTodoItem", "GetAllTodos", "DeleteTodoItem")
- **HTTP Method**: {GET|POST|PUT|PATCH|DELETE}
- **Route**: {e.g., "/api/todos/{id}/complete"}
- **Authorization Policy**: {e.g., "todos:update"} or "none" for public endpoints
- **Description**: {What this feature does}

### Request

{List of request fields with types}

Example:
- Title: string (required, max 200)
- Description: string (optional, max 2000)

Or for GET/action endpoints:
- id: Guid (from route)

### Response

{List of response fields with types, or use existing shared response}

Example:
- Use existing {Entity}Response
  OR
- Id: Guid
- Name: string
- Status: string

### Business Logic

{Describe the handler logic step by step}

Example:
1. Find todo item by ID — return NotFound if missing
2. Mark as completed (set IsCompleted = true, UpdatedAtUtc = now)
3. Save changes
4. Return updated todo response

### Events (Optional)

- **Publishes**: {EventName} (e.g., "TodoItemCompletedEvent") — or "none"
- **Event Fields**: {e.g., TodoItemId (Guid), CompletedAtUtc (DateTime)}

## Architecture Rules — Follow Exactly

### File Structure

Create these files in `Modules/{ModuleName}/Modules.{ModuleName}.Features/Features/{FeatureName}/`:

```
{FeatureName}/
  {FeatureName}.Endpoint.cs
  {FeatureName}.Handler.cs
  {FeatureName}.Validators.cs     (skip for GET-by-id with no query params)
  Events/                          (only if publishes events)
    {EventName}.cs
    {EventName}Handler.cs
```

### Endpoint Pattern

```csharp
using FluentValidation;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Modules.{ModuleName}.Domain.Policies;
using Modules.{ModuleName}.Features.Features.Shared.Routes;
using Modules.Common.API.Abstractions;
using Modules.Common.API.Extensions;

namespace Modules.{ModuleName}.Features.Features.{FeatureName};

public sealed record {FeatureName}Request(/* fields */);

public class {FeatureName}ApiEndpoint : IApiEndpoint
{
    public void MapEndpoint(WebApplication app)
    {
        // Use Map{HttpMethod}: MapGet, MapPost, MapPut, MapDelete
        // For GET by ID: use [FromRoute] Guid id instead of [FromBody]
        // For DELETE: return Results.NoContent() instead of Results.Ok()
        app.Map{HttpMethod}(RouteConsts.{RouteName}, Handle)
            .RequireAuthorization({ModuleName}PolicyConsts.{PolicyName});
    }

    private static async Task<IResult> Handle(
        [FromBody] {FeatureName}Request request,
        IValidator<{FeatureName}Request> validator,
        I{FeatureName}Handler handler,
        CancellationToken cancellationToken)
    {
        var validationResult = await validator.ValidateAsync(request, cancellationToken);
        if (!validationResult.IsValid)
            return Results.ValidationProblem(validationResult.ToDictionary());

        var response = await handler.HandleAsync(request, cancellationToken);
        return response.IsError ? response.Errors.ToProblem() : Results.Ok(response.Value);
    }
}
```

### Handler Pattern

```csharp
using Microsoft.Extensions.Logging;
using Modules.{ModuleName}.Domain.Entities;
using Modules.{ModuleName}.Features.Features.Shared.Responses;
using Modules.{ModuleName}.Infrastructure.Database;
using Modules.Common.Domain.Handlers;
using Modules.Common.Domain.Results;

namespace Modules.{ModuleName}.Features.Features.{FeatureName};

internal interface I{FeatureName}Handler : IHandler
{
    Task<Result<{ResponseType}>> HandleAsync({RequestType} request, CancellationToken cancellationToken);
}

internal sealed class {FeatureName}Handler(
    {ModuleName}DbContext dbContext,
    ILogger<{FeatureName}Handler> logger
    /* inject IEventPublisher if publishing events */)
    : I{FeatureName}Handler
{
    public async Task<Result<{ResponseType}>> HandleAsync(
        {RequestType} request,
        CancellationToken cancellationToken)
    {
        // Business logic here
        // Use Result pattern for errors:
        //   return Error.NotFound("Entity.NotFound", "Entity not found");
        //   return Error.Conflict("Entity.Duplicate", "Already exists");
        //   return Error.Validation("Field.Invalid", "Invalid value");

        // For event publishing:
        // await eventPublisher.PublishAsync(new MyEvent(...), cancellationToken);

        return new {ResponseType}(/* fields */);
    }
}
```

### Validator Pattern

```csharp
using FluentValidation;

namespace Modules.{ModuleName}.Features.Features.{FeatureName};

public class {FeatureName}RequestValidator : AbstractValidator<{FeatureName}Request>
{
    public {FeatureName}RequestValidator()
    {
        RuleFor(x => x.Title)
            .NotEmpty().WithMessage("Title is required")
            .MaximumLength(200).WithMessage("Title must not exceed 200 characters");

        // Add rules for all request fields
    }
}
```

### Event Pattern (if publishing)

```csharp
// Events/{EventName}.cs
using Modules.Common.Domain.Events;

namespace Modules.{ModuleName}.Features.Features.{FeatureName}.Events;

public record {EventName}(/* event fields */) : IEvent;

// Events/{EventName}Handler.cs (in the same or another module)
using Modules.Common.Domain.Events;

namespace Modules.{ModuleName}.Features.Features.{FeatureName}.Events;

public class {EventName}Handler(/* dependencies */) : IEventHandler<{EventName}>
{
    public async Task HandleAsync({EventName} @event, CancellationToken cancellationToken)
    {
        // Handle the event
    }
}
```

### Route Constants

If adding a new route, update `Features/Shared/Routes/RouteConsts.cs`:

```csharp
internal const string {RouteName} = BaseRoute + "/{id}/action-name";
```

## Post-Generation Steps

1. Add new route to `RouteConsts.cs` if it doesn't exist
2. Build: `dotnet build ModularMonolithTemplate.sln`
3. If adding a new shared response type, add it to `Features/Shared/Responses/`
4. Run tests: `dotnet test`
```

