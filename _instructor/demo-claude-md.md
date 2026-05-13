# Demo Script — CLAUDE.md Before/After
## "Add ArchiveShipment to the Shipments module"

**When:** Part A, 0:09–0:32  
**Purpose:** Prove that CLAUDE.md is not optional. Same task, same prompt, two completely different outcomes.

---

## The Demo Prompt

Use this exact prompt both times — do not change it:

```
Add a new feature called ArchiveShipment to the Shipments module.
It should archive a shipment by its shipment number.
```

Run it once with the **weak CLAUDE.md** (starting state). Then build CLAUDE.md together with the room. Run it again with the **full CLAUDE.md**. Let the difference speak.

---

## Round 1 — With the Weak CLAUDE.md (Starting State)

The weak CLAUDE.md tells Claude: "this is a .NET 10 modular monolith with React and Angular."  
That is all. Claude will guess the rest — and guess wrong.

### What Claude gets wrong

**Wrong folder** — Claude does not know the vertical-slice pattern. It will likely create:
```
Modules/Shipments/Modules.Shipments.Features/ArchiveShipment.cs
```
instead of:
```
Modules/Shipments/Modules.Shipments.Features/Features/ArchiveShipment/ArchiveShipment.Endpoint.cs
Modules/Shipments/Modules.Shipments.Features/Features/ArchiveShipment/ArchiveShipment.Handler.cs
```

**Wrong handler interface** — Claude does not know the `IHandler` marker interface pattern. It will likely write a plain method or a MediatR-style handler:
```csharp
// What Claude guesses
public class ArchiveShipmentHandler
{
    public async Task<IResult> HandleAsync(...) { }
}
```
instead of:
```csharp
// What the codebase actually requires
internal interface IArchiveShipmentHandler : IHandler
{
    Task<Result<Success>> HandleAsync(string shipmentNumber, CancellationToken cancellationToken);
}
internal sealed class ArchiveShipmentHandler(...) : IArchiveShipmentHandler { }
```

**Wrong return type** — Claude does not know the `Result<T>` pattern. It will return `IResult` or `bool` or throw exceptions instead of returning `Result<Success>` and calling `.ToProblem()`.

**Wrong namespace** — Claude will guess something like:
```csharp
namespace Shipments.Features;
```
instead of:
```csharp
namespace Modules.Shipments.Features.Features.ArchiveShipment;
```

**Wrong endpoint registration** — Claude does not know `IApiEndpoint`. It will likely use a controller or a minimal API lambda instead of:
```csharp
public class ArchiveShipmentEndpoint : IApiEndpoint
{
    public void MapEndpoint(WebApplication app) { ... }
}
```

**No error handling** — Claude does not know `ShipmentErrors` or the `Error.NotFound(...)` pattern. It will throw or return null.

### What to say to the room

> "Claude did its best. It's not stupid — it built something that looks like .NET code. But it guessed every convention in this codebase and got most of them wrong. This code would not compile. And even if it did, it violates the architecture. The architecture tests would fail."

> "The problem is not the model. The problem is that Claude had no project context. It was flying blind."

---

## Build CLAUDE.md Together (0:16–0:33)

Facilitator drives. Attendees mirror on their own laptops.

Show `templates/prompts/new-feature.prompt.md` — this is how the team used to hold this knowledge. A long prompt file, pasted manually every time. Read the first 20 lines aloud.

> "This is prompt engineering. Someone on this team wrote this. Every developer pastes it before every feature. It works — but it's manual, it's per-person, and it lives outside the repo."

> "We're going to move this knowledge into CLAUDE.md. One time. After that, Claude reads it on every call, automatically."

Migrate these facts into CLAUDE.md together:
1. Vertical-slice folder structure — one folder per feature, `Endpoint.cs` + `Handler.cs`
2. Namespace pattern — `Modules.<X>.Features.Features.<FeatureName>`
3. Handler interface pattern — `internal interface I<Name>Handler : IHandler`
4. Return type — always `Result<T>`, never throw
5. Endpoint pattern — `IApiEndpoint`, `MapEndpoint(WebApplication app)`
6. Error pattern — `Error.NotFound(...)`, `.ToProblem()` in the endpoint
7. `ShipmentsDbContext` — injected via primary constructor
8. Frontend — React uses `bun`, not `npm`

At the end, replace the working `CLAUDE.md` with `_instructor/CLAUDE.full.md` (the complete version).  
Commit it: `git add CLAUDE.md && git commit -m "add project context"`

---

## Round 2 — With the Full CLAUDE.md

Same prompt. Run it again.

### What Claude gets right

**Correct folder:**
```
Modules/Shipments/Modules.Shipments.Features/Features/ArchiveShipment/
  ArchiveShipment.Endpoint.cs
  ArchiveShipment.Handler.cs
```

**Correct handler:**
```csharp
namespace Modules.Shipments.Features.Features.ArchiveShipment;

internal interface IArchiveShipmentHandler : IHandler
{
    Task<Result<Success>> HandleAsync(string shipmentNumber, CancellationToken cancellationToken);
}

internal sealed class ArchiveShipmentHandler(
    ShipmentsDbContext context,
    ILogger<ArchiveShipmentHandler> logger)
    : IArchiveShipmentHandler
{
    public async Task<Result<Success>> HandleAsync(string shipmentNumber, CancellationToken cancellationToken)
    {
        var shipment = await context.Shipments
            .Where(x => x.Number == shipmentNumber)
            .FirstOrDefaultAsync(cancellationToken: cancellationToken);

        if (shipment is null)
        {
            logger.LogDebug("Shipment with number {ShipmentNumber} not found", shipmentNumber);
            return Error.NotFound("Shipment.NotFound", $"Shipment with number '{shipmentNumber}' not found");
        }

        shipment.Archive();

        await context.SaveChangesAsync(cancellationToken);

        logger.LogInformation("Shipment {ShipmentNumber} was archived", shipmentNumber);
        return Result.Success;
    }
}
```

**Correct endpoint:**
```csharp
namespace Modules.Shipments.Features.Features.ArchiveShipment;

public class ArchiveShipmentEndpoint : IApiEndpoint
{
    public void MapEndpoint(WebApplication app)
    {
        app.MapPost("/api/shipments/{shipmentNumber}/archive", Handle)
           .RequireAuthorization();
    }

    private static async Task<IResult> Handle(
        [FromRoute] string shipmentNumber,
        IArchiveShipmentHandler handler,
        CancellationToken cancellationToken)
    {
        var response = await handler.HandleAsync(shipmentNumber, cancellationToken);
        if (response.IsError)
        {
            return response.Errors.ToProblem();
        }

        return Results.NoContent();
    }
}
```

### What to say to the room

> "Same prompt. Same model. Completely different output. Claude did not get smarter — we gave it context. That is the shift. From prompt engineering to context engineering."

> "You wrote CLAUDE.md once. Every developer on your team, every session, every feature — gets this baseline automatically. You stop repeating yourself."

---

## Facilitator Notes

- Do **not** fix Claude's mistakes in Round 1. Let the wrong output sit on screen. The room needs to see the failure clearly.
- If Claude partially gets it right in Round 1 (unlikely but possible), point out what is still wrong — the namespace, the interface, the return type. Something will be off.
- The `Archive()` method does not exist on the `Shipment` entity yet — that is fine for the demo. Claude will generate the call; the point is about structure and patterns, not whether it compiles end-to-end.
- Keep Round 2 fast. The room already understands the point. Show the output, name what changed, move on.
