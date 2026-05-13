# Advanced Patterns Reference

This file contains code examples for advanced patterns used in the codebase. Each pattern has exactly **one** self-contained example.

---

## 1. Rich Domain Entity (State Machine)

Entities with private constructors, factory methods, encapsulated collections, and state transitions returning `Result<Success>`:

```csharp
using Modules.Common.Domain.Results;

namespace Modules.{ModuleName}.Domain.Entities;

public sealed class {Entity}
{
    private const string ErrorCode = "{ModuleName}.Validation";

    private readonly List<{ChildEntity}> _items = [];

    public Guid Id { get; private init; }
    public string Name { get; private set; } = null!;
    public {Status}Status Status { get; private set; }
    public IReadOnlyList<{ChildEntity}> Items => _items.AsReadOnly();
    public DateTime CreatedAt { get; private set; }
    public DateTime? UpdatedAt { get; private set; }

    private {Entity}() { }  // Private constructor for EF Core

    public static {Entity} Create(string name, List<{ChildEntity}> items)
    {
        var entity = new {Entity}
        {
            Id = Guid.NewGuid(),
            Name = name,
            Status = {Status}Status.Draft,
            CreatedAt = DateTime.UtcNow
        };
        entity._items.AddRange(items);
        return entity;
    }

    public Result<Success> Activate()
    {
        if (Status is not {Status}Status.Draft)
        {
            return Error.Validation(ErrorCode, $"Can only activate from Draft status");
        }

        Status = {Status}Status.Active;
        UpdatedAt = DateTime.UtcNow;
        return Result.Success;
    }

    public Result<Success> Archive()
    {
        if (Status is {Status}Status.Archived)
        {
            return Error.Validation(ErrorCode, $"Already archived");
        }

        Status = {Status}Status.Archived;
        UpdatedAt = DateTime.UtcNow;
        return Result.Success;
    }
}
```

**When to use**: Entities with lifecycle states, business rules for transitions, or encapsulated child collections.

---

## 2. Value Objects

Simple objects defined by their properties, not by identity:

```csharp
namespace Modules.{ModuleName}.Domain.ValueObjects;

public class Address
{
    public required string Street { get; set; }
    public required string City { get; set; }
    public required string Zip { get; set; }
}
```

**When to use**: Addresses, money, date ranges, coordinates — anything without its own identity.

---

## 3. Domain Enums

```csharp
namespace Modules.{ModuleName}.Domain.Enums;

public enum {Entity}Status
{
    Draft,
    Active,
    Completed,
    Archived,
    Cancelled
}
```

Used in entities for state tracking and in API responses for status display.

---

## 4. Module-Specific Error Helper Classes

Reusable error factory methods per module instead of inline error creation:

```csharp
using Modules.Common.Domain.Results;

namespace Modules.{ModuleName}.Domain.Errors;

internal static class {ModuleName}Errors
{
    private const string ErrorPrefix = "{ModuleName}";

    internal static Error AlreadyExists(string name) =>
        Error.Conflict($"{ErrorPrefix}.AlreadyExists", $"{name} already exists");

    internal static Error NotFound(Guid id) =>
        Error.NotFound($"{ErrorPrefix}.NotFound", $"Entity with ID '{id}' not found");

    internal static Error InsufficientPermission() =>
        Error.Forbidden($"{ErrorPrefix}.Forbidden", "Insufficient permission for this operation");
}
```

Usage in handler: `return {ModuleName}Errors.NotFound(id);`

---

## 5. EF Core Entity Configuration

```csharp
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Modules.{ModuleName}.Domain.Entities;

namespace Modules.{ModuleName}.Infrastructure.Database.Configuration;

public class {Entity}Configuration : IEntityTypeConfiguration<{Entity}>
{
    public void Configure(EntityTypeBuilder<{Entity}> builder)
    {
        builder.HasKey(x => x.Id);

        builder.Property(x => x.Name)
            .IsRequired()
            .HasMaxLength(200);

        builder.Property(x => x.Status)
            .HasConversion<string>();  // Store enum as string

        // Value object as owned entity
        builder.OwnsOne(x => x.Address, address =>
        {
            address.Property(a => a.Street).IsRequired().HasMaxLength(500);
            address.Property(a => a.City).IsRequired().HasMaxLength(100);
            address.Property(a => a.Zip).IsRequired().HasMaxLength(20);
        });

        // One-to-many relationship with encapsulated collection
        builder.HasMany(x => x.Items)
            .WithOne(x => x.Parent)
            .HasForeignKey(x => x.ParentId);

        // Unique index
        builder.HasIndex(x => x.Name).IsUnique();
    }
}
```

---

## 6. GET Endpoint Without Request Body

For list/query endpoints with `[FromServices]` injection (no `[FromBody]`):

```csharp
public class GetAll{Entities}ApiEndpoint : IApiEndpoint
{
    public void MapEndpoint(WebApplication app)
    {
        app.MapGet(RouteConsts.GetAll, Handle)
            .RequireAuthorization({ModuleName}PolicyConsts.ReadPolicy);
    }

    private static async Task<IResult> Handle(
        [FromServices] IGetAll{Entities}Handler handler,
        CancellationToken cancellationToken)
    {
        var response = await handler.HandleAsync(cancellationToken);
        if (response.IsError)
        {
            return response.Errors.ToProblem();
        }

        return Results.Ok(response.Value);
    }
}
```

---

## 7. Handler Returning `Result<List<T>>`

```csharp
internal interface IGetAll{Entities}Handler : IHandler
{
    Task<Result<List<{Entity}ListItem>>> HandleAsync(CancellationToken cancellationToken);
}

internal sealed class GetAll{Entities}Handler(
    {ModuleName}DbContext dbContext,
    ILogger<GetAll{Entities}Handler> logger)
    : IGetAll{Entities}Handler
{
    public async Task<Result<List<{Entity}ListItem>>> HandleAsync(CancellationToken cancellationToken)
    {
        var items = await dbContext.{Entities}
            .AsNoTracking()
            .Where(x => x.IsActive)
            .Select(x => new {Entity}ListItem(x.Id, x.Name))
            .ToListAsync(cancellationToken);

        return items;
    }
}

public record {Entity}ListItem(Guid Id, string Name);
```

**Key patterns**: `AsNoTracking()` for read-only queries, `Select` projection to DTO (avoids loading full entity).

---

## 8. State Transition Endpoint + Handler

For action endpoints that change entity state (PATCH):

```csharp
// Endpoint
public class Activate{Entity}ApiEndpoint : IApiEndpoint
{
    public void MapEndpoint(WebApplication app)
    {
        app.MapPatch(RouteConsts.Activate, Handle)
            .RequireAuthorization({ModuleName}PolicyConsts.UpdatePolicy);
    }

    private static async Task<IResult> Handle(
        [FromRoute] Guid id,
        [FromServices] IActivate{Entity}Handler handler,
        CancellationToken cancellationToken)
    {
        var response = await handler.HandleAsync(id, cancellationToken);
        return response.IsError ? response.Errors.ToProblem() : Results.Ok(response.Value);
    }
}

// Handler — delegates transition to domain entity
internal sealed class Activate{Entity}Handler(
    {ModuleName}DbContext dbContext,
    ILogger<Activate{Entity}Handler> logger)
    : IActivate{Entity}Handler
{
    public async Task<Result<{Entity}Response>> HandleAsync(Guid id, CancellationToken cancellationToken)
    {
        var entity = await dbContext.{Entities}.FindAsync([id], cancellationToken);
        if (entity is null)
        {
            return Error.NotFound("{ModuleName}.NotFound", "Entity not found");
        }

        // Domain entity owns the state transition logic
        var result = entity.Activate();
        if (result.IsError)
        {
            return result.Errors;
        }

        await dbContext.SaveChangesAsync(cancellationToken);
        return new {Entity}Response(entity.Id, entity.Name, entity.Status);
    }
}
```

---

## 9. Unit Test Pattern

Using in-memory EF Core + NSubstitute for mocking cross-module APIs:

```csharp
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Modules.Common.Domain.Events;
using Modules.Common.Domain.Results;
using NSubstitute;

namespace Modules.{ModuleName}.Tests.Unit.Features.Create{Entity};

public class Create{Entity}HandlerTests : IAsyncDisposable
{
    private readonly {ModuleName}DbContext _dbContext;
    private readonly IEventPublisher _eventPublisher;
    private readonly ILogger<Create{Entity}Handler> _logger;
    private readonly Create{Entity}Handler _handler;

    public Create{Entity}HandlerTests()
    {
        var options = new DbContextOptionsBuilder<{ModuleName}DbContext>()
            .UseInMemoryDatabase(databaseName: $"{ModuleName}Db_{Guid.NewGuid()}")
            .Options;

        _dbContext = new {ModuleName}DbContext(options);
        _eventPublisher = Substitute.For<IEventPublisher>();
        _logger = Substitute.For<ILoggerFactory>().CreateLogger<Create{Entity}Handler>();

        _handler = new Create{Entity}Handler(_dbContext, _eventPublisher, _logger);
    }

    public async ValueTask DisposeAsync()
    {
        await _dbContext.DisposeAsync();
    }

    [Fact]
    public async Task Should_Create{Entity}_WhenRequestIsValid()
    {
        // Arrange
        var request = new Create{Entity}Request("Test Name");

        // Act
        var result = await _handler.HandleAsync(request, CancellationToken.None);

        // Assert
        Assert.True(result.IsSuccess);
        var entity = await _dbContext.{Entities}.FirstOrDefaultAsync();
        Assert.NotNull(entity);
        Assert.Equal("Test Name", entity.Name);
        await _eventPublisher.Received(1)
            .PublishAsync(Arg.Any<{Entity}CreatedEvent>(), Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task Should_ReturnError_WhenAlreadyExists()
    {
        // Arrange — seed existing entity
        _dbContext.{Entities}.Add({Entity}.Create("Existing"));
        await _dbContext.SaveChangesAsync();

        var request = new Create{Entity}Request("Existing");

        // Act
        var result = await _handler.HandleAsync(request, CancellationToken.None);

        // Assert
        Assert.False(result.IsSuccess);
        Assert.Contains(result.Errors, e => e.Code == "{ModuleName}.AlreadyExists");
    }
}
```

**Key patterns**:
- `IAsyncDisposable` for cleanup
- Unique DB name per test class (`Guid.NewGuid()`)
- `NSubstitute`: `Substitute.For<T>()`, `Arg.Any<T>()`, `.Received(1)`
- Arrange-Act-Assert structure

---

## 10. Integration Test Pattern

Full HTTP tests using `WebApplicationFactory` + Testcontainers + Respawn:

### Test Factory

```csharp
using System.Data.Common;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using ModularMonolith.Host;
using Npgsql;
using Respawn;
using Testcontainers.PostgreSql;

namespace Modules.{ModuleName}.Tests.Integration.Configuration;

public class CustomWebApplicationFactory : WebApplicationFactory<IApiMarker>, IAsyncLifetime
{
    private readonly PostgreSqlContainer _dbContainer = new PostgreSqlBuilder("postgres:latest")
        .WithDatabase("test")
        .WithUsername("admin")
        .WithPassword("admin")
        .Build();

    private DbConnection _dbConnection = null!;
    private Respawner _respawner = null!;
    public HttpClient HttpClient { get; private set; } = null!;

    public async Task InitializeAsync()
    {
        await _dbContainer.StartAsync();
        _dbConnection = new NpgsqlConnection(_dbContainer.GetConnectionString());
        HttpClient = CreateClient();
        await _dbConnection.OpenAsync();
        _respawner = await Respawner.CreateAsync(_dbConnection, new RespawnerOptions
        {
            SchemasToInclude = ["{schema_name}"],
            DbAdapter = DbAdapter.Postgres
        });
    }

    public new async Task DisposeAsync()
    {
        await _dbContainer.DisposeAsync();
        await _dbConnection.DisposeAsync();
    }

    public async Task ResetDatabaseAsync() => await _respawner.ResetAsync(_dbConnection);

    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        builder.UseSetting("ConnectionStrings:Postgres", _dbContainer.GetConnectionString());
    }
}
```

### Test Class

```csharp
using System.Net;
using System.Net.Http.Json;

namespace Modules.{ModuleName}.Tests.Integration.Tests.Create{Entity};

[Collection("{ModuleName}Tests")]
public class Create{Entity}Tests(CustomWebApplicationFactory webFactory)
    : BaseTest(webFactory), IAsyncLifetime
{
    public Task InitializeAsync() => Task.CompletedTask;
    public async Task DisposeAsync() => await WebFactory.ResetDatabaseAsync();

    [Fact]
    public async Task Create{Entity}_ShouldSucceed_WhenRequestIsValid()
    {
        // Arrange
        var request = new { Name = "Test Item" };

        // Act
        var httpResponse = await WebFactory.HttpClient.PostAsJsonAsync("/api/{route}", request);
        var response = await httpResponse.Content.ReadFromJsonAsync<{Entity}Response>();

        // Assert
        Assert.Equal(HttpStatusCode.OK, httpResponse.StatusCode);
        Assert.NotNull(response);
        Assert.Equal("Test Item", response.Name);
    }

    [Fact]
    public async Task Create{Entity}_ShouldReturnBadRequest_WhenNameIsEmpty()
    {
        // Arrange
        var request = new { Name = "" };

        // Act
        var httpResponse = await WebFactory.HttpClient.PostAsJsonAsync("/api/{route}", request);

        // Assert
        Assert.Equal(HttpStatusCode.BadRequest, httpResponse.StatusCode);
    }
}
```

**Key patterns**:
- Real PostgreSQL via Testcontainers
- `Respawn` resets DB between tests (not recreated)
- `IAsyncLifetime.DisposeAsync` calls `ResetDatabaseAsync`
- `[Collection]` shares the factory across test classes
- `IApiMarker` from host project for `WebApplicationFactory<T>`

---

## 11. Architecture Tests

Enforce module isolation at compile time using `NetArchTest.Rules`:

### ModuleAssemblies Helper

```csharp
using System.Reflection;

namespace Modules.Common.Tests.Architecture;

internal static class ModuleAssemblies
{
    internal static readonly Assembly {ModuleName}DomainAssembly = {ModuleName}.Domain.AssemblyReference.Assembly;
    internal static readonly Assembly {ModuleName}FeaturesAssembly = {ModuleName}.Features.AssemblyReference.Assembly;
    internal static readonly Assembly {ModuleName}InfrastructureAssembly = {ModuleName}.Infrastructure.AssemblyReference.Assembly;
    internal static readonly Assembly {ModuleName}PublicApiAssembly = {ModuleName}.PublicApi.AssemblyReference.Assembly;
}
```

### Module Isolation Test

```csharp
using NetArchTest.Rules;

[Fact]
public void {ModuleName}Module_ShouldNotHaveDependencyOn_AnyOtherModule()
{
    var result = Types.InAssemblies(Get{ModuleName}ModuleAssemblies())
        .Should()
        .NotHaveDependencyOnAny(
            "Modules.Users",
            "Modules.OtherModule")
        .GetResult();

    Assert.True(result.IsSuccessful,
        string.Join(", ", result.FailingTypeNames ?? []));
}

// If module depends on another via PublicApi only:
[Fact]
public void {CallerModule}_ShouldOnlyReference_PublicApiProjects()
{
    var assemblies = Get{CallerModule}ModuleAssemblies();

    var internalResult = Types.InAssemblies(assemblies)
        .Should()
        .NotHaveDependencyOnAny(
            "Modules.{TargetModule}.Domain",
            "Modules.{TargetModule}.Infrastructure",
            "Modules.{TargetModule}.Features")
        .GetResult();

    Assert.True(internalResult.IsSuccessful,
        $"Should not reference internal {TargetModule} projects");
}
```

---

## 12. Frontend: Detail Page with Fetch-by-ID

```tsx
import { useEffect } from "react";
import { useParams, useNavigate } from "react-router";
import { use{ModuleName}Store } from "@/stores/{moduleName}.store";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Loader2 } from "lucide-react";

export function {Entity}DetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { selected, loading, error, fetchById } = use{ModuleName}Store();

  useEffect(() => {
    if (id) void fetchById(id);
  }, [id, fetchById]);

  if (loading && !selected) {
    return (
      <div className="flex items-center gap-2 text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" />
        Loading...
      </div>
    );
  }

  if (error) return <p className="text-destructive">{error}</p>;
  if (!selected) return <p className="text-muted-foreground">Not found</p>;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => void navigate(-1)}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-2xl font-bold">{selected.name}</h1>
      </div>

      <Card>
        <CardHeader><CardTitle>Details</CardTitle></CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div><span className="font-medium">ID:</span> {selected.id}</div>
          <div><span className="font-medium">Name:</span> {selected.name}</div>
          {/* More fields */}
        </CardContent>
      </Card>
    </div>
  );
}
```

---

## 13. Frontend: State Machine UI (Status-Dependent Actions)

```tsx
import type { {Entity}Status } from "@/schemas/{moduleName}.schemas";

// Allowed transitions per status
const allowedActions: Record<{Entity}Status, string[]> = {
  Draft: ["activate"],
  Active: ["complete", "archive"],
  Completed: ["archive"],
  Archived: [],
  Cancelled: [],
};

// In component:
const actions = allowedActions[selected.status] ?? [];

{actions.map((action) => (
  <Button
    key={action}
    variant={action === "archive" ? "destructive" : "outline"}
    size="sm"
    disabled={loading}
    onClick={() => void performAction(action, selected.id)}
  >
    {action}
  </Button>
))}
```

---

## 14. Frontend: Dynamic Form Field Arrays

Using `useFieldArray` for adding/removing repeating form sections:

```tsx
import { useForm, useFieldArray } from "react-hook-form";
import { Plus, Trash2 } from "lucide-react";

const form = useForm<FormValues>({
  resolver: zodResolver(schema),
  defaultValues: {
    items: [{ name: "", quantity: 1 }],
  },
});

const { fields, append, remove } = useFieldArray({
  control: form.control,
  name: "items",
});

// In JSX:
<Button type="button" onClick={() => append({ name: "", quantity: 1 })}>
  <Plus className="mr-1 h-4 w-4" /> Add Item
</Button>

{fields.map((field, index) => (
  <div key={field.id} className="flex items-end gap-2">
    <FormField
      control={form.control}
      name={`items.${index}.name`}
      render={({ field: f }) => (
        <FormItem className="flex-1">
          <FormControl><Input {...f} /></FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
    {fields.length > 1 && (
      <Button type="button" variant="ghost" onClick={() => remove(index)}>
        <Trash2 className="h-4 w-4 text-destructive" />
      </Button>
    )}
  </div>
))}
```

---

## 15. Frontend: Store with performAction + Post-Action Refresh

```typescript
performAction: async (action, id) => {
  set({ loading: true, error: null });
  try {
    const actionFns: Record<string, (id: string) => Promise<void>> = {
      activate: api.activate,
      complete: api.complete,
      archive: api.archive,
    };
    const fn = actionFns[action];
    if (fn) await fn(id);

    // Refresh entity state after action
    const entity = await api.getById(id);
    set((s) => ({
      loading: false,
      selected: entity,
      items: s.items.map((item) => (item.id === id ? entity : item)),
    }));
  } catch {
    set({ loading: false, error: `Failed to ${action}` });
  }
},
```

**Key pattern**: After performing a state-change action, re-fetch the entity to get server-updated state.

---

## 16. Frontend: Create Form Page (Separate Route)

```tsx
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router";

export function Create{Entity}Page() {
  const navigate = useNavigate();
  const { create{Entity}, loading } = use{ModuleName}Store();

  const form = useForm<Create{Entity}FormValues>({
    resolver: zodResolver(create{Entity}Schema),
    defaultValues: { name: "", description: "" },
  });

  async function onSubmit(values: Create{Entity}FormValues) {
    try {
      const entity = await create{Entity}(values);
      void navigate(`/{moduleName}/${entity.id}`);  // Navigate to detail page
    } catch {
      // error handled in store
    }
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => void navigate(-1)}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-2xl font-bold">Create {Entity}</h1>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {/* FormField components */}
          <Button type="submit" disabled={loading}>
            {loading ? "Creating..." : "Create"}
          </Button>
        </form>
      </Form>
    </div>
  );
}
```

**Key pattern**: Separate page (not dialog) for complex creation forms. Navigates to detail page on success.
